'use client'

import { useState, useEffect, Suspense, useCallback, useRef, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  MoreHorizontal,
  PencilIcon,
  Trash2,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'

const STORAGE_KEY = 'nebula_drafts'

// 文章类型（支持本地暂存和已入库文章）
interface LocalArticle {
  id: string
  title: string
  content: string
  dbId: number | null
  authorId: number
  authorName: string
  createTime: string
  updateTime: string
  status: 'local' | 'draft' | 'published'
}

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

function genLocalId(): string {
  return `local_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`
}

function createBlankArticle(authorId: number, authorName: string, dbId?: number): LocalArticle {
  const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
  return {
    id: dbId ? `db_${dbId}` : genLocalId(),
    title: '',
    content: '',
    dbId: dbId || null,
    authorId,
    authorName,
    createTime: now,
    updateTime: now,
    status: dbId ? 'draft' : 'local',
  }
}

// 持久化所有本地草稿到 localStorage
function saveDraftsToLocal(articles: LocalArticle[]) {
  try {
    const drafts = articles
      .filter(a => a.status === 'local')
      .map(a => ({ id: a.id, dbId: a.dbId, title: a.title, content: a.content, authorId: a.authorId, authorName: a.authorName, createTime: a.createTime, updateTime: a.updateTime, status: a.status }))
    localStorage.setItem(STORAGE_KEY, JSON.stringify(drafts))
  } catch { /* ignore */ }
}

function loadDraftsFromLocal(): LocalArticle[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw) as LocalArticle[]
  } catch { /* ignore */ }
  return []
}

