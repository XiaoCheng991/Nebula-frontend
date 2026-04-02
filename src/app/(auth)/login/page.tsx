"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { login, loginWithGithub } from "@/lib/api/adapters"
import { Github, ArrowRight, Mail, Lock, Eye, EyeOff } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"
import { useLanguage } from "@/hooks/useLanguage"

export default function LoginPage() {
  const { t } = useLanguage()
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
      <div >
        {/* 背景图片 - 完整展示左侧，从真正的顶部开始 */}
        <div
          className="absolute -top-16 left-0 w-full h-[calc(100%+4rem)] bg-cover bg-center"
          style={{
            backgroundImage: "url('/login-bg.jpg')",
          }}
        />

        {/* 右侧深色面板 - 让表单区域更清晰 */}
        <div className="absolute top-0 right-0 h-full w-[320px] bg-gradient-to-l from-black/80 via-black/40 to-transparent" />

        {/* 表单区域 - 靠右固定位置，垂直水平居中 */}
        <div className="absolute top-1/2 right-16 -translate-y-1/2 z-10">
          <div className="flex flex-col items-center">
            {/* 标题 */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                {t("login.title")}
              </h1>
              <p className="text-sm text-white/70">
                {t("login.subtitle")}
              </p>
            </div>

            {/* 表单 */}
            <div className="space-y-4 w-[320px]">
              {/* Github 登录 */}
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full h-11 flex items-center justify-center gap-2 rounded-lg text-sm font-medium transition-all disabled:opacity-50 bg-white/10 hover:bg-white/20 text-white border border-white/20"
              >
                <Github className="h-4 w-4" />
                <span>{t("common.continueWithGithub")}</span>
              </button>

              {/* 分隔线 */}
              <div className="relative flex items-center my-5">
                <div className="w-full border-t border-white/15" />
                <span className="absolute left-1/2 -translate-x-1/2 px-3 text-xs text-white/50">
                  {t("common.orContinueWithEmail")}
                </span>
              </div>

              {/* 表单输入 */}
              <form onSubmit={handleEmailLogin} className="space-y-3.5">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="email"
                    value={account}
                    onChange={(e) => setAccount(e.target.value)}
                    placeholder={t("login.email")}
                    className="w-full h-11 pl-12 pr-4 rounded-lg text-sm focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all bg-white/5 border border-white/15 text-white placeholder-white/50"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("login.password")}
                    className="w-full h-11 pl-12 pr-12 rounded-lg text-sm focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all bg-white/5 border border-white/15 text-white placeholder-white/50"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/forgot-password"
                    className="text-xs text-white/50 hover:text-white/80 transition-colors"
                  >
                    {t("login.forgotPassword")}
                  </Link>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
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
            <p className="mt-8 text-sm text-white/50">
              {t("login.newToNebulaHub")}{" "}
              <Link
                href="/register"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
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
