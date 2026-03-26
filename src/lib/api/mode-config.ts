/**
 * API 模式配置
 *
 * 支持两种模式：
 * - 'java-backend': 使用 Java Spring Boot 后端 API
 * - 'supabase': 直接使用 Supabase
 *
 * 通过环境变量切换模式，无需修改代码
 */

export type APIMode = 'java-backend' | 'supabase'

/**
 * 当前 API 模式
 * 在 .env.local 中设置 NEXT_PUBLIC_API_MODE 来切换
 */
export const getCurrentAPIMode = (): APIMode => {
 const mode = process.env.NEXT_PUBLIC_API_MODE || 'java-backend'
 return mode as APIMode
}

/**
 * 是否使用 Java 后端模式
 */
export const isJavaBackendMode = (): boolean => {
 return getCurrentAPIMode() === 'java-backend'
}

/**
 * 是否使用 Supabase 模式
 */
export const isSupabaseMode = (): boolean => {
 return getCurrentAPIMode() === 'supabase'
}

/**
 * API 配置接口
 */
export interface APIConfig {
 mode: APIMode
 javaBackendURL: string
 supabase: {
  url: string
  anonKey: string
 }
}

/**
 * 获取当前 API 配置
 */
export const getAPIConfig = (): APIConfig => {
 return {
  mode: getCurrentAPIMode(),
  javaBackendURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080',
  supabase: {
   url: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
   anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
  },
 }
}

/**
 * 打印当前模式（用于调试）
 */
export const logAPIMode = (): void => {
 const config = getAPIConfig()
 console.log('[API Mode]', {
  mode: config.mode,
  javaBackend: config.javaBackendURL,
  supabase: config.supabase.url ? 'configured' : 'not configured',
 })
}
