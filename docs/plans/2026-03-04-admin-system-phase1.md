# 后台管理系统 - 第一阶段实施计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 搭建后台管理系统基础架构，包括布局、路由、状态管理和Mock数据

**Architecture:** 使用 Next.js App Router + shadcn/ui + Zustand，采用经典的左侧侧边栏布局，先使用Mock数据进行开发，后续对接后端API

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Zustand, Lucide React

---

## 前置准备

### Task 0: 安装必要依赖

**Files:**
- Modify: `package.json`
- Install: `@tanstack/react-table`

**Step 1: 检查并安装 @tanstack/react-table**

Run:
```bash
npm install @tanstack/react-table
```

**Step 2: 添加需要的 shadcn/ui 组件**

Run:
```bash
npx shadcn-ui@latest add table
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add checkbox
npx shadcn-ui@latest add pagination
npx shadcn-ui@latest add badge
npx shadcn-ui@latest add avatar
npx shadcn-ui@latest add sheet
npx shadcn-ui@latest add tooltip
```

**Step 3: 确认依赖安装成功**

Run: `npm list @tanstack/react-table`
Expected: 显示已安装的版本号

**Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "feat: add tanstack react-table and shadcn/ui components for admin"
```

---

## 第一阶段：基础架构搭建

### Task 1: 创建后台类型定义

**Files:**
- Create: `src/lib/admin/types.ts`

**Step 1: 创建类型定义文件**

```typescript
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
```

**Step 2: 确认文件创建成功**

Run: `ls -la src/lib/admin/types.ts`
Expected: 文件存在

**Step 3: Commit**

```bash
git add src/lib/admin/types.ts
git commit -m "feat: add admin system type definitions"
```

---

### Task 2: 创建 Mock 数据

**Files:**
- Create: `src/lib/admin/mock-data.ts`

**Step 1: 创建 Mock 数据文件**

```typescript
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
```

**Step 2: 确认文件创建成功**

Run: `ls -la src/lib/admin/mock-data.ts`
Expected: 文件存在

**Step 3: Commit**

```bash
git add src/lib/admin/mock-data.ts
git commit -m "feat: add admin mock data"
```

---

### Task 3: 创建 Admin Zustand Store

**Files:**
- Create: `src/hooks/useAdminStore.ts`

**Step 1: 创建 Admin Store**

```typescript
// src/hooks/useAdminStore.ts

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  AdminState,
  AdminUser,
  AdminRole,
  AdminPermission,
  AdminMenu,
  Dictionary,
} from '@/lib/admin/types'
import {
  getCurrentUser,
  getUserRoles,
  getUserPermissions,
  getUserMenus,
  mockDictionaries,
} from '@/lib/admin/mock-data'

export const useAdminStore = create<AdminState>()(
  persist(
    (set, get) => ({
      // 初始状态
      user: null,
      roles: [],
      permissions: [],
      menus: [],
      dictionaries: [],
      isLoading: false,
      hasAdminAccess: false,

      // Actions
      setUser: (user: AdminUser | null) => set({ user }),
      setRoles: (roles: AdminRole[]) => set({ roles }),
      setPermissions: (permissions: AdminPermission[]) => set({ permissions }),
      setMenus: (menus: AdminMenu[]) => set({ menus }),
      setDictionaries: (dictionaries: Dictionary[]) => set({ dictionaries }),
      setLoading: (isLoading: boolean) => set({ isLoading }),
      setHasAdminAccess: (hasAdminAccess: boolean) => set({ hasAdminAccess }),

      loadAdminData: async () => {
        set({ isLoading: true })
        try {
          // 使用 mock 数据
          const user = getCurrentUser()
          if (!user) {
            set({
              user: null,
              roles: [],
              permissions: [],
              menus: [],
              hasAdminAccess: false,
              isLoading: false,
            })
            return
          }

          // 检查用户是否有 admin 角色
          const roles = getUserRoles(user.id)
          const hasAdminAccess = roles.length > 0

          set({
            user,
            roles,
            permissions: getUserPermissions(user.id),
            menus: getUserMenus(user.id),
            dictionaries: mockDictionaries,
            hasAdminAccess,
            isLoading: false,
          })
        } catch (error) {
          console.error('Failed to load admin data:', error)
          set({ isLoading: false, hasAdminAccess: false })
        }
      },

      clearAdminData: () => {
        set({
          user: null,
          roles: [],
          permissions: [],
          menus: [],
          dictionaries: [],
          hasAdminAccess: false,
        })
      },
    }),
    {
      name: 'admin-storage',
      partialize: (state) => ({
        user: state.user,
        roles: state.roles,
        permissions: state.permissions,
        menus: state.menus,
        dictionaries: state.dictionaries,
        hasAdminAccess: state.hasAdminAccess,
      }),
    }
  )
)
```

**Step 2: 确认文件创建成功**

Run: `ls -la src/hooks/useAdminStore.ts`
Expected: 文件存在

**Step 3: Commit**

```bash
git add src/hooks/useAdminStore.ts
git commit -m "feat: add admin zustand store"
```

---

### Task 4: 创建权限检查 Hooks

**Files:**
- Create: `src/hooks/usePermission.ts`

**Step 1: 创建 usePermission Hook**

```typescript
// src/hooks/usePermission.ts

