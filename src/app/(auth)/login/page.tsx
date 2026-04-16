"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { login } from "@/lib/api/adapters"
import { Github } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"
import { useLanguage } from "@/hooks/useLanguage"

export default function LoginPage() {
  const { t } = useLanguage()
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login(account, password)
      toast({ title: t("login.successLogin"), description: t("login.welcomeBack") })
      setTimeout(() => window.location.href = "/dashboard", 500)
    } catch (error: any) {
      toast({ title: t("login.errorLoginFailed"), description: error?.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const handleGithubLogin = async () => {
    try {
      setLoading(true)
      await loginWithGithub()
    } catch (error: any) {
      toast({ title: t("login.githubLoginFailed"), description: error?.message, variant: "destructive" })
      setLoading(false)
    }
  }

  return (
    <PublicRoute>
      <div>
        <div className="min-h-screen flex flex-col items-center justify-center p-4">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">{t("login.title")}</h1>
              <p className="text-white/70">{t("login.subtitle")}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <button onClick={handleGithubLogin} className="w-full h-12 mb-4 flex items-center justify-center gap-2 rounded-lg bg-white/10 hover:bg-white/20 text-white border border-white/20">
                <Github className="h-5 w-5" />
                {t("common.continueWithGithub")}
              </button>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/20" />
                  <span className="absolute left-1/2 -translate-x-1/2 px-4 text-xs text-white/50">{t("common.orContinueWithEmail")}</span>
                </div>
              </div>

              <form onSubmit={handleEmailLogin} className="space-y-4">
                <div>
                  <input type="email" value={account} onChange={(e) => setAccount(e.target.value)} placeholder={t("login.email")} className="w-full h-12 pl-4 pr-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" required />
                </div>

                <div>
                  <input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("login.password")} className="w-full h-12 pl-4 pr-12 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50 hover:text-white/80 transition-colors">
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>

                <button type="submit" disabled={loading} className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium transition-all flex items-center justify-center gap-2">
                  {loading ? <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{t("login.loginButton")}<ArrowRight className="h-5 w-5" /></>}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-white/50">
                {t("login.newToNebulaHub")} <Link to="/register" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">{t("login.createAccount")}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}