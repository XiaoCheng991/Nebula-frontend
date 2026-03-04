// src/app/admin/layout.tsx

import React from 'react'
import { AdminLayout } from '@/components/admin/layout/AdminLayout'

interface AdminRootLayoutProps {
  children: React.ReactNode
}

export default function AdminRootLayout({ children }: AdminRootLayoutProps) {
  return <AdminLayout>{children}</AdminLayout>
}
