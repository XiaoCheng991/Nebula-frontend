/**
 * 核心 HTTP 客户端（Sa-Token Cookie Session 模式）
 *
 * 特性：
 * - 所有请求默认携带 Cookie（credentials: include）
 * - 不再在前端注入/刷新 Bearer Token
 * - 统一登录过期处理
 */

import {
  ApiResponse,
  RequestConfig,
  ApiError,
  RequestMetadata,
} from './types'
import {
  clearTokens,
} from '@/lib/auth/token-manager'
import { apiLogger } from '@/lib/utils/logger'
import { handleApiError } from '@/lib/utils/error-handler'

/**
 * API 基础 URL
 */
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'

/**
 * 登录过期的错误消息列表
 */
const LOGIN_EXPIRED_MESSAGES = [
  '登录已过期',
  '登录已过期，请重新登录',
  'token已过期',
  'token无效',
  '未登录',
  '认证失败',
  '请先登录',
]

/**
 * 检查错误消息是否表示登录过期
 */
function isLoginExpiredMessage(message: string): boolean {
  return LOGIN_EXPIRED_MESSAGES.some(msg => message.includes(msg))
}

/**
 * 清除认证信息并跳转到登录页
 */
function handleAuthExpired(): void {
  console.warn('[Auth] 检测到登录过期，开始清理认证信息...')

  // 清除本地存储
  clearTokens()

  if (typeof window !== 'undefined') {
    localStorage.removeItem('userInfo')
    window.dispatchEvent(new Event('auth-change'))
  }

  console.warn('[Auth] 认证信息已清理，即将跳转到登录页')

  // 跳转到登录页
  if (typeof window !== 'undefined') {
    window.location.href = '/login'
  }
}

/**
 * 兼容旧调用：Cookie Session 模式无需前端刷新 Token
 */
export function setupTokenRefresh(_refreshFn: (refreshToken: string) => Promise<{ accessToken: string; refreshToken: string; expiresIn: number }>) {
  // no-op
}

/**
 * 请求拦截器类型
 */
export type RequestInterceptor = (config: RequestConfig) => RequestConfig | Promise<RequestConfig>

/**
 * 响应拦截器类型
 */
export type ResponseInterceptor = (response: Response) => Response | Promise<Response>

/**
 * 注册的拦截器
 */
const requestInterceptors: RequestInterceptor[] = []
const responseInterceptors: ResponseInterceptor[] = []

/**
 * 添加请求拦截器
 */
export function addRequestInterceptor(interceptor: RequestInterceptor) {
  requestInterceptors.push(interceptor)
}

/**
 * 添加响应拦截器
 */
export function addResponseInterceptor(interceptor: ResponseInterceptor) {
  responseInterceptors.push(interceptor)
}

/**
 * 应用请求拦截器
 */
async function applyRequestInterceptors(config: RequestConfig): Promise<RequestConfig> {
  let result = config
  for (const interceptor of requestInterceptors) {
    result = await interceptor(result)
  }
  return result
}

/**
 * 应用响应拦截器
 */
async function applyResponseInterceptors(response: Response): Promise<Response> {
  let result = response
  for (const interceptor of responseInterceptors) {
    result = await interceptor(result)
  }
  return result
}

/**
 * 创建带超时的 fetch
 */
function fetchWithTimeout(url: string, options: RequestInit, timeout = 30000): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  return fetch(url, {
    ...options,
    signal: controller.signal,
  }).finally(() => {
    clearTimeout(timeoutId)
  })
}

/**
 * 核心 HTTP 请求方法
 */
