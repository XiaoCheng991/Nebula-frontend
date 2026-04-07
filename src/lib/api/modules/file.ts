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
    .from('user-avatar')
    .upload(filePath, file, {
      upsert: true,
      cacheControl: '31536000', // 1 年缓存
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data: { publicUrl } } = supabase.storage
    .from('user-avatar')
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

/**
 * 上传 Drive 文件到指定 Supabase Storage 桶，并写入元数据记录
 */
export async function uploadDriveFile(
  file: File,
  bucketName: string,
  folderName: string,
  userId: number,
  ownerName: string,
  onProgress?: (progress: number) => void
): Promise<{ url: string; error: any }> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return { url: '', error: new Error('未登录，无法上传文件') }
  }

  const fileExt = file.name.split('.').pop() || 'bin'
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  // Supabase Storage key 不支持中文等非 ASCII 字符，用 btoa 编码为安全字符串
  const safeFolderName = btoa(unescape(encodeURIComponent(folderName)))
  const filePath = `${safeFolderName}/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from(bucketName)
    .upload(filePath, file, {
      upsert: false,
      cacheControl: '3600',
    })

  if (uploadError) {
    return { url: '', error: uploadError }
  }

  const { data: { publicUrl } } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)

  // 确定文件类型
  const ext = fileExt.toLowerCase()
  const fileTypeMap: Record<string, string> = {
    pdf: 'pdf', doc: 'docx', docx: 'docx', xls: 'xlsx', xlsx: 'xlsx',
    ppt: 'pptx', pptx: 'pptx', txt: 'txt', csv: 'csv', zip: 'zip',
    rar: 'zip', '7z': 'zip', mp3: 'mp3', wav: 'mp3', flac: 'mp3',
    jpg: 'jpg', jpeg: 'jpg', png: 'jpg', gif: 'jpg', webp: 'jpg', svg: 'jpg',
    mp4: 'mp4', avi: 'mp4', mov: 'mp4', mkv: 'mp4',
  }
  const fileType = fileTypeMap[ext] || 'other'

  // 写入元数据
  const { error: metaError } = await supabase
    .from('file_metadata')
    .insert({
      bucket_name: bucketName,
      file_path: filePath,
      file_name: file.name,
      file_size: file.size,
      file_type: fileType,
      folder_name: folderName,
      user_id: userId,
      owner_name: ownerName,
    })

  if (metaError) {
    console.warn('元数据写入失败，但文件已上传:', metaError.message)
  }

  return { url: publicUrl, error: metaError }
}
