"use client"

import React, { useEffect, useState } from "react"
import { supabase } from "@/lib/supabase/client"
import {
  getUserAccounts,
  saveAccount,
  deleteAccount,
  getLatestStats,
  refreshAccountStats,
  PLATFORM_CONFIG,
  type SocialPlatform,
  type SocialMediaAccount,
} from "@/lib/api/modules/social-media"
import { fetchPlatformData, normalizeProfileUrl, extractUsernameFromUrl } from "@/lib/agent-reach"
import LayoutWithFullWidth from "@/components/LayoutWithFullWidth"
import { ProtectedRoute } from "@/components/auth/AuthGuard"
import { Button } from "@/components/ui/button"
import { toast } from "@/components/ui/use-toast"
import {
  Plus,
  RefreshCw,
  Trash2,
  ExternalLink,
  Loader2,
  BarChart3,
  Users,
  Heart,
  Eye,
  FileText,
  X,
} from "lucide-react"
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
import { Input } from "@/components/ui/input"

// 支持的平台列表
const SUPPORTED_PLATFORMS: SocialPlatform[] = [
  "bilibili",
  "xiaohongshu",
  "douyin",
  "weibo",
  "youtube",
  "twitter",
  "github",
  "csdn",
  "other",
]

// 数字滚动动画 hook
function useCountUp(target: number, duration = 800, start = false) {
  const [current, setCurrent] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime: number
    let frame: number
    const step = (ts: number) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out cubic
      setCurrent(Math.floor(eased * target))
      if (progress < 1) frame = requestAnimationFrame(step)
    }
    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [target, duration, start])
  return current
}

// 格式化数字
function formatNumber(num: number): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + "万"
  }
  return num.toLocaleString()
}

// CSS 动画
const ANIMATION_STYLES = `
@keyframes fadeSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmerLine {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.anim-fade-slide-up {
  opacity: 0;
  animation: fadeSlideUp 0.5s ease-out forwards;
}
.anim-shimmer {
  background: linear-gradient(
    90deg, transparent 0%, rgba(245, 166, 35, 0.15) 50%, transparent 100%
  );
  background-size: 200% 100%;
  animation: shimmerLine 2.5s infinite;
}
`

function AnimationStyles() {
  return <style>{ANIMATION_STYLES}</style>
}

