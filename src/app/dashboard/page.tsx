"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"
import { getLocalUserInfo } from "@/lib/api/adapters"
import { useDashboardData } from "@/hooks/useQueries"
import { PenLine, BookOpen, Link2, ExternalLink, Clock, Sparkles, MessageCircle } from "lucide-react"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { ProtectedRoute } from "@/components/auth/AuthGuard"

type MemoData = {
  id: number
  content: string
  create_time: string
  like_count: number
  comment_count: number
}

type BookmarkData = {
  title: string
  url: string
}

/** 数字滚动动画 hook */
function useCountUp(target: number, duration = 800, start = false) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    let frame: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCurrent(Math.floor(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start])
  return current
}

// CSS 动画定义（内联 style 注入一次）
const ANIMATION_STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes shimmerLine {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .anim-fade-slide-up {
    opacity: 0;
    animation: fadeSlideUp 0.5s ease-out forwards;
  }
  .anim-fade-in {
    opacity: 0;
    animation: fadeIn 0.6s ease-out forwards;
  }
  .anim-shimmer {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(245, 166, 35, 0.15) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmerLine 2.5s infinite;
  }
`

function AnimationStyles() {
  return <style>{ANIMATION_STYLES}</style>
}

export default function DashboardPage() {
  const { data: dashboardData, isLoading } = useDashboardData()
  const memoCount = dashboardData?.memoTotal ?? 0
  const articleCount = dashboardData?.articleTotal ?? 0
  const recentMemos: MemoData[] = (dashboardData?.memos as MemoData[]) || []

  // Read bookmarks from localStorage (client only)
  const [bookmarks, setBookmarks] = useState<BookmarkData[]>([])
  const [bookmarkCount, setBookmarkCount] = useState(0)
  const bookmarkLoaded = React.useRef(false)
  if (!bookmarkLoaded.current) {
    bookmarkLoaded.current = true
    try {
      const stored = localStorage.getItem("blog_bookmarks")
      if (stored) {
        const parsed = JSON.parse(stored)
        setBookmarks(parsed)
        setBookmarkCount(parsed.length)
      }
    } catch { /* ignore */ }
  }
  const loading = isLoading

  const animatedMemoCount = useCountUp(memoCount, 600, !loading)
  const animatedArticleCount = useCountUp(articleCount, 600, !loading)
  const animatedBookmarkCount = useCountUp(bookmarkCount, 600, !loading)

  const SkeletonCard = () => (
    <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-3" />
      <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
      <div className="h-6 w-10 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  )

  const STATS_LINKS = ["/memos", "/blogs", "/blog"] as const

  const SkeletonList = () => (
    <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 animate-pulse">
      <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2.5 mb-1">
          <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-3 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
            <div className="h-2 w-20 rounded bg-zinc-200 dark:bg-zinc-800" />
          </div>
        </div>
      ))}
    </div>
  )

  // 渲染内容（统一外层结构，避免 hydration 不匹配）
  const content = loading
    ? (
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8">
          <div className="h-7 w-32 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <SkeletonCard /><SkeletonCard /><SkeletonCard />
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
            <SkeletonList /><SkeletonList />
          </div>
        </div>
      )
    : (
        <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8 anim-fade-in">
          {/* Page Header */}
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-[22px] font-bold tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent leading-tight">
                我的空间
              </h1>
              <div className="h-[2px] w-16 mt-2 rounded-full anim-shimmer" />
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { title: "碎碎念", value: animatedMemoCount, icon: MessageCircle },
              { title: "文章", value: animatedArticleCount, icon: BookOpen },
              { title: "精选收藏", value: animatedBookmarkCount, icon: Link2 },
            ].map((stat, index) => {
              const Icon = stat.icon
              return (
                <Link
                  key={index}
                  href={STATS_LINKS[index]}
                  className="group relative bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 cursor-pointer overflow-hidden
                             transition-colors duration-300 hover:border-orange-500/30 dark:hover:border-orange-500/20
                             no-underline text-inherit"
                  style={{
                    opacity: 0,
                    animation: `fadeSlideUp 0.4s ease-out ${index * 0.08}s forwards`,
                  }}
                >
                  {/* 底部渐变指示线 */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent
                                  group-hover:via-orange-400/60 transition-[background] duration-500" />
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center
                                    transition-colors duration-300 group-hover:from-orange-400/30 group-hover:to-amber-500/30">
                      <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:rotate-6" />
                    </div>
                  </div>
                  <p className="text-[12px] text-muted-foreground mb-1">{stat.title}</p>
                  <p className="text-[22px] font-bold text-foreground tabular-nums">{stat.value}</p>
                </Link>
              )
            })}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
            {/* Recent Memos */}
            <div className="bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4
                            transition-colors duration-300 hover:border-orange-500/30 dark:hover:border-orange-500/20 overflow-hidden
                            anim-fade-slide-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  <h3 className="text-[14px] font-semibold text-foreground">碎碎念</h3>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-amber-600 dark:text-amber-400 font-medium border border-orange-500/15">MEMO</span>
              </div>
              {recentMemos.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-muted-foreground">还没有碎碎念</div>
              ) : (
                <div className="space-y-1.5">
                  {recentMemos.map((memo, i) => (
                    <Link
                      key={memo.id}
                      href={`/memo/${memo.id}`}
                      className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all duration-200 cursor-pointer group/act no-underline text-inherit"
                      style={{
                        opacity: 0,
                        animation: `fadeSlideUp 0.35s ease-out ${0.3 + i * 0.06}s forwards`,
                      }}
                    >
                      <div className="relative">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center
                                        transition-colors duration-200 group-hover/act:from-orange-400/30 group-hover/act:to-amber-500/30">
                          <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-foreground line-clamp-2">{memo.content}</p>
                        <span className="text-[11px] text-muted-foreground tabular-nums">
                          {new Date(memo.create_time).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
              {/* 底部指示线 */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent
                              group-hover:via-orange-400/60 transition-[background] duration-500" />
            </div>

            {/* Bookmarks */}
            <div className="bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4
                            transition-colors duration-300 hover:border-orange-500/30 dark:hover:border-orange-500/20 overflow-hidden
                            anim-fade-slide-up" style={{ animationDelay: "0.3s" }}>
              <div className="flex items-center gap-2 mb-3">
                <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                <h3 className="text-[14px] font-semibold text-foreground">精选收藏</h3>
              </div>
              {bookmarks.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-muted-foreground">还没有精选收藏</div>
              ) : (
                <div className="space-y-1.5">
                  {bookmarks.map((bm, i) => (
                    <a
                      key={i}
                      href={bm.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all duration-200 group/site no-underline"
                      style={{
                        opacity: 0,
                        animation: `fadeSlideUp 0.35s ease-out ${0.4 + i * 0.06}s forwards`,
                      }}
                    >
                      <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center flex-shrink-0
                                      transition-colors duration-200 group-hover/site:from-orange-400/30 group-hover/site:to-amber-500/30">
                        <Link2 className="h-4 w-4 text-amber-600 dark:text-amber-400 transition-transform duration-200 group-hover/site:-rotate-12" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-[13px] font-medium text-foreground group-hover/site:text-orange-500 transition-colors truncate">
                            {bm.title}
                          </p>
                          <ExternalLink className="h-3 w-3 text-zinc-400 flex-shrink-0 opacity-0 group-hover/site:opacity-100 transition-opacity" />
                        </div>
                        <p className="text-[11px] text-muted-foreground truncate">
                          {bm.url.replace(/^https?:\/\//, '').split('/')[0]}
                        </p>
                      </div>
                    </a>
                  ))}
                </div>
              )}
              {/* 底部指示线 */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent
                              group-hover:via-orange-400/60 transition-[background] duration-500" />
            </div>
          </div>

          {/* Welcome Card */}
          <div className="relative bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-5 overflow-hidden
                          transition-colors duration-300 hover:border-orange-500/30 dark:hover:border-orange-500/20 group
                          anim-fade-slide-up" style={{ animationDelay: "0.5s" }}>
            <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)] blur-2xl pointer-events-none
                            group-hover:bg-[radial-gradient(circle,rgba(245,166,35,0.12)_0%,transparent_70%)] transition-[background] duration-700" />
            <div className="absolute inset-0 bg-gradient-to-l from-orange-500/5 via-transparent to-transparent
                            group-hover:from-orange-500/10 transition-[background] duration-500" />
            {/* 底部指示线 */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent
                            group-hover:via-orange-400/60 transition-[background] duration-500" />
            <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0
                              transition-all duration-300 group-hover:from-orange-400/40 group-hover:to-amber-500/40">
                <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400 transition-transform duration-300 group-hover:rotate-12" />
              </div>
              <div className="flex-1">
                <h3 className="text-[16px] font-semibold text-foreground mb-1">欢迎来到我的空间</h3>
                <p className="text-[13px] text-muted-foreground max-w-[500px]">
                  这里是你个人的私密空间，记录碎碎念、收藏精品文章，管理你的数字生活。
                </p>
              </div>
            </div>
          </div>
        </div>
      )

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <AnimationStyles />
        <div className="relative min-h-screen">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-300px] left-[-200px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute top-[40%] right-[-250px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.06)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute bottom-[-300px] left-1/3 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(245,166,80,0.05)_0%,transparent_70%)] blur-3xl" />
          </div>
          {content}
        </div>
      </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}
