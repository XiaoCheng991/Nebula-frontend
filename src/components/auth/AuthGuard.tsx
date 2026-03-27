"use client"

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { isAuthenticatedSync, isUserLoggedIn } from '@/lib/auth/token-manager'
import { Loader2 } from 'lucide-react'
import { useAuthPrompt } from '@/hooks/useAuthPrompt'
import { supabase } from '@/lib/supabase/client'

/**
 * 认证守卫组件（HOC）
 *
 * 用法：
 * 1. 保护需要登录的页面：<AuthGuard><YourPage /></AuthGuard>
 * 2. 保护未登录才能访问的页面：<AuthGuard requireAuth={false}><LoginPage /></AuthGuard>
 *
 * 特性：
 * - 客户端二次验证（配合 middleware.ts 的服务端验证）
 * - Toast 提示而不是强制跳转
 * - 用户体验更好
 */

interface AuthGuardProps {
  children: React.ReactNode
  /**
   * 是否需要认证
   * - true: 需要登录才能访问（默认）
   * - false: 未登录才能访问（登录/注册页）
   */
  requireAuth?: boolean
  /**
   * 加载时显示的内容
   */
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
  const [isLoading, setIsLoading] = useState(true)
  const [isAuth, setIsAuth] = useState(false)

  useEffect(() => {
    const checkAuthentication = async () => {
      // 先快速检查 localStorage
      const hasLocalAuth = isAuthenticatedSync()

      if (requireAuth) {
        // 需要认证的页面
        if (!hasLocalAuth) {
          // 没有本地认证，检查 Supabase session
          const { data: { session } } = await supabase.auth.getSession()
          if (!session) {
            checkAuth(pathname)
          }
        }
      } else {
        // 不需要认证的页面（登录/注册）
        if (hasLocalAuth) {
          checkGuest()
        }
      }

      setIsAuth(hasLocalAuth)
      setIsLoading(false)
    }

    checkAuthentication()
  }, [requireAuth, pathname, checkAuth, checkGuest])

  // 检查认证状态（使用 Supabase 实时状态）
  useEffect(() => {
    // 立即使用同步检查更新状态（用于快速响应）
    setIsAuth(isUserLoggedIn())

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN') {
        setIsAuth(true)
      } else if (event === 'SIGNED_OUT') {
        setIsAuth(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  // 如果正在加载，显示 loading
  if (isLoading && fallback) {
    return <>{fallback}</>
  }

  // 认证状态正确，显示内容
  return <>{children}</>
}

/**
 * 高阶组件版本 - 用于包裹页面组件
 *
 * @example
 * // 使用示例
 * export default withAuth(MyDashboardPage)
 * export default withAuth(MyLoginPage, false)
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  requireAuth: boolean = true
) {
  return function AuthenticatedComponent(props: P) {
    return (
      <AuthGuard requireAuth={requireAuth}>
        <Component {...props} />
      </AuthGuard>
    )
  }
}

/**
 * 用于受保护页面的简单包装器
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard requireAuth={true}>{children}</AuthGuard>
}

/**
 * 用于公开页面（登录/注册）的包装器
 */
export function PublicRoute({ children }: { children: React.ReactNode }) {
  return <AuthGuard requireAuth={false}>{children}</AuthGuard>
}
