'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { MessageSquare } from 'lucide-react'

export default function MessagesPage() {
  return (
    <EmptyPage
      icon={MessageSquare}
      title="消息管理"
      subtitle="管理聊天消息"
    />
  )
}
