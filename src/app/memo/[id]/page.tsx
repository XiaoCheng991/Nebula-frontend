'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Heart, MessageSquare, HeartIcon, Send, Image as ImageIcon, Trash2, Calendar } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { notFound } from 'next/navigation'
import { getMemoById, getMemoComments, addMemoComment, deleteMemoComment, likeMemo, unlikeMemo, isMemoLiked, type Memo, type MemoComment } from '@/lib/supabase/modules/memo'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/user-context'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

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

export default function MemoDetailPage({ params }: { params: { id: string } }) {
  const { user } = useUser()
  const router = useRouter()
  const memoId = Number(params.id)
  const [memo, setMemo] = useState<Memo | null>(null)
  const [loading, setLoading] = useState(true)
  const [comments, setComments] = useState<MemoComment[]>([])
  const [commentContent, setCommentContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [liked, setLiked] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    if (isNaN(memoId)) {
      notFound()
      return
    }

    fetchMemo()
    fetchComments()
  }, [memoId])

  useEffect(() => {
    if (!isMounted || !memo || !user?.id) return
    checkLikeStatus()
  }, [isMounted, memo, user])

  async function fetchMemo() {
    const { data, error } = await getMemoById(memoId)
    if (error || !data || data.deleted === 1) {
      notFound()
      return
    }
    // Fetch user info for memo author
    const { data: author } = await supabase
      .from('sys_users')
      .select('id, nickname, username, avatar_url')
      .eq('id', data.user_id)
      .maybeSingle()
    setMemo({ ...data, sys_users: author })
    setLoading(false)
  }

  async function fetchComments() {
    const { data } = await getMemoComments(memoId)
    if (data?.length) {
      // Fetch user info for comment authors
      const userIds = [...new Set(data.map((c: any) => c.user_id))]
      const { data: users } = await supabase
        .from('sys_users')
        .select('id, nickname, username, avatar_url')
        .in('id', userIds)
      const userMap = new Map(users?.map((u: any) => [u.id, u]) || [])
      setComments(data.map((c: any) => ({ ...c, sys_users: userMap.get(c.user_id) || null })))
    } else {
      setComments([])
    }
  }

  async function checkLikeStatus() {
    if (!memo || !user?.id) return
    const result = await isMemoLiked(memoId, Number(user.id))
    setLiked(result)
  }

  async function handleLike() {
    if (!memo || !user?.id) {
      toast({ title: '未登录', description: '请先登录', variant: 'destructive' })
      return
    }

    if (liked) {
      await unlikeMemo(memoId, Number(user.id))
      setLiked(false)
    } else {
      await likeMemo(memoId, Number(user.id))
      setLiked(true)
    }

    setMemo(prev => prev ? {
      ...prev,
      like_count: liked ? (prev.like_count || 0) - 1 : (prev.like_count || 0) + 1,
    } : null)
  }

  async function handleComment() {
    if (!commentContent.trim()) {
      toast({ title: '提示', description: '请输入评论内容', variant: 'destructive' })
      return
    }

    if (!user?.id) {
      toast({ title: '未登录', description: '请先登录', variant: 'destructive' })
      return
    }

    try {
      setSubmitting(true)
      const { error } = await addMemoComment({
        memo_id: memoId,
        user_id: Number(user.id),
        content: commentContent.trim(),
      })

      if (error) throw error

      setCommentContent('')
      await fetchComments()
      toast({ title: '成功', description: '评论已发送' })
    } catch (err: any) {
      toast({ title: '失败', description: err.message || '评论失败', variant: 'destructive' })
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-sm text-zinc-400">加载中...</div>
      </div>
    )
  }

  if (!memo) {
    notFound()
  }

  // Resolve author info
  const currentUsername = user?.username || ''
  const isCurrentUser = memo.sys_users?.username === currentUsername
  const authorAvatarUrl = isCurrentUser ? (user?.avatarUrl || memo.sys_users?.avatar_url) : memo.sys_users?.avatar_url
  const authorName = memo.sys_users?.nickname || memo.sys_users?.username || '用户'

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
      {/* Nav bar */}
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-4">
        <Link
          href="/blog"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回
        </Link>
      </div>

      {/* Memo content */}
      <div className="max-w-2xl mx-auto px-4 pb-8">
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl shadow-sm">
          {/* Author */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100 dark:border-zinc-800">
            <UserAvatar
              avatarUrl={authorAvatarUrl}
              nickname={authorName}
              size="md"
            />
            <div>
              <div className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{authorName}</div>
              <div className="flex items-center gap-1.5 text-xs text-zinc-400">
                <Calendar className="h-3 w-3" />
                {memo.create_time ? formatTimeAgo(memo.create_time) : ''}
              </div>
            </div>
          </div>

          {/* Text */}
          <div className="px-5 py-4">
            <div className="text-sm text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap leading-relaxed">
              {memo.content}
            </div>

            {/* Images */}
            {memo.image_urls && memo.image_urls.length > 0 && (
              <div className={`mt-4 grid gap-2 ${
                memo.image_urls.length === 1 ? 'grid-cols-1' :
                memo.image_urls.length <= 2 ? 'grid-cols-2' :
                'grid-cols-3'
              }`}>
                {memo.image_urls.map((url, i) => (
                  <img
                    key={i}
                    src={url}
                    alt=""
                    className="w-full aspect-square object-cover rounded-md cursor-pointer hover:opacity-90 transition-opacity"
                    onClick={() => window.open(url, '_blank')}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Action bar */}
          <div className="flex items-center gap-6 px-5 py-3 border-t border-zinc-100 dark:border-zinc-800 text-sm">
            <button
              onClick={handleLike}
              className={`inline-flex items-center gap-1.5 transition-colors ${
                liked ? 'text-rose-500' : 'text-zinc-400 hover:text-rose-500'
              }`}
            >
              {liked ? (
                <Heart className="h-4 w-4 fill-current" />
              ) : (
                <HeartIcon className="h-4 w-4" />
              )}
              {memo.like_count || 0}
            </button>
            <div className="inline-flex items-center gap-1.5 text-zinc-400">
              <MessageSquare className="h-4 w-4" />
              {comments.length}
            </div>
          </div>
        </div>

        {/* Comments */}
        <div className="mt-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-3">
            评论 ({comments.length})
          </h3>

          {/* Comment input */}
          <div className="mb-4 flex gap-2">
            <input
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleComment()}
              placeholder="写下你的想法..."
              className="flex-1 px-4 py-2.5 text-sm rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 outline-none focus:border-orange-500"
            />
            <Button
              onClick={handleComment}
              disabled={submitting}
              size="sm"
              className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 h-10 px-4"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>

          {/* Comment list */}
          {comments.length === 0 ? (
            <div className="text-center py-8 text-sm text-zinc-400">暂无评论</div>
          ) : (
            <div className="space-y-3">
              {comments.map((comment: any) => {
                const isCurrentUserComment = comment.sys_users?.username === currentUsername
                const commentAvatar = isCurrentUserComment
                  ? (user?.avatarUrl || comment.sys_users?.avatar_url)
                  : comment.sys_users?.avatar_url
                const commentAuthor = comment.sys_users?.nickname || comment.sys_users?.username || '用户'
                return (
                  <div
                    key={comment.id}
                    className="rounded-lg border border-zinc-100 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-sm px-4 py-3"
                  >
                    <div className="flex items-center gap-2 mb-1.5">
                      <UserAvatar
                        avatarUrl={commentAvatar}
                        nickname={commentAuthor}
                        size="sm"
                      />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        {commentAuthor}
                      </span>
                      <span className="text-[10px] text-zinc-400">
                        {formatTimeAgo(comment.create_time)}
                      </span>
                    </div>
                    <div className="text-sm text-zinc-600 dark:text-zinc-400 whitespace-pre-wrap">
                      {comment.content}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
