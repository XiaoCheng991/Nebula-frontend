/**
 * 社交媒体数据 API 模块
 */

import { supabase } from '@/lib/supabase/client'
import {
  IconBilibili,
  IconXiaohongshu,
  IconTiktok,
  IconX,
  IconGitHub,
  IconCSDN,
  IconWeibo,
} from '@/components/branding/social-icons'
import type { LucideIcon } from 'lucide-react'
import { Youtube, Link } from 'lucide-react'
import { apiLogger } from "@/lib/utils/logger"

// 平台类型定义
export type SocialPlatform =
  | 'bilibili'
  | 'xiaohongshu'
  | 'douyin'
  | 'weibo'
  | 'youtube'
  | 'twitter'
  | 'github'
  | 'juejin'
  | 'csdn'
  | 'other'

export interface SocialMediaAccount {
  id: number
  user_id: number
  platform: SocialPlatform
  profile_url: string
  display_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface SocialMediaSnapshot {
  id: number
  account_id: number
  followers_count: number
  following_count: number
  posts_count: number
  likes_count: number
  views_count: number
  notes: string | null
  captured_at: string
}

// 指标类型定义
export interface PlatformMetrics {
  label1: string
  label2: string
  label3: string
  label4?: string
}

// 平台配置 - 使用真实的平台图标和指标
export const PLATFORM_CONFIG: Record<SocialPlatform, { name: string; icon: any; color: string; metrics: PlatformMetrics }> = {
  bilibili: {
    name: 'B站',
    icon: IconBilibili,
    color: '#00A1D6',
    metrics: { label1: '粉丝', label2: '获赞', label3: '播放', label4: '关注' }
  },
  xiaohongshu: {
    name: '小红书',
    icon: IconXiaohongshu,
    color: '#FE2C55',
    metrics: { label1: '粉丝', label2: '获赞', label3: '收藏', label4: '关注' }
  },
  douyin: {
    name: '抖音',
    icon: IconTiktok,
    color: '#000000',
    metrics: { label1: '粉丝', label2: '获赞', label3: '播放', label4: '关注' }
  },
  weibo: {
    name: '微博',
    icon: IconWeibo,
    color: '#E6162D',
    metrics: { label1: '粉丝', label2: '微博', label3: '阅读', label4: '关注' }
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: '#FF0000',
    metrics: { label1: '订阅', label2: '观看', label3: '视频' }
  },
  twitter: {
    name: 'X (Twitter)',
    icon: IconX,
    color: '#000000',
    metrics: { label1: '粉丝', label2: '关注', label3: '推文' }
  },
  github: {
    name: 'GitHub',
    icon: IconGitHub,
    color: '#333333',
    metrics: { label1: '粉丝', label2: '关注', label3: '仓库' }
  },
  juejin: {
    name: '掘金',
    icon: Link,
    color: '#007FFF',
    metrics: { label1: '粉丝', label2: '获赞', label3: '收藏' }
  },
  csdn: {
    name: 'CSDN',
    icon: IconCSDN,
    color: '#FC1C13',
    metrics: { label1: '粉丝', label2: '访问', label3: '原创' }
  },
  other: {
    name: '其他',
    icon: Link,
    color: '#666666',
    metrics: { label1: '粉丝', label2: '获赞', label3: '浏览' }
  },
}

/**
 * 获取当前用户的社交媒体账号列表
 */
export async function getUserAccounts(userId: number): Promise<SocialMediaAccount[]> {
  const { data, error } = await ((supabase as any) as any)
    .from('social_media_accounts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    apiLogger.error('获取社交账号失败:', error)
    return []
  }

  return data || []
}

/**
 * 保存社交媒体账号
 */
export async function saveAccount(
  userId: number,
  platform: SocialPlatform,
  profileUrl: string,
  displayName?: string,
  avatarUrl?: string
): Promise<{ data: SocialMediaAccount | null; error: any }> {
  const { data, error } = await ((supabase as any) as any)
    .from('social_media_accounts')
    .upsert(
      {
        user_id: userId,
        platform,
        profile_url: profileUrl,
        display_name: displayName || null,
        avatar_url: avatarUrl || null,
      },
      { onConflict: 'user_id,platform' }
    )
    .select()
    .single()

  return { data, error }
}

/**
 * 删除社交媒体账号
 */
export async function deleteAccount(id: number): Promise<boolean> {
  const { error } = await (supabase as any)
    .from('social_media_accounts')
    .delete()
    .eq('id', id)

  return !error
}

/**
 * 获取账号的历史快照
 */
export async function getSnapshots(
  accountId: number,
  limit: number = 30
): Promise<SocialMediaSnapshot[]> {
  const { data, error } = await (supabase as any)
    .from('social_media_snapshots')
    .select('*')
    .eq('account_id', accountId)
    .order('captured_at', { ascending: false })
    .limit(limit)

  if (error) {
    apiLogger.error('获取快照失败:', error)
    return []
  }

  return data || []
}

/**
 * 保存数据快照
 */
export async function saveSnapshot(
  accountId: number,
  stats: {
    followers_count: number
    following_count: number
    posts_count: number
    likes_count: number
    views_count: number
    notes?: string
  }
): Promise<{ data: SocialMediaSnapshot | null; error: any }> {
  const { data, error } = await (supabase as any)
    .from('social_media_snapshots')
    .insert({
      account_id: accountId,
      ...stats,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 获取所有账号的最新快照
 */
export async function getLatestStats(
  userId: number
): Promise<{ account: SocialMediaAccount; snapshot: SocialMediaSnapshot | null }[]> {
  const accounts = await getUserAccounts(userId)
  if (accounts.length === 0) return []

  const results = await Promise.all(
    accounts.map(async (account) => {
      const { data: snapshot } = await (supabase as any)
        .from('social_media_snapshots')
        .select('*')
        .eq('account_id', account.id)
        .order('captured_at', { ascending: false })
        .limit(1)
        .single()

      return { account, snapshot: snapshot || null }
    })
  )

  return results
}

/**
 * 刷新单个账号的数据（创建新快照）
 */
export async function refreshAccountStats(
  accountId: number,
  newStats: {
    followers_count: number
    following_count: number
    posts_count: number
    likes_count: number
    views_count: number
  }
): Promise<boolean> {
  const { error } = await saveSnapshot(accountId, newStats)
  return !error
}