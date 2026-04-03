/**
 * 统一错误处理
 */

/**
 * 从错误中提取用户友好的消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  if (typeof error === 'string') return error
  return '发生未知错误，请稍后重试'
}

/**
 * 处理认证错误：清除本地状态并跳转登录页
 */
export function handleAuthExpired(): void {
  if (typeof window === 'undefined') return
  localStorage.removeItem('userInfo')
  window.dispatchEvent(new Event('auth-change'))
  window.location.href = '/login'
}

/**
 * 处理 API 错误
 */
export function handleApiError(error: unknown, _context?: { url?: string; method?: string; silent?: boolean }): never {
  const errorMessage = getErrorMessage(error)
  console.error('[API Error]', errorMessage, error)
  throw error
}

/**
 * 判断是否为网络错误
 */
export function isNetworkError(error: unknown): boolean {
  return error instanceof TypeError && error.message.includes('fetch')
}

/**
 * 判断是否为认证错误
 */
export function isAuthError(error: unknown): boolean {
  return error instanceof Error && (error.message.includes('401') || error.message.includes('403') || error.message.includes('未登录') || error.message.includes('认证'))
}
