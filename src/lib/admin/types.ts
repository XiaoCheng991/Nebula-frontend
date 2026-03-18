// src/lib/admin/types.ts

import type { SysUser as BackendSysUser, SysRole as BackendSysRole, SysMenu as BackendSysMenu } from '@/lib/api/modules/admin'

// ======== 核心类型 ========

export interface AdminUser {
  id: number
  username: string
  nickname: string
  email: string
  avatar?: string
  avatarUrl?: string
  status: 'active' | 'disabled'
  accountStatus?: number // 0-禁用, 1-启用
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
  parentName?: string
  visible?: boolean
  status?: 'ACTIVE' | 'INACTIVE'
  children?: AdminMenu[]
  createdAt?: string
  // 用于扁平化表格展示
  _level?: number
  _parentPath?: string
  _currentPath?: string
  _sortOrder?: number
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

// ======== 后端数据转换函数 ========

/**
 * 将后端 SysUser 转换为前端 AdminUser
 */
export function transformSysUserToAdminUser(backendUser: BackendSysUser): AdminUser {
  return {
    id: backendUser.id,
    username: backendUser.username,
    nickname: backendUser.nickname || backendUser.username,
    email: backendUser.email || '',
    avatar: backendUser.avatarUrl,
    avatarUrl: backendUser.avatarUrl,
    status: backendUser.accountStatus === 1 ? 'active' : 'disabled',
    accountStatus: backendUser.accountStatus,
    roleIds: [], // 需要单独接口获取
    createdAt: backendUser.createTime,
    updatedAt: backendUser.updateTime,
  }
}

/**
 * 将后端 SysRole 转换为前端 AdminRole
 */
export function transformSysRoleToAdminRole(backendRole: BackendSysRole): AdminRole {
  return {
    id: backendRole.id,
    name: backendRole.roleName,
    code: backendRole.roleCode,
    description: backendRole.description,
    permissionCodes: [], // 需要单独接口获取
    menuIds: [], // 需要单独接口获取
    createdAt: backendRole.createTime,
    updatedAt: backendRole.updateTime,
  }
}

/**
 * 将后端 SysMenu 转换为前端 AdminMenu
 */
export function transformSysMenuToAdminMenu(backendMenu: BackendSysMenu): AdminMenu {
  return {
    id: backendMenu.id,
    parentId: backendMenu.parentId,
    name: backendMenu.menuName,
    path: backendMenu.path,
    icon: backendMenu.icon,
    sortOrder: backendMenu.sortOrder || 0,
    type: (backendMenu.menuType as 'directory' | 'menu' | 'button') || 'menu',
    permissionCode: backendMenu.permission,
    parentName: backendMenu.parentName,
    visible: backendMenu.isVisible !== false,
    status: 'ACTIVE',
    children: backendMenu.children?.map(transformSysMenuToAdminMenu),
    createdAt: backendMenu.createTime,
  }
}
