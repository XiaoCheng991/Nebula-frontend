'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ArrowLeft, BookOpen, Calendar, Clock, ArrowRight, Loader2 } from 'lucide-react'
import { useArticles } from '@/hooks/useQueries'
import { MarkdownPreview } from '@/components/ui/markdown-preview'

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [fetching, setFetching] = useState(false)
  const observerRef = useRef<HTMLDivElement>(null)

  const { data: result, isLoading, isFetching } = useArticles(page, 10, 'create_time', true)

  useEffect(() => {
    if (!result) return
    if (result.data.length === 0) {
      setHasMore(false)
      setLoading(false)
      setFetching(false)
      return
    }
    // 首屏加载
    if (page === 1 && loading) {
      setArticles(result.data)
      setLoading(false)
    } else {
      // 翻页追加
      const exists = new Set(articles.map(a => a.id))
      const newItems = result.data.filter((a: any) => !exists.has(a.id))
      setArticles(prev => [...prev, ...newItems])
      setFetching(false)
    }
  }, [result, page])

  // Infinite scroll
  useEffect(() => {
    if (!observerRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && hasMore && !fetching && !isFetching) {
          const nextPage = page + 1
          setPage(nextPage)
          setFetching(true)
        }
      },
      { rootMargin: '100px' }
    )
    observer.observe(observerRef.current)
    return () => observer.disconnect()
  }, [hasMore, fetching, isFetching, page])

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
      {/* Nav */}
      <div className="max-w-3xl mx-auto px-4 pt-20 pb-6">
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
          <BookOpen className="h-4 w-4 text-zinc-400" />
          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">全部文章</h1>
        </div>
      </div>

      {/* Article list */}
      {loading ? (
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl p-5" />
          ))}
        </div>
      ) : articles.length === 0 ? (
        <div className="max-w-3xl mx-auto px-4 text-center py-20 text-sm text-zinc-400">
          暂无文章
        </div>
      ) : (
        <div className="max-w-3xl mx-auto px-4 space-y-3">
          {articles.map((article) => (
            <Link
              key={article.id}
              href={`/blog/${article.slug || article.id}`}
              className="block rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-all p-5 group"
            >
              <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors leading-snug mb-2">
                {article.title}
              </h3>
              <div className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-3">
                <MarkdownPreview content={article.summary || article.content} maxLen={120} />
                {!article.summary && !article.content && "暂无摘要"}
              </div>
              <div className="flex items-center gap-3 text-xs text-zinc-400">
                <span>{article.author_name}</span>
                <span>·</span>
                <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{article.create_time ? formatDate(article.create_time) : ''}</span>
                {article.view_count && article.view_count > 0 && (
                  <>
                    <span>·</span>
                    <span className="inline-flex items-center gap-1"><Clock className="h-3 w-3" />{article.view_count} 阅读</span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Loading indicator */}
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
