// src/components/admin/layout/Sidebar.tsx

'use client'

import React, { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
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
  Home,
  Database,
  List,
  UserCog,
  ShieldCheck,
  Settings2,
  FileBarChart,
  Newspaper,
  FolderOpen,
  Tags,
  AlertCircle,
  UserX,
  Circle,
  Eye,
  LogIn,
  UserCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useAdminStore } from '@/hooks/useAdminStore'
import { AdminMenu as AdminMenuType } from '@/lib/admin/types'

// 增强的图标映射 - 支持多种可能的 icon 名称格式
const iconMap: Record<string, React.ElementType> = {
  // 原有的图标 - 大写开头
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
  // 小写开头
  layoutDashboard: LayoutDashboard,
  dashboard: LayoutDashboard,
  home: Home,
  settings: Settings,
  users: Users,
  user: Users,
  shield: Shield,
  key: Key,
  menu: Menu,
  book: BookOpen,
  bookOpen: BookOpen,
  file: FileText,
  fileText: FileText,
  cog: Cog,
  settings2: Settings2,
  pen: PenTool,
  penTool: PenTool,
  folder: Folder,
  folderOpen: FolderOpen,
  tag: Tag,
  tags: Tags,
  messageSquare: MessageSquare,
  message: MessageCircle,
  messageCircle: MessageCircle,
  mail: Mail,
  alert: AlertTriangle,
  alertTriangle: AlertTriangle,
  alertCircle: AlertCircle,
  ban: Ban,
  userX: UserX,
  userCog: UserCog,
  shieldCheck: ShieldCheck,
  database: Database,
  list: List,
  fileBarChart: FileBarChart,
  newspaper: Newspaper,
  // Ant Design 风格的图标名称映射
  AlertOutlined: AlertTriangle,
  AlertFilled: AlertTriangle,
  AlertTwoTone: AlertTriangle,
  MessageOutlined: MessageCircle,
  MessageFilled: MessageCircle,
  MessageTwoTone: MessageCircle,
  TeamOutlined: Users,
  TeamFilled: Users,
  TeamTwoTone: Users,
  StopOutlined: Ban,
  StopFilled: Ban,
  StopTwoTone: Ban,
  SettingOutlined: Settings,
  SettingFilled: Settings,
  SettingTwoTone: Settings,
  UserOutlined: Users,
  UserFilled: Users,
  UserTwoTone: Users,
  DashboardOutlined: LayoutDashboard,
  DashboardFilled: LayoutDashboard,
  DashboardTwoTone: LayoutDashboard,
  FileTextOutlined: FileText,
  FileTextFilled: FileText,
  FileTextTwoTone: FileText,
  FolderOutlined: Folder,
  FolderFilled: Folder,
  FolderTwoTone: Folder,
  MenuOutlined: Menu,
  MenuFoldOutlined: Menu,
  MenuUnfoldOutlined: Menu,
  TagsOutlined: Tag,
  TagsFilled: Tag,
  TagsTwoTone: Tag,
  BookOutlined: BookOpen,
  BookFilled: BookOpen,
  BookTwoTone: BookOpen,
  KeyOutlined: Key,
  KeyFilled: Key,
  KeyTwoTone: Key,
  ShieldOutlined: Shield,
  ShieldFilled: Shield,
  ShieldTwoTone: Shield,
  LockOutlined: Shield,
  LockFilled: Shield,
  UnlockOutlined: Shield,
  MailOutlined: Mail,
  MailFilled: Mail,
  MailTwoTone: Mail,
  CommentOutlined: MessageSquare,
  CommentFilled: MessageSquare,
  CommentTwoTone: MessageSquare,
  EyeOutlined: Eye,
  EyeFilled: Eye,
  EyeTwoTone: Eye,
  LoginOutlined: LogIn,
  LoginFilled: LogIn,
  LoginTwoTone: LogIn,
  UserSwitchOutlined: UserCheck,
  UserSwitchFilled: UserCheck,
  UserSwitchTwoTone: UserCheck,
  ReadOutlined: BookOpen,
  ReadFilled: BookOpen,
  ReadTwoTone: BookOpen,
}

