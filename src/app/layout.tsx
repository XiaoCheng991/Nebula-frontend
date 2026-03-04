'use client'

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import GlobalHeader from '@/components/branding/GlobalHeader';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/lib/user-context';
import ScrollTopOnMount from '@/components/ScrollTopOnMount';
import { useThemeEffect } from '@/hooks/useTheme';
import ThemeProvider from '@/components/ThemeProvider';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body className={`${inter.className} scroll-smooth`}>
        <ThemeProvider>
          <UserProvider>
            {isAdminRoute ? (
              <div className="min-h-screen">
                {children}
              </div>
            ) : (
              <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950">
                <GlobalHeader />
                <main className="flex-1 w-full">
                  {children}
                </main>
              </div>
            )}
            <ScrollTopOnMount />
            <Toaster />
          </UserProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
