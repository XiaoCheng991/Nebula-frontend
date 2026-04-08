/**
 * 统一的头像获取 Hook
 * 优先级：
 * 1. 当前登录用户的最新头像（useUser context）
 * 2. 数据库中的用户头像 (sys_users.avatar_url)
 * 3. 默认像素风头像
 */

import { useState, useEffect } from 'react'
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

  const [dbAvatarUrl, setDbAvatarUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // 从数据库查询用户头像
  useEffect(() => {
    if (!userId) {
      console.log('[useAvatar] 没有 userId，不查询数据库')
      setDbAvatarUrl(null)
      return
    }

    console.log('[useAvatar] 开始查询 userId:', userId)

    let mounted = true
    setLoading(true)

    supabase
      .from('sys_users')
      .select('avatar_url')
      .eq('id', userId)
      .single()
      .then(({ data, error }) => {
        console.log('[useAvatar] 查询结果:', { userId, data, error })
        if (mounted) {
          if (error) {
            console.log('[useAvatar] 查询出错:', error.message)
            setDbAvatarUrl(null)
          } else {
            console.log('[useAvatar] 获取到头像:', data?.avatar_url)
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
  // 这里只展示文章/动态作者的头像，不需要判断当前用户
  const avatarUrl = (() => {
    console.log('[useAvatar] 计算头像:', { directAvatarUrl, dbAvatarUrl, userId })

    // 1. 优先使用直接传入的头像 URL
    if (directAvatarUrl) {
      return directAvatarUrl
    }

    // 2. 使用数据库中查询到的作者头像（通过 userId 查询）
    if (dbAvatarUrl) {
      console.log('[useAvatar] 使用数据库头像:', dbAvatarUrl)
      return dbAvatarUrl
    }

    // 3. 没有头像时返回 null
    console.log('[useAvatar] 无头像，返回 null')
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