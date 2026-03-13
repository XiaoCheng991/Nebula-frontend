"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"
import { ArrowRight, Mail, Check } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request')
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [focusedField, setFocusedField] = useState<string | null>(null)

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 这里调用发送验证码的API
      // await sendResetPasswordCode(email)

      toast({
        title: "验证码已发送",
        description: "请查看邮箱收取验证码",
      })
      setStep('verify')
    } catch (error: any) {
      toast({
        title: "发送失败",
        description: error.message || "发送验证码失败，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // 这里调用验证验证码的API
      // await verifyResetPasswordCode(email, code)

      toast({
        title: "验证成功",
        description: "请设置新密码",
      })
      setStep('reset')
    } catch (error: any) {
      toast({
        title: "验证失败",
        description: error.message || "验证码不正确或已过期",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (newPassword !== confirmPassword) {
      toast({
        title: "密码不匹配",
        description: "两次输入的密码不一致，请检查",
        variant: "destructive",
      })
      return
    }

    if (newPassword.length < 6) {
      toast({
        title: "密码太短",
        description: "密码至少需要6个字符",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // 这里调用重置密码的API
      // await resetPassword(email, code, newPassword)

      toast({
        title: "密码重置成功",
        description: "请使用新密码登录",
      })

      // 跳转到登录页
      window.location.href = "/login"
    } catch (error: any) {
      toast({
        title: "重置失败",
        description: error.message || "重置密码失败，请重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const passwordRequirements = [
    { met: newPassword.length >= 6, text: "至少6个字符" },
    { met: newPassword === confirmPassword && newPassword.length > 0, text: "两次密码一致" },
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
              {step === 'request' && "找回密码"}
              {step === 'verify' && "验证邮箱"}
              {step === 'reset' && "设置新密码"}
            </h1>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {step === 'request' && "输入你的邮箱找回密码"}
              {step === 'verify' && "输入邮箱收到的验证码"}
              {step === 'reset' && "设置你的新密码"}
            </p>
          </div>

          {/* 卡片 - 和登录页样式统一 */}
          <div className="bg-white dark:bg-[#141414] rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] dark:shadow-none border border-gray-100 dark:border-white/[0.06] overflow-hidden">
            <div className="p-5 space-y-4">
              {step === 'request' && (
                <form onSubmit={handleSendCode} className="space-y-3">
                  {/* 邮箱 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
                      邮箱地址
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

                  {/* 发送验证码按钮 */}
                  <button
                    type="submit"
                    disabled={loading || !email}
                    className="w-full h-10 mt-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>发送中...</span>
                      </>
                    ) : (
                      <>
                        <span>发送验证码</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {step === 'verify' && (
                <form onSubmit={handleVerifyCode} className="space-y-3">
                  {/* 验证码 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
                      验证码
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      onFocus={() => setFocusedField('code')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
                      placeholder="6位数字验证码"
                      required
                      maxLength={6}
                    />
                  </div>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    验证码已发送至 <span className="font-medium text-gray-700 dark:text-gray-300">{email}</span>
                  </p>

                  {/* 验证按钮 */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('request')}
                      className="flex-1 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      返回
                    </button>
                    <button
                      type="submit"
                      disabled={loading || code.length < 6}
                      className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>验证中...</span>
                        </>
                      ) : (
                        <>
                          <span>验证</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}

              {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="space-y-3">
                  {/* 新密码 */}
                  <div className="space-y-1.5">
                    <label className="text-[11px] font-medium text-gray-500 dark:text-gray-400 ml-0.5">
                      新密码
                    </label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      onFocus={() => setFocusedField('newPassword')}
                      onBlur={() => setFocusedField(null)}
                      className="w-full h-10 px-3 rounded-lg bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] text-sm text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-[3px] focus:ring-blue-500/10 transition-all duration-200"
                      placeholder="设置新密码（至少6个字符）"
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
                      placeholder="再次输入新密码"
                      required
                    />
                  </div>

                  {/* 密码提示 */}
                  {newPassword.length > 0 && (
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

                  {/* 重置按钮 */}
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setStep('verify')}
                      className="flex-1 h-10 rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.08] text-gray-700 dark:text-gray-300 text-sm font-medium transition-all duration-200 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      返回
                    </button>
                    <button
                      type="submit"
                      disabled={loading || newPassword.length < 6 || newPassword !== confirmPassword}
                      className="flex-1 h-10 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="h-3.5 w-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          <span>重置中...</span>
                        </>
                      ) : (
                        <>
                          <span>重置密码</span>
                          <ArrowRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>

          {/* 返回登录链接 */}
          <p className="text-center mt-5 text-[13px] text-gray-500 dark:text-gray-400">
            <Link
              href="/login"
              className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
            >
              ← 返回登录
            </Link>
          </p>
        </div>
      </div>
    </PublicRoute>
  )
}
