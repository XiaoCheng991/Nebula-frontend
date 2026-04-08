"use client"

import dynamic from "next/dynamic"

const PdfOcrSection = dynamic(
  () => import("./pdf-ocr-content").then((m) => ({ default: m.PdfOcrContent })),
  { ssr: false }
)

export { PdfOcrSection }
