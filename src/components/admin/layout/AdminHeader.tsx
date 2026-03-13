// src/components/admin/layout/AdminHeader.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, Settings, LogOut, Moon, Sun, Monitor, ChevronDown, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/ui/user-avatar'
import { LogoutButton } from '@/components/auth/LogoutButton'
import { useAdminStore } from '@/hooks/useAdminStore'
import { useThemeStore } from '@/hooks/useTheme'
import { cn } from '@/lib/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface AdminHeaderProps {
  className?: string
}

// 主题切换组件 - 参考前台 GlobalHeader
const ThemeSwitcherDropdown: React.FC = () => {
  const { theme, setTheme } = useThemeStore()

  const getThemeIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />
      case 'dark':
        return <Moon className="h-5 w-5" />
      case 'system':
        return <Monitor className="h-5 w-5" />
      default:
        return <Moon className="h-5 w-5" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="btn-ghost flex items-center gap-1.5 p-2">
          {getThemeIcon()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-[var(--radius)] min-w-[120px]">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Sun className="h-4 w-4" />
          <span>浅色</span>
          {theme === 'light' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Moon className="h-4 w-4" />
          <span>深色</span>
          {theme === 'dark' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <Monitor className="h-4 w-4" />
          <span>跟随系统</span>
          {theme === 'system' && <span className="ml-auto text-xs">✓</span>}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({ className }) => {
  const { user } = useAdminStore()
  const pathname = usePathname()

  // 生成面包屑
  const getBreadcrumbs = () => {
    const paths = pathname.split('/').filter(Boolean)
    if (paths.length === 0) return []

    const breadcrumbs = []
    let currentPath = ''

    for (let i = 0; i < paths.length; i++) {
      currentPath += '/' + paths[i]
      const name = paths[i] === 'admin' ? '管理后台' :
                   paths[i] === 'users' ? '用户管理' :
                   paths[i] === 'roles' ? '角色管理' :
                   paths[i] === 'permissions' ? '权限管理' :
                   paths[i] === 'menus' ? '菜单管理' :
                   paths[i] === 'articles' ? '文章管理' :
                   paths[i] === 'categories' ? '分类管理' :
                   paths[i] === 'tags' ? '标签管理' :
                   paths[i] === 'comments' ? '评论管理' :
                   paths[i] === 'logs' ? '日志管理' :
                   paths[i] === 'settings' ? '系统设置' :
                   paths[i]
      breadcrumbs.push({ name, path: currentPath })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <header className={cn(
      'flex h-16 items-center justify-between admin-header px-6',
      className
    )}>
      {/* 左侧 - 面包屑导航 */}
      <div className="flex items-center gap-2">
        <Link href="/admin" className="flex items-center gap-1 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors">
          <Home className="h-4 w-4" />
        </Link>
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            <span className="text-[var(--text-muted)]">/</span>
            {index === breadcrumbs.length - 1 ? (
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {crumb.name}
              </span>
            ) : (
              <Link
                href={crumb.path}
                className="text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors"
              >
                {crumb.name}
              </Link>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* 右侧 - 操作区 */}
      <div className="flex items-center gap-2">
        {/* 搜索 */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none" />
            <input
              type="search"
              placeholder="搜索..."
              className="admin-input w-64"
              style={{ paddingLeft: '3rem' }}
            />
          </div>
        </div>

        {/* 主题切换 - 下拉菜单形式 */}
        <ThemeSwitcherDropdown />

        {/* 通知 */}
        <button className="btn-ghost relative p-2">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[var(--accent)]" />
        </button>

        {/* 设置 */}
        <Link href="/admin/settings" className="btn-ghost p-2">
          <Settings className="h-5 w-5" />
        </Link>

        {/* 用户信息 */}
        {user && (
          <div className="flex items-center gap-3 ml-2 pl-3 border-l border-[var(--glass-border)]">
            <Link href="/admin/settings" className="flex items-center gap-2.5 group">
              <UserAvatar
                avatarUrl={user.avatar}
                nickname={user.nickname}
                size="sm"
              />
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
                  {user.nickname}
                </p>
                <p className="text-xs text-[var(--text-tertiary)]">
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
