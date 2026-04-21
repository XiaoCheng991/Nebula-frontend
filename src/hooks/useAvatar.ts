/**
 * 统一的头像获取 Hook
 * 优先级：
 * 1. 当前登录用户的最新头像（useUser context）
 * 2. 数据库中的用户头像 (sys_users.avatar_url)
 * 3. 默认像素风头像
 */

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { apiLogger } from '@/lib/utils/logger'

export interface UseAvatarOptions {
  userId?: number
  username?: string
  nickname?: string
  directAvatarUrl?: string | null
}

export interface UseAvatarReturn {
  avatarUrl: string | null
  displayNickname: string
  isDefaultAvatar: boolean
  loading: boolean
}

export function useAvatar(options: UseAvatarOptions): UseAvatarReturn {
  const { userId, username, nickname, directAvatarUrl } = options

  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!userId) {
      apiLogger.debug('[useAvatar] 没有 userId，不查询数据库')
      setDbAvatarUrl(null)
      return
    }

    apiLogger.debug('[useAvatar] 开始查询 userId', { userId })

    let mounted = true
    setLoading(true)

    supabase
      .from('sys_users')
      .select('avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        apiLogger.debug('[useAvatar] 查询结果', { userId, data, error })
        if (mounted) {
          if (error) {
            apiLogger.debug('[useAvatar] 查询出错', { message: error.message })
            setDbAvatarUrl(null)
          } else {
            apiLogger.debug('[useAvatar] 获取到头像', { avatar: data?.avatar_url })
            setDbAvatarUrl(data?.avatar_url || null)
          }
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [userId])

  const avatarUrl = (() => {
    apiLogger.debug('[useAvatar] 计算头像', { directAvatarUrl, dbAvatarUrl, userId })

    if (directAvatarUrl) {
      return directAvatarUrl
    }

    if (dbAvatarUrl) {
      apiLogger.debug('[useAvatar] 使用数据库头像', { avatar: dbAvatarUrl })
      return dbAvatarUrl
    }

    apiLogger.debug('[useAvatar] 无头像，返回 null')
    return null
  })()

  const displayNickname = nickname || username || '用户'
  const isDefaultAvatar = !avatarUrl

  return {
    avatarUrl,
    displayNickname,
    isDefaultAvatar,
    loading,
  }
}

export function getDefaultAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,d4e4ff,c0aede`
}