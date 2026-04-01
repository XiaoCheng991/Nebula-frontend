/**
 * 后台管理 API 模块（Supabase 模式）
 *
 * 所有 API 都直接查询 Supabase 数据库，不再经过 Java 后端
 * 使用最新的 Supabase SDK v2 模式
 */

import { supabase } from '@/lib/supabase/client'
import type { ApiResponse } from '../types'

// ======== 类型定义 ========

/**
 * 后端系统用户
 */
export interface SysUser {
  id: number | string
  username: string
  email?: string
  phone?: string
  nickname?: string
  avatarName?: string
  avatarUrl?: string
  avatarSize?: number
  bio?: string
  onlineStatus?: string
  accountStatus: number // 0-禁用，1-启用
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
  status: string // ACTIVE-启用，DISABLED-禁用
  createTime?: string
  updateTime?: string
}

/**
 * 后端系统菜单
 */
export interface SysMenu {
  id: number
  parentId?: number
  menuType: string // directory-目录，menu-菜单，button-按钮
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

// ======== 辅助函数：构建 ApiResponse ========

function buildResponse<T>(data: T, code: number = 200, message: string = 'success'): ApiResponse<T> {
  return {
    code,
    message,
    data,
    timestamp: Date.now(),
  }
}

function buildPageResponse<T>(records: T[], total: number): ApiResponse<{
  records: T[]
  total: number
  pages: number
  current: number
  size: number
}> {
  const pages = Math.ceil(total / 10) // 默认 pageSize 为 10
  return buildResponse({
    records,
    total,
    pages,
    current: 1,
    size: records.length,
  })
}

// ======== 用户管理 API ========

/**
 * 获取当前登录用户信息（从 Supabase Auth + sys_users 表）
 */
export async function getCurrentAdminUser(): Promise<ApiResponse<SysUser>> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return buildResponse(null as any, 401, '未登录')
  }

  // 从 Auth 获取用户信息
  const { data: { user }, error: userError } = await supabase.auth.getUser()

  if (userError || !user) {
    return buildResponse(null as any, 404, '用户不存在')
  }

  // 尝试从 sys_users 表获取用户信息
  let sysUserData: any = null
  if (user.email) {
    const { data: sysUser } = await supabase
      .from('sys_users')
      .select('*')
      .eq('email', user.email)
      .maybeSingle()

    sysUserData = sysUser
  }

  // 如果 sys_users 中没有记录，返回错误
  if (!sysUserData) {
    return buildResponse(null as any, 404, '用户信息不存在，请先在 sys_users 表中创建记录')
  }

  // 转换为 SysUser 格式
  return buildResponse({
    id: sysUserData.id,
    username: sysUserData.username || '',
    email: sysUserData.email || '',
    nickname: sysUserData.nickname || '',
    avatarName: sysUserData.avatar_url || sysUserData.avatar_name || '',
    avatarUrl: sysUserData.avatar_url || '',
    accountStatus: sysUserData.account_status ?? 1,
    lastLoginAt: sysUserData.last_login_at || sysUserData.lastSignInAt,
    lastSeenAt: sysUserData.last_seen_at || sysUserData.lastSeenAt,
    createTime: sysUserData.create_time || sysUserData.createdAt,
    updateTime: sysUserData.update_time || sysUserData.updatedAt,
    bio: sysUserData.bio || '',
    phone: sysUserData.phone || '',
  })
}

/**
 * 获取用户列表（从 Supabase sys_users 表）
 */
export async function getUserList(
  pageNum: number = 1,
  pageSize: number = 10,
  keyword?: string
): Promise<ApiResponse<{ records: SysUser[]; total: number; pages: number; current: number; size: number }>> {
  let query = supabase
    .from('sys_users')
    .select('*', { count: 'exact' })
    .order('create_time', { ascending: false })

  // 关键词搜索
  if (keyword) {
    query = query.or(`username.ilike.%${keyword},email.ilike.%${keyword},nickname.ilike.%${keyword}`)
  }

  const { data: users, error, count } = await query

  if (error) {
    return buildResponse(null as any, 500, '获取用户列表失败')
  }

  // 显式类型转换
  const sysUsers = (users || []) as SysUser[]
  return buildPageResponse(sysUsers, count || 0)
}

