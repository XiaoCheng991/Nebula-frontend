"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { login } from "@/lib/api/modules/auth"
import { Github, Mail, Lock, ArrowRight } from "lucide-react"
import { PublicRoute } from "@/components/auth/AuthGuard"

export default function LoginPage() {
  const [account, setAccount] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      await login({ account, password })

      toast({
        title: "登录成功",
        description: "欢迎回来！正在跳转...",
      })

      setTimeout(() => {
        router.push("/dashboard")
      }, 500)

    } catch (error: any) {
      // 优先显示后端返回的错误消息
      const errorMessage = error?.message || "登录失败，请检查邮箱和密码"

      console.error('[Login] 登录失败:', errorMessage, error)

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
    setLoading(true)
    try {
      // 获取GitHub授权URL
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'}/api/oauth/github/authorize`,
        {
          credentials: 'include',
        }
      )
      const data = await res.json()

      if (data.code === 200 && data.data?.authorizeUrl) {
        window.location.href = data.data.authorizeUrl
      } else {
        toast({
          title: "获取授权链接失败",
          description: data.message || "请稍后重试",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("获取GitHub授权链接失败", error)
      toast({
        title: "获取授权链接失败",
        description: "网络错误，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <PublicRoute>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-4 -mt-16">
      <div className="w-full max-w-md">
        <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">欢迎回来</CardTitle>
          <CardDescription>登录你的账户，继续使用 NebulaHub</CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* GitHub登录按钮 */}
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={handleGithubLogin}
            disabled={loading}
          >
            <Github className="h-4 w-4" />
            GitHub 账号登录
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">或者使用邮箱</span>
            </div>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account">用户名/邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="account"
                  type="text"
                  placeholder="用户名或邮箱"
                  className="pl-10"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">密码</Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="输入你的密码"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            <Button type="submit" className="w-full gap-2" disabled={loading}>
              {loading ? "登录中..." : "登录"}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>

        <CardFooter className="justify-center">
          <p className="text-sm text-muted-foreground">
            还没有账户？{" "}
            <Link href="/register" className="text-primary hover:underline font-medium">
              立即注册
            </Link>
          </p>
        </CardFooter>
      </Card>
      </div>
    </div>
    </PublicRoute>
  )
}
