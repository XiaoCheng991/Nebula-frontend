"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useUser } from '@/lib/user-context';
import { MessageCircle, Settings, Sparkles, FolderUp, LogOut, Loader2, Moon, Sun, Monitor, ChevronDown, Shield, Zap } from 'lucide-react';
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
  const [isMounted, setIsMounted] = React.useState(false);

  // 所有Hooks必须放在组件最顶部，不能放在条件返回之后
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // 当用户登录后，加载管理员权限信息
  useEffect(() => {
    if (user && !userLoading) {
      loadAdminData().catch(() => {
        // 忽略错误，非管理员用户会正常失败
      })
    }
  }, [user?.username, userLoading, loadAdminData])

  // 服务端渲染和客户端挂载前只渲染简单骨架，避免hydration错误
  if (!isMounted) {
    return (
      <header className={`w-full sticky top-0 z-50 bg-transparent backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 ${className}`}>
        <div className="container mx-auto px-6 py-3 grid grid-cols-3 items-center h-16">
          <div className="flex items-center justify-start">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600" />
          </div>
          <div className="flex items-center justify-center" />
          <div className="flex items-center justify-end gap-2" />
        </div>
      </header>
    );
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const img = e.currentTarget;
    if (src !== '/public/logo_icon.svg') {
      img.src = '/public/logo_icon.svg';
      setSrc('/public/logo_icon.svg');
    }
  };

  const AdminEntrance: React.FC = () => {
    const { hasAdminAccess } = useAdminStore();
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    // 避免 hydration 不匹配，客户端挂载后才渲染
    if (!mounted || !hasAdminAccess) {
      return null;
    }

    return (
      <Link
        href="/admin"
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
      >
        <Shield className="h-5 w-5 text-[var(--accent)] group-hover:scale-110 transition-transform" />
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
          <Button variant="ghost" size="icon" className="flex items-center gap-1 w-auto px-2 rounded-xl hover:bg-white/10 dark:hover:bg-white/5">
            {getThemeIcon()}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
          <DropdownMenuItem onClick={() => setTheme('light')} className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5">
            <Sun className="h-4 w-4" />
            <span className="font-medium">浅色</span>
            {theme === 'light' && <span className="ml-auto text-xs text-[var(--accent)]">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')} className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5">
            <Moon className="h-4 w-4" />
            <span className="font-medium">深色</span>
            {theme === 'dark' && <span className="ml-auto text-xs text-[var(--accent)]">✓</span>}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')} className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5">
            <Monitor className="h-4 w-4" />
            <span className="font-medium">跟随系统</span>
            {theme === 'system' && <span className="ml-auto text-xs text-[var(--accent)]">✓</span>}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };

  return (
    <header className={`w-full sticky top-0 z-50 overflow-hidden ${className}`} aria-label="站点头部">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/3 via-transparent to-[var(--accent)]/2 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-48 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)]/3 rounded-full blur-3xl translate-y-32 pointer-events-none" />

      {/* 头部内容 */}
      <div className="relative z-10 container mx-auto px-6 py-3 grid grid-cols-3 items-center bg-white/50 dark:bg-black/50 backdrop-blur-xl border-b border-[var(--glass-border)]">
        {/* 左侧 - Logo */}
        <div className="flex items-center justify-start">
          <Link href="/home" className="flex items-center gap-3 group">
            <div className="relative">
              <img
                src={src}
                alt="NebulaHub Logo"
                style={{ height: 40, width: 'auto' }}
                onError={handleError}
                className="rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold tracking-tight">
                <span className="text-slate-800 dark:text-white">Nebula</span>
                <span className="font-semibold text-[var(--accent)]">Hub</span>
              </span>
              <span className="text-[11px] font-medium tracking-wide leading-tight flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-orange-500">橙光</span>
                <span className="text-slate-400 mx-1">|</span>
                <span className="text-slate-500">Nova Pro</span>
              </span>
            </div>
          </Link>
        </div>

        {/* 中间 - 导航 */}
        <div className="flex items-center justify-center">
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
            >
              <Sparkles className="h-5 w-5 text-[var(--accent)] group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:block">仪表盘</span>
            </Link>
            <Link
              href="/chat"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
            >
              <MessageCircle className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:block">消息</span>
            </Link>
            <Link
              href="/drive"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
            >
              <FolderUp className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:block">文件</span>
            </Link>
            <Link
              href="/settings"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
            >
              <Settings className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
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
              <Link href="/settings" className="flex items-center gap-2.5 p-2 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block group-hover:text-[var(--accent)] transition-colors">
                  Hi {user.nickname || user.username}!
                </span>
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  nickname={user.nickname}
                  size="sm"
                />
              </Link>
              <LogoutButton iconOnly />
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="px-4 py-2 rounded-xl text-sm font-medium bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-[var(--glass-border)] transition-all duration-300 backdrop-blur-sm"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-[var(--accent)] to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white transition-all duration-300 shadow-lg shadow-orange-500/20 hover:shadow-orange-500/30 hover:scale-105"
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
