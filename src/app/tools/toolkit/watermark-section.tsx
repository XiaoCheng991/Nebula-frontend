"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import Image from "next/image"
import {
  Upload,
  Loader2,
  RotateCcw,
  Download,
  Brush,
  Undo,
  Eraser,
  FileText,
  Info,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"

// onnxruntime-web 全局类型
interface OrtSession {
  run: (feeds: Record<string, OrtTensor>) => Promise<Record<string, OrtTensor>>
}

interface OrtTensor {
  data: Float32Array
}

declare global {
  interface Window {
    ort: {
      InferenceSession: {
        create: (path: string, options?: Record<string, unknown>) => Promise<OrtSession>
      }
      Tensor: new (type: string, data: Float32Array, dims: number[]) => OrtTensor
    }
  }
}

// 模型固定输入尺寸
const MODEL_SIZE = 512

/** 预加载 ORT 脚本并配置 WASM 路径 */
function loadOrtScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.ort) { resolve(); return }
    const script = document.createElement("script")
    script.src = "/ort.wasm.min.js"
    script.onload = () => {
      try {
        const ort = window.ort as any
        ort.env.wasm.wasmPaths = {
          wasm: "/ort-wasm-simd-threaded.wasm",
          simd: true,
        }
        ort.env.wasm.proxy = true
        ort.env.wasm.numThreads = 4
        resolve()
      } catch (e) {
        reject(e)
      }
    }
    script.onerror = () => reject(new Error("无法加载 ORT 脚本"))
    document.head.appendChild(script)
  })
}

export function WatermarkSection() {
  const [image, setImage] = useState<string | null>(null)
  const [originalImage, setOriginalImage] = useState<HTMLImageElement | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [progressLabel, setProgressLabel] = useState("")
  const [progressPercent, setProgressPercent] = useState(0)
  const [brushSize, setBrushSize] = useState(20)
  const [eraseMode, setEraseMode] = useState<"paint" | "erase">("paint")
  const [resultImage, setResultImage] = useState<string | null>(null)

  // 光标状态
  const [showCursor, setShowCursor] = useState(false)
  const [cursorX, setCursorX] = useState(0)
  const [cursorY, setCursorY] = useState(0)
  const [cursorSize, setCursorSize] = useState(0)

  const canvasRef = useRef<HTMLCanvasElement>(null)
  const maskCanvasRef = useRef<HTMLCanvasElement>(null)
  const displayCanvasRef = useRef<HTMLCanvasElement>(null)
  const isPainting = useRef(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cursorPosRef = useRef<{ x: number; y: number } | null>(null)
  const hasMaskedRef = useRef(false)

  // 获取当前显示缩放比例
  const getDisplayScale = (): number => {
    const displayCanvas = displayCanvasRef.current
    if (!displayCanvas) return 1
    return displayCanvas.getBoundingClientRect().width / displayCanvas.width
  }

  // 绘制光标光标到 displayCanvas 上
  const drawCursorOnCanvas = (clientX: number, clientY: number) => {
    const canvas = displayCanvasRef.current
    if (!canvas || !originalImage) return
    const ctx = canvas.getContext("2d")!
    const rect = canvas.getBoundingClientRect()
    const scale = canvas.width / rect.width
    const x = (clientX - rect.left) * scale
    const y = (clientY - rect.top) * scale

    // 先重绘基础画面
    redrawDisplay()

    // 画圆形光标
    const color = eraseMode === "paint" ? "#ef4444" : "#22c55e"
    ctx.save()
    ctx.strokeStyle = color
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(x, y, brushSize, 0, Math.PI * 2)
    ctx.stroke()
    ctx.restore()
  }

  /** 重绘：原图 + mask 红色半透明遮罩 */
  const redrawDisplay = () => {
    const canvas = displayCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas || !originalImage) return
    const ctx = canvas.getContext("2d")!

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    ctx.drawImage(originalImage, 0, 0)

    // 红色遮罩叠加
    const tmp = document.createElement("canvas")
    tmp.width = canvas.width
    tmp.height = canvas.height
    const tCtx = tmp.getContext("2d")!

    tCtx.fillStyle = "#ef4444"
    tCtx.fillRect(0, 0, tmp.width, tmp.height)
    tCtx.globalCompositeOperation = "destination-in"
    tCtx.drawImage(maskCanvas, 0, 0)
    tCtx.globalCompositeOperation = "source-over"

    ctx.globalAlpha = 0.5
    ctx.drawImage(tmp, 0, 0)
    ctx.globalAlpha = 1.0
  }

  // 页面加载后预加载 ORT 脚本
  useEffect(() => {
    loadOrtScript().catch(() => {})
  }, [])

  // 加载图片并初始化 canvas
  const handleImageSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setImage(url)
      setResultImage(null)

      const img = new window.Image()
      img.onload = () => {
        setOriginalImage(img)

        const canvas = canvasRef.current
        const maskCanvas = maskCanvasRef.current
        const displayCanvas = displayCanvasRef.current
        if (!canvas || !maskCanvas || !displayCanvas) return

        // 读取父容器的实际可用宽度
        const parentEl = displayCanvas.parentElement
        const containerWidth = parentEl ? parentEl.clientWidth : 500
        const containerMaxHeight = 600

        const scaleX = containerWidth / img.width
        const scaleY = containerMaxHeight / img.height
        const scale = Math.min(scaleX, scaleY, 1)
        const displayW = Math.round(img.width * scale)
        const displayH = Math.round(img.height * scale)

        // canvas 内部尺寸为原图真实像素（保证 mask 精度）
        ;[canvas, maskCanvas, displayCanvas].forEach((c) => {
          c.width = img.width
          c.height = img.height
        })

        // 通过 CSS 控制显示尺寸，保持原图比例
        displayCanvas.style.width = `${displayW}px`
        displayCanvas.style.height = `${displayH}px`

        const ctx = displayCanvas.getContext("2d")!
        ctx.drawImage(img, 0, 0)

        const maskCtx = maskCanvas.getContext("2d")!
        maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
      }
      img.src = url
    }
  }, [])

  // 画笔绘制
  const handlePointerDown = (e: React.PointerEvent) => {
    isPainting.current = true
    applyBrush(e)
  }
