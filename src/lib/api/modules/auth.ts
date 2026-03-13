/**
 * 认证相关 API（Sa-Token Cookie Session 模式）
 */

import { get, post } from '../client'
import type { ApiResponse } from '../types'
import {
  markAuthenticated,
  clearTokens,
  isAuthenticated,
} from '@/lib/auth/token-manager'

/**
 * 登录请求
 */
export interface LoginRequest {
  account: string
  password: string
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  username: string
  email: string
  password: string
  nickname?: string
}

/**
 * 登录响应
 */
export interface LoginResponse {
  token: string
  refreshToken: string
  expiresIn: number // Access Token 过期时间（秒）
  userInfo: {
    id: number
    username: string
    email: string
    nickname: string
    avatar: string | null
  }
}

function normalizeLoginResponsePayload(rawData: any): LoginResponse | null {
  if (!rawData || typeof rawData !== 'object') {
    return null
  }

  // 兼容两种后端结构：
  // 1) Result<LoginResponse>
  // 2) Result<SaResult>，真实数据在 data.data
  const candidate = rawData.userInfo ? rawData : rawData.data

  if (!candidate || typeof candidate !== 'object' || !candidate.userInfo) {
    return null
  }

  return {
    token: candidate.token || '',
    refreshToken: candidate.refreshToken || '',
    expiresIn: Number(candidate.expiresIn || 0),
    userInfo: candidate.userInfo,
  }
}

/**
 * 用户登录
 */
export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await post<ApiResponse<LoginResponse>>('/api/auth/login', data)
  const normalizedData = normalizeLoginResponsePayload(response.data)

  if (response.code === 200 && normalizedData) {
    const { userInfo } = normalizedData

    // 标记本地会话状态；真实 token 由后端 Cookie 管理
    markAuthenticated()

    // 保存用户信息
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    }

    // 触发自定义事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'))
    }

    return normalizedData
  }

  throw new Error(response.message || '登录失败')
}

/**
 * 用户注册
 */
export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const response = await post<ApiResponse<LoginResponse>>('/api/auth/register', data)
  const normalizedData = normalizeLoginResponsePayload(response.data)

  if (response.code === 200 && normalizedData) {
    const { userInfo } = normalizedData

    // 标记本地会话状态；真实 token 由后端 Cookie 管理
    markAuthenticated()

    // 保存用户信息
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
    }

    // 触发自定义事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'))
    }

    return normalizedData
  }

  throw new Error(response.message || '注册失败')
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  try {
    await post('/api/auth/logout', {})
  } finally {
    // 清除本地存储
    clearTokens()

    if (typeof window !== 'undefined') {
      localStorage.removeItem('userInfo')
    }

    // 触发自定义事件
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new Event('auth-change'))
    }
  }
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(): Promise<LoginResponse['userInfo']> {
  const response = await get<ApiResponse<LoginResponse['userInfo']>>('/api/auth/user-info')

  if (response.code === 200 && response.data) {
    // 更新本地存储
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(response.data))
    }

    return response.data
  }

  throw new Error(response.message || '获取用户信息失败')
}

/**
 * 获取本地存储的用户信息
 */
export function getLocalUserInfo(): LoginResponse['userInfo'] | null {
  if (typeof window === 'undefined') return null

  const userInfoStr = localStorage.getItem('userInfo')
  if (userInfoStr) {
    try {
      return JSON.parse(userInfoStr)
    } catch {
      return null
    }
  }
  return null
}

/**
 * 检查是否已登录
 */
export { isAuthenticated }
