/**
 * 认证状态管理模块（Supabase 模式）
 */

import { supabase } from '@/lib/supabase/client'

/**
 * 检查是否已经登录（Supabase 模式）
 */
export async function isAuthenticated(): Promise<boolean> {
  if (typeof window === 'undefined') return false

  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * 检查是否已经登录（Supabase 模式）- 同步版本用于中间件/守卫
 */
export function isAuthenticatedSync(): boolean {
  if (typeof window === 'undefined') return false

  const userInfo = localStorage.getItem('userInfo')
  if (userInfo) {
    try {
      const parsed = JSON.parse(userInfo)
      return !!parsed && (parsed.id || parsed.username)
    } catch {
      return false
    }
  }
  return false
}

// 为了兼容旧代码的同步调用（AuthGuard 使用）
export const isUserLoggedIn = isAuthenticatedSync

/**
 * 标记为已认证状态
 */
export function markAuthenticated(): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('auth-change'))
}

/**
 * Token 数据结构
 */
export interface TokenPair {
  accessToken: string
  refreshToken: string
  expiresIn: number
}

/**
 * 设置 Token（兼容旧调用）
 */
export function setTokens(tokens: TokenPair): void {
  if (typeof window === 'undefined') return
  window.dispatchEvent(new Event('auth-change'))
}

/**
 * 获取 Access Token（Supabase 模式）
 */
export async function getAccessToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null

  const { data: { session } } = await supabase.auth.getSession()
  return session?.access_token || null
}

/**
 * 初始化认证管理器（兼容旧调用）
 */
export function initTokenManager(): void {
  // Supabase 模式无需额外初始化
}

/**
 * 清除 Token
 */
export function clearTokens(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('userInfo')
}

/**
 * SSR 环境下从 Cookie 获取 Token
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  // Supabase cookie 格式: sb-[project-ref]-auth-token
  const cookies = cookieHeader.split(';').map(c => c.trim())
  const tokenCookie = cookies.find(c =>
    c.startsWith('sb-') && c.includes('auth-token')
  )

  if (!tokenCookie) return null

  return tokenCookie.split('=')[1] || null
}
