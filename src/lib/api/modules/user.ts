/**
 * 用户相关 API（Supabase 模式）
 */

import { supabase } from '@/lib/supabase/client'
import { getLocalUserInfo } from '../adapters'

/**
 * 用户资料
 */
export interface UserProfile {
  id: number | string
  username: string
  nickname: string
  email: string
  avatar: string | null
  avatarUrl?: string | null
  bio: string
  createdAt?: string
  updatedAt?: string
}

/**
 * 更新用户资料请求
 */
export interface UpdateProfileRequest {
  nickname?: string
  bio?: string
  avatar?: string
  avatarUrl?: string
}

/**
 * 获取当前用户信息（从 Supabase）
 */
export async function getUserProfile(): Promise<UserProfile> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error('未登录')
  }

  const { user } = session

  // 获取本地存储的用户信息作为补充
  const localUser = getLocalUserInfo()

  // 构建用户资料
  const userProfile: UserProfile = {
    id: user.id,
    username: localUser?.username || user.user_metadata?.username || user.email?.split('@')[0] || '',
    nickname: localUser?.nickname || user.user_metadata?.nickname || user.user_metadata?.name || '',
    email: user.email || '',
    avatar: localUser?.avatarUrl || user.user_metadata?.avatar_url || null,
    avatarUrl: localUser?.avatarUrl || user.user_metadata?.avatar_url || null,
    bio: user.user_metadata?.bio || '',
  }

  return userProfile
}

/**
 * 更新用户资料（更新到 Supabase）
 */
export async function updateUserProfile(data: UpdateProfileRequest): Promise<UserProfile> {
  const { data: { session }, error: sessionError } = await supabase.auth.getSession()

  if (sessionError || !session) {
    throw new Error('未登录')
  }

  // 更新 Supabase user_metadata
  const updates: { data: { [key: string]: any } } = { data: {} }

  if (data.nickname !== undefined) {
    updates.data.nickname = data.nickname
  }
  if (data.bio !== undefined) {
    updates.data.bio = data.bio
  }
  if (data.avatar !== undefined || data.avatarUrl !== undefined) {
    updates.data.avatar_url = data.avatarUrl || data.avatar
  }

  const { data: updateData, error: updateError } = await supabase.auth
    .updateUser(updates)

  if (updateError) {
    throw new Error(updateError.message || '更新用户资料失败')
  }

  // 同步更新本地存储
  if (typeof window !== 'undefined') {
    const userInfoStr = localStorage.getItem('userInfo')
    if (userInfoStr) {
      try {
        const userInfo = JSON.parse(userInfoStr)
        const updatedUserInfo = {
          ...userInfo,
          nickname: data.nickname || userInfo.nickname,
          avatarUrl: data.avatarUrl || data.avatar || userInfo.avatarUrl,
        }
        localStorage.setItem('userInfo', JSON.stringify(updatedUserInfo))
        // 触发认证变更事件
        window.dispatchEvent(new Event('auth-change'))
      } catch (e) {
        // 忽略解析错误
      }
    }
  }

  // 返回更新后的用户资料
  const { user } = updateData
  const localUser = getLocalUserInfo()

  return {
    id: user.id,
    username: localUser?.username || user.user_metadata?.username || '',
    nickname: user.user_metadata?.nickname || localUser?.nickname || '',
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || localUser?.avatarUrl || null,
    avatarUrl: user.user_metadata?.avatar_url || localUser?.avatarUrl || null,
    bio: user.user_metadata?.bio || '',
  }
}

/**
 * 更新用户头像
 */
export async function updateUserAvatar(avatarUrl: string): Promise<UserProfile> {
  return updateUserProfile({ avatarUrl })
}

/**
 * 更新用户昵称
 */
export async function updateUserNickname(nickname: string): Promise<UserProfile> {
  return updateUserProfile({ nickname })
}

/**
 * 更新用户简介
 */
export async function updateUserBio(bio: string): Promise<UserProfile> {
  return updateUserProfile({ bio })
}

/**
 * 获取当前登录用户信息（适配旧接口名称）
 */
export async function getCurrentUser(): Promise<UserProfile> {
  return getUserProfile()
}

/**
 * 检查用户是否为管理员（Simple implementation - Supabase 模式下需要扩展）
 */
export async function isAdmin(userId?: string): Promise<boolean> {
  // 在 Supabase 模式下，检查用户的 user_metadata 或 roles
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return false
  }

  const user = session.user

  // 检查 user_metadata 中是否有管理员标识
  return user.user_metadata?.role === 'admin' ||
         user.user_metadata?.isAdmin === true
}
