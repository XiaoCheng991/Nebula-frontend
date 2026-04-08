/**
 * Agent Reach 封装
 * 用于抓取社交媒体平台数据
 *
 * 注意：agent-reach 是系统级 skill，这里提供两种调用方式：
 * 1. 通过后端 API 调用（推荐）
 * 2. 直接使用 gstack /browse skill（需要浏览器环境）
 */

import type { SocialPlatform } from './api/modules/social-media'

export interface PlatformStats {
  followers_count: number
  following_count: number
  posts_count: number
  likes_count: number
  views_count: number
}

/**
 * 平台 URL 验证和标准化
 */
export function normalizeProfileUrl(platform: SocialPlatform, url: string): string {
  // 去除多余空格
  let normalized = url.trim()

  // 确保包含协议
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'https://' + normalized
  }

  return normalized
}

/**
 * 验证 URL 是否属于指定平台
 */
export function validatePlatformUrl(platform: SocialPlatform, url: string): boolean {
  const platformDomains: Record<SocialPlatform, string[]> = {
    bilibili: ['bilibili.com', 'bilibili.tv'],
    xiaohongshu: ['xiaohongshu.com', 'xhscn.com'],
    douyin: ['douyin.com', 'amemv.com'],
    weibo: ['weibo.com', 'm.weibo.cn'],
    youtube: ['youtube.com', 'youtu.be'],
    twitter: ['twitter.com', 'x.com'],
    github: ['github.com'],
    juejin: ['juejin.cn', 'juejin.com'],
    csdn: ['csdn.net'],
    other: [],
  }

  const domains = platformDomains[platform]
  if (!domains || domains.length === 0) return true

  return domains.some(domain => url.includes(domain))
}

/**
 * 从 URL 提取用户名（用于展示）
 */
export function extractUsernameFromUrl(url: string, platform: SocialPlatform): string {
  try {
    const urlObj = new URL(url)
    const path = urlObj.pathname.replace(/^\/+|\/+$/g, '')

    if (path) {
      // 去除常见的后缀
      return path.split('/')[0].replace(/^(u|user|home|about)\//, '')
    }

    // 对于没有路径的域名，返回域名
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * 模拟数据抓取（待 agent-reach 集成）
 * TODO: 集成 agent-reach skill 实现真正的自动抓取
 *
 * 当前返回模拟数据，用于开发测试
 * 实际使用时需要替换为真实的 agent-reach 调用
 */
export async function fetchPlatformData(
  profileUrl: string,
  platform: SocialPlatform
): Promise<PlatformStats> {
  // TODO: 这里应该调用 agent-reach skill
  // 由于 agent-reach 是系统 skill，需要通过后端 API 或 MCP 工具调用

  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 500))

  // 返回模拟数据（开发测试用）
  // 实际实现中应该替换为真实的数据抓取
  console.log(`[Agent Reach] 抓取 ${platform} 数据: ${profileUrl}`)

  // 这里返回模拟数据，后续需要集成 agent-reach
  return {
    followers_count: Math.floor(Math.random() * 10000),
    following_count: Math.floor(Math.random() * 500),
    posts_count: Math.floor(Math.random() * 500),
    likes_count: Math.floor(Math.random() * 50000),
    views_count: Math.floor(Math.random() * 100000),
  }
}

/**
 * 批量抓取多个平台数据
 */
export async function fetchMultiplePlatforms(
  accounts: { platform: SocialPlatform; url: string }[]
): Promise<Map<string, PlatformStats>> {
  const results = new Map<string, PlatformStats>()

  for (const account of accounts) {
    try {
      const stats = await fetchPlatformData(account.url, account.platform)
      results.set(account.platform, stats)
    } catch (error) {
      console.error(`抓取 ${account.platform} 失败:`, error)
    }
  }

  return results
}

// 平台对应的 agent-reach 配置
export const PLATFORM_AGENT_CONFIG: Record<SocialPlatform, { enable: boolean; note?: string }> = {
  bilibili: { enable: true },
  xiaohongshu: { enable: true },
  douyin: { enable: true },
  weibo: { enable: true },
  youtube: { enable: true },
  twitter: { enable: true },
  github: { enable: true, note: 'GitHub API 可直接获取' },
  juejin: { enable: false, note: '暂不支持' },
  csdn: { enable: false, note: '暂不支持' },
  other: { enable: false, note: '手动输入' },
}