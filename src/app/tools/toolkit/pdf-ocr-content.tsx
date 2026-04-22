"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { Upload, Loader2, RotateCcw, FileText, Download, Scan, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { apiLogger } from "@/lib/utils/logger"
import dynamic from "next/dynamic"

// Lazy-loaded Tesseract cache
let tesseractCache: typeof import("tesseract.js") | null = null
let tesseractPromise: Promise<typeof import("tesseract.js")> | null = null

async function getTesseract() {
  if (tesseractCache) return tesseractCache
  if (tesseractPromise) return tesseractPromise
  tesseractPromise = import("tesseract.js")
  tesseractCache = await tesseractPromise
  return tesseractCache
}

// Dynamic import for pdf-lib - heavy PDF library
const PDFLibPromise = import("pdf-lib")

interface PdfPage {
  index: number
  canvas: HTMLCanvasElement
  text: string
  ocrWords: Array<{ text: string; x: number; y: number; w: number; h: number }>
}

// 进度条平滑动画
function useSmoothProgress() {
  const [progressPercent, setProgressPercent] = useState(0)
  const [progressLabel, setProgressLabel] = useState("")
  const progressRef = useRef({ current: 0, raf: 0 as number })

  const setSmoothProgress = useCallback((target: number, label?: string, duration = 500) => {
    if (label) setProgressLabel(label)
    const anim = progressRef.current
    if (anim.raf) cancelAnimationFrame(anim.raf)
    const id = ++anim.raf
    const from = anim.current
    const t0 = performance.now()
    const ease = (t: number) => 1 - (1 - t) * (1 - t) * (1 - t)

    const step = (now: number) => {
      if (anim.raf !== id) return
      const elapsed = now - t0
      const t = Math.min(elapsed / duration, 1)
      const val = Math.round(from + (target - from) * ease(t))
      anim.current = val
      setProgressPercent(val)
      if (t < 1) requestAnimationFrame(step)
      else anim.raf = 0
    }
    requestAnimationFrame(step)
  }, [])

  return { progressPercent, progressLabel, setSmoothProgress }
}

