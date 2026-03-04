// src/lib/admin/types.ts

// ======== 核心类型 ========

export interface AdminUser {
  id: number
  username: string
  displayName: string
  email: string
  avatar?: string
  status: 'active' | 'disabled'
  roleIds: number[]
  createdAt?: string
  updatedAt?: string
}

export interface AdminRole {
  id: number
  name: string
  code: string
  description?: string
  permissionCodes: string[]
  menuIds: number[]
  createdAt?: string
  updatedAt?: string
}

export interface AdminPermission {
  id: number
  name: string
  code: string
  type: 'page' | 'button'
  path?: string
  description?: string
  createdAt?: string
}

export interface AdminMenu {
  id: number
  parentId?: number
  name: string
  path?: string
  icon?: string
  sortOrder: number
  type: 'directory' | 'menu' | 'button'
  permissionCode?: string
  children?: AdminMenu[]
  createdAt?: string
}

export interface Dictionary {
  id: number
  code: string
  name: string
  type: 'config' | 'data'
  items: DictionaryItem[]
  createdAt?: string
  updatedAt?: string
}

export interface DictionaryItem {
  id: number
  label: string
  value: string
  sortOrder: number
  status: 'enabled' | 'disabled'
}

export interface OperationLog {
  id: number
  userId: number
  username: string
  operation: string
  method: string
  params?: string
  ip?: string
  status: 'success' | 'failed'
  createdAt: string
}

// ======== 请求/响应类型 ========

export interface PageParams {
  page: number
  pageSize: number
}

export interface PageResult<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ======== Store 类型 ========

export interface AdminState {
  // 用户信息
  user: AdminUser | null
  roles: AdminRole[]
  permissions: AdminPermission[]
  menus: AdminMenu[]
  dictionaries: Dictionary[]

  // 状态
  isLoading: boolean
  hasAdminAccess: boolean

  // Actions
  setUser: (user: AdminUser | null) => void
  setRoles: (roles: AdminRole[]) => void
  setPermissions: (permissions: AdminPermission[]) => void
  setMenus: (menus: AdminMenu[]) => void
  setDictionaries: (dictionaries: Dictionary[]) => void
  setLoading: (loading: boolean) => void
  setHasAdminAccess: (hasAccess: boolean) => void
  loadAdminData: () => Promise<void>
  clearAdminData: () => void
}
