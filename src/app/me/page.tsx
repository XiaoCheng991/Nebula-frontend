"use client";

import { useState, useEffect } from "react";
import {
  Github,
  Mail,
  Calendar,
  Clock,
  ArrowRight,
  Phone,
  MapPin,
  ExternalLink,
  Send,
} from "lucide-react";
import { UserAvatar } from "@/components/ui/user-avatar";
import { AvatarCropDialog } from "@/components/ui/avatar-crop-dialog";
import { useUser } from "@/lib/user-context";
import { getLocalUserInfo } from "@/lib/api";
import { supabase, uploadAvatar, deleteAvatar } from "@/lib/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { useAdminStore } from "@/hooks/useAdminStore";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const socialLinks = [
  {
    icon: Github,
    href: "https://github.com/XiaoCheng991",
    label: "GitHub",
  },
  {
    icon: Mail,
    href: "mailto:17516476723@163.com",
    label: "Email",
  },
  {
    icon: ExternalLink,
    href: "https://blog.csdn.net/qq_60985619?type=blog",
    label: "CSDN",
  },
  {
    icon: ExternalLink,
    href: "https://gitee.com/XiaoCheng991",
    label: "Gitee",
  },
];

const skills = [
  {
    category: "后端开发",
    items: ["Java", "SpringBoot / SpringCloud", "MyBatis / MyBatis-Plus", "MySQL / Redis"],
  },
  {
    category: "AI / ML",
    items: ["Python", "LangChain", "OpenClaw", "多模态大模型"],
  },
  {
    category: "前端",
    items: ["JavaScript", "TypeScript", "HTML / CSS", "React"],
  },
  {
    category: "DevOps",
    items: ["Docker", "Git / GitLab", "Linux", "Jenkins CI/CD"],
  },
  {
    category: "大数据",
    items: ["Spark", "达梦 DM8", "数据治理", "数据可视化"],
  },
  {
    category: "其他",
    items: ["Go (Gin)", "RabbitMQ / Quartz", "MinIO / EazyExcel", "K8s 基础"],
  },
];

const experiences = [
  {
    company: "大型电商集团",
    period: "2025.07 ~ 至今",
    role: "IT 研发总部 · 商品研发中心 · 全栈开发工程师",
    descriptions: [
      "作为集团管培生，8 个月内完成全链路岗位培训，荣获 2025 年度<strong>优秀员工奖</strong>（全部门 TOP10%）",
      "驻场国际知名快餐企业总部参与供应链主数据中台项目，获得甲方领导书面认可",
      "设计 OpenClaw 多 Agent 分工体系，采购订单导出效率提升 60%",
      "直连商品中台提供实时库存/价格查询，响应时间 ≤500ms",
    ],
    tags: ["Java", "OpenClaw", "LangChain"],
    tagColors: ["tag-blue", "tag-green", "tag-purple"],
  },
  {
    company: "AI 科技企业",
    period: "2024.05 ~ 2024.11",
    role: "创新产品部 · Java 开发工程师",
    descriptions: [
      "负责高校教育平台、教考分离平台等 3 个核心系统的后端研发",
      "运用 EazyExcel + MinIO 处理文件导出 5000+ 次，导出效率提升 40%",
      "重构核心模块，响应速度提升 20%，代码可读性提升 50%",
      "交付健壮接口 80+ 个，接口调用成功率 99.9%，项目按期交付率 100%",
    ],
    tags: ["SpringBoot", "MyBatis", "Docker"],
    tagColors: ["tag-blue", "tag-green", "tag-orange"],
  },
];

