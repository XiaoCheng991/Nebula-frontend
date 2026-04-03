import React, { useRef, useCallback, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { uploadBlogImage } from '@/lib/api/modules/file'
import { toast } from '@/components/ui/use-toast'

const lowlight = createLowlight(common)

interface TiptapEditorProps {
  content: string
  onChange: (content: string) => void
  placeholder?: string
}

const toolbarBtn = (active?: boolean) =>
  `inline-flex items-center justify-center h-7 w-7 rounded text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors${
    active ? ' bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100' : ''
  }`

export function TiptapEditor({ content, onChange, placeholder = '开始写作...' }: TiptapEditorProps) {
  const [imageDialogOpen, setImageDialogOpen] = useState(false)
  const [linkDialogOpen, setLinkDialogOpen] = useState(false)
  const [tableDialogOpen, setTableDialogOpen] = useState(false)
  const [tempImageUrl, setTempImageUrl] = useState('')
  const [tempLinkUrl, setTempLinkUrl] = useState('')
  const [tempLinkText, setTempLinkText] = useState('')
  const [tableRows, setTableRows] = useState(3)
  const [tableCols, setTableCols] = useState(3)
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
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
          class: 'rounded-sm bg-zinc-950 dark:bg-zinc-900 p-4 overflow-x-auto',
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
        class: 'prose prose-sm sm:prose lg:prose-xl xl:prose-2xl dark:prose-invert prose-headings:font-semibold prose-headings:text-zinc-900 dark:prose-headings:text-zinc-100 prose-p:text-zinc-700 dark:prose-p:text-zinc-300 prose-a:text-orange-500 prose-img:rounded min-h-[400px] p-6 focus:outline-none max-w-none',
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
    <div className="flex flex-col h-full">
      {/* 工具栏 */}
      <div className="flex items-center px-4 py-1.5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60 gap-0.5 flex-wrap">
        <div className="flex items-center gap-0.5">
          <button type="button" className={toolbarBtn()} onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn()} onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <div className="flex items-center gap-0.5">
          <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 1 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} title="标题 1">
            <Heading1 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 2 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} title="标题 2">
            <Heading2 className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn(editor.isActive('heading', { level: 3 }))} onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} title="标题 3">
            <Heading3 className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <div className="flex items-center gap-0.5">
          <button type="button" className={toolbarBtn(editor.isActive('bold'))} onClick={() => editor.chain().focus().toggleBold().run()} title="粗体">
            <Bold className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn(editor.isActive('italic'))} onClick={() => editor.chain().focus().toggleItalic().run()} title="斜体">
            <Italic className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn(editor.isActive('strike'))} onClick={() => editor.chain().focus().toggleStrike().run()} title="删除线">
            <Strikethrough className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn(editor.isActive('code'))} onClick={() => editor.chain().focus().toggleCode().run()} title="行内代码">
            <Code className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <div className="flex items-center gap-0.5">
          <button type="button" className={toolbarBtn(editor.isActive('bulletList'))} onClick={() => editor.chain().focus().toggleBulletList().run()} title="无序列表">
            <List className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn(editor.isActive('orderedList'))} onClick={() => editor.chain().focus().toggleOrderedList().run()} title="有序列表">
            <ListOrdered className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <button type="button" className={toolbarBtn(editor.isActive('blockquote'))} onClick={() => editor.chain().focus().toggleBlockquote().run()} title="引用">
          <Quote className="h-3.5 w-3.5" />
        </button>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <div className="flex items-center gap-0.5">
          <button type="button" className={toolbarBtn()} onClick={() => setImageDialogOpen(true)} title="插入图片">
            <ImageIcon className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn()} onClick={() => setLinkDialogOpen(true)} title="插入链接">
            <LinkIcon className="h-3.5 w-3.5" />
          </button>
          <button type="button" className={toolbarBtn()} onClick={() => setTableDialogOpen(true)} title="插入表格">
            <TableIcon className="h-3.5 w-3.5" />
          </button>
        </div>

        <Separator orientation="vertical" className="h-4 mx-1" />

        <button type="button" className={toolbarBtn()} onClick={() => editor.chain().focus().unsetAllMarks().run()} title="清除格式">
          <RemoveFormatting className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* 编辑区域 */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-zinc-950">
        <div className="max-w-[800px] mx-auto py-8 px-6">
          <EditorContent editor={editor} />
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
