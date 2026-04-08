'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ArrowLeft, Calendar, Clock, Share2, MessageSquare } from 'lucide-react'
import { getArticleById } from '@/lib/supabase/modules/blog'
import { useUser } from '@/lib/user-context'
import { UserAvatar } from '@/components/ui/user-avatar'
import { IconGitHub } from '@/components/branding/social-icons'

interface BlogDetailPageProps {
  params: { id: string }
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function formatReadingTime(html: string): string {
  const text = html.replace(/<[^>]*>/g, '')
  const words = text.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} 分钟阅读`
}

export default function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { user } = useUser()
  const [article, setArticle] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const articleId = Number(params.id)
    if (isNaN(articleId)) {
      notFound()
      return
    }

    getArticleById(articleId).then(({ data, error }) => {
      if (error || !data || data.deleted === 1) {
        notFound()
        return
      }
      setArticle(data)
      setLoading(false)
    })
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950 flex items-center justify-center">
        <div className="text-sm text-zinc-400">加载中...</div>
      </div>
    )
  }

  if (!article) {
    notFound()
  }

  const readingTime = article.content_html ? formatReadingTime(article.content_html) : ''

  // 头像匹配：如果作者是当前用户，用 useUser 中的最新头像，否则使用文章自带的作者头像
  const currentUsername = user?.username || ''
  const isCurrentUserAuthor = article.author_name === currentUsername
  const authorAvatarUrl = isCurrentUserAuthor
    ? (user?.avatarUrl || article.author_avatar_url || null)
    : (article.author_avatar_url || null)
  const authorNickname = article.author_name || '用户'

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
      {/* Nav bar */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-4">
        <div className="flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回博客列表
          </Link>
          <div className="flex items-center gap-1">
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="分享"
            >
              <Share2 className="h-4 w-4" />
            </button>
            <button
              className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
              title="评论"
            >
              <MessageSquare className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Article content */}
      <article className="max-w-3xl mx-auto px-4 pt-6 pb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 leading-tight mb-6">
          {article.title}
        </h1>

        {/* Author info */}
        <div className="flex items-center gap-4 mb-8 pb-8 border-b border-zinc-200 dark:border-zinc-800">
          <UserAvatar
            size="md"
            avatarUrl={authorAvatarUrl}
            nickname={authorNickname}
          />
          <div className="flex-1">
            <p className="font-medium text-zinc-900 dark:text-zinc-100">
              {article.author_name}
            </p>
            <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              <time dateTime={article.create_time}>
                {article.create_time ? formatDate(article.create_time) : '未发布'}
              </time>
              {readingTime && (
                <>
                  <span>·</span>
                  <Clock className="h-3.5 w-3.5" />
                  <span>{readingTime}</span>
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-zinc-400">
                      </div>
        </div>

        {/* Article body */}
        <div
          className="prose prose-zinc dark:prose-invert max-w-none
            prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-6 prose-h1:pb-3
            prose-h2:text-2xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:font-semibold prose-h3:mt-8 prose-h3:mb-3
            prose-h4:text-lg prose-h4:font-medium prose-h4:mt-6 prose-h4:mb-2
            prose-p:leading-7 prose-p:my-4
            prose-a:text-orange-500 prose-a:no-underline hover:prose-a:underline
            prose-img:rounded-md prose-img:shadow-lg prose-img:my-6
            prose-code:text-sm prose-code:bg-zinc-100 dark:prose-code:bg-zinc-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
            prose-pre:bg-zinc-900 prose-pre:shadow-lg
            prose-blockquote:border-l-orange-500 prose-blockquote:border-l-4 prose-blockquote:pl-4 prose-blockquote:text-zinc-600 dark:prose-blockquote:text-zinc-400
            prose-li:marker:text-zinc-400
            prose-table:my-6 prose-table:w-full prose-table:border-collapse
            prose-thead:bg-zinc-100 dark:prose-thead:bg-zinc-800
            prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold prose-th:border prose-th:border-zinc-200 dark:prose-th:border-zinc-700
            prose-td:px-4 prose-td:py-2 prose-td:border prose-td:border-zinc-200 dark:prose-td:border-zinc-700"
          dangerouslySetInnerHTML={{ __html: article.content_html || '' }}
        />

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-primary transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              返回博客列表
            </Link>
            <div className="flex items-center gap-1">
              <a
                href="https://github.com/XiaoCheng991/Nebula-frontend"
                target="_blank"
                rel="noopener noreferrer"
                className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                title="GitHub"
              >
                <IconGitHub size={18} />
              </a>
            </div>
          </div>
        </div>
      </article>
    </div>
  )
}
