// src/components/admin/layout/AdminHeader.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { UserAvatar } from '@/components/ui/user-avatar'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { ThemeSwitcher } from '@/components/ui/theme-switcher'
import { useAdminStore } from '@/hooks/useAdminStore'
import { cn } from '@/lib/utils'

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
        <Link href="/home" className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
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

        {/* 主题切换 */}
        <ThemeSwitcher />

        {/* 通知 */}
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-red-500" />
        </Button>

        {/* 用户 */}
        {user && (
          <div className="flex items-center gap-2">
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
            <LogoutButton iconOnly />
          </div>
        )}
      </div>
    </header>
  )
}
