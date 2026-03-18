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
  isFirst?: boolean
}

const MenuItem: React.FC<MenuItemProps> = ({ item, level, isFirst = false }) => {
  const pathname = usePathname()
  const menuChildren = item.children?.filter((c) => c.type === 'menu') ?? []
  const hasChildren = menuChildren.length > 0
  const isActive = pathname === item.path
  const IconComponent = getIcon(item.icon)

  // 检查当前菜单或其子菜单是否处于激活状态
  const isCurrentMenuOrChildActive = () => {
    if (isActive) return true
    if (!hasChildren) return false
    return menuChildren.some(child => {
      if (child.path === pathname) return true
      if (child.children) {
        return child.children.some(grandChild => grandChild.path === pathname)
      }
      return false
    })
  }

  const [isExpanded, setIsExpanded] = React.useState(() => {
    // 如果是当前页面或子菜单被激活，自动展开
    if (isCurrentMenuOrChildActive()) return true
    return isFirst
  })

  // 当 pathname 变化时，检查是否需要自动展开
  React.useEffect(() => {
    if (isCurrentMenuOrChildActive()) {
      setIsExpanded(true)
    }
  }, [pathname])

  // 有子菜单的项（无论层级）都渲染button用于展开/收起
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn('menu-item', isExpanded && 'expanded')}
          type="button"
        >
          {IconComponent ? (
            <IconComponent className="menu-item-icon" />
          ) : (
            <Circle className="menu-item-icon" />
          )}
          <span className="menu-item-text">{item.name}</span>
          <ChevronDown className={cn('menu-chevron', !isExpanded && 'rotate-[-90deg]')} />
        </button>
        {isExpanded && (
          <div className={cn('submenu', isExpanded && 'expanded')}>
            {menuChildren.map((child) => (
              <MenuItem key={child.id} item={child} level={level + 1} />
            ))}
          </div>
        )}
      </div>
    )
  }

  // 叶子菜单项（无children）渲染Link用于页面跳转
  if (item.path) {
    const normalizedPath = item.path.startsWith('/') ? item.path : `/admin/${item.path}`
    return (
      <Link
        href={normalizedPath}
        className={cn('menu-item', isActive && 'active')}
        prefetch={false}
      >
        {IconComponent ? (
          <IconComponent className="menu-item-icon" />
        ) : (
          <Circle className="menu-item-icon" />
        )}
        <span className="menu-item-text">{item.name}</span>
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
      <aside className={cn('flex h-full w-56 flex-col admin-sidebar', className)}>
        <div className="h-16" />
      </aside>
    )
  }

  return (
    <aside className={cn('flex h-full w-56 flex-col admin-sidebar', className)}>
      {/* Logo 区域 - 使用图片，类似前台 */}
      <div className="flex h-16 items-center px-6 relative z-10">
        <Link href="/admin" className="flex items-center gap-3 group">
          <img
            src="/logo_icon.svg"
            alt="NebulaHub Logo"
            className="h-10 w-10 rounded-[var(--radius-md)]"
            onError={(e) => {
              // 如果图片加载失败，使用文字 fallback
              e.currentTarget.style.display = 'none'
            }}
          />
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[var(--text-primary)] tracking-tight">
              Nebula<span className="font-semibold text-[var(--text-secondary)]">Hub</span>
            </span>
            <span className="text-[10px] font-medium text-[var(--accent)] tracking-wide leading-tight">
              管理后台
            </span>
          </div>
        </Link>
      </div>

      {/* 菜单区域 */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 relative z-10">
        {menus.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm text-[var(--text-tertiary)] mb-4">暂无菜单数据</p>
            <button
              className="btn-glass"
              onClick={() => {
                localStorage.removeItem('admin-storage')
                window.location.reload()
              }}
            >
              清除缓存重试
            </button>
          </div>
        ) : (
          menus.map((menu, index) => (
            <MenuItem key={menu.id} item={menu} level={0} isFirst={index === 0} />
          ))
        )}
      </nav>

      {/* 底部区域 */}
      <div className="border-t border-[var(--glass-border)] p-4 relative z-10">
        <Link
          href="/home"
          className="flex items-center gap-2 text-sm text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] transition-colors group"
        >
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          <span>返回前台</span>
        </Link>
      </div>
    </aside>
  )
}
