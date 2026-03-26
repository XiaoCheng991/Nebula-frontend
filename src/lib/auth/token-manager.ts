/**
 * 认证状态管理模块（Sa-Token Cookie Session 模式）
 *
 * 说明：
 * - Sa-Token token 由后端通过 Cookie 下发与校验
 * - 前端不再保存 access/refresh token，也不再负责刷新
 * - 这里仅维护一个"会话存在"的本地提示位，配合 user-info 接口做最终校验
 */

import { apiLogger } from '@/lib/utils/logger'

const TOKEN_KEY = 'satoken'

function isBrowser(): boolean {
 return typeof window !== 'undefined'
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
 * 标记为已认证状态
 * 用于兼容旧代码，实际上认证状态通过 Cookie 中的 token 判断
 */
export function markAuthenticated(): void {
 if (!isBrowser()) return
 // Cookie Session 模式下，token 由后端设置在 Cookie 中
 // 这里只需要触发认证变更事件即可
 window.dispatchEvent(new Event('auth-change'))
}

/**
 * 设置 Token（兼容旧调用）
 * Cookie Session 模式下，token 由后端通过 HttpOnly Cookie 管理
 * 此函数仅用于记录状态和触发认证事件
 */
export function setTokens(tokens: TokenPair): void {
 if (!isBrowser()) return
 // Cookie Session 模式下，token 由后端通过 HttpOnly Cookie 管理
 // 这里仅记录登录状态
 apiLogger.auth('login')
 window.dispatchEvent(new Event('auth-change'))
}

/**
 * 检查是否已经登录
 *
 * - 直接检查 Cookie 中的 token，不需要额外的 localStorage 状态位
 * - Cookie 是浏览器原生机制，配合 httpOnly 属性更安全
 * - 消除 XSS 伪造认证状态的风险
 */
export function isAuthenticated(): boolean {
 if (!isBrowser()) return false

 const cookies = document.cookie.split(';').map(c => c.trim())
 return cookies.some(c => c.startsWith(`${TOKEN_KEY}=`))
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
 if (!isBrowser()) return null

 const cookies = document.cookie.split(';').map(c => c.trim())
 const tokenCookie = cookies.find(c => c.startsWith(`${TOKEN_KEY}=`))

 if (!tokenCookie) return null

 return decodeURIComponent(tokenCookie.substring(TOKEN_KEY.length + 1))
}

/**
 * 清除 Token（仅清除 Cookie，localStorage 不再使用）
 */
export function clearTokens(): void {
 if (!isBrowser()) return

 // 清除 Cookie 中的 token
 document.cookie = `${TOKEN_KEY}=; path=/; max-age=0`

 apiLogger.auth('logout')
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
