"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle } from "lucide-react"
import { supabase } from "@/lib/supabase/client"

function GitHubCallbackLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4" />
        <p className="text-muted-foreground">正在处理 GitHub 登录...</p>
      </div>
    </div>
  )
}

function GitHubCallbackContent() {
  const router = useRouter()
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
  const [error, setError] = useState("")

  useEffect(() => {
    handleGithubCallback()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleGithubCallback = async () => {
    try {
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError) {
        console.error("Session error:", sessionError)
        setError("获取会话失败：" + sessionError.message)
        setStatus("error")
        return
      }

      if (!session) {
        setError("未获取到会话，请重试")
        setStatus("error")
        return
      }

      await processSession(session)
    } catch (err: any) {
      console.error("GitHub callback error:", err)
      setError(err.message || "登录失败，请稍后重试")
      setStatus("error")
    }
  }

  const processSession = async (session: any) => {
    const user = session.user
    const userInfo = {
      id: user.id,
      username: user.user_metadata?.login || user.user_metadata?.username || user.email?.split('@')[0] || '',
      email: user.email,
      nickname: user.user_metadata?.name || user.user_metadata?.nickname || user.user_metadata?.login || '',
      avatarUrl: user.user_metadata?.avatar_url || user.user_metadata?.avatar || null,
      avatarName: user.user_metadata?.avatar_name || null,
      avatarSize: user.user_metadata?.avatar_size || null,
    }

    localStorage.setItem('userInfo', JSON.stringify(userInfo))
    window.dispatchEvent(new Event('auth-change'))

    setStatus("success")
    toast({
      title: "登录成功",
      description: `欢迎回来，${user.user_metadata?.name || userInfo.nickname}！`,
    })

    // 从 URL query string 获取 redirect 参数（不是 hash）
    const params = new URLSearchParams(window.location.search)
    const redirect = params.get('redirect')
    const redirectPath = redirect ? decodeURIComponent(redirect) : '/dashboard'

    setTimeout(() => {
      router.replace(redirectPath)
    }, 800)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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

export default function GitHubCallbackPage() {
  return (
    <Suspense fallback={<GitHubCallbackLoading />}>
      <GitHubCallbackContent />
    </Suspense>
  )
}
