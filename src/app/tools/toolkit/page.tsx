"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import dynamic from "next/dynamic"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProtectedRoute } from "@/components/auth/AuthGuard"
import { ArrowLeft, ImagePlus, Scan, Eraser } from "lucide-react"
import Link from "next/link"

// Dynamic imports for heavy tool components
const OcrSection = dynamic(() => import("./ocr-section").then((m) => ({ default: m.OcrSection })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">加载中...</div>,
})

const WatermarkSection = dynamic(() => import("./watermark-section").then((m) => ({ default: m.WatermarkSection })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">加载中...</div>,
})

const PdfOcrSection = dynamic(() => import("./pdf-ocr-section").then((m) => ({ default: m.PdfOcrSection })), {
  ssr: false,
  loading: () => <div className="h-64 flex items-center justify-center text-muted-foreground">加载中...</div>,
})

function ToolkitTabs() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState("ocr")

  useEffect(() => {
    if (!searchParams) return
    const tab = searchParams.get("tab")
    if (tab === "watermark") setActiveTab("watermark")
    else if (tab === "ocr") setActiveTab("ocr")
  }, [searchParams])

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-3 h-12 p-1 relative bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl">
        {/* 分割线 */}
        <div className="absolute left-1/3 top-1/2 -translate-y-1/2 w-px h-5 bg-zinc-200 dark:bg-zinc-700 z-10 pointer-events-none" />
        <div className="absolute left-2/3 top-1/2 -translate-y-1/2 w-px h-5 bg-zinc-200 dark:bg-zinc-700 z-10 pointer-events-none" />
        <TabsTrigger value="ocr" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
          <Scan className="h-4 w-4" />
          OCR 识别
        </TabsTrigger>
        <TabsTrigger value="watermark" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-amber-500 data-[state=active]:text-white">
          <Eraser className="h-4 w-4" />
          图片去水印
        </TabsTrigger>
        <TabsTrigger value="pdf-ocr" className="gap-2 data-[state=active]:bg-gradient-to-r data-[state=active]:from-violet-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
          PDF 识别
        </TabsTrigger>
      </TabsList>
      <TabsContent value="ocr" className="mt-8">
        <OcrSection />
      </TabsContent>
      <TabsContent value="watermark" className="mt-8">
        <WatermarkSection />
      </TabsContent>
      <TabsContent value="pdf-ocr" className="mt-8">
        <PdfOcrSection />
      </TabsContent>
    </Tabs>
  )
}

export default function ToolkitPage() {
  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-5xl px-6 pt-[80px] pb-16 space-y-8">
        {/* 返回按钮 + 标题 */}
        <div className="flex items-center gap-4">
          <Link
            href="/tools"
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] hover:bg-orange-500/10 hover:border-orange-500/30 transition-all duration-200"
          >
            <ArrowLeft className="h-4 w-4 text-zinc-500 hover:text-foreground transition-colors" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center transition-all duration-300 hover:from-orange-400/30 hover:to-amber-500/30">
              <ImagePlus className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h1 className="text-[22px] font-bold tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent leading-tight">
                图片工具箱
              </h1>
              <div className="h-[2px] w-12 mt-1.5 rounded-full bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 opacity-20" />
            </div>
          </div>
        </div>

        <Suspense fallback={<p className="text-center text-muted-foreground py-8">加载中...</p>}>
          <ToolkitTabs />
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}
