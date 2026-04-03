// src/components/admin/layout/AdminLayout.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'
import { useAdminStore } from '@/hooks/useAdminStore'
import { useAppStore } from '@/hooks/useAppStore'
import { useThemeEffect } from '@/hooks/useTheme'
import '@/app/admin/layout.css'
import '@/app/admin/page-styles.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { loadAdminData } = useAdminStore()
  const { refreshPermissions, hasAdminAccess, permissionsLoaded } = useAppStore()
  const [isClient, setIsClient] = useState(false)
  const [hasChecked, setHasChecked] = useState(false)

  // 激活主题切换功能
  useThemeEffect()

  // 标记客户端挂载
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 使用统一的权限检查，而不是单独调用 checkHasAdminAccess
  useEffect(() => {
    if (!isClient || hasChecked) return
    setHasChecked(true)
    refreshPermissions().catch(() => {})
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isClient, hasChecked])

  // 权限检查完成后，如果有管理员权限则加载 admin 数据
  useEffect(() => {
    if (hasAdminAccess && isClient) {
      loadAdminData().catch(() => {})
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasAdminAccess, isClient])

  // 权限检查与跳转
  useEffect(() => {
    if (!isClient || !permissionsLoaded) return
    if (!hasAdminAccess) {
      router.push('/')
    }
  }, [hasAdminAccess, isClient, permissionsLoaded, router])

  // 服务端渲染或权限检查中，显示加载状态
  if (!isClient || !permissionsLoaded || !hasAdminAccess) {
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
  if (!hasAdminAccess) {
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
