"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { register } from "@/lib/api/adapters"
import { PublicRoute } from "@/components/auth/AuthGuard"
import { useLanguage } from "@/hooks/useLanguage"

export default function RegisterPage() {
  const { t } = useLanguage()
  const [username, setUsername] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault()

    if (password !== confirmPassword) {
      toast({ title: t("register.passwordMismatch"), variant: "destructive" })
      return
    }

    if (password.length < 6) {
      toast({ title: t("register.passwordTooShort"), variant: "destructive" })
      return
    }

    if (username.length < 3) {
      toast({ title: t("register.usernameTooShort"), variant: "destructive" })
      return
    }

    setLoading(true)

    try {
      await register(username, email, password, username)
      toast({ title: t("register.success"), description: t("register.welcome") })
      setTimeout(() => window.location.href = "/dashboard", 500)
    } catch (error: any) {
      toast({ title: t("register.failed"), description: error.message, variant: "destructive" })
    } finally {
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { met: username.length >= 3, text: t("register.requireUsername") },
    { met: password.length >= 6, text: t("register.requirePassword") },
    { met: password === confirmPassword && password.length > 0, text: t("register.requireMatch") },
  ]

  return (
    <PublicRoute>
      <div className="h-screen w-full relative overflow-hidden pt-16">
        <div className="absolute -top-16 left-0 w-full h-[calc(100%+4rem)] bg-cover bg-center" style={{ backgroundImage: "url('/login-bg.jpg')" }} />
        <div className="absolute top-0 right-0 h-full w-[360px] bg-gradient-to-l from-black/80 via-black/40 to-transparent" />
        <div className="absolute top-1/2 right-16 -translate-y-1/2 z-10">
          <div className="flex flex-col items-center">
            <div className="mb-6 text-center">
              <h1 className="text-3xl font-bold text-white mb-2">{t("register.title")}</h1>
              <p className="text-sm text-white/70">{t("register.subtitle")}</p>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 w-[320px]">
              <form onSubmit={handleEmailRegister} className="space-y-3.5">
                <div className="relative">
                  <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={t("register.username")} className="w-full h-12 pl-4 pr-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" required />
                </div>

                <div className="relative">
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("register.email")} className="w-full h-12 pl-4 pr-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" required />
                </div>

                <div className="relative">
                  <input type={password ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("register.password")} className="w-full h-12 pl-4 pr-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" required />
                </div>

                <div className="relative">
                  <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder={t("register.confirmPassword")} className="w-full h-12 pl-4 pr-4 rounded-lg bg-white/5 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 transition-all" required />
                </div>

                {password.length > 0 && (
                  <div className="space-y-1.5 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10">
                    {passwordRequirements.map((req, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs">
                        <div className={`w-4 h-4 rounded flex items-center justify-center transition-all ${req.met ? "bg-green-500/20" : "bg-white/5"}`}>
                          <span className={`transition-all ${req.met ? "text-green-400 scale-100" : "text-white/30 scale-75"}`}>✓</span>
                        </div>
                        <span className={req.met ? "text-green-400" : "text-white/50"}>{req.text}</span>
                      </div>
                    ))}
                  </div>
                )}

                <button type="submit" disabled={loading} className="w-full h-12 rounded-lg bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white font-medium transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25">
                  {loading ? <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>{t("register.registerButton")}<span className="ml-1">→</span></>}
                </button>
              </form>

              <p className="mt-6 text-sm text-center text-white/50">
                {t("register.alreadyHaveAccount")} <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300 transition-colors">{t("register.signIn")}</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </PublicRoute>
  )
}