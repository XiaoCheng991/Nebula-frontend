'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { Activity } from 'lucide-react'

export default function LogsPage() {
  return (
    <EmptyPage
      icon={Activity}
      title="日志管理"
      subtitle="查看系统日志"
    />
  )
}