/**
 * 获取用户详情
 * 支持传入：number 类型 user_id、字符串 user_id、或 email
 */
export async function getUserById(userId: number | string): Promise<ApiResponse<SysUser>> {
  // 如果传入的是 number 类型，直接使用
  if (typeof userId === 'number') {
    const { data: user, error } = await supabase
      .from('sys_users')
      .select('*')
      .eq('id', userId)
      .maybeSingle()

    if (error || !user) {
      return buildResponse(null as any, 404, '用户不存在')
    }

    return buildResponse(user as SysUser)
  }

  // 如果是字符串，先尝试作为 number 解析
  const numericId = parseInt(userId, 10)
  if (!isNaN(numericId)) {
    const { data: user, error } = await supabase
      .from('sys_users')
      .select('*')
      .eq('id', numericId)
      .maybeSingle()

    if (error || !user) {
      return buildResponse(null as any, 404, '用户不存在')
    }

    return buildResponse(user as SysUser)
  }

  // 否则作为邮箱查询
  const { data: user, error } = await supabase
    .from('sys_users')
    .select('*')
    .eq('email', userId)
    .maybeSingle()

  if (error || !user) {
    return buildResponse(null as any, 404, '用户不存在')
  }

  return buildResponse(user as SysUser)
}

/**
 * 辅助函数：通过 user_id (number) 或 email 获取 number 类型的 user_id
 */
async function getNumericUserId(userId: number | string): Promise<number | null> {
  // 如果已经是 number 类型，直接返回
  if (typeof userId === 'number') {
    return userId
  }

  // 如果是字符串，尝试转换为 number
  const numericId = parseInt(userId, 10)
  if (!isNaN(numericId)) {
    return numericId
  }

  // 如果转换失败，可能是 UUID 或邮箱，尝试通过邮箱查询
  // 先尝试作为邮箱查询
  const { data: user } = await supabase
    .from('sys_users')
    .select('id')
    .eq('email', userId)
    .maybeSingle()

  return user?.id || null
}

/**
 * 获取用户的角色 ID 列表
 * 支持传入：number 类型 user_id、字符串 user_id、或 email
 */
export async function getUserRoleIds(userId: number | string): Promise<ApiResponse<number[]>> {
  const numericUserId = await getNumericUserId(userId)

  if (!numericUserId) {
    return buildResponse([], 404, '用户不存在')
  }

  const { data: userRoles, error } = await supabase
    .from('sys_user_role')
    .select('role_id')
    .eq('user_id', numericUserId)

  if (error) {
    return buildResponse(null as any, 500, '获取用户角色失败')
  }

  const roleIds = userRoles?.map(ur => ur.role_id) || []
  return buildResponse(roleIds)
}

/**
 * 编辑用户
 */