import { useAdminStore } from './useAdminStore'

export function usePermission() {
  const { permissions, roles, hasAdminAccess } = useAdminStore()

  // 检查是否有某个权限
  const hasPermission = (permissionCode: string): boolean => {
    if (!hasAdminAccess) return false

    // 超级管理员权限
    if (permissions.some(p => p.code === '*')) return true

    return permissions.some(p => p.code === permissionCode)
  }

  // 检查是否有任意一个权限
  const hasAnyPermission = (permissionCodes: string[]): boolean => {
    if (!hasAdminAccess) return false
    if (permissionCodes.length === 0) return true
    return permissionCodes.some(code => hasPermission(code))
  }

  // 检查是否有所有权限
  const hasAllPermissions = (permissionCodes: string[]): boolean => {
    if (!hasAdminAccess) return false
    if (permissionCodes.length === 0) return true
    return permissionCodes.every(code => hasPermission(code))
  }

  // 检查是否有某个角色
  const hasRole = (roleCode: string): boolean => {
    if (!hasAdminAccess) return false
    return roles.some(r => r.code === roleCode)
  }

  // 检查是否有任意一个角色
  const hasAnyRole = (roleCodes: string[]): boolean => {
    if (!hasAdminAccess) return false
    if (roleCodes.length === 0) return true
    return roleCodes.some(code => hasRole(code))
  }

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
  }
}
```

**Step 2: 确认文件创建成功**

Run: `ls -la src/hooks/usePermission.ts`
Expected: 文件存在

**Step 3: Commit**

```bash
git add src/hooks/usePermission.ts
git commit -m "feat: add usePermission hook"
```

---

### Task 5: 创建后台侧边栏组件

**Files:**
- Create: `src/components/admin/layout/Sidebar.tsx`

**Step 1: 创建 Sidebar 组件**

```typescript
// src/components/admin/layout/Sidebar.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Settings,
  Users,
  Shield,
  Key,
  Menu,
  BookOpen,
  FileText,
  Cog,
  PenTool,
  Folder,
  Tag,
  MessageSquare,
  MessageCircle,
  Mail,
  AlertTriangle,
  Ban,
  ChevronRight,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/hooks/useAdminStore'
import { AdminMenu as AdminMenuType } from '@/lib/admin/types'

const iconMap: Record<string, React.ElementType> = {
  LayoutDashboard,
  Settings,
  Users,
  Shield,
  Key,
  Menu,
  BookOpen,
  FileText,
  Cog,
  PenTool,
  Folder,
  Tag,
  MessageSquare,
  MessageCircle,
  Mail,
  AlertTriangle,
  Ban,
}

interface MenuItemProps {
  item: AdminMenuType
  level: number
}

