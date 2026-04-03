/**
 * API 通用类型定义
 */

/**
 * 标准 API 响应格式（用于 admin.ts 等模块的内部封装）
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
  timestamp: number
}
