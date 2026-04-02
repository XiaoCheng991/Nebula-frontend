"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Folder,
  File,
  FileText,
  Music,
  Download,
  Upload,
  MoreHorizontal,
  Search,
  Grid3X3,
  List,
  FolderPlus,
  HardDrive,
} from "lucide-react"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { ProtectedRoute } from "@/components/auth/AuthGuard"

export default function DrivePage() {
  const folders = [
    { id: "folder-1", name: "照片", files: 128, modified: "2024-01-15" },
    { id: "folder-2", name: "文档", files: 34, modified: "2024-01-10" },
    { id: "folder-3", name: "音乐", files: 52, modified: "2024-01-05" },
    { id: "folder-4", name: "工作资料", files: 67, modified: "2024-01-12" },
  ]

  const files = [
    { id: "file-1", name: "年度报告.pdf", size: "2.4 MB", modified: "2024-01-14", type: "pdf", owner: "我" },
    { id: "file-2", name: "假期照片.zip", size: "15.7 MB", modified: "2024-01-13", type: "zip", owner: "Luna" },
    { id: "file-3", name: "项目计划.docx", size: "1.1 MB", modified: "2024-01-12", type: "docx", owner: "我" },
    { id: "file-4", name: "会议录音.mp3", size: "8.3 MB", modified: "2024-01-11", type: "mp3", owner: "张三" },
  ]

  const sharedFiles = [
    { id: "sfile-1", name: "项目提案.pptx", size: "3.2 MB", owner: "Luna", modified: "2024-01-10" },
    { id: "sfile-2", name: "团队照片集.zip", size: "45.7 MB", owner: "张三", modified: "2024-01-08" },
  ]

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="relative min-h-screen">
          {/* Background lighting orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-250px] right-[-200px] w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.07)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute bottom-[-200px] left-[-250px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.06)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[radial-gradient(circle,rgba(245,200,80,0.04)_0%,transparent_70%)] blur-3xl" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h1 className="text-[22px] font-bold tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent leading-tight">
                  文件传输
                </h1>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="relative overflow-hidden gap-2 rounded-xl backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:bg-white/80 dark:hover:bg-white/[0.08] transition-all duration-200 h-11 px-5 cursor-pointer group">
                  <Upload className="h-4 w-4 text-amber-600 dark:text-amber-400 group-hover:text-orange-500" />
                  <span className="group-hover:text-orange-500 transition-colors">上传文件</span>
                </Button>
                <Button className="gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white h-11 px-5 font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-shadow duration-200 cursor-pointer">
                  <FolderPlus className="h-4 w-4" />
                  新建文件夹
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground/70" />
                  <input
                    type="text"
                    placeholder="搜索文件..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-black/[0.06] dark:border-white/[0.08] bg-white/30 dark:bg-white/[0.04] backdrop-blur-sm text-[14px] focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500/40 transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-lg h-10 w-10 backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] text-muted-foreground hover:border-orange-500/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-lg h-10 w-10 backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] text-muted-foreground hover:border-orange-500/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-lg h-10 w-10 backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] text-muted-foreground hover:border-orange-500/40 hover:text-amber-600 dark:hover:text-amber-400 transition-colors cursor-pointer">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Folders Section */}
              <div className="lg:col-span-2">
                <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center">
                      <Folder className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-foreground">文件夹</h3>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-orange-500/10 text-amber-600 dark:text-amber-400 font-medium border border-orange-500/15">{folders.length}</span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="relative overflow-hidden flex items-center gap-3 p-3 rounded-lg backdrop-blur-xl bg-white/40 dark:bg-white/[0.04] border border-black/[0.06] dark:border-white/[0.08] hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:shadow-sm hover:shadow-orange-500/5 transition-all duration-200 cursor-pointer group"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <div className="relative w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center group-hover:scale-105 group-hover:shadow-md group-hover:shadow-orange-400/15 transition-all duration-200 flex-shrink-0">
                          <Folder className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        <div className="relative flex-1 min-w-0">
                          <h4 className="text-[13px] font-medium text-foreground group-hover:text-orange-600 dark:group-hover:text-amber-300 transition-colors truncate">{folder.name}</h4>
                          <p className="text-[11px] text-muted-foreground">{folder.files} 个文件</p>
                        </div>
                        <Button variant="ghost" size="icon" className="relative opacity-0 group-hover:opacity-100 transition-opacity h-7 w-7 text-muted-foreground hover:text-foreground flex-shrink-0 cursor-pointer">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Files Section */}
              <div>
                <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 h-full transition-all duration-300 hover:border-orange-500/30">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-400/15 to-blue-500/15 flex items-center justify-center">
                      <File className="h-5 w-5 text-blue-400" />
                    </div>
                    <h3 className="text-[14px] font-semibold text-foreground">最近文件</h3>
                  </div>
                  <div className="space-y-3">
                    {files.map((file) => {
                      let IconComponent = File
                      let iconColor = "text-muted-foreground"
                      let iconBg = "bg-muted/20"

                      switch (file.type) {
                        case "pdf":
                          IconComponent = FileText
                          iconColor = "text-blue-500"
                          iconBg = "bg-blue-500/15"
                          break
                        case "zip":
                          IconComponent = File
                          iconColor = "text-amber-500"
                          iconBg = "bg-amber-500/15"
                          break
                        case "docx":
                          IconComponent = FileText
                          iconColor = "text-emerald-500"
                          iconBg = "bg-emerald-500/15"
                          break
                        case "mp3":
                          IconComponent = Music
                          iconColor = "text-violet-500"
                          iconBg = "bg-violet-500/15"
                          break
                        default:
                          break
                      }

                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-all cursor-pointer group"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
                          >
                            <IconComponent className={`h-5 w-5 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-medium text-foreground truncate group-hover:text-orange-600 dark:group-hover:text-amber-300 transition-colors">{file.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{file.size} · {file.owner}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 cursor-pointer">
                            <Download className="h-4 w-4" />
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Shared Files Section */}
            <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center">
                  <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="text-[14px] font-semibold text-foreground">共享给我的</h3>
              </div>
              <div className="overflow-hidden rounded-xl border border-black/[0.06] dark:border-white/[0.08]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-black/[0.03] dark:bg-white/[0.04] border-b border-black/[0.06] dark:border-white/[0.08]">
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">名称</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">大小</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">共享者</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">修改日期</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedFiles.map((file) => (
                      <tr key={file.id} className="border-b border-black/[0.06] dark:border-white/[0.08] hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors last:border-b-0">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-[13px] text-foreground font-medium">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[13px] text-muted-foreground tabular-nums">{file.size}</td>
                        <td className="py-3.5 px-4 text-[13px] text-muted-foreground">{file.owner}</td>
                        <td className="py-3.5 px-4 text-[13px] text-muted-foreground">{file.modified}</td>
                        <td className="py-3.5 px-4">
                          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-amber-600 dark:hover:text-amber-400 hover:bg-orange-500/10 transition-colors cursor-pointer">
                            <Download className="h-3.5 w-3.5" />
                            下载
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}
