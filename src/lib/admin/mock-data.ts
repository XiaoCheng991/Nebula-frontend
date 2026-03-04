// src/lib/admin/mock-data.ts

import {
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminMenu,
  Dictionary,
  OperationLog,
} from './types'

// ======== Mock 用户 ========
export const mockUsers: AdminUser[] = [
  {
    id: 1,
    username: 'admin',
    displayName: '超级管理员',
    email: 'admin@nebulahub.com',
    avatar: '',
    status: 'active',
    roleIds: [1],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    username: 'manager',
    displayName: '运营经理',
    email: 'manager@nebulahub.com',
    avatar: '',
    status: 'active',
    roleIds: [2],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 3,
    username: 'editor',
    displayName: '内容编辑',
    email: 'editor@nebulahub.com',
    avatar: '',
    status: 'active',
    roleIds: [3],
    createdAt: '2024-02-01T00:00:00Z',
  },
]

// ======== Mock 角色 ========
export const mockRoles: AdminRole[] = [
  {
    id: 1,
    name: '超级管理员',
    code: 'super_admin',
    description: '拥有所有权限',
    permissionCodes: ['*'],
    menuIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '运营经理',
    code: 'operation_manager',
    description: '管理用户、内容和IM',
    permissionCodes: [
      'user:view', 'user:edit',
      'blog:view', 'blog:edit', 'blog:delete',
      'im:view', 'im:edit',
    ],
    menuIds: [1, 2, 5, 8, 9],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 3,
    name: '内容编辑',
    code: 'content_editor',
    description: '仅管理博客内容',
    permissionCodes: ['blog:view', 'blog:edit'],
    menuIds: [1, 5],
    createdAt: '2024-01-01T00:00:00Z',
  },
]

// ======== Mock 权限 ========
export const mockPermissions: AdminPermission[] = [
  { id: 1, name: '用户查看', code: 'user:view', type: 'page', path: '/admin/users' },
  { id: 2, name: '用户编辑', code: 'user:edit', type: 'button' },
  { id: 3, name: '用户删除', code: 'user:delete', type: 'button' },
  { id: 4, name: '角色管理', code: 'role:manage', type: 'page', path: '/admin/roles' },
  { id: 5, name: '权限管理', code: 'permission:manage', type: 'page', path: '/admin/permissions' },
  { id: 6, name: '菜单管理', code: 'menu:manage', type: 'page', path: '/admin/menus' },
  { id: 7, name: '字典管理', code: 'dict:manage', type: 'page', path: '/admin/dictionaries' },
  { id: 8, name: '日志查看', code: 'log:view', type: 'page', path: '/admin/logs' },
  { id: 9, name: '系统设置', code: 'system:settings', type: 'page', path: '/admin/settings' },
  { id: 10, name: '博客查看', code: 'blog:view', type: 'page', path: '/admin/blog/posts' },
  { id: 11, name: '博客编辑', code: 'blog:edit', type: 'button' },
  { id: 12, name: '博客删除', code: 'blog:delete', type: 'button' },
  { id: 13, name: 'IM查看', code: 'im:view', type: 'page', path: '/admin/im/messages' },
  { id: 14, name: 'IM编辑', code: 'im:edit', type: 'button' },
]

