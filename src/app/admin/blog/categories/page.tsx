'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { Folder } from 'lucide-react'

export default function CategoriesPage() {
  return (
    <EmptyPage
      icon={Folder}
      title="分类管理"
      subtitle="管理文章分类"
    />
  )
}
