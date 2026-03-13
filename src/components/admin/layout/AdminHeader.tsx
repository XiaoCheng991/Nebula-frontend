// src/components/admin/layout/AdminHeader.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Bell, Search, Settings, LogOut, Moon, Sun, Monitor, ChevronDown, Home, Sparkles } from 'lucide-react'
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
        <button className="btn-ghost flex items-center gap-1.5 p-2 rounded-xl">
          {getThemeIcon()}
          <ChevronDown className="h-4 w-4 opacity-50" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="rounded-2xl min-w-[140px] shadow-xl">
        <DropdownMenuItem
          onClick={() => setTheme('light')}
          className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5"
        >
          <Sun className="h-4 w-4" />
          <span className="font-medium">浅色</span>
          {theme === 'light' && <span className="ml-auto text-xs text-[var(--accent)]">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('dark')}
          className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5"
        >
          <Moon className="h-4 w-4" />
          <span className="font-medium">深色</span>
          {theme === 'dark' && <span className="ml-auto text-xs text-[var(--accent)]">✓</span>}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme('system')}
          className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5"
        >
          <Monitor className="h-4 w-4" />
          <span className="font-medium">跟随系统</span>
          {theme === 'system' && <span className="ml-auto text-xs text-[var(--accent)]">✓</span>}
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
      'admin-header relative overflow-hidden',
      className
    )}>
      {/* 装饰渐变层 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/5 via-transparent to-[var(--accent)]/3 pointer-events-none" />

      {/* 光晕效果 */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-48 translate-x-48 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--accent)]/3 rounded-full blur-3xl translate-y-32 -translate-x-32 pointer-events-none" />

      {/* 头部内容 */}
      <div className="relative z-10 flex h-16 items-center justify-between px-6">
        {/* 左侧 - 面包屑导航 */}
        <div className="flex items-center gap-3">
          <Link href="/admin" className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[var(--glass-bg)] transition-all duration-300 group">
            <Home className="h-4 w-4 text-[var(--accent)] group-hover:scale-110 transition-transform" />
            <span className="text-sm font-medium text-[var(--text-primary)]">后台管理</span>
          </Link>

          {breadcrumbs.length > 1 && (
            <>
              <div className="w-px h-5 bg-gradient-to-b from-transparent via-[var(--glass-border)] to-transparent" />
              {breadcrumbs.slice(1).map((crumb, index) => (
                <React.Fragment key={crumb.path}>
                  {index === breadcrumbs.length - 2 ? (
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--accent-soft)] border border-[var(--accent-border)]">
                      <Sparkles className="h-3.5 w-3.5 text-[var(--accent)]" />
                      <span className="text-sm font-semibold text-[var(--accent)]">
                        {crumb.name}
                      </span>
                    </div>
                  ) : (
                    <Link
                      href={crumb.path}
                      className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[var(--glass-bg)] transition-all duration-300 group"
                    >
                      <span className="text-sm text-[var(--text-tertiary)] group-hover:text-[var(--text-secondary)] transition-colors">
                        {crumb.name}
                      </span>
                      <ChevronDown className="h-3 w-3 text-[var(--text-muted)] rotate-[-90deg] group-hover:translate-x-0.5 transition-transform" />
                    </Link>
                  )}
                </React.Fragment>
              ))}
            </>
          )}
        </div>

        {/* 右侧 - 操作区 */}
        <div className="flex items-center gap-3">
          {/* 搜索框 - 更精致的设计 */}
          <div className="hidden md:block relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--accent)]/5 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[var(--accent)] transition-colors pointer-events-none" />
              <input
                type="search"
                placeholder="搜索功能、菜单..."
                className="admin-input py-2.5 rounded-2xl border-2 border-transparent focus:border-[var(--accent-border)] transition-all duration-300"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 hidden lg:flex items-center gap-1 px-2 py-1 text-xs text-[var(--text-muted)] bg-[var(--glass-bg)] rounded-lg border border-[var(--glass-border)] pointer-events-none">
                ⌘K
              </kbd>
            </div>
          </div>

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--glass-border)] to-transparent" />

          {/* 主题切换 */}
          <ThemeSwitcherDropdown />

          {/* 通知按钮 */}
          <button className="relative p-2.5 rounded-xl hover:bg-[var(--glass-bg)] transition-all duration-300 group">
            <Bell className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] transition-colors" />
            <span className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-[var(--accent)] ring-2 ring-[var(--bg-base)] group-hover:scale-110 transition-transform" />
          </button>

          {/* 设置按钮 */}
          <Link href="/admin/settings" className="p-2.5 rounded-xl hover:bg-[var(--glass-bg)] transition-all duration-300 group">
            <Settings className="h-5 w-5 text-[var(--text-secondary)] group-hover:text-[var(--text-primary)] group-hover:rotate-45 transition-all duration-300" />
          </Link>

          {/* 分隔线 */}
          <div className="w-px h-8 bg-gradient-to-b from-transparent via-[var(--glass-border)] to-transparent" />

          {/* 用户信息 */}
          {user && (
            <div className="flex items-center gap-3">
              <Link href="/admin/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-[var(--glass-bg)] transition-all duration-300 group">
                <div className="relative">
                  <UserAvatar
                    avatarUrl={user.avatar}
                    nickname={user.nickname}
                    size="sm"
                  />
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="hidden text-left md:block">
                  <p className="text-sm font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)] transition-colors">
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
      </div>
    </header>
  )
}
