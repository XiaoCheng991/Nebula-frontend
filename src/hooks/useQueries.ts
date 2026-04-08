/**
 * React Query hooks for common data operations
 * 提供缓存、预加载、自动重试等能力
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getMemos, createMemo as apiCreateMemo, deleteMemo as apiDeleteMemo, getMemoById } from '@/lib/supabase/modules/memo'
import { getArticles, getArticleById } from '@/lib/supabase/modules/blog'

type ArticleOrderBy = 'create_time' | 'update_time' | 'view_count' | 'like_count'

// ==================== Memos ====================

export function useMemos(page = 1, pageSize = 12, visibility: 'PUBLIC' | 'FRIENDS' | 'PRIVATE' = 'PUBLIC', enabled = true) {
  return useQuery({
    queryKey: ['memos', page, pageSize, visibility],
    queryFn: () => getMemos({ page, pageSize, visibility }),
    staleTime: 1000 * 30,
    enabled,
  })
}

export function useMemoDetail(id: number, enabled = true) {
  return useQuery({
    queryKey: ['memo', id],
    queryFn: () => getMemoById(id),
    staleTime: 1000 * 60,
    enabled: enabled && !!id,
  })
}

export function useCreateMemo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiCreateMemo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] })
    },
  })
}

export function useDeleteMemo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: apiDeleteMemo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos'] })
    },
  })
}

// ==================== Articles ====================

export function useArticles(page = 1, pageSize = 10, orderBy: ArticleOrderBy = 'create_time', enabled = true) {
  return useQuery({
    queryKey: ['articles', page, pageSize, orderBy],
    queryFn: () => getArticles({ page, pageSize, orderBy }),
    staleTime: 1000 * 30,
    enabled,
  })
}

export function useArticleDetail(id: number, slug?: string, enabled = true) {
  return useQuery({
    queryKey: ['article', id, slug],
    queryFn: () => getArticleById(id, slug),
    staleTime: 1000 * 60,
    enabled: enabled && !!id,
  })
}

// ==================== Dashboard ====================

export function useDashboardData(userId?: number) {
  return useQuery({
    queryKey: ['dashboard', userId],
    queryFn: async () => {
      const [memoRes, articleRes] = await Promise.all([
        getMemos({ page: 1, pageSize: 5, visibility: 'PUBLIC' }),
        getArticles({ page: 1, pageSize: 10 }),
      ])
      return {
        memos: memoRes.data,
        memoTotal: memoRes.total,
        articleTotal: articleRes.total,
      }
    },
    staleTime: 1000 * 60,
    enabled: true,
  })
}

// ==================== Drive ====================

export function useDriveData(bucket: string, folder?: string, enabled = true) {
  return useQuery({
    queryKey: ['drive', bucket, folder],
    queryFn: () => require('@/lib/api/modules/drive').loadAllDriveData(bucket, folder),
    staleTime: 1000 * 30,
    enabled,
  })
}
