/**
 * API 适配器统一导出
 *
 * 使用适配器后，前端代码无需关心后端是 Java 还是 Supabase
 */

// 认证适配器
export {
 login,
 register,
 logout,
 getUserInfo,
 getLocalUserInfo,
 isAuthenticated,
 emitAuthChange,
 loginWithGithub,
} from './auth-adapter'

export type { LoginResponse } from './auth-adapter'
