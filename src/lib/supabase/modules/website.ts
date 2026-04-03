/**
 * 用户网站精选收藏 API 模块
 * 表名对齐：user_website_collection
 */

import { supabase, isSupabaseAvailable } from '../client'
import type { Tables, TablesInsert } from '../types'

export type WebsiteCollection = Tables<'user_website_collection'>

// ==================== CRUD ====================

/**
 * 获取用户网站精选列表
 */
export async function getUserWebsites(options?: {
  userId: number
  page?: number
  pageSize?: number
  category?: string
}): Promise<{ data: WebsiteCollection[]; total: number; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], total: 0, error: 'Supabase not configured' }

  const { userId = 0, page = 1, pageSize = 20, category } = options || {}
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = (supabase
    .from('user_website_collection') as any)
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .eq('deleted', 0)
    .order('is_featured', { ascending: false })
    .order('create_time', { ascending: false })
    .range(from, to)

  if (category) {
    query = query.eq('category', category)
  }

  const { data, error, count } = await query
  return { data: data || [], total: count || 0, error }
}

/**
 * 添加网站精选
 */
export async function createWebsite(
  website: TablesInsert<'user_website_collection'>
): Promise<{ data: WebsiteCollection | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await (supabase
    .from('user_website_collection') as any)
    .insert({
      user_id: website.user_id,
      url: website.url,
      title: website.title,
      description: website.description || null,
      icon_url: website.icon_url || null,
      category: website.category || '工具',
      is_featured: website.is_featured ?? false,
      visit_count: website.visit_count || 0,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 更新网站精选
 */
export async function updateWebsite(
  id: number,
  update: TablesInsert<'user_website_collection'>
): Promise<{ data: WebsiteCollection | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await (supabase
    .from('user_website_collection') as any)
    .update(update)
    .eq('id', id)
    .eq('deleted', 0)
    .select()
    .single()

  return { data, error }
}

/**
 * 删除网站精选（逻辑删除）
 */
export async function deleteWebsite(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await (supabase
    .from('user_website_collection') as any)
    .update({ deleted: 1 })
    .eq('id', id)

  return !error
}

/**
 * 增加访问计数（通过 RPC）
 */
export async function incrementWebsiteVisit(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  try {
    const { error } = await (supabase as any).rpc('increment_uwc_visit', {
      website_id_param: id,
    })
    return !error
  } catch {
    return false
  }
}

/**
 * 获取用户所有分类（去重）
 */
export async function getWebsiteCategories(userId: number): Promise<{ data: string[]; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await (supabase
    .from('user_website_collection') as any)
    .select('category')
    .eq('user_id', userId)
    .eq('deleted', 0)

  if (error || !data) {
    return { data: [], error }
  }

  const categories = [...new Set((data as { category: string }[]).map((item) => item.category))]
  return { data: categories, error: null }
}
