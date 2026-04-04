'use client'

import { useState, useEffect, Suspense, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { TiptapEditor } from '@/components/admin/blog/editor/TiptapEditor'
import { toast } from '@/components/ui/use-toast'
import { createArticle, updateArticle, getArticleById, getArticles } from '@/lib/supabase/modules/blog'
import { useUser } from '@/lib/user-context'
import { getLocalUserInfo } from '@/lib/api'
import {
  Loader2,
  Plus,
  FileText as DocIcon,
  ChevronLeft,
} from 'lucide-react'

// 从 HTML 提取目录
function extractToc(html: string) {
  const tagNames = ['h1', 'h2', 'h3', 'h4']
  const re = new RegExp(`<(${tagNames.join('|')})\\b[^>]*>(.*?)</\\1>`, 'gi')
  const items: { id: string; level: number; text: string }[] = []
  let m: ReturnType<typeof re.exec>
  while ((m = re.exec(html)) !== null) {
    const level = parseInt(m[1].slice(1), 10)
    const text = m[2].replace(/<[^>]*>/g, '').trim()
    if (text) {
      items.push({ id: `heading-${items.length}`, level, text })
    }
  }
  return items
}

// ==================== 左侧：文档树 ====================
function DocTree({
  articles,
  currentId,
}: {
  articles: { id: number; title: string; create_time: string }[]
  currentId: number | null
}) {
  return (
    <div className="fixed left-0 w-56 bg-zinc-50/80 dark:bg-zinc-900/60 overflow-y-auto border-r border-zinc-200/50 dark:border-zinc-800/50" style={{ top: 'calc(3.5rem + 1rem)', bottom: 0, zIndex: 60 }}>
      <div className="relative flex items-center justify-between px-3 py-3">
        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mx-auto">文章</span>
        <Link href="/blog/write">
          <button type="button" className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" title="新建文章">
            <Plus className="h-4 w-4" />
          </button>
        </Link>
      </div>
      <div className="relative py-1 px-1.5">
        {articles.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-40 text-zinc-400">
            <DocIcon className="h-8 w-8 mb-2 opacity-40" />
            <span className="text-xs">暂无文章</span>
          </div>
        ) : (
          <ul className="space-y-0.5">
            {articles.map((a) => (
              <li key={a.id}>
                <Link
                  href={`/blog/write?id=${a.id}`}
                  className={`flex items-center gap-2 py-2 px-2.5 truncate text-[15px] transition-colors rounded-sm ${
                    currentId === a.id
                      ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-medium'
                      : 'text-zinc-600 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                  }`}
                >
                  <DocIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                  <span className="truncate">{a.title || '未命名'}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

// ==================== TOC 悬浮面板 ====================
function TocFloatPanel({
  html,
  expanded,
  onToggle,
}: {
  html: string
  expanded: boolean
  onToggle: () => void
}) {
  const toc = useMemo(() => extractToc(html), [html])

  return (
    <>
      {!expanded && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute left-0 top-[3.5rem] z-30 flex items-center justify-center text-orange-400/60 hover:text-orange-500 transition-all duration-200 group"
          style={{ width: '28px', height: '28px' }}
          title="展开大纲"
        >
          <ChevronLeft className="w-4 h-4 rotate-180 transition-transform group-hover:scale-110" />
        </button>
      )}

      <div
        className={`absolute left-3 top-[3.5rem] z-20 transition-all duration-300 ease-out ${
          expanded
            ? 'opacity-100 translate-x-0 pointer-events-auto'
            : 'opacity-0 -translate-x-4 pointer-events-none'
        }`}
        style={{ width: '220px' }}
      >
        <div className="relative">
          <div className="flex items-center gap-1 py-1.5">
            <button
              type="button"
              onClick={onToggle}
              className="p-0.5 text-zinc-400 hover:text-orange-500 transition-all hover:scale-110 -ml-1"
              title="收起大纲"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-base font-semibold text-zinc-600 dark:text-zinc-300 tracking-wide flex-1">
              大纲
            </span>
          </div>
          <div className="overflow-y-auto py-1" style={{ maxHeight: 'calc(100vh - 200px)' }}>
            {toc.length === 0 ? (
              <p className="text-xs text-zinc-400 dark:text-zinc-500 py-2 px-4">开始写作后，大纲会出现在这里</p>
            ) : (
              <ul className="space-y-0.5">
                {toc.map((item) => (
                  <li key={item.id}>
                    <a
                      href={`#${item.id}`}
                      className="block py-0.5 truncate text-[14px] text-zinc-500 dark:text-zinc-400/80 hover:text-orange-500 dark:hover:text-orange-400 transition-colors leading-tight"
                      style={{ paddingLeft: `${(item.level - 1) * 10 + 16}px`, paddingRight: '8px' }}
                    >
                      {item.text}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// ==================== 编辑器表单 ====================
function EditorForm({
  editId,
}: {
  editId: number | null
}) {
  const { user } = useUser()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'local'>('idle')
  const savedIdRef = useRef<number | null>(editId)
  const syncContentRef = useRef('')
  const [articleList, setArticleList] = useState<{ id: number; title: string; create_time: string }[]>([])
  const [tocExpanded, setTocExpanded] = useState(true)
  const [fetching, setFetching] = useState(!!editId)
  const [editInfo, setEditInfo] = useState<{ authorName: string; updateTime: string } | null>(null)
  const [restoredFromLocal, setRestoredFromLocal] = useState(false)

  const getUserName = useCallback((): string => {
    const localUser = getLocalUserInfo()
    return user?.nickname || localUser?.nickname || user?.username || localUser?.username || '用户'
  }, [user?.nickname, user?.username])

  // 生成 localStorage 的 key
  const storageKey = useMemo(() => {
    return savedIdRef.current
      ? `nebula_draft_${savedIdRef.current}`
      : `nebula_draft_new`
  }, [savedIdRef.current])

  // 页面加载时：先从 localStorage 恢复，再从 Supabase 拉取
  useEffect(() => {
    // 1. 先尝试从 localStorage 恢复
    try {
      const cached = localStorage.getItem(storageKey)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.content) {
          setContent(parsed.content)
          setTitle(parsed.title || '')
          setRestoredFromLocal(true)
          setSaveStatus('local')
        }
      }
    } catch { /* ignore */ }

    // 2. 如果有 editId，从 Supabase 拉取
    if (editId) {
      ;(async () => {
        const { data, error } = await getArticleById(editId)
        if (error || !data) {
          toast({ title: '错误', description: '获取文章失败', variant: 'destructive' })
          return
        }
        const titleMatch = data.content_html?.match(/<h1[^>]*>(.*?)<\/h1>/i)
        setTitle(titleMatch?.[1]?.replace(/<[^>]*>/g, '')?.trim() || data.title || '')
        setContent(data.content_html || '')
        setEditInfo({
          authorName: data.author_name || getUserName(),
          updateTime: new Date(data.update_time || data.publish_time || data.create_time).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
        })
        setFetching(false)
        setSaveStatus('idle')
      })()
    } else {
      setFetching(false)
    }
  }, [editId, getUserName])

  // 加载文章列表
  useEffect(() => {
    ;(async () => {
      const res = await getArticles({ page: 1, pageSize: 50, orderBy: 'create_time' })
      if (res.data) {
        setArticleList(res.data.map(a => ({ id: a.id, title: a.title, create_time: a.create_time })))
      }
    })()
  }, [])

  const getUserId = (): number => {
    const localUser = getLocalUserInfo()
    return Number(localUser?.id) || 5
  }

  // 内容变化 → 立即存入 localStorage（即时保存，防止丢失）
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        title,
        content,
        savedId: savedIdRef.current,
        timestamp: Date.now(),
      }))
    } catch { /* ignore */ }
  }, [title, content, storageKey])

  // 标题变化时同步到编辑器 H1
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    setContent(prev => {
      const h1Regex = /^<h1[^>]*>.*?<\/h1>/i
      if (h1Regex.test(prev)) {
        return prev.replace(h1Regex, `<h1>${newTitle || '未命名文章'}</h1>`)
      }
      return `<h1>${newTitle || '未命名文章'}</h1>` + prev
    })
  }, [])

  // 每 10 秒同步到 Supabase（防抖，降低数据库压力）
  useEffect(() => {
    if (!content.trim() && !restoredFromLocal) return
    const prev = syncContentRef.current
    if (!content.trim() && !prev) return

    const timer = setTimeout(async () => {
      if (content === syncContentRef.current) return
      syncContentRef.current = content

      try {
        setSaveStatus('saving')
        const postData = {
          title: title || '草稿',
          summary: '',
          content: '',
          content_html: content,
          status: 'DRAFT',
          author_id: getUserId(),
          author_name: getUserName(),
          publish_time: new Date().toISOString(),
        }

        if (savedIdRef.current) {
          await updateArticle(savedIdRef.current, postData)
        } else {
          const res = await createArticle(postData)
          if (res?.data?.id) {
            savedIdRef.current = res.data.id
            const url = new URL(window.location.href)
            url.searchParams.set('id', String(res.data.id))
            window.history.replaceState({}, '', url.toString())
            // 刷新文章列表
            const updated = await getArticles({ page: 1, pageSize: 50, orderBy: 'create_time' })
            if (updated.data) {
              setArticleList(updated.data.map(a => ({ id: a.id, title: a.title, create_time: a.create_time })))
            }
          }
        }
        setSaveStatus('saved')
        setRestoredFromLocal(false)
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [content, title, getUserName])

  // 发布
  const handlePublish = useCallback(async () => {
    if (!content.trim()) {
      toast({ title: '提示', description: '请先输入内容', variant: 'destructive' })
      return
    }

    try {
      setSaveStatus('saving')
      const summaryText = content.replace(/<[^>]*>/g, '').trim().substring(0, 200)

      const postData = {
        title: title || '未命名文章',
        summary: summaryText || null,
        content: '',
        content_html: content,
        status: 'PUBLISHED',
        author_id: getUserId(),
        author_name: getUserName(),
        publish_time: new Date().toISOString(),
      }

      if (savedIdRef.current) {
        const { error } = await updateArticle(savedIdRef.current, postData)
        if (error) throw error
        toast({ title: '发布成功', description: '文章已更新' })
      } else {
        const res = await createArticle(postData)
        if (res?.error) throw res.error
        if (res?.data?.id) {
          savedIdRef.current = res.data.id
          const url = new URL(window.location.href)
          url.searchParams.set('id', String(res.data.id))
          window.history.replaceState({}, '', url.toString())
          const updated = await getArticles({ page: 1, pageSize: 50, orderBy: 'create_time' })
          if (updated.data) {
            setArticleList(updated.data.map(a => ({ id: a.id, title: a.title, create_time: a.create_time })))
          }
        }
        toast({ title: '发布成功', description: '文章已发布' })
      }
      // 清除 localStorage 草稿
      localStorage.removeItem(storageKey)
      setSaveStatus('saved')
    } catch (err: any) {
      setSaveStatus('idle')
      toast({ title: '发布失败', description: err.message || '未知错误', variant: 'destructive' })
    }
  }, [content, title, getUserName, storageKey])

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <>
      {/* ===== 左侧固定文档树 ===== */}
      <DocTree articles={articleList} currentId={editId} />

      {/* ===== 正文编辑器 ===== */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-h-0" style={{ marginLeft: '14rem' }}>
        {/* 编辑区域（不塌陷） */}
        <div className="flex-1 overflow-y-auto min-h-0" style={{ minHeight: 0 }}>
          <TiptapEditor
            title={title}
            onTitleChange={handleTitleChange}
            content={content}
            onChange={setContent}
            onPublish={handlePublish}
            saveStatus={saveStatus}
            editInfo={editInfo}
            placeholder="# 标题&#10;&#10;在这里写作... 输入 # + 空格变标题，** + 空格变粗体，- 空格变列表"
          />
        </div>

        {/* TOC 悬浮面板（透明背景，绝对定位） */}
        <TocFloatPanel
          html={content}
          expanded={tocExpanded}
          onToggle={() => setTocExpanded((d) => !d)}
        />
      </div>
    </>
  )
}

// ==================== 主页面 ====================
function BlogWriteClient() {
  const editId = typeof window !== 'undefined'
    ? (() => { const p = new URLSearchParams(window.location.search).get('id'); return p ? Number(p) : null })()
    : null

  return (
    <div className="fixed flex flex-col left-0 right-0 bg-transparent" style={{ top: 'calc(3.5rem + 1rem)', height: 'calc(100vh - 3.5rem - 1rem)', zIndex: 40 }}>
      <EditorForm editId={editId} />
    </div>
  )
}

export default function BlogWritePage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
        </div>
      }
    >
      <BlogWriteClient />
    </Suspense>
  )
}
