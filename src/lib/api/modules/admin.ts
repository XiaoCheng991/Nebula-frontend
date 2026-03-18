/**
 * 后台管理 API 模块
 */

import { get, post, put, del } from '../client'
import type { ApiResponse } from '../types'

// ======== 类型定义 ========

/**
 * 后端分页响应
 */
export interface PageResponse<T> {
  records: T[]
  total: number
  pages: number
  current: number
  size: number
}

/**
 * 后端系统用户
 */
export interface SysUser {
  id: number
  username: string
  email?: string
  phone?: string
  nickname?: string
  avatarName?: string
  avatarUrl?: string
  avatarSize?: number
  bio?: string
  onlineStatus?: string
  accountStatus: number // 0-禁用, 1-启用
  lastLoginAt?: string
  lastSeenAt?: string
  createTime?: string
  updateTime?: string
}

/**
 * 后端系统角色
 */
export interface SysRole {
  id: number
  roleName: string
  roleCode: string
  dataScope?: string
  description?: string
  isSystem?: boolean
  sortOrder?: number
  status: string // ACTIVE-启用, DISABLED-禁用
  createTime?: string
  updateTime?: string
}

/**
 * 后端系统菜单
 */
export interface SysMenu {
  id: number
  parentId?: number
  menuType: string // directory-目录, menu-菜单, button-按钮
  menuName: string
  path?: string
  component?: string
  permission?: string
  icon?: string
  sortOrder?: number
  isVisible?: boolean
  isSystem?: boolean
  parentName?: string
  children?: SysMenu[]
  createTime?: string
  updateTime?: string
}

// ======== 用户管理 API ========

/**
 * 获取用户列表
 */
export async function getUserList(
  pageNum: number = 1,
  pageSize: number = 10,
  keyword?: string
): Promise<ApiResponse<PageResponse<SysUser>>> {
  const params = new URLSearchParams()
  params.append('pageNum', pageNum.toString())
  params.append('pageSize', pageSize.toString())
  if (keyword) {
    params.append('keyword', keyword)
  }
  return get<ApiResponse<PageResponse<SysUser>>>(`/api/admin/system/user/list?${params.toString()}`)
}

/**
 * 获取用户详情
 */
export async function getUserById(userId: number): Promise<ApiResponse<SysUser>> {
  return get<ApiResponse<SysUser>>(`/api/admin/system/user/${userId}`)
}

/**
 * 获取当前登录用户信息（后台）
 */
export async function getCurrentAdminUser(): Promise<ApiResponse<SysUser>> {
  return get<ApiResponse<SysUser>>('/api/admin/system/user/current')
}

/**
 * 获取用户的角色ID列表
 */
export async function getUserRoleIds(userId: number): Promise<ApiResponse<number[]>> {
  return get<ApiResponse<number[]>>(`/api/admin/system/user/${userId}/role-ids`)
}

/**
 * 编辑用户
 */
export async function updateUser(user: Partial<SysUser>): Promise<ApiResponse<void>> {
  return put<ApiResponse<void>>('/api/admin/system/user', user)
}

/**
 * 修改用户状态
 */
export async function updateUserStatus(userId: number, status: number): Promise<ApiResponse<void>> {
  return put<ApiResponse<void>>(`/api/admin/system/user/${userId}/status?status=${status}`)
}

/**
 * 分配角色给用户
 */
export async function assignRolesToUser(userId: number, roleIds: number[]): Promise<ApiResponse<void>> {
  return put<ApiResponse<void>>(`/api/admin/system/user/${userId}/roles`, roleIds)
}

/**
 * 删除用户
 */
export async function deleteUser(userId: number): Promise<ApiResponse<void>> {
  return del<ApiResponse<void>>(`/api/admin/system/user/${userId}`)
}

// ======== 菜单管理 API ========

/**
 * 获取当前用户的菜单树
 */
export async function getCurrentUserMenus(): Promise<ApiResponse<SysMenu[]>> {
  return get<ApiResponse<SysMenu[]>>('/api/admin/system/menu/user')
}

/**
 * 获取菜单列表
 */
export async function getMenuList(): Promise<ApiResponse<SysMenu[]>> {
  return get<ApiResponse<SysMenu[]>>('/api/admin/system/menu/list')
}

/**
 * 获取菜单树结构
 */
export async function getMenuTree(): Promise<ApiResponse<SysMenu[]>> {
  return get<ApiResponse<SysMenu[]>>('/api/admin/system/menu/tree')
}

// ======== 角色管理 API ========

/**
 * 获取所有启用角色
 */
export async function getAllRoles(): Promise<ApiResponse<SysRole[]>> {
  return get<ApiResponse<SysRole[]>>('/api/admin/system/role/all')
}

/**
 * 获取角色列表
 */
export async function getRoleList(
  pageNum: number = 1,
  pageSize: number = 10,
  keyword?: string
): Promise<ApiResponse<PageResponse<SysRole>>> {
  const params = new URLSearchParams()
  params.append('pageNum', pageNum.toString())
  params.append('pageSize', pageSize.toString())
  if (keyword) {
    params.append('keyword', keyword)
  }
  return get<ApiResponse<PageResponse<SysRole>>>(`/api/admin/system/role/list?${params.toString()}`)
}

/**
 * 获取用户的角色列表
 */
export async function getRolesByUserId(userId: number): Promise<ApiResponse<SysRole[]>> {
  return get<ApiResponse<SysRole[]>>(`/api/admin/system/role/user/${userId}`)
}

// ======== 字典管理 API ========

/**
 * 后端字典类型
 */
export interface SysDictType {
  id: number
  dictName: string
  dictCode: string
  status: string // ACTIVE-启用, DISABLED-禁用
  isSystem?: boolean
  remark?: string
  createTime?: string
  updateTime?: string
}

/**
 * 后端字典数据
 */
export interface SysDictData {
  id: number
  dictTypeId: number
  dictLabel: string
  dictValue: string
  sortOrder: number
  status: string // ACTIVE-启用, DISABLED-禁用
  createTime?: string
  updateTime?: string
}

/**
 * 获取字典类型列表
 */
export async function getDictTypeList(
  pageNum: number = 1,
  pageSize: number = 10,
  keyword?: string
): Promise<ApiResponse<PageResponse<SysDictType>>> {
  const params = new URLSearchParams()
  params.append('pageNum', pageNum.toString())
  params.append('pageSize', pageSize.toString())
  if (keyword) {
    params.append('keyword', keyword)
  }
  return get<ApiResponse<PageResponse<SysDictType>>>(`/api/admin/system/dict-type/list?${params.toString()}`)
}

/**
 * 获取所有启用的字典类型
 */
export async function getAllDictTypes(): Promise<ApiResponse<SysDictType[]>> {
  return get<ApiResponse<SysDictType[]>>('/api/admin/system/dict-type/all')
}

/**
 * 获取字典类型详情
 */
export async function getDictTypeById(dictId: number): Promise<ApiResponse<SysDictType>> {
  return get<ApiResponse<SysDictType>>(`/api/admin/system/dict-type/${dictId}`)
}

/**
 * 删除字典类型
 */
export async function deleteDictType(dictId: number): Promise<ApiResponse<void>> {
  return del<ApiResponse<void>>(`/api/admin/system/dict-type/${dictId}`)
}

/**
 * 获取字典数据列表
 */
export async function getDictDataList(
  dictTypeId: number
): Promise<ApiResponse<SysDictData[]>> {
  return get<ApiResponse<SysDictData[]>>(`/api/admin/system/dict-data/${dictTypeId}/list`)
}
