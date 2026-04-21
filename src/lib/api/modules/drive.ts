/**
 * Drive 文件 API 模块（Supabase 模式）
 */

import { supabase } from '@/lib/supabase/client'
import type { Tables, TablesInsert } from '@/lib/supabase/types'
import { apiLogger } from '@/lib/utils/logger'

export interface DrivePageData {
  files: Tables<'file_metadata'>[]
  recentFiles: Tables<'file_metadata'>[]
  folders: Set<string>
  storageStats: { bucketName: string; fileCount: number; totalSize: number }[]
  error: any
}

/**
 * 通过一条 SQL RPC 获取 Drive 页面所有数据
 * ⚠️ 必须先在 Supabase SQL Editor 运行 add_user_isolation.sql
 * @param bucketName 存储桶名称
 * @param folderName 文件夹名称（可选）
 * @param userId 当前用户 ID（可选，不传则自动从 JWT 获取）
 */
export async function loadAllDriveData(
  bucketName: string,
  folderName?: string,
  userId?: number
): Promise<DrivePageData> {
  const { data, error } = await supabase.rpc('get_drive_page_data', {
    p_bucket_name: bucketName,
    p_folder_name: folderName || undefined,
    p_user_id: userId || null,
  })

  if (error || !data) {
    apiLogger.error('RPC get_drive_page_data 失败:', error?.message || '返回空数据')
    return { files: [], recentFiles: [], folders: new Set(), storageStats: [], error }
  }

  const filesArr = data.files_json as unknown as Tables<'file_metadata'>[]
  const recentArr = data.recent_files_json as unknown as Tables<'file_metadata'>[]
  const foldersArr = data.folders_json
  const statsArr = data.stats_json as unknown as { bucketName: string; fileCount: number; totalSize: number }[]

  return {
    files: Array.isArray(filesArr) ? filesArr : [],
    recentFiles: Array.isArray(recentArr) ? recentArr : [],
    folders: new Set(Array.isArray(foldersArr) ? foldersArr : []),
    storageStats: Array.isArray(statsArr) ? statsArr : [],
    error: null,
  }
}

/**
 * 获取文件元数据列表
 */
export async function getFileMetadata(options?: {
  bucketName?: string
  folderName?: string
  page?: number
  pageSize?: number
}): Promise<{ data: Tables<'file_metadata'>[]; total: number; error: any }> {
  const { bucketName, folderName, page = 1, pageSize = 20 } = options || {}
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('file_metadata')
    .select('*', { count: 'exact' })
    .eq('deleted', 0)
    .order('created_at', { ascending: false })

  if (bucketName) {
    query = query.eq('bucket_name', bucketName)
  }
  if (folderName) {
    query = query.eq('folder_name', folderName)
  }

  const { data, error, count } = await query
  return { data: data || [], total: count || 0, error }
}

/**
 * 获取最近上传的文件
 */
export async function getRecentFiles(limit = 10): Promise<{ data: Tables<'file_metadata'>[]; error: any }> {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('*')
    .eq('deleted', 0)
    .order('created_at', { ascending: false })
    .limit(limit)

  return { data: data || [], error }
}

/**
 * 获取共享文件列表
 */
export async function getSharedFiles(options?: {
  page?: number
  pageSize?: number
}): Promise<{ data: Tables<'file_metadata'>[]; total: number; error: any }> {
  const { page = 1, pageSize = 20 } = options || {}

  const { data, error, count } = await supabase
    .from('file_metadata')
    .select('*', { count: 'exact' })
    .eq('is_shared', true)
    .eq('deleted', 0)
    .order('created_at', { ascending: false })

  return { data: data || [], total: count || 0, error }
}

/**
 * 按桶统计文件夹信息
 */
export async function getFoldersByBucket(bucketName?: string): Promise<{ data: Record<string, Set<string>>; error: any }> {
  let query = supabase
    .from('file_metadata')
    .select('bucket_name, folder_name')
    .eq('deleted', 0)

  if (bucketName) {
    query = query.eq('bucket_name', bucketName)
  }

  const { data, error } = await query

  if (error) {
    return { data: {}, error }
  }

  const bucketFolders: Record<string, Set<string>> = {}
  data?.forEach((item: any) => {
    if (!bucketFolders[item.bucket_name]) {
      bucketFolders[item.bucket_name] = new Set()
    }
    if (item.folder_name) {
      bucketFolders[item.bucket_name].add(item.folder_name)
    }
  })

  return { data: bucketFolders, error }
}

/**
 * 创建文件元数据记录
 */
export async function createFileMetadata(metadata: TablesInsert<'file_metadata'>): Promise<{ data: Tables<'file_metadata'> | null; error: any }> {
  const { data, error } = await supabase
    .from('file_metadata')
    .insert(metadata)
    .select()
    .single()

  return { data, error }
}

/**
 * 删除文件
 */
export async function deleteFileMetadata(id: number, bucketName: string, filePath: string): Promise<boolean> {
  const { error } = await supabase
    .from('file_metadata')
    .update({ deleted: 1 })
    .eq('id', id)

  if (error) return false

  const { error: storageError } = await supabase.storage
    .from(bucketName)
    .remove([filePath])

  return !storageError
}

/**
 * 获取文件的公开 URL
 */
export function getPublicUrl(bucketName: string, filePath: string): string {
  const { data } = supabase.storage
    .from(bucketName)
    .getPublicUrl(filePath)
  return data.publicUrl
}

/**
 * 获取存储统计信息
 */
export async function getStorageStats(): Promise<{ data: { bucketName: string; fileCount: number; totalSize: number }[]; error: any }> {
  const { data, error } = await supabase
    .from('file_metadata')
    .select('bucket_name, file_size')
    .eq('deleted', 0)

  if (error) {
    return { data: [], error }
  }

  const statsMap: Record<string, { fileCount: number; totalSize: number }> = {}
  data?.forEach((item: any) => {
    if (!statsMap[item.bucket_name]) {
      statsMap[item.bucket_name] = { fileCount: 0, totalSize: 0 }
    }
    statsMap[item.bucket_name].fileCount++
    statsMap[item.bucket_name].totalSize += item.file_size
  })

  const stats = Object.entries(statsMap).map(([bucketName, { fileCount, totalSize }]) => ({
    bucketName,
    fileCount,
    totalSize,
  }))

  return { data: stats, error }
}
