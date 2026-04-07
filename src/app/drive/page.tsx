"use client"

import React, { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import {
  Folder,
  File,
  FileText,
  Music,
  Download,
  Upload,
  Search,
  Grid3X3,
  List,
  FolderPlus,
  FolderOpen,
  HardDrive,
  Loader2,
  X,
  Plus,
  FileCheck,
} from "lucide-react"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { ProtectedRoute } from "@/components/auth/AuthGuard"
import { useUser } from "@/lib/user-context"
import { toast } from "@/components/ui/use-toast"
import { uploadDriveFile } from "@/lib/api/modules/file"
import { supabase } from "@/lib/supabase/client"
import {
  loadAllDriveData,
  getPublicUrl,
  deleteFileMetadata,
} from "@/lib/api/modules/drive"
import type { Tables } from "@/lib/supabase/types"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

const STORAGE_BUCKETS = [
  { key: "drive-docs", label: "文档", icon: FileText, color: "text-blue-500", bgColor: "bg-blue-500/15" },
  { key: "drive-photos", label: "照片", icon: FolderOpen, color: "text-amber-500", bgColor: "bg-amber-500/15" },
  { key: "drive-music", label: "音乐", icon: Music, color: "text-violet-500", bgColor: "bg-violet-500/15" },
  { key: "drive-misc", label: "其他", icon: Folder, color: "text-zinc-500", bgColor: "bg-zinc-500/15" },
]

function getFileIconInfo(file: { file_type?: string }) {
  const type = file.file_type || ""
  switch (type) {
    case "pdf": return { Component: FileText, color: "text-blue-500", bgColor: "bg-blue-500/15" }
    case "docx": return { Component: FileText, color: "text-emerald-500", bgColor: "bg-emerald-500/15" }
    case "xlsx": return { Component: FileText, color: "text-green-500", bgColor: "bg-green-500/15" }
    case "pptx": return { Component: FileText, color: "text-orange-500", bgColor: "bg-orange-500/15" }
    case "txt": case "csv": return { Component: FileText, color: "text-zinc-500", bgColor: "bg-zinc-500/15" }
    case "zip": return { Component: File, color: "text-amber-500", bgColor: "bg-amber-500/15" }
    case "mp3": return { Component: Music, color: "text-violet-500", bgColor: "bg-violet-500/15" }
    case "jpg": case "png": case "gif": case "svg":
      return { Component: File, color: "text-green-600", bgColor: "bg-green-600/15" }
    case "mp4": return { Component: File, color: "text-rose-500", bgColor: "bg-rose-500/15" }
    default: return { Component: File, color: "text-muted-foreground", bgColor: "bg-muted/20" }
  }
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMin = Math.floor(diffMs / 60000)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  if (diffMin < 60) return `${diffMin} 分钟前`
  if (diffHour < 24) return `${diffHour} 小时前`
  if (diffDay < 7) return `${diffDay} 天前`
  return date.toLocaleDateString("zh-CN")
}

/** 数字滚动动画 hook */
function useCountUp(target: number, duration = 700, start = false) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    let frame: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setCurrent(Math.floor(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start])
  return current
}

