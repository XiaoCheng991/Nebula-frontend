'use client'

import GlobalHeader from '@/components/branding/GlobalHeader';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/lib/user-context';
import ScrollTopOnMount from '@/components/ScrollTopOnMount';
import ThemeProvider from '@/components/ThemeProvider';
import { QueryProvider } from '@/providers/query-provider';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
    children: React.ReactNode;
    interClassName: string;
}

export function ClientLayout({ children, interClassName }: ClientLayoutProps) {
    const pathname = usePathname()
    const isAdminRoute = pathname?.startsWith('/admin')

    // 排除 auth 页面，这些页面自己定义背景
    const isAuthPage = pathname?.startsWith('/login') || pathname?.startsWith('/register') || pathname?.startsWith('/forgot-password')

    return (
        <ThemeProvider>
            <QueryProvider>
                <UserProvider>
                {isAdminRoute ? (
                    <div className="min-h-screen">
                        {children}
                    </div>
                ) : isAuthPage ? (
                    // Auth 页面：显示导航栏
                    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-white to-amber-50/50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-orange-950/5 ${interClassName}`}>
    <GlobalHeader />
    <main className="flex-1 w-full">
      {children}
    </main>
  </div>
                ) : (
                    // 其他页面：添加统一的渐变背景，确保导航栏透明时背景连续
                    <div className={`min-h-screen flex flex-col bg-gradient-to-br from-slate-100 via-white to-amber-50/50 dark:from-[#0a0a0a] dark:via-[#0f0f0f] dark:to-orange-950/5 ${interClassName}`}>
                        <GlobalHeader />
                        <main className="flex-1 w-full">
                            {children}
                        </main>
                    </div>
                )}
                <ScrollTopOnMount />
                <Toaster />
                </UserProvider>
            </QueryProvider>
        </ThemeProvider>
    )
}
