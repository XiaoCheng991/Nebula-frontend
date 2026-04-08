"use client";

import Link from "next/link";
import React, { useState, useEffect } from "react";
import {
  Calendar,
  Hash,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  MessageSquare,
  Camera,
  Star,
  Plus,
  ExternalLink,
  Link2,
  Trash2,
  BookmarkPlus,
} from "lucide-react";
import { IconGitHub, IconBilibili, IconXiaohongshu, IconTiktok, IconX, IconMail, IconLink } from "@/components/branding/social-icons";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AvatarCropDialog } from "@/components/ui/avatar-crop-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/user-context";
import { getLocalUserInfo } from "@/lib/api";
import { supabase } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/api/modules/file";
import { toast } from "@/components/ui/use-toast";
import { usePagePermission } from "@/hooks/useAppStore";
import { getArticles, getTags as getApiTags } from "@/lib/supabase/modules/blog";
import { getMemos } from "@/lib/supabase/modules/memo";
import { MarkdownPreview } from "@/components/ui/markdown-preview";

const socialLinks = [
  { icon: IconGitHub, href: "https://github.com/XiaoCheng991", label: "GitHub" },
  { icon: IconBilibili, href: "https://space.bilibili.com/3546566354798756", label: "Bilibili" },
  { icon: IconXiaohongshu, href: "https://www.xiaohongshu.com/user/profile/61e822e9000000001000a517", label: "小红书" },
  { icon: IconTiktok, href: "https://www.douyin.com/user/self?from_tab_name=main&showSubTab=compilation&showTab=favorite_collection", label: "抖音" },
  { icon: IconMail, href: "mailto:17516476723@163.com", label: "Email" },
  { icon: IconLink, href: "https://www.xiaocheng991.site/me", label: "Website" },
];

const GITHUB_OWNER = "XiaoCheng991";

const githubProjects = [
  { name: "NebulaHub", url: "https://github.com/XiaoCheng991/Nebula-frontend" },
  { name: "DocsifyBlog", url: "https://github.com/XiaoCheng991/Docsify-blog" },
  { name: "TinyURL", url: "https://github.com/XiaoCheng991/TinyURL" },
  { name: "OrangeChain", url: "https://github.com/XiaoCheng991/OrangeChain" },
  { name: "AgentDashboard", url: "https://github.com/XiaoCheng991/AgentDashboard" },
  { name: "OrangeClaw", url: "https://github.com/XiaoCheng991/OrangeClaw" }
];

function getRepoPath(url: string): string {
  return url.replace("https://github.com/", "");
}

// 固定的超级管理员信息
const ADMIN_INFO = {
  username: "XiaoCheng991",
  nickname: "XiaoCheng991",
  role: "全栈+AI",
  avatarUrl: "/avatars/xiaocheng991.jpeg",
};

// 固定的 AI 助手信息
const AI_ASSISTANT_INFO = {
  name: "小薇",
  poweredBy: "powered by OpenClaw",
  avatarUrl: "/avatars/xiaowei.jpg",
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffMin < 60) return `${diffMin} 分钟前`;
  if (diffHour < 24) return `${diffHour} 小时前`;
  if (diffDay < 7) return `${diffDay} 天前`;
  return date.toLocaleDateString("zh-CN");
}

function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("zh-CN");
}

/**
 * 截断文本，超长部分添加省略号
 */
function truncateText(text: string, maxLen: number): string {
  if (!text || text.length <= maxLen) return text;
  return text.slice(0, maxLen).trim() + '...';
}

