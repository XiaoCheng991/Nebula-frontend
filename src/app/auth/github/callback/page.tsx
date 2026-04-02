"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
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
      // Supabase 会自动从 URL hash 中解析 OAuth token
      // 等待一下让 Supabase 客户端处理
      await new Promise(resolve => setTimeout(resolve, 500))

      // 获取会话
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setError("获取会话失败：" + sessionError.message)
        setStatus("error")
        return
      }

      if (!session) {
        console.error("No session found")
        // 检查 URL 中是否有错误信息
        const hash = window.location.hash
        if (hash.includes('error=')) {
          const params = new URLSearchParams(hash.substring(1))
          const errorDesc = params.get('error_description') || '未知错误'
          setError("GitHub 登录失败：" + decodeURIComponent(errorDesc))
          setStatus("error")
          return
        }

        // 等待 onAuthStateChange 事件
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
          console.log("Auth event:", event, newSession)
          if (event === 'SIGNED_IN' && newSession) {
            await processSession(newSession)
            subscription.unsubscribe()
          }
        })

        // 超时保护
        setTimeout(() => {
          subscription.unsubscribe()
          setError("登录超时，请重试")
          setStatus("error")
        }, 10000)
        return
      }

      // 有 session，直接处理
      await processSession(session)
    } catch (err: any) {
      console.error("GitHub callback error:", err)
      setError(err.message || "登录失败，请稍后重试")
      setStatus("error")
    }
  }

  const processSession = async (session: any) => {
    const user = session.user
    console.log("Processing session for user:", user.email)

    // 构建用户信息（与 login/register 保持一致）
    const userInfo = {
      id: user.id,
      username: user.user_metadata?.login || user.user_metadata?.username || user.email?.split('@')[0] || '',
      email: user.email,
      nickname: user.user_metadata?.name || user.user_metadata?.nickname || user.user_metadata?.login || '',
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatar || null,
      avatarName: user.user_metadata?.avatar_name || null,
      avatarSize: user.user_metadata?.avatar_size || null,
    }

    // 保存到 localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userInfo', JSON.stringify(userInfo))
      // 触发自定义事件通知其他组件
      window.dispatchEvent(new Event('auth-change'))
    }

    // 触发 toast 通知
    setStatus("success")
    toast({
      title: "登录成功",
      description: "欢迎回来！",
    })

    console.log("Login successful, redirecting to dashboard")
    console.log("User info:", userInfo)

    // 获取 redirect 参数
    let redirectPath = "/dashboard"
    const hash = window.location.hash
    if (hash.includes('redirect=')) {
      const params = new URLSearchParams(hash.substring(1))
      const redirect = params.get('redirect')
      if (redirect) {
        redirectPath = decodeURIComponent(redirect)
      }
    }

    // 使用 replace 而不是 push，避免回退到回调页面
    setTimeout(() => {
      router.replace(redirectPath)
    }, 1000)
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
            <p className="text-xs text-slate-400 mt-2">如果长时间未响应，请检查是否已授权</p>
          </>
        )}

        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-16 w-16 text-green-500" />
            </div>
            <h1 className="text-2xl font-bold mb-2">登录成功！</h1>
            <p className="text-muted-foreground">正在跳转...</p>
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

// 使用 Suspense 包装
export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<GitHubCallbackLoading />}>
      <GitHubCallbackContent />
    </Suspense>
  )
}
