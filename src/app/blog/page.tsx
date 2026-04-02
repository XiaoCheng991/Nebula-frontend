"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import {
  Calendar,
  Hash,
  Clock,
  ArrowRight,
  Sparkles,
  BookOpen,
  MessageSquare,
  Camera,
  Loader2,
  Mail,
  Link as LinkIcon,
  Star,
} from "lucide-react";
import {
  SiGithub,
  SiXiaohongshu,
  SiBilibili,
  SiTiktok,
  SiX,
  SiDiscord,
  SiInstagram,
} from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AvatarCropDialog } from "@/components/ui/avatar-crop-dialog";
import { useUser } from "@/lib/user-context";
import { getLocalUserInfo } from "@/lib/api";
import { supabase } from "@/lib/supabase/client";
import { uploadAvatar } from "@/lib/api/modules/file";
import { toast } from "@/components/ui/use-toast";
import { useAdminStore } from "@/hooks/useAdminStore";

const socialLinks = [
  { icon: SiGithub, href: "https://github.com/XiaoCheng991", label: "GitHub" },
  { icon: SiBilibili, href: "https://space.bilibili.com/3546566354798756", label: "Bilibili" },
  { icon: SiXiaohongshu, href: "https://www.xiaohongshu.com/user/profile/61e822e9000000001000a517", label: "小红书" },
  { icon: SiTiktok, href: "https://www.douyin.com/user/self?from_tab_name=main&showSubTab=compilation&showTab=favorite_collection", label: "抖音" },
  { icon: Mail, href: "mailto:17516476723@163.com", label: "Email" },
  { icon: LinkIcon, href: "https://www.xiaocheng991.site/me", label: "Website" },
];

const tags = [
  { name: "全栈开发", count: 12 },
  { name: "AI/ML", count: 8 },
  { name: "极客", count: 6 },
  { name: "生活随笔", count: 15 },
  { name: "碎碎念", count: 10 },
];

const githubProjects = [
  { name: "NebulaHub", url: "https://github.com/XiaoCheng991/Nebula-frontend", stars: 1 },
  { name: "DocsifyBlog", url: "https://github.com/XiaoCheng991/Docsify-blog", stars: 1 },
  { name: "TinyURL", url: "https://github.com/XiaoCheng991/TinyURL", stars: 0 },
  { name: "OrangeChain", url: "https://github.com/XiaoCheng991/OrangeChain", stars: 0 },
  { name: "AgentDashboard", url: "https://github.com/XiaoCheng991/AgentDashboard", stars: 0 },
  { name: "OrangeClaw", url: "https://github.com/XiaoCheng991/OrangeClaw", stars: 0 }
];

const memos = [
  {
    id: 1,
    content: "今天终于完成了新项目的架构设计，使用了 Next.js 14 + Spring Boot 的技术栈，感觉性能提升了很多！",
    time: "2 小时前",
    likes: 23,
  },
  {
    id: 2,
    content: "探索了新的 AI 模型，在代码生成方面的表现令人印象深刻。",
    time: "5 小时前",
    likes: 45,
  },
  {
    id: 3,
    content: "周末读了《设计模式》的最新版，发现很多模式在现代框架中已经有了更好的实现方式。",
    time: "1 天前",
    likes: 18,
  },
  {
    id: 4,
    content: "刚完成了一个基于 RAG 的智能问答系统，响应速度和准确率都比预期要好。",
    time: "2 天前",
    likes: 67,
  },
];

