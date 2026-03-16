// src/app/admin/blog/posts/page.tsx

'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { FileText } from 'lucide-react'

export default function BlogPostsPage() {
  return (
    <EmptyPage
      icon={FileText}
      title="文章管理"
      subtitle="管理博客文章"
    />
  )
}
