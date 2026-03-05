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
            'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800',
            level > 0 && 'pl-10'
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
        'flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors',
        level > 0 && 'pl-10',
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
      'flex h-full w-45 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
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
          href="/home"
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <ChevronRight className="h-4 w-4" />
          <span>返回前台</span>
        </Link>
      </div>
    </aside>
  )
}
