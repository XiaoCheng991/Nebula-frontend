/**
 * 认证状态管理模块（Sa-Token Cookie Session 模式）
 *
 * 说明：
 * - Sa-Token token 由后端通过 Cookie 下发与校验
 * - 前端不再保存 access/refresh token，也不再负责刷新
 * - 这里仅维护一个“会话存在”的本地提示位，配合 user-info 接口做最终校验
 */

import { apiLogger } from '@/lib/utils/logger'

const TOKEN_KEY = 'satoken'
const AUTH_STATE_KEY = 'auth_session_active'

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function setSessionState(isActive: boolean): void {
  if (!isBrowser()) return

  if (isActive) {
    localStorage.setItem(AUTH_STATE_KEY, '1')
  } else {
    localStorage.removeItem(AUTH_STATE_KEY)
  }
}

/**
 * 初始化认证管理器（兼容旧调用）
 */
export function initTokenManager(): void {
  // Cookie Session 模式无需额外初始化
}

/**
 * 获取 Access Token（兼容旧调用）
 *
 * 注意：若后端设置 HttpOnly，该值在浏览器端不可读，会返回 null。
 */
export function getAccessToken(): string | null {
  if (!isBrowser() || typeof document === 'undefined') return null

  const cookies = document.cookie.split(';').map(c => c.trim())
  const tokenCookie = cookies.find(c => c.startsWith(`${TOKEN_KEY}=`))

  if (!tokenCookie) return null

  return decodeURIComponent(tokenCookie.substring(TOKEN_KEY.length + 1))
}

/**
 * 保存 Token 对（兼容旧调用）
 *
 * Sa-Token 场景下，token 应由后端 Set-Cookie 管理。
 * 这里仅更新本地会话提示状态。
 */
export function setTokens(_tokens: { accessToken: string; refreshToken: string; expiresIn?: number }): void {
  setSessionState(true)

  apiLogger.auth('login', { session: 'cookie' })
}

export function markAuthenticated(): void {
  setSessionState(true)
}

/**
 * 清除 Token
 */
export function clearTokens(): void {
  if (!isBrowser()) return

  localStorage.removeItem(TOKEN_KEY)
  localStorage.removeItem(AUTH_STATE_KEY)
  document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`

  apiLogger.auth('logout')
}

/**
 * 检查是否已登录
 */
export function isAuthenticated(): boolean {
  if (!isBrowser()) return false
  return localStorage.getItem(AUTH_STATE_KEY) === '1'
}

/**
 * SSR 环境下从 Cookie 获取 Token
 */
export function getTokenFromCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null

  const cookies = cookieHeader.split(';').map(c => c.trim())
  const tokenCookie = cookies.find(c => c.startsWith(`${TOKEN_KEY}=`))

  if (!tokenCookie) return null

  return tokenCookie.substring(TOKEN_KEY.length + 1)
}