const handlePointerMove = (e: React.PointerEvent) => {
  const canvas = displayCanvasRef.current
  if (!canvas) return
  const rect = canvas.getBoundingClientRect()

  // 计算显示尺寸到内部像素的缩放比例
  const scaleX = canvas.width / rect.width
  const brushSizeInternal = brushSize * scaleX

  // 光标大小：内部像素 / 显示比例 = 显示层的大小
  const dispBrush = brushSize / scaleX

  // 光标位置（相对于 canvas 显示区域）
  const cursorX = e.clientX - rect.left
  const cursorY = e.clientY - rect.top
  setCursorX(cursorX)
  setCursorY(cursorY)
  setCursorSize(dispBrush)
  setShowCursor(true)

  // 继续处理绘画
  if (isPainting.current) {
    applyBrush(e)
  }
}
  const lastPaintPos = useRef<{ x: number; y: number } | null>(null)

  const handlePointerUp = () => { isPainting.current = false; lastPaintPos.current = null }
  const handlePointerLeave = () => { isPainting.current = false; lastPaintPos.current = null; setShowCursor(false) }

  const applyBrush = (e: React.PointerEvent) => {
    const canvas = displayCanvasRef.current
    const maskCanvas = maskCanvasRef.current
    if (!canvas || !maskCanvas) return

    const rect = canvas.getBoundingClientRect()
    const scaleX = canvas.width / rect.width
  const brushSizeInternal = brushSize * scaleX
    const scaleY = canvas.height / rect.height
    const x = (e.clientX - rect.left) * scaleX
    const y = (e.clientY - rect.top) * scaleY

    const maskCtx = maskCanvas.getContext("2d")!
    const prev = lastPaintPos.current

    if (prev) {
      const dx = x - prev.x
      const dy = y - prev.y
      const dist = Math.sqrt(dx * dx + dy * dy)
      const step = Math.max(1, brushSizeInternal * 0.25)
      const steps = Math.max(1, Math.ceil(dist / step))

      for (let i = 0; i <= steps; i++) {
        const t = i / steps
        const px = prev.x + dx * t
        const py = prev.y + dy * t
        maskCtx.beginPath()
        maskCtx.arc(px, py, brushSizeInternal, 0, Math.PI * 2)
        if (eraseMode === "paint") {
          maskCtx.globalCompositeOperation = "source-over"
          maskCtx.fillStyle = "rgba(255,255,255,1)"
          maskCtx.fill()
        } else {
          maskCtx.globalCompositeOperation = "destination-out"
          maskCtx.fill()
        }
      }
    } else {
      maskCtx.beginPath()
      maskCtx.arc(x, y, brushSizeInternal, 0, Math.PI * 2)
      if (eraseMode === "paint") {
        maskCtx.globalCompositeOperation = "source-over"
        maskCtx.fillStyle = "rgba(255,255,255,1)"
        maskCtx.fill()
      } else {
        maskCtx.globalCompositeOperation = "destination-out"
        maskCtx.fill()
      }
    }

    lastPaintPos.current = { x, y }
    if (eraseMode === "paint") hasMaskedRef.current = true

    redrawDisplay()
  }

  // 清除 mask
  const clearMask = () => {
    const maskCanvas = maskCanvasRef.current
    if (!maskCanvas) return
    const maskCtx = maskCanvas.getContext("2d")!
    maskCtx.clearRect(0, 0, maskCanvas.width, maskCanvas.height)
    hasMaskedRef.current = false
    redrawDisplay()
  }

  // 等待 ORT 加载
  const waitForOrt = (): Promise<typeof window.ort> => {
    return new Promise((resolve, reject) => {
      if (window.ort) { resolve(window.ort); return }
      const timeout = setTimeout(() => reject(new Error("ORT 加载超时，请刷新页面重试")), 30000)
      const check = () => { window.ort ? (clearTimeout(timeout), resolve(window.ort)) : setTimeout(check, 100) }
      check()
    })
  }

  // 智能去水印：标记图像边缘区域（水印常见位置），保留中心内容供模型参考
  const handleAutoWatermark = async () => {
    if (!originalImage || !canvasRef.current || !maskCanvasRef.current) {
      toast({ title: "请先上传图片", variant: "destructive" })
      return
    }
    const maskCanvas = maskCanvasRef.current
    const maskCtx = maskCanvas.getContext("2d")!
    const w = maskCanvas.width
    const h = maskCanvas.height

    maskCtx.clearRect(0, 0, w, h)
    maskCtx.fillStyle = "rgba(255,255,255,1)"

    const edgeRatio = 0.12
    const edgeT = Math.round(h * edgeRatio)
    const edgeB = Math.round(h * (1 - edgeRatio))
    const edgeL = Math.round(w * edgeRatio)
    const edgeR = Math.round(w * (1 - edgeRatio))

    maskCtx.fillRect(0, 0, w, edgeT)
    maskCtx.fillRect(0, edgeB, w, h - edgeB)
    maskCtx.fillRect(0, edgeT, edgeL, edgeB - edgeT)
    maskCtx.fillRect(edgeR, edgeT, w - edgeR, edgeB - edgeT)

    hasMaskedRef.current = true
    await handleRemoveWatermark()
  }

  // 运行 LaMa 去水印
  const handleRemoveWatermark = async () => {
    if (!hasMaskedRef.current || !originalImage || !canvasRef.current || !maskCanvasRef.current) {
      toast({ title: "请先上传图片并涂抹水印区域", variant: "destructive" })
      return
    }

    setIsProcessing(true)
    setSmoothProgress(0, "加载 AI 模型...")

    try {
      const ort = await waitForOrt()
      setSmoothProgress(15, "加载 LaMa 模型...")

      const session = await ort.InferenceSession.create("/models/4x-UltraSharpV2_fp32_op17.onnx", {
        executionProviders: ["wasm"],
      })

      setSmoothProgress(25, "预处理图片...")

      const S = MODEL_SIZE * MODEL_SIZE
      const srcCanvas = document.createElement("canvas")
      srcCanvas.width = MODEL_SIZE
      srcCanvas.height = MODEL_SIZE
      const srcCtx = srcCanvas.getContext("2d")!
      srcCtx.drawImage(originalImage, 0, 0, MODEL_SIZE, MODEL_SIZE)
      const srcImgData = srcCtx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE)

      const maskCanvas2 = document.createElement("canvas")
      maskCanvas2.width = MODEL_SIZE
      maskCanvas2.height = MODEL_SIZE
      const mCtx = maskCanvas2.getContext("2d")!
      mCtx.drawImage(maskCanvasRef.current, 0, 0, MODEL_SIZE, MODEL_SIZE)
      const maskImgData = mCtx.getImageData(0, 0, MODEL_SIZE, MODEL_SIZE)

      setSmoothProgress(40, "构建数据...")

      const imageTensor = new Float32Array(3 * S)
      const maskTensor = new Float32Array(S)
      for (let i = 0; i < S; i++) {
        imageTensor[i] = srcImgData.data[i * 4] / 255.0
        imageTensor[S + i] = srcImgData.data[i * 4 + 1] / 255.0
        imageTensor[2 * S + i] = srcImgData.data[i * 4 + 2] / 255.0
        maskTensor[i] = maskImgData.data[i * 4 + 3] > 0 ? 1.0 : 0.0
      }

      setSmoothProgress(55, "AI 推理中...")

      const outputData = await session.run({
        l_image_: new ort.Tensor("float32", imageTensor, [1, 3, MODEL_SIZE, MODEL_SIZE]),
        l_mask_: new ort.Tensor("float32", maskTensor, [1, 1, MODEL_SIZE, MODEL_SIZE]),
      })

      setSmoothProgress(80, "生成结果...")

      // 兼容不同输出 tensor 名称
      let output: Float32Array
      if ("output" in outputData && (outputData.output as any).data) {
        output = outputData.output.data as Float32Array
      } else {
        const outputKeys = Object.keys(outputData)
        output = outputData[outputKeys[0]].data as Float32Array
      }

      // 步骤1：模型输出转 canvas
      const inpaintCanvas = document.createElement("canvas")
      inpaintCanvas.width = MODEL_SIZE
      inpaintCanvas.height = MODEL_SIZE
      const inpCtx = inpaintCanvas.getContext("2d")!
      const inpData = inpCtx.createImageData(MODEL_SIZE, MODEL_SIZE)
      for (let i = 0; i < S; i++) {
        inpData.data[i * 4] = Math.min(Math.max(Math.round(output[i]), 0), 255)
        inpData.data[i * 4 + 1] = Math.min(Math.max(Math.round(output[S + i]), 0), 255)
        inpData.data[i * 4 + 2] = Math.min(Math.max(Math.round(output[2 * S + i]), 0), 255)
        inpData.data[i * 4 + 3] = 255
      }
      inpCtx.putImageData(inpData, 0, 0)

      setSmoothProgress(92, "合成结果...")

      // 步骤2：缩放到原图尺寸（多步缩放保证质量）
      const scaledInpaint = document.createElement("canvas")
      scaledInpaint.width = originalImage.width
      scaledInpaint.height = originalImage.height
      const scCtx = scaledInpaint.getContext("2d")!
      scCtx.drawImage(inpaintCanvas, 0, 0, originalImage.width, originalImage.height)

      // 步骤3：mask 缩放
      const scaledMask = document.createElement("canvas")
      scaledMask.width = originalImage.width
      scaledMask.height = originalImage.height
      const smCtx = scaledMask.getContext("2d")!
      smCtx.drawImage(maskCanvasRef.current, 0, 0, originalImage.width, originalImage.height)

      // 步骤4：用 mask 裁剪 inpaint 结果
      scCtx.save()
      scCtx.globalCompositeOperation = "destination-in"
      scCtx.drawImage(scaledMask, 0, 0)
      scCtx.restore()

      // 步骤5：原图作底，叠加 inpaint 结果
      const fullCanvas = document.createElement("canvas")
      fullCanvas.width = originalImage.width
      fullCanvas.height = originalImage.height
      const fullCtx = fullCanvas.getContext("2d")!
      fullCtx.drawImage(originalImage, 0, 0)
      fullCtx.drawImage(scaledInpaint, 0, 0)

      setResultImage(fullCanvas.toDataURL("image/png"))
      setSmoothProgress(100, "处理完成！")
      toast({ title: "水印去除完成", description: "可以下载处理后的图片" })
    } catch (error: any) {
      console.error("LaMa 推理失败:", error)
      toast({
        title: "去除失败",
        description: error?.message || "模型加载或推理出错",
        variant: "destructive",
      })
    } finally {
      setTimeout(() => {
        setIsProcessing(false)
        setProgressLabel("")
        setProgressPercent(0)
      }, 500)
    }
  }

  // 进度条平滑动画
  const progressRef = useRef({ current: 0, raf: 0 as number })

  const setSmoothProgress = (target: number, label?: string, duration = 500) => {
    const id = ++progressRef.current.raf
    const from = progressRef.current.current
    const diff = target - from
    const steps = Math.max(1, Math.ceil(duration / 30))
    let step = 0
    const animate = () => {
      step++
      if (progressRef.current.raf !== id) return
      if (step >= steps) {
        setProgressPercent(target)
        progressRef.current.current = target
        return
      }
      const t = step / steps
      const ease = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2
      const val = Math.round(from + diff * ease)
      setProgressPercent(val)
      progressRef.current.current = val
      requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
    if (label) setProgressLabel(label)
  }

  // 下载结果
  const handleDownload = () => {
    if (!resultImage) return
    const a = document.createElement("a")
    a.href = resultImage
    a.download = `no-watermark-${Date.now()}.png`
    a.click()
  }

  const handleReset = () => {
    setImage(null)
    setOriginalImage(null)
    setResultImage(null)
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  return (
    <div className="space-y-6">
      {/* 功能卡片 */}
      <div className="rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-gradient-to-r from-amber-500/5 to-orange-500/5 backdrop-blur-xl p-4 flex items-start gap-3 group">
        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400/20 to-orange-500/20 flex items-center justify-center flex-shrink-0 transition-colors group-hover:from-amber-400/30 group-hover:to-orange-500/30">
          <Eraser className="h-5 w-5 text-orange-600 dark:text-orange-400" />
        </div>
        <div>
          <h4 className="text-sm font-medium text-foreground mb-0.5">智能去水印</h4>
          <p className="text-xs text-muted-foreground">
            上传图片后用红色画笔涂抹水印区域，AI 会自动填充被遮挡内容。
            模型输入固定为{" "}
            <code className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-xs font-mono">
              512×512
            </code>{" "}
            分辨率，大图会自动缩放后还原。
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 原图 + 涂抹 */}
        <div className="space-y-4 min-w-0">
          <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
            <Brush className="h-4 w-4 text-zinc-400" /> 涂抹水印区域
          </h3>

          {image && image !== resultImage ? (
            <div className="space-y-3">
              <div className="relative border border-zinc-200 dark:border-zinc-700 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center p-0" style={{ minHeight: "120px" }}>
                {/* 画笔光标 - 以容器左上角为基准的定位 */}
                {showCursor && (
                  <div
                    className="absolute pointer-events-none rounded-full border-2 z-20"
                    style={{
                      left: cursorX - cursorSize / 2 - 1,
                      top: cursorY - cursorSize / 2 - 1,
                      width: cursorSize + 4,
                      height: cursorSize + 4,
                      borderColor: eraseMode === "paint" ? "#ef4444" : "#22c55e",
                    }}
                  />
                )}
                <canvas
                  ref={displayCanvasRef}
                  className="block max-w-full h-auto"
                  onPointerDown={handlePointerDown}
                  onPointerMove={handlePointerMove}
                  onPointerUp={handlePointerUp}
                  onPointerLeave={handlePointerLeave}
                  style={{ touchAction: "none", cursor: "none" }}
                />
                <canvas ref={canvasRef} className="hidden" />
                <canvas ref={maskCanvasRef} className="hidden" />
              </div>

              {/* 画笔控制 */}
              <div className="flex items-center gap-3">
                <div className="flex-1 flex items-center gap-2">
                  <Info className="h-3.5 w-3.5 text-zinc-400" />
                  <span className="text-xs text-zinc-500">画笔</span>
                  <input type="range" min="5" max="60" value={brushSize} onChange={(e) => setBrushSize(Number(e.target.value))} className="flex-1" />
                  <span className="text-xs text-zinc-400 tabular-nums w-6">{brushSize}px</span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant={eraseMode === "paint" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 px-2.5 gap-1 text-xs ${eraseMode === "paint" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" : ""}`}
                    onClick={() => setEraseMode("paint")}
                  >
                    <Brush className="h-3 w-3" /> 涂抹
                  </Button>
                  <Button
                    variant={eraseMode === "erase" ? "default" : "outline"}
                    size="sm"
                    className={`h-8 px-2.5 gap-1 text-xs ${eraseMode === "erase" ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white" : ""}`}
                    onClick={() => setEraseMode("erase")}
                  >
                    <Eraser className="h-3 w-3" /> 擦除
                  </Button>
                  <Button variant="ghost" size="sm" className="h-8 px-2.5 gap-1 text-xs" onClick={clearMask}>
                    <Undo className="h-3 w-3" /> 清除
                  </Button>
                </div>
              </div>
            </div>
          ) : !image ? (
            <div
              className="relative border-2 border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl hover:border-orange-400 dark:hover:border-orange-500/50 transition-colors cursor-pointer flex flex-col items-center justify-center h-64 group"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload className="h-10 w-10 text-zinc-300 dark:text-zinc-600 group-hover:text-orange-400 transition-colors" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-3 font-medium">点击或拖拽上传图片</p>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">支持 JPG / PNG / WebP</p>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageSelect} className="hidden" />
            </div>
          ) : null}

          {/* 操作按钮 */}
          {image && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <Button onClick={handleRemoveWatermark} disabled={isProcessing} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white">
                  {isProcessing ? <><Loader2 className="h-4 w-4 animate-spin mr-2" /> {progressLabel}</> : "涂抹去水印"}
                </Button>
                <Button onClick={handleAutoWatermark} disabled={isProcessing} variant="outline">
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : "智能去水印"}
                </Button>
                <Button variant="ghost" size="sm" onClick={handleReset} disabled={isProcessing} className="col-span-2">
                  <RotateCcw className="h-4 w-4 mr-2" /> 重置
                </Button>
              </div>
              {isProcessing && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs text-zinc-400">
                    <span>{progressLabel}</span>
                    <span>{progressPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-[width] duration-700 ease-out"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 处理结果 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
              <FileText className="h-4 w-4 text-zinc-400" /> 处理结果
            </h3>
            {resultImage && (
              <Button variant="ghost" size="sm" onClick={handleDownload} className="h-8 gap-1 text-xs">
                <Download className="h-3 w-3" /> 下载
              </Button>
            )}
          </div>

          {resultImage ? (
            <div className="relative rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden bg-zinc-100 dark:bg-zinc-900">
              <Image src={resultImage} alt="去除水印后的图片" width={800} height={600} className="w-full h-auto object-contain" />
            </div>
          ) : (
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden h-64 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900/50">
              <p className="text-sm text-zinc-400">处理后结果将显示在这里</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