const articles = [
  {
    id: 1,
    title: "Next.js 14 新特性深度解析：Server Actions 与 Partial Prerendering",
    excerpt: "Next.js 14 带来了许多令人兴奋的新特性，其中 Server Actions 和 Partial Prerendering 是最具革命性的两个功能...",
    time: "2024-03-20",
    readTime: "8 分钟",
    views: 1234,
  },
  {
    id: 2,
    title: "构建高可用的微服务架构：从单体到分布式的演进之路",
    excerpt: "随着业务的发展，单体应用逐渐暴露出扩展性差、部署困难等问题。本文将分享我们如何将单体应用逐步演进为微服务架构...",
    time: "2024-03-18",
    readTime: "15 分钟",
    views: 2567,
  },
  {
    id: 3,
    title: "AI 辅助编程：让 Copilot 成为你的最佳拍档",
    excerpt: "GitHub Copilot 已经成为许多开发者的得力助手。本文将分享一些实用的技巧，帮助你更好地利用 AI 提升编程效率...",
    time: "2024-03-15",
    readTime: "6 分钟",
    views: 3456,
  },
  {
    id: 4,
    title: "TypeScript 高级类型技巧：泛型、条件类型与类型推断",
    excerpt: "TypeScript 的强大之处在于其类型系统。本文将深入探讨一些高级类型技巧，帮助你编写更类型安全的代码...",
    time: "2024-03-12",
    readTime: "12 分钟",
    views: 1890,
  },
  {
    id: 5,
    title: "周末随笔：编程与生活的平衡之道",
    excerpt: "作为一名开发者，如何在繁忙的工作和生活中找到平衡？分享一些我的心得和实践经验...",
    time: "2024-03-10",
    readTime: "5 分钟",
    views: 987,
  },
];

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

