"use client"

import React, { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getLocalUserInfo } from '@/lib/api/adapters/auth-adapter'
import { useRouter } from 'next/navigation'

interface UserProfile {
  username: string
  nickname: string
  avatarUrl: string | null
  avatarName?: string | null
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

  // 仅做卸载清理
  useEffect(() => {
    return () => {
      clearLoadingTimeout()
    }
  }, [clearLoadingTimeout])

  // 处理未认证跳转
  const handleUnauthenticated = useCallback(() => {
    setUser(null)
    setLoading(false)
    hasLocalDataRef.current = false
    // 如果在受保护页面，跳转到登录页
    const protectedPaths = ['/dashboard', '/chat', '/drive', '/settings', '/admin']
    const currentPath = window.location.pathname
    if (protectedPaths.some(path => currentPath.startsWith(path))) {
      router.push('/login')
    }
  }, [router])

  // 从 Supabase 获取最新的用户信息
  const refreshUser = useCallback(async (silent: boolean = false) => {
    try {
      if (!hasLocalDataRef.current && !silent) {
        setLoadingWithTimeout(true)
      }
      setError(null)

      // 获取当前会话
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        setUser(null)
        setLoading(false)
        hasLocalDataRef.current = false
        return
      }

      const { user: supabaseUser } = session

      // 从 user_metadata 构建用户信息
      const userProfile: UserProfile = {
        username: supabaseUser.user_metadata?.login ||
                  supabaseUser.user_metadata?.username ||
                  supabaseUser.email?.split('@')[0] ||
                  '',
        nickname: supabaseUser.user_metadata?.name ||
                  supabaseUser.user_metadata?.nickname ||
                  supabaseUser.user_metadata?.login ||
                  '',
        avatarUrl: supabaseUser.user_metadata?.avatar_url || null,
        bio: supabaseUser.user_metadata?.bio || '',
      }

      setUser(userProfile)

      // 更新 localStorage
      localStorage.setItem('userInfo', JSON.stringify({
        id: supabaseUser.id,
        username: userProfile.username,
        nickname: userProfile.nickname,
        avatarUrl: userProfile.avatarUrl,
      }))
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
          nickname: updates.nickname || localUser.nickname,
          avatarUrl: updates.avatarUrl || localUser.avatarUrl,
          avatarName: updates.avatarName !== undefined ? updates.avatarName : localUser.avatarName,
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

  // 初始化：从 localStorage 读取，然后从 Supabase 获取最新数据
  useEffect(() => {
    const initUser = async () => {
      const localUser = getLocalUserInfo()

      // 如果没有本地用户数据，检查 Supabase 会话
      if (!localUser) {
        const { data: { session } } = await supabase.auth.getSession()
        if (session) {
          await refreshUser(true)
        } else {
          setLoading(false)
        }
        return
      }

      // 有本地数据，先显示本地数据
      hasLocalDataRef.current = true
      setUser({
        username: localUser.username,
        nickname: localUser.nickname || '',
        avatarUrl: localUser.avatarUrl || null,
        bio: '',
      })
      setLoading(false)

      // 然后静默验证 session 是否有效
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        handleUnauthenticated()
        return
      }

      // 刷新用户信息
      await refreshUser(true)
    }

    initUser()
  }, [refreshUser, handleUnauthenticated])

  // 监听认证变化事件（登录/退出）
  useEffect(() => {
    const handleAuthChange = () => {
      const localUser = getLocalUserInfo()
      if (localUser) {
        hasLocalDataRef.current = true
        setUser({
          username: localUser.username,
          nickname: localUser.nickname || '',
          avatarUrl: localUser.avatarUrl || null,
          bio: '',
        })
        setLoading(false)
        refreshUser(true)
      } else {
        // 检查 Supabase 会话
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            refreshUser(true)
          } else {
            clearUser()
            setLoading(false)
          }
        })
      }
    }

    // 同时监听 Supabase 的认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase auth event:', event)
      if (event === 'SIGNED_IN' && session) {
        refreshUser(true)
      } else if (event === 'SIGNED_OUT') {
        clearUser()
        setLoading(false)
      }
    })

    window.addEventListener('auth-change', handleAuthChange)

    return () => {
      window.removeEventListener('auth-change', handleAuthChange)
      subscription.unsubscribe()
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