export async function updateUser(user: Partial<SysUser>): Promise<ApiResponse<void>> {
  // 检查 user.id 是否存在
  if (!user.id) {
    return buildResponse(undefined, 400, '用户 ID 不能为空')
  }

  // 确保 user.id 是 number 类型
  const numericUserId = typeof user.id === 'string' ? parseInt(user.id, 10) : user.id

  if (isNaN(numericUserId)) {
    return buildResponse(undefined, 400, '无效的用户 ID')
  }

  // 构建更新数据
  const updateData: Record<string, any> = {}
  if (user.username !== undefined) updateData.username = user.username
  if (user.email !== undefined) updateData.email = user.email
  if (user.phone !== undefined) updateData.phone = user.phone
  if (user.nickname !== undefined) updateData.nickname = user.nickname
  if (user.avatarUrl !== undefined) updateData.avatar_url = user.avatarUrl
  if (user.avatarName !== undefined) updateData.avatar_name = user.avatarName
  if (user.avatarSize !== undefined) updateData.avatar_size = user.avatarSize
  if (user.bio !== undefined) updateData.bio = user.bio
  if (user.onlineStatus !== undefined) updateData.online_status = user.onlineStatus
  if (user.accountStatus !== undefined) updateData.account_status = user.accountStatus
  if (user.lastLoginAt !== undefined) updateData.last_login_at = user.lastLoginAt
  if (user.lastSeenAt !== undefined) updateData.last_seen_at = user.lastSeenAt

  const { error } = await supabase
    .from('sys_users')
    .update(updateData)
    .eq('id', numericUserId)

  if (error) {
    return buildResponse(undefined, 500, '更新用户失败')
  }

  return buildResponse(undefined)
}

/**
 * 修改用户状态
 * 支持传入：number 类型 user_id、字符串 user_id、或 email
 */
export async function updateUserStatus(userId: number | string, status: number): Promise<ApiResponse<void>> {
  const numericUserId = await getNumericUserId(userId)

  if (!numericUserId) {
    return buildResponse(undefined, 404, '用户不存在')
  }

  const { error } = await supabase
    .from('sys_users')
    .update({ account_status: status })
    .eq('id', numericUserId)

  if (error) {
    return buildResponse(undefined, 500, '更新用户状态失败')
  }

  return buildResponse(undefined)
}

/**
 * 分配角色给用户
 * 支持传入：number 类型 user_id、字符串 user_id、或 email
 */
export async function assignRolesToUser(userId: number | string, roleIds: number[]): Promise<ApiResponse<void>> {
  const numericUserId = await getNumericUserId(userId)

  if (!numericUserId) {
    return buildResponse(undefined, 404, '用户不存在')
  }

  // 先删除原有角色
  await supabase
    .from('sys_user_role')
    .delete()
    .eq('user_id', numericUserId)

  // 插入新角色
  if (roleIds.length > 0) {
    const userRoles = roleIds.map(roleId => ({
      user_id: numericUserId,
      role_id: roleId,
      created_at: new Date().toISOString(),
    }))

    const { error } = await supabase
      .from('sys_user_role')
      .insert(userRoles)

    if (error) {
      return buildResponse(undefined, 500, '分配角色失败')
    }
  }

  return buildResponse(undefined)
}

/**
 * 删除用户
 * 支持传入：number 类型 user_id、字符串 user_id、或 email
 */
export async function deleteUser(userId: number | string): Promise<ApiResponse<void>> {
  const numericUserId = await getNumericUserId(userId)

  if (!numericUserId) {
    return buildResponse(undefined, 404, '用户不存在')
  }
  const { error } = await supabase
    .from('sys_users')
    .delete()
    .eq('id', numericUserId)

  if (error) {
    return buildResponse(undefined, 500, '删除用户失败')
  }

  return buildResponse(undefined)
}

// ======== 菜单管理 API ========

/**
 * 获取当前用户的菜单树（根据用户角色通过 sys_role_menu 表关联）
 */
