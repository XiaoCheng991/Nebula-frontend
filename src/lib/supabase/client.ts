/**
 * Supabase 客户端配置
 *
 * 仅在 Supabase 模式下使用
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
 console.warn('[Supabase] 环境变量未配置，Supabase 功能将不可用')
}

export const supabase = createClient<Database>(
 supabaseUrl || '',
 supabaseAnonKey || '',
 {
  auth: {
   autoRefreshToken: true,
   persistSession: true,
   detectSessionInUrl: true,
  },
 }
)

/**
 * 检查 Supabase 是否可用
 */
export const isSupabaseAvailable = (): boolean => {
 return !!(supabaseUrl && supabaseAnonKey)
}

/**
 * 获取当前用户
 */
export const getCurrentUser = async () => {
 const { data: { user } } = await supabase.auth.getUser()
 return user
}

/**
 * 检查是否已登录
 */
export const isAuthenticated = async (): Promise<boolean> => {
 const { data: { session } } = await supabase.auth.getSession()
 return !!session
}
