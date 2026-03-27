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

// 公开路径（无需登录）
const publicPaths = ['/', '/login', '/register', '/forgot-password', '/home']

// OAuth 回调路径（特殊处理 - 不参与受保护检测）
const oauthCallbackPaths = ['/auth/github/callback', '/auth/callback']

// 检查是否已登录
// 注意：由于 supabase-js 默认使用 localStorage 存储 session，
// 中间件无法直接读取 localStorage，所以这里暂时返回 true
// 实际的认证检查由客户端的 AuthGuard 处理
function isAuthenticated(req: NextRequest): boolean {
  // 对于开发环境，暂时允许所有请求通过
  // 生产环境需要配置 @supabase/ssr 来处理 cookie
  return true
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // OAuth 回调路径直接放行（让客户端处理 token）
  if (oauthCallbackPaths.some(path => pathname === path || pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // 如果已经有 auth=required 参数，直接放行（避免死循环）
  const authParam = req.nextUrl.searchParams.get('auth')
  if (authParam === 'required') {
    return NextResponse.next()
  }

  const isLoggedIn = isAuthenticated(req)

  // 情况1：已登录用户访问登录/注册页 -> 重定向到 dashboard
  if ((pathname === '/login' || pathname === '/register') && isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 情况2：已登录用户访问首页 -> 重定向到 dashboard
  if (pathname === '/' && isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // 情况3：未登录用户访问受保护页面 -> 重定向到首页并带上提示参数
  const isProtectedPath = protectedPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  )

  if (isProtectedPath && !isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('auth', 'required')
    return NextResponse.redirect(url)
  }

  // 情况4：后台管理路径 - 需要登录（后续会完善角色检查）
  const isAdminPath = adminPaths.some(path =>
    pathname === path || pathname.startsWith(path + '/')
  )

  if (isAdminPath && !isLoggedIn) {
    const url = req.nextUrl.clone()
    url.pathname = '/'
    url.searchParams.set('auth', 'required')
    return NextResponse.redirect(url)
  }

  // 其他情况放行
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
