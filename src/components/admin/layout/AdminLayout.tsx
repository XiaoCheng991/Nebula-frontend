// src/components/admin/layout/AdminLayout.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'
import { useAdminStore, checkHasAdminAccess } from '@/hooks/useAdminStore'
import { useThemeEffect } from '@/hooks/useTheme'
import '@/app/admin/layout.css'
import '@/app/admin/page-styles.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { loadAdminData } = useAdminStore()
  const [isClient, setIsClient] = useState(false)
  const [hasAccess, setHasAccess] = useState<boolean | null>(null)

  // 激活主题切换功能
  useThemeEffect()

  // 标记客户端挂载
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 直接从 Supabase 检查权限（快速、可靠）
  useEffect(() => {
    if (!isClient) return
    checkHasAdminAccess().then(ok => {
      setHasAccess(ok)
      if (ok) loadAdminData().catch(() => {})
    }).catch(() => setHasAccess(false))
  }, [isClient])

  // 权限检查与跳转
  useEffect(() => {
    if (!isClient || hasAccess === null) return
    if (!hasAccess) {
      router.push('/')
    }
  }, [hasAccess, isClient, router])

  // 服务端渲染或权限检查中，显示加载状态
  if (!isClient || hasAccess === null) {
    return (
      <div className="flex h-screen items-center justify-center admin-layout">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">加载中...</p>
        </div>
      </div>
    )
  }

  // 没有权限则不渲染（等待跳转）
  if (!hasAccess) {
    return null
  }

  return (
    <div className="flex h-screen admin-layout">
      {/* 侧边栏 */}
      <div className="w-56 flex-shrink-0">
        <Sidebar />
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 头部 */}
        <AdminHeader />

        {/* 内容 */}
        <main className="flex-1 overflow-y-auto p-6 bg-[var(--bg-base)]">
          <div className="backdrop-blur-xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
