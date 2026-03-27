/**
 * 服务端认证工具函数（Server Components使用）- Supabase 模式
 */

import { cookies } from 'next/headers'

export interface ServerUserInfo {
  id: string
  username: string
  email: string | null
  nickname: string
  avatarUrl: string | null
}

/**
 * 服务端获取 Supabase Token（从 cookie）
 */
export function getServerToken(): string | null {
  const cookieStore = cookies()
  // Supabase cookie 格式: sb-[project-ref]-auth-token
  const supabaseToken = cookieStore.getAll().find(cookie =>
    cookie.name.startsWith('sb-') && cookie.name.includes('auth-token')
  )?.value || null

  return supabaseToken
}

/**
 * 服务端检查是否已登录
 */
export function isServerAuthenticated(): boolean {
  return !!getServerToken()
}

/**
 * 服务端获取用户信息（从 cookie）
 */
export async function getServerUserInfo(): Promise<ServerUserInfo | null> {
  const token = getServerToken()

  if (!token) {
    return null
  }

  // 从 cookie 中获取用户基本信息
  // 注意：Supabase 模式下，详细的用户信息需要通过客户端获取
  const cookieStore = cookies()

  // 尝试从 userInfo cookie 或 localStorage 备份中读取
  // 服务端只能读取 cookie，无法读取 localStorage
  const userInfoCookie = cookieStore.get('userInfo')?.value

  if (userInfoCookie) {
    try {
      const userInfo = JSON.parse(decodeURIComponent(userInfoCookie))
      return {
        id: userInfo.id || '',
        username: userInfo.username || '',
        email: userInfo.email || null,
        nickname: userInfo.nickname || '',
        avatarUrl: userInfo.avatarUrl || null,
      }
    } catch {
      // 解析失败
    }
  }

  // 如果没有 cookie 数据，只返回空用户信息
  // 实际的用户数据会在客户端通过 Supabase 获取
  return null
}
