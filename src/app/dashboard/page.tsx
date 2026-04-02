"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Users, Activity, MessageCircle, FileText, TrendingUp, Sparkles, CheckCircle } from "lucide-react"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { ProtectedRoute } from "@/components/auth/AuthGuard"
import { useUser } from "@/lib/user-context"

export default function DashboardPage() {
  const { user } = useUser()

  const stats = [
    { title: "总用户数", value: "1,234", change: "+12%", icon: Users },
    { title: "活跃会话", value: "56", change: "+5%", icon: Activity },
    { title: "消息总数", value: "2,458", change: "+18%", icon: MessageCircle },
    { title: "文件数量", value: "342", change: "+8%", icon: FileText },
  ]

  const recentActivity = [
    { id: 1, user: "Luna", action: "上传了新文件", time: "2 分钟前", initial: "L" },
    { id: 2, user: "张三", action: "发送了新消息", time: "5 分钟前", initial: "张" },
    { id: 3, user: "李四", action: "更新了资料", time: "10 分钟前", initial: "李" },
    { id: 4, user: "王五", action: "加入了聊天", time: "15 分钟前", initial: "王" },
  ]

  const quickActions = [
    { icon: MessageCircle, label: "消息" },
    { icon: FileText, label: "文件" },
    { icon: Users, label: "团队" },
    { icon: CheckCircle, label: "任务" },
  ]

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="min-h-screen bg-background">
          <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] font-bold text-foreground tracking-tight mb-2">仪表盘</h1>
                <p className="text-muted-foreground text-[15px]">
                  欢迎回来，{user?.nickname || user?.username}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border bg-card">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[13px] text-muted-foreground font-medium">系统运行正常</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative bg-card border rounded-2xl p-6 transition-all duration-300 hover:border-primary/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                      <stat.icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex items-center gap-1 text-green-500">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-[12px] font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-[28px] font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-card border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[15px] font-semibold text-foreground">最近活动</h3>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary">实时</span>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-accent transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-[13px] font-medium text-primary">{activity.initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-foreground font-medium">{activity.user}</p>
                        <p className="text-[13px] text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-[12px] text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-card border rounded-2xl p-6">
                <h3 className="text-[15px] font-semibold text-foreground mb-6">快捷操作</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex-col items-center justify-center gap-2.5 rounded-xl hover:border-primary/50 hover:bg-accent transition-all group"
                    >
                      <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-colors">
                        <action.icon className="h-4 w-4 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <span className="text-[13px] text-muted-foreground group-hover:text-foreground transition-colors">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="relative bg-gradient-to-r from-primary/5 to-accent border rounded-2xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-7 w-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-foreground mb-2">欢迎来到 NebulaHub</h3>
                  <p className="text-[14px] text-muted-foreground max-w-[500px]">
                    您的应用程序仪表盘已准备就绪。从左侧导航栏访问各种功能，开启您的私密交流之旅。
                  </p>
                </div>
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 h-11">
                  开始探索
                </Button>
              </div>
            </div>
          </div>
        </div>
      </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}