export async function getCurrentUserMenus(): Promise<ApiResponse<SysMenu[]>> {
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    return buildResponse([], 401, '未登录')
  }

  // 1. 获取当前用户的邮箱
  const userEmail = session.user.email
  if (!userEmail) {
    return buildResponse([], 400, '用户邮箱不存在')
  }

  // 2. 获取用户的 number 类型 ID
  const { data: sysUser } = await supabase
    .from('sys_users')
    .select('id')
    .eq('email', userEmail)
    .maybeSingle()

  if (!sysUser) {
    return buildResponse([], 404, '用户不存在')
  }

  const userId = sysUser.id

  // 3. 获取用户的所有角色 ID（通过 sys_user_role 表）
  const { data: userRoles } = await supabase
    .from('sys_user_role')
    .select('role_id')
    .eq('user_id', userId)

  if (!userRoles || userRoles.length === 0) {
    return buildResponse([], 200) // 用户没有角色，返回空菜单
  }

  const roleIds = userRoles.map(ur => ur.role_id)

  // 4. 获取角色关联的所有菜单 ID（通过 sys_role_menu 表）
  const { data: roleMenus } = await supabase
    .from('sys_role_menu')
    .select('menu_id')
    .in('role_id', roleIds)

  if (!roleMenus || roleMenus.length === 0) {
    return buildResponse([], 200) // 角色没有关联菜单，返回空菜单
  }

  const menuIds = [...new Set(roleMenus.map(rm => rm.menu_id))] // 去重

  // 5. 获取所有菜单详情
  const { data: allMenus, error: menusError } = await supabase
    .from('sys_menus')
    .select('*')
    .in('id', menuIds)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (menusError) {
    console.error('获取菜单失败:', menusError)
    return buildResponse([], 500, '获取菜单失败')
  }

  const menuList = (allMenus || []) as SysMenu[]

  // 6. 构建树形结构
  function buildTree(parentId: number | null): SysMenu[] {
    return menuList
      .filter(m => m.parentId === parentId || (parentId === null && (m.parentId === 0 || !m.parentId)))
      .map(m => ({
        ...m,
        children: buildTree(m.id),
      }))
  }

  return buildResponse(buildTree(null))
}

/**
 * 获取菜单列表
 */
export async function getMenuList(): Promise<ApiResponse<SysMenu[]>> {
  const { data: menus, error } = await supabase
    .from('sys_menus')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return buildResponse([], 500, '获取菜单列表失败')
  }

  return buildResponse((menus || []) as SysMenu[])
}

/**
 * 获取菜单树结构
 */
export async function getMenuTree(): Promise<ApiResponse<SysMenu[]>> {
  const { data: menus, error } = await supabase
    .from('sys_menus')
    .select('*')
    .order('sort_order', { ascending: true })

  if (error) {
    return buildResponse([], 500, '获取菜单树失败')
  }

  const menuList = (menus || []) as SysMenu[]

  function buildTree(parentId: number | null): SysMenu[] {
    return menuList
      .filter(m => m.parentId === parentId || (parentId === null && (m.parentId === 0 || !m.parentId)))
      .map(m => ({
        ...m,
        children: buildTree(m.id),
      }))
  }

  return buildResponse(buildTree(null))
}

// ======== 角色管理 API ========

/**
 * 获取所有启用角色
 */
export async function getAllRoles(): Promise<ApiResponse<SysRole[]>> {
  const { data: roles, error } = await supabase
    .from('sys_role')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('sort_order', { ascending: true })

  if (error) {
    return buildResponse([], 500, '获取角色列表失败')
  }

  return buildResponse((roles || []) as SysRole[])
}

/**
 * 获取角色列表
 */
export async function getRoleList(
  pageNum: number = 1,
  pageSize: number = 10,
  keyword?: string
): Promise<ApiResponse<{ records: SysRole[]; total: number; pages: number; current: number; size: number }>> {
  let query = supabase
    .from('sys_role')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // 关键词搜索
  if (keyword) {
    query = query.or(`role_name.ilike.%${keyword},role_code.ilike.%${keyword}`)
  }

  const { data: roles, error, count } = await query

  if (error) {
    return buildResponse(null as any, 500, '获取角色列表失败')
  }

  return buildPageResponse((roles || []) as SysRole[], count || 0)
}

/**
 * 获取用户的角色列表
 * 支持传入：number 类型 user_id、字符串 user_id、或 email
 */
