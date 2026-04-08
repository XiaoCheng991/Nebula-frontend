'use client'

import { useState, useEffect, useRef, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, MessageSquare, Calendar, Clock, HeartIcon, Image as ImageIcon, Loader2 } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { getMemos } from '@/lib/supabase/modules/memo'
import { useUser } from '@/lib/user-context'
import { getLocalUserInfo } from '@/lib/api'
import { useUsersById } from '@/hooks/useUsersCache'

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)

  if (diffMin < 60) return `${diffMin} 分钟前`
  if (diffHour < 24) return `${diffHour} 小时前`
  if (diffDay < 7) return `${diffDay} 天前`
  return date.toLocaleDateString('zh-CN')
}

export default function MemosPage() {
  const { user } = useUser()
  const [memos, setMemos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [fetching, setFetching] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  async function fetchMemos(targetPage: number, reset = false) {
    if (reset) setLoading(true)
    else setFetching(true)

    try {
      const res = await getMemos({ page: targetPage, pageSize: 12, visibility: 'PUBLIC' })

      if (res.data.length === 0) {
        setHasMore(false)
        if (!reset) setFetching(false)
        setLoading(false)
        return
      }

      if (reset) {
        setMemos(res.data)
        setLoading(false)
      } else {
        setMemos(prev => [...prev, ...res.data])
        setFetching(false)
      }
    } catch {
      setLoading(false)
      setFetching(false)
    }
  }

  useEffect(() => {
    fetchMemos(1, true)
  }, [])

  // 从 memos 中提取需要查询的 userId
  const memoUserIds = useMemo(
    () => [...new Set(memos.map((m) => m.user_id))],
    [memos]
  )

  // 使用 React Query 缓存用户信息，避免每次都重新查询
  const { data: userMap } = useUsersById(memoUserIds)

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !fetching) {
          const nextPage = page + 1
          setPage(nextPage)
          fetchMemos(nextPage)
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, fetching, page])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
      {/* Nav */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回博客
        </Link>
      </div>

      {/* Header */}
      <div className="max-w-3xl mx-auto px-4 pb-6">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-zinc-400" />
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">全部动态</h1>
        </div>
      </div>

      {/* Memo list */}
      {loading ? (
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-5">
              <div className="h-4 w-full bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-3" />
              <div className="h-4 w-3/4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse mb-4" />
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-zinc-100 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3 w-16 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      ) : memos.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 text-center py-20 text-sm text-zinc-400">
          暂无动态
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          {memos.map((memo) => {
            const memoUser = userMap?.get(memo.user_id) || null
            const currentUsername = user?.username || getLocalUserInfo()?.username
            const isCurrentUser = memoUser?.username === currentUsername
            const memoAvatarUrl = isCurrentUser && user?.avatarUrl ? user.avatarUrl : memoUser?.avatar_url

            const lines = memo.content.split('\n\n')
            const moodLine = lines.find((l: string) => l.startsWith('心情：'))
            const moodContent = moodLine ? moodLine.replace('心情：', '') : ''
            const textContent = lines.filter((l: string) => !l.startsWith('心情：')).join('\n\n')

            return (
              <Link
                key={memo.id}
                href={`/memo/${memo.id}`}
                className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all p-5 group"
              >
                <div className="flex items-center gap-2 mb-2">
                  <UserAvatar
                    avatarUrl={memoAvatarUrl}
                    nickname={memoUser?.nickname}
                    size="sm"
                    className="w-6 h-6"
                  />
                  <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {memoUser?.nickname || memoUser?.username || '用户'}
                  </span>
                  <span className="text-[10px] text-zinc-400">
                    {formatTimeAgo(memo.create_time)}
                  </span>
                </div>

                <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap line-clamp-3 mb-2">
                  {textContent}
                </div>

                {memo.image_urls?.length > 0 && (
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mb-2">
                    <ImageIcon className="h-3 w-3" />
                    {memo.image_urls.length} 张图片
                  </div>
                )}

                {moodContent && (
                  <div className="text-[10px] text-orange-500">{moodContent}</div>
                )}

                <div className="flex items-center gap-4 mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-xs text-zinc-400">
                  <span className="inline-flex items-center gap-1 group-hover:text-rose-500 transition-colors">
                    <HeartIcon className="h-3.5 w-3.5" />
                    {memo.like_count || 0}
                  </span>
                  <span className="inline-flex items-center gap-1 group-hover:text-blue-500 transition-colors">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {memo.comment_count || 0}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Loading indicator for infinite scroll */}
      <div ref={observerRef} className="h-16 flex items-center justify-center">
        {fetching && (
          <div className="flex items-center gap-2 text-sm text-zinc-400">
            <Loader2 className="h-4 w-4 animate-spin" />
            加载中...
          </div>
        )}
      </div>
    </div>
  )
}