const MenuItem: React.FC<MenuItemProps> = ({ item, level }) => {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = React.useState(true)

  const hasChildren = item.children && item.children.length > 0
  const isActive = pathname === item.path
  const Icon = item.icon ? iconMap[item.icon] : null

  if (hasChildren) {
    return (
      <div className="w-full">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex w-full items-center gap-3 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
            level > 0 && 'pl-6'
          )}
        >
          {Icon && <Icon className="h-4 w-4" />}
          <span className="flex-1">{item.name}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400" />
          )}
        </button>
        {isExpanded && (
          <div className="w-full">
            {item.children!.map((child) => (
              <MenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  if (!item.path) return null

  return (
    <Link
      href={item.path}
      className={cn(
        'flex items-center gap-3 px-3 py-2 text-sm font-medium transition-colors',
        level > 0 && 'pl-6',
        isActive
          ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
      )}
    >
      {Icon && <Icon className="h-4 w-4" />}
      <span>{item.name}</span>
    </Link>
  )
}

interface SidebarProps {
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { menus } = useAdminStore()

  return (
    <aside className={cn(
      'flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
      className
    )}>
      {/* Logo 区域 */}
      <div className="flex h-16 items-center border-b border-gray-200 px-4 dark:border-gray-700">
        <Link href="/admin" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-purple-600">
            <span className="text-sm font-bold text-white">N</span>
          </div>
          <span className="text-lg font-bold text-gray-900 dark:text-white">
            NebulaAdmin
          </span>
        </Link>
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menus.map((menu) => (
          <MenuItem key={menu.id} item={menu} level={0} />
        ))}
      </nav>

      {/* 底部区域 */}
      <div className="border-t border-gray-200 p-4 dark:border-gray-700">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronRight className="h-4 w-4" />
          <span>返回前台</span>
        </Link>
      </div>
    </aside>
  )
}
```

**Step 2: 确认文件创建成功**

Run: `ls -la src/components/admin/layout/Sidebar.tsx`
Expected: 文件存在

**Step 3: Commit**

```bash
git add src/components/admin/layout/Sidebar.tsx
git commit -m "feat: add admin sidebar component"
```

---

### Task 6: 创建后台头部组件

**Files:**
- Create: `src/components/admin/layout/AdminHeader.tsx`

**Step 1: 创建 AdminHeader 组件**

```typescript
// src/components/admin/layout/AdminHeader.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useAdminStore } from '@/hooks/useAdminStore'

interface AdminHeaderProps {
  className?: string
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ className }) => {
  const pathname = usePathname()
  const { user } = useAdminStore()

  // 生成面包屑
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    let currentPath = ''
    for (let i = 0; i < paths.length; i++) {
      currentPath += '/' + paths[i]
      const name = getPathName(paths[i])
      breadcrumbs.push({
        name,
        path: currentPath,
        isLast: i === paths.length - 1,
      })
    }

    return breadcrumbs
  }

  const getPathName = (path: string) => {
    const names: Record<string, string> = {
      admin: '后台',
      users: '用户管理',
      roles: '角色管理',
      permissions: '权限管理',
      menus: '菜单管理',
      dictionaries: '字典配置',
      logs: '操作日志',
      settings: '系统设置',
      blog: '博客',
      posts: '文章管理',
      categories: '分类管理',
      tags: '标签管理',
      comments: '评论管理',
      im: 'IM',
      messages: '消息管理',
      rooms: '聊天室管理',
      'sensitive-words': '敏感词管理',
      bans: '禁言管理',
    }
    return names[path] || path
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className={cn(
      'flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6 dark:border-gray-700 dark:bg-gray-900',
      className
    )}>
      {/* 左侧 - 面包屑 */}
      <div className="flex items-center gap-4">
        <Link href="/" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <Home className="h-5 w-5" />
        </Link>
        <nav className="flex items-center gap-2 text-sm">
          {breadcrumbs.map((crumb, index) => (
            <React.Fragment key={crumb.path}>
              {index > 0 && <span className="text-gray-400">/</span>}
              {crumb.isLast ? (
                <span className="font-medium text-gray-900 dark:text-white">
                  {crumb.name}
                </span>
              ) : (
                <Link
                  href={crumb.path}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {crumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>

      {/* 右侧 - 操作区 */}
      <div className="flex items-center gap-4">
        {/* 搜索 */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              type="search"
              placeholder="搜索..."
              className="w-64 pl-10"
            />
          </div>
        </div>

        {/* 通知 */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* 用户 */}
        {user && (
          <Link href="/admin/settings" className="flex items-center gap-2">
            <UserAvatar
              avatarUrl={user.avatar}
              displayName={user.displayName}
              size="sm"
            />
            <div className="hidden text-left md:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">
                {user.displayName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user.email}
              </p>
            </div>
          </Link>
        )}
      </div>
    </header>
  )
}

function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(' ')
}
```

**Step 2: 确认文件创建成功**

Run: `ls -la src/components/admin/layout/AdminHeader.tsx`
Expected: 文件存在

**Step 3: Commit**

```bash
git add src/components/admin/layout/AdminHeader.tsx
git commit -m "feat: add admin header component"
```

---

### Task 7: 创建后台布局组件

**Files:**
- Create: `src/components/admin/layout/AdminLayout.tsx`

**Step 1: 创建 AdminLayout 组件**

```typescript
// src/components/admin/layout/AdminLayout.tsx

'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'
import { useAdminStore } from '@/hooks/useAdminStore'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { hasAdminAccess, isLoading, loadAdminData } = useAdminStore()

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  useEffect(() => {
    if (!isLoading && !hasAdminAccess) {
      router.push('/')
    }
  }, [hasAdminAccess, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!hasAdminAccess) {
    return null // 会通过 useEffect 跳转到首页
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <Sidebar />

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 头部 */}
        <AdminHeader />

        {/* 内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
```

**Step 2: 确认文件创建成功**

Run: `ls -la src/components/admin/layout/AdminLayout.tsx`
Expected: 文件存在

**Step 3: Commit**

```bash
git add src/components/admin/layout/AdminLayout.tsx
git commit -m "feat: add admin layout component"
```

---

### Task 8: 扩展 Middleware 支持后台路由

**Files:**
- Modify: `src/middleware.ts`

**Step 1: 读取现有 middleware.ts**

先读取看一下现在的内容

**Step 2: 修改 middleware 添加后台路由保护**

```typescript
// 在现有的 middleware 基础上添加后台路由保护

// 添加到 protectedPaths 或创建单独的 adminPaths
const adminPaths = ['/admin']

// 修改 middleware 逻辑，对 /admin 路径进行特殊处理
// 检查用户是否有 admin 权限（暂时先检查是否登录，后续完善）
```

**注意：由于现有 middleware 可能有特定逻辑，请先读取，再进行合理修改。**

**Step 3: Commit**

```bash
git add src/middleware.ts
git commit -m "feat: add admin route protection to middleware"
```

---

### Task 9: 创建后台路由结构

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/page.tsx`
- Create: `src/app/admin/users/page.tsx`
- Create: `src/app/admin/roles/page.tsx`
- Create: `src/app/admin/permissions/page.tsx`
- Create: `src/app/admin/menus/page.tsx`
- Create: `src/app/admin/dictionaries/page.tsx`
- Create: `src/app/admin/logs/page.tsx`
- Create: `src/app/admin/settings/page.tsx`
- Create: `src/app/admin/blog/posts/page.tsx`
- Create: `src/app/admin/blog/categories/page.tsx`
- Create: `src/app/admin/blog/tags/page.tsx`
- Create: `src/app/admin/blog/comments/page.tsx`
- Create: `src/app/admin/im/messages/page.tsx`
- Create: `src/app/admin/im/rooms/page.tsx`
- Create: `src/app/admin/im/sensitive-words/page.tsx`
- Create: `src/app/admin/im/bans/page.tsx`

**Step 1: 创建后台根布局**

```typescript
// src/app/admin/layout.tsx

import React from 'react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

interface AdminRootLayoutProps {
  children: React.ReactNode
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>
}
```

**Step 2: 创建后台首页（仪表盘）**

```typescript
// src/app/admin/page.tsx

'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, FileText, MessageCircle, Activity } from 'lucide-react'

export default function AdminDashboardPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">仪表盘</h1>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">用户总数</CardTitle>
            <Users className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,234</div>
            <p className="text-xs text-gray-500">较昨日 +12%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">文章数量</CardTitle>
            <FileText className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">567</div>
            <p className="text-xs text-gray-500">较昨日 +5%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">消息数量</CardTitle>
            <MessageCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8,901</div>
            <p className="text-xs text-gray-500">较昨日 +23%</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">今日活跃</CardTitle>
            <Activity className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-gray-500">在线用户</p>
          </CardContent>
        </Card>
      </div>

      {/* 欢迎区域 */}
      <Card>
        <CardHeader>
          <CardTitle>欢迎使用 NebulaAdmin</CardTitle>
        </CardHeader>
        <CardContent className="text-gray-500 dark:text-gray-400">
          <p>这是后台管理系统的第一阶段，基础架构已经搭建完成。</p>
          <p className="mt-2">接下来可以继续开发用户管理、角色管理等功能模块。</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**Step 3: 创建占位页面（以用户管理为例）**

```typescript
// src/app/admin/users/page.tsx

'use client'

import React from 'react'

export default function UsersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">用户管理</h1>
      <p className="text-gray-500 dark:text-gray-400">功能开发中...</p>
    </div>
  )
}
```

**Step 4: 为其他路由创建类似的占位页面**

创建所有其他路由的占位页面，内容与上面类似

**Step 5: Commit**

```bash
git add src/app/admin
git commit -m "feat: add admin route structure and placeholder pages"
```

---

### Task 10: 在 GlobalHeader 添加后台入口

**Files:**
- Modify: `src/components/branding/GlobalHeader.tsx`

**Step 1: 修改 GlobalHeader，根据角色显示后台入口**

```typescript
// 在合适的位置添加后台管理入口，仅对有 admin 权限的用户显示
// 可以使用 useAdminStore 检查 hasAdminAccess
```

**Step 2: Commit**

```bash
git add src/components/branding/GlobalHeader.tsx
git commit -m "feat: add admin entrance in GlobalHeader"
```

---

### Task 11: 运行并测试第一阶段

**Step 1: 启动开发服务器**

Run: `npm run dev`
Expected: 服务器正常启动，无错误

**Step 2: 访问后台**

在浏览器中访问 `http://localhost:3000/admin`
Expected: 显示后台布局，左侧有菜单，顶部有Header

**Step 3: 测试菜单导航**

点击左侧菜单项
Expected: 能够跳转到对应的页面

**Step 4: 第一阶段完成，Commit**

```bash
git status
```

---

## 第一阶段完成

恭喜！第一阶段基础架构搭建完成！可以提交 GitHub 啦~
