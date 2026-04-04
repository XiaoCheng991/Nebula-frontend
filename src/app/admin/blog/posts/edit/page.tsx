'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { TiptapEditor } from '@/components/admin/blog/editor/TiptapEditor'
import { TableOfContents } from '@/components/admin/blog/editor/TableOfContents'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  ArrowLeft,
  Save,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import TurndownService from 'turndown'
import { toast } from '@/components/ui/use-toast'
import { createArticle, updateArticle, getArticleById } from '@/lib/supabase/modules/blog'
import { supabase } from '@/lib/supabase/client'
import { getUserInfo } from '@/lib/api/adapters/auth-adapter'
import '@/app/admin/blog/editor.css'

const turndown = new TurndownService({
  headingStyle: 'atx',
  codeBlockStyle: 'fenced',
})

export default function PostEditPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const editId = searchParams.get('id') ? Number(searchParams.get('id')) : null

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(!!editId)
  const [showToc, setShowToc] = useState(true)
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')

  // 加载已有文章
  useEffect(() => {
    if (!editId) return

    (async () => {
      const { data, error } = await getArticleById(editId)
      if (error || !data) {
        toast({ title: '错误', description: '获取文章失败', variant: 'destructive' })
        return
      }
      setTitle(data.title)
      setExcerpt(data.summary || '')
      // 优先加载 HTML 到编辑器
      setContent(data.content_html || '')
      setFetching(false)
    })()
  }, [editId])

  const handleSave = async (draft: boolean = false) => {
    if (!title.trim()) {
      toast({ title: '提示', description: '请输入文章标题', variant: 'destructive' })
      return
    }
    if (!content.trim()) {
      toast({ title: '提示', description: '请输入文章内容', variant: 'destructive' })
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: '未登录', description: '请先登录', variant: 'destructive' })
      return
    }

    // 获取真实的 sys_user id
    const realUserInfo = await getUserInfo()

    setLoading(true)

    try {
      const html = content
      const markdown = turndown.turndown(html)

      const postData = {
        title: title.trim(),
        summary: excerpt.trim() || null,
        content_html: html,
        content: markdown,
        status: draft ? 'DRAFT' : 'PUBLISHED',
        author_id: Number(realUserInfo.id),
        author_name: user.email?.split('@')[0] || '用户',
        publish_time: draft ? null : new Date().toISOString(),
      }

      if (editId) {
        const { error } = await updateArticle(editId, postData)
        if (error) throw error
        toast({ title: draft ? '草稿已保存' : '文章已发布', description: '保存成功' })
      } else {
        const { error } = await createArticle(postData)
        if (error) throw error
        toast({ title: draft ? '草稿已保存' : '文章已发布', description: '保存成功' })
      }

      if (!draft) {
        router.push('/admin/blog/posts')
      }
    } catch (err: any) {
      toast({ title: '保存失败', description: err.message || '未知错误', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowToc(!showToc)}
          >
            {showToc ? (
              <ChevronLeft className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleSave(true)}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            保存草稿
          </Button>
          <Button
            size="sm"
            onClick={() => handleSave(false)}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-1" />
            {editId ? '更新文章' : '发布文章'}
          </Button>
        </div>
      </div>

      {/* 主内容区 */}
      <div className="flex-1 flex gap-4 min-h-0">
        {/* 左侧 TOC 面板 */}
        {showToc && (
          <Card className="w-64 flex-shrink-0 h-full">
            <CardContent className="p-0 h-full">
              <div className="border-b p-3 font-medium">
                文章目录
              </div>
              <TableOfContents content={content} className="h-[calc(100%-50px)]" />
            </CardContent>
          </Card>
        )}

        {/* 右侧编辑区域 */}
        <Card className="flex-1 h-full min-w-0">
          <CardContent className="p-4 h-full flex flex-col gap-4">
            {/* 标题输入 */}
            <div className="space-y-2">
              <Label htmlFor="title">文章标题</Label>
              <Input
                id="title"
                placeholder="请输入文章标题"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-medium"
              />
            </div>

            {/* 摘要输入 */}
            <div className="space-y-2">
              <Label htmlFor="excerpt">文章摘要（可选）</Label>
              <Textarea
                id="excerpt"
                placeholder="请输入文章摘要，用于列表页展示"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={2}
              />
            </div>

            {/* 编辑器 */}
            <div className="flex-1 min-h-0">
              <TiptapEditor
                title={title}
                onTitleChange={setTitle}
                content={content}
                onChange={setContent}
                placeholder="开始写作..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
