/**
 * 文件相关 API（Supabase 模式）
 */

import { supabase } from '@/lib/supabase/client'

/**
 * 文件上传响应
 */
export interface FileUploadResponse {
  url: string
  fileName: string
}

/**
 * 上传单个文件到 Supabase Storage
 * 使用最新的 Supabase SDK v2 模式
 */
export async function uploadSingleFile(
  file: File,
  onProgress?: (progress: number) => void
): Promise<FileUploadResponse> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('未登录，无法上传文件')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `uploads/${session.user.id}/${fileName}`

  const { error } = await supabase.storage
    .from('nebula-hub-files')
    .upload(filePath, file, {
      upsert: false,
      cacheControl: '3600',
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('nebula-hub-files')
    .getPublicUrl(filePath)

  return {
    url: publicUrl,
    fileName,
  }
}

/**
 * 上传头像到 Supabase Storage
 * 使用最新的 Supabase SDK v2 模式
 */
export async function uploadAvatar(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('未登录，无法上传头像')
  }

  const fileExt = file.name.split('.').pop()
  const fileName = `avatar-${Date.now()}.${fileExt}`
  const filePath = `avatars/${session.user.id}/${fileName}`

  const { error } = await supabase.storage
    .from('nebula-hub-avatars')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '31536000', // 1 年缓存
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('nebula-hub-avatars')
    .getPublicUrl(filePath)

  return publicUrl
}

/**
 * 上传博客图片到 Supabase Storage
 */
export async function uploadBlogImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    throw new Error('未登录，无法上传图片')
  }

  const fileExt = file.name.split('.').pop() || 'png'
  const fileName = `blog-${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `${fileName}`

  const { error } = await supabase.storage
    .from('blog-images')
    .upload(filePath, file, {
      upsert: false,
      cacheControl: '86400', // 1 天缓存
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('blog-images')
    .getPublicUrl(filePath)

  return publicUrl
}
