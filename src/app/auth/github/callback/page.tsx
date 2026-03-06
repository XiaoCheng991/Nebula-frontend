"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { toast } from "@/components/ui/use-toast"
import { CheckCircle, XCircle, Github, Mail, User } from "lucide-react"
import { setTokens } from "@/lib/auth/dual-token-manager"

interface GitHubUserInfo {
  tempToken: string
  githubId: string
  githubLogin: string
  avatarUrl: string
  email?: string
  nickname?: string
  isNewUser?: boolean
}

interface GitHubConfirmRequest {
  tempToken: string
  nickname: string
  email?: string
}

export default function GitHubCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<"loading" | "confirm" | "success" | "error">("loading")
  const [userInfo, setUserInfo] = useState<GitHubUserInfo | null>(null)
  const [nickname, setNickname] = useState("")
  const [email, setEmail] = useState("")
  const [confirmLoading, setConfirmLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const tempToken = searchParams.get("tempToken")
    const errorParam = searchParams.get("error")

    if (errorParam) {
      setError(errorParam)
      setStatus("error")
      return
    }

    if (tempToken) {
      fetchGitHubUserInfo(tempToken)
    } else {
      setStatus("error")
    }
  }, [searchParams])

  const completeLogin = async (data: any) => {
    const { token, refreshToken, expiresIn, userInfo: loginUserInfo } = data

    setTokens({
      accessToken: token,
      refreshToken,
      expiresIn,
    })

    localStorage.setItem("userInfo", JSON.stringify(loginUserInfo))
    window.dispatchEvent(new Event('auth-change'))

    setStatus("success")
    toast({
      title: "登录成功",
      description: "欢迎回来，正在跳转...",
    })

    setTimeout(() => {
      router.push("/dashboard")
    }, 1500)
  }

  const confirmGitHubLogin = async (request: GitHubConfirmRequest) => {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/oauth/github/confirm`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(request),
      }
    )
    return res.json()
  }

  const fetchGitHubUserInfo = async (tempToken: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/oauth/github/info?tempToken=${encodeURIComponent(tempToken)}`,
        { credentials: 'include' }
      )
      const data = await res.json()

      if (data.code === 200 && data.data) {
        setUserInfo(data.data)
        setNickname(data.data.nickname || data.data.githubLogin || "")
        setEmail(data.data.email || "")

        if (data.data.isNewUser === false) {
          const result = await confirmGitHubLogin({
            tempToken: data.data.tempToken,
            nickname: data.data.nickname || data.data.githubLogin,
            email: data.data.email,
          })
          if (result.code === 200 && result.data) {
            await completeLogin(result.data)
          } else {
            toast({ title: "登录失败", description: result.message, variant: "destructive" })
            setStatus("error")
          }
        } else {
          setStatus("confirm")
        }
      } else {
        setError(data.message || "获取用户信息失败")
        setStatus("error")
      }
    } catch {
      setError("网络错误，请稍后重试")
      setStatus("error")
    }
  }

  const handleConfirm = async () => {
    if (!userInfo) return
    setConfirmLoading(true)
    try {
      const result = await confirmGitHubLogin({
        tempToken: userInfo.tempToken,
        nickname,
        email: email || undefined,
      })
      if (result.code === 200 && result.data) {
        await completeLogin(result.data)
      } else {
        toast({ title: "登录失败", description: result.message, variant: "destructive" })
      }
    } catch {
      toast({ title: "登录失败", description: "网络错误，请稍后重试", variant: "destructive" })
    } finally {
      setConfirmLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md text-center">
        <CardContent className="py-12">
          {status === "loading" && (
            <>
              <div className="flex justify-center mb-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
              <p className="text-muted-foreground">正在处理GitHub登录...</p>
            </>
          )}

          {status === "confirm" && userInfo && (
            <div className="space-y-6">
              <div className="flex justify-center">
                <img
                  src={userInfo.avatarUrl}
                  alt="GitHub Avatar"
                  className="w-16 h-16 rounded-full"
                />
              </div>
              <div>
                <CardTitle className="text-xl mb-1">确认GitHub登录</CardTitle>
              </div>

              <div className="space-y-4 text-left">
                <div className="space-y-2">
                  <Label>GitHub 用户名</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input value={userInfo.githubLogin} disabled className="pl-10" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>昵称 <span className="text-muted-foreground text-xs">(可修改)</span></Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      placeholder="输入你的昵称"
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>邮箱 <span className="text-muted-foreground text-xs">(可选，可修改)</span></Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => router.push("/login")}>
                  取消
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleConfirm}
                  disabled={confirmLoading || !nickname.trim()}
                >
                  {confirmLoading ? "登录中..." : "确认登录"}
                </Button>
              </div>
            </div>
          )}

          {status === "success" && (
            <>
              <div className="flex justify-center mb-4">
                <CheckCircle className="h-16 w-16 text-green-500" />
              </div>
              <CardTitle className="text-2xl mb-2">登录成功！</CardTitle>
              <p className="text-muted-foreground">欢迎回来，正在跳转...</p>
            </>
          )}

          {status === "error" && (
            <>
              <div className="flex justify-center mb-4">
                <XCircle className="h-16 w-16 text-red-500" />
              </div>
              <CardTitle className="text-2xl mb-2">登录失败</CardTitle>
              <p className="text-muted-foreground mb-6">
                {error || "GitHub登录过程中出现错误，请重试"}
              </p>
              <Button onClick={() => router.push("/login")}>
                返回登录
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
