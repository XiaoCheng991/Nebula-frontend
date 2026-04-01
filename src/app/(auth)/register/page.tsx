"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { register, loginWithGithub } from "@/lib/api/adapters"
import { Github, ArrowRight, Check, Mail, Lock, User as UserIcon } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"
import { useLanguage } from "@/hooks/useLanguage"
import { useThemeEffect } from "@/hooks/useTheme"

export default function RegisterPage() {
  const { t } = useLanguage()
  useThemeEffect()

  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({ title: "密码不匹配", description: "请确保两次输入的密码一致", variant: "destructive" })
      return
    }

    if (password.length < 6) {
      toast({ title: "密码太短", description: "密码至少需要 6 个字符", variant: "destructive" })
      return
    }

    if (username.length < 3) {
      toast({ title: "用户名太短", description: "用户名至少需要 3 个字符", variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      await register(username, email, password, username)
      toast({ title: "注册成功", description: "欢迎加入 NebulaHub" })
      setTimeout(() => router.push("/dashboard"), 500)
    } catch (error: any) {
      toast({ title: "注册失败", description: error.message || "网络错误", variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    try {
      setLoading(true)
      await loginWithGithub()
    } catch (error: any) {
      toast({ title: "GitHub 注册失败", description: error?.message || "网络错误", variant: "destructive" })
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { met: username.length >= 3, text: "用户名至少 3 个字符" },
    { met: password.length >= 6, text: "密码至少 6 个字符" },
    { met: password === confirmPassword && password.length > 0, text: "密码一致" },
  ]

  return (
    <PublicRoute>
      <div className="min-h-screen w-full flex">
        {/* 左侧 - 简约品牌展示 */}
        <div className="hidden lg:flex w-1/2 relative overflow-hidden bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]">
          {/* 动态光晕背景 */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#3b82f6]/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#60a5fa]/8 rounded-full blur-[100px]" />
          </div>

          {/* 中心品牌内容 */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-12">
            <div className="mb-8">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-[#3b82f6]/20 to-[#60a5fa]/20 backdrop-blur-sm border border-[#3b82f6]/20">
                <UserIcon className="h-10 w-10 text-[#60a5fa]" />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              <span className="text-white">加入 </span>
              <span className="text-[#3b82f6]">NebulaHub</span>
            </h1>
            <p className="text-lg text-[#999] font-light max-w-md mx-auto leading-relaxed">
              创建账户，开启智能协作之旅
            </p>

            {/* 装饰性网格 */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
          </div>

          {/* 底部版权 */}
          <div className="absolute bottom-8 left-8 text-[#666] text-xs">
            © 2026 NebulaHub. All rights reserved.
          </div>
        </div>

        {/* 右侧 - 极简表单区域 */}
        <div className="w-full lg:w-1/2 flex items-center justify-center bg-[#0a0a0a]">
          <div className="w-full max-w-md px-8">
            {/* 标题区域 */}
            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2">创建账户</h1>
              <p className="text-[#999] text-sm">加入 NebulaHub 社区</p>
            </div>

            {/* 表单区域 */}
            <div className="space-y-5">
              {/* GitHub 登录按钮 */}
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full h-12 flex items-center justify-center gap-3 rounded-xl bg-[#141414] hover:bg-[#1a1a1a] text-[#e5e5e5] text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border border-[#222] hover:border-[#3b82f6]/50"
              >
                <Github className="h-4 w-4" />
                <span>继续使用 GitHub</span>
              </button>

              {/* 分隔线 */}
              <div className="relative flex items-center">
                <div className="w-full border-t border-[#222]" />
                <span className="absolute left-1/2 -translate-x-1/2 bg-[#0a0a0a] px-4 text-xs text-[#666]">
                  或使用邮箱注册
                </span>
              </div>

              {/* 邮箱表单 */}
              <form onSubmit={handleEmailRegister} className="space-y-4">
                {/* 用户名输入 */}
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="用户名"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#141414] border border-[#222] text-[#e5e5e5] text-sm placeholder-[#666] focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all"
                    required
                  />
                </div>

                {/* 邮箱输入 */}
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="邮箱地址"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#141414] border border-[#222] text-[#e5e5e5] text-sm placeholder-[#666] focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all"
                    required
                  />
                </div>

                {/* 密码输入 */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="密码"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#141414] border border-[#222] text-[#e5e5e5] text-sm placeholder-[#666] focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all"
                    required
                  />
                </div>

                {/* 确认密码输入 */}
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#666]" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="确认密码"
                    className="w-full h-12 pl-11 pr-4 rounded-xl bg-[#141414] border border-[#222] text-[#e5e5e5] text-sm placeholder-[#666] focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all"
                    required
                  />
                </div>

                {/* 密码要求 */}
                {(password.length > 0 || username.length > 0) && (
                  <div className="space-y-2 px-4 py-3 rounded-xl bg-[#141414] border border-[#222]">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3 text-xs">
                        <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          req.met ? 'bg-[#22c55e]/20' : 'bg-[#1a1a1a]'
                        }`}>
                          <Check className={`h-3.5 w-3.5 transition-all duration-200 ${
                            req.met ? 'text-[#22c55e] scale-100' : 'text-[#666] scale-75'
                          }`} />
                        </div>
                        <span className={req.met ? 'text-[#22c55e]' : 'text-[#666]'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#2563eb] hover:to-[#3b82f6] text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>创建账户中...</span>
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

            {/* 登录链接 */}
            <p className="text-center mt-8 text-xs text-[#666]">
              已经有账户？{" "}
              <Link
                href="/login"
                className="font-medium text-[#60a5fa] hover:text-[#3b82f6] transition-colors"
              >
                立即登录
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}
