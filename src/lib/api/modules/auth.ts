/**
 * 认证相关 API（Supabase 模式）
 */

import {
  login as supabaseLogin,
  register as supabaseRegister,
  logout as supabaseLogout,
  getUserInfo as supabaseGetUserInfo,
  getLocalUserInfo as supabaseGetLocalUserInfo,
  isAuthenticated as supabaseIsAuthenticated,
} from '@/lib/api/adapters'

export type {
  LoginResponse,
} from '@/lib/api/adapters'

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
 * 用户登录
 */
export async function login(data: LoginRequest) {
  return await supabaseLogin(data.account, data.password)
}

/**
 * 用户注册
 */
export async function register(data: RegisterRequest) {
  return await supabaseRegister(data.username, data.email, data.password, data.nickname)
}

/**
 * 用户登出
 */
export async function logout(): Promise<void> {
  await supabaseLogout()
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo() {
  return await supabaseGetUserInfo()
}

/**
 * 获取本地存储的用户信息
 */
export function getLocalUserInfo() {
  return supabaseGetLocalUserInfo()
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = supabaseIsAuthenticated
