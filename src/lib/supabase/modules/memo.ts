/**
 * Supabase Memo 动态 API 模块
 * 表名对齐 final.sql：blog_memo / blog_memo_comment / blog_memo_like
 */

import { supabase, isSupabaseAvailable } from '../client'
import type { Tables, TablesInsert } from '../types'

export type Memo = Tables<'blog_memo'>
export type MemoComment = Tables<'blog_memo_comment'>
export type MemoLike = Tables<'blog_memo_like'>

// ==================== Memo CRUD ====================

/**
 * 获取 Memo 列表
 */
export async function getMemos(options?: {
  page?: number
  pageSize?: number
  visibility?: 'PUBLIC' | 'FRIENDS' | 'PRIVATE'
  userId?: number
}): Promise<{ data: Memo[]; total: number; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], total: 0, error: 'Supabase not configured' }

  const { page = 1, pageSize = 20, visibility = 'PUBLIC', userId } = options || {}
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('blog_memo')
    .select('*', { count: 'exact' })
    .eq('deleted', 0)
    .order('is_pinned', { ascending: false })
    .order('create_time', { ascending: false })
    .range(from, to)

  if (visibility) {
    query = query.eq('visibility', visibility)
  }

  if (userId) {
    query = query.eq('user_id', userId)
  }

  const { data, error, count } = await query
  return { data: data || [], total: count || 0, error }
}

/**
 * 获取单个 Memo
 */
export async function getMemoById(id: number): Promise<{ data: Memo | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('blog_memo')
    .select('*')
    .eq('id', id)
    .eq('deleted', 0)
    .single()

  return { data, error }
}

/**
 * 创建 Memo
 * @example 标准 Memo 格式：
 * {
 *   user_id: 123,
 *   content: '今天天气不错',
 *   image_urls: ['https://...'],
 *   visibility: 'PUBLIC',
 *   link_url: 'https://...',
 *   link_title: '...',
 *   link_description: '...',
 *   link_image_url: 'https://...'
 * }
 */
export async function createMemo(memo: TablesInsert<'blog_memo'>): Promise<{ data: Memo | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('blog_memo')
    .insert({
      user_id: memo.user_id,
      content: memo.content,
      image_urls: memo.image_urls || [],
      visibility: memo.visibility || 'PUBLIC',
      parent_memo_id: memo.parent_memo_id || 0,
      link_url: memo.link_url || null,
      link_title: memo.link_title || null,
      link_description: memo.link_description || null,
      link_image_url: memo.link_image_url || null,
      like_count: memo.like_count || 0,
      comment_count: memo.comment_count || 0,
      is_pinned: memo.is_pinned ?? false,
      deleted: 0,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 更新 Memo（仅作者）
 */
export async function updateMemo(id: number, update: TablesInsert<'blog_memo'>): Promise<{ data: Memo | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('blog_memo')
    .update(update)
    .eq('id', id)
    .eq('deleted', 0)
    .select()
    .single()

  return { data, error }
}

/**
 * 删除 Memo（逻辑删除，仅作者）
 */
export async function deleteMemo(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await supabase
    .from('blog_memo')
    .update({ deleted: 1 })
    .eq('id', id)

  return !error
}

// ==================== Memo 评论 ====================

/**
 * 获取 Memo 评论
 */
export async function getMemoComments(memoId: number, parent?: number): Promise<{ data: MemoComment[]; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], error: 'Supabase not configured' }

  let query = supabase
    .from('blog_memo_comment')
    .select('*')
    .eq('memo_id', memoId)
    .eq('deleted', 0)
    .order('create_time', { ascending: true })

  if (parent !== undefined) {
    query = query.eq('parent_id', parent)
  }

  const { data, error } = await query
  return { data: data || [], error }
}

/**
 * 添加 Memo 评论（无需审核）
 */
export async function addMemoComment(comment: TablesInsert<'blog_memo_comment'>): Promise<{ data: MemoComment | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('blog_memo_comment')
    .insert({
      ...comment,
      parent_id: comment.parent_id || 0,
      like_count: comment.like_count || 0,
      deleted: 0,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 删除 Memo 评论（逻辑删除）
 */
export async function deleteMemoComment(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await supabase
    .from('blog_memo_comment')
    .update({ deleted: 1 })
    .eq('id', id)

  return !error
}

// ==================== Memo 点赞 ====================

/**
 * 检查是否已点赞
 */
export async function isMemoLiked(memoId: number, userId: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { data, error } = await supabase
    .from('blog_memo_like')
    .select('id')
    .eq('memo_id', memoId)
    .eq('user_id', userId)
    .maybeSingle()

  return !!data
}

/**
 * 点赞（触发器自动更新 blog_memo.like_count）
 */
export async function likeMemo(memoId: number, userId: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await supabase
    .from('blog_memo_like')
    .upsert({ memo_id: memoId, user_id: userId })

  return !error
}

/**
 * 取消点赞（触发器自动更新 blog_memo.like_count）
 */
export async function unlikeMemo(memoId: number, userId: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await supabase
    .from('blog_memo_like')
    .delete()
    .eq('memo_id', memoId)
    .eq('user_id', userId)

  return !error
}