const ANIMATION_STYLES = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(8px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes shimmerLine {
    0% { background-position: -200% 0; }
    100% { background-position: 200% 0; }
  }
  .anim-fade-slide-up {
    opacity: 0;
    animation: fadeSlideUp 0.45s ease-out forwards;
  }
  .anim-fade-in {
    opacity: 0;
    animation: fadeIn 0.5s ease-out forwards;
  }
  .anim-shimmer {
    background: linear-gradient(
      90deg,
      transparent 0%,
      rgba(245, 166, 35, 0.15) 50%,
      transparent 100%
    );
    background-size: 200% 100%;
    animation: shimmerLine 2.5s infinite;
  }
`

function AnimationStyles() {
  return <style>{ANIMATION_STYLES}</style>
}

export default function DrivePage() {
  const { user } = useUser()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeBucket, setActiveBucket] = useState("drive-docs")
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [files, setFiles] = useState<Tables<"file_metadata">[]>([])
  const [recentFiles, setRecentFiles] = useState<Tables<"file_metadata">[]>([])
  const [storageStats, setStorageStats] = useState<{ bucketName: string; fileCount: number; totalSize: number }[]>([])
  const [folders, setFolders] = useState<Set<string>>(new Set())
  const [activeFolder, setActiveFolder] = useState("")
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadFolder, setUploadFolder] = useState("")
  const [newFolderName, setNewFolderName] = useState("")
  const [showNewFolderDialog, setShowNewFolderDialog] = useState(false)
  const [uploadFiles, setUploadFiles] = useState<File[]>([])
  const [uploadProgress, setUploadProgress] = useState("")
  const loadingRef = useRef(false)

  async function loadAllData() {
    if (loadingRef.current) return
    loadingRef.current = true
    setLoading(true)
    try {
      const result = await loadAllDriveData(activeBucket, activeFolder || undefined)
      setFiles(result.files)
      setRecentFiles(result.recentFiles)
      setFolders(result.folders)
      setStorageStats(result.storageStats)
    } catch (err) {
      console.error("加载文件列表失败:", err)
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }

  useEffect(() => { loadAllData() }, [activeBucket, activeFolder])

  const handleOpenUploadDialog = () => {
    setUploadFiles([])
    setUploadFolder("")
    setUploadProgress("")
    setShowUploadDialog(true)
  }

  const currentBucket = STORAGE_BUCKETS.find(b => b.key === activeBucket)!
  const filteredFiles = searchQuery
    ? files.filter(f => f.file_name.toLowerCase().includes(searchQuery.toLowerCase()))
    : files

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files
    if (selected && selected.length > 0) {
      setUploadFiles(Array.from(selected))
    }
  }

  const handleUpload = async () => {
    if (uploadFiles.length === 0) {
      toast({ title: "请选择文件", description: "请先选择要上传的文件", variant: "destructive" })
      return
    }
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) {
        toast({ title: "上传失败", description: "用户身份未获取，请重新登录", variant: "destructive" })
        return
      }
      const { data: sysUser } = await supabase
        .from("sys_users")
        .select("id, nickname")
        .eq("email", session.user.email)
        .single()
      if (!sysUser?.id) {
        toast({ title: "上传失败", description: "用户记录未找到，请联系管理员", variant: "destructive" })
        return
      }
      const currentUserId = Number(sysUser.id)
      const currentUserName = sysUser.nickname || user?.nickname || "匿名用户"
      setUploading(true)
      let successCount = 0
      let failCount = 0
      for (let i = 0; i < uploadFiles.length; i++) {
        const file = uploadFiles[i]
        setUploadProgress(`正在上传 ${i + 1}/${uploadFiles.length}...`)
        const folder = uploadFolder || "默认"
        const result = await uploadDriveFile(file, activeBucket, folder, currentUserId, currentUserName)
        if (result.error) { console.error(`上传失败 ${file.name}:`, result.error); failCount++ }
        else { successCount++ }
      }
      setUploadProgress(successCount > 0 ? `${successCount} 个文件上传成功` : "全部失败")
      setUploading(false)
      if (successCount > 0) {
        toast({ title: "上传成功", description: `${successCount} 个文件已上传${failCount > 0 ? `，${failCount} 个失败` : ""}` })
        await loadAllData()
        setShowUploadDialog(false)
        setUploadFiles([])
        setUploadFolder("")
        setUploadProgress("")
      } else { toast({ title: "上传失败", description: "请稍后重试", variant: "destructive" }) }
    } catch (err) {
      setUploading(false)
      toast({ title: "上传出错", description: "请检查网络连接", variant: "destructive" })
    }
    if (fileInputRef.current) fileInputRef.current.value = ""
  }

  const handleDownload = (file: Tables<"file_metadata">) => {
    const url = getPublicUrl(file.bucket_name, file.file_path)
    const a = document.createElement("a"); a.href = url; a.download = file.file_name
    a.target = "_blank"; a.rel = "noopener noreferrer"
    document.body.appendChild(a); a.click(); a.remove()
  }

  const handleDelete = async (file: Tables<"file_metadata">) => {
    const ok = await deleteFileMetadata(file.id, file.bucket_name, file.file_path)
    if (ok) { toast({ title: "已删除", description: file.file_name }); await loadAllData() }
    else { toast({ title: "删除失败", description: "请稍后重试", variant: "destructive" }) }
  }

  const handleCreateFolder = () => {
    const name = newFolderName.trim()
    if (name && !folders.has(name)) {
      setFolders(prev => new Set([...prev, name]))
      setUploadFolder(name)
      setNewFolderName("")
      setShowNewFolderDialog(false)
      toast({ title: "文件夹已创建", description: name })
    } else if (folders.has(name)) {
      toast({ title: "文件夹已存在", description: name, variant: "destructive" })
    }
  }

  const handleBucketChange = (bucketKey: string) => { setActiveBucket(bucketKey); setActiveFolder("") }

  const renderFileCard = (file: Tables<"file_metadata">, i: number) => {
    const iconInfo = getFileIconInfo(file)
    return (
      <div
        key={file.id}
        className="relative overflow-hidden flex items-center gap-3 p-3 rounded-lg backdrop-blur-xl bg-white/40 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:shadow-sm hover:shadow-orange-500/5 transition-all duration-200 group"
        style={{ opacity: 0, animation: `fadeSlideUp 0.35s ease-out ${0.15 + i * 0.05}s forwards` }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
        <div className={`relative w-10 h-10 rounded-lg flex items-center justify-center ${iconInfo.bgColor} group-hover:scale-105 group-hover:shadow-md transition-all duration-200 flex-shrink-0`}>
          <iconInfo.Component className={`h-5 w-5 ${iconInfo.color} transition-transform duration-200 group-hover:-rotate-6`} />
        </div>
        <div className="relative flex-1 min-w-0">
          <h4 className="text-[13px] font-medium text-foreground group-hover:text-orange-600 dark:group-hover:text-amber-300 transition-colors truncate">{file.file_name}</h4>
          <p className="text-[11px] text-muted-foreground">{formatFileSize(file.file_size)} · {formatTimeAgo(file.created_at)}</p>
        </div>
        <div className="relative flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer" onClick={() => handleDownload(file)} title="下载">
            <Download className="h-3.5 w-3.5 transition-transform duration-200 group-hover/download:scale-110" />
          </Button>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-red-500 cursor-pointer" onClick={() => handleDelete(file)} title="删除">
            <X className="h-3.5 w-3.5 transition-transform duration-200 group-hover/delete:scale-110" />
          </Button>
        </div>
      </div>
    )
  }

  const renderFileRow = (file: Tables<"file_metadata">) => {
    const iconInfo = getFileIconInfo(file)
    return (
      <tr key={file.id} className="hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors last:border-b-0 group">
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${iconInfo.bgColor} group-hover/icon:scale-110 transition-transform duration-200`}>
              <iconInfo.Component className={`h-4 w-4 ${iconInfo.color} transition-transform duration-200 group-hover/icon:-rotate-6`} />
            </div>
            <span className="text-[13px] text-foreground font-medium">{file.file_name}</span>
          </div>
        </td>
        <td className="py-3.5 px-4 text-[13px] text-muted-foreground tabular-nums">{formatFileSize(file.file_size)}</td>
        <td className="py-3.5 px-4 text-[13px] text-muted-foreground">{file.owner_name}</td>
        <td className="py-3.5 px-4 text-[13px] text-muted-foreground">{formatTimeAgo(file.created_at)}</td>
        <td className="py-3.5 px-4">
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-orange-500/10 transition-colors cursor-pointer" onClick={() => handleDownload(file)}>
              <Download className="h-3.5 w-3.5" /> 下载
            </Button>
            <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer" onClick={() => handleDelete(file)}>
              <X className="h-3.5 w-3.5" />
            </Button>
          </div>
        </td>
      </tr>
    )
  }

  const renderRecentFile = (file: Tables<"file_metadata">, i: number) => {
    const iconInfo = getFileIconInfo(file)
    return (
      <div
        key={file.id}
        className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer group"
        style={{ opacity: 0, animation: `fadeSlideUp 0.35s ease-out ${0.3 + i * 0.06}s forwards` }}
        onClick={() => handleDownload(file)}
      >
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconInfo.bgColor} transition-all duration-200 group-hover:scale-105`}>
          <iconInfo.Component className={`h-5 w-5 ${iconInfo.color} transition-transform duration-200 group-hover:rotate-6`} />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-[13px] font-medium text-foreground truncate group-hover:text-orange-600 dark:group-hover:text-amber-300 transition-colors">{file.file_name}</h4>
          <p className="text-[11px] text-muted-foreground mt-0.5">{formatFileSize(file.file_size)} · {file.owner_name}</p>
        </div>
        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-all h-8 w-8 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer">
          <Download className="h-4 w-4" />
        </Button>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <AnimationStyles />
        <div className="relative min-h-screen">
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-250px] right-[-200px] w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute bottom-[-200px] left-[-250px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.06)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,200,80,0.04)_0%,transparent_70%)] blur-3xl" />
          </div>

          <div className={`relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8 ${!loading ? "anim-fade-in" : ""}`}>
            {/* Page Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center transition-all duration-300 hover:from-orange-400/30 hover:to-amber-500/30">
                  <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400 transition-transform duration-300 hover:rotate-12" />
                </div>
                <div>
                  <h1 className="text-[22px] font-bold tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent leading-tight">文件传输</h1>
                  <div className="h-[2px] w-12 mt-1.5 rounded-full anim-shimmer" />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="relative overflow-hidden gap-2 rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all duration-200 h-11 px-5 cursor-pointer group" onClick={handleOpenUploadDialog} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin text-amber-600 dark:text-amber-400" /> : <Upload className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:text-orange-500 transition-colors" />}
                  <span className="group-hover:text-orange-500 transition-colors">{uploading ? "上传中..." : "上传文件"}</span>
                </Button>
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-11 px-5 font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-all duration-200 hover:scale-[1.02] cursor-pointer" onClick={() => setShowNewFolderDialog(true)}>
                  <FolderPlus className="h-4 w-4" /> 新建文件夹
                </Button>
              </div>
            </div>

            {/* Bucket Tabs */}
            <div className="flex gap-2 anim-fade-slide-up" style={{ animationDelay: "0.05s" }}>
              {STORAGE_BUCKETS.map((bucket) => {
                const Icon = bucket.icon
                return (
                  <button
                    key={bucket.key}
                    onClick={() => handleBucketChange(bucket.key)}
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 relative overflow-hidden ${
                      activeBucket === bucket.key
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                        : "bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] text-zinc-600 dark:text-zinc-400 hover:bg-white/80 dark:hover:bg-white/[0.08]"
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${activeBucket === bucket.key ? "text-white transition-transform duration-300 -rotate-6" : bucket.color}`} />
                    {bucket.label}
                  </button>
                )
              })}
            </div>

            {/* Search & View Toggle */}
            <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30 overflow-hidden anim-fade-slide-up" style={{ animationDelay: "0.1s" }}>
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="搜索文件..." className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.04] backdrop-blur-sm text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/40 transition-all placeholder:text-muted-foreground" />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className={`rounded-lg h-10 w-10 backdrop-blur-xl border transition-all duration-200 cursor-pointer ${viewMode === "grid" ? "border-orange-500/40 text-orange-500 bg-orange-500/10" : "bg-white/50 dark:bg-white/[0.06] border-black/[0.06] dark:border-white/[0.10] text-muted-foreground hover:border-orange-500/40"}`} onClick={() => setViewMode("grid")}>
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className={`rounded-lg h-10 w-10 backdrop-blur-xl border transition-all duration-200 cursor-pointer ${viewMode === "list" ? "border-orange-500/40 text-orange-500 bg-orange-500/10" : "bg-white/50 dark:bg-white/[0.06] border-black/[0.06] dark:border-white/[0.10] text-muted-foreground hover:border-orange-500/40"}`} onClick={() => setViewMode("list")}>
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* 底部指示线 */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent group-hover:via-orange-400/60 transition-[background] duration-500" />
            </div>

            {/* Folders */}
            {folders.size > 0 && (
              <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30 overflow-hidden anim-fade-slide-up" style={{ animationDelay: "0.15s" }}>
                <div className="flex items-center gap-2 mb-0">
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center transition-colors duration-300 hover:from-orange-400/30 hover:to-amber-500/30">
                      <Folder className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-foreground whitespace-nowrap">{currentBucket.label}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 flex-wrap min-h-7">
                    <button onClick={() => setActiveFolder("")} className={`inline-flex items-center justify-center min-h-[26px] px-3 rounded-full text-xs font-medium border leading-none transition-all ${activeFolder === "" ? "bg-orange-500/20 text-amber-600 dark:text-amber-400 border-orange-500/30" : "bg-orange-500/10 text-amber-600 dark:text-amber-400 border-orange-500/15 hover:bg-orange-500/15"}`}>
                      全部
                    </button>
                    {Array.from(folders).map((folderName) => (
                      <button key={folderName} onClick={() => setActiveFolder(activeFolder === folderName ? "" : folderName)} className={`inline-flex items-center justify-center min-h-[26px] px-3 rounded-full text-xs font-medium border leading-none transition-all ${activeFolder === folderName ? "bg-orange-500/20 text-amber-600 dark:text-amber-400 border-orange-500/30" : "bg-orange-500/10 text-amber-600 dark:text-amber-400 border-orange-500/15 hover:bg-orange-500/15"}`}>
                        {folderName}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-[background] duration-500" />
              </div>
            )}

            {/* Main Content: Files + Recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* File List */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400/15 to-blue-500/15 flex items-center justify-center">
                      <File className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-foreground">文件</h3>
                    {loading ? <Loader2 className="h-3 w-3 animate-spin text-zinc-400" /> : <span className="text-[11px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 font-medium border border-blue-500/15">{filteredFiles.length}</span>}
                  </div>

                  {loading ? (
                    <div className="space-y-3">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}</div>
                  ) : filteredFiles.length === 0 ? (
                    <div className="text-center py-12 text-sm text-zinc-400">
                      {searchQuery ? "没有匹配的文件" : "暂无文件，点击上方「上传文件」开始上传"}
                    </div>
                  ) : viewMode === "grid" ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredFiles.map((file, i) => renderFileCard(file, i))}
                    </div>
                  ) : (
                    <div className="overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                      <table className="w-full">
                        <thead>
                          <tr className="bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08]">
                            <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">名称</th>
                            <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">大小</th>
                            <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">上传人</th>
                            <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">修改日期</th>
                            <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">操作</th>
                          </tr>
                        </thead>
                        <tbody>{filteredFiles.map(renderFileRow)}</tbody>
                      </table>
                    </div>
                  )}
                  {/* 底部指示线 */}
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-[background] duration-500" />
                </div>
              </div>

              {/* Recent Files */}
              <div>
                <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 h-full transition-all duration-300 hover:border-orange-500/30 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400/15 to-blue-500/15 flex items-center justify-center">
                      <File className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-foreground">最近文件</h3>
                  </div>
                  <div className="space-y-2">
                    {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-16 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)
                      : recentFiles.length === 0 ? <p className="text-xs text-zinc-400 text-center py-8">暂无最近文件</p>
                        : recentFiles.map((file, i) => renderRecentFile(file, i))}
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-[background] duration-500" />
                </div>
              </div>
            </div>

            {/* Storage Stats */}
            <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30 overflow-hidden">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center transition-all duration-300 hover:from-orange-400/30 hover:to-amber-500/30">
                  <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-[14px] font-semibold text-foreground">存储统计</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {STORAGE_BUCKETS.map((bucket, i) => {
                  const stat = storageStats.find(s => s.bucketName === bucket.key)
                  const fileCount = stat?.fileCount ?? 0
                  const totalSize = stat?.totalSize ?? 0
                  const Icon = bucket.icon
                  const animatedFileCount = useCountUp(fileCount, 500, !loading)
                  return (
                    <div
                      key={bucket.key}
                      className="relative rounded-lg border border-black/[0.06] dark:border-white/[0.08] p-4 bg-white/40 dark:bg-white/[0.04] overflow-hidden transition-all duration-200 hover:border-orange-500/20 group/stat"
                      style={{ opacity: 0, animation: `fadeSlideUp 0.4s ease-out ${i * 0.08}s forwards` }}
                    >
                      <div className="flex items-center gap-2 mb-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${bucket.bgColor} transition-all duration-200 group-hover/stat:scale-110`}>
                          <Icon className={`h-4 w-4 ${bucket.color} transition-transform duration-200 group-hover/stat:rotate-6`} />
                        </div>
                        <span className="text-[13px] font-medium text-foreground">{bucket.label}</span>
                      </div>
                      <div className="text-xs text-muted-foreground space-y-0.5">
                        <p>文件: {animatedFileCount}</p>
                        <p>大小: {formatFileSize(totalSize)}</p>
                      </div>
                      {/* 底部渐变指示线 */}
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-transparent to-transparent
                                      group-hover/stat:via-orange-400/50 transition-[background] duration-500" />
                    </div>
                  )
                })}
              </div>
              {/* 底部指示线 */}
              <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-orange-400/0 to-transparent transition-[background] duration-500" />
            </div>
          </div>
        </div>

        {/* ===== 上传文件弹窗 ===== */}
        <Dialog open={showUploadDialog} onOpenChange={(open) => {
          setShowUploadDialog(open)
          if (!open) {
            setUploadFiles([])
            setUploadFolder("")
            setUploadProgress("")
            if (fileInputRef.current) fileInputRef.current.value = ""
          }
        }}>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center">
                  <Upload className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <DialogTitle className="text-lg">上传文件</DialogTitle>
                  <DialogDescription>上传到「{currentBucket.label}」存储桶</DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-5 pt-2">
              {/* 文件夹选择 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <Folder className="h-3.5 w-3.5 text-zinc-400" /> 文件夹
                </label>
                <div className="flex gap-2">
                  <Select value={uploadFolder || "__default__"} onValueChange={(v) => setUploadFolder(v === "__default__" ? "" : v)}>
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="选择文件夹" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__default__">默认</SelectItem>
                      {Array.from(folders).map((f) => (
                        <SelectItem key={f} value={f}>{f}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    size="sm"
                    className="shrink-0"
                    onClick={() => setShowNewFolderDialog(true)}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" /> 新建
                  </Button>
                </div>
              </div>

              {/* 文件选择/列表 */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5">
                  <FileCheck className="h-3.5 w-3.5 text-zinc-400" /> 文件
                </label>
                {uploadFiles.length === 0 ? (
                  <label className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-orange-400 dark:hover:border-orange-500/50 transition-colors cursor-pointer text-center">
                    <Upload className="h-6 w-6 text-zinc-300 dark:text-zinc-600" />
                    <div>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">点击选择文件</p>
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">支持多个文件</p>
                    </div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                ) : (
                  <div className="space-y-1.5">
                    {uploadFiles.map((f, i) => (
                      <div key={`${f.name}-${i}`} className="flex items-center gap-2.5 py-2 px-3 rounded-lg bg-zinc-50 dark:bg-zinc-900/50">
                        <File className="h-4 w-4 text-orange-500 shrink-0" />
                        <span className="text-sm text-zinc-700 dark:text-zinc-300 truncate flex-1">{f.name}</span>
                        <span className="text-xs text-zinc-400 font-mono">{formatFileSize(f.size)}</span>
                        <button
                          type="button"
                          onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))}
                          className="text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 上传进度 */}
              {uploadProgress && (
                <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-500" />
                  {uploadProgress}
                </div>
              )}
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowUploadDialog(false)} disabled={uploading}>
                取消
              </Button>
              <Button
                onClick={handleUpload}
                disabled={uploading || uploadFiles.length === 0}
                className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white"
              >
                {uploading ? (
                  <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> 上传中...</>
                ) : (
                  <><Upload className="h-3.5 w-3.5 mr-1.5" /> 上传 ({uploadFiles.length})</>
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* ===== 新建文件夹弹窗 ===== */}
        <Dialog open={showNewFolderDialog} onOpenChange={setShowNewFolderDialog}>
          <DialogContent className="sm:max-w-[360px]">
            <DialogHeader>
              <DialogTitle>新建文件夹</DialogTitle>
              <DialogDescription>输入新文件夹的名称</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <input
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="文件夹名称"
                className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:border-orange-500 dark:focus:border-orange-500"
                autoFocus
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
              />
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowNewFolderDialog(false)}>取消</Button>
              <Button onClick={handleCreateFolder}>创建</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}
