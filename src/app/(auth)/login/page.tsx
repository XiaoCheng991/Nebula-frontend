"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { login, loginWithGithub } from "@/lib/api/adapters"
import { Github, ArrowRight, Sparkles } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"

export default function LoginPage() {
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [focusedField, setFocusedField] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0.5, y: 0.5 })
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(account, password)

      toast({
        title: "登录成功",
        description: "欢迎回来！正在跳转...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 500)
    } catch (error: any) {
      const errorMessage = error?.message || "登录失败，请检查账号和密码"

      toast({
        title: "登录失败",
        description: errorMessage,
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
        title: "GitHub 登录失败",
        description: error?.message || "网络错误，请稍后重试",
        variant: "destructive",
      })
      setLoading(false)
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect()
    setMousePosition({
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
    })
  }

  return (
    <PublicRoute>
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden"
        onMouseMove={handleMouseMove}
      >
        {/* 动态渐变背景 */}
        <div className="fixed inset-0 -z-20 bg-[#030407]" />

        {/* 动态光晕效果 */}
        <div
          className="fixed inset-0 -z-10 opacity-30"
          style={{
            background: `radial-gradient(600px circle at ${mousePosition.x * 100}% ${mousePosition.y * 100}%, rgba(79, 120, 255, 0.15), transparent 40%)`,
          }}
        />

        {/* 技术装饰标签 */}
        <div className="fixed top-8 left-8 z-10">
          <div className="flex items-center gap-2 text-[10px] font-mono text-white/30 tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
            SYS.AUTH // ONLINE
          </div>
        </div>

        <div className="fixed bottom-8 left-8 z-10">
          <div className="text-[10px] font-mono text-white/20 tracking-widest">
            UPLINK_ESTABLISHED_
          </div>
        </div>

        <div className="fixed top-1/2 right-8 z-10 -translate-y-1/2">
          <div className="text-[10px] font-mono text-white/20 tracking-widest writing-vertical-rl">
            [ NebulaHub SSO ]
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
              Authenticate
            </h1>
            <p className="mt-2 text-sm text-white/40">
              Secure access to your NebulaHub workspace
            </p>
          </div>

          {/* 主卡片 */}
          <div className="relative bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/10 overflow-hidden">
            {/* 卡片顶部光效 */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="p-8 space-y-6">
              {/* GitHub 登录按钮 */}
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
                  Or continue with email
                </span>
              </div>

              {/* 邮箱登录表单 */}
              <form onSubmit={handleEmailLogin} className="space-y-5">
                <div className="space-y-3">
                  <div className="relative">
                    <input
                      type="email"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      onFocus={() => setFocusedField('account')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-[3px] focus:ring-white/5 transition-all duration-300"
                      placeholder="user@domain.net"
                      required
                    />
                    <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                      focusedField === 'account' || account
                        ? '-top-8 text-white/60'
                        : 'text-white/30'
                    }`}>
                      IDENTIFIER
                    </label>
                  </div>

                  <div className="relative">
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField('password')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-14 px-6 rounded-full bg-white/5 border border-white/10 text-white text-sm placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:ring-[3px] focus:ring-white/5 transition-all duration-300"
                      placeholder="••••••••••••"
                      required
                    />
                    <label className={`absolute left-6 top-1/2 -translate-y-1/2 text-xs font-medium transition-all duration-300 pointer-events-none ${
                      focusedField === 'password' || password
                        ? '-top-8 text-white/60'
                        : 'text-white/30'
                    }`}>
                      PASSCODE
                    </label>
                  </div>
                </div>

                {/* 登录按钮 */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 mt-4 rounded-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white text-base font-semibold transition-all duration-300 hover:scale-[1.02] hover:shadow-lg hover:shadow-amber-500/30 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Initializing...</span>
                    </>
                  ) : (
                    <>
                      <span>Initialize Uplink</span>
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 卡片底部光效 */}
            <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/20 to-transparent" />
          </div>

          {/* 注册链接 */}
          <p className="text-center mt-8 text-sm text-white/30">
            New to NebulaHub?{" "}
            <Link
              href="/register"
              className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
            >
              Create account
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