export default function BlogPage() {
  const { user, loading: userLoading, refreshUser: refreshUserContext } = useUser();
  const { hasAdminAccess, blogWritePerm, memoWritePerm } = usePagePermission();
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const dataFetchedRef = React.useRef(false);
  const [starCounts, setStarCounts] = useState<Record<string, number>>({});
  const [memos, setMemos] = useState<any[]>([]);
  const [articles, setArticles] = useState<any[]>([]);
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [tags, setTags] = useState<any[]>([]);
  const [memosLoading, setMemosLoading] = useState(true);
  const [articlesLoading, setArticlesLoading] = useState(true);
  const [tagsLoading, setTagsLoading] = useState(true);
  const [showBookmarkDialog, setShowBookmarkDialog] = useState(false);
  const [bookmarkTitle, setBookmarkTitle] = useState('');
  const [bookmarkUrl, setBookmarkUrl] = useState('');
  useEffect(() => {
    setIsMounted(true);

    if (dataFetchedRef.current) return;
    dataFetchedRef.current = true;

    (async () => {
      const [memosRes, articlesRes, tagsRes] = await Promise.allSettled([
        getMemos({ page: 1, pageSize: 4, visibility: "PUBLIC" }),
        getArticles({ page: 1, pageSize: 10, orderBy: "create_time" }),
        getApiTags(),
      ]);

      if (memosRes.status === "fulfilled") {
        const memos = memosRes.value.data || []
        // Fetch user info for memos
        const userIds = [...new Set(memos.map((m: any) => m.user_id))]
        const { data: users } = await supabase
          .from('sys_users')
          .select('id, nickname, username, avatar_url, email')
          .in('id', userIds)
        const userMap = new Map(users?.map((u: any) => [u.id, u]) || [])
        const memosWithUsers = memos.map((memo: any) => ({
          ...memo,
          sys_users: userMap.get(memo.user_id) || null,
        }))
        setMemos(memosWithUsers)
      }
      if (articlesRes.status === "fulfilled") setArticles(articlesRes.value.data || []);
      if (tagsRes.status === "fulfilled") setTags(tagsRes.value.data || []);

      // Load bookmarks from localStorage
      try {
        const stored = localStorage.getItem('blog_bookmarks');
        if (stored) setBookmarks(JSON.parse(stored));
      } catch {}

      setMemosLoading(false);
      setArticlesLoading(false);
      setTagsLoading(false);
    })();
  }, []);

  // 动态获取 GitHub Stars（单次批请求）
  useEffect(() => {
    if (!isMounted) return;
    const fetchStars = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/users/${GITHUB_OWNER}/repos?per_page=100`
        );
        const allRepos: { full_name: string; stargazers_count: number }[] = await res.json();
        const counts: Record<string, number> = {};
        for (const project of githubProjects) {
          const target = getRepoPath(project.url).toLowerCase();
          const match = allRepos.find(
            (r) => r.full_name.toLowerCase() === target
          );
          counts[project.url] = match?.stargazers_count ?? 0;
        }
        setStarCounts(counts);
      } catch {
        // fallback: 逐个请求
        const results = await Promise.allSettled(
          githubProjects.map(async (project) => {
            const repo = getRepoPath(project.url);
            const res = await fetch(`https://api.github.com/repos/${repo}`);
            if (!res.ok) return -1;
            const data = await res.json();
            return data.stargazers_count ?? 0;
          })
        );
        const counts: Record<string, number> = {};
        githubProjects.forEach((p, i) => {
          if (results[i].status === "fulfilled" && results[i].value >= 0) {
            counts[p.url] = results[i].value;
          }
        });
        setStarCounts(counts);
      }
    };
    fetchStars();
  }, [isMounted]);

  // 获取本地用户信息（仅在客户端）
  const localUser = isMounted ? getLocalUserInfo() : null;
  const userId = user?.username || localUser?.id?.toString() || null;
  const userNickname = user?.nickname || localUser?.nickname || "用户";
  const userAvatar = user?.avatarUrl || localUser?.avatarUrl || null;

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: "文件类型错误", description: "请上传图片文件", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "文件过大", description: "图片大小不能超过 10MB", variant: "destructive" });
      return;
    }

    setOriginalFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCropDialog(true);
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!userId) {
      toast({ title: '误', description: "请先登录", variant: "destructive" });
      setShowCropDialog(false);
      return;
    }

    setUploading(true);
    setShowCropDialog(false);

    try {
      const file = new File([croppedImageBlob], `avatar_${Date.now()}.jpg`, { type: 'image/jpeg' });
      const publicUrl = await uploadAvatar(file);

      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        await supabase.auth.updateUser({ data: { avatar_url: publicUrl } });

        // 查找并更新 sys_users 中的头像（按 username 匹配）
        const userUsername = supabaseUser.user_metadata?.login
          || supabaseUser.user_metadata?.username
          || supabaseUser.user_metadata?.name
          || localUser?.username;
        if (userUsername) {
          const { data: existingUser } = await supabase
            .from('sys_users')
            .select('id, avatar_url')
            .eq('username', userUsername)
            .maybeSingle();

          if (existingUser) {
            await supabase
              .from('sys_users')
              .update({ avatar_url: publicUrl })
              .eq('id', existingUser.id);
          }
        }
      }

      if (localUser) {
        const newLocalUser = {
          ...localUser,
          avatarUrl: publicUrl,
          avatarName: publicUrl,
        };
        localStorage.setItem('userInfo', JSON.stringify(newLocalUser));
      }

      // 刷新顶部导航栏头像
      if (refreshUserContext) {
        await refreshUserContext();
      }

      window.dispatchEvent(new Event('auth-change'));
      toast({ title: "上传成功", description: "头像已更新" });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({ title: "上传失败", description: error.message || "无法上传头像", variant: "destructive" });
    } finally {
      setUploading(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
      setOriginalFile(null);
    }
  };

  const saveBookmarks = (newBookmarks: any[]) => {
    setBookmarks(newBookmarks);
  };

  const handleAddBookmark = async () => {
    if (!bookmarkUrl.trim()) {
      toast({ title: '提示', description: '请输入链接地址', variant: 'destructive' });
      return;
    }

    if (!userId) {
      toast({ title: '提示', description: '请先登录', variant: 'destructive' });
      return;
    }

    const newBookmark = {
      title: bookmarkTitle.trim() || bookmarkUrl.trim(),
      url: bookmarkUrl.trim(),
      user_id: Number(userId),
    };

    try {
      const { data, error } = await addWebsiteCollection(newBookmark);
      if (error) throw error;

      setBookmarks(prev => [...prev, data]);
      setBookmarkTitle('');
      setBookmarkUrl('');
      setShowBookmarkDialog(false);
      toast({ title: '已收藏', description: '精选文章已保存' });
    } catch (err: any) {
      toast({ title: '错误', description: err.message || '保存失败', variant: 'destructive' });
    }
  };

  const handleDeleteBookmark = async (id: number) => {
    try {
      const success = await deleteWebsiteCollection(id);
      if (success) {
        setBookmarks(prev => prev.filter(bm => bm.id !== id));
        toast({ title: '已删除', description: '收藏已移除' });
      } else {
        throw new Error('删除失败');
      }
    } catch (err: any) {
      toast({ title: '错误', description: err.message || '删除失败', variant: 'destructive' });
    }
  };

  const handleWriteBlog = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "未登录", description: "请先登录后再发布博客", variant: "destructive" });
      return;
    }
    if (blogWritePerm !== 'all' && !hasAdminAccess) {
      toast({ title: "无权限", description: "当前仅管理员可发布博客", variant: "destructive" });
      return;
    }
    window.location.href = "/blog/write";
  };

  const handleWriteMemo = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!userId) {
      toast({ title: "未登录", description: "请先登录后再发布动态", variant: "destructive" });
      return;
    }
    if (memoWritePerm !== 'all' && !hasAdminAccess) {
      toast({ title: "无权限", description: "当前仅管理员可发布动态", variant: "destructive" });
      return;
    }
    window.location.href = "/memo/write";
  };

  // 三列分配：Latest / 我的文章 / OpenClaw的文章
  const latestArticle = articles[0] || null;
  const myArticles = articles.filter((a) => a.author_name === userNickname);
  const aiArticles = articles.filter((a) => a.author_name === AI_ASSISTANT_INFO.name);

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 pt-24 pb-8">
        {/* 自我介绍区 */}
        <section className="mb-4">
          <Card className="border-0 bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            {/* 左侧：用户信息 */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <UserAvatar
                    avatarUrl={ADMIN_INFO.avatarUrl}
                    nickname={ADMIN_INFO.nickname}
                    size="lg"
                    className={`w-10 h-10 border-2 border-orange-300 dark:border-orange-700 transition-transform duration-300 ${hasAdminAccess ? 'hover:scale-110 cursor-pointer' : ''}`}
                  />
                  {hasAdminAccess && (
                    <>
                      <label htmlFor="me-avatar-upload" className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                        <Camera className="w-4 h-4 text-white" />
                      </label>
                      <input
                        id="me-avatar-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleAvatarUpload}
                        disabled={uploading}
                      />
                    </>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {ADMIN_INFO.username}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {ADMIN_INFO.role}
                  </div>
                </div>
              </div>

              <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-700" />

              <div className="flex items-center gap-3">
                <UserAvatar
                  avatarUrl={AI_ASSISTANT_INFO.avatarUrl}
                  nickname={AI_ASSISTANT_INFO.name}
                  size="lg"
                  className="w-10 h-10 border-2 border-purple-300 dark:border-purple-700 transition-transform duration-300 hover:scale-110"
                />
                <div>
                  <div className="font-bold text-sm text-purple-600 dark:text-purple-400">
                    {AI_ASSISTANT_INFO.name}
                  </div>
                  <div className="text-xs text-zinc-500 dark:text-zinc-400">
                    {AI_ASSISTANT_INFO.poweredBy}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              {socialLinks.map((social, index) => (
                <a
                  key={index}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-md text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  title={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mt-4">
            <span className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">标签</span>
            {tagsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-5 w-12 rounded-full" />
              ))
            ) : tags.slice(0, 4).map((tag) => (
              <Badge
                key={tag.id}
                variant="secondary"
                className="px-2.5 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-0"
              >
                {tag.tag_name}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-2 mt-3">
            <IconGitHub size={16} className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
            <div className="flex items-center gap-1.5 flex-wrap">
              {githubProjects.map((project) => (
                <a
                  key={project.name}
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
                >
                  <span>{project.name}</span>
                  <span className="flex items-center gap-0.5 text-zinc-400">
                    <Star size={10} />
                    {starCounts[project.url] ?? "-"}
                  </span>
                </a>
              ))}
            </div>
          </div>
            </CardContent>
          </Card>
        </section>

        {/* Memo 横向滚动区 */}
        <section className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <span className="tracking-widest text-xs">MEMO</span>
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleWriteMemo}
                className="group flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <MessageSquare className="h-3 w-3 group-hover:text-primary transition-colors" />
                写动态
              </button>
              <Link
                href="/memos"
                className="text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-3 pt-0 pb-0">
              {memosLoading ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="shrink-0 w-64 flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/40">
                    <div className="flex-1 flex flex-col justify-between p-3 min-h-[144px]">
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-3/4 mb-2" />
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <Skeleton className="w-5 h-5 rounded-full" />
                        <Skeleton className="h-3 w-16" />
                      </div>
                    </div>
                  </div>
                ))
              ) : memos.length === 0 ? (
                <p className="text-xs text-zinc-400">暂无动态</p>
              ) : memos.map((memo) => {
                // 如果 memo 是当前用户的，用顶部导航栏的最新头像，否则用 sys_users 的
                const currentUsername = user?.username || localUser?.username
                const isCurrentUser = memo.sys_users?.username === currentUsername
                const memoAvatarUrl = isCurrentUser
    ? (user?.avatarUrl || memo.sys_users?.avatar_url || null)
    : (memo.sys_users?.avatar_url || null)
                // Split mood from content
                const lines = memo.content.split('\n\n')
                const moodLine = lines.find((l: string) => l.startsWith('心情：'))
                const moodContent = moodLine ? moodLine.replace('心情：', '') : ''
                const textContent = lines.filter((l: string) => !l.startsWith('心情：')).join('\n\n')

                return (
                  <Link
                    key={memo.id}
                    href={`/memo/${memo.id}`}
                    className="shrink-0 w-64 flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all overflow-hidden bg-white/80 dark:bg-zinc-900/40 cursor-pointer no-underline text-inherit"
                  >
                    <div className="flex-1 flex flex-col justify-between p-3 min-h-[144px]">
                      <div className="flex-1 overflow-hidden">
                        {/* Image */}
                        {memo.image_urls?.[0] && (
                          <img
                            src={memo.image_urls[0]}
                            alt=""
                            className="w-full h-20 object-cover rounded-md mb-2"
                          />
                        )}
                        {/* Text */}
                        <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-3">
                          {textContent}
                        </p>
                        {/* Mood */}
                        {moodContent && (
                          <p className="text-[10px] text-orange-500 mt-1">{moodContent}</p>
                        )}
                      </div>
                      {/* Author */}
                      <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                        <UserAvatar
                          avatarUrl={memoAvatarUrl}
                          nickname={memo.sys_users?.nickname}
                          size="sm"
                          className="w-5 h-5"
                        />
                        <div className="flex items-center gap-2 text-xs">
                          <span className="font-medium text-zinc-700 dark:text-zinc-300">
                            {memo.sys_users?.nickname || memo.sys_users?.username || '用户'}
                          </span>
                          <span className="text-zinc-400">{formatTimeAgo(memo.create_time)}</span>
                        </div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </ScrollArea>
        </section>

        {/* 博客列表区 - 三列布局 */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                Blog
              </span>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleWriteBlog}
                className="group flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-medium text-zinc-600 dark:text-zinc-300 bg-white dark:bg-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-700 rounded-full border border-zinc-200 dark:border-zinc-700 shadow-sm hover:shadow transition-all cursor-pointer"
              >
                <Plus className="h-3 w-3 group-hover:text-primary transition-colors" />
                写博客
              </button>
              <Link
                href="/blogs"
                className="text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1"
              >
                查看全部
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {articlesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* 第一列骨架 */}
              <div className="md:pr-6 md:border-r border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/60 p-4 space-y-3">
                  <Skeleton className="h-3 w-20" />
                  <Skeleton className="h-5 w-full" />
                  <Skeleton className="h-4 w-4/5" />
                  <Skeleton className="h-3 w-24" />
                </div>
                {Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/40 space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                ))}
              </div>
              {/* 第二列骨架 */}
              <div className="md:px-6 md:border-r border-zinc-200 dark:border-zinc-700 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 rounded space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-3/4" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                ))}
              </div>
              {/* 第三列骨架 */}
              <div className="md:pl-6 space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="p-3 rounded space-y-2">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-2.5 w-3/4" />
                    <Skeleton className="h-2.5 w-16" />
                  </div>
                ))}
              </div>
            </div>
          ) : articles.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <BookOpen className="h-10 w-10 text-zinc-300 dark:text-zinc-600 mx-auto mb-3" />
                <p className="text-sm text-zinc-400">暂无文章</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3">
              {/* 第一列：Latest (大字首篇 + 其余按时间) */}
              <div className="md:pr-6 md:border-r border-zinc-200 dark:border-zinc-700 space-y-3">
                {latestArticle ? (
                  <>
                    {/* 第一篇大字 */}
                    <a
                      href={`/blog/${latestArticle.slug || latestArticle.id}`}
                      className="group block rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white/80 dark:bg-zinc-900/60 p-4 hover:border-primary/30 dark:hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-1 mb-3">
                        <span className="text-[10px] font-medium text-zinc-400 uppercase tracking-wider">
                          Latest
                        </span>
                        <span className="text-[10px] text-zinc-400">·</span>
                        <span className="text-[10px] text-zinc-400">
                          {latestArticle.create_time ? formatDateShort(latestArticle.create_time) : ""}
                        </span>
                      </div>
                      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors leading-snug mb-2">
                        {latestArticle.title}
                      </h3>
                      <div className="text-sm text-zinc-500 dark:text-zinc-400 line-clamp-3 mb-3">
                        <MarkdownPreview content={latestArticle.summary || latestArticle.content} maxLen={150} />
                        {!latestArticle.summary && !latestArticle.content && "暂无摘要"}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        <span>{latestArticle.view_count || 0} 阅读</span>
                      </div>
                    </a>
                    {/* 其余按时间 */}
                    {articles.slice(1).map((article) => (
                      <a
                        key={article.id}
                        href={`/blog/${article.slug || article.id}`}
                        className="group block p-3 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-primary/30 dark:hover:border-primary/40 transition-colors bg-white/60 dark:bg-zinc-900/40"
                      >
                        <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-3 mb-1.5">
                          {article.title}
                        </h4>
                        <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                          <Calendar className="h-3 w-3" />
                          <span>{article.create_time ? formatDateShort(article.create_time) : ""}</span>
                        </div>
                      </a>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-zinc-400 py-4">暂无内容</p>
                )}
              </div>

              {/* 第二列：我的精选 */}
              <div className="md:px-6 md:border-r border-zinc-200 dark:border-zinc-700 space-y-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-medium text-orange-400 uppercase tracking-wider">
                    Bookmarks
                  </span>
                  <button
                    onClick={() => setShowBookmarkDialog(true)}
                    className="text-zinc-400 hover:text-orange-500 transition-colors"
                    title="添加精选"
                  >
                    <BookmarkPlus className="h-3.5 w-3.5" />
                  </button>
                </div>
                {bookmarks.length > 0 ? (
                  bookmarks.map((bm, i) => (
                    <div
                      key={i}
                      className="group flex items-start gap-2 p-2.5 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <a
                        href={bm.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 min-w-0 group/link"
                      >
                        <div className="flex items-center gap-1 mb-1">
                          <Link2 className="h-3 w-3 text-zinc-400 group-hover/link:text-orange-500 transition-colors flex-shrink-0" />
                          <span className="text-xs font-medium text-zinc-800 dark:text-zinc-200 group-hover/link:text-primary transition-colors line-clamp-2 truncate">
                            {bm.title}
                          </span>
                          <ExternalLink className="h-3 w-3 text-zinc-300 group-hover/link:text-orange-400 transition-colors flex-shrink-0 ml-auto" />
                        </div>
                        <p className="text-[10px] text-zinc-400 truncate">
                          {bm.url.replace(/^https?:\/\//, '').split('/')[0]}
                        </p>
                      </a>
                      <button
                        onClick={() => handleDeleteBookmark(i)}
                        className="text-zinc-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0 mt-0.5"
                        title="删除"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 py-4">暂无精选，点击上方按钮添加</p>
                )}
              </div>

              {/* 第三列：小薇的文章 */}
              <div className="md:pl-6 space-y-3">
                {aiArticles.length > 0 ? (
                  aiArticles.map((article) => (
                    <a
                      key={article.id}
                      href={`/blog/${article.slug || article.id}`}
                      className="group block p-3 rounded hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <h4 className="text-xs font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-3 mb-1.5">
                        {article.title}
                      </h4>
                      <div className="text-[11px] text-zinc-400 line-clamp-2 mb-1.5">
                        <MarkdownPreview content={article.summary || article.content} maxLen={80} />
                        {!article.summary && !article.content && "暂无摘要"}
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400">
                        <Calendar className="h-3 w-3" />
                        <span>{article.create_time ? formatDateShort(article.create_time) : ""}</span>
                      </div>
                    </a>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 py-4">暂无文章</p>
                )}
              </div>
            </div>
          )}
        </section>

        <footer className="mt-16 py-8 border-t border-zinc-200 dark:border-zinc-800">
          <div className="text-center">
            <p className="text-xs text-zinc-400 dark:text-zinc-500">
              © 2024 NebulaHub. Made with ♥ by {userNickname} & Nebula
            </p>
          </div>
        </footer>
      </main>

      {/* 头像裁剪对话框 */}
      {selectedImage && (
        <AvatarCropDialog
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* 添加精选对话框 */}
      <Dialog open={showBookmarkDialog} onOpenChange={setShowBookmarkDialog}>
        <DialogContent onOpenAutoFocus={(e) => e.preventDefault()} className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>添加精选文章</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">文章链接</label>
              <input
                value={bookmarkUrl}
                onChange={(e) => setBookmarkUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:border-orange-500 dark:focus:border-orange-500"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">标题（可选）</label>
              <input
                value={bookmarkTitle}
                onChange={(e) => setBookmarkTitle(e.target.value)}
                placeholder="留空则使用链接地址作为标题"
                className="w-full px-3 py-2 text-sm rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent outline-none focus:border-orange-500 dark:focus:border-orange-500"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => { setShowBookmarkDialog(false); setBookmarkTitle(''); setBookmarkUrl(''); }}>
                取消
              </Button>
              <Button size="sm" onClick={handleAddBookmark}>
                <Link2 className="h-3.5 w-3.5 mr-1" />
                收藏
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
