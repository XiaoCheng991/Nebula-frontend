"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useUser } from '@/lib/user-context';
import { MessageCircle, Settings, Sparkles, FolderUp, LogOut, Loader2, Moon, Sun, Monitor, ChevronDown, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/hooks/useTheme';
import { useAdminStore } from '@/hooks/useAdminStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type GlobalHeaderProps = {
  className?: string;
};

const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  className = '',
}) => {
  const { user, loading: userLoading } = useUser()
  const { hasAdminAccess, loadAdminData } = useAdminStore()
  const [src, setSrc] = React.useState<string>('/logo_icon.svg');

  // 当用户登录后，加载管理员权限信息
  useEffect(() => {
    if (user && !userLoading) {
      loadAdminData().catch(() => {
        // 忽略错误，非管理员用户会正常失败
      })
    }
  }, [user?.username, userLoading, loadAdminData])

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (src !== '/public/logo_icon.svg') {
      img.src = '/public/logo_icon.svg';
      setSrc('/public/logo_icon.svg');
    }
  };

  const AdminEntrance: React.FC = () => {
    const { hasAdminAccess } = useAdminStore();

    if (!hasAdminAccess) {
      return null;
    }

    return (
      <Link
        href="/admin"
        className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
      >
        <Shield className="h-5 w-5" />
        <span className="text-sm font-medium hidden sm:block">管理后台</span>
      </Link>
    );
  };

  const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useThemeStore();

    const getThemeIcon = () => {
      switch (theme) {
        case 'light':
          return <Sun className="h-5 w-5" />;
        case 'dark':
          return <Moon className="h-5 w-5" />;
        case 'system':
          return <Monitor className="h-5 w-5" />;
      }
    };

    const getThemeLabel = () => {
      switch (theme) {
        case 'light':
          return '浅色';
        case 'dark':
          return '深色';
        case 'system':
          return '系统';
      }
    };

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="flex items-center gap-1 w-auto px-2">
            {getThemeIcon()}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-[25px]">
          <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-2 cursor-pointer">
            <Sun className="h-4 w-4" />
            <span>浅色</span>
            {theme === 'light' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-2 cursor-pointer">
            <Moon className="h-4 w-4" />
            <span>深色</span>
            {theme === 'dark' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-2 cursor-pointer">
            <Monitor className="h-4 w-4" />
            <span>跟随系统</span>
            {theme === 'system' && <span className="ml-auto text-xs text-muted-foreground">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className={`w-full sticky top-0 z-50 bg-transparent backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 ${className}`} aria-label="站点头部">
      <div className="container mx-auto px-6 py-3 grid grid-cols-3 items-center">
        {/* 左侧 - Logo */}
        <div className="flex items-center justify-start">
          <Link href="/home" className="flex items-center gap-3">
            <img src={src} alt="NebulaHub Logo" style={{ height: 40, width: 'auto' }} onError={handleError} className="rounded-xl" />
            <div className="flex flex-col">
              <span className="text-lg font-bold text-slate-800 dark:text-white tracking-tight">
                Nebula<span className="font-semibold text-slate-500 dark:text-slate-400">Hub</span>
              </span>
              <span className="text-[11px] font-medium text-orange-500 tracking-wide leading-tight">
                <span className="text-slate-500">Nova Pro</span>
                <span className="mx-1.5 text-slate-400">|</span>
                橙光
              </span>
            </div>
          </Link>
        </div>

        {/* 中间 - 导航 */}
        <div className="flex items-center justify-center">
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">仪表盘</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <MessageCircle className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">消息</span>
            </Link>
            <Link
              href="/drive"
              className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <FolderUp className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">文件</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 p-2 rounded-lg transition-colors duration-200 hover:bg-gray-100/50 dark:hover:bg-gray-800/50"
            >
              <Settings className="h-5 w-5" />
              <span className="text-sm font-medium hidden sm:block">设置</span>
            </Link>
          </nav>
        </div>

        {/* 右侧 - 用户操作 */}
        <div className="flex items-center justify-end gap-2">
          <AdminEntrance />
          <ThemeSwitcher />
          {userLoading ? (
            <div className="flex items-center gap-2 px-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          ) : user ? (
            <>
              <Link href="/settings" className="flex items-center gap-2.5 p-2 rounded-xl bg-transparent hover:bg-gray-100/50 dark:hover:bg-gray-800/50 transition-all duration-200">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block">
                  Hi {user.displayName || user.username}!
                </span>
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  displayName={user.displayName}
                  size="sm"
                />
              </Link>
              <LogoutButton iconOnly />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100/60 dark:bg-gray-800/60 hover:bg-gray-200/80 dark:hover:bg-gray-700/80 border border-gray-300/50 dark:border-gray-600/50 transition-all text-slate-700 dark:text-slate-300"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white transition-all shadow-md shadow-blue-500/20"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default GlobalHeader;
