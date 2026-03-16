'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <EmptyPage
      icon={Settings}
      title="系统设置"
      subtitle="管理系统配置"
    />
  )
}
