/**
 * 统一的头像获取 Hook
 * 优先级：
 * 1. 当前登录用户的最新头像（useUser context）
 * 2. 数据库中的用户头像 (sys_users.avatar_url)
 * 3. 默认像素风头像
 */

import { useState, useEffect } from 'react'
import { useUser } from '@/lib/user-context'
import { supabase } from '@/lib/supabase/client'

export interface UseAvatarOptions {
  /** 用户 ID，用于查询数据库头像 */
  userId?: number
  /** 用户名，用于生成默认头像 seed */
  username?: string
  /** 昵称，用于显示文字 */
  nickname?: string
  /** 直接传入的头像 URL（最高优先级） */
  directAvatarUrl?: string | null
}

export interface UseAvatarReturn {
  /** 最终使用的头像 URL */
  avatarUrl: string | null
  /** 用于显示的昵称 */
  displayNickname: string
  /** 是否使用默认头像（像素风） */
  isDefaultAvatar: boolean
  /** 是否正在加载 */
  loading: boolean
}

/**
 * 获取用户头像
 *
 * @example
 * // 基本用法
 * const { avatarUrl, displayNickname, loading } = useAvatar({ userId: 5, username: 'test' })
 *
 * // 用于博客作者
 * const { avatarUrl } = useAvatar({
 *   userId: article.author_id,
 *   username: article.author_name
 * })
 *
 * // 用于动态作者
 * const { avatarUrl, displayNickname } = useAvatar({
 *   userId: memo.user_id,
 *   username: memo.sys_users?.username,
 *   nickname: memo.sys_users?.nickname
 * })
 */
export function useAvatar(options: UseAvatarOptions): UseAvatarReturn {
  const { userId, username, nickname, directAvatarUrl } = options
  const { user: currentUser } = useUser()

  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 从数据库查询用户头像
  useEffect(() => {
    if (!userId) {
      setDbAvatarUrl(null)
      return
    }

    let mounted = true
    setLoading(true)

    supabase
      .from('sys_users')
      .select('avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        if (mounted) {
          if (error) {
            setDbAvatarUrl(null)
          } else {
            setDbAvatarUrl(data?.avatar_url || null)
          }
          setLoading(false)
        }
      })

    return () => {
      mounted = false
    }
  }, [userId])

  // 计算最终头像 URL
  const avatarUrl = (() => {
    // 1. 优先使用直接传入的头像 URL
    if (directAvatarUrl) {
      return directAvatarUrl
    }

    // 2. 如果是当前登录用户，使用 useUser 中的最新头像
    const isCurrentUser = currentUser?.username &&
      username &&
      currentUser.username.toLowerCase() === username.toLowerCase()

    if (isCurrentUser && currentUser?.avatarUrl) {
      return currentUser.avatarUrl
    }

    // 3. 使用数据库中的头像
    if (dbAvatarUrl) {
      return dbAvatarUrl
    }

    // 4. 没有头像时返回 null
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

/**
 * 生成默认头像 URL（ DiceBear 像素风）
 * 用于当没有自定义头像时
 */
export function getDefaultAvatarUrl(seed: string): string {
  return `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(seed)}&backgroundColor=c0aede,d4e4ff,c0aede`
}