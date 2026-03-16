'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { MessageCircle } from 'lucide-react'

export default function CommentsPage() {
  return (
    <EmptyPage
      icon={MessageCircle}
      title="评论管理"
      subtitle="管理用户评论"
    />
  )
}
