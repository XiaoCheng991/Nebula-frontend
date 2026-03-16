'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { Ban } from 'lucide-react'

export default function BansPage() {
  return (
    <EmptyPage
      icon={Ban}
      title="封禁管理"
      subtitle="管理用户封禁"
    />
  )
}
