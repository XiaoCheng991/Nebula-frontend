"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { register } from "@/lib/api/modules/auth"
import { Github, ArrowRight, Check } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"

export default function RegisterPage() {
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "两次输入的密码不一致，请检查",
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: "密码太短",
        description: "密码至少需要6个字符",
        variant: "destructive",
      })
      return
    }

    if (username.length < 3) {
      toast({
        title: "用户名太短",
        description: "用户名至少需要3个字符",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await register({
        username,
        email,
        password,
        nickname: username,
      })

      toast({
        title: "注册成功",
        description: "欢迎加入NebulaHub！正在跳转...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 500)

    } catch (error: any) {
      toast({
        title: "注册失败",
        description: error.message || "注册失败，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
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

  const passwordRequirements = [
    { met: password.length >= 6, text: "至少6个字符" },
    { met: password === confirmPassword && password.length > 0, text: "两次密码一致" },
    { met: username.length >= 3, text: "用户名至少3个字符" },
  ]

  return (
    <PublicRoute>
      {/* 页面容器 - 和登录页保持一致 */}
      <div className="min-h-screen w-full flex flex-col items-center justify-start pt-20 sm:pt-24 pb-8 px-4 sm:px-6">
        {/* 背景色 - 和登录页完全一致 */}
        <div className="fixed inset-0 -z-10 bg-[#fafafa] dark:bg-[#0d0d0d]" />

        {/* 内容区域 */}
        <div className="w-full max-w-[360px]">
          {/* 标题 */}
          <div className="text-center mb-6">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white tracking-tight">
              创建账户
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              欢迎加入 NebulaHub
            </p>
          </div>

          {/* 注册卡片 - 和登录页样式统一 */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden">
            <div className="p-5 space-y-4">
              {/* GitHub 登录按钮 */}
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2.5 rounded-xl bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-sm font-medium transition-all duration-200 hover:bg-gray-800 dark:hover:bg-gray-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Github className="h-[18px] w-[18px]" />
                <span>使用 GitHub 注册</span>
              </button>

              {/* 分隔线 */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-100 dark:border-white/[0.04]" />
                </div>
                <span className="relative bg-white dark:bg-[#141414] px-2.5 text-[11px] text-gray-400 dark:text-gray-500 font-medium">
                  或使用邮箱注册
                </span>
              </div>

              {/* 表单 */}
              <form onSubmit={handleEmailRegister} className="space-y-3">
                {/* 用户名 */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
                    用户名
                  </label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
                    placeholder="用户名（至少3个字符）"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                </div>

                {/* 邮箱 */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
                    邮箱
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
                    placeholder="your@email.com"
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
                    placeholder="设置密码（至少6个字符）"
                    required
                    minLength={6}
                  />
                </div>

                {/* 确认密码 */}
                <div className="space-y-1.5">
                  <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
                    确认密码
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
                    placeholder="再次输入密码"
                    required
                  />
                </div>

                {/* 密码强度提示 */}
                {password.length > 0 && (
                  <div className="space-y-1.5 px-1">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-[11px]">
                        <Check
                          className={`h-3.5 w-3.5 ${
                            req.met ? "text-green-500" : "text-gray-400"
                          }`}
                        />
                        <span className={req.met ? "text-green-600 dark:text-green-400" : "text-gray-500 dark:text-gray-400"}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 注册按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-10 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>注册中...</span>
                    </>
                  ) : (
                    <>
                      <span>创建账户</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* 登录链接 */}
          <p className="text-center mt-5 text-[13px] text-gray-500 dark:text-gray-400">
            已有账户？{" "}
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              立即登录
            </Link>
          </p>
        </div>
      </div>
    </PublicRoute>
  )
}
