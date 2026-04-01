"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { login, loginWithGithub } from "@/lib/api/adapters"
import { Github, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"
import { useLanguage } from "@/hooks/useLanguage"
import { useThemeStore } from "@/hooks/useTheme"

export default function LoginPage() {
  const { t } = useLanguage()
  const { theme } = useThemeStore()
  const isDark = theme === 'dark'

  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(account, password)
      toast({ title: t("login.successLogin"), description: t("login.welcomeBack") })
      setTimeout(() => router.push("/dashboard"), 500)
    } catch (error: any) {
      const errorMessage = error?.message || t("login.errorLoginFailed")
      toast({ title: t("login.errorLoginFailed"), description: errorMessage, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    try {
      setLoading(true)
      await loginWithGithub()
    } catch (error: any) {
      toast({ title: t("login.githubLoginFailed"), description: error?.message || t("login.errorNetworkError"), variant: "destructive" })
      setLoading(false)
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen w-full flex">
        {/* 左侧 - 品牌展示区域 */}
        <div className={`hidden lg:flex w-1/2 relative overflow-hidden ${
          isDark
            ? 'bg-gradient-to-br from-[#0a0a0a] via-[#111111] to-[#0a0a0a]'
            : 'bg-gradient-to-br from-slate-100 via-white to-amber-50/50'
        }`}>
          {/* 深色模式 - 动态光晕背景 */}
          {isDark && (
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#3b82f6]/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#60a5fa]/8 rounded-full blur-[100px]" />
            </div>
          )}

          {/* 浅色模式 - 柔和渐变 */}
          {!isDark && (
            <div className="absolute inset-0">
              <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-orange-400/10 rounded-full blur-[120px]" />
              <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-[100px]" />
            </div>
          )}

          {/* 中心品牌内容 */}
          <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-12">
            <div className="mb-8">
              <div className={`inline-flex items-center justify-center w-20 h-20 rounded-3xl backdrop-blur-sm border ${
                isDark
                  ? 'bg-gradient-to-br from-[#3b82f6]/20 to-[#60a5fa]/20 border-[#3b82f6]/20'
                  : 'bg-gradient-to-br from-orange-100 to-amber-100 border-orange-200'
              }`}>
                <Mail className={`h-10 w-10 ${
                  isDark ? 'text-[#60a5fa]' : 'text-orange-500'
                }`} />
              </div>
            </div>
            <h1 className="text-5xl font-bold tracking-tight mb-4">
              <span className={isDark ? 'text-white' : 'text-slate-800'}>Nebula</span>
              <span className="text-[#3b82f6]">Hub</span>
            </h1>
            <p className={`text-lg font-light max-w-md mx-auto leading-relaxed ${
              isDark ? 'text-[#999]' : 'text-slate-600'
            }`}>
              {isDark ? '高雅黑设计，极致简约体验' : '优雅设计，极致体验'}
            </p>

            {/* 深色模式 - 装饰性网格 */}
            {isDark && (
              <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />
            )}
          </div>

          {/* 底部版权 */}
          <div className={`absolute bottom-8 left-8 text-xs ${
            isDark ? 'text-[#666]' : 'text-slate-400'
          }`}>
            © 2026 NebulaHub. All rights reserved.
          </div>
        </div>

        {/* 右侧 - 极简表单区域 */}
        <div className={`w-full lg:w-1/2 flex items-center justify-center ${
          isDark ? 'bg-[#0a0a0a]' : 'bg-white'
        }`}>
          <div className="w-full max-w-md px-8">
            {/* 标题区域 */}
            <div className="mb-10">
              <h1 className={`text-3xl font-bold mb-2 ${
                isDark ? 'text-white' : 'text-slate-800'
              }`}>
                {t("login.title")}
              </h1>
              <p className={`text-sm ${
                isDark ? 'text-[#999]' : 'text-slate-500'
              }`}>
                {t("login.subtitle")}
              </p>
            </div>

            {/* 表单区域 */}
            <div className="space-y-5">
              {/* Github 登录按钮 */}
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className={`w-full h-12 flex items-center justify-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed border ${
                  isDark
                    ? 'bg-[#141414] hover:bg-[#1a1a1a] text-[#e5e5e5] border-[#222] hover:border-[#3b82f6]/50'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-orange-300'
                }`}
              >
                <Github className={`h-4 w-4 ${
                  isDark ? 'text-white' : 'text-slate-800'
                }`} />
                <span>{t("common.continueWithGithub")}</span>
              </button>

              {/* 分隔线 */}
              <div className="relative flex items-center">
                <div className={`w-full border-t ${
                  isDark ? 'border-[#222]' : 'border-slate-200'
                }`} />
                <span className={`absolute left-1/2 -translate-x-1/2 px-4 text-xs ${
                  isDark ? 'bg-[#0a0a0a] text-[#666]' : 'bg-white text-slate-400'
                }`}>
                  {t("common.orContinueWithEmail")}
                </span>
              </div>

              {/* 邮箱密码表单 */}
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {/* 邮箱输入 */}
                <div className="relative">
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isDark ? 'text-[#666]' : 'text-slate-400'
                  }`} />
                  <input
                    type="email"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder={t("login.email")}
                    className={`w-full h-12 pl-11 pr-4 rounded-xl text-sm focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all ${
                      isDark
                        ? 'bg-[#141414] border border-[#222] text-[#e5e5e5] placeholder-[#666]'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300'
                    }`}
                    required
                  />
                </div>

                {/* 密码输入 */}
                <div className="relative">
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 ${
                    isDark ? 'text-[#666]' : 'text-slate-400'
                  }`} />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("login.password")}
                    className={`w-full h-12 pl-11 pr-12 rounded-xl text-sm focus:outline-none focus:border-[#3b82f6]/50 focus:ring-1 focus:ring-[#3b82f6]/50 transition-all ${
                      isDark
                        ? 'bg-[#141414] border border-[#222] text-[#e5e5e5] placeholder-[#666]'
                        : 'bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 hover:border-slate-300'
                    }`}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors ${
                      isDark ? 'text-[#666] hover:text-[#999]' : 'text-slate-400 hover:text-slate-600'
                    }`}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                {/* 忘记密码链接 */}
                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className={`text-xs transition-colors ${
                      isDark ? 'text-[#666] hover:text-[#999]' : 'text-slate-500 hover:text-slate-700'
                    }`}
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>

                {/* 提交按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-12 rounded-xl bg-gradient-to-r from-[#3b82f6] to-[#60a5fa] hover:from-[#2563eb] hover:to-[#3b82f6] text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>登录中...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("login.loginButton")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 注册链接 */}
            <p className={`text-center mt-8 text-xs ${
              isDark ? 'text-[#666]' : 'text-slate-500'
            }`}>
              {t("login.newToNebulaHub")}{" "}
              <Link
                href="/register"
                className="font-medium text-[#60a5fa] hover:text-[#3b82f6] transition-colors"
              >
                {t("login.createAccount")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}
