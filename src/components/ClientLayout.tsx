'use client'

import GlobalHeader from '@/components/branding/GlobalHeader';
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from '@/lib/user-context';
import ScrollTopOnMount from '@/components/ScrollTopOnMount';
import ThemeProvider from '@/components/ThemeProvider';
import { usePathname } from 'next/navigation';

interface ClientLayoutProps {
  children: React.ReactNode;
  interClassName: string;
}

export function ClientLayout({ children, interClassName }: ClientLayoutProps) {
  const pathname = usePathname()
  const isAdminRoute = pathname?.startsWith('/admin')

  return (
    <ThemeProvider>
      <UserProvider>
        {isAdminRoute ? (
          <div className="min-h-screen">
            {children}
          </div>
        ) : (
          <div className={`min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950 ${interClassName}`}>
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
  )
}
