/**
 * 认证适配器
 *
 * 统一 Java Backend 和 Supabase 的认证接口
 */

import { isJavaBackendMode, isSupabaseMode } from '@/lib/api/mode-config'
import {
 login as javaLogin,
 register as javaRegister,
 logout as javaLogout,
 getUserInfo as javaGetUserInfo,
 isAuthenticated as javaIsAuthenticated,
} from '@/lib/api/modules/auth'
import { supabase } from '@/lib/supabase/client'

/**
 * 登录响应类型
 */
export interface LoginResponse {
 token?: string
 refreshToken?: string
 expiresIn?: number
 userInfo: {
  id: number | string
  username: string
  email?: string | null
  nickname?: string | null
  avatar?: string | null
 }
}

/**
 * 登录
 */
export async function login(
 email: string,
 password: string
): Promise<LoginResponse> {
 if (isJavaBackendMode()) {
  return javaLogin({ account: email, password })
 } else {
  // Supabase 模式
  const { data, error } = await supabase.auth.signInWithPassword({
   email,
   password,
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('登录失败')

  return await buildLoginResponse(data.user)
 }
}

/**
 * 构建登录响应
 */
async function buildLoginResponse(user: any): Promise<LoginResponse> {
 // 从 sys_users 获取用户信息（通过 email 匹配）
 let userInfoData: any = null
 if (user.email) {
  try {
   const { data: userData } = await supabase
    .from('sys_users')
    .select('*')
    .eq('email', user.email)
    .single()
   userInfoData = userData
  } catch {
   // 用户可能还没有在 sys_users 中创建记录
  }
 }

 // 保存用户信息到 localStorage
 const userInfo = {
  id: userInfoData?.id || user.id,
  username: userInfoData?.username || user.email || '',
  email: user.email,
  nickname: userInfoData?.nickname || user.user_metadata?.nickname || '',
  avatar: userInfoData?.avatar_url || user.user_metadata?.avatar || null,
 }

 if (typeof window !== 'undefined') {
  localStorage.setItem('userInfo', JSON.stringify(userInfo))
  window.dispatchEvent(new Event('auth-change'))
 }

 const session = await supabase.auth.getSession()

 return {
  token: session.data.session?.access_token,
  expiresIn: session.data.session?.expires_at
   ? Number(session.data.session.expires_at) - Math.floor(Date.now() / 1000)
   : 0,
  userInfo,
 }
}

/**
 * GitHub 登录
 */
export async function loginWithGithub(): Promise<void> {
 if (!isSupabaseMode()) {
  throw new Error('当前不是 Supabase 模式')
 }

 // 确定重定向 URL
 const redirectTo = typeof window !== 'undefined'
  ? `${window.location.origin}/auth/github/callback`
  : 'https://www.xiaocheng991.site/auth/v1/callback'

 // 打开 GitHub 授权页面
 await supabase.auth.signInWithOAuth({
  provider: 'github',
  options: {
   redirectTo,
  },
 })
}

/**
 * 注册
 */
export async function register(
 username: string,
 email: string,
 password: string,
 nickname?: string
): Promise<LoginResponse> {
 if (isJavaBackendMode()) {
  return javaRegister({ username, email, password, nickname })
 } else {
  // Supabase 模式
  const { data, error } = await supabase.auth.signUp({
   email,
   password,
   options: {
    data: {
     nickname,
     username,
    },
   },
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('注册失败')

  return await buildLoginResponse(data.user)
 }
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
 if (isJavaBackendMode()) {
  await javaLogout()
 } else {
  await supabase.auth.signOut()
 }

 // 清除本地用户信息
 if (typeof window !== 'undefined') {
  localStorage.removeItem('userInfo')
  window.dispatchEvent(new Event('auth-change'))
 }
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(): Promise<LoginResponse['userInfo']> {
 if (isJavaBackendMode()) {
  return javaGetUserInfo()
 } else {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) throw new Error('未登录')

  // 从 sys_users 获取用户信息
  let userInfoData: any = null
  if (user.email) {
   try {
    const { data: userData } = await supabase
     .from('sys_users')
     .select('*')
     .eq('email', user.email)
     .single()
    userInfoData = userData
   } catch {
    // 用户可能还没有在 sys_users 中创建记录
   }
  }

  return {
   id: userInfoData?.id || user.id,
   username: userInfoData?.username || user.email || '',
   email: user.email,
   nickname: userInfoData?.nickname || user.user_metadata?.nickname || '',
   avatar: userInfoData?.avatar_url || user.user_metadata?.avatar || null,
  }
 }
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
export async function isAuthenticated(): Promise<boolean> {
 if (isJavaBackendMode()) {
  return javaIsAuthenticated()
 } else {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
 }
}

/**
 * 触发自定义认证变更事件
 */
export function emitAuthChange(): void {
 if (typeof window !== 'undefined') {
  window.dispatchEvent(new Event('auth-change'))
 }
}

/**
 * 刷新会话
 */
export async function refreshSession(): Promise<void> {
 if (isSupabaseMode()) {
  await supabase.auth.refreshSession()
 }
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
 return supabase.auth.onAuthStateChange((event, session) => {
  callback(event, session)
 })
}
