"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { register, loginWithGithub } from "@/lib/api/adapters"
import { Github, ArrowRight, Check, Sparkles } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"
import { useLanguage } from "@/hooks/useLanguage"
import { useThemeEffect } from "@/hooks/useTheme"

export default function RegisterPage() {
  const { t } = useLanguage()

  // 应用主题效果（跟随系统或用户选择的主题）
  useThemeEffect()

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
        title: t("register.passwordMismatch"),
        description: t("register.passwordMismatch"),
        variant: "destructive",
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: t("register.passwordTooShort"),
        description: t("register.passwordMin6"),
        variant: "destructive",
      })
      return
    }

    if (username.length < 3) {
      toast({
        title: t("register.usernameTooShort"),
        description: t("register.usernameMin3"),
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await register(username, email, password, username)

      toast({
        title: t("register.successRegister"),
        description: t("register.welcomeToNebulaHub"),
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error: any) {
      toast({
        title: t("register.registerFailed"),
        description: error.message || t("register.networkError"),
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
        title: t("register.githubRegisterFailed"),
        description: error?.message || t("register.networkError"),
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { met: username.length >= 3, text: t("register.usernameMin3") },
    { met: password.length >= 6, text: t("register.passwordMin6") },
    { met: password === confirmPassword && password.length > 0, text: t("register.passwordMatch") },
  ]

  return (
    <PublicRoute>
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-[#030407] dark:to-[#0a0a0f]">
        {/* 网格背景装饰 */}
        <div className="fixed inset-0 -z-10 opacity-5 pointer-events-none">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* 技术装饰标签 */}
        <div className="fixed top-8 left-8 z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500 dark:text-white/30 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            {t("register.systemLabel")}
          </div>
        </div>

        <div className="fixed bottom-8 left-8 z-10">
          <div className="text-[10px] font-mono text-slate-400 dark:text-white/20 tracking-widest">
            {t("register.uplinkEstablished")}
          </div>
        </div>

        <div className="fixed top-1/2 right-8 z-10 -translate-y-1/2">
          <div className="text-[10px] font-mono text-slate-400 dark:text-white/20 tracking-widest writing-vertical-rl">
            {t("register.nebulaId")}
          </div>
        </div>

        <div className="w-full max-w-[440px] px-4">
          {/* 头部区域 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/5 dark:bg-white/5 border border-slate-200 dark:border-white/10">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-mono text-slate-500 dark:text-white/60 tracking-wider">NEBULA.ID</span>
            </div>
            <h1 className="text-3xl font-medium text-slate-800 dark:text-white tracking-tight">
              {t("register.title")}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-white/40">
              {t("register.subtitle")}
            </p>
          </div>

          {/* 主卡片 */}
          <div className="relative bg-white/80 dark:bg-white/5 backdrop-blur-xl rounded-[32px] border border-slate-200 dark:border-white/10 overflow-hidden">
            {/* 卡片顶部光效 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            <div className="p-8 space-y-6">
              {/* GitHub 注册按钮 */}
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full h-14 flex items-center justify-center gap-3 rounded-full bg-white text-slate-800 text-sm font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
              >
                <Github className="h-5 w-5" />
                <span>{t("common.continueWithGithub")}</span>
              </button>

              {/* 分割线 */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200 dark:border-white/5" />
                </div>
                <span className="relative bg-white/80 dark:bg-[#030407]/80 px-4 text-[10px] text-slate-400 dark:text-white/30 font-mono tracking-wider uppercase">
                  {t("register.orContinueWithEmail")}
                </span>
              </div>

              {/* 注册表单 */}
              <form onSubmit={handleEmailRegister} className="space-y-4">
                {/* 用户名 */}
                <div className="relative">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    onFocus={() => setFocusedField('username')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'username' || username
                      ? '-top-8 text-amber-600/80 dark:text-amber-400/80'
                      : 'text-slate-400 dark:text-white/30'
                  }`}>
                    {t("register.username")}
                  </label>
                </div>

                {/* 邮箱 */}
                <div className="relative">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    onFocus={() => setFocusedField('email')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    required
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'email' || email
                      ? '-top-8 text-amber-600/80 dark:text-amber-400/80'
                      : 'text-slate-400 dark:text-white/30'
                  }`}>
                    {t("register.email")}
                  </label>
                </div>

                {/* 密码 */}
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onFocus={() => setFocusedField('password')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    required
                    minLength={6}
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'password' || password
                      ? '-top-8 text-amber-600/80 dark:text-amber-400/80'
                      : 'text-slate-400 dark:text-white/30'
                  }`}>
                    {t("register.password")}
                  </label>
                </div>

                {/* 确认密码 */}
                <div className="relative">
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    onFocus={() => setFocusedField('confirmPassword')}
                    onBlur={() => setFocusedField(null)}
                    className="w-full h-14 px-6 rounded-full bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    required
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'confirmPassword' || confirmPassword
                      ? '-top-8 text-amber-600/80 dark:text-amber-400/80'
                      : 'text-slate-400 dark:text-white/30'
                  }`}>
                    {t("register.confirmPassword")}
                  </label>
                </div>

                {/* 密码要求检查 */}
                {password.length > 0 && (
                  <div className="space-y-2 px-1 py-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3 text-[10px] font-mono">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                          req.met ? 'bg-green-100 dark:bg-green-500/20' : 'bg-slate-100 dark:bg-white/5'
                        }`}>
                          <Check className={`h-3 w-3 transition-all duration-300 ${
                            req.met ? 'text-green-600 dark:text-green-400 scale-100' : 'text-slate-400 dark:text-white/20 scale-75'
                          }`} />
                        </div>
                        <span className={req.met ? 'text-green-600/80 dark:text-green-400/80' : 'text-slate-400 dark:text-white/20'}>
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
                  className="w-full h-16 mt-4 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 text-white text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <span>{t("register.registerButton")}</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 卡片底部光效 */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* 登录链接 */}
          <p className="text-center mt-8 text-sm text-slate-400 dark:text-white/20">
            {t("register.alreadyHaveAccount")}{" "}
            <Link
              href="/login"
              className="font-medium transition-colors text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
            >
              {t("register.signIn")}
            </Link>
          </p>
        </div>

        {/* 底部版本信息 */}
        <div className="fixed bottom-4 right-4 z-10">
          <div className="text-[10px] font-mono text-slate-400 dark:text-white/20">
            {t("register.version")}
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}
