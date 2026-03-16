'use client'

import React from 'react'
import { EmptyPage } from '@/app/admin/_components/EmptyPage'
import { Users } from 'lucide-react'

export default function RoomsPage() {
  return (
    <EmptyPage
      icon={Users}
      title="聊天室管理"
      subtitle="管理聊天室"
    />
  )
}
