"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { login, loginWithGithub } from "@/lib/api/adapters"
import { isSupabaseMode } from "@/lib/api/mode-config"
import { Github, ArrowRight } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"

export default function LoginPage() {
 const [account, setAccount] = useState("")
 const [password, setPassword] = useState("")
 const [loading, setLoading] = useState(false)
 const [focusedField, setFocusedField] = useState<string | null>(null)
 const router = useRouter()

 const handleEmailLogin = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
   // Supabase 模式：使用邮箱登录
   if (isSupabaseMode()) {
    await login(account, password)
   } else {
    // Java Backend 模式：使用账号密码登录
    // @ts-ignore - Java Backend 的 login 接受对象参数
    await login({ account, password })
   }

   toast({
    title: "登录成功",
    description: "欢迎回来！正在跳转...",
   })

   setTimeout(() => {
    router.push("/dashboard")
   }, 500)
  } catch (error: any) {
   const errorMessage = error?.message || "登录失败，请检查账号和密码"

   toast({
    title: "登录失败",
    description: errorMessage,
    variant: "destructive",
   })
  } finally {
   setLoading(false)
  }
 }

 const handleGithubLogin = async () => {
  if (isSupabaseMode()) {
   // Supabase 模式：使用 GitHub OAuth
   try {
    setLoading(true)
    await loginWithGithub()
    // signInWithOAuth 会重定向用户到 GitHub，代码不会执行到这里
   } catch (error: any) {
    toast({
     title: "GitHub 登录失败",
     description: error?.message || "网络错误，请稍后重试",
     variant: "destructive",
    })
    setLoading(false)
   }
  } else {
   // Java Backend 模式
   setLoading(true)
   try {
    const res = await fetch(
     `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/oauth/github/authorize`,
     { credentials: 'include' }
    )
    const data = await res.json()

    if (data.code === 200 && data.data?.authorizeUrl) {
     window.location.href = data.data.authorizeUrl
    } else {
     toast({
      title: "获取授权链接失败",
      description: data.message || "请稍后重试",
      variant: "destructive",
     })
    }
   } catch (error) {
    toast({
     title: "获取授权链接失败",
     description: "网络错误，请稍后重试",
     variant: "destructive",
    })
   } finally {
    setLoading(false)
   }
  }
 }

 return (
  <PublicRoute>
   {/* 页面容器 - 减少顶部间距，让内容更靠上 */}
   <div className="min-h-screen w-full flex flex-col items-center justify-start pt-20 sm:pt-24 pb-8 px-4 sm:px-6">
    {/* 背景色 - 使用纯色避免 hydration 问题 */}
    <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-[#0d0d0d]" />

    {/* 内容区域 */}
    <div className="w-full max-w-[360px]">
     {/* 标题 */}
     <div className="text-center mb-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
       登录 NebulaHub
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
       输入你的账号继续
      </p>
     </div>

     {/* 登录卡片 */}
     <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      <div className="p-5 space-y-4">
       {/* GitHub 登录 */}
       <button
        onClick={handleGithubLogin}
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
       >
        <Github className="h-[18px] w-[18px]" />
        <span>使用 GitHub 登录</span>
       </button>

       {/* 分隔线 */}
       <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
         <div className="w-full border-t border-gray-100 dark:border-white/[0.04]" />
        </div>
        <span className="relative bg-white dark:bg-[#141414] px-2.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
         或使用账号登录
        </span>
       </div>

       {/* 表单 */}
       <form onSubmit={handleEmailLogin} className="space-y-3">
        {/* 账号 */}
        <div className="space-y-1.5">
         <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
          用户名或邮箱
         </label>
         <input
          type="text"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          onFocus={() => setFocusedField('account')}
          onBlur={() => setFocusedField(null)}
          className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
          placeholder="name@example.com"
          required
         />
        </div>

        {/* 密码 */}
        <div className="space-y-1.5">
         <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
          密码
         </label>
         <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onFocus={() => setFocusedField('password')}
          onBlur={() => setFocusedField(null)}
          className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
          placeholder="••••••••"
          required
         />

         <Link
          href="/forgot-password"
          tabIndex={0}
          className="mt-1 block text-[11px] text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
         >
          忘记密码？
         </Link>
        </div>

        {/* 登录按钮 */}
        <button
         type="submit"
         disabled={loading}
         className="w-full h-10 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
         {loading ? (
          <>
           <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
           <span>登录中...</span>
          </>
         ) : (
          <>
           <span>登录</span>
           <ArrowRight className="h-4 w-4" />
          </>
         )}
        </button>
       </form>
      </div>
     </div>

     {/* 注册链接 */}
     <p className="text-center mt-5 text-[13px] text-gray-500 dark:text-gray-400">
      还没有账户？{" "}
      <Link
       href="/register"
       className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
      >
       注册
      </Link>
     </p>
    </div>
   </div>
  </PublicRoute>
 )
}
