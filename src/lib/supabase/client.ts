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

/**
 * 获取头像的公开 URL
 */
export function getAvatarUrl(avatarName: string | null): string | null {
 if (!avatarName) return null
 return `${supabaseUrl}/storage/v1/object/public/nebula-hub-avatars/${avatarName}`
}

/**
 * 上传头像到 Supabase Storage
 * @deprecated 已废弃，请使用 src/lib/api/modules/file.ts 中的 uploadAvatar 函数
 */
export async function uploadAvatar(file: File, userId: string): Promise<{ path: string; url: string }> {
 const fileExt = file.name.split('.').pop() || 'jpg'
 const fileName = `${userId}_${Date.now()}.${fileExt}`
 const filePath = `${fileName}`

 const { data, error } = await supabase.storage
  .from('nebula-hub-avatars')
  .upload(filePath, file, {
   upsert: true,
  })

 if (error) {
  throw new Error(`上传失败：${error.message}`)
 }

 // 获取公开 URL
 const { data: urlData } = supabase.storage
  .from('nebula-hub-avatars')
  .getPublicUrl(filePath)

 return {
  path: filePath,
  url: urlData.publicUrl,
 }
}

/**
 * 删除旧头像
 * @deprecated 已废弃，不再需要手动删除头像
 */
export async function deleteAvatar(filePath: string): Promise<void> {
 const { error } = await supabase.storage
  .from('nebula-hub-avatars')
  .remove([filePath])

 if (error) {
  console.warn('删除头像失败:', error.message)
 }
}