// ======== Mock 菜单 ========
export const mockMenus: AdminMenu[] = [
  {
    id: 1,
    name: '仪表盘',
    path: '/admin',
    icon: 'LayoutDashboard',
    sortOrder: 1,
    type: 'menu',
    permissionCode: 'dashboard:view',
  },
  {
    id: 2,
    name: '系统管理',
    icon: 'Settings',
    sortOrder: 2,
    type: 'directory',
    children: [
      {
        id: 3,
        parentId: 2,
        name: '用户管理',
        path: '/admin/users',
        icon: 'Users',
        sortOrder: 1,
        type: 'menu',
        permissionCode: 'user:view',
      },
      {
        id: 4,
        parentId: 2,
        name: '角色管理',
        path: '/admin/roles',
        icon: 'Shield',
        sortOrder: 2,
        type: 'menu',
        permissionCode: 'role:manage',
      },
      {
        id: 5,
        parentId: 2,
        name: '权限管理',
        path: '/admin/permissions',
        icon: 'Key',
        sortOrder: 3,
        type: 'menu',
        permissionCode: 'permission:manage',
      },
      {
        id: 6,
        parentId: 2,
        name: '菜单管理',
        path: '/admin/menus',
        icon: 'Menu',
        sortOrder: 4,
        type: 'menu',
        permissionCode: 'menu:manage',
      },
      {
        id: 7,
        parentId: 2,
        name: '字典配置',
        path: '/admin/dictionaries',
        icon: 'BookOpen',
        sortOrder: 5,
        type: 'menu',
        permissionCode: 'dict:manage',
      },
      {
        id: 8,
        parentId: 2,
        name: '操作日志',
        path: '/admin/logs',
        icon: 'FileText',
        sortOrder: 6,
        type: 'menu',
        permissionCode: 'log:view',
      },
      {
        id: 9,
        parentId: 2,
        name: '系统设置',
        path: '/admin/settings',
        icon: 'Cog',
        sortOrder: 7,
        type: 'menu',
        permissionCode: 'system:settings',
      },
    ],
  },
  {
    id: 10,
    name: '博客管理',
    icon: 'FileText',
    sortOrder: 3,
    type: 'directory',
    children: [
      {
        id: 11,
        parentId: 10,
        name: '文章管理',
        path: '/admin/blog/posts',
        icon: 'PenTool',
        sortOrder: 1,
        type: 'menu',
        permissionCode: 'blog:view',
      },
      {
        id: 12,
        parentId: 10,
        name: '分类管理',
        path: '/admin/blog/categories',
        icon: 'Folder',
        sortOrder: 2,
        type: 'menu',
        permissionCode: 'blog:view',
      },
      {
        id: 13,
        parentId: 10,
        name: '标签管理',
        path: '/admin/blog/tags',
        icon: 'Tag',
        sortOrder: 3,
        type: 'menu',
        permissionCode: 'blog:view',
      },
      {
        id: 14,
        parentId: 10,
        name: '评论管理',
        path: '/admin/blog/comments',
        icon: 'MessageSquare',
        sortOrder: 4,
        type: 'menu',
        permissionCode: 'blog:view',
      },
    ],
  },
  {
    id: 15,
    name: 'IM管理',
    icon: 'MessageCircle',
    sortOrder: 4,
    type: 'directory',
    children: [
      {
        id: 16,
        parentId: 15,
        name: '消息管理',
        path: '/admin/im/messages',
        icon: 'Mail',
        sortOrder: 1,
        type: 'menu',
        permissionCode: 'im:view',
      },
      {
        id: 17,
        parentId: 15,
        name: '聊天室管理',
        path: '/admin/im/rooms',
        icon: 'Users',
        sortOrder: 2,
        type: 'menu',
        permissionCode: 'im:view',
      },
      {
        id: 18,
        parentId: 15,
        name: '敏感词管理',
        path: '/admin/im/sensitive-words',
        icon: 'AlertTriangle',
        sortOrder: 3,
        type: 'menu',
        permissionCode: 'im:edit',
      },
      {
        id: 19,
        parentId: 15,
        name: '禁言管理',
        path: '/admin/im/bans',
        icon: 'Ban',
        sortOrder: 4,
        type: 'menu',
        permissionCode: 'im:edit',
      },
    ],
  },
]

// ======== Mock 字典 ========
export const mockDictionaries: Dictionary[] = [
  {
    id: 1,
    code: 'user_status',
    name: '用户状态',
    type: 'data',
    items: [
      { id: 1, label: '正常', value: 'active', sortOrder: 1, status: 'enabled' },
      { id: 2, label: '禁用', value: 'disabled', sortOrder: 2, status: 'enabled' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    code: 'admin_routes',
    name: '后台路由配置',
    type: 'config',
    items: [
      { id: 1, label: '用户管理', value: '/admin/users', sortOrder: 1, status: 'enabled' },
      { id: 2, label: '角色管理', value: '/admin/roles', sortOrder: 2, status: 'enabled' },
    ],
    createdAt: '2024-01-01T00:00:00Z',
  },
]

// ======== Mock 操作日志 ========
export const mockLogs: OperationLog[] = [
  {
    id: 1,
    userId: 1,
    username: 'admin',
    operation: '用户登录',
    method: 'POST',
    params: '{"username":"admin"}',
    ip: '127.0.0.1',
    status: 'success',
    createdAt: '2024-03-04T10:00:00Z',
  },
  {
    id: 2,
    userId: 1,
    username: 'admin',
    operation: '查看用户列表',
    method: 'GET',
    ip: '127.0.0.1',
    status: 'success',
    createdAt: '2024-03-04T10:05:00Z',
  },
]

// ======== Helper 函数 ========

// 获取当前用户（根据 localStorage 中的用户信息判断）
export function getCurrentUser(): AdminUser | null {
  if (typeof window === 'undefined') return null
  // 暂时返回 admin 用户
  return mockUsers[0]
}

// 获取用户的角色
export function getUserRoles(userId: number): AdminRole[] {
  const user = mockUsers.find(u => u.id === userId)
  if (!user) return []
  return mockRoles.filter(r => user.roleIds.includes(r.id))
}

// 获取用户的权限
export function getUserPermissions(userId: number): AdminPermission[] {
  const roles = getUserRoles(userId)
  const permissionCodes = new Set<string>()

  for (const role of roles) {
    if (role.permissionCodes.includes('*')) {
      return mockPermissions
    }
    role.permissionCodes.forEach(code => permissionCodes.add(code))
  }

  return mockPermissions.filter(p => permissionCodes.has(p.code))
}

// 获取用户的菜单
export function getUserMenus(userId: number): AdminMenu[] {
  const roles = getUserRoles(userId)
  const menuIds = new Set<number>()

  for (const role of roles) {
    role.menuIds.forEach(id => menuIds.add(id))
  }

  // 过滤并构建菜单树
  function filterMenus(menus: AdminMenu[]): AdminMenu[] {
    return menus
      .filter(menu => menuIds.has(menu.id))
      .map(menu => ({
        ...menu,
        children: menu.children ? filterMenus(menu.children) : undefined,
      }))
      .filter(menu => menu.type !== 'button')
  }

  return filterMenus(mockMenus)
}
