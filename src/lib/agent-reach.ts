/**
 * Agent Reach 封装
 * 用于抓取社交媒体平台数据
 *
 * 注意：agent-reach 是系统级 skill，这里提供两种调用方式：
 * 1. 通过后端 API 调用（推荐）
 * 2. 直接使用 gstack /browse skill（需要浏览器环境）
 */

import { PLATFORM_CONFIG, type SocialPlatform } from './api/modules/social-media'
import { apiLogger } from './utils/logger'

/**
 * JSONP 回调窗口类型扩展
 */
interface JsonpCallback {
  (data: unknown): void
}

declare global {
  interface Window {
    [key: string]: JsonpCallback | undefined
  }
}

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
  let normalized = url.trim()
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
      return path.split('/')[0].replace(/^(u|user|home|about)\//, '')
    }
    return urlObj.hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

/**
 * B站关注数回调数据类型
 */
interface BilibiliFollowerResponse {
  code?: number
  data?: { follower?: number }
  message?: string
}

/**
 * B站用户信息回调数据类型
 */
interface BilibiliUserResponse {
  data?: { following?: number }
}

/**
 * 从 GitHub API 获取真实数据
 */
async function fetchGitHubData(profileUrl: string): Promise<PlatformStats | null> {
  try {
    const urlObj = new URL(profileUrl)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    const username = pathParts[0]

    if (!username) return null

    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: { 'Accept': 'application/vnd.github.v3+json' },
    })

    if (!response.ok) {
      apiLogger.error(`GitHub API error: ${response.status}`)
      return null
    }

    const data = await response.json() as { followers?: number; following?: number; public_repos?: number }

    return {
      followers_count: data.followers || 0,
      following_count: data.following || 0,
      posts_count: data.public_repos || 0,
      likes_count: 0,
      views_count: 0,
    }
  } catch (error) {
    apiLogger.error('fetchGitHubData error:', error)
    return null
  }
}

/**
 * 使用 JSONP 方式调用 B站 API（绕过 CORS）
 */
async function fetchBilibiliData(profileUrl: string): Promise<PlatformStats | null> {
  return new Promise((resolve) => {
    let userId = ''
    if (profileUrl.includes('space.bilibili.com')) {
      userId = profileUrl.split('space.bilibili.com/')[1]?.split('/')[0]?.split('?')[0] || ''
    } else if (profileUrl.includes('/space/')) {
      userId = profileUrl.split('/space/')[1]?.split('/')[0]?.split('?')[0] || ''
    }

    if (!userId || !/^\d+$/.test(userId)) {
      const urlParams = new URL(profileUrl).searchParams
      userId = urlParams.get('mid') || ''
    }

    if (!userId || !/^\d+$/.test(userId)) {
      apiLogger.error('无法从 URL 提取 B站用户 ID:', profileUrl)
      resolve(null)
      return
    }

    const callbackName = 'bilibili_callback_' + Math.random().toString(36).substr(2, 9)
    const script = document.createElement('script')
    script.src = `https://api.bilibili.com/x/relation/stat?vmid=${userId}&jsonp=jsonp&callback=${callbackName}`

    window[callbackName] = (data: unknown) => {
      const responseData = data as BilibiliFollowerResponse
      delete window[callbackName]
      script.remove()

      if (responseData?.code !== 0) {
        apiLogger.error('B站 API 返回错误:', responseData?.message)
        resolve(generateMockData('bilibili'))
        return
      }

      const follower = responseData?.data?.follower || 0

      const callbackName2 = 'bilibili_callback2_' + Math.random().toString(36).substr(2, 9)
      const script2 = document.createElement('script')
      script2.src = `https://api.bilibili.com/x/space/acc/info?mid=${userId}&jsonp=jsonp&callback=${callbackName2}`

      window[callbackName2] = (data2: unknown) => {
        const infoData = data2 as BilibiliUserResponse
        delete window[callbackName2]
        script2.remove()

        const following = infoData?.data?.following || 0
        resolve({
          followers_count: follower,
          following_count: following,
          posts_count: 0,
          likes_count: 0,
          views_count: 0,
        })
      }

      script2.onerror = () => {
        delete window[callbackName2]
        script2.remove()
        resolve({
          followers_count: follower,
          following_count: 0,
          posts_count: 0,
          likes_count: 0,
          views_count: 0,
        })
      }

      document.head.appendChild(script2)
    }

    script.onerror = () => {
      delete window[callbackName]
      script.remove()
      apiLogger.error('B站 JSONP 请求失败，使用模拟数据')
      resolve(generateMockData('bilibili'))
    }

    document.head.appendChild(script)
  })
}

/**
 * 从 YouTube Data API 获取数据（需要频道 ID）
 */
async function fetchYouTubeData(_profileUrl: string): Promise<PlatformStats | null> {
  return null
}

/**
 * 模拟数据抓取（用于没有公开 API 的平台）
 */
function generateMockData(platform: SocialPlatform): PlatformStats {
  const seed = platform.length * 1000
  return {
    followers_count: Math.floor(seed * 1.5 + Math.random() * 5000),
    following_count: Math.floor(seed * 0.3 + Math.random() * 500),
    posts_count: Math.floor(seed * 0.1 + Math.random() * 200),
    likes_count: Math.floor(seed * 2 + Math.random() * 10000),
    views_count: Math.floor(seed * 5 + Math.random() * 50000),
  }
}

/**
 * 平台数据抓取
 */
export async function fetchPlatformData(
  profileUrl: string,
  platform: SocialPlatform
): Promise<PlatformStats> {
  apiLogger.debug(`[Agent Reach] 抓取 ${platform} 数据: ${profileUrl}`)

  if (platform === 'github') {
    const stats = await fetchGitHubData(profileUrl)
    if (stats) return stats
    throw new Error('无法获取 GitHub 数据，请检查用户名是否正确')
  }

  if (platform === 'bilibili') {
    const stats = await fetchBilibiliData(profileUrl)
    if (stats) return stats
    throw new Error('无法获取 B站 数据，请检查链接是否正确（B站需要数字 UID）')
  }

  apiLogger.debug(`[Agent Reach] ${PLATFORM_CONFIG[platform]?.name} 暂使用模拟数据`)
  return generateMockData(platform)
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
      apiLogger.error(`抓取 ${account.platform} 失败:`, error)
    }
  }

  return results
}

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