const projects = [
  {
    name: "供应链主数据中台",
    status: "进行中",
    statusType: "active",
    description:
      "国际知名快餐企业供应链主数据中台化建设项目，重塑统一规范的主数据管理体系，服务全国 1500+ 门店。绘制 BPMN 流程图 30+ 张，完成 10+ 个 TMS 品类树接口开发，响应时间≤300ms。",
    tags: ["Java", "数据中台", "供应链"],
    tagColors: ["tag-blue", "tag-green", "tag-orange"],
  },
  {
    name: "高校教育综合平台",
    status: "已上线",
    statusType: "active",
    description:
      "AI 科技企业自主研发的高校教育综合平台，覆盖 20+ 所高校，用户 5000+ 人。负责智能组卷、在线考试、数据可视化大屏等核心模块，支撑 5000+ 人次在线考试，稳定性 99.9%。",
    tags: ["SpringCloud", "Redis", "RabbitMQ", "Quartz"],
    tagColors: ["tag-blue", "tag-green", "tag-orange", "tag-purple"],
  },
  {
    name: "基于达梦云原生的物流数据中台",
    status: "已完成",
    statusType: "building",
    description:
      "中国软件杯大学生软件设计大赛 A5 赛题，基于达梦云原生大数据平台的物流数据中台系统。数据治理准确率 99.5%，Spark 优化后处理效率提升 30%。",
    tags: ["Spark", "DM8", "大数据"],
    tagColors: ["tag-blue", "tag-green", "tag-purple"],
  },
  {
    name: "Clawra · AI 情感化助手",
    status: "运行中",
    statusType: "active",
    description:
      "基于 OpenClaw 的个人 AI 助手项目，三层记忆系统 + 行为调节层（三级双螺旋进化结构）。目标：让 AI 真的能'感受'，而不只是模拟情感表达。",
    tags: ["OpenClaw", "LangChain", "AI Agent"],
    tagColors: ["tag-green", "tag-purple", "tag-blue"],
  },
];

