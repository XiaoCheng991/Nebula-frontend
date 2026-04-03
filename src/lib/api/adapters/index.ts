/**
 * API 适配器 - Supabase 模式
 */

export {
  loginWithStorage as login,
  register,
  logout,
  getUserInfo,
  getLocalUserInfo,
  isAuthenticated,
  emitAuthChange,
  loginWithGithub,
} from './auth-adapter'

export type { LoginResponse, UserProfile } from './auth-adapter'
