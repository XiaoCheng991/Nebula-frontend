"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Github } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

// Loading 状态组件
function GitHubCallbackLoading() {
 return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
   <div className="text-center">
    <div className="flex justify-center mb-4">
     <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
    <p className="text-muted-foreground">正在处理 GitHub 登录...</p>
   </div>
  </div>
 )
}

// 实际的回调页面内容
function GitHubCallbackContent() {
 const router = useRouter()
 const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
 const [error, setError] = useState("")

 useEffect(() => {
  handleGithubCallback()
 }, [])

 const handleGithubCallback = async () => {

  try {
   // 获取 session
   const { data: { session }, error } = await supabase.auth.getSession()

   if (error || !session) {
    setError(error?.message || "获取会话失败")
    setStatus("error")
    return
   }

   const user = session.user

   // 在 sys_users 中创建或更新用户记录
   if (user.email) {
    const { data: existingUser } = await supabase
     .from('sys_users')
     .select('*')
     .eq('email', user.email)
     .single()

    if (!existingUser) {
     // 创建新用户记录
     await supabase.from('sys_users').insert({
      username: user.user_metadata?.login || user.email.split('@')[0],
      email: user.email,
      nickname: user.user_metadata?.name || user.email.split('@')[0],
      display_name: user.user_metadata?.name || user.email.split('@')[0],
      avatar_url: user.user_metadata?.avatar_url,
      online_status: 'offline',
      account_status: 1,
      last_seen_at: new Date().toISOString(),
     })
    } else {
     // 更新现有用户记录
     await supabase
      .from('sys_users')
      .update({
       avatar_url: user.user_metadata?.avatar_url,
       last_seen_at: new Date().toISOString(),
      })
      .eq('email', user.email)
    }
   }

   // 保存用户信息到 localStorage
   const userInfo = {
    id: user.id,
    username: user.user_metadata?.login || user.email || '',
    email: user.email,
    nickname: user.user_metadata?.name || user.user_metadata?.login || '',
    avatar: user.user_metadata?.avatar_url || null,
   }

   if (typeof window !== 'undefined') {
    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    window.dispatchEvent(new Event('auth-change'))
   }

   // 登录成功
   setStatus("success")
   toast({
    title: "登录成功",
    description: "欢迎回来，正在跳转...",
   })

   // 跳转到首页
   setTimeout(() => {
    router.push("/dashboard")
   }, 1500)
  } catch (err: any) {
   console.error("GitHub callback error:", err)
   setError(err.message || "登录失败，请稍后重试")
   setStatus("error")
  }
 }

 return (
  <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
   <div className="text-center">
    {status === "loading" && (
     <>
      <div className="flex justify-center mb-4">
       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
      <p className="text-muted-foreground">正在处理 GitHub 登录...</p>
     </>
    )}

    {status === "success" && (
     <>
      <div className="flex justify-center mb-4">
       <CheckCircle className="h-16 w-16 text-green-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">登录成功！</h1>
      <p className="text-muted-foreground">欢迎回来，正在跳转...</p>
     </>
    )}

    {status === "error" && (
     <>
      <div className="flex justify-center mb-4">
       <XCircle className="h-16 w-16 text-red-500" />
      </div>
      <h1 className="text-2xl font-bold mb-2">登录失败</h1>
      <p className="text-muted-foreground mb-6">
       {error || "GitHub 登录过程中出现错误，请重试"}
      </p>
      <button
       onClick={() => router.push("/login")}
       className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500"
      >
       返回登录
      </button>
     </>
    )}
   </div>
  </div>
 )
}

// 使用 Suspense 包装，解决 useSearchParams() 的静态生成问题
export default function GitHubCallbackPage() {
 return (
  <Suspense fallback={<GitHubCallbackLoading />}>
   <GitHubCallbackContent />
  </Suspense>
 )
}
