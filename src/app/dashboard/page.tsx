"use client"

import React, { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { getLocalUserInfo } from "@/lib/api/adapters"
import { getMemos } from "@/lib/supabase/modules/memo"
import { getArticles } from "@/lib/supabase/modules/blog"
import { getUserWebsites, createWebsite, deleteWebsite } from "@/lib/supabase/modules/website"
import { PenLine, BookOpen, FolderUp, Globe2, Loader2, ExternalLink, Star, Trash2, Clock, Sparkles, ArrowRight, Users, Activity, MessageCircle, FileText, TrendingUp, CheckCircle } from "lucide-react"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { ProtectedRoute } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select"

type WebsiteData = {
  id: number
  url: string
  title: string
  description: string | null
  icon_url: string | null
  category: string
  is_featured: boolean
  visit_count: number
  create_time: string
}

type MemoData = {
  id: number
  content: string
  create_time: string
  like_count: number
  comment_count: number
}

const CATEGORIES = ["工具", "开发", "设计", "学习", "阅读", "社交", "其他"]

export default function DashboardPage() {
  const searchParams = useSearchParams()
  const localUser = getLocalUserInfo()
  const userId = typeof localUser?.id === "number" ? localUser.id : Number(localUser?.id) || undefined

  const [memoCount, setMemoCount] = useState(0)
  const [articleCount, setArticleCount] = useState(0)
  const [websiteCount, setWebsiteCount] = useState(0)
  const [recentMemos, setRecentMemos] = useState<MemoData[]>([])
  const [recentWebsites, setRecentWebsites] = useState<WebsiteData[]>([])
  const [loading, setLoading] = useState(true)

  // 弹窗
  const [dialogOpen, setDialogOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState("")
  const [formData, setFormData] = useState({
    url: "", title: "", description: "", icon_url: "", category: "工具", is_featured: false,
  })

  const loadAll = useCallback(async () => {
    if (!userId) { setLoading(false); return }
    try {
      const [memoRes, articleRes, websiteRes] = await Promise.all([
        getMemos({ userId, page: 1, pageSize: 5 }),
        getArticles({ page: 1, pageSize: 5 }),
        getUserWebsites({ userId, page: 1, pageSize: 8 }),
      ])
      setMemoCount(memoRes.total)
      setArticleCount(articleRes.total)
      setWebsiteCount(websiteRes.total)
      setRecentMemos((memoRes.data as MemoData[]) || [])
      setRecentWebsites((websiteRes.data as WebsiteData[]) || [])
    } catch (e) {
      console.error("[我的空间] 加载失败:", e)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { loadAll() }, [loadAll])

  useEffect(() => {
    if (searchParams?.get("addWebsite") === "true") setDialogOpen(true)
  }, [searchParams])

  const handleDialogChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setFormData({ url: "", title: "", description: "", icon_url: "", category: "工具", is_featured: false })
      setFormError("")
    }
  }

  const handleAddWebsite = async () => {
    if (!formData.url || !formData.title) { setFormError("网站链接和名称为必填项"); return }
    if (!userId) { setFormError("请先登录"); return }
    setFormError("")
    setSaving(true)
    try {
      const { error } = await createWebsite({
        user_id: userId, url: formData.url, title: formData.title,
        description: formData.description || null, icon_url: formData.icon_url || null,
        category: formData.category, is_featured: formData.is_featured,
      })
      if (error) { setFormError(error.message); return }
      handleDialogChange(false)
      await loadAll()
    } catch (e: any) { setFormError(e.message || "收藏失败") }
    finally { setSaving(false) }
  }

  const handleDeleteWebsite = async (id: number) => {
    await deleteWebsite(id)
    await loadAll()
  }

  if (loading) {
    return <ProtectedRoute><LayoutWithFullWidth><div className="min-h-screen flex items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-orange-500" /></div></LayoutWithFullWidth></ProtectedRoute>
  }

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <div className="relative min-h-screen">
          {/* Background lighting orbs */}
          <div className="fixed inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-[-300px] left-[-200px] w-[700px] h-[700px] rounded-full bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute top-[40%] right-[-250px] w-[600px] h-[600px] rounded-full bg-[radial-gradient(circle,rgba(251,191,36,0.06)_0%,transparent_70%)] blur-3xl" />
            <div className="absolute bottom-[-300px] left-1/3 w-[650px] h-[650px] rounded-full bg-[radial-gradient(circle,rgba(245,166,80,0.05)_0%,transparent_70%)] blur-3xl" />
          </div>

          <div className="relative z-10 max-w-[1400px] mx-auto px-6 py-8 space-y-8">
            {/* Page Header */}
            <div className="flex items-center justify-between gap-4">
              <div>
                <h1 className="text-[22px] font-bold tracking-tight bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent leading-tight">
                  我的空间
                </h1>
              </div>
              <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl backdrop-blur-xl border border-orange-500/20 bg-white/10 dark:bg-black/20">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <span className="text-[13px] text-muted-foreground font-medium">系统运行正常</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "碎碎念", value: String(memoCount), icon: MessageCircle },
                { title: "文章", value: String(articleCount), icon: BookOpen },
                { title: "网站精选", value: String(websiteCount), icon: Globe2 },
              ].map((stat, index) => {
                const Icon = stat.icon
                return (
                  <div
                    key={index}
                    className="group relative backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/40 dark:hover:border-orange-500/30 hover:shadow-lg hover:shadow-orange-500/10 hover:-translate-y-0.5 cursor-default"
                  >
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-orange-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                    <div className="relative">
                      <div className="flex items-start justify-between mb-3">
                        <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md group-hover:shadow-orange-400/20 transition-all duration-300">
                          <Icon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                        </div>
                      </div>
                      <p className="text-[12px] text-muted-foreground mb-1">{stat.title}</p>
                      <p className="text-[22px] font-bold text-foreground tabular-nums">{stat.value}</p>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-4">
              {/* Recent Memos */}
              <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <PenLine className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-[14px] font-semibold text-foreground">碎碎念</h3>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/10 text-amber-600 dark:text-amber-400 font-medium border border-orange-500/15">MEMO</span>
                </div>
                {recentMemos.length === 0 ? (
                  <div className="text-center py-8 text-[13px] text-muted-foreground">还没有碎碎念</div>
                ) : (
                  <div className="space-y-1.5">
                    {recentMemos.map((memo) => (
                      <div
                        key={memo.id}
                        className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors duration-200 cursor-pointer group/act"
                      >
                        <div className="relative">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center group-hover/act:from-orange-400/30 group-hover/act:to-amber-500/30 transition-all duration-200">
                            <Clock className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] text-foreground">{memo.content}</p>
                          <span className="text-[11px] text-muted-foreground tabular-nums">
                            {new Date(memo.create_time).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Website Collections */}
              <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all duration-300 hover:border-orange-500/30">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Globe2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    <h3 className="text-[14px] font-semibold text-foreground">网站精选</h3>
                  </div>
                  <Button size="sm" variant="outline" className="h-7 px-3 text-[11px]" onClick={() => handleDialogChange(true)}>
                    <Star className="h-3 w-3 mr-1" />
                    添加
                  </Button>
                </div>
                {recentWebsites.length === 0 ? (
                  <div className="text-center py-8 text-[13px] text-muted-foreground">还没有收藏网站</div>
                ) : (
                  <div className="space-y-1.5">
                    {recentWebsites.map((site) => (
                      <div
                        key={site.id}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors duration-200 group/site"
                      >
                        {site.icon_url ? (
                          <img src={site.icon_url} alt="" className="w-8 h-8 rounded-md object-cover flex-shrink-0 bg-zinc-100 dark:bg-zinc-800" onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none" }} />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center flex-shrink-0">
                            <Globe2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <a
                              href={site.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[13px] font-medium text-foreground hover:text-orange-500 transition-colors truncate"
                            >
                              {site.title}
                            </a>
                            {site.is_featured && <Star className="h-3 w-3 text-amber-500 flex-shrink-0" />}
                          </div>
                          {site.description && (
                            <p className="text-[11px] text-muted-foreground truncate">{site.description}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleDeleteWebsite(site.id)}
                          className="p-1.5 rounded text-muted-foreground hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Welcome Card */}
            <div className="relative backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-5 overflow-hidden hover:border-orange-500/30 transition-all duration-300 group">
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)] blur-2xl pointer-events-none" />
              <div className="absolute inset-0 bg-gradient-to-l from-orange-500/5 via-transparent to-transparent" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0 group-hover:shadow-lg group-hover:shadow-orange-500/20 transition-shadow duration-300">
                  <Sparkles className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-semibold text-foreground mb-1">欢迎来到我的空间</h3>
                  <p className="text-[13px] text-muted-foreground max-w-[500px]">
                    这里是你个人的私密空间，记录碎碎念、收藏喜欢的网站，管理你的数字生活。
                  </p>
                </div>
                <Button
                  className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-lg px-5 h-10 font-medium shadow-lg shadow-orange-500/25 hover:shadow-orange-500/35 transition-shadow duration-200 flex-shrink-0 text-sm"
                  onClick={() => handleDialogChange(true)}
                >
                  添加网站精选
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 添加网站弹窗 */}
        <Dialog open={dialogOpen} onOpenChange={handleDialogChange}>
          <DialogContent className="sm:max-w-[440px]">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <Star className="h-5 w-5 text-orange-500" />
                添加网站精选
              </DialogTitle>
              <DialogDescription>收藏一个你喜欢的网站</DialogDescription>
            </DialogHeader>

            {formError && <p className="text-sm text-red-500 bg-red-50/80 dark:bg-red-950/30 px-3 py-2 rounded-lg">{formError}</p>}

            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">网站链接</Label>
                  <Input placeholder="https://..." value={formData.url} onChange={e => setFormData(p => ({ ...p, url: e.target.value }))} className="h-9 text-sm" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium">网站名称</Label>
                  <Input placeholder="名称" value={formData.title} onChange={e => setFormData(p => ({ ...p, title: e.target.value }))} className="h-9 text-sm" />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium">网站简介</Label>
                <Textarea placeholder="简单介绍" value={formData.description} onChange={e => setFormData(p => ({ ...p, description: e.target.value }))} rows={2} className="text-sm" />
              </div>
            </div>

            <DialogFooter className="flex gap-2 justify-end">
              <Button variant="outline" size="sm" onClick={() => handleDialogChange(false)} disabled={saving}>取消</Button>
              <Button size="sm" onClick={handleAddWebsite} disabled={saving} className="bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600">
                {saving ? <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />保存中</> : "添加"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}
