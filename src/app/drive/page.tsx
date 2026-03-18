"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
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
  // Mock data for demonstration
  const folders = [
    { id: "folder-1", name: "照片", size: "1.2 GB", modified: "2024-01-15", type: "folder" },
    { id: "folder-2", name: "文档", size: "450 MB", modified: "2024-01-10", type: "folder" },
    { id: "folder-3", name: "音乐", size: "2.1 GB", modified: "2024-01-05", type: "folder" },
    { id: "folder-4", name: "工作资料", size: "870 MB", modified: "2024-01-12", type: "folder" },
  ]

  const files = [
    { id: "file-1", name: "年度报告.pdf", size: "2.4 MB", modified: "2024-01-14", type: "pdf", owner: "我" },
    { id: "file-2", name: "假期照片.zip", size: "15.7 MB", modified: "2024-01-13", type: "zip", owner: "Luna" },
    { id: "file-3", name: "项目计划.docx", size: "1.1 MB", modified: "2024-01-12", type: "docx", owner: "我" },
    { id: "file-4", name: "会议录音.mp3", size: "8.3 MB", modified: "2024-01-11", type: "mp3", owner: "张三" },
  ]

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="space-y-4">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">文件传输</h1>
            <p className="text-muted-foreground mt-1">管理和分享你的文件</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="gap-2 hover:bg-white/10 dark:hover:bg-white/5 border-[var(--glass-border)]">
              <Upload className="h-4 w-4" />
              上传文件
            </Button>
            <Button className="gap-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 shadow-lg shadow-orange-500/25">
              <Folder className="h-4 w-4" />
              新建文件夹
            </Button>
          </div>
        </div>

        {/* Search and View Options */}
        <Card className="admin-card">
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="搜索文件..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--glass-border)] bg-white/50 dark:bg-white/5 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 focus:border-[var(--accent)] transition-all"
              />
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" className="hover:bg-white/10 dark:hover:bg-white/5 border-[var(--glass-border)]">
                <Grid3X3 className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-white/10 dark:hover:bg-white/5 border-[var(--glass-border)]">
                <List className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button variant="outline" size="icon" className="hover:bg-white/10 dark:hover:bg-white/5 border-[var(--glass-border)]">
                <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Folders Section */}
          <div className="lg:col-span-2">
            <Card className="admin-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Folder className="h-5 w-5 text-orange-500" />
                  文件夹
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {folders.map((folder) => (
                    <div
                      key={folder.id}
                      className="flex items-center gap-4 p-4 rounded-xl border border-[var(--glass-border)] hover:border-orange-200 hover:bg-orange-50/50 dark:hover:bg-orange-950/30 cursor-pointer transition-all group"
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/20 to-amber-500/20 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Folder className="h-6 w-6 text-orange-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-foreground truncate">{folder.name}</h4>
                        <p className="text-sm text-muted-foreground">{folder.size}</p>
                        <p className="text-xs text-muted-foreground">修改于 {folder.modified}</p>
                      </div>
                      <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Files Section */}
          <div>
            <Card className="admin-card h-full">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <File className="h-5 w-5 text-amber-500" />
                  最近文件
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {files.map((file) => {
                    let IconComponent;
                    let colorClass;
                    switch(file.type) {
                      case 'pdf':
                        IconComponent = FileText;
                        colorClass = 'text-orange-500 bg-orange-500/10';
                        break;
                      case 'zip':
                        IconComponent = File;
                        colorClass = 'text-amber-500 bg-amber-500/10';
                        break;
                      case 'docx':
                        IconComponent = FileText;
                        colorClass = 'text-orange-400 bg-orange-400/10';
                        break;
                      case 'mp3':
                        IconComponent = Music;
                        colorClass = 'text-yellow-500 bg-yellow-500/10';
                        break;
                      default:
                        IconComponent = File;
                        colorClass = 'text-muted-foreground bg-[var(--glass-bg)]';
                    }

                    return (
                      <div
                        key={file.id}
                        className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--accent)]/5 cursor-pointer transition-all group"
                      >
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colorClass}`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-sm text-foreground truncate">{file.name}</h4>
                          <p className="text-xs text-muted-foreground">{file.size} · {file.owner}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <Download className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Shared with Me Section */}
        <Card className="admin-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-xl">👥</span>
              共享给我的
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-hidden rounded-xl border border-[var(--glass-border)]">
              <table className="w-full">
                <thead>
                  <tr className="bg-[var(--glass-bg)] border-b border-[var(--glass-border)]">
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">名称</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">大小</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">共享者</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">修改日期</th>
                    <th className="text-left py-3 px-4 font-medium text-muted-foreground">操作</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-[var(--glass-border)] hover:bg-orange-50/50 dark:hover:bg-orange-950/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4 text-orange-500" />
                      项目提案.pptx
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">3.2 MB</td>
                    <td className="py-3 px-4 text-muted-foreground">Luna</td>
                    <td className="py-3 px-4 text-muted-foreground">2024-01-10</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="gap-1 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30">
                        <Download className="h-4 w-4" />
                        下载
                      </Button>
                    </td>
                  </tr>
                  <tr className="hover:bg-orange-50/50 dark:hover:bg-orange-950/30 transition-colors">
                    <td className="py-3 px-4 font-medium text-foreground flex items-center gap-2">
                      <File className="h-4 w-4 text-amber-500" />
                      团队照片集.zip
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">45.7 MB</td>
                    <td className="py-3 px-4 text-muted-foreground">张三</td>
                    <td className="py-3 px-4 text-muted-foreground">2024-01-08</td>
                    <td className="py-3 px-4">
                      <Button variant="ghost" size="sm" className="gap-1 hover:bg-orange-50 hover:text-orange-600 dark:hover:bg-orange-950/30">
                        <Download className="h-4 w-4" />
                        下载
                      </Button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}