export function PdfOcrContent() {
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfName, setPdfName] = useState("")
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [resultText, setResultText] = useState("")
  const [resultPdfUrl, setResultPdfUrl] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { progressPercent, progressLabel, setSmoothProgress } = useSmoothProgress()

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setPdfName(file.name.replace(/\.pdf$/i, ""))
      setPdfUrl(URL.createObjectURL(file))
      setResultText("")
      setResultPdfUrl(null)
      setSmoothProgress(0)
    }
  }, [setSmoothProgress])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.type === "application/pdf") {
      setPdfFile(file)
      setPdfName(file.name.replace(/\.pdf$/i, ""))
      setPdfUrl(URL.createObjectURL(file))
      setResultText("")
      setResultPdfUrl(null)
      setSmoothProgress(0)
    }
  }, [setSmoothProgress])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  /** 动态加载 PDF.js v3 UMD 构建 */
  const loadPdfJs = useRef<Promise<any> | null>(null)
  const ensurePdfJs = useCallback(async () => {
    if (loadPdfJs.current) return loadPdfJs.current!
    loadPdfJs.current = new Promise((resolve, reject) => {
      if ((window as any).pdfjsLib) { resolve((window as any).pdfjsLib); return }
      const script = document.createElement("script")
      script.src = "/pdfjs.min.js"
      script.onload = () => {
        const pdfjs = (window as any).pdfjsLib
        if (pdfjs) {
          pdfjs.GlobalWorkerOptions.workerSrc = "/pdfjs.worker.min.js"
          resolve(pdfjs)
        } else {
          reject(new Error("PDF.js 未正确挂载到 window"))
        }
      }
      script.onerror = () => reject(new Error("无法加载 PDF.js"))
      document.head.appendChild(script)
    })
    return loadPdfJs.current
  }, [])

  const renderPdfPage = async (pdf: any, pageNum: number): Promise<HTMLCanvasElement> => {
    const page = await pdf.getPage(pageNum)
    const scale = 3.0
    const viewport = page.getViewport({ scale })
    const canvas = document.createElement("canvas")
    canvas.width = viewport.width
    canvas.height = viewport.height
    const ctx = canvas.getContext("2d")!
    ctx.fillStyle = "#ffffff"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    await page.render({ canvasContext: ctx, viewport }).promise
    return canvas
  }

  const ocrPage = async (canvas: HTMLCanvasElement): Promise<{ text: string; words: Array<{ text: string; x: number; y: number; w: number; h: number }> }> => {
    const imageUrl = canvas.toDataURL("image/png")
    const Tesseract = await getTesseract()
    const { data } = await Tesseract.recognize(imageUrl, "chi_sim+eng", {
      logger: () => {},
    })

    // 从 TSV 输出中解析单词位置
    const tsv = data.tsv || ""
    const rows = tsv.split("\n").filter(Boolean)
    const headers = rows[0]?.split("\t") || []
    const levelIdx = headers.indexOf("level")
    const wordTextIdx = headers.indexOf("word")
    const leftIdx = headers.indexOf("left")
    const topIdx = headers.indexOf("top")
    const widthIdx = headers.indexOf("width")
    const heightIdx = headers.indexOf("height")

    const words: Array<{ text: string; x: number; y: number; w: number; h: number }> = []

    for (let i = 1; i < rows.length; i++) {
      const cols = rows[i].split("\t")
      const level = parseInt(cols[levelIdx] || "0", 10)
      if (level !== 5) continue // 5 = word level
      const wordText = cols[wordTextIdx] || ""
      if (!wordText.trim()) continue

      words.push({
        text: wordText.trim(),
        x: parseInt(cols[leftIdx] || "0", 10),
        y: parseInt(cols[topIdx] || "0", 10),
        w: parseInt(cols[widthIdx] || "0", 10),
        h: parseInt(cols[heightIdx] || "0", 10),
      })
    }

    return { text: data.text, words }
  }

  const handleProcess = async () => {
    if (!pdfFile || !pdfUrl) {
      toast({ title: "请先上传 PDF 文件", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    setSmoothProgress(0, "加载 PDF...")

    try {
      setSmoothProgress(5, "加载 PDF...")
      const pdfjs = await ensurePdfJs()
      const PDFLib = await PDFLibPromise
      const arrayBuffer = await pdfFile.arrayBuffer()
      const pdf = await pdfjs.getDocument({ data: arrayBuffer.slice(0) }).promise
      const totalPages = pdf.numPages

      setSmoothProgress(10, `共 ${totalPages} 页，开始逐页识别...`)

      const pages: PdfPage[] = []
      let allText = ""

      for (let i = 1; i <= totalPages; i++) {
        setSmoothProgress(
          10 + Math.round(((i - 1) / totalPages) * 70),
          `识别第 ${i}/${totalPages} 页...`
        )

        const canvas = await renderPdfPage(pdf, i)
        const { text, words } = await ocrPage(canvas)
        allText += `--- 第 ${i} 页 ---\n${text}\n\n`
        pages.push({ index: i, canvas, text, ocrWords: words })
      }

      setResultText(allText.trimEnd())

      setSmoothProgress(85, "生成可搜索 PDF...")

      // 检查是否有页面包含 OCR 结果
      const pagesWithText = pages.filter(p => p.ocrWords.length > 0)
      if (pagesWithText.length === 0) {
        toast({ title: "警告", description: "未能识别到任何文字", variant: "default" })
      }

      const builder = await PDFLib.PDFDocument.create()

      for (const page of pages) {
        const canvas = page.canvas
        const width = canvas.width
        const height = canvas.height

        // 添加图片作为背景
        const imgData = canvas.toDataURL('image/png')
        let img
        try {
          img = await builder.embedPng(imgData)
        } catch {
          const jpegData = canvas.toDataURL('image/jpeg', 0.9)
          img = await builder.embedJpg(jpegData)
        }

        const pdfPage = builder.addPage([width, height])
        pdfPage.drawImage(img, { x: 0, y: 0, width, height })

        // 添加关键词高亮层
        // 在原图上用半透明黄色背景标记识别出的文字位置
        if (page.ocrWords.length > 0) {
          for (const word of page.ocrWords) {
            const y = height - word.y - word.h

            // 1. 先绘制半透明黄色背景（高亮效果）
            pdfPage.drawRectangle({
              x: word.x,
              y: y,
              width: word.w,
              height: word.h,
              color: PDFLib.rgb(1, 1, 0), // 黄色
              opacity: 0.3, // 半透明
            })

            // 2. 然后绘制文字（保持可见，方便搜索和查看）
            const fontSize = Math.max(word.h * 0.8, 6)
            pdfPage.drawText(word.text, {
              x: word.x,
              y: y,
              size: fontSize,
              color: PDFLib.rgb(0, 0, 0),
              opacity: 0.85, // 接近不透明，清晰可见
            })
          }
        }
      }

      const pdfBytes = await builder.save()
      const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" })
      // 清理之前的 URL
      if (resultPdfUrl) {
        URL.revokeObjectURL(resultPdfUrl)
      }
      const resultUrl = URL.createObjectURL(blob)
      setResultPdfUrl(resultUrl)

      setSmoothProgress(100, "处理完成！")
      toast({
        title: "识别完成",
        description: `共处理 ${totalPages} 页，可下载可搜索 PDF`,
      })
    } catch (error: any) {
      apiLogger.error("PDF OCR 失败:", error)
      toast({
        title: "处理失败",
        description: error?.message || "请稍后重试",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
      setTimeout(() => {
        setSmoothProgress(0, "")
      }, 500)
    }
  }

  const handleDownloadPdf = () => {
    if (!resultPdfUrl) return
    const a = document.createElement("a")
    a.href = resultPdfUrl
    a.download = `${pdfName || "ocr"}_searchable.pdf`
    a.click()
  }

  const handleDownloadText = () => {
    if (!resultText) return
    const blob = new Blob([resultText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${pdfName || "ocr"}_text.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleCopy = async () => {
    if (!resultText) return
    try {
      await navigator.clipboard.writeText(resultText)
      toast({ title: "已复制到剪贴板" })
    } catch {
      toast({ title: "复制失败", variant: "destructive" })
    }
  }

  const handleReset = () => {
    setPdfFile(null)
    setPdfName("")
    setPdfUrl(null)
    setResultText("")
    setResultPdfUrl(null)
    setSmoothProgress(0)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  // 预加载 Tesseract 语言模型
  useEffect(() => {
    getTesseract().then(Tesseract => {
      Tesseract.createWorker("chi_sim", 1, {
        logger: () => {},
      }).catch(() => {})
    })
  }, [])

  return (
    <div className="space-y-6">
      {/* 功能卡片 */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-r from-violet-500/5 to-purple-500/5 backdrop-blur-xl p-4 flex items-start gap-3 group">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-400/20 to-purple-500/20 flex items-center justify-center flex-shrink-0 transition-colors group-hover:from-violet-400/30 group-hover:to-purple-500/30">
          <Scan className="h-5 w-5 text-violet-600 dark:text-violet-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground mb-0.5">PDF OCR 识别</h4>
          <p className="text-xs text-muted-foreground">
            上传 PDF 文件，逐页 OCR 识别文字，生成可搜索的 PDF 文件，支持中英文识别。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 上传区域 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <FileText className="h-4 w-4 text-zinc-400" /> 上传 PDF
          </h3>

          {!pdfFile ? (
            <div
              className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-violet-400 dark:hover:border-violet-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center h-64 group"
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <Upload className="h-10 w-10 text-zinc-300 dark:text-zinc-600 group-hover:text-violet-400 transition-colors" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-medium">点击或拖拽上传 PDF</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">支持多页 PDF 批量识别</p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-900 p-4 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <FileText className="h-6 w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">{pdfFile.name}</p>
                  <p className="text-xs text-zinc-400">{(pdfFile.size / 1024).toFixed(1)} KB</p>
                </div>
              </div>

              {pdfUrl && (
                <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-50 dark:bg-zinc-900" style={{ height: "350px" }}>
                  <iframe
                    src={pdfUrl}
                    className="w-full h-full"
                    title="PDF 预览"
                  />
                </div>
              )}
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex gap-2">
            {pdfFile && (
              <>
                <Button
                  onClick={handleProcess}
                  disabled={isProcessing}
                  className="flex-1 bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                >
                  {isProcessing ? (
                    <><Loader2 className="h-4 w-4 animate-spin mr-2" /> 处理中</>
                  ) : (
                    "开始识别"
                  )}
                </Button>
                <Button variant="outline" onClick={handleReset} disabled={isProcessing}>
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* 进度条 */}
          {isProcessing && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span>{progressLabel}</span>
                <span>{progressPercent}%</span>
              </div>
              <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-[width] duration-500 ease-out"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* 结果区域 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <Scan className="h-4 w-4 text-zinc-400" /> 识别结果
            </h3>
            {resultText && (
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="sm" onClick={handleDownloadText} className="h-8 gap-1 text-xs">
                  <Download className="h-3 w-3" /> 文本
                </Button>
                <Button variant="ghost" size="sm" onClick={handleCopy} className="h-8 gap-1 text-xs">
                  复制
                </Button>
              </div>
            )}
          </div>

          {resultText ? (
            <div className="space-y-3">
              <Textarea
                value={resultText}
                onChange={(e) => setResultText(e.target.value)}
                className="min-h-[250px] text-sm bg-white/50 dark:bg-white/[0.04] border-black/[0.06] dark:border-white/[0.08]"
                readOnly={isProcessing}
              />
              {resultPdfUrl && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Info className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-xs text-zinc-400">已生成可搜索 PDF，点击下方下载</span>
                  </div>
                  <Button
                    onClick={handleDownloadPdf}
                    className="w-full bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 text-white"
                  >
                    <Download className="h-4 w-4 mr-2" /> 下载可搜索 PDF
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden h-80 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-sm text-zinc-400">识别结果将显示在这里</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
