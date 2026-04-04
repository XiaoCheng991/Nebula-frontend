'use client'

import { useState, useEffect, useRef, type ChangeEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Send, ArrowLeft, Smile, X, ImageIcon } from 'lucide-react'
import { UserAvatar } from '@/components/ui/user-avatar'
import { useUser } from '@/lib/user-context'
import { createMemo } from '@/lib/supabase/modules/memo'
import { getUserInfo } from '@/lib/api/adapters/auth-adapter'
import { uploadBlogImage } from '@/lib/api/modules/file'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'

const moodOptions = [
  { emoji: '😊', label: '开心' },
  { emoji: '😎', label: '放松' },
  { emoji: '🤔', label: '思考' },
  { emoji: '🔥', label: '专注' },
  { emoji: '☕', label: '惬意' },
  { emoji: '🎉', label: '庆祝' },
  { emoji: '💡', label: '灵感' },
  { emoji: '😴', label: '累' },
]

export default function MemoWritePage() {
  const { user } = useUser()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [isMounted, setIsMounted] = useState(false)

  const [content, setContent] = useState('')
  const [mood, setMood] = useState<string>('')
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [showMoodPicker, setShowMoodPicker] = useState(false)

  const userNickname = user?.nickname || '用户'
  const userAvatar = user?.avatarUrl || null

  useEffect(() => {
    setIsMounted(true)
  }, [])

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: '文件格式错误', description: '请上传图片文件', variant: 'destructive' })
      return
    }

    try {
      setUploading(true)
      const url = await uploadBlogImage(file)
      setImageUrls(prev => [...prev, url])
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '图片上传失败'
      toast({ title: '上传失败', description: msg, variant: 'destructive' })
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  const removeImage = (index: number) => {
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  const handlePublish = async () => {
    if (!content.trim() && imageUrls.length === 0) {
      toast({ title: '提示', description: '请输入内容或上传图片', variant: 'destructive' })
      return
    }

    try {
      setPublishing(true)

      const sysUser = await getUserInfo()
      const displayContent = mood ? `${content.trim()}\n\n心情：${mood}` : content.trim()

      const postData = {
        user_id: Number(sysUser.id),
        content: displayContent,
        image_urls: imageUrls.length > 0 ? imageUrls : [],
        visibility: 'PUBLIC',
      }

      const { error } = await createMemo(postData)
      if (error) throw error

      toast({ title: '动态已发布', description: '发布成功！' })
      router.push('/blog')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : '未知错误'
      toast({ title: '发布失败', description: msg, variant: 'destructive' })
    } finally {
      setPublishing(false)
    }
  }

  if (!isMounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:via-zinc-900/50 dark:to-zinc-950">
      {/* Nav */}
      <div className="max-w-2xl mx-auto px-4 pt-20 pb-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            返回
          </button>
          <Button
            onClick={handlePublish}
            disabled={publishing}
            size="sm"
            className="gap-1.5 text-sm bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 shadow-sm h-9 px-4"
          >
            {publishing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Send className="h-3.5 w-3.5" />
            )}
            发布
          </Button>
        </div>
      </div>

      {/* Compose area */}
      <div className="max-w-2xl mx-auto px-4 pt-4 pb-8">
        <div className="rounded-md border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl">
          {/* Author row */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-200/80 dark:border-zinc-800">
            <UserAvatar avatarUrl={userAvatar} nickname={userNickname} size="sm" />
            <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{userNickname}</span>
          </div>

          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="今天有什么想分享的？"
            className="w-full min-h-[120px] px-4 py-3 bg-transparent text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 resize-none outline-none"
          />

          {/* Image preview */}
          {imageUrls.length > 0 && (
            <div className="px-4 pb-3">
              <div className="flex gap-2 flex-wrap">
                {imageUrls.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt="" className="w-20 h-20 object-cover rounded-md" />
                    <button
                      onClick={() => removeImage(index)}
                      className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-zinc-900/70 text-white flex items-center justify-center"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-3 border-t border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-4">
              {/* Image upload */}
              <label className="cursor-pointer flex items-center">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={uploading}
                />
                {uploading ? (
                  <Loader2 className="h-5 w-5 text-zinc-400 animate-spin" />
                ) : (
                  <ImageIcon className="h-5 w-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors" />
                )}
              </label>

              {/* Mood picker */}
              <div className="relative flex items-center justify-center w-5 h-5">
                <button
                  type="button"
                  onClick={() => setShowMoodPicker(!showMoodPicker)}
                  className={`${mood ? 'text-orange-500' : 'text-zinc-400'} hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors flex items-center`}
                >
                  <Smile className="h-5 w-5" />
                </button>
                {showMoodPicker && (
                  <div className="absolute bottom-7 left-0 z-50 rounded-md border border-zinc-200 dark:border-zinc-700 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl shadow-lg p-2 w-[220px]">
                    <div className="grid grid-cols-4 gap-1">
                    {moodOptions.map((option) => (
                      <button
                        key={option.label}
                        type="button"
                        onClick={() => {
                          setMood(option.emoji + ' ' + option.label)
                          setShowMoodPicker(false)
                        }}
                        className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded text-xs hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        <span className="text-lg">{option.emoji}</span>
                        <span className="text-[10px] text-zinc-500">{option.label}</span>
                      </button>
                    ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Mood display */}
            {mood && (
              <span className="text-xs text-zinc-500">{mood}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
