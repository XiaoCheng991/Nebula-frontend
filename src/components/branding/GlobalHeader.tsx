"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserAvatar } from '@/components/ui/user-avatar';
import { LogoutButton } from '@/components/auth/LogoutButton';
import { useUser } from '@/lib/user-context';
import { MessageCircle, Settings, Sparkles, FolderUp, LogOut, Loader2, Moon, Sun, Shield, Zap, BookOpen, User, HelpCircle, Compass } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useThemeStore } from '@/hooks/useTheme';
import { useAdminStore, checkHasAdminAccess } from '@/hooks/useAdminStore'
import { LanguageSwitcher } from '@/components/auth/LanguageSwitcher';
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
  const { loadAdminData } = useAdminStore()
  const [src, setSrc] = React.useState<string>('/logo_icon.svg');
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  // 检查是否在登录/注册页面
  const isAuthPage = pathname === '/login' || pathname === '/register';
  const [isMounted, setIsMounted] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  const [adminVisible, setAdminVisible] = useState(false)

  // 滚动监听 - 实现透明到玻璃效果的切换（登录/注册页面禁用）
  useEffect(() => {
    if (isAuthPage) return; // 登录/注册页面不监听滚动，始终保持透明

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAuthPage]);

  // 直接从 Supabase 检查管理员权限
  useEffect(() => {
    if (user && !userLoading) {
      setAdminVisible(false)
      checkHasAdminAccess().then(ok => setAdminVisible(ok)).catch(() => {})
      // 同时加载 store 数据（用于后台管理页）
      loadAdminData().catch(() => {})
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
    const [mounted, setMounted] = React.useState(false);

    React.useEffect(() => {
      setMounted(true);
    }, []);

    if (!mounted || !adminVisible) {
      return null;
    }

    return (
      <Link
        href="/admin"
        className="flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group"
      >
        <Shield className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
        <span className="text-sm font-medium hidden sm:block">管理后台</span>
      </Link>
    );
  };

  const ThemeSwitcher: React.FC = () => {
    const { theme, setTheme } = useThemeStore();

    const toggleTheme = () => {
      setTheme(theme === 'dark' ? 'light' : 'dark');
    };

    if (!isMounted) {
      return (
        <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-transparent" />
      );
    }

    return (
      <button
        onClick={toggleTheme}
        className="flex items-center justify-center w-10 h-10 rounded-xl bg-transparent hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 group hover:shadow-md"
        aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
      >
        {theme === 'dark' ? (
          <Sun className="h-5 w-5 text-amber-500 group-hover:scale-110 group-hover:rotate-12 transition-transform" />
        ) : (
          <Moon className="h-5 w-5 text-indigo-500 group-hover:scale-110 group-hover:-rotate-12 transition-transform" />
        )}
      </button>
    );
  };

  // 文字颜色根据滚动状态变化（登录/注册页面始终使用白色）
  const navTextClasses = isAuthPage
    ? 'text-white'
    : isScrolled
    ? 'text-slate-700 dark:text-slate-300'
    : 'text-slate-900 dark:text-white';

  return (
    <header className={`w-full absolute top-0 z-50 ${isAuthPage ? 'bg-transparent' : 'transition-all duration-300'} ${className}`} aria-label="站点头部">
      {/* 背景层 - 根据滚动状态显示不同样式（登录/注册页面始终透明，无任何背景层） */}
      {!isAuthPage && (
        isScrolled ? (
          // 滚动后：液态玻璃背景
          <div className="absolute inset-0 bg-white/80 dark:bg-black/60 backdrop-blur-xl border-b border-[var(--glass-border)]" />
        ) : (
          // 未滚动：完全透明，无任何背景或边框
          <div className="absolute inset-0 bg-transparent" />
        )
      )}

      {/* 装饰性光晕效果 - 仅在未滚动且非登录/注册页面时显示 */}
      {!isAuthPage && !isScrolled && (
        <>
          {/* <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)]/3 via-transparent to-[var(--accent)]/2 pointer-events-none" /> */}
          {/* <div className="absolute top-0 left-1/4 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-48 pointer-events-none" /> */}
          {/* <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-[var(--accent)]/3 rounded-full blur-3xl translate-y-32 pointer-events-none" /> */}
        </>
      )}

      {/* 头部内容 - 始终在背景层之上 */}
      <div className="relative z-10 px-6 py-3 grid grid-cols-3 items-center">
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
                <span className={navTextClasses}>Nebula</span>
                <span className="font-semibold text-orange-500">Hub</span>
              </span>
              <span className="text-[11px] font-medium tracking-wide leading-tight flex items-center gap-1">
                <Zap className="h-3 w-3 text-orange-500" />
                <span className="text-orange-500">橙光</span>
                <span className={`mx-1 ${navTextClasses}`}>|</span>
                <span className={navTextClasses}>Pro</span>
              </span>
            </div>
          </Link>
        </div>

        {/* 中间 - 导航 */}
        <div className="flex items-center justify-center">
          <nav className="hidden md:flex items-center space-x-1">
            {/* 我的空间 */}
            <Link
              href="/dashboard"
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group ${
                pathname === "/dashboard" ? "bg-white/[0.06]" : ""
              } ${navTextClasses}`}
            >
              <Compass className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
              <span className={`text-sm hidden sm:block transition-all duration-300 ${pathname === "/dashboard" ? "font-semibold" : "font-medium"}`}>我的空间</span>
              {pathname === "/dashboard" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[4px] opacity-60" />
                </span>
              )}
            </Link>

            {/* 文件 */}
            <Link
              href="/drive"
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group ${
                pathname === "/drive" ? "bg-white/[0.06]" : ""
              } ${navTextClasses}`}
            >
              <FolderUp className="h-5 w-5 text-green-500 group-hover:scale-110 transition-transform" />
              <span className={`text-sm hidden sm:block transition-all duration-300 ${pathname === "/drive" ? "font-semibold" : "font-medium"}`}>文件</span>
              {pathname === "/drive" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[4px] opacity-60" />
                </span>
              )}
            </Link>

            {/* 博客 - 公开页面 */}
            <Link
              href="/blog"
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group ${
                pathname === "/blog" ? "bg-white/[0.06]" : ""
              } ${navTextClasses}`}
            >
              <BookOpen className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
              <span className={`text-sm hidden sm:block transition-all duration-300 ${pathname === "/blog" ? "font-semibold" : "font-medium"}`}>博客</span>
              {pathname === "/blog" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[4px] opacity-60" />
                </span>
              )}
            </Link>

            {/* About - 公开页面 */}
            <Link
              href="/me"
              className={`relative flex items-center gap-2 px-3 py-2 rounded-xl transition-all duration-300 hover:bg-white/10 dark:hover:bg-white/5 group ${
                pathname === "/me" ? "bg-white/[0.06]" : ""
              } ${navTextClasses}`}
            >
              <User className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
              <span className={`text-sm hidden sm:block transition-all duration-300 ${pathname === "/me" ? "font-semibold" : "font-medium"}`}>About</span>
              {pathname === "/me" && (
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-[2px] rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent">
                  <span className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-orange-500 to-transparent blur-[4px] opacity-60" />
                </span>
              )}
            </Link>
          </nav>
        </div>

        {/* 右侧 - 用户操作 */}
        <div className="flex items-center justify-end gap-2">
          <AdminEntrance />
          <ThemeSwitcher />
          <LanguageSwitcher />
          {userLoading ? (
            <div className="flex items-center gap-2 px-3">
              <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
            </div>
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2.5 p-2 rounded-xl bg-transparent hover:bg-white/10 dark:hover:bg-white/5 transition-all duration-300 group focus-visible:ring-0 focus-visible:ring-offset-0 outline-none hover:shadow-md">
                  <span className={`text-sm font-medium hidden sm:block group-hover:text-orange-500 transition-colors ${navTextClasses}`}>
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
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  isAuthPage
                    ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20 backdrop-blur-sm'
                    : isScrolled
                    ? 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200'
                    : 'bg-white/90 dark:bg-slate-800/90 hover:bg-white dark:hover:bg-slate-700 border border-slate-200/50 dark:border-slate-700/50 text-slate-700 dark:text-slate-200'
                }`}
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