export default function BlogPage() {
  const [activeTab, setActiveTab] = useState<"memos" | "articles">("articles");
  const { user, loading: userLoading } = useUser();
  const { hasAdminAccess, loadAdminData } = useAdminStore();
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // 标记客户端挂载
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // 获取本地用户信息（仅在客户端）
  const localUser = isMounted ? getLocalUserInfo() : null;
  const userId = user?.username || localUser?.id?.toString() || null;
  const userNickname = user?.nickname || localUser?.nickname || "用户";
  const userAvatar = user?.avatarUrl || localUser?.avatarUrl || null;

  // 加载管理员数据
  useEffect(() => {
    if (user && !userLoading) {
      loadAdminData().catch(() => {});
    }
  }, [user, userLoading, loadAdminData]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 验证文件类型
    if (!file.type.startsWith('image/')) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      });
      return;
    }

    // 验证文件大小（10MB）
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过 10MB",
        variant: "destructive",
      });
      return;
    }

    // 保存文件并显示裁剪对话框
    setOriginalFile(file);
    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCropDialog(true);

    // 清空 input
    e.target.value = '';
  };

  const handleCropComplete = async (croppedImageBlob: Blob) => {
    if (!userId) {
      toast({
        title: "错误",
        description: "请先登录",
        variant: "destructive",
      });
      setShowCropDialog(false);
      return;
    }

    setUploading(true);
    setShowCropDialog(false);

    try {
      // 将 Blob 转换为 File 对象
      const file = new File([croppedImageBlob], `avatar_${Date.now()}.jpg`, {
        type: 'image/jpeg',
      });

    const publicUrl = await uploadAvatar(file);


    // 更新 Supabase 用户信息
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        await supabase.auth.updateUser({
          data: { avatar_url: publicUrl }
        });
      }

      // 更新本地存储
      if (localUser) {
        localStorage.setItem('userInfo', JSON.stringify({
          ...localUser,
          avatarUrl: publicUrl,
          avatarName: publicUrl,
        }));
      }

      // 触发刷新
      window.dispatchEvent(new Event('auth-change'));

      toast({
        title: "上传成功",
        description: "头像已更新",
      });
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      toast({
        title: "上传失败",
        description: error.message || "无法上传头像",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      if (selectedImage) {
        URL.revokeObjectURL(selectedImage);
        setSelectedImage(null);
      }
      setOriginalFile(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-transparent to-zinc-100 dark:from-zinc-950 dark:to-zinc-900">
      {/* 主内容区 */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* 自我介绍区 */}
        <section className="mb-8">
          <Card className="border-0 bg-white/90 dark:bg-zinc-900/60 backdrop-blur-xl shadow-lg">
            <CardContent className="p-6">
          <div className="flex items-center justify-between gap-6">
            {/* 左侧：用户信息 */}
            <div className="flex items-center gap-6">
              {/* 超级管理员 XiaoCheng991 */}
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

              {/* 分隔竖线 */}
              <div className="h-10 w-px bg-zinc-200 dark:bg-zinc-700" />

              {/* AI 助手 小薇 */}
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

            {/* 右侧：社交链接 */}
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

          {/* 标签：放在用户信息下方 */}
          <div className="flex items-center gap-1.5 mt-4">
            <span className="text-[14px] font-medium text-zinc-500 dark:text-zinc-400">标签</span>
            {tags.slice(0, 4).map((tag, index) => (
              <Badge
                key={index}
                variant="secondary"
                className="px-2.5 py-1 text-xs font-medium cursor-pointer hover:opacity-80 transition-opacity bg-zinc-200/80 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border-0"
              >
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Github 项目链接 */}
          <div className="flex items-center gap-2 mt-3">
            <SiGithub size={16} className="text-zinc-500 dark:text-zinc-400 flex-shrink-0" />
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
                    {project.stars}
                  </span>
                </a>
              ))}
            </div>
          </div>
            </CardContent>
          </Card>
        </section>


        {/* Memo 横向滚动区 */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">
                <span className="tracking-widest text-xs">MEMO</span>
              </span>
            </div>
            <Link
              href="/memos"
              className="text-xs text-zinc-400 hover:text-primary transition-colors flex items-center gap-1"
            >
              查看全部
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <ScrollArea className="w-full">
            <div className="flex gap-3 pb-4">
              {memos.map((memo) => (
                <a
                  key={memo.id}
                  href={`/memo/${memo.id}`}
                  className="shrink-0 w-64 flex flex-col rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 transition-all overflow-hidden bg-white/80 dark:bg-zinc-900/40"
                >
                  <div className="flex-1 flex flex-col justify-between p-3 min-h-[144px]">
                    <div className="flex-1 overflow-hidden max-h-24">
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 line-clamp-4">
                        {memo.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-2 pt-2 border-t border-zinc-200 dark:border-zinc-700">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userNickname}`}
                        alt={userNickname}
                        className="w-5 h-5 rounded-full"
                      />
                      <div className="flex items-center gap-2 text-xs">
                        <span className="font-medium text-zinc-700 dark:text-zinc-300">
                          {userNickname}
                        </span>
                        <span className="text-zinc-400">{memo.time}</span>
                      </div>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* 文章列表区 */}
        <section>
          {/* 标签切换 */}
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant={activeTab === "articles" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("articles")}
              className="gap-1"
            >
              <BookOpen className="h-3.5 w-3.5" />
              文章
            </Button>
            <Button
              variant={activeTab === "memos" ? "default" : "ghost"}
              size="sm"
              onClick={() => setActiveTab("memos")}
              className="gap-1"
            >
              <MessageSquare className="h-3.5 w-3.5" />
              动态
            </Button>
          </div>

          <div className="space-y-2">
            {articles.map((article) => (
              <a
                key={article.id}
                href={`/blog/${article.id}`}
                className="group flex items-start justify-between gap-4 py-4 border-b border-zinc-200 dark:border-zinc-800 hover:border-primary/20 dark:hover:border-primary/30 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-zinc-900 dark:text-zinc-100 group-hover:text-primary transition-colors line-clamp-2 mb-1">
                    {article.title}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 mb-2">
                    {article.excerpt}
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <img
                        src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${userNickname}`}
                        alt={userNickname}
                        className="w-4 h-4 rounded-full"
                      />
                      <span className="text-xs text-zinc-500 dark:text-zinc-400">
                        {userNickname}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-zinc-400" />
                      <span className="text-xs text-zinc-400">{article.time}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="h-3 w-3 text-zinc-400" />
                      <span className="text-xs text-zinc-400">{article.readTime}</span>
                    </div>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-zinc-300 dark:text-zinc-600 group-hover:text-primary group-hover:translate-x-1 transition-all flex-shrink-0" />
              </a>
            ))}
          </div>

          {/* 加载更多 */}
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" className="gap-2">
              <BookOpen className="h-4 w-4" />
              加载更多文章
            </Button>
          </div>
        </section>

        {/* 页脚 */}
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
    </div>
  );
}
