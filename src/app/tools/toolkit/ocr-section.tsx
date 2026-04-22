"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import { Upload, Loader2, Copy, FileText, RotateCcw, Scan } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
// tesseract.js is loaded dynamically when needed

// Lazy-loaded Tesseract instance cache
let tesseractCache: typeof import("tesseract.js") | null = null
let tesseractPromise: Promise<typeof import("tesseract.js")> | null = null

async function getTesseract() {
  if (tesseractCache) return tesseractCache
  if (tesseractPromise) return tesseractPromise

  tesseractPromise = import("tesseract.js")
  tesseractCache = await tesseractPromise
  return tesseractCache
}

export function OcrSection() {
  const [image, setImage] = useState<string | null>(null)
  const [recognizedText, setRecognizedText] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [progress, setProgress] = useState(0)
  const [progressStatus, setProgressStatus] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
      setRecognizedText("")
      setProgress(0)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file)
      setImage(url)
      setRecognizedText("")
      setProgress(0)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleRecognize = async () => {
    if (!image) {
      toast({ title: "请先上传图片", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    setProgress(0)

    try {
      const Tesseract = await getTesseract()
      const { data } = await Tesseract.recognize(image, "chi_sim+eng", {
        logger: (m) => {
          if (m.progress) {
            setProgress(Math.round(m.progress * 100))
          }
          if (m.status) {
            setProgressStatus(m.status)
          }
        },
      })

      setRecognizedText(data.text)
      toast({ title: "识别完成", description: `共识别出 ${data.text.trim().split("\n").filter(Boolean).length} 行文本` })
    } catch (error: any) {
      toast({ title: "识别失败", description: error?.message || "请稍后重试", variant: "destructive" })
    } finally {
      setIsProcessing(false)
      setProgress(0)
      setProgressStatus("")
    }
  }

  const handleCopy = async () => {
    if (!recognizedText) return
    try {
      await navigator.clipboard.writeText(recognizedText)
      toast({ title: "已复制到剪贴板" })
    } catch {
      toast({ title: "复制失败", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setImage(null)
    setRecognizedText("")
    setProgress(0)
    setProgressStatus("")
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      {/* 功能卡片 */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-r from-orange-500/5 to-amber-500/5 backdrop-blur-xl p-4 flex items-start gap-3 group">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center flex-shrink-0 transition-colors group-hover:from-orange-400/30 group-hover:to-amber-500/30">
          <Scan className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground mb-0.5">OCR 文字识别</h4>
          <p className="text-xs text-muted-foreground">
            上传图片自动识别中英文文字，首次使用需下载语言模型 (~4MB)，请耐心等待。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 上传图片 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-zinc-400" /> 原图
          </h3>

          {!image ? (
            <div
              className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center h-64 group"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-10 w-10 text-zinc-300 dark:text-zinc-600 group-hover:text-orange-400 transition-colors" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-medium">点击或拖拽上传图片</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">支持 JPG / PNG / WebP</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-900">
              <Image
                src={image}
                alt="待识别图片"
                width={600}
                height={400}
                className="w-full h-auto object-contain"
              />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {image && (
              <>
                <Button
                  onClick={handleRecognize}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {progress}%</>
                  ) : (
                    "开始识别"
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* 进度条 */}
          {isProcessing && (
            <div className="space-y-1">
              <div className="h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-zinc-400">{progressStatus}</p>
            </div>
          )}
        </div>

        {/* 识别结果 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-zinc-400" /> 识别结果
            </h3>
            {recognizedText && (
              <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1 text-xs">
                <Copy className="h-3 w-3" /> 复制
              </Button>
            )}
          </div>

          <Textarea
            value={recognizedText}
            onChange={(e) => setRecognizedText(e.target.value)}
            placeholder="识别结果将显示在这里..."
            className="min-h-[300px] text-sm font-mono resize-none bg-white/50 dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08]"
            readOnly={isProcessing}
          />
        </div>
      </div>
    </div>
  )
}