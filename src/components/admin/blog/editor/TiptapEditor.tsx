'use client'

import React, { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import Table from '@tiptap/extension-table'
import TableRow from '@tiptap/extension-table-row'
import TableHeader from '@tiptap/extension-table-header'
import TableCell from '@tiptap/extension-table-cell'
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
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { useState } from 'react'

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

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        codeBlock: false,
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
    },
  })

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
            <div className="grid gap-2">
              <Label htmlFor="imageUrl">图片 URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/image.jpg"
                value={tempImageUrl}
                onChange={(e) => setTempImageUrl(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setImageDialogOpen(false)}>取消</Button>
            <Button onClick={addImage}>插入</Button>
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
