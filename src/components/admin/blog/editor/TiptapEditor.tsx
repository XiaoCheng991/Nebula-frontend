import React, { useRef, useCallback, useState, useEffect } from 'react'
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
          class: 'text-primary underline decoration-primary/30 underline-offset-4',
        },
      }),
      CodeBlockLowlight.configure({
        lowlight,
        HTMLAttributes: {
          class: 'rounded-lg bg-muted p-4 overflow-x-auto',
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
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl dark:prose-invert min-h-[400px] p-4 focus:outline-none max-w-none',
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
    <div className="border rounded-lg overflow-hidden">
      {/* 工具栏 */}
      <div className="border-b bg-muted/50 p-2 flex items-center flex-wrap gap-1">
        {/* 撤销/重做 */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()} disabled={!editor.can().undo()}>
            <Undo className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()} disabled={!editor.can().redo()}>
            <Redo className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 标题 */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          >
            <Heading1 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          >
            <Heading2 className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          >
            <Heading3 className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 文本格式 */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBold().run()}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleItalic().run()}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleStrike().run()}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('code') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleCode().run()}
          >
            <Code className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 列表 */}
        <div className="flex items-center gap-1">
          <Button
            variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
          >
            <ListOrdered className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 引用 */}
        <Button
          variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>

        <Separator orientation="vertical" className="h-6" />

        {/* 插入 */}
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => setImageDialogOpen(true)}>
            <ImageIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setLinkDialogOpen(true)}>
            <LinkIcon className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setTableDialogOpen(true)}>
            <TableIcon className="h-4 w-4" />
          </Button>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* 清除格式 */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => editor.chain().focus().unsetAllMarks().run()}
        >
          <RemoveFormatting className="h-4 w-4" />
        </Button>
      </div>

      {/* 编辑区域 */}
      <EditorContent editor={editor} className="editor-content" />

      {/* 图片插入对话框 */}
      <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>插入图片</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* 文件上传 */}
            <div className="grid gap-2">
              <Label>上传图片</Label>
              <div
                className="border-2 border-dashed border-zinc-300 dark:border-zinc-600 rounded-lg p-6 text-center hover:border-zinc-400 dark:hover:border-zinc-500 transition-colors cursor-pointer"
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
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span className="text-sm text-zinc-500">上传中...</span>
                  </div>
                ) : (
                  <>
                    <ImageIcon className="h-8 w-8 mx-auto mb-2 text-zinc-400" />
                    <p className="text-sm text-zinc-500">点击或拖拽上传图片</p>
                    <p className="text-xs text-zinc-400 mt-1">支持 JPG、PNG、GIF、WebP</p>
                  </>
                )}
              </div>
            </div>
            {/* 分隔线 */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
              <span className="text-xs text-zinc-400">或输入图片 URL</span>
              <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-700" />
            </div>
            {/* URL 输入 */}
            <div className="grid gap-2">
              <Input
                placeholder="https://example.com/image.jpg"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>取消</Button>
            <Button onClick={addImage} disabled={!tempImageUrl.trim()}>插入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 链接插入对话框 */}
      <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>插入链接</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="linkUrl">链接 URL</Label>
              <Input
                id="linkUrl"
                placeholder="https://example.com"
                value={tempLinkUrl}
                onChange={(e) => setTempLinkUrl(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="linkText">链接文本（可选）</Label>
              <Input
                id="linkText"
                placeholder="点击这里"
                value={tempLinkText}
                onChange={(e) => setTempLinkText(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLinkDialogOpen(false)}>取消</Button>
            <Button onClick={addLink}>插入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 表格插入对话框 */}
      <Dialog open={tableDialogOpen} onOpenChange={setTableDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>插入表格</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="tableRows">行数</Label>
                <Input
                  id="tableRows"
                  type="number"
                  min="1"
                  max="20"
                  value={tableRows}
                  onChange={(e) => setTableRows(parseInt(e.target.value) || 1)}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="tableCols">列数</Label>
                <Input
                  id="tableCols"
                  type="number"
                  min="1"
                  max="10"
                  value={tableCols}
                  onChange={(e) => setTableCols(parseInt(e.target.value) || 1)}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTableDialogOpen(false)}>取消</Button>
            <Button onClick={addTable}>插入</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
