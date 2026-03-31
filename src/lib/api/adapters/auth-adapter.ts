/**
 * 认证适配器 - Supabase
 */

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
    avatarUrl?: string | null
    avatarName?: string | null
    avatarSize?: number | null
  }
}

/**
 * 登录
 * 使用最新的 Supabase SDK v2 模式
 */
export async function login(
  email: string,
  password: string
): Promise<LoginResponse> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) throw new Error(error.message)
  if (!data.user) throw new Error('登录失败')

  return await buildLoginResponse(data.user)
}

/**
 * 构建登录响应
 */
async function buildLoginResponse(user: any): Promise<LoginResponse> {
  // 先获取当前 session
  const { data: sessionData } = await supabase.auth.getSession()
  const session = sessionData.session

  let userInfoData: any = null
  if (user.email) {
    const { data: userData } = await supabase
      .from('sys_users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()
    userInfoData = userData
  }

  const userInfo = {
    id: userInfoData?.id || user.id,
    username: userInfoData?.username || user.user_metadata?.username || user.email?.split('@')[0] || '',
    email: user.email,
    nickname: userInfoData?.nickname || user.user_metadata?.nickname || user.user_metadata?.name || '',
    avatarUrl: userInfoData?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.avatar || null,
    avatarName: userInfoData?.avatar_name || user.user_metadata?.avatar_name || null,
    avatarSize: userInfoData?.avatar_size || user.user_metadata?.avatar_size || null,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    // 触发自定义事件通知其他组件
    window.dispatchEvent(new Event('auth-change'))
  }

  return {
    token: session?.access_token,
    expiresIn: session?.expires_at
      ? Number(session.expires_at) - Math.floor(Date.now() / 1000)
      : 0,
    userInfo,
  }
}

/**
 * GitHub 登录
 */
export async function loginWithGithub(): Promise<void> {
  // 重要：回调 URL 必须与 Supabase 配置中的 Site URL 一致
  // 统一使用生产域名，确保本地开发和生产环境都能正常工作
  const isDev = typeof window !== 'undefined' && window.location.hostname === 'localhost'
  const redirectTo = isDev
    ? 'http://localhost:3000/auth/github/callback'
    : 'https://www.xiaocheng991.site/auth/github/callback'

  console.log('Starting GitHub OAuth, redirect to:', redirectTo)

  // supabase-js v2 的 OAuth 调用
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'github',
    options: {
      redirectTo,
      scopes: 'read:user user:email',
      skipBrowserRedirect: false, // 让 Supabase 自动处理跳转
    },
  })

  if (error) {
    console.error('GitHub OAuth init error:', error)
    throw new Error(`GitHub 授权初始化失败: ${error.message}`)
  }

  // 如果 skipBrowserRedirect 为 true，需要手动跳转
  // data.url 是 GitHub OAuth 授权页面 URL
  if (data?.url) {
    console.log('Redirecting to GitHub OAuth URL:', data.url)
    window.location.href = data.url
  }
}

/**
 * 注册
 * 使用最新的 Supabase SDK v2 模式
 */
export async function register(
  username: string,
  email: string,
  password: string,
  nickname?: string
): Promise<LoginResponse> {
  // 先注册
  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        nickname,
        username,
      },
    },
  })

  if (signUpError) throw new Error(signUpError.message)
  if (!signUpData.user) throw new Error('注册失败')

  // 注册后立即登录（如果邮箱不需要验证，会有session）
  if (signUpData.session) {
    return await buildLoginResponse(signUpData.user)
  }

  // 如果没有session（需要邮箱验证），尝试直接登录
  // 注意：有些配置下signUp后不会自动登录
  try {
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      // 如果登录失败（可能需要邮箱验证），返回注册信息
      console.log('Auto-login after register failed:', signInError.message)
      // 仍然构建用户响应，但可能没有token
      return await buildLoginResponse(signUpData.user)
    }

    if (signInData.user) {
      return await buildLoginResponse(signInData.user)
    }
  } catch (e) {
    console.log('Auto-login error:', e)
  }

  return await buildLoginResponse(signUpData.user)
}

/**
 * 登出
 * 使用最新的 Supabase SDK v2 模式
 */
export async function logout(): Promise<void> {
  await supabase.auth.signOut()

  if (typeof window !== 'undefined') {
    localStorage.removeItem('userInfo')
    window.dispatchEvent(new Event('auth-change'))
  }
}

/**
 * 获取当前用户信息
 */
export async function getUserInfo(): Promise<LoginResponse['userInfo']> {
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) throw new Error('未登录')

  let userInfoData: any = null
  if (user.email) {
    const { data: userData } = await supabase
      .from('sys_users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()
    userInfoData = userData
  }

  return {
    id: userInfoData?.id || user.id,
    username: userInfoData?.username || user.email || '',
    email: user.email,
    nickname: userInfoData?.nickname || user.user_metadata?.nickname || '',
    avatarUrl: userInfoData?.avatar_url || user.user_metadata?.avatar_url || user.user_metadata?.avatar || null,
    avatarName: userInfoData?.avatar_name || user.user_metadata?.avatar_name || null,
    avatarSize: userInfoData?.avatar_size || user.user_metadata?.avatar_size || null,
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

/**
 * 刷新会话
 */
export async function refreshSession(): Promise<void> {
  await supabase.auth.refreshSession()
}

/**
 * 监听认证状态变化
 */
export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange((event, session) => {
    callback(event, session)
  })
}
