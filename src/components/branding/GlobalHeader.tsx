"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useUser } from '@/lib/user-context';
import { MessageCircle, Settings, Sparkles, FolderUp, LogOut, Loader2, Moon, Sun, Monitor, ChevronDown, Shield, Zap, BookOpen, User, HelpCircle } from 'lucide-react';
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

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (user && !userLoading) {
      loadAdminData().catch(() => {
      })
    }
  }, [user?.username, userLoading, loadAdminData])

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
    const [isOpen, setIsOpen] = React.useState(false);

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

    return (
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-1 px-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {getThemeIcon()}
          <ChevronDown className={`h-4 w-4 opacity-50 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
            <div className="absolute top-full right-0 mt-2 rounded-2xl bg-white dark:bg-gray-900 shadow-2xl backdrop-blur-xl p-2 z-50 min-w-[140px]">
              <button
                onClick={() => { setTheme('light'); setIsOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${
                  theme === 'light'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                }`}
              >
                <Sun className="h-4 w-4" />
                <span className="text-sm font-medium">浅色</span>
              </button>
              <button
                onClick={() => { setTheme('dark'); setIsOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${
                  theme === 'dark'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                }`}
              >
                <Moon className="h-4 w-4" />
                <span className="text-sm font-medium">深色</span>
              </button>
              <button
                onClick={() => { setTheme('system'); setIsOpen(false); }}
                className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl transition-all ${
                  theme === 'system'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-200'
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span className="text-sm font-medium">跟随系统</span>
              </button>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <header className={`w-full sticky top-0 z-50 overflow-hidden ${className}`} aria-label="站点头部">
      {/* 背景效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/3 via-transparent to-[var(--accent)]/2 pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-48 pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)]/3 rounded-full blur-3xl translate-y-32 pointer-events-none" />

      {/* 头部内容 */}
      <div className="relative z-10 px-6 py-3 grid grid-cols-3 items-center bg-white/70 dark:bg-gray-900/80 backdrop-blur-xl border-b border-[var(--glass-border)]">
        {/* 左侧 - Logo */}
        <div className="flex items-center justify-start">
          <Link href="/home" className="flex items-center gap-3 group">
            <img
              src={src}
              alt="NebulaHub Logo"
              style={{ height: 40, width: 'auto' }}
              onError={handleError}
              className="rounded-xl transition-transform duration-300 group-hover:scale-110"
            />
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
              href="/blog"
              className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
            >
              <BookOpen className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className="text-sm font-medium hidden sm:block">博客</span>
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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 p-2 rounded-xl bg-white/10 dark:bg-white/5 hover:bg-white/20 dark:hover:bg-white/10 transition-all duration-300 group focus-visible:ring-0 focus-visible:ring-offset-0 outline-none">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300 hidden sm:block group-hover:text-[var(--accent)] transition-colors">
                    Hi {user.nickname || user.username}!
                  </span>
                  <UserAvatar
                    avatarUrl={user.avatarUrl}
                    nickname={user.nickname}
                    size="sm"
                  />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl p-2">
                <div className="px-3 py-2 mb-1 border-b border-[var(--glass-border)]">
                  <p className="text-sm font-medium text-slate-800 dark:text-white">{user.nickname || user.username}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">@{user.username}</p>
                </div>
                <DropdownMenuItem asChild className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5 px-3">
                  <Link href="/settings">
                    <Settings className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">设置</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5 px-3">
                  <Link href="/settings">
                    <User className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">个人资料</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5 px-3">
                  <Link href="/help">
                    <HelpCircle className="h-4 w-4 text-slate-500" />
                    <span className="font-medium">帮助中心</span>
                  </Link>
                </DropdownMenuItem>
                <div className="h-px bg-[var(--glass-border)] my-1" />
                <DropdownMenuItem className="flex items-center gap-3 cursor-pointer rounded-xl py-2.5 px-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30">
                  <LogoutButton iconOnly={false} />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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
                className="px-4 py-2 rounded-xl text-sm font-medium bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white transition-all duration-300 shadow-lg shadow-orange-500/25 hover:shadow-orange-500/30 hover:scale-105"
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
