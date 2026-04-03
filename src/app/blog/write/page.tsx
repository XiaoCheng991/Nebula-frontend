'use client'

import { useState, useEffect, Suspense, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor } from '@/components/admin/blog/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import TurndownService from 'turndown'
import { toast } from '@/components/ui/use-toast'
import { createArticle, updateArticle, getArticleById } from '@/lib/supabase/modules/blog'
import { useUser } from '@/lib/user-context'
import { getLocalUserInfo } from '@/lib/api'
import {
  ArrowLeft,
  Send,
  FileText,
  PenLine,
  Loader2,
  Save,
} from 'lucide-react'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

interface EditorState {
  title: string
  excerpt: string
  content: string
  setTitle: (v: string) => void
  setExcerpt: (v: string) => void
  setContent: (v: string) => void
  charCount: number
}

// 编辑器主体组件 - 暴露状态给父组件
function EditorForm({ onStateChange }: { onStateChange: (state: EditorState) => void }) {
  const searchParams = useSearchParams()
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  const { user } = useUser()

  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [fetching, setFetching] = useState(!!editId)

  useEffect(() => {
    if (!editId) {
      setFetching(false)
      return
    }

    ;(async () => {
      const { data, error } = await getArticleById(editId)
      if (error || !data) {
        toast({ title: '错误', description: '获取文章失败', variant: 'destructive' })
        return
      }
      setTitle(data.title)
      setExcerpt(data.summary || '')
      setContent(data.content_html || '')
      setFetching(false)
    })()
  }, [editId])

  const charCount = content.replace(/<[^>]*>/g, '').trim().length

  const getUserName = (): string => {
    const localUser = getLocalUserInfo()
    return user?.nickname || localUser?.nickname || user?.username || localUser?.username || '用户'
  }

  const getUserId = (): number => {
    const localUser = getLocalUserInfo()
    return Number(localUser?.id) || 5
  }

  // 暴露状态和保存方法给父组件
  const state: EditorState = {
    title,
    excerpt,
    content,
    setTitle,
    setExcerpt,
    setContent,
    charCount,
  }

  const handleSaveDraft = useCallback(async () => {
    if (!title.trim()) {
      toast({ title: '提示', description: '请输入至少一个标题', variant: 'destructive' })
      return { ok: false }
    }
    try {
      const html = state.content
      const markdown = turndown.turndown(html)
      const postData = {
        title: title.trim(),
        summary: excerpt.trim() || null,
        content_html: html,
        content: markdown,
        status: 'DRAFT',
        author_id: getUserId(),
        author_name: getUserName(),
        publish_time: new Date().toISOString(),
      }

      if (editId) {
        await updateArticle(editId, postData)
      } else {
        await createArticle(postData)
      }
      toast({ title: '已保存', description: '草稿已保存' })
      return { ok: true }
    } catch (err: any) {
      toast({ title: '保存失败', description: err.message || '未知错误', variant: 'destructive' })
      return { ok: false }
    }
  }, [title, excerpt, state.content])

  const handlePublish = useCallback(async () => {
    if (!title.trim()) {
      toast({ title: '提示', description: '请输入文章标题', variant: 'destructive' })
      return { ok: false }
    }
    if (!content.trim()) {
      toast({ title: '提示', description: '请输入文章内容', variant: 'destructive' })
      return { ok: false }
    }

    try {
      const html = content
      const markdown = turndown.turndown(html)

      const postData = {
        title: title.trim(),
        summary: excerpt.trim() || null,
        content_html: html,
        content: markdown,
        status: 'PUBLISHED',
        author_id: getUserId(),
        author_name: getUserName(),
        publish_time: new Date().toISOString(),
      }

      if (editId) {
        const { error } = await updateArticle(editId, postData)
        if (error) throw error
        toast({ title: '发布成功', description: '文章已更新' })
      } else {
        const { error } = await createArticle(postData)
        if (error) throw error
        toast({ title: '发布成功', description: '文章已发布' })
      }
      return { ok: true }
    } catch (err: any) {
      toast({ title: '发布失败', description: err.message || '未知错误', variant: 'destructive' })
      return { ok: false }
    }
  }, [title, excerpt, content])

  useEffect(() => {
    onStateChange({
      ...state,
      handleSaveDraft,
      handlePublish,
    } as EditorState & { handleSaveDraft: () => Promise<{ ok: boolean }>; handlePublish: () => Promise<{ ok: boolean }> })
  }, [state, handleSaveDraft, handlePublish])

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {/* 标题 & 摘要区域 */}
      <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800/50">
        <input
          placeholder="文章标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full text-xl font-semibold bg-transparent border-0 outline-none h-auto py-1 placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-zinc-900 dark:text-zinc-100"
        />
        <textarea
          placeholder="简要描述文章内容，用于列表页展示"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={1}
          className="w-full text-sm bg-transparent border-0 outline-none resize-none mt-1.5 min-h-[24px] placeholder:text-zinc-300 dark:placeholder:text-zinc-600 text-zinc-400 dark:text-zinc-500"
        />
        {charCount > 0 && (
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-zinc-400">
            <FileText className="h-3 w-3" />
            <span>正文 {charCount} 字</span>
          </div>
        )}
      </div>

      {/* 编辑器 */}
      <div className="flex-1">
        <TiptapEditor
          content={content}
          onChange={(v) => {
            setContent(v)
          }}
          placeholder="开始写作..."
        />
      </div>
    </div>
  )
}

function BlogWriteInner({ editId }: { editId: number | null }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const saveDraftRef = { current: null as (() => Promise<{ ok: boolean }>) | null }
  const publishRef = { current: null as (() => Promise<{ ok: boolean }>) | null }

  const handleStateChange = (state: any) => {
    saveDraftRef.current = state.handleSaveDraft
    publishRef.current = state.handlePublish
  }

  const handleSaveDraft = async () => {
    if (!saveDraftRef.current) return
    setLoading(true)
    await saveDraftRef.current()
    setLoading(false)
  }

  const handlePublish = async () => {
    if (!publishRef.current) return
    setLoading(true)
    const res = await publishRef.current()
    setLoading(false)
    if (res.ok) {
      router.push('/blog')
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-900 dark:to-zinc-950">
      <div className="max-w-5xl mx-auto px-4 pt-20 pb-8">
        {/* 顶部操作栏 */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
              <ArrowLeft className="h-4 w-4 mr-1 inline" />
              返回博客
            </Link>
            <div className="flex items-center gap-2">
              <PenLine className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                {editId ? '编辑文章' : '写博客'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSaveDraft}
              disabled={loading}
              className="gap-1.5 text-xs border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              <Save className="h-3.5 w-3.5" />
              存草稿
            </Button>
            <Button
              onClick={handlePublish}
              disabled={loading}
              size="sm"
              className="gap-1.5 text-xs bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm"
            >
              {loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {editId ? '更新' : '发布'}
            </Button>
          </div>
        </div>

        {/* 编辑器主体 */}
        <div className="h-[calc(100vh-180px)] bg-white dark:bg-zinc-950 rounded-sm shadow-sm border border-zinc-200 dark:border-zinc-800 overflow-hidden">
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
              </div>
            }
          >
            <EditorForm onStateChange={handleStateChange} />
          </Suspense>
        </div>
      </div>
    </main>
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
      <BlogWriteInnerWrapper />
    </Suspense>
  )
}

function BlogWriteInnerWrapper() {
  const searchParams = useSearchParams()
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  return <BlogWriteInner editId={editId} />
}
