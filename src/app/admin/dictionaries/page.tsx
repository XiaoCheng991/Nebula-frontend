'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { Book } from 'lucide-react'

export default function DictionariesPage() {
  return (
    <EmptyPage
      icon={Book}
      title="字典管理"
      subtitle="管理系统字典"
    />
  )
}
