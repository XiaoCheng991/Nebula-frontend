"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { getUserProfile, getLocalUserInfo, setupTokenRefresh, refreshTokenApi, startTokenRefreshTimer } from '@/lib/api'
import { initTokenManager, isAuthenticated } from '@/lib/auth/dual-token-manager'
import { useRouter } from 'next/navigation'

interface UserProfile {
  username: string
  displayName: string
  avatarUrl: string | null
  bio: string
}

interface UserContextType {
  user: UserProfile | null
  loading: boolean
  error: string | null
  refreshUser: () => Promise<void>
  updateUser: (updates: Partial<UserProfile>) => void
  clearUser: () => void
}

const UserContext = createContext<UserContextType | undefined>(undefined)

// 最大 loading 时间（毫秒），超时后自动结束 loading
const MAX_LOADING_TIME = 3000

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const hasLocalDataRef = useRef(false)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // 清除 loading 超时定时器
  const clearLoadingTimeout = useCallback(() => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current)
      loadingTimeoutRef.current = null
    }
  }, [])

  // 设置 loading 超时保护
  const setLoadingWithTimeout = useCallback((isLoading: boolean) => {
    if (isLoading) {
      setLoading(true)
      // 设置超时保护，防止一直 loading
      loadingTimeoutRef.current = setTimeout(() => {
        setLoading(false)
      }, MAX_LOADING_TIME)
    } else {
      clearLoadingTimeout()
      setLoading(false)
    }
  }, [clearLoadingTimeout])

  // 初始化 Token Manager 和 Token 刷新函数
  useEffect(() => {
    initTokenManager()

    setupTokenRefresh(async (refreshToken: string) => {
      return refreshTokenApi(refreshToken)
    })

    const cleanupTimer = startTokenRefreshTimer(30 * 1000)

    return () => {
      cleanupTimer()
      clearLoadingTimeout()
    }
  }, [clearLoadingTimeout])

  // 处理未认证跳转 - 直接使用 router，不形成循环依赖
  const handleUnauthenticated = () => {
    setUser(null)
    setLoading(false)
    hasLocalDataRef.current = false
    // 如果在受保护页面，跳转到登录页
    const protectedPaths = ['/dashboard', '/chat', '/drive', '/settings', '/admin']
    const currentPath = window.location.pathname
    if (protectedPaths.some(path => currentPath.startsWith(path))) {
      router.push('/login')
    }
  }

  // 从服务器获取最新的用户信息
  const refreshUser = useCallback(async (silent: boolean = false) => {
    try {
      if (!hasLocalDataRef.current && !silent) {
        setLoadingWithTimeout(true)
      }
      setError(null)

      if (!isAuthenticated()) {
        setUser(null)
        setLoading(false)
        hasLocalDataRef.current = false
        return
      }

      const data = await getUserProfile()
      setUser({
        username: data.username,
        displayName: data.displayName,
        avatarUrl: data.avatar,
        bio: data.bio || '',
      })

      const localUser = getLocalUserInfo()
      if (localUser) {
        const updatedUser = {
          ...localUser,
          nickname: data.displayName,
          avatar: data.avatar,
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUser))
      }
    } catch (err: any) {
      setError(err.message)

      // 如果是认证错误，清除状态
      if (err.message?.includes('401') || err.message?.includes('未登录') || err.message?.includes('认证')) {
        setUser(null)
        setLoading(false)
        hasLocalDataRef.current = false
      }
    } finally {
      setLoading(false)
    }
  }, [setLoadingWithTimeout])

  // 更新用户信息（本地更新，不调用接口）
  const updateUser = useCallback((updates: Partial<UserProfile>) => {
    setUser(prev => {
      if (!prev) return null
      const updated = { ...prev, ...updates }

      const localUser = getLocalUserInfo()
      if (localUser) {
        const updatedLocalUser = {
          ...localUser,
          nickname: updates.displayName || localUser.nickname,
          avatar: updates.avatarUrl || localUser.avatar,
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedLocalUser))
      }

      return updated
    })
  }, [])

  // 清除用户信息
  const clearUser = useCallback(() => {
    setUser(null)
    setError(null)
    hasLocalDataRef.current = false
  }, [])

  // 初始化：从 localStorage 读取，然后从服务器获取最新数据
  useEffect(() => {
    const initUser = async () => {
      const localUser = getLocalUserInfo()

      // 如果没有本地用户数据，直接结束 loading
      if (!localUser) {
        setLoading(false)
        return
      }

      // 有本地数据，先显示本地数据
      hasLocalDataRef.current = true
      setUser({
        username: localUser.username,
        displayName: localUser.nickname || '',
        avatarUrl: localUser.avatar || null,
        bio: '',
      })
      setLoading(false)

      // 然后静默验证 token 是否有效
      try {
        if (!isAuthenticated()) {
          handleUnauthenticated()
          return
        }
        // 验证 token 有效性
        await getUserProfile()
      } catch (err: any) {
        // token 失效，清除状态并跳转
        handleUnauthenticated()
      }
    }

    initUser()
  }, [])

  // 监听认证变化事件（登录/退出）
  useEffect(() => {
    const handleAuthChange = () => {
      const localUser = getLocalUserInfo()
      if (localUser) {
        hasLocalDataRef.current = true
        setUser({
          username: localUser.username,
          displayName: localUser.nickname || '',
          avatarUrl: localUser.avatar || null,
          bio: '',
        })
        setLoading(false)
        refreshUser(true)
      } else {
        clearUser()
        setLoading(false)
      }
    }

    window.addEventListener('auth-change', handleAuthChange)
    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
    }
  }, [refreshUser, clearUser])

  return (
    <UserContext.Provider value={{ user, loading, error, refreshUser: () => refreshUser(), updateUser, clearUser }}>
      {children}
    </UserContext.Provider>
  )
}

// Hook for using user context
export function useUser() {
  const context = useContext(UserContext)
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}