export default function DashboardPage() {
  const [currentUserId, setCurrentUserId] = useState<number | null>(null)
  const [accounts, setAccounts] = useState<{ account: SocialMediaAccount; snapshot: any }[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)

  // 新增账号表单
  const [newPlatform, setNewPlatform] = useState<SocialPlatform>("bilibili")
  const [newProfileUrl, setNewProfileUrl] = useState("")
  const [saving, setSaving] = useState(false)

  // 获取当前用户 ID
  useEffect(() => {
    async function fetchCurrentUser() {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user?.email) return

      const { data: sysUser } = await supabase
        .from("sys_users")
        .select("id")
        .eq("email", session.user.email)
        .single()

      if (sysUser?.id) {
        setCurrentUserId(Number(sysUser.id))
      }
    }
    fetchCurrentUser()
  }, [])

  // 加载账号数据
  async function loadData() {
    if (!currentUserId) return
    setLoading(true)
    try {
      const stats = await getLatestStats(currentUserId)
      setAccounts(stats)
    } catch (err) {
      console.error("加载数据失败:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (currentUserId) {
      loadData()
    }
  }, [currentUserId])

  // 添加账号
  async function handleAddAccount() {
    if (!currentUserId || !newProfileUrl.trim()) {
      toast({ title: "请输入主页链接", variant: "destructive" })
      return
    }

    setSaving(true)
    try {
      const url = normalizeProfileUrl(newPlatform, newProfileUrl)
      const displayName = extractUsernameFromUrl(url, newPlatform)

      const { error } = await saveAccount(currentUserId, newPlatform, url, displayName)

      if (error) {
        toast({ title: "添加失败", description: error.message, variant: "destructive" })
      } else {
        toast({ title: "添加成功", description: `${PLATFORM_CONFIG[newPlatform].name} 已添加` })
        setShowAddDialog(false)
        setNewProfileUrl("")
        await loadData()
      }
    } catch (err) {
      toast({ title: "添加失败", description: "请稍后重试", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  // 删除账号
  async function handleDeleteAccount(id: number) {
    const ok = await deleteAccount(id)
    if (ok) {
      toast({ title: "已删除" })
      await loadData()
    } else {
      toast({ title: "删除失败", variant: "destructive" })
    }
  }

  // 刷新单个账号数据
  async function handleRefreshAccount(account: SocialMediaAccount) {
    setRefreshing(true)
    try {
      const stats = await fetchPlatformData(account.profile_url, account.platform)
      await refreshAccountStats(account.id, stats)
      toast({ title: "刷新成功", description: `${PLATFORM_CONFIG[account.platform].name} 数据已更新` })
      await loadData()
    } catch (err) {
      toast({ title: "刷新失败", description: "请稍后重试", variant: "destructive" })
    } finally {
      setRefreshing(false)
    }
  }

  // 刷新全部数据
  async function handleRefreshAll() {
    setRefreshing(true)
    let successCount = 0
    let failCount = 0

    for (const { account } of accounts) {
      try {
        const stats = await fetchPlatformData(account.profile_url, account.platform)
        await refreshAccountStats(account.id, stats)
        successCount++
      } catch {
        failCount++
      }
    }

    toast({
      title: "刷新完成",
      description: `${successCount} 个成功${failCount > 0 ? `，${failCount} 个失败` : ""}`,
    })
    await loadData()
    setRefreshing(false)
  }

  // 计算总览数据
  const totalFollowers = accounts.reduce(
    (sum, { snapshot }) => sum + (snapshot?.followers_count || 0),
    0
  )
  const totalLikes = accounts.reduce(
    (sum, { snapshot }) => sum + (snapshot?.likes_count || 0),
    0
  )
  const totalViews = accounts.reduce(
    (sum, { snapshot }) => sum + (snapshot?.views_count || 0),
    0
  )

  const animatedFollowers = useCountUp(totalFollowers, 600, !loading)
  const animatedLikes = useCountUp(totalLikes, 600, !loading)
  const animatedViews = useCountUp(totalViews, 600, !loading)

  const SkeletonCard = () => (
    <div className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 animate-pulse">
      <div className="w-9 h-9 rounded-lg bg-zinc-200 dark:bg-zinc-800 mb-3" />
      <div className="h-3 w-16 rounded bg-zinc-200 dark:bg-zinc-800 mb-2" />
      <div className="h-6 w-10 rounded bg-zinc-200 dark:bg-zinc-800" />
    </div>
  )

  return (
    <ProtectedRoute>
      <LayoutWithFullWidth>
        <AnimationStyles />
        <div className="relative min-h-screen">
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
                  社交媒体数据
                </h1>
                <div className="h-[2px] w-16 mt-2 rounded-full anim-shimmer" />
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  onClick={handleRefreshAll}
                  disabled={refreshing || accounts.length === 0}
                  className="gap-2"
                >
                  {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                  刷新全部
                </Button>
                <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500">
                  <Plus className="h-4 w-4" />
                  添加账号
                </Button>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {loading ? (
                <>
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                  <SkeletonCard />
                </>
              ) : (
                <>
                  <div
                    className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all hover:border-orange-500/30"
                    style={{ opacity: 0, animation: "fadeSlideUp 0.4s ease-out 0s forwards" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-400/20 to-amber-500/20 flex items-center justify-center">
                        <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <span className="text-[12px] text-muted-foreground">总粉丝</span>
                    </div>
                    <p className="text-[22px] font-bold text-foreground tabular-nums">{formatNumber(animatedFollowers)}</p>
                  </div>

                  <div
                    className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all hover:border-orange-500/30"
                    style={{ opacity: 0, animation: "fadeSlideUp 0.4s ease-out 0.1s forwards" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-400/20 to-pink-500/20 flex items-center justify-center">
                        <Heart className="h-4 w-4 text-pink-500" />
                      </div>
                      <span className="text-[12px] text-muted-foreground">总获赞</span>
                    </div>
                    <p className="text-[22px] font-bold text-foreground tabular-nums">{formatNumber(animatedLikes)}</p>
                  </div>

                  <div
                    className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all hover:border-orange-500/30"
                    style={{ opacity: 0, animation: "fadeSlideUp 0.4s ease-out 0.2s forwards" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-400/20 to-cyan-500/20 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-cyan-500" />
                      </div>
                      <span className="text-[12px] text-muted-foreground">总播放/阅读</span>
                    </div>
                    <p className="text-[22px] font-bold text-foreground tabular-nums">{formatNumber(animatedViews)}</p>
                  </div>

                  <div
                    className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all hover:border-orange-500/30"
                    style={{ opacity: 0, animation: "fadeSlideUp 0.4s ease-out 0.3s forwards" }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-400/20 to-purple-500/20 flex items-center justify-center">
                        <BarChart3 className="h-4 w-4 text-purple-500" />
                      </div>
                      <span className="text-[12px] text-muted-foreground">账号数量</span>
                    </div>
                    <p className="text-[22px] font-bold text-foreground tabular-nums">{accounts.length}</p>
                  </div>
                </>
              )}
            </div>

            {/* Platform Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 animate-pulse">
                    <div className="h-6 w-24 rounded bg-zinc-200 dark:bg-zinc-800 mb-3" />
                    <div className="space-y-2">
                      <div className="h-4 w-full rounded bg-zinc-200 dark:bg-zinc-800" />
                      <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800" />
                    </div>
                  </div>
                ))
              ) : accounts.length === 0 ? (
                <div className="col-span-full text-center py-16">
                  <BarChart3 className="h-12 w-12 text-zinc-300 dark:text-zinc-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">还没有添加账号</h3>
                  <p className="text-muted-foreground mb-4">添加你的社交媒体账号，一键获取数据</p>
                  <Button onClick={() => setShowAddDialog(true)} className="gap-2 bg-gradient-to-r from-orange-500 to-amber-500">
                    <Plus className="h-4 w-4" />
                    添加第一个账号
                  </Button>
                </div>
              ) : (
                accounts.map(({ account, snapshot }, index) => {
                  const config = PLATFORM_CONFIG[account.platform as SocialPlatform] || PLATFORM_CONFIG.other
                  return (
                    <div
                      key={account.id}
                      className="backdrop-blur-xl bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-4 transition-all hover:border-orange-500/30 group"
                      style={{ opacity: 0, animation: `fadeSlideUp 0.4s ease-out ${0.1 + index * 0.05}s forwards` }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                            style={{ backgroundColor: config.color }}
                          >
                            {config.icon}
                          </div>
                          <div>
                            <h3 className="text-[15px] font-semibold text-foreground">{config.name}</h3>
                            <p className="text-[11px] text-muted-foreground truncate max-w-[150px]">
                              {account.display_name || account.profile_url}
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleRefreshAccount(account)}
                            disabled={refreshing}
                            title="刷新数据"
                          >
                            <RefreshCw className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:text-red-500"
                            onClick={() => handleDeleteAccount(account.id)}
                            title="删除账号"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>

                      {snapshot ? (
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-lg p-2.5">
                            <div className="text-[10px] text-muted-foreground uppercase mb-1">粉丝</div>
                            <div className="text-[14px] font-semibold text-foreground">
                              {formatNumber(snapshot.followers_count)}
                            </div>
                          </div>
                          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-lg p-2.5">
                            <div className="text-[10px] text-muted-foreground uppercase mb-1">获赞</div>
                            <div className="text-[14px] font-semibold text-foreground">
                              {formatNumber(snapshot.likes_count)}
                            </div>
                          </div>
                          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-lg p-2.5">
                            <div className="text-[10px] text-muted-foreground uppercase mb-1">播放/阅读</div>
                            <div className="text-[14px] font-semibold text-foreground">
                              {formatNumber(snapshot.views_count)}
                            </div>
                          </div>
                          <div className="bg-black/[0.03] dark:bg-white/[0.04] rounded-lg p-2.5">
                            <div className="text-[10px] text-muted-foreground uppercase mb-1">作品</div>
                            <div className="text-[14px] font-semibold text-foreground">
                              {formatNumber(snapshot.posts_count)}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-4 text-[12px] text-muted-foreground">
                          点击刷新按钮获取数据
                        </div>
                      )}

                      <a
                        href={account.profile_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 mt-3 pt-3 border-t border-black/[0.06] dark:border-white/[0.08] text-[12px] text-muted-foreground hover:text-orange-500 transition-colors"
                      >
                        <ExternalLink className="h-3 w-3" />
                        访问主页
                      </a>
                    </div>
                  )
                })
              )}
            </div>

            {/* Welcome Card */}
            <div
              className="relative bg-white/50 dark:bg-white/[0.06] border border-black/[0.06] dark:border-white/[0.10] rounded-xl p-5 overflow-hidden transition-colors duration-300 hover:border-orange-500/30 group"
              style={{ opacity: 0, animation: "fadeSlideUp 0.5s ease-out 0.5s forwards" }}
            >
              <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[radial-gradient(circle,rgba(245,166,35,0.08)_0%,transparent_70%)] blur-2xl pointer-events-none group-hover:bg-[radial-gradient(circle,rgba(245,166,35,0.12)_0%,transparent_70%)] transition-[background] duration-700" />
              <div className="absolute inset-0 bg-gradient-to-l from-orange-500/5 via-transparent to-transparent group-hover:from-orange-500/10 transition-[background] duration-500" />
              <div className="relative flex flex-col md:flex-row items-start md:items-center gap-4">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-400/25 to-amber-500/25 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-[16px] font-semibold text-foreground mb-1">社交媒体数据面板</h3>
                  <p className="text-[13px] text-muted-foreground max-w-[500px]">
                    一键获取并追踪你的社交媒体数据，支持 B站、小红书、抖音、微博等平台。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 添加账号对话框 */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>添加社交媒体账号</DialogTitle>
              <DialogDescription>输入你的社交媒体主页链接</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">选择平台</label>
                <Select value={newPlatform} onValueChange={(v) => setNewPlatform(v as SocialPlatform)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {SUPPORTED_PLATFORMS.map((platform) => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: PLATFORM_CONFIG[platform].color }}
                          />
                          {PLATFORM_CONFIG[platform].name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">主页链接</label>
                <Input
                  placeholder={`例如：https://space.bilibili.com/12345678`}
                  value={newProfileUrl}
                  onChange={(e) => setNewProfileUrl(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAddAccount()}
                />
                <p className="text-[11px] text-muted-foreground">
                  粘贴你的个人主页链接，系统会自动抓取数据
                </p>
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                取消
              </Button>
              <Button onClick={handleAddAccount} disabled={saving} className="bg-gradient-to-r from-orange-500 to-amber-500">
                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                添加
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </LayoutWithFullWidth>
    </ProtectedRoute>
  )
}