async function request<T>(
  endpoint: string,
  options: RequestConfig = {}
): Promise<T> {
  const startTime = Date.now()
  const url = `${API_BASE_URL}${endpoint}`

  // 准备请求配置
  let config: RequestConfig = {
    ...options,
    credentials: options.credentials || 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  }

  // 应用请求拦截器
  config = await applyRequestInterceptors(config)

  // 记录请求开始
  apiLogger.requestStart(url, config.method || 'GET', config)

  try {
    let response = await fetchWithTimeout(
      url,
      config,
      config.timeout || 30000
    )

    // 应用响应拦截器
    response = await applyResponseInterceptors(response)

    // 处理 401 未授权错误
    if (response.status === 401 && !config.skipAuth) {
      handleAuthExpired()
      throw new ApiError('登录已过期，请重新登录', 401)
    }

    // 检查 HTTP 状态码
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({
        message: `HTTP error! status: ${response.status}`,
      }))

      const metadata: RequestMetadata = {
        url,
        method: config.method || 'GET',
        timestamp: startTime,
        duration: Date.now() - startTime,
        success: false,
        statusCode: response.status,
        errorMessage: errorData.message,
      }

      apiLogger.requestError(metadata)

      const errorMessage = errorData.message || `HTTP error! status: ${response.status}`

      // 检查是否是登录过期相关的错误
      if (isLoginExpiredMessage(errorMessage)) {
        handleAuthExpired()
      }

      throw new ApiError(errorMessage, response.status)
    }

    // 解析响应
    const result = await response.json()

    const metadata: RequestMetadata = {
      url,
      method: config.method || 'GET',
      timestamp: startTime,
      duration: Date.now() - startTime,
      success: true,
      statusCode: response.status,
    }

    apiLogger.requestSuccess(metadata)

    // 检查业务状态码
    if (result.code !== 200) {
      // 优先使用后端返回的错误消息
      const errorMessage = result.message || `请求失败 (code: ${result.code})`

      // 关键：检查是否是登录过期的业务错误
      if (isLoginExpiredMessage(errorMessage)) {
        handleAuthExpired()
      }

      // 抛出 ApiError，确保错误消息能被上层捕获
      const error = new ApiError(errorMessage, result.code)
      console.error('[API] 业务错误:', errorMessage, 'code:', result.code)
      throw error
    }

    return result
  } catch (error) {
    if (error instanceof ApiError) {
      if (!options.skipErrorHandler) {
        handleApiError(error, { url, method: config.method || 'GET' })
      }
      throw error
    }

    // 网络错误或其他错误
    const metadata: RequestMetadata = {
      url,
      method: config.method || 'GET',
      timestamp: startTime,
      duration: Date.now() - startTime,
      success: false,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
    }

    apiLogger.requestError(metadata)

    if (!options.skipErrorHandler) {
      handleApiError(error, { url, method: config.method || 'GET' })
    }

    throw error
  }
}

/**
 * GET 请求
 */
export function get<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  return request<T>(endpoint, {
    ...config,
    method: 'GET',
  })
}

/**
 * POST 请求
 */
export function post<T>(
  endpoint: string,
  data?: any,
  config: RequestConfig = {}
): Promise<T> {
  return request<T>(endpoint, {
    ...config,
    method: 'POST',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * PUT 请求
 */
export function put<T>(
  endpoint: string,
  data?: any,
  config: RequestConfig = {}
): Promise<T> {
  return request<T>(endpoint, {
    ...config,
    method: 'PUT',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * DELETE 请求
 */
export function del<T>(endpoint: string, config: RequestConfig = {}): Promise<T> {
  return request<T>(endpoint, {
    ...config,
    method: 'DELETE',
  })
}

/**
 * PATCH 请求
 */
export function patch<T>(
  endpoint: string,
  data?: any,
  config: RequestConfig = {}
): Promise<T> {
  return request<T>(endpoint, {
    ...config,
    method: 'PATCH',
    body: data ? JSON.stringify(data) : undefined,
  })
}

/**
 * 文件上传
 */
export async function uploadFile(
  endpoint: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<{ url: string; fileName: string }> {
  const startTime = Date.now()
  const url = `${API_BASE_URL}${endpoint}`

  const uploadWithSession = async (): Promise<Response> => {
    const formData = new FormData()
    formData.append('file', file)

    return fetch(url, {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })
  }

  if (typeof onProgress === 'function') {
    onProgress(0)
  }

  const response = await uploadWithSession()

  // 检查 HTTP 状态码
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({
      message: `HTTP error! status: ${response.status}`,
    }))

    const metadata: RequestMetadata = {
      url,
      method: 'POST',
      timestamp: startTime,
      duration: Date.now() - startTime,
      success: false,
      statusCode: response.status,
      errorMessage: errorData.message,
    }

    apiLogger.requestError(metadata)

    const errorMessage = errorData.message || `HTTP error! status: ${response.status}`

    // 检查是否是登录过期
    if (isLoginExpiredMessage(errorMessage)) {
      handleAuthExpired()
    }

    throw new ApiError(errorMessage, response.status)
  }

  if (typeof onProgress === 'function') {
    onProgress(100)
  }

  const result = await response.json()

  const metadata: RequestMetadata = {
    url,
    method: 'POST',
    timestamp: startTime,
    duration: Date.now() - startTime,
    success: true,
    statusCode: response.status,
  }

  apiLogger.requestSuccess(metadata)

  // 检查业务状态码
  if (result.code !== 200) {
    const errorMessage = result.message || '上传失败'

    // 检查是否是登录过期
    if (isLoginExpiredMessage(errorMessage)) {
      handleAuthExpired()
    }

    throw new ApiError(errorMessage, result.code)
  }

  // 返回文件 URL 和文件名
  return {
    url: result.data.fileUrl,
    fileName: result.data.fileName,
  }
}