// ==================== 左侧：文档树 ====================
function DocTree({
  articles,
  activeId,
  onArticleClick,
  onNewArticle,
  onRenameArticle,
  onDeleteArticle,
}: {
  articles: LocalArticle[]
  activeId: string
  onArticleClick: (article: LocalArticle) => void
  onNewArticle: () => void
  onRenameArticle: (id: string, title: string) => void
  onDeleteArticle: (id: string) => void
}) {
  return (
    <div className="group fixed left-0 w-56 bg-zinc-50/80 dark:bg-zinc-900/60 overflow-hidden border-r border-zinc-200/50 dark:border-zinc-800/50" style={{ top: 'calc(3.5rem + 1rem)', bottom: 0, zIndex: 60 }}>
      <div className="flex items-center justify-between px-2 py-[3px] border-b border-zinc-200/50 dark:border-zinc-800/50 bg-transparent">
        <span className="text-base font-semibold text-zinc-700 dark:text-zinc-200 mx-auto" style={{ height: '42px', display: 'flex', alignItems: 'center' }}>文章</span>
        <button type="button" onClick={onNewArticle} className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors" title="新建文章">
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="relative flex-1 py-4 px-2 bg-white/40 dark:bg-black/20 overflow-y-auto hide-scrollbar" style={{ height: 'calc(100% - 44px)' }}>
        <ul className="space-y-1">
          {articles.map((a) => (
            <li key={a.id} className="relative">
              <button
                type="button"
                onClick={() => onArticleClick(a)}
                className={`flex items-center gap-2 py-2 px-2.5 pr-8 w-full truncate text-[15px] transition-colors text-left ${
                  activeId === a.id
                    ? 'text-orange-600 dark:text-orange-400 font-medium'
                    : 'text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-zinc-100'
                }`}
              >
                <DocIcon className="h-3.5 w-3.5 shrink-0 opacity-60" />
                <span className="truncate">{a.title || '空文档'}</span>
              </button>
              {/* 选中指示线 */}
              {activeId === a.id && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-orange-500 rounded-r" />
              )}
              {/* 操作菜单 */}
              <DocMenu article={a} onRename={onRenameArticle} onDelete={onDeleteArticle} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function DocMenu({ article, onRename, onDelete }: { article: LocalArticle; onRename: (id: string, title: string) => void; onDelete: (id: string) => void }) {
  const [renaming, setRenaming] = useState(false)
  const [tempName, setTempName] = useState(article.title || '')
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (renaming) inputRef.current?.focus()
  }, [renaming])

  const handleRename = () => {
    if (tempName.trim()) {
      onRename(article.id, tempName.trim())
    }
    setRenaming(false)
  }

  const handleDelete = () => {
    if (article.status === 'local' || confirm('确定要删除这篇文章吗？')) {
      localStorage.removeItem(`nebula_article_${article.id}`)
      onDelete(article.id)
    }
  }

  if (renaming) {
    return (
      <div className="absolute right-1 top-1/2 -translate-y-1/2 z-10">
        <Input
          ref={inputRef as any}
          value={tempName}
          onChange={(e) => setTempName(e.target.value)}
          onBlur={handleRename}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleRename()
            if (e.key === 'Escape') setRenaming(false)
          }}
          className="h-6 text-xs px-1.5 py-0 w-28 rounded"
        />
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="absolute right-1 top-1/2 -translate-y-1/2 p-0.5 rounded text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors opacity-0 group-hover:opacity-100"
          style={{ zIndex: 5 }}
        >
          <MoreHorizontal className="h-3.5 w-3.5" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-36">
        <DropdownMenuItem onClick={() => setRenaming(true)} className="gap-2 cursor-pointer rounded">
          <PencilIcon className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-sm">重命名</span>
        </DropdownMenuItem>
        {article.dbId && (
          <DropdownMenuItem onClick={() => {
            navigator.clipboard?.writeText(`/blog/write?id=${article.dbId}`)
          }} className="gap-2 cursor-pointer rounded">
          <MoreHorizontal className="h-3.5 w-3.5 text-zinc-400" />
          <span className="text-sm">复制链接</span>
        </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleDelete} className="gap-2 cursor-pointer rounded text-red-500">
          <Trash2 className="h-3.5 w-3.5" />
          <span className="text-sm">删除</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
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
  initialDbId,
}: {
  initialDbId: number | null
}) {
  const { user } = useUser()
  const [articles, setArticles] = useState<LocalArticle[]>([])
  const [activeId, setActiveId] = useState('')
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'local'>('idle')
  const syncContentRef = useRef('')
  const [tocExpanded, setTocExpanded] = useState(true)
  const [editInfo, setEditInfo] = useState<{ authorName: string; updateTime: string } | null>(null)
  const initializedRef = useRef(false)

  const getUserId = useCallback((): number => {
    const localUser = getLocalUserInfo()
    return Number(localUser?.id) || 5
  }, [])

  const getUserName = useCallback((): string => {
    const localUser = getLocalUserInfo()
    return user?.nickname || localUser?.nickname || user?.username || localUser?.username || '用户'
  }, [user?.nickname, user?.username])

  // 初始化：从 localStorage 恢复所有文档 + 加载指定文章
  useEffect(() => {
    const authorId = getUserId()
    const authorName = getUserName()

    if (initializedRef.current) return
    initializedRef.current = true

    const localDrafts = loadDraftsFromLocal()

    if (initialDbId) {
      getArticleById(initialDbId).then(({ data, error }) => {
        if (error || !data) {
          toast({ title: '错误', description: '获取文章失败', variant: 'destructive' })
        }

        const titleMatch = data?.content_html?.match(/<h1[^>]*>(.*?)<\/h1>/i)
        const titleText = titleMatch?.[1]?.replace(/<[^>]*>/g, '')?.trim() || data?.title || ''
        const dbArticle: LocalArticle = {
          id: `db_${data!.id}`,
          title: titleText,
          content: data?.content_html || '',
          dbId: data!.id,
          authorId: authorId,
          authorName: data?.author_name || authorName,
          createTime: data?.create_time || '',
          updateTime: new Date(data?.update_time || data?.publish_time || Date.now()).toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' }),
          status: data?.status === 'PUBLISHED' ? 'published' : 'draft',
        }

        const allArticles = localDrafts.length > 0 ? [dbArticle, ...localDrafts] : [dbArticle]
        setArticles(allArticles)
        setActiveId(dbArticle.id)
        setTitle(dbArticle.title)
        setContent(dbArticle.content)
        syncContentRef.current = dbArticle.content
        setEditInfo({
          authorName: dbArticle.authorName,
          updateTime: dbArticle.updateTime,
        })
        setSaveStatus('idle')
      })
    } else {
      if (localDrafts.length > 0) {
        setArticles(localDrafts)
        setActiveId(localDrafts[0].id)
        setTitle(localDrafts[0].title)
        setContent(localDrafts[0].content)
        syncContentRef.current = localDrafts[0].content
        setEditInfo({
          authorName: localDrafts[0].authorName,
          updateTime: localDrafts[0].updateTime,
        })
        setSaveStatus('local')
      } else {
        const blank = createBlankArticle(authorId, authorName)
        setArticles([blank])
        setActiveId(blank.id)
        setTitle(blank.title)
        setContent(blank.content)
        syncContentRef.current = ''
        setEditInfo({
          authorName,
          updateTime: blank.updateTime,
        })
        setSaveStatus('idle')
      }
    }
  }, [initialDbId, getUserId, getUserName])

  // 持久化所有本地草稿
  useEffect(() => {
    if (articles.length === 0) return
    saveDraftsToLocal(articles)
  }, [articles])

  // 标题变化同步到编辑器 H1
  const handleTitleChange = useCallback((newTitle: string) => {
    setTitle(newTitle)
    setContent(prev => {
      const h1Regex = /^<h1[^>]*>.*?<\/h1>/i
      if (h1Regex.test(prev)) {
        return prev.replace(h1Regex, `<h1>${newTitle || '空文档'}</h1>`)
      }
      return `<h1>${newTitle || '空文档'}</h1>` + prev
    })
  }, [])

  // 内容变化更新 updateTime
  const onContentChange = useCallback((newContent: string) => {
    setContent(newContent)
    const now = new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    setArticles(prev => prev.map(a => a.id === activeId ? { ...a, updateTime: now } : a))
    setEditInfo(prev => prev ? { ...prev, updateTime: now } : null)
  }, [activeId])

  // 标题变化同步到文章列表
  useEffect(() => {
    setArticles(prev => prev.map(a => a.id === activeId ? { ...a, title } : a))
  }, [title, activeId])

  // 新建文章
  const handleNewArticle = useCallback(() => {
    const blank = createBlankArticle(getUserId(), getUserName())
    setArticles(prev => [blank, ...prev])
    setActiveId(blank.id)
    setTitle(blank.title)
    setContent(blank.content)
    syncContentRef.current = ''
    setEditInfo({
      authorName: getUserName(),
      updateTime: blank.updateTime,
    })
    setSaveStatus('local')
  }, [getUserId, getUserName])

  // 切换文章
  const handleArticleClick = useCallback((article: LocalArticle) => {
    setActiveId(article.id)
    setTitle(article.title)
    setContent(article.content)
    syncContentRef.current = article.content
    setEditInfo({
      authorName: article.authorName,
      updateTime: article.updateTime,
    })
    setSaveStatus(article.status === 'local' ? 'local' : 'idle')
  }, [])

  // 重命名
  const handleRename = useCallback((id: string, newName: string) => {
    setArticles(prev => prev.map(a => a.id === id ? { ...a, title: newName } : a))
    if (activeId === id) setTitle(newName)
  }, [activeId])

  // 删除文章
  const handleDelete = useCallback((id: string) => {
    setArticles(prev => {
      const filtered = prev.filter(a => a.id !== id)
      // 如果删除的是当前文章，切换到第一个
      if (filtered.length === 0) {
        const blank = createBlankArticle(getUserId(), getUserName())
        setActiveId(blank.id)
        setTitle(blank.title)
        setContent(blank.content)
        syncContentRef.current = ''
        setEditInfo({
          authorName: getUserName(),
          updateTime: blank.updateTime,
        })
        return [blank]
      }
      if (id === activeId && filtered.length > 0) {
        const next = filtered[0]
        setActiveId(next.id)
        setTitle(next.title)
        setContent(next.content)
        syncContentRef.current = next.content
        setEditInfo({
          authorName: next.authorName,
          updateTime: next.updateTime,
        })
      }
      return filtered
    })
  }, [activeId, getUserId, getUserName])

  // 每 10 秒同步到 Supabase（自动保存）
  useEffect(() => {
    const activeArticle = articles.find(a => a.id === activeId)
    if (!activeArticle) return
    const now = Date.now()
    const elapsed = now - new Date(activeArticle.updateTime).getTime()
    if (elapsed < 2000 && activeArticle.status === 'local') return // 避免频繁保存
    if (content === syncContentRef.current) return

    const timer = setTimeout(async () => {
      if (content === syncContentRef.current) return
      syncContentRef.current = content

      try {
        setSaveStatus('saving')
        const postData = {
          title: title || '空文档',
          summary: '',
          content: '',
          content_html: content,
          status: 'DRAFT',
          author_id: getUserId(),
          author_name: getUserName(),
          publish_time: new Date().toISOString(),
        }

        if (activeArticle.dbId) {
          await updateArticle(activeArticle.dbId, postData)
          setArticles(prev => prev.map(a =>
            a.id === activeId ? { ...a, status: 'draft' as const } : a
          ))
        } else {
          const res = await createArticle(postData)
          if (res?.data?.id) {
            setArticles(prev => prev.map(a =>
              a.id === activeId ? { ...a, dbId: res.data!.id, id: `db_${res.data!.id}`, status: 'draft' as const } : a
            ))
            setActiveId(`db_${res.data.id}`)
          }
        }
        setSaveStatus('saved')
        setTimeout(() => setSaveStatus('idle'), 2000)
      } catch {
        setSaveStatus('idle')
      }
    }, 10000)

    return () => clearTimeout(timer)
  }, [content, title, activeId, articles, getUserName, getUserId])

  // 发布
  const handlePublish = useCallback(async () => {
    if (!content.trim()) {
      toast({ title: '提示', description: '请先输入内容', variant: 'destructive' })
      return
    }

    try {
      setSaveStatus('saving')
      const summaryText = content.replace(/<[^>]*>/g, '').trim().substring(0, 200)
      const activeArticle = articles.find(a => a.id === activeId)

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

      if (activeArticle?.dbId) {
        const { error } = await updateArticle(activeArticle.dbId, postData)
        if (error) throw error
        toast({ title: '发布成功', description: '文章已更新' })
        setArticles(prev => prev.map(a =>
          a.id === activeId ? { ...a, status: 'published' as const } : a
        ))
      } else {
        const res = await createArticle(postData)
        if (res?.error) throw res.error
        if (res?.data?.id) {
          setArticles(prev => prev.map(a =>
            a.id === activeId ? { ...a, dbId: res.data!.id, id: `db_${res.data!.id}`, status: 'published' as const } : a
          ))
          setActiveId(`db_${res.data.id}`)
        }
        toast({ title: '发布成功', description: '文章已发布' })
      }
      setSaveStatus('saved')
    } catch (err: any) {
      setSaveStatus('idle')
      toast({ title: '发布失败', description: err.message || '未知错误', variant: 'destructive' })
    }
  }, [content, title, activeId, articles, getUserName, getUserId])

  if (!activeId) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-orange-500" />
      </div>
    )
  }

  return (
    <>
      {/* ===== 左侧：文档树 ===== */}
      <DocTree
        articles={articles}
        activeId={activeId}
        onArticleClick={handleArticleClick}
        onNewArticle={handleNewArticle}
        onRenameArticle={handleRename}
        onDeleteArticle={handleDelete}
      />

      {/* ===== 正文编辑器 ===== */}
      <div className="flex-1 flex flex-col overflow-hidden relative min-h-0" style={{ marginLeft: '14rem' }}>
        <div className="flex-1 overflow-y-auto min-h-0" style={{ minHeight: 0 }}>
          <TiptapEditor
            title={title}
            onTitleChange={handleTitleChange}
            content={content}
            onChange={onContentChange}
            onPublish={handlePublish}
            saveStatus={saveStatus}
            editInfo={editInfo}
            placeholder="# 标题&#10;&#10;在这里写作... 输入 # + 空格变标题，** + 空格变粗体，- 空格变列表"
          />
        </div>

        {/* TOC 悬浮面板 */}
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
  const [editId, setEditId] = useState<number | null>(null)

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('id')
    if (p) setEditId(Number(p))
  }, [])

  return (
    <div className="fixed flex flex-col left-0 right-0 bg-transparent" style={{ top: 'calc(3.5rem + 1rem)', height: 'calc(100vh - 3.5rem - 1rem)', zIndex: 40 }}>
      <EditorForm initialDbId={editId} />
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
