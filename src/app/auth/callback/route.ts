/**
 * OAuth 回调服务端路由
 *
 * Supabase OAuth 登录后会先走这里，我们需要：
 * 1. 通过 exchangeCodeForSession 换取有效 session
 * 2. 将 Supabase 认证 cookie 写入响应
 * 3. 重定向到正确的页面
 */
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // 如果传了 redirect 参数，使用它；否则默认跳转 dashboard
  const next = searchParams.get('next') || '/dashboard'

  if (!code) {
    // 没有授权码，跳转到登录页
    return NextResponse.redirect(new URL('/login', origin))
  }

  const cookieStore = cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  // 用 code 换取 session（这会写入 cookie）
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('OAuth 回调 exchangeCodeForSession 失败:', error.message)
    return NextResponse.redirect(new URL('/login', origin))
  }

  // 重定向到目标页面
  return NextResponse.redirect(new URL(next, origin))
}