export async function getRolesByUserId(userId: number | string): Promise<ApiResponse<SysRole[]>> {
  const numericUserId = await getNumericUserId(userId)

  console.log('[getRolesByUserId] 输入 userId:', userId, '解析后的 numericUserId:', numericUserId)

  if (!numericUserId) {
    return buildResponse([], 404, '用户不存在')
  }

  const { data: userRoles, error: userRoleError } = await supabase
    .from('sys_user_role')
    .select('role_id')
    .eq('user_id', numericUserId)

  console.log('[getRolesByUserId] sys_user_role 查询结果:', { userRoles, error: userRoleError })

  if (userRoleError) {
    return buildResponse([], 500, '获取用户角色失败')
  }

  const roleIds = userRoles?.map(ur => ur.role_id) || []
  console.log('[getRolesByUserId] 提取的 roleIds:', roleIds)

  if (roleIds.length === 0) {
    console.warn('[getRolesByUserId] roleIds 为空，用户可能没有分配任何角色')
    return buildResponse([])
  }

  const { data: roles, error: roleError } = await supabase
    .from('sys_role')
    .select('*')
    .in('id', roleIds)

  if (roleError) {
    return buildResponse([], 500, '获取角色详情失败')
  }

  return buildResponse((roles || []) as SysRole[])
}

// ======== 字典类型管理 API ========

/**
 * 后端字典类型
 */
export interface SysDictType {
  id: number
  dictName: string
  dictCode: string
  status: string // ACTIVE-启用，DISABLED-禁用
  isSystem?: boolean
  remark?: string
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
): Promise<ApiResponse<{ records: SysDictType[]; total: number; pages: number; current: number; size: number }>> {
  let query = supabase
    .from('sys_dict_type')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })

  // 关键词搜索
  if (keyword) {
    query = query.or(`dict_name.ilike.%${keyword},dict_code.ilike.%${keyword}`)
  }

  const { data: dictTypes, error, count } = await query

  if (error) {
    return buildResponse(null as any, 500, '获取字典类型列表失败')
  }

  return buildPageResponse((dictTypes || []) as SysDictType[], count || 0)
}

/**
 * 获取所有启用的字典类型
 */
export async function getAllDictTypes(): Promise<ApiResponse<SysDictType[]>> {
  const { data: dictTypes, error } = await supabase
    .from('sys_dict_type')
    .select('*')
    .eq('status', 'ACTIVE')
    .order('sort_order', { ascending: true })

  if (error) {
    return buildResponse([], 500, '获取字典类型失败')
  }

  return buildResponse((dictTypes || []) as SysDictType[])
}

/**
 * 获取字典类型详情
 */
export async function getDictTypeById(dictId: number): Promise<ApiResponse<SysDictType>> {
  const { data: dictType, error } = await supabase
    .from('sys_dict_type')
    .select('*')
    .eq('id', dictId)
    .single()

  if (error || !dictType) {
    return buildResponse(null as any, 404, '字典类型不存在')
  }

  return buildResponse(dictType as SysDictType)
}

/**
 * 删除字典类型
 */
export async function deleteDictType(dictId: number): Promise<ApiResponse<void>> {
  const { error } = await supabase
    .from('sys_dict_type')
    .delete()
    .eq('id', dictId)

  if (error) {
    return buildResponse(undefined, 500, '删除字典类型失败')
  }

  return buildResponse(undefined)
}

/**
 * 新增字典类型
 */
export async function addDictType(data: Partial<SysDictType>): Promise<ApiResponse<void>> {
  // 检查必填字段
  if (!data.dictName || !data.dictCode || !data.status) {
    return buildResponse(undefined, 400, '字典名称、字典代码和状态为必填项')
  }

  // 构建插入数据
  const insertData: {
    dict_name: string
    dict_code: string
    status: string
    is_system?: boolean
    remark?: string
  } = {
    dict_name: data.dictName!,
    dict_code: data.dictCode!,
    status: data.status!,
  }

  if (data.isSystem !== undefined) insertData.is_system = data.isSystem
  if (data.remark !== undefined) insertData.remark = data.remark

  const { error } = await supabase
    .from('sys_dict_type')
    .insert([insertData])

  if (error) {
    return buildResponse(undefined, 500, '新增字典类型失败')
  }

  return buildResponse(undefined)
}

