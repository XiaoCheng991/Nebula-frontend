/**
 * 认证管理 - Supabase 模式
 */

import { supabase } from '@/lib/supabase/client'

/**
 * 用户信息类型
 */
export interface UserProfile {
  id: number | string
  username: string
  email?: string | null
  nickname?: string | null
  avatarUrl?: string | null
  avatarName?: string | null
  avatarSize?: number | null
}

/**
 * 登录响应
 */
export interface LoginResponse {
  userInfo: UserProfile
}

/**
 * 从 sys_users 表获取用户信息
 */
async function fetchUserFromSys(email: string): Promise<any> {
  const { data } = await supabase
    .from('sys_users')
    .select('*')
    .eq('email', email)
    .maybeSingle()
  return data
}

/**
 * 构建用户信息对象
 */
function buildUserInfo(supabaseUser: any, sysData: any): UserProfile {
  return {
    id: sysData?.id ?? supabaseUser.id,
    username: sysData?.username ?? supabaseUser.user_metadata?.username ?? supabaseUser.email?.split('@')[0] ?? '',
    email: supabaseUser.email,
    nickname: sysData?.nickname ?? supabaseUser.user_metadata?.nickname ?? supabaseUser.user_metadata?.name ?? '',
    avatarUrl: sysData?.avatar_url ?? supabaseUser.user_metadata?.avatar_url ?? supabaseUser.user_metadata?.avatar ?? null,
    avatarName: sysData?.avatar_name ?? supabaseUser.user_metadata?.avatar_name ?? null,
    avatarSize: sysData?.avatar_size ?? supabaseUser.user_metadata?.avatar_size ?? null,
  }
}

/**
 * 登录
 */
export async function login(email: string, password: string): Promise<LoginResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('登录失败')

  const userInfo = await buildUserInfoFromLogin(data.user)
  return { userInfo }
}

async function buildUserInfoFromLogin(user: any): Promise<UserProfile> {
  const { data: sessionData } = await supabase.auth.getSession()
  const sysData = user.email ? await fetchUserFromSys(user.email) : null
  return buildUserInfo(user, sysData)
}

/**
 * 登录并持久化本地状态
 */
export async function loginWithStorage(email: string, password: string): Promise<LoginResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('登录失败')

  const userInfo = await buildUserInfoFromLogin(data.user)
  if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    window.dispatchEvent(new Event('auth-change'))
  }
  return { userInfo }
}

/**
 * GitHub OAuth 登录
 */
export async function loginWithGithub(redirectUrl?: string): Promise<void> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo: redirectUrl || '/',
      scopes: 'read:user user:email',
    },
  })

  if (error) throw new Error(`GitHub 授权初始化失败: ${error.message}`)
  if (data?.url) window.location.href = data.url
}

/**
 * 注册
 */
export async function register(username: string, email: string, password: string, nickname?: string): Promise<LoginResponse> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { nickname, username } },
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('注册失败')

  if (data.session) return buildSignUpResponse(data.user)

  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
    if (signInError || !signInData.user) return buildSignUpResponse(data.user)
    return buildSignUpResponse(signInData.user)
  } catch {
    return buildSignUpResponse(data.user)
  }
}

async function buildSignUpResponse(user: any): Promise<LoginResponse> {
  const sysData = user.email ? await fetchUserFromSys(user.email) : null
  return { userInfo: buildUserInfo(user, sysData) }
}

/**
 * 登出
 */
export async function logout(): Promise<void> {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('userInfo')
    window.dispatchEvent(new Event('auth-change'))
  }
  await supabase.auth.signOut()
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(): Promise<UserProfile> {
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) throw new Error('未登录')

  const sysData = user.email ? await fetchUserFromSys(user.email) : null
  return buildUserInfo(user, sysData)
}

/**
 * 获取本地存储的用户信息
 */
export function getLocalUserInfo(): UserProfile | null {
  if (typeof window === 'undefined') return null
  try {
    const str = localStorage.getItem('userInfo')
    return str ? JSON.parse(str) : null
  } catch {
    return null
  }
}

/**
 * 检查是否已登录
 */
export async function isAuthenticated(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession()
  return !!session
}

/**
 * 触发自定义认证变更事件
 */
export function emitAuthChange(): void {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('auth-change'))
  }
}