export default function MePage() {
  const { user, loading: userLoading } = useUser();
  const { hasAdminAccess, loadAdminData } = useAdminStore();
  const [showCropDialog, setShowCropDialog] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const localUser = isMounted ? getLocalUserInfo() : null;
  const userId = user?.username || localUser?.id?.toString() || null;
  const userNickname = user?.nickname || localUser?.nickname || "程永强";
  const userAvatar = user?.avatarUrl || localUser?.avatarUrl || null;

  useEffect(() => {
    if (user && !userLoading) {
      loadAdminData().catch(() => {});
    }
  }, [user, userLoading, loadAdminData]);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "文件类型错误",
        description: "请上传图片文件",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "文件过大",
        description: "图片大小不能超过 10MB",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setSelectedImage(imageUrl);
    setShowCropDialog(true);
    e.target.value = "";
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
      const file = new File([croppedImageBlob], `avatar_${Date.now()}.jpg`, {
        type: "image/jpeg",
      });

      const { path, url } = await uploadAvatar(file, String(userId));

      if (userAvatar && userAvatar.includes("/avatar/")) {
        const oldPath = userAvatar.split("/").pop() || "";
        if (oldPath) {
          await deleteAvatar(oldPath);
        }
      }

      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      if (supabaseUser) {
        await supabase.auth.updateUser({
          data: { avatar_url: url },
        });
      }

      if (localUser) {
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            ...localUser,
            avatarUrl: url,
            avatarName: path,
          })
        );
      }

      window.dispatchEvent(new Event("auth-change"));

      toast({
        title: "上传成功",
        description: "头像已更新",
      });
    } catch (error: any) {
      console.error("Avatar upload error:", error);
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
    }
  };

  return (
    <div className="min-h-screen bg-[--bg] color-[--text]">
      <style jsx global>{`
        :root {
          --bg: #0a0a0a;
          --bg2: #111111;
          --bg3: #1a1a1a;
          --card: #141414;
          --border: #222;
          --text: #e5e5e5;
          --text2: #999;
          --text3: #666;
          --accent: #3b82f6;
          --accent2: #60a5fa;
          --green: #22c55e;
          --orange: #f59e0b;
          --purple: #a855f7;
          --radius: 12px;
        }

        .tag {
          display: inline-block;
          padding: 2px 8px;
          font-size: 11px;
          border-radius: 4px;
          font-weight: 500;
          margin-right: 4px;
          margin-top: 8px;
        }
        .tag-blue {
          background: rgba(59, 130, 246, 0.15);
          color: var(--accent2);
        }
        .tag-green {
          background: rgba(34, 197, 94, 0.15);
          color: var(--green);
        }
        .tag-orange {
          background: rgba(245, 158, 11, 0.15);
          color: var(--orange);
        }
        .tag-purple {
          background: rgba(168, 85, 247, 0.15);
          color: var(--purple);
        }

        .fade-in {
          opacity: 0;
          transform: translateY(20px);
          transition: opacity 0.6s, transform 0.6s;
        }
        .fade-in.visible {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>

      <div className="max-w-[900px] mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="min-h-[100vh] flex flex-col justify-center relative fade-in">
          <div
            className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none"
          />
          <div className="text-[#3b82f6] font-medium tracking-[2px] text-sm uppercase mb-4">
            Hello, I'm
          </div>
          <h1 className="text-[clamp(40px,7vw,72px)] font-bold leading-tight mb-2 bg-gradient-to-r from-white to-[#999] bg-clip-text text-transparent">
            程永强
          </h1>
          <p className="text-[clamp(20px,3vw,28px)] text-[#999] font-light mb-6">
            <span className="text-[#60a5fa] font-medium">Java + AI</span> 开发
          </p>
          <p className="text-[16px] text-[#666] max-w-[560px] leading-relaxed mb-8">
            河南工业大学 · 数据科学与大数据技术<br />
            曾就职于 AI 科技企业，目前在大型零售业集团做全栈开发<br />
            正在从 Java 向 AI 迈进，目标：让代码不只是代码
          </p>
          <div className="flex gap-3 flex-wrap">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border border-[#222] bg-[#111111] text-[#e5e5e5] hover:border-[#3b82f6] hover:text-[#60a5fa]"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
            <a
              href="tel:17516476723"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all bg-[#3b82f6] border border-[#3b82f6] text-white hover:bg-[#2563eb]"
            >
              <Phone className="w-4 h-4" />
              17516476723
            </a>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20 fade-in">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[#3b82f6] uppercase mb-10 flex items-center gap-3">
            工作经历
            <span className="flex-1 h-[1px] bg-[#222]" />
          </h2>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#3b82f6] to-[#a855f7] to-transparent" />
            {experiences.map((exp, idx) => (
              <div key={idx} className="pl-8 mb-12 relative">
                <div className="absolute left-[-5px] top-3 w-3 h-3 rounded-full bg-[#3b82f6] border-[3px] border-[#0a0a0a]" />
                <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                  <span className="text-[20px] font-bold text-white">
                    {exp.company}
                  </span>
                  <span className="text-[13px] text-[#666] font-mono px-2.5 py-1 bg-[#1a1a1a] rounded">
                    {exp.period}
                  </span>
                </div>
                <div className="text-[14px] text-[#60a5fa] mb-3">{exp.role}</div>
                <ul className="text-[14px] text-[#999] space-y-2">
                  {exp.descriptions.map((desc, i) => (
                    <li key={i} className="relative pl-4">
                      <span className="absolute left-0 text-[#3b82f6]">→</span>
                      <span dangerouslySetInnerHTML={{ __html: desc }} />
                    </li>
                  ))}
                </ul>
                <div className="mt-2">
                  {exp.tags.map((tag, i) => (
                    <span
                      key={i}
                      className={`tag ${exp.tagColors[i] || "tag-blue"}`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Projects Section */}
        <section className="py-20 fade-in">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[#3b82f6] uppercase mb-10 flex items-center gap-3">
            项目经历
            <span className="flex-1 h-[1px] bg-[#222]" />
          </h2>
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="bg-[#141414] border border-[#222] rounded-[12px] p-7 mb-4 transition-all hover:border-[#3b82f6]"
            >
              <div className="text-[18px] font-bold text-white mb-1">
                {project.name}
              </div>
              <span
                className={`text-[12px] px-2 py-1 rounded inline-block mb-3 ${
                  project.statusType === "active"
                    ? "bg-[rgba(34,197,94,0.15)] text-[#22c55e]"
                    : "bg-[rgba(245,158,11,0.15)] text-[#f59e0b]"
                }`}
              >
                {project.status}
              </span>
              <p className="text-[14px] text-[#999] mb-3">{project.description}</p>
              <div className="flex gap-1.5 flex-wrap">
                {project.tags.map((tag, i) => (
                  <span
                    key={i}
                    className={`tag ${project.tagColors[i] || "tag-blue"}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </section>

        {/* Skills Section */}
        <section className="py-20 fade-in">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[#3b82f6] uppercase mb-10 flex items-center gap-3">
            技术栈
            <span className="flex-1 h-[1px] bg-[#222]" />
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="bg-[#141414] border border-[#222] rounded-[12px] p-5 transition-all hover:border-[#3b82f6] hover:-translate-y-0.5"
              >
                <h3 className="text-[13px] text-[#3b82f6] uppercase tracking-wide mb-3">
                  {skill.category}
                </h3>
                <div className="text-[14px] text-[#999] leading-7">
                  {skill.items.map((item, i) => (
                    <div key={i}>{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="py-20 fade-in">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[#3b82f6] uppercase mb-10 flex items-center gap-3">
            教育经历
            <span className="flex-1 h-[1px] bg-[#222]" />
          </h2>
          <div className="bg-[#141414] border border-[#222] rounded-[12px] p-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="text-[20px] font-bold text-white">
                河南工业大学
              </div>
              <div className="text-[14px] text-[#999]">
                数据科学与大数据技术 · 本科 · 2021.09 ~ 2025.06
              </div>
            </div>
            <div className="flex gap-5 text-[13px] text-[#666]">
              <span>
                绩点排名 <strong className="text-[#60a5fa]">前 15%</strong>
              </span>
              <span>
                CET-4 <strong className="text-[#60a5fa]">488</strong>
              </span>
              <span>
                CET-6 <strong className="text-[#60a5fa]">455</strong>
              </span>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20 fade-in">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[#3b82f6] uppercase mb-10 flex items-center gap-3">
            联系方式
            <span className="flex-1 h-[1px] bg-[#222]" />
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-3">
            <a
              href="https://github.com/XiaoCheng991"
              target="_blank"
              className="flex items-center gap-3 px-4 py-4 bg-[#141414] border border-[#222] rounded-[12px] text-[14px] transition-all hover:border-[#3b82f6]"
            >
              <Github className="w-5 h-5" />
              <span>GitHub</span>
            </a>
            <a
              href="mailto:17516476723@163.com"
              className="flex items-center gap-3 px-4 py-4 bg-[#141414] border border-[#222] rounded-[12px] text-[14px] transition-all hover:border-[#3b82f6]"
            >
              <Mail className="w-5 h-5 flex-shrink-0" />
              <span className="truncate flex-1" title="17516476723@163.com">17516476723@163.com</span>
            </a>
            <a
              href="https://gitee.com/XiaoCheng991"
              target="_blank"
              className="flex items-center gap-3 px-4 py-4 bg-[#141414] border border-[#222] rounded-[12px] text-[14px] transition-all hover:border-[#3b82f6]"
            >
              <ExternalLink className="w-5 h-5" />
              <span>Gitee</span>
            </a>
            <a
              href="https://blog.csdn.net/qq_60985619"
              target="_blank"
              className="flex items-center gap-3 px-4 py-4 bg-[#141414] border border-[#222] rounded-[12px] text-[14px] transition-all hover:border-[#3b82f6]"
            >
              <ExternalLink className="w-5 h-5" />
              <span>CSDN 博客</span>
            </a>
            <div className="flex items-center gap-3 px-4 py-4 bg-[#141414] border border-[#222] rounded-[12px] text-[14px]">
              <Phone className="w-5 h-5" />
              <span>17516476723</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-4 bg-[#141414] border border-[#222] rounded-[12px] text-[14px]">
              <MapPin className="w-5 h-5" />
              <span>江苏南京</span>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-10 border-t border-[#222] text-center">
          <p className="text-[13px] text-[#666]">
            Built with ❤️ by 程永强 · 2026
          </p>
        </footer>
      </div>

      {/* Avatar Crop Dialog */}
      {selectedImage && (
        <AvatarCropDialog
          open={showCropDialog}
          onOpenChange={setShowCropDialog}
          imageSrc={selectedImage}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Scroll Animation Script */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            const observer = new IntersectionObserver((entries) => {
              entries.forEach(entry => {
                if (entry.isIntersecting) {
                  entry.target.classList.add('visible');
                }
              });
            }, { threshold: 0.1 });
            document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
          `,
        }}
      />
    </div>
  );
}
