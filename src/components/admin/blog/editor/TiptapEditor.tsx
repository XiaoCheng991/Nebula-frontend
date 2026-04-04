import { useRef, useCallback, useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import NextLink from 'next/link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table, TableRow, TableHeader, TableCell } from '@tiptap/extension-table'
import { common, createLowlight } from 'lowlight'
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Image as ImageIcon,
  Link as LinkIcon,
  Table as TableIcon,
  RemoveFormatting,
  Loader2,
  ArrowLeft,
  Clock,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useUser } from '@/lib/user-context'
import { uploadBlogImage } from '@/lib/api/modules/file'
import { toast } from '@/components/ui/use-toast'
import { UserAvatar } from '@/components/ui/user-avatar'

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  title: string
  onTitleChange: (title: string) => void
  content: string
  onChange: (content: string) => void
  onPublish?: () => void
  saveStatus?: 'idle' | 'saving' | 'saved' | 'local'
  editInfo?: { authorName: string; updateTime: string } | null
  placeholder?: string
}

const toolbarIcon = 'h-6 w-5'

const toolbarBtn = (active?: boolean) =>
  `inline-flex items-center justify-center h-10 w-10 rounded-md text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors${
    active ? ' bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-medium' : ''
  }`

export function TiptapEditor({ title, onTitleChange, content, onChange, onPublish, saveStatus, editInfo, placeholder = '开始写作...' }: TiptapEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState('')
  const [tempLinkUrl, setTempLinkUrl] = useState('')
  const [tempLinkText, setTempLinkText] = useState('')
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [localEditTime, setLocalEditTime] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const { user } = useUser()

  useEffect(() => {
    setLocalEditTime(
      new Date().toLocaleString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })
    )
  }, [])

  const editor = useEditor({
    immediatelyRender: typeof window !== 'undefined',
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        link: false,
      }),
      Placeholder.configure({
        placeholder: placeholder,
      }),
      Image.configure({
        inline: true,
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-orange-500 underline decoration-orange-500/30 underline-offset-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'bg-zinc-950 dark:bg-zinc-900 p-4 overflow-x-auto border border-zinc-300 dark:border-zinc-700',
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
    ],
    content: content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert prose-h1:text-3xl prose-h1:mt-0 prose-h1:mb-4 prose-h1:pb-3 prose-h1:relative prose-h2:text-lg prose-h2:mt-5 prose-h2:mb-2 prose-h3:text-sm prose-h3:mt-3 prose-h4:text-sm prose-headings:font-semibold prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-a:text-orange-500 prose-img:rounded-sm min-h-[400px] p-6 focus:outline-none max-w-none prose-h1:h1-divider',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items
        if (!items) return false
        for (const item of items) {
          if (item.type.startsWith('image/')) {
            const file = item.getAsFile()
            if (!file) continue
            event.preventDefault()
            handleImageFile(file)
            return true
          }
        }
        return false
      },
      handleDrop: (view, event) => {
        const files = event.dataTransfer?.files
        if (!files) return false
        for (const file of files) {
          if (file.type.startsWith('image/')) {
            event.preventDefault()
            handleImageFile(file)
            return true
          }
        }
        return false
      },
    },
  })

  const handleImageFile = useCallback(async (file: File) => {
    try {
      setUploading(true)
      const url = await uploadBlogImage(file)
      editor?.chain().focus().setImage({ src: url }).run()
    } catch (err: any) {
      toast({ title: '上传失败', description: err.message || '图片上传失败', variant: 'destructive' })
    } finally {
      setUploading(false)
    }
  }, [editor])

  const handlePublish = async () => {
    if (!onPublish) return
    setPublishing(true)
    await onPublish()
    setPublishing(false)
  }

  if (!editor) {
    return null
  }

  const addImage = () => {
    if (tempImageUrl) {
      editor.chain().focus().setImage({ src: tempImageUrl }).run()
      setTempImageUrl('')
      setImageDialogOpen(false)
    }
  }

  const addLink = () => {
    if (tempLinkUrl) {
      editor.chain().focus().setLink({ href: tempLinkUrl }).run()
      if (tempLinkText) {
        editor.chain().focus().insertContent(tempLinkText).run()
      }
      setTempLinkUrl('')
      setTempLinkText('')
      setLinkDialogOpen(false)
    }
  }

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: true }).run()
    setTableDialogOpen(false)
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* 工具栏 — 左侧"返回博客"，中间工具按钮，右侧"发布" */}
      <div className="flex items-center justify-between px-2 py-1 border-b border-zinc-200/50 dark:border-zinc-800/50 bg-transparent shrink-0">
        {/* 左侧：返回博客 */}
        <NextLink href="/blog" className="text-[15px] text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors px-3 py-2 flex items-center gap-1.5">
          <ArrowLeft className="h-4 w-4" />
          返回博客
        </NextLink>

        {/* 中间：工具按钮 — 水平居中 */}
        <div className="flex items-center gap-0.5 flex-wrap justify-center">
          {/* 撤销/重做 */}
          <div className="flex items-center gap-0.5">
            <button type="button" className={toolbarBtn()} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
              <Undo className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn()} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
              <Redo className={toolbarIcon} />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-0.5" />

          {/* 标题 */}
          <div className="flex items-center gap-0.5">
            <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="标题 1">
              <Heading1 className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="标题 2">
              <Heading2 className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="标题 3">
              <Heading3 className={toolbarIcon} />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-0.5" />

          {/* 加粗/斜体/删除线/行内代码 */}
          <div className="flex items-center gap-0.5">
            <button type="button" className={toolbarBtn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title="粗体">
              <Bold className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title="斜体">
              <Italic className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()} title="删除线">
              <Strikethrough className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()} title="行内代码">
              <Code className={toolbarIcon} />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-0.5" />

          {/* 列表 */}
          <div className="flex items-center gap-0.5">
            <button type="button" className={toolbarBtn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="无序列表">
              <List className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="有序列表">
              <ListOrdered className={toolbarIcon} />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-0.5" />

          {/* 引用 */}
          <button type="button" className={toolbarBtn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="引用">
            <Quote className={toolbarIcon} />
          </button>

          <Separator orientation="vertical" className="h-6 mx-0.5" />

          {/* 插入 */}
          <div className="flex items-center gap-0.5">
            <button type="button" className={toolbarBtn()} onClick={() => setImageDialogOpen(true)} title="插入图片">
              <ImageIcon className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn()} onClick={() => setLinkDialogOpen(true)} title="插入链接">
              <LinkIcon className={toolbarIcon} />
            </button>
            <button type="button" className={toolbarBtn()} onClick={() => setTableDialogOpen(true)} title="插入表格">
              <TableIcon className={toolbarIcon} />
            </button>
          </div>

          <Separator orientation="vertical" className="h-6 mx-0.5" />

          {/* 清除格式 */}
          <button type="button" className={toolbarBtn()} onClick={() => editor.chain().focus().unsetAllMarks().run()} title="清除格式">
            <RemoveFormatting className={toolbarIcon} />
          </button>
        </div>

        {/* 右侧：发布 */}
        <div className="flex items-center gap-2 px-2">
          {saveStatus === 'saving' && (
            <span className="text-[11px] text-zinc-400 flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" /> 保存中...
            </span>
          )}
          {saveStatus === 'saved' && (
            <span className="text-[11px] text-green-500">已保存</span>
          )}
          {saveStatus === 'local' && (
            <span className="text-[11px] text-amber-500">已恢复草稿</span>
          )}
          {saveStatus === 'idle' && (
            <span className="text-[11px] text-zinc-400 hidden lg:inline">自动保存</span>
          )}
          <Button
            onClick={handlePublish}
            disabled={publishing}
            size="sm"
            className="gap-1.5 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm h-9 px-4"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              '发布'
            )}
          </Button>
        </div>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-y-auto bg-zinc-50/50 dark:bg-zinc-950/80 relative">
        {/* 装饰光源 - 右上角 */}
        <div className="fixed top-0 right-[15%] w-[600px] h-[400px] bg-gradient-to-bl from-amber-300/8 via-orange-200/4 to-transparent pointer-events-none rounded-full blur-3xl dark:from-amber-600/10 dark:via-orange-700/5" />
        {/* 装饰光源 - 左下角 */}
        <div className="fixed bottom-[10%] left-[25%] w-[400px] h-[300px] bg-gradient-to-tr from-blue-300/5 via-sky-200/3 to-transparent pointer-events-none rounded-full blur-3xl dark:from-blue-600/8 dark:via-sky-700/3" />

        <div className="max-w-[860px] mx-auto pt-6 px-10 relative">
          {/* 标题输入框（可编辑，同步到编辑器 H1） */}
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="输入文章标题..."
            className="w-full text-2xl font-bold bg-transparent border-none outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 text-zinc-900 dark:text-zinc-100 mb-4"
          />

          {/* 分隔：头像 + 编辑时间 */}
          <div className="flex items-center gap-3 py-3 mb-10 border-b border-zinc-200/60 dark:border-zinc-800/60" style={{ marginBottom: 0 }}>
            <UserAvatar
              avatarUrl={user?.avatarUrl}
              nickname={editInfo?.authorName || user?.nickname}
              size="sm"
            />
            <div className="flex items-center gap-2">
              <span className="text-[13px] text-zinc-600 dark:text-zinc-300 font-medium">{editInfo?.authorName || user?.nickname || '未知用户'}</span>
              <span className="text-[11px] text-zinc-400">·</span>
              <Clock className="w-3 h-3 text-zinc-400" />
              <span className="text-[12px] text-zinc-400">{editInfo?.updateTime || localEditTime || '开始编辑...'}</span>
            </div>
          </div>

          {/* 编辑器内容 - 隐藏第一个 H1（标题已外置渲染） */}
          <style>{`.tiptap-content > .ProseMirror > h1:first-child { display: none !important; }`}</style>
          <div className="tiptap-content">
            <EditorContent editor={editor} />
          </div>
        </div>
      </div>

      {/* 图片插入对话框 */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base">插入图片</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>上传图片</Label>
              <div
                className="mt-2 border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded p-6 text-center hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  e.preventDefault()
                  const file = e.dataTransfer.files[0]
                  if (file?.type.startsWith('image/')) {
                    handleImageFile(file)
                    setImageDialogOpen(false)
                  }
                }}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleImageFile(file)
                      setImageDialogOpen(false)
                    }
                  }}
                />
                {uploading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    <span className="text-sm text-zinc-500">上传中...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-6 w-6 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500">点击或拖拽上传图片</p>
                    <p className="text-xs text-zinc-400 mt-1">JPG、PNG、GIF、WebP</p>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-xs text-zinc-400">或输入 URL</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            </div>
            <Input
              placeholder="https://example.com/image.jpg"
              value={tempImageUrl}
              onChange={(e) => setTempImageUrl(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setImageDialogOpen(false)}>取消</Button>
            <Button size="sm" onClick={addImage} disabled={!tempImageUrl.trim()}>插入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 链接插入对话框 */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent className="sm:max-w-[420px]">
          <DialogHeader>
            <DialogTitle className="text-base">插入链接</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div>
              <Label htmlFor="linkUrl">链接 URL</Label>
              <Input
                id="linkUrl"
                placeholder="https://example.com"
                value={tempLinkUrl}
                onChange={(e) => setTempLinkUrl(e.target.value)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="linkText">链接文本（可选）</Label>
              <Input
                id="linkText"
                placeholder="点击这里"
                value={tempLinkText}
                onChange={(e) => setTempLinkText(e.target.value)}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setLinkDialogOpen(false)}>取消</Button>
            <Button size="sm" onClick={addLink}>插入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 表格插入对话框 */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent className="sm:max-w-[360px]">
          <DialogHeader>
            <DialogTitle className="text-base">插入表格</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-3 py-2">
            <div>
              <Label htmlFor="tableRows">行数</Label>
              <Input
                id="tableRows"
                type="number"
                min="1"
                max="20"
                value={tableRows}
                onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="tableCols">列数</Label>
              <Input
                id="tableCols"
                type="number"
                min="1"
                max="10"
                value={tableCols}
                onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                className="mt-1.5"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setTableDialogOpen(false)}>取消</Button>
            <Button size="sm" onClick={addTable}>插入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
