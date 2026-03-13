// src/components/admin/layout/AdminLayout.tsx

'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'
import { useAdminStore } from '@/hooks/useAdminStore'
import '@/app/admin/layout.css'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { hasAdminAccess, isLoading, loadAdminData } = useAdminStore()
  const [isClient, setIsClient] = useState(false)

  // 标记客户端挂载
  useEffect(() => {
    setIsClient(true)
  }, [])

  // 加载管理员数据
  useEffect(() => {
    if (isClient) {
      loadAdminData()
    }
  }, [isClient, loadAdminData])

  // 权限检查与跳转
  useEffect(() => {
    // 等待客户端挂载和数据加载完成
    if (!isClient || isLoading) return

    // 如果没有管理员权限，跳转到首页
    if (!hasAdminAccess) {
      router.push('/')
    }
  }, [hasAdminAccess, isLoading, router, isClient])

  // 服务端渲染或客户端初始化时显示加载状态
  if (!isClient || isLoading) {
    return (
      <div className="flex h-screen items-center justify-center admin-layout">
        <div className="text-center">
          <div className="spinner mx-auto mb-4"></div>
          <p className="text-[var(--text-secondary)]">加载中...</p>
        </div>
      </div>
    )
  }

  // 客户端挂载且加载完成后，如果没有权限则不渲染（等待跳转）
  if (!hasAdminAccess) {
    return null
  }

  return (
    <div className="flex h-screen admin-layout">
      {/* 侧边栏 */}
      <div className="w-64 flex-shrink-0">
        <Sidebar />
      </div>

      {/* 主内容区 */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* 头部 */}
        <AdminHeader />

        {/* 内容 */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
