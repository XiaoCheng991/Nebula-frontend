/**
 * Supabase 博客 API 模块
 * 表名严格对齐 final.sql：blog_article / blog_category / blog_tag / blog_article_tag / blog_comment
 */

import { supabase } from '../client'
import { isSupabaseAvailable } from '../client'
import type { Tables, TablesInsert, TablesUpdate } from '../types'

export type Article = Tables<'blog_article'>
export type ArticleInsert = TablesInsert<'blog_article'>
export type ArticleUpdate = TablesUpdate<'blog_article'>
export type Category = Tables<'blog_category'>
export type Tag = Tables<'blog_tag'>
export type ArticleTag = Tables<'blog_article_tag'>
export type Comment = Tables<'blog_comment'>

// ==================== 文章 ====================

/**
 * 获取已发布文章列表
 */
export async function getArticles(options?: {
  page?: number
  pageSize?: number
  categoryId?: number
  tagId?: number
  search?: string
  orderBy?: 'create_time' | 'update_time' | 'view_count' | 'like_count'
}): Promise<{ data: Article[]; total: number; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], total: 0, error: 'Supabase not configured' }

  const { page = 1, pageSize = 10, orderBy = 'create_time' } = options || {}
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1

  let query = supabase
    .from('blog_article')
    .select('*', { count: 'estimated' })
    .eq('status', 'PUBLISHED')
    .eq('deleted', 0)
    .order(orderBy, { ascending: false })
    .range(from, to)

  if (options?.search) {
    query = query.or(`title.ilike.%${options.search}%,summary.ilike.%${options.search}%`)
  }

  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }

  if (options?.tagId) {
    const { data: articleTags } = await supabase
      .from('blog_article_tag')
      .select('article_id, id')
      .eq('tag_id', options.tagId)
      .limit(1000) as unknown as { data: { article_id: number }[] | null }
    const articleIds = articleTags?.map(t => t.article_id) || []
    if (articleIds.length > 0) {
      query = query.in('id', articleIds)
    } else {
      return { data: [], total: 0, error: null }
    }
  }

  const { data, error, count } = await query
  return { data: data || [], total: count || 0, error }
}

/**
 * 获取文章详情（按 ID 或 slug）
 */
export async function getArticleById(id: number, slug?: string): Promise<{ data: Article | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const q = supabase.from('blog_article').select('*').eq('deleted', 0)
  const { data, error } = slug
    ? await q.eq('slug', slug).single()
    : await q.eq('id', id).single()

  return { data, error }
}

/**
 * 增加文章浏览数
 */
export async function incrementArticleView(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false
  const { error } = await (supabase as any).rpc('increment_blog_article_view_count', { article_id_param: id })
  return !error
}

/**
 * 创建文章
 */
export async function createArticle(article: ArticleInsert): Promise<{ data: Article | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await (supabase
    .from('blog_article') as any)
    .insert(article)
    .select()
    .single()

  return { data, error }
}

/**
 * 更新文章
 */
export async function updateArticle(id: number, update: ArticleUpdate): Promise<{ data: Article | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await (supabase
    .from('blog_article') as any)
    .update(update)
    .eq('id', id)
    .eq('deleted', 0)
    .select()
    .single()

  return { data, error }
}

/**
 * 删除文章（逻辑删除）
 */
export async function deleteArticle(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await (supabase
    .from('blog_article') as any)
    .update({ deleted: 1 })
    .eq('id', id)

  return !error
}

/**
 * 获取所有分类
 */
export async function getCategories(): Promise<{ data: Category[]; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('blog_category')
    .select('*')
    .eq('status', 'ACTIVE')
    .eq('deleted', 0)
    .order('sort_order', { ascending: true })

  return { data: data || [], error }
}

/**
 * 获取所有标签
 */
export async function getTags(): Promise<{ data: Tag[]; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await (supabase
    .from('blog_tag') as any)
    .select('id, tag_name')
    .eq('status', 'ACTIVE')
    .eq('deleted', 0)
    .limit(20)
    .order('create_time', { ascending: false })

  return { data: (data as Tag[]) || [], error }
}

// ==================== 评论 ====================

/**
 * 获取文章评论（一级评论 + 可选回复）
 */
export async function getArticleComments(articleId: number, parent?: number): Promise<{ data: Comment[]; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], error: 'Supabase not configured' }

  let query = supabase
    .from('blog_comment')
    .select('*')
    .eq('article_id', articleId)
    .eq('deleted', 0)
    .eq('status', 'APPROVED')
    .order('create_time', { ascending: true })

  if (parent !== undefined) {
    query = query.eq('parent_id', parent)
  }

  const { data, error } = await query
  return { data: data || [], error }
}

/**
 * 添加评论（无需审核，直接显示）
 */
export async function addComment(comment: TablesInsert<'blog_comment'>): Promise<{ data: Comment | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await (supabase
    .from('blog_comment') as any)
    .insert({
      ...comment,
      parent_id: comment.parent_id || 0,
      status: 'APPROVED', // 无需审核
      like_count: comment.like_count || 0,
      deleted: 0,
    })
    .select()
    .single()

  return { data, error }
}

/**
 * 删除评论（逻辑删除）
 */
export async function deleteComment(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await (supabase
    .from('blog_comment') as any)
    .update({ deleted: 1 })
    .eq('id', id)

  return !error
}

// ==================== 标签关联 ====================

/**
 * 获取文章的标签列表
 */
export async function getArticleTags(articleId: number): Promise<{ data: Tag[]; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], error: 'Supabase not configured' }

  const { data: relations } = await supabase
    .from('blog_article_tag')
    .select('tag_id')
    .eq('article_id', articleId) as unknown as { data: { tag_id: number }[] | null; error: any }

  if (!relations || relations.length === 0) {
    return { data: [], error: null }
  }

  const tagIds = relations.map(r => r.tag_id)
  const { data, error } = await (supabase
    .from('blog_tag') as any)
    .select('*')
    .in('id', tagIds)
    .eq('deleted', 0)

  return { data: data || [], error }
}

/**
 * 设置文章标签（先删除旧的，再插入新的）
 */
export async function setArticleTags(articleId: number, tagIds: number[]): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error: deleteError } = await (supabase
    .from('blog_article_tag') as any)
    .delete()
    .eq('article_id', articleId)

  if (deleteError) return false

  if (tagIds.length === 0) return true

  const inserts = tagIds.map(tagId => ({ article_id: articleId, tag_id: tagId }))
  const { error } = await (supabase
    .from('blog_article_tag') as any)
    .insert(inserts)

  return !error
}

// ==================== 网站精选 (user_website_collection) ====================

export async function getWebsiteCollections(): Promise<{ data: any[]; error: any }> {
  if (!isSupabaseAvailable()) return { data: [], error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('user_website_collection')
    .select('*')
    .eq('deleted', 0)
    .order('create_time', { ascending: false })

  return { data: data || [], error }
}

export async function addWebsiteCollection(collection: { title: string; url: string; user_id: number }): Promise<{ data: any | null; error: any }> {
  if (!isSupabaseAvailable()) return { data: null, error: 'Supabase not configured' }

  const { data, error } = await supabase
    .from('user_website_collection')
    .insert(collection)
    .select()
    .single()

  return { data, error }
}

export async function deleteWebsiteCollection(id: number): Promise<boolean> {
  if (!isSupabaseAvailable()) return false

  const { error } = await supabase
    .from('user_website_collection')
    .update({ deleted: 1 })
    .eq('id', id)

  return !error
}
