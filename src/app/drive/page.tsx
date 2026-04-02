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
  List
} from "lucide-react"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { ProtectedRoute } from "@/components/auth/AuthGuard"

export default function DrivePage() {
  const folders = [
    { id: "folder-1", name: "照片", size: "1.2 GB", modified: "2024-01-15" },
    { id: "folder-2", name: "文档", size: "450 MB", modified: "2024-01-10" },
    { id: "folder-3", name: "音乐", size: "2.1 GB", modified: "2024-01-05" },
    { id: "folder-4", name: "工作资料", size: "870 MB", modified: "2024-01-12" },
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
        <div className="min-h-screen bg-background">
          <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] font-bold text-foreground tracking-tight mb-2">文件传输</h1>
                <p className="text-muted-foreground text-[15px]">管理和分享你的文件</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2 rounded-xl hover:border-primary/50 h-11 px-4">
                  <Upload className="h-4 w-4" />
                  上传文件
                </Button>
                <Button className="gap-2 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground h-11 px-4">
                  <Folder className="h-4 w-4" />
                  新建文件夹
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-card border rounded-2xl p-5">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="搜索文件..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border bg-background text-[14px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all placeholder:text-muted-foreground"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-lg h-10 w-10 text-muted-foreground">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-lg h-10 w-10 text-muted-foreground">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-lg h-10 w-10 text-muted-foreground">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Folders Section */}
              <div className="lg:col-span-2">
                <div className="bg-card border rounded-2xl p-6">
                  <div className="flex items-center gap-2.5 mb-6">
                    <Folder className="h-5 w-5 text-primary" />
                    <h3 className="text-[15px] font-semibold text-foreground">文件夹</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center gap-4 p-4 rounded-xl border hover:border-primary/50 hover:bg-accent transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Folder className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-medium text-foreground truncate">{folder.name}</h4>
                          <p className="text-[12px] text-muted-foreground mt-0.5">{folder.size}</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">修改于 {folder.modified}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-foreground">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Files Section */}
              <div>
                <div className="bg-card border rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-2.5 mb-6">
                    <File className="h-5 w-5 text-blue-400" />
                    <h3 className="text-[15px] font-semibold text-foreground">最近文件</h3>
                  </div>
                  <div className="space-y-3">
                    {files.map((file) => {
                      let IconComponent = File
                      let iconColor = "text-muted-foreground"
                      let iconBg = "bg-muted"

                      switch (file.type) {
                        case "pdf":
                          IconComponent = FileText
                          iconColor = "text-blue-500"
                          iconBg = "bg-blue-500/15"
                          break
                        case "zip":
                          IconComponent = File
                          iconColor = "text-blue-400"
                          iconBg = "bg-blue-400/15"
                          break
                        case "docx":
                          IconComponent = FileText
                          iconColor = "text-blue-500"
                          iconBg = "bg-blue-500/15"
                          break
                        case "mp3":
                          IconComponent = Music
                          iconColor = "text-blue-400"
                          iconBg = "bg-blue-400/15"
                          break
                        default:
                          break
                      }

                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-accent transition-all cursor-pointer group"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}
                          >
                            <IconComponent className={`h-5 w-5 ${iconColor}`} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-medium text-foreground truncate">{file.name}</h4>
                            <p className="text-[11px] text-muted-foreground mt-0.5">{file.size} · {file.owner}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-foreground">
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
            <div className="bg-card border rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <File className="h-5 w-5 text-blue-400" />
                <h3 className="text-[15px] font-semibold text-foreground">共享给我的</h3>
              </div>
              <div className="overflow-hidden rounded-xl border">
                <table className="w-full">
                  <thead>
                    <tr className="bg-muted/50 border-b">
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">名称</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">大小</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">共享者</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">修改日期</th>
                      <th className="text-left py-3.5 px-4 font-medium text-muted-foreground text-[12px] uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedFiles.map((file) => (
                      <tr key={file.id} className="border-b hover:bg-accent transition-colors last:border-b-0">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-blue-500" />
                            <span className="text-[13px] text-foreground font-medium">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[13px] text-muted-foreground">{file.size}</td>
                        <td className="py-3.5 px-4 text-[13px] text-muted-foreground">{file.owner}</td>
                        <td className="py-3.5 px-4 text-[13px] text-muted-foreground">{file.modified}</td>
                        <td className="py-3.5 px-4">
                          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-3 text-muted-foreground hover:text-foreground hover:bg-accent">
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
