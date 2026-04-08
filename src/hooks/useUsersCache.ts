/**
 * 用户信息缓存 hook
 * 缓存 sys_users 数据，避免每个页面重复查询头像、昵称等
 */

import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase/client'

/**
 * 根据用户ID列表批量获取用户信息（带缓存）
 */
export function useUsersById(userIds: number[], enabled = true) {
  return useQuery({
    queryKey: ['users-by-ids', userIds],
    queryFn: async () => {
      if (userIds.length === 0) return new Map()
      const { data: users } = await supabase
        .from('sys_users')
        .select('id, nickname, username, avatar_url')
        .in('id', userIds)
      return new Map(users?.map((u: any) => [u.id, u]) || [])
    },
    staleTime: 1000 * 60 * 5, // 用户信息5分钟内不变
    enabled: enabled && userIds.length > 0,
  })
}

/**
 * 根据单个用户ID获取用户信息
 */
export function useUserById(userId: number, enabled = true) {
  return useQuery({
    queryKey: ['user-by-id', userId],
    queryFn: async () => {
      const { data } = await supabase
        .from('sys_users')
        .select('id, nickname, username, avatar_url')
        .eq('id', userId)
        .single()
      return data
    },
    staleTime: 1000 * 60 * 5,
    enabled: enabled && !!userId,
  })
}
