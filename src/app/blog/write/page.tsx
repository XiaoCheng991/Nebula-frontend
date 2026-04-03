'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { TiptapEditor } from '@/components/admin/blog/editor/TiptapEditor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import TurndownService from 'turndown'
import { toast } from '@/components/ui/use-toast'
import { createArticle, updateArticle, getArticleById } from '@/lib/supabase/modules/blog'
import { supabase } from '@/lib/supabase/client'
import { useUser } from '@/lib/user-context'
import { getLocalUserInfo } from '@/lib/api'
import {
  ArrowLeft,
  Send,
  FileText,
  Loader2,
} from 'lucide-react'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

function WriteEditorContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null
  const { user } = useUser()

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!editId)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  const getUserId = (): number => {
    const localUser = getLocalUserInfo()
    return Number(localUser?.id) || 5
  }

  const getUserName = (): string => {
    const localUser = getLocalUserInfo()
    return user?.nickname || localUser?.nickname || user?.username || localUser?.username || '用户'
  }

  // 加载已有文章
  useEffect(() => {
    if (!editId) {
      setFetching(false)
      return
    }

    (async () => {
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

  const handlePublish = async () => {
    if (!title.trim()) {
      toast({ title: '提示', description: '请输入文章标题', variant: 'destructive' })
      return
    }
    if (!content.trim()) {
      toast({ title: '提示', description: '请输入文章内容', variant: 'destructive' })
      return
    }

    setLoading(true)
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
        router.push('/blog')
      } else {
        const { error } = await createArticle(postData)
        if (error) throw error
        toast({ title: '发布成功', description: '文章已发布' })
        router.push('/blog')
      }
    } catch (err: any) {
      toast({ title: '发布失败', description: err.message || '未知错误', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-zinc-500 dark:text-zinc-400">加载文章中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* 操作栏 */}
      <div className="flex items-center justify-between">
        <Link href="/blog" passHref>
          <Button variant="ghost" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            返回博客
          </Button>
        </Link>

        <Button
          onClick={handlePublish}
          disabled={loading}
          className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {editId ? '更新文章' : '发布文章'}
        </Button>
      </div>

      {/* 标题输入 */}
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm text-zinc-700 dark:text-zinc-300">文章标题</Label>
        <Input
          id="title"
          placeholder="给文章取个标题"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-medium bg-white/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-700"
        />
      </div>

      {/* 摘要输入 */}
      <div className="space-y-2">
        <Label htmlFor="excerpt" className="text-sm text-zinc-700 dark:text-zinc-300">文章摘要（可选）</Label>
        <Textarea
          id="excerpt"
          placeholder="简要描述文章内容，用于列表页展示"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          rows={2}
          className="bg-white/50 dark:bg-zinc-900/30 border-zinc-200 dark:border-zinc-700"
        />
      </div>

      {/* 编辑器 */}
      <div className="min-h-[500px] border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-white/80 dark:bg-zinc-900/50">
        <TiptapEditor
          content={content}
          onChange={setContent}
          placeholder="开始写作..."
        />
      </div>

      {/* 字数统计 */}
      {content.trim() && (
        <div className="flex items-center gap-2 text-xs text-zinc-400">
          <FileText className="h-3 w-3" />
          <span>已输入 {content.trim().length} 字</span>
        </div>
      )}
    </div>
  )
}

export default function BlogWritePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      <div className="max-w-4xl mx-auto px-4 pt-24 pb-16">
        <Suspense
          fallback={
            <div className="flex h-[50vh] items-center justify-center">
              <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
            </div>
          }
        >
          <WriteEditorContent />
        </Suspense>
      </div>
    </main>
  )
}
