// src/app/admin/page.tsx

'use client'

import React from 'react'
import { Users, FileText, MessageCircle, Activity, Sparkles, TrendingUp, ArrowUpRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change: string
  icon: React.ElementType
  iconColor: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon: Icon, iconColor }) => (
  <div className="admin-card group hover:scale-[1.02] transition-all duration-300">
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className={cn(
          "p-2.5 rounded-xl transition-all duration-300",
          "bg-gradient-to-br from-[var(--accent)]/10 to-[var(--accent)]/5",
          "group-hover:from-[var(--accent)]/15 group-hover:to-[var(--accent)]/10",
          "group-hover:scale-110"
        )}>
          <Icon className={cn("h-5 w-5 transition-transform group-hover:rotate-12", iconColor)} />
        </div>
        <div>
          <p className="text-xs font-medium text-[var(--text-tertiary)] uppercase tracking-wider">{title}</p>
        </div>
      </div>
      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
        <ArrowUpRight className="h-4 w-4 text-[var(--text-muted)]" />
      </div>
    </div>
    <div className="space-y-1">
      <div className="text-3xl font-bold text-[var(--text-primary)] tracking-tight">{value}</div>
      <div className="flex items-center gap-1.5">
        <TrendingUp className="h-3 w-3 text-emerald-500" />
        <span className="text-xs text-emerald-500 font-medium">{change}</span>
      </div>
    </div>
  </div>
)

export default function AdminDashboardPage() {
  const stats = [
    {
      title: '用户总数',
      value: '1,234',
      change: '较昨日 +12%',
      icon: Users,
      iconColor: 'text-blue-500'
    },
    {
      title: '文章数量',
      value: '567',
      change: '较昨日 +5%',
      icon: FileText,
      iconColor: 'text-purple-500'
    },
    {
      title: '消息数量',
      value: '8,901',
      change: '较昨日 +23%',
      icon: MessageCircle,
      iconColor: 'text-orange-500'
    },
    {
      title: '今日活跃',
      value: '234',
      change: '在线用户',
      icon: Activity,
      iconColor: 'text-green-500'
    }
  ]

  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5">
          <Sparkles className="h-6 w-6 text-[var(--accent)]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">仪表盘</h1>
          <p className="text-sm text-[var(--text-tertiary)]">欢迎回来，系统运行良好</p>
        </div>
      </div>

      {/* 统计卡片网格 */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* 欢迎区域 */}
      <div className="admin-card">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-[var(--accent)]/15 to-[var(--accent)]/5">
            <Sparkles className="h-6 w-6 text-[var(--accent)]" />
          </div>
          <div className="flex-1">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              欢迎使用 NebulaAdmin
            </h2>
            <p className="text-[var(--text-secondary)] leading-relaxed mb-3">
              这是后台管理系统的第一阶段，基础架构已经搭建完成。
            </p>
            <p className="text-[var(--text-tertiary)] text-sm">
              接下来可以继续开发用户管理、角色管理等功能模块。
            </p>
          </div>
        </div>
      </div>

      {/* 快捷操作区域 */}
      <div className="grid gap-5 md:grid-cols-3">
        <div className="admin-card group cursor-pointer hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">用户管理</h3>
              <p className="text-xs text-[var(--text-tertiary)]">管理用户账户和权限</p>
            </div>
          </div>
        </div>

        <div className="admin-card group cursor-pointer hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-500/10 group-hover:bg-purple-500/20 transition-colors">
              <FileText className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">内容管理</h3>
              <p className="text-xs text-[var(--text-tertiary)]">管理文章和评论</p>
            </div>
          </div>
        </div>

        <div className="admin-card group cursor-pointer hover:scale-[1.01] transition-all duration-300">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
              <MessageCircle className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-[var(--text-primary)] text-sm">消息中心</h3>
              <p className="text-xs text-[var(--text-tertiary)]">查看和管理消息</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
