'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { AlertTriangle } from 'lucide-react'

export default function SensitiveWordsPage() {
  return (
    <EmptyPage
      icon={AlertTriangle}
      title="敏感词管理"
      subtitle="管理敏感词库"
    />
  )
}
