/**
 * Supabase 客户端配置（浏览器端）
 *
 * 使用 @supabase/ssr 的 createBrowserClient
 * 浏览器端手动实现 getAll/setAll，用 document.cookie 读写
 * 这样中间件的 createServerClient 才能读到 cookie
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from './types'
import { apiLogger } from '@/lib/utils/logger'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
	apiLogger.warn('[Supabase] 环境变量未配置，Supabase 功能将不可用')
}

/**
 * 从 document.cookie 解析所有 cookie
 */
function parseCookies() {
	if (typeof window === 'undefined') return []
	return document.cookie
		.split(';')
		.map(c => c.trim())
		.filter(c => c.includes('='))
		.map(c => {
			const [name, ...valueParts] = c.split('=')
			return { name: name.trim(), value: valueParts.join('=').trim() }
		})
}

export const supabase = createBrowserClient<Database>(
	supabaseUrl || '',
	supabaseAnonKey || '',
	{
		cookies: {
			getAll() {
				return parseCookies()
			},
			setAll(cookiesToSet) {
				if (typeof window === 'undefined') return
				cookiesToSet.forEach(({ name, value, options }) => {
					let cookieString = `${name}=${value}`
					if (options?.path) cookieString += `; path=${options.path}`
					if (options?.maxAge) cookieString += `; max-age=${options.maxAge}`
					if (options?.sameSite) cookieString += `; SameSite=${options.sameSite}`
					if (options?.secure) cookieString += '; secure'
					document.cookie = cookieString
				})
			},
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
	return `${supabaseUrl}/storage/v1/object/public/user-avatar/${avatarName}`
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
		.from('user-avatar')
		.upload(filePath, file, {
			upsert: true,
		})

	if (error) {
		throw new Error(`上传失败：${error.message}`)
	}

	const { data: urlData } = supabase.storage
		.from('user-avatar')
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
		.from('user-avatar')
		.remove([filePath])

	if (error) {
		apiLogger.warn('删除头像失败:', error.message)
	}
}
