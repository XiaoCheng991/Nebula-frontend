'use client'

import React from 'react'
import { LucideIcon } from 'lucide-react'

interface EmptyPageProps {
  icon: LucideIcon
  title: string
  subtitle: string
}

export function EmptyPage({ icon: Icon, title, subtitle }: EmptyPageProps) {
  return (
    <div className="space-y-6">
      {/* 页面标题 */}
      <div className="page-header">
        <div className="page-header-icon">
          <Icon />
        </div>
        <div>
          <h1 className="page-header-title">{title}</h1>
          <p className="page-header-subtitle">{subtitle}</p>
        </div>
      </div>

      {/* 空状态 */}
      <div className="admin-card">
        <div className="empty-state">
          <Icon className="h-12 w-12 mx-auto mb-4 text-[var(--text-muted)]" />
          <p>功能开发中...</p>
          <p className="text-sm mt-2 text-[var(--text-tertiary)]">此功能正在开发中，敬请期待</p>
        </div>
      </div>
    </div>
  )
}
