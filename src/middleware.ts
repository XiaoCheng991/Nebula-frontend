import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

/**
 * Next.js 中间件 - 服务端路由保护
 *
 * 保护策略：
 * 1. 公开页面：首页、登录、注册、忘记密码 - 无需认证
 * 2. 受保护页面：dashboard、chat、drive、settings - 需要认证，未登录重定向到首页并提示
 * 3. 已登录用户访问登录/注册页 -> 重定向到 dashboard
 * 4. 已登录用户访问首页 -> 重定向到 dashboard
 */

// 受保护的路径列表
const protectedPaths = ['/dashboard', '/chat', '/drive', '/settings']

// 后台管理路径
const adminPaths = ['/admin']

// OAuth 回调路径（特殊处理 - 不参与受保护检测）
const oauthCallbackPaths = ['/auth/github/callback', '/auth/callback']

export async function middleware(req: NextRequest) {
  // 创建 Supabase 服务端客户端（读取 cookie）
  let response = NextResponse.next({ request: { headers: req.headers } })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return req.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { pathname } = req.nextUrl

  // OAuth 回调路径直接放行（让客户端处理 token）
  if (oauthCallbackPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return response
  }

  // 如果已经有 auth=required 参数，直接放行（避免死循环）
  const authParam = req.nextUrl.searchParams.get('auth')
  if (authParam === 'required') {
    return response
  }

  // 登录/注册页不在此处拦截，由客户端的 PublicRoute 组件处理
  if (pathname === '/login' || pathname === '/register') {
    return response
  }

  // 通过 Supabase 服务端客户端检查 session（会刷新 cookie）
  const { data: { session } } = await supabase.auth.getSession()
  const isLoggedIn = !!session

  // 已登录用户访问首页 -> 重定向到 dashboard
  if (pathname === '/' && isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 未登录用户访问受保护页面 -> 重定向到登录页
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  )

  if (isProtectedPath && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url)
    // 使用单重编码，避免双重编码问题
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 后台管理路径 - 需要登录
  const isAdminPath = adminPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  )

  if (isAdminPath && !isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('auth', 'required')
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
