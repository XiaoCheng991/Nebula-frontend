'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { Tag } from 'lucide-react'

export default function TagsPage() {
  return (
    <EmptyPage
      icon={Tag}
      title="标签管理"
      subtitle="管理文章标签"
    />
  )
}
