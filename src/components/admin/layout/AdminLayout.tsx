// src/components/admin/layout/AdminLayout.tsx

'use client'

import React, { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from './Sidebar'
import { AdminHeader } from './AdminHeader'
import { useAdminStore } from '@/hooks/useAdminStore'

interface AdminLayoutProps {
  children: React.ReactNode
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const router = useRouter()
  const { hasAdminAccess, isLoading, loadAdminData } = useAdminStore()

  useEffect(() => {
    loadAdminData()
  }, [loadAdminData])

  useEffect(() => {
    if (!isLoading && !hasAdminAccess) {
      router.push('/')
    }
  }, [hasAdminAccess, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400">加载中...</p>
        </div>
      </div>
    )
  }

  if (!hasAdminAccess) {
    return null // 会通过 useEffect 跳转到首页
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* 侧边栏 */}
      <Sidebar />

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
