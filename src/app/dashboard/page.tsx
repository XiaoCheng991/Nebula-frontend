"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Users, Activity, MessageCircle, FileText, TrendingUp, Sparkles, CheckCircle, ArrowRight } from "lucide-react"
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
    { icon: MessageCircle, label: "进入聊天", count: "3 条未读" },
    { icon: FileText, label: "我的文件", count: "12 个文件" },
    { icon: Users, label: "好友列表", count: "24 位好友" },
    { icon: CheckCircle, label: "待办事项", count: "5 项待办" },
  ]

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="relative min-h-screen">
          {/* Background lighting orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-300px] left-[-200px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute top-[40%] right-[-250px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.06)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute bottom-[-300px] left-1/3 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(245,166,80,0.05)_0%,transparent_70%)] blur-3xl" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-bold tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent leading-tight">
                  仪表盘
                </h1>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl backdrop-blur-xl border border-orange-500/20 bg-white/10 dark:bg-black/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[13px] text-muted-foreground font-medium">系统运行正常</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="group relative backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 cursor-default"
                  >
                    {/* Subtle top-left glow on hover */}
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-orange-400/20 transition-all duration-300">
                          <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                          <TrendingUp className="h-3 w-3" />
                          <span className="text-[11px] font-semibold">{stat.change}</span>
                        </div>
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-[22px] font-bold text-foreground tabular-nums">{stat.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
              {/* Recent Activity */}
              <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-[14px] font-semibold text-foreground">最近活动</h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-amber-600 dark:text-amber-400 font-medium border border-orange-500/15">实时</span>
                </div>
                <div className="space-y-1.5">
                  {recentActivity.map((activity, idx) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer group/act"
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center group-hover/act:from-orange-400/30 group-hover/act:to-amber-500/30 transition-all duration-200">
                          <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">{activity.initial}</span>
                        </div>
                        {idx < recentActivity.length - 1 && (
                          <div className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-px h-3.5 bg-black/[0.06] dark:bg-white/[0.06]" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground font-medium">{activity.user}</p>
                        <p className="text-[12px] text-muted-foreground">{activity.action}</p>
                      </div>
                      <span className="text-[11px] text-muted-foreground tabular-nums">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30">
                <h3 className="text-[14px] font-semibold text-foreground mb-3">快捷操作</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="relative overflow-hidden h-12 items-center gap-3 px-3 rounded-lg backdrop-blur-xl bg-white/50 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:bg-white/80 dark:hover:bg-white/[0.06] transition-all duration-200 group cursor-pointer"
                    >
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-400/15 to-amber-500/15 flex items-center justify-center group-hover:from-orange-400/25 group-hover:to-amber-500/25 group-hover:shadow-sm group-hover:shadow-orange-400/10 transition-all duration-200 flex-shrink-0">
                        <action.icon className="h-3.5 w-3.5 text-amber-600 dark:text-amber-400 group-hover:text-amber-500" />
                      </div>
                      <div className="text-left flex-1">
                        <span className="text-[12px] font-medium text-foreground group-hover:text-orange-600 dark:group-hover:text-amber-300 transition-colors block">
                          {action.label}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{action.count}</span>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-200" />
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-5 overflow-hidden hover:border-orange-500/30 transition-all duration-300 group">
              {/* Inner lighting effect */}
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)] blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-l from-orange-500/5 via-transparent to-transparent" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-shadow duration-300">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-semibold text-foreground mb-1">欢迎来到 NebulaHub</h3>
                  <p className="text-[13px] text-muted-foreground max-w-[500px]">
                    您的应用程序仪表盘已准备就绪，从左侧导航栏访问各种功能，开启您的私密交流之旅。
                  </p>
                </div>
                <Button className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg px-5 h-10 font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-shadow duration-200 flex-shrink-0 text-sm">
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
