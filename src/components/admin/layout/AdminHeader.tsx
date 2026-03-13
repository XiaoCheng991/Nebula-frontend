// src/components/admin/layout/AdminHeader.tsx

'use client'

import React from 'react'
import Link from 'next/link'
import { Bell, Search, Settings, LogOut, Moon, Sun, Monitor, ChevronDown } from 'lucide-react'
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

  return (
    <header className={cn(
      'flex h-16 items-center justify-between admin-header px-6',
      className
    )}>
      {/* 左侧 - 简洁标题 */}
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold text-[var(--text-primary)]">
          管理后台
        </h1>
      </div>

      {/* 右侧 - 操作区 */}
      <div className="flex items-center gap-2">
        {/* 搜索 */}
        <div className="hidden md:block">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="search"
              placeholder="搜索..."
              className="admin-input w-64 pl-10"
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