// 获取图标的辅助函数
const getIcon = (iconName?: string): React.ElementType | null => {
  if (!iconName) return null

  // 1. 尝试直接匹配
  if (iconMap[iconName]) {
    return iconMap[iconName]
  }

  // 2. 尝试小写匹配
  const lowerIcon = iconName.toLowerCase()
  if (iconMap[lowerIcon]) {
    return iconMap[lowerIcon]
  }

  // 3. 尝试驼峰格式匹配（首字母小写）
  const camelIcon = iconName.charAt(0).toLowerCase() + iconName.slice(1)
  if (iconMap[camelIcon]) {
    return iconMap[camelIcon]
  }

  // 4. 尝试去掉 "Outlined" 后缀
  if (iconName.endsWith('Outlined')) {
    const baseName = iconName.replace('Outlined', '')
    if (iconMap[baseName]) {
      return iconMap[baseName]
    }
    // 尝试小写版本
    const lowerBaseName = baseName.toLowerCase()
    if (iconMap[lowerBaseName]) {
      return iconMap[lowerBaseName]
    }
  }

  // 如果都找不到，返回 null
  return null
}

interface MenuItemProps {
  item: AdminMenuType
  level: number
}

const MenuItem: React.FC<MenuItemProps> = ({ item, level }) => {
  const pathname = usePathname()
  const [isExpanded, setIsExpanded] = React.useState(true)

  const menuChildren = item.children?.filter((c) => c.type === 'menu') ?? []
  const hasChildren = menuChildren.length > 0
  const isActive = pathname === item.path
  const IconComponent = getIcon(item.icon)

  console.log('[MenuItem]', { level, name: item.name, hasChildren, path: item.path, children: item.children, childrenType: typeof item.children, childrenIsArray: Array.isArray(item.children) })

  // 一级菜单（有children）渲染button用于展开/收起
  if (level === 0 && hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 text-left rounded-md',
            'mx-2 ml-4'
          )}
          type="button"
        >
          {IconComponent ? (
            <IconComponent className="h-4 w-4 flex-shrink-0 text-current" />
          ) : (
            <Circle className="h-4 w-4 flex-shrink-0 text-gray-400" />
          )}
          <span className="flex-1 truncate text-left">{item.name}</span>
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-400 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
          )}
        </button>
        {isExpanded && (
          <div>
            {menuChildren.map((child) => (
              <MenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // 二级及以下菜单（无children）渲染Link用于页面跳转
  if (!hasChildren && item.path) {
    const normalizedPath = item.path.startsWith('/') ? item.path : `/admin/${item.path}`
    return (
      <Link
        href={normalizedPath}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium transition-colors cursor-pointer rounded-md',
          level === 1 && 'ml-10 mr-2',
          level > 1 && 'ml-14 mr-2',
          isActive
            ? 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
            : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
        )}
        prefetch={false}
      >
        {IconComponent ? (
          <IconComponent className="h-4 w-4 flex-shrink-0" />
        ) : (
          <Circle className="h-4 w-4 flex-shrink-0 text-gray-400" />
        )}
        <span className="truncate">{item.name}</span>
      </Link>
    )
  }

  // 其他情况（如无path的分组节点）不渲染
  return null
}

interface SidebarProps {
  className?: string
}

export const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const { menus } = useAdminStore()
  const [isMounted, setIsMounted] = React.useState(false)

  React.useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return (
      <aside className={cn(
        'flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900',
        className
      )}>
        <div className="h-16 border-b border-gray-200 dark:border-gray-700" />
      </aside>
    )
  }

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
            NebulaHub
          </span>
        </Link>
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto py-4">
        {menus.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-muted-foreground mb-4">暂无菜单数据</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                localStorage.removeItem('admin-storage')
                window.location.reload()
              }}
            >
              清除缓存重试
            </Button>
          </div>
        ) : (
          menus.map((menu) => (
            <MenuItem key={menu.id} item={menu} level={0} />
          ))
        )}
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
