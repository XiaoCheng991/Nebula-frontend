"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { register, loginWithGithub } from "@/lib/api/adapters"
import { Github, ArrowRight, Check, Sparkles } from "lucide-react"
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
        description: "密码至少需要 6 个字符",
        variant: "destructive",
      })
      return
    }

    if (username.length < 3) {
      toast({
        title: "用户名太短",
        description: "用户名至少需要 3 个字符",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      await register(username, email, password, username)

      toast({
        title: "注册成功",
        description: "欢迎加入 NebulaHub！正在跳转...",
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
    try {
      setLoading(true)
      await loginWithGithub()
    } catch (error: any) {
      toast({
        title: "GitHub 注册失败",
        description: error?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { met: username.length >= 3, text: "USERNAME_MIN_3" },
    { met: password.length >= 6, text: "PASS_MIN_6" },
    { met: password === confirmPassword && password.length > 0, text: "PASS_MATCH" },
  ]

  return (
    <PublicRoute>
      <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden">
        {/* 动态渐变背景 */}
        <div className="fixed inset-0 -z-20 bg-[#030407]" />

        {/* 网格背景装饰 */}
        <div className="fixed inset-0 -z-10 opacity-5">
          <div
            className="w-full h-full"
            style={{
              backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                              linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)`,
              backgroundSize: '50px 50px'
            }}
          />
        </div>

        {/* 技术装饰标签 */}
        <div className="fixed top-8 left-8 z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            SYS.REGISTER // ACTIVE
          </div>
        </div>

        <div className="fixed bottom-8 left-8 z-10">
          <div className="text-[10px] font-mono text-white/20 tracking-widest">
            NEW_USER_PROVISIONING_
          </div>
        </div>

        <div className="fixed top-1/2 right-8 z-10 -translate-y-1/2">
          <div className="text-[10px] font-mono text-white/20 tracking-widest writing-vertical-rl">
            [ NEBULA.ID ]
          </div>
        </div>

        <div className="w-full max-w-[440px] px-4">
          {/* 头部区域 */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 mb-4 rounded-full bg-white/5 border border-white/10">
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span className="text-[10px] font-mono text-white/60 tracking-wider">NEBULA.ID</span>
            </div>
            <h1 className="text-3xl font-medium text-white tracking-tight">
              Initialize Access
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Join the NebulaHub collaborative network
            </p>
          </div>

          {/* 主卡片 */}
          <div className="relative bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden">
            {/* 卡片顶部光效 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            <div className="p-8 space-y-6">
              {/* GitHub 注册按钮 */}
              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full h-14 flex items-center justify-center gap-3 rounded-full bg-white text-black text-sm font-semibold transition-all duration-300 hover:bg-white/90 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-white/10"
              >
                <Github className="h-5 w-5" />
                <span>Continue with GitHub</span>
              </button>

              {/* 分割线 */}
              <div className="relative flex items-center justify-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <span className="relative bg-[#030407]/80 px-4 text-[10px] text-white/30 font-mono tracking-wider uppercase">
                  Or register with email
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
                    className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    placeholder="username"
                    required
                    minLength={3}
                    maxLength={50}
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'username' || username
                      ? '-top-8 text-amber-400/80'
                      : 'text-white/30'
                  }`}>
                    USERNAME
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
                    className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    placeholder="user@domain.net"
                    required
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'email' || email
                      ? '-top-8 text-amber-400/80'
                      : 'text-white/30'
                  }`}>
                    IDENTIFIER
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
                    className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    placeholder="••••••••••••"
                    required
                    minLength={6}
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'password' || password
                      ? '-top-8 text-amber-400/80'
                      : 'text-white/30'
                  }`}>
                    PASSCODE
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
                    className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-amber-500/50 focus:ring-[3px] focus:ring-amber-500/10 transition-all duration-300"
                    placeholder="••••••••••••"
                    required
                  />
                  <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                    focusedField === 'confirmPassword' || confirmPassword
                      ? '-top-8 text-amber-400/80'
                      : 'text-white/30'
                  }`}>
                    CONFIRM_PASSCODE
                  </label>
                </div>

                {/* 密码要求检查 */}
                {password.length > 0 && (
                  <div className="space-y-2 px-1 py-3 rounded-xl bg-white/5 border border-white/5">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-3 text-[10px] font-mono">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center transition-all duration-300 ${
                          req.met ? 'bg-green-500/20' : 'bg-white/5'
                        }`}>
                          <Check className={`h-3 w-3 transition-all duration-300 ${
                            req.met ? 'text-green-400 scale-100' : 'text-white/20 scale-75'
                          }`} />
                        </div>
                        <span className={req.met ? 'text-green-400/80' : 'text-white/20'}>
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
                  className="w-full h-16 mt-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Provisioning...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Account</span>
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
          <p className="text-center mt-8 text-sm text-white/30">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* 底部版本信息 */}
        <div className="fixed bottom-4 right-4 z-10">
          <div className="text-[10px] font-mono text-white/20">
            V03.01 // BUILD_2026
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}
