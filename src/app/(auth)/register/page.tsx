"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { register, loginWithGithub } from "@/lib/api/adapters"
import { Github, ArrowRight, Check, Mail, Lock, User as UserIcon } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"
import { useLanguage } from "@/hooks/useLanguage"

export default function RegisterPage() {
  const { t } = useLanguage()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = ''
    }
  }, [])

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
      <div className="h-screen w-full relative overflow-hidden pt-16">
        {/* 背景图片 - 完整展示左侧，从真正的顶部开始 */}
        <div
          className="absolute -top-16 left-0 w-full h-[calc(100%+4rem)] bg-cover bg-center"
          style={{
            backgroundImage: "url('/login-bg.jpg')",
          }}
        />

        {/* 右侧深色面板 - 让表单区域更清晰 */}
        <div className="absolute top-0 right-0 h-full w-[360px] bg-gradient-to-l from-black/80 via-black/40 to-transparent" />

        {/* 表单区域 - 靠右固定位置，垂直水平居中 */}
        <div className="absolute top-1/2 right-16 -translate-y-1/2 z-10">
          <div className="flex flex-col items-center">
            {/* 标题 */}
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">
                {t("register.title")}
              </h1>
              <p className="text-sm text-white/70">
                {t("register.subtitle")}
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
                  {t("register.orContinueWithEmail")}
                </span>
              </div>

              {/* 表单输入 */}
              <form onSubmit={handleEmailRegister} className="space-y-3.5">
                <div className="relative">
                  <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder={t("register.username")}
                    className="w-full h-11 pl-12 pr-4 rounded-lg text-sm focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all bg-white/5 border border-white/15 text-white placeholder-white/50"
                    required
                  />
                </div>

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t("register.email")}
                    className="w-full h-11 pl-12 pr-4 rounded-lg text-sm focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all bg-white/5 border border-white/15 text-white placeholder-white/50"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("register.password")}
                    className="w-full h-11 pl-12 pr-4 rounded-lg text-sm focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all bg-white/5 border border-white/15 text-white placeholder-white/50"
                    required
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50" />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder={t("register.confirmPassword")}
                    className="w-full h-11 pl-12 pr-4 rounded-lg text-sm focus:outline-none focus:border-blue-400/50 focus:ring-1 focus:ring-blue-400/50 transition-all bg-white/5 border border-white/15 text-white placeholder-white/50"
                    required
                  />
                </div>

                {/* 密码要求 */}
                {(password.length > 0 || username.length > 0) && (
                  <div className="space-y-1.5 px-3 py-2.5 rounded-lg bg-white/5 border border-white/15">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${
                          req.met ? 'bg-green-500/20' : 'bg-white/5'
                        }`}>
                          <Check className={`h-3 w-3 transition-all ${
                            req.met ? 'text-green-400 scale-100' : 'text-white/30 scale-75'
                          }`} />
                        </div>
                        <span className={req.met ? 'text-green-400' : 'text-white/50'}>
                          {req.text}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white text-sm font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25"
                >
                  {loading ? (
                    <>
                      <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>创建账户中...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("register.registerButton")}</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 登录链接 */}
            <p className="mt-8 text-sm text-white/50">
              {t("register.alreadyHaveAccount")}{" "}
              <Link
                href="/login"
                className="font-medium text-blue-400 hover:text-blue-300 transition-colors"
              >
                {t("register.signIn")}
              </Link>
            </p>
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}
