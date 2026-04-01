"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import {
  Folder,
  File,
  Image,
  FileText,
  Music,
  Video,
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
        <div className="min-h-screen bg-[#0a0a0a]">
          <style jsx global>{`
            :root {
              --bg: #0a0a0a;
              --card: #141414;
              --border: #222;
              --text: #e5e5e5;
              --text2: #999;
              --text3: #666;
              --accent: #3b82f6;
              --accent2: #60a5fa;
            }
          `}</style>

          <div className="max-w-[1400px] mx-auto px-6 py-12 space-y-8">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-[32px] font-bold text-white tracking-tight mb-2">文件传输</h1>
                <p className="text-[#999] text-[15px]">管理和分享你的文件</p>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" className="gap-2 rounded-xl border-[#222] bg-[#141414] hover:bg-[#1a1a1a] hover:border-[#3b82f6]/50 text-[#e5e5e5] h-11 px-4">
                  <Upload className="h-4 w-4" />
                  上传文件
                </Button>
                <Button className="gap-2 rounded-xl bg-[#3b82f6] hover:bg-[#2563eb] text-white h-11 px-4">
                  <Folder className="h-4 w-4" />
                  新建文件夹
                </Button>
              </div>
            </div>

            {/* Search Bar */}
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-5">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#666]" />
                  <input
                    type="text"
                    placeholder="搜索文件..."
                    className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-[#222] bg-[#0a0a0a] text-[#e5e5e5] text-[14px] focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/20 focus:border-[#3b82f6] transition-all placeholder:text-[#666]"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="icon" className="rounded-lg border-[#222] bg-[#0a0a0a] hover:bg-[#1a1a1a] h-10 w-10 text-[#999]">
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-lg border-[#222] bg-[#0a0a0a] hover:bg-[#1a1a1a] h-10 w-10 text-[#999]">
                    <List className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" className="rounded-lg border-[#222] bg-[#0a0a0a] hover:bg-[#1a1a1a] h-10 w-10 text-[#999]">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Folders Section */}
              <div className="lg:col-span-2">
                <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
                  <div className="flex items-center gap-2.5 mb-6">
                    <Folder className="h-5 w-5 text-[#3b82f6]" />
                    <h3 className="text-[15px] font-semibold text-white">文件夹</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {folders.map((folder) => (
                      <div
                        key={folder.id}
                        className="flex items-center gap-4 p-4 rounded-xl border border-[#222] hover:border-[#3b82f6]/50 hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3b82f6]/15 to-[#60a5fa]/15 flex items-center justify-center group-hover:scale-105 transition-transform">
                          <Folder className="h-6 w-6 text-[#3b82f6]" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-[14px] font-medium text-[#e5e5e5] truncate">{folder.name}</h4>
                          <p className="text-[12px] text-[#666] mt-0.5">{folder.size}</p>
                          <p className="text-[11px] text-[#666] mt-0.5">修改于 {folder.modified}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-[#999] hover:text-[#e5e5e5]">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Files Section */}
              <div>
                <div className="bg-[#141414] border border-[#222] rounded-2xl p-6 h-full">
                  <div className="flex items-center gap-2.5 mb-6">
                    <File className="h-5 w-5 text-[#60a5fa]" />
                    <h3 className="text-[15px] font-semibold text-white">最近文件</h3>
                  </div>
                  <div className="space-y-3">
                    {files.map((file) => {
                      let IconComponent = File
                      let iconColor = "#666"
                      let iconBg = "#1a1a1a"

                      switch (file.type) {
                        case "pdf":
                          IconComponent = FileText
                          iconColor = "#3b82f6"
                          iconBg = "rgba(59, 130, 246, 0.15)"
                          break
                        case "zip":
                          IconComponent = File
                          iconColor = "#60a5fa"
                          iconBg = "rgba(96, 165, 250, 0.15)"
                          break
                        case "docx":
                          IconComponent = FileText
                          iconColor = "#3b82f6"
                          iconBg = "rgba(59, 130, 246, 0.15)"
                          break
                        case "mp3":
                          IconComponent = Music
                          iconColor = "#60a5fa"
                          iconBg = "rgba(96, 165, 250, 0.15)"
                          break
                        default:
                          break
                      }

                      return (
                        <div
                          key={file.id}
                          className="flex items-center gap-3 p-3 rounded-xl hover:bg-[#1a1a1a] transition-all cursor-pointer group"
                        >
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: iconBg }}
                          >
                            <IconComponent className="h-5 w-5" style={{ color: iconColor }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-medium text-[#e5e5e5] truncate">{file.name}</h4>
                            <p className="text-[11px] text-[#666] mt-0.5">{file.size} · {file.owner}</p>
                          </div>
                          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-[#999] hover:text-[#e5e5e5]">
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
            <div className="bg-[#141414] border border-[#222] rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-6">
                <File className="h-5 w-5 text-[#60a5fa]" />
                <h3 className="text-[15px] font-semibold text-white">共享给我的</h3>
              </div>
              <div className="overflow-hidden rounded-xl border border-[#222]">
                <table className="w-full">
                  <thead>
                    <tr className="bg-[#0a0a0a] border-b border-[#222]">
                      <th className="text-left py-3.5 px-4 font-medium text-[#999] text-[12px] uppercase tracking-wider">名称</th>
                      <th className="text-left py-3.5 px-4 font-medium text-[#999] text-[12px] uppercase tracking-wider">大小</th>
                      <th className="text-left py-3.5 px-4 font-medium text-[#999] text-[12px] uppercase tracking-wider">共享者</th>
                      <th className="text-left py-3.5 px-4 font-medium text-[#999] text-[12px] uppercase tracking-wider">修改日期</th>
                      <th className="text-left py-3.5 px-4 font-medium text-[#999] text-[12px] uppercase tracking-wider">操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sharedFiles.map((file) => (
                      <tr key={file.id} className="border-b border-[#222] hover:bg-[#1a1a1a] transition-colors last:border-b-0">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center gap-2.5">
                            <FileText className="h-4 w-4 text-[#3b82f6]" />
                            <span className="text-[13px] text-[#e5e5e5] font-medium">{file.name}</span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-[13px] text-[#666]">{file.size}</td>
                        <td className="py-3.5 px-4 text-[13px] text-[#666]">{file.owner}</td>
                        <td className="py-3.5 px-4 text-[13px] text-[#666]">{file.modified}</td>
                        <td className="py-3.5 px-4">
                          <Button variant="ghost" size="sm" className="gap-1.5 h-8 px-3 text-[#999] hover:text-[#e5e5e5] hover:bg-[#1a1a1a]">
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
