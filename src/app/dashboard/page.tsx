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
    { title: "总用户数", value: "1,234", change: "+12%", icon: Users, color: "orange" },
    { title: "活跃会话", value: "56", change: "+5%", icon: Activity, color: "amber" },
    { title: "消息总数", value: "2,458", change: "+18%", icon: MessageCircle, color: "yellow" },
    { title: "文件数量", value: "342", change: "+8%", icon: FileText, color: "orange" },
  ]

  const recentActivity = [
    { id: 1, user: "Luna", action: "上传了新文件", time: "2 分钟前", initial: "L" },
    { id: 2, user: "张三", action: "发送了新消息", time: "5 分钟前", initial: "张" },
    { id: 3, user: "李四", action: "更新了资料", time: "10 分钟前", initial: "李" },
    { id: 4, user: "王五", action: "加入了聊天", time: "15 分钟前", initial: "王" },
  ]

  const quickActions = [
    { icon: MessageCircle, label: "消息", color: "orange" },
    { icon: FileText, label: "文件", color: "amber" },
    { icon: Users, label: "团队", color: "yellow" },
    { icon: CheckCircle, label: "任务", color: "orange" },
  ]

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="min-h-screen bg-[#0a0a0a]">
          <style jsx global>{`
            :root {
              --bg: #0a0a0a;
              --card: #141414;
              --border: #222;
              --text: #e5e5e5;
              --text2: #999;
              --text3: #666;
              --accent: #3b82f6;
              --accent2: #60a5fa;
            }
          `}</style>

          <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-12">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] font-bold text-white tracking-tight mb-2">仪表盘</h1>
                <p className="text-[#999] text-[15px]">
                  欢迎回来，{user?.nickname || user?.username}
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#222] bg-[#141414]">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[13px] text-[#999] font-medium">系统运行正常</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="group relative bg-[#141414] border border-[#222] rounded-2xl p-6 transition-all duration-300 hover:border-[#3b82f6]/50"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-${stat.color}-500/10 to-${stat.color}-600/10 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <stat.icon className={`h-5 w-5 text-${stat.color}-500`} />
                    </div>
                    <div className="flex items-center gap-1 text-green-400">
                      <TrendingUp className="h-3 w-3" />
                      <span className="text-[12px] font-medium">{stat.change}</span>
                    </div>
                  </div>
                  <p className="text-[13px] text-[#666] mb-1">{stat.title}</p>
                  <p className="text-[28px] font-bold text-white">{stat.value}</p>
                </div>
              ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-[15px] font-semibold text-white">最近活动</h3>
                  <span className="text-[11px] px-2 py-1 rounded-full bg-[#3b82f6]/10 text-[#3b82f6]">实时</span>
                </div>
                <div className="space-y-3">
                  {recentActivity.map((activity) => (
                    <div
                      key={activity.id}
                      className="flex items-center gap-4 p-3.5 rounded-xl hover:bg-[#1a1a1a] transition-colors cursor-pointer"
                    >
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#3b82f6]/20 to-[#60a5fa]/20 flex items-center justify-center">
                        <span className="text-[13px] font-medium text-[#60a5fa]">{activity.initial}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[14px] text-[#e5e5e5] font-medium">{activity.user}</p>
                        <p className="text-[13px] text-[#666]">{activity.action}</p>
                      </div>
                      <span className="text-[12px] text-[#666]">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
                <h3 className="text-[15px] font-semibold text-white mb-6">快捷操作</h3>
                <div className="grid grid-cols-2 gap-3">
                  {quickActions.map((action, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      className="h-20 flex-col items-center justify-center gap-2.5 rounded-xl border-[#222] bg-[#0a0a0a] hover:bg-[#1a1a1a] hover:border-[#3b82f6]/50 transition-all group"
                    >
                      <div className={`w-9 h-9 rounded-lg bg-${action.color}-500/10 flex items-center justify-center group-hover:bg-[#3b82f6] transition-colors`}>
                        <action.icon className={`h-4 w-4 text-${action.color}-500 group-hover:text-white transition-colors`} />
                      </div>
                      <span className="text-[13px] text-[#999] group-hover:text-[#e5e5e5] transition-colors">{action.label}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            {/* Welcome Card */}
            <div className="relative bg-gradient-to-r from-[#141414] to-[#1a1a1a] border border-[#222] rounded-2xl p-8 overflow-hidden">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-[#3b82f6]/5 to-transparent rounded-full pointer-events-none" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3b82f6]/20 to-[#60a5fa]/20 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-7 w-7 text-[#3b82f6]" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[18px] font-semibold text-white mb-2">欢迎来到 NebulaHub</h3>
                  <p className="text-[14px] text-[#999] max-w-[500px]">
                    您的应用程序仪表盘已准备就绪。从左侧导航栏访问各种功能，开启您的私密交流之旅。
                  </p>
                </div>
                <Button className="bg-[#3b82f6] hover:bg-[#2563eb] text-white rounded-xl px-6 h-11">
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
