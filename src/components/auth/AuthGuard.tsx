"use client"

import { useEffect, useRef, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticatedSync } from '@/lib/auth/token-manager'
import { useAuthPrompt } from '@/hooks/useAuthPrompt'
import { supabase } from '@/lib/supabase/client'

interface AuthGuardProps {
  children: React.ReactNode
  requireAuth?: boolean
  fallback?: React.ReactNode
}

export function AuthGuard({
  children,
  requireAuth = true,
  fallback
}: AuthGuardProps) {
  const router = useRouter()
  const pathname = usePathname()
  const { requireAuth: checkAuth, requireGuest: checkGuest } = useAuthPrompt()

  // 初始认证检查：统一服务端和客户端的初始状态
  const [isAuth, setIsAuth] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  const resolved = useRef(false)

  useEffect(() => {
    const runCheck = async () => {
      if (isAuthenticatedSync()) {
        setIsAuth(true)
        setIsChecking(false)
        resolved.current = true
        return
      }

      try {
        const { data: { session } } = await supabase.auth.getSession()
        const auth = !!session
        setIsAuth(auth)
        resolved.current = auth

        if (!auth) {
          requireAuth ? checkAuth(pathname) : checkGuest()
        }
      } catch {
        /* ignore */
      }
      setIsChecking(false)
    }

    runCheck()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname, requireAuth])

  // 已登录用户访问登录/注册页，静默重定向
  if (!requireAuth && isAuth) {
    return <></>
  }

  if (isChecking) {
    // 受保护路由：显示空白占位（避免 hydration 不匹配）
    // 公开路由：直接显示 children（用户未登录也正常看到登录页）
    if (requireAuth) {
      return <div style={{ minHeight: '100vh' }} />
    }
    // 公开路由直接渲染内容，等异步检查完成后自动跳转
    return <>{children}</>
  }

  return <>{children}</>
}

export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAuth = true
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requireAuth={requireAuth}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard requireAuth={true}>{children}</AuthGuard>
}

export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard requireAuth={false}>{children}</AuthGuard>
}