/**
 * 更新字典类型
 */
export async function updateDictType(data: Partial<SysDictType>): Promise<ApiResponse<void>> {
  if (!data.id) {
    return buildResponse(undefined, 400, '字典类型 ID 不能为空')
  }

  const { error } = await supabase
    .from('sys_dict_type')
    .update(data)
    .eq('id', data.id)

  if (error) {
    return buildResponse(undefined, 500, '更新字典类型失败')
  }

  return buildResponse(undefined)
}

// ======== 字典数据管理 API ========

/**
 * 后端字典数据
 */
export interface SysDictData {
  id: number
  dictTypeId: number
  dictLabel: string
  dictValue: string
  sortOrder: number
  status: string // ACTIVE-启用，DISABLED-禁用
  isDefault?: boolean
  remark?: string
  createTime?: string
  updateTime?: string
}

/**
 * 获取字典数据列表（分页）
 */
export async function getDictDataList(
  dictTypeId: number,
  pageNum: number = 1,
  pageSize: number = 10,
): Promise<ApiResponse<{ records: SysDictData[]; total: number; pages: number; current: number; size: number }>> {
  const { data: dictData, error, count } = await supabase
    .from('sys_dict_data')
    .select('*', { count: 'exact' })
    .eq('dict_type_id', dictTypeId)
    .order('sort_order', { ascending: true })

  if (error) {
    return buildResponse(null as any, 500, '获取字典数据失败')
  }

  return buildPageResponse((dictData || []) as SysDictData[], count || 0)
}

/**
 * 新增字典数据
 */
export async function addDictData(data: Partial<SysDictData>): Promise<ApiResponse<void>> {
  // 检查必填字段
  if (data.dictTypeId === undefined || !data.dictLabel || !data.dictValue || !data.status) {
    return buildResponse(undefined, 400, '字典类型 ID、字典标签、字典值和状态为必填项')
  }

  // 构建插入数据
const insertData: {
  dict_type_id: number
  dict_label: string
  dict_value: string
  sort_order: number
  status: string
  is_default?: boolean
  remark?: string
} = {
  dict_type_id: data.dictTypeId!,
  dict_label: data.dictLabel!,
  dict_value: data.dictValue!,
  sort_order: data.sortOrder ?? 0,
  status: data.status!,
}
  if (data.sortOrder !== undefined) insertData.sort_order = data.sortOrder
  if (data.isDefault !== undefined) insertData.is_default = data.isDefault
  if (data.remark !== undefined) insertData.remark = data.remark

  const { error } = await supabase
    .from('sys_dict_data')
    .insert([insertData])

  if (error) {
    return buildResponse(undefined, 500, '新增字典数据失败')
  }

  return buildResponse(undefined)
}

/**
 * 更新字典数据
 */
export async function updateDictData(data: Partial<SysDictData>): Promise<ApiResponse<void>> {
  if (!data.id) {
    return buildResponse(undefined, 400, '字典数据 ID 不能为空')
  }

  const { error } = await supabase
    .from('sys_dict_data')
    .update(data)
    .eq('id', data.id)

  if (error) {
    return buildResponse(undefined, 500, '更新字典数据失败')
  }

  return buildResponse(undefined)
}

/**
 * 删除字典数据
 */
export async function deleteDictData(dictDataId: number): Promise<ApiResponse<void>> {
  const { error } = await supabase
    .from('sys_dict_data')
    .delete()
    .eq('id', dictDataId)

  if (error) {
    return buildResponse(undefined, 500, '删除字典数据失败')
  }

  return buildResponse(undefined)
}
