"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { login, loginWithGithub } from "@/lib/api/adapters"
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
   await login(account, password)

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
  try {
   setLoading(true)
   await loginWithGithub()
  } catch (error: any) {
   toast({
    title: "GitHub 登录失败",
    description: error?.message || "网络错误，请稍后重试",
    variant: "destructive",
   })
   setLoading(false)
  }
 }

 return (
  <PublicRoute>
   <div className="min-h-screen w-full flex flex-col items-center justify-start pt-20 sm:pt-24 pb-8 px-4 sm:px-6">
    <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-[#0d0d0d]" />

    <div className="w-full max-w-[360px]">
     <div className="text-center mb-6">
      <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
       登录 NebulaHub
      </h1>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
       输入你的账号继续
      </p>
     </div>

     <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden">
      <div className="p-5 space-y-4">
       <button
        onClick={handleGithubLogin}
        disabled={loading}
        className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
       >
        <Github className="h-[18px] w-[18px]" />
        <span>使用 GitHub 登录</span>
       </button>

       <div className="relative flex items-center justify-center">
        <div className="absolute inset-0 flex items-center">
         <div className="w-full border-t border-gray-100 dark:border-white/[0.04]" />
        </div>
        <span className="relative bg-white dark:bg-[#141414] px-2.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
         或使用邮箱登录
        </span>
       </div>

       <form onSubmit={handleEmailLogin} className="space-y-3">
        <div className="space-y-1.5">
         <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
          邮箱
         </label>
         <input
          type="email"
          value={account}
          onChange={(e) => setAccount(e.target.value)}
          onFocus={() => setFocusedField('account')}
          onBlur={() => setFocusedField(null)}
          className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
          placeholder="name@example.com"
          required
         />
        </div>

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
        </div>

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
