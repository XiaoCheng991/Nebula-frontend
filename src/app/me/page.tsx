"use client";

import { Github, Mail, Phone, MapPin, ExternalLink } from "lucide-react";

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
    company: "大型零售电商集团",
    period: "2025.07 ~ 至今",
    role: "IT 研发总部 · 商品研发中心 · 全栈开发工程师",
    descriptions: [
      "作为集团管培生，8 个月内完成全链路岗位培训，荣获 2025 年度<strong>优秀员工奖</strong>（全部门 TOP10%）",
      "驻场国际知名快餐企业总部参与货品和货品供应商主数据数据中台项目，获得甲方领导书面认可",
      "设计 OpenClaw 多 Agent 分工体系，采购订单导出效率提升 60%",
      "直连商品中台提供实时库存/价格查询，响应时间 ≤500ms",
    ],
    tags: ["Java", "OpenClaw", "LangChain"],
    tagColors: ["tag-blue", "tag-green", "tag-purple"],
  },
  {
    company: "互联网科技企业",
    period: "2024.05 ~ 2024.11",
    role: "创新产品部 · Java 开发工程师",
    descriptions: [
      "负责高校教育平台、教考分离平台等 3 个核心系统的后端研发",
      "运用 EasyExcel + MinIO 处理文件导出 5000+ 次，导出效率提升 40%",
      "重构核心模块，响应速度提升 20%，代码可读性提升 50%",
      "交付健壮接口 80+ 个，接口调用成功率 99.9%，项目按期交付率 100%",
    ],
    tags: ["SpringBoot", "MyBatis", "Docker"],
    tagColors: ["tag-blue", "tag-green", "tag-orange"],
  },
];

const projects = [
  {
    name: "货品和货品供应商主数据中台",
    status: "进行中",
    statusType: "active",
    description:
      "国际知名快餐企业货品和货品供应商主数据中台化建设项目，重塑统一规范的主数据管理体系，服务全国 1500+ 门店。绘制 BPMN 流程图 30+ 张，完成 10+ 个 TMS 品类树接口开发，响应时间≤300ms。",
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
  return (
    <div className="min-h-screen bg-[--bg]">
      <style jsx global>{`
        :root {
          --bg: #f8fafc;
          --bg2: #f1f5f9;
          --bg3: #e2e8f0;
          --card: #ffffff;
          --border: #e2e8f0;
          --text: #1e293b;
          --text2: #64748b;
          --text3: #94a3b8;
          --accent: #3b82f6;
          --accent2: #60a5fa;
          --green: #22c55e;
          --orange: #f59e0b;
          --purple: #a855f7;
          --radius: 12px;
        }
        .dark {
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
      `}</style>

      <div className="max-w-[900px] mx-auto px-6 py-20">
        {/* Hero Section */}
        <section className="min-h-[100vh] flex flex-col justify-center relative -mt-32">
          <div
            className="absolute top-[-200px] right-[-200px] w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(59,130,246,0.08)_0%,transparent_70%)] pointer-events-none"
          />
          {/* GitHub Avatar */}
          <div className="mb-6">
            <img
              src="https://avatars.githubusercontent.com/XiaoCheng991"
              alt="程永强"
              className="w-24 h-24 rounded-full border-4 border-[--accent] shadow-lg shadow-[rgba(59,130,246,0.3)]"
            />
          </div>
          <div className="text-[--accent] font-medium tracking-[2px] text-sm uppercase mb-2">
            Hello, I'm
          </div>
          <h1 className="text-[clamp(40px,7vw,72px)] font-bold leading-tight mb-2 bg-gradient-to-r from-[--text] to-[--text2] bg-clip-text text-transparent">
            程永强
          </h1>
          <p className="text-[clamp(20px,3vw,28px)] text-[--text2] font-light mb-4">
            <span className="text-[--accent2] font-medium">全栈 + AI</span> 开发
          </p>
          <p className="text-[16px] text-[--text3] max-w-[560px] leading-relaxed mb-6">
            河南工业大学 · 数据科学与大数据技术<br />
            曾就职于 AI 科技企业，目前在大型零售业集团做全栈开发<br />
            正在从 Java 向 AI 迈进，目标：让代码不只是代码
          </p>
          <div className="flex gap-3 flex-wrap mt-2">
            {socialLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all border border-[--border] bg-[--bg2] text-[--text] hover:border-[--accent] hover:text-[--accent2]"
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </a>
            ))}
            <a
              href="tel:17516476723"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all bg-[--accent] border border-[--accent] text-[--text] hover:bg-[#2563eb]"
            >
              <Phone className="w-4 h-4" />
              17516476723
            </a>
          </div>
        </section>

        {/* Experience Section */}
        <section className="py-20">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[--accent] uppercase mb-10 flex items-center gap-3">
            工作经历
            <span className="flex-1 h-[1px] bg-[--border]" />
          </h2>
          <div className="relative">
            <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-gradient-to-b from-[#3b82f6] to-[#a855f7] to-transparent" />
            {experiences.map((exp, idx) => (
              <div key={idx} className="pl-8 mb-12 relative">
                <div className="absolute left-[-5px] top-3 w-3 h-3 rounded-full bg-[#3b82f6] border-[3px] border-[#0a0a0a]" />
                <div className="flex justify-between items-start flex-wrap gap-2 mb-2">
                  <span className="text-[20px] font-bold text-[--text]">
                    {exp.company}
                  </span>
                  <span className="text-[13px] text-[--text3] font-mono px-2.5 py-1 bg-[--bg3] rounded">
                    {exp.period}
                  </span>
                </div>
                <div className="text-[14px] text-[--accent2] mb-3">{exp.role}</div>
                <ul className="text-[14px] text-[--text2] space-y-2">
                  {exp.descriptions.map((desc, i) => (
                    <li key={i} className="relative pl-4">
                      <span className="absolute left-0 text-[--accent]">→</span>
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
        <section className="py-20">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[--accent] uppercase mb-10 flex items-center gap-3">
            项目经历
            <span className="flex-1 h-[1px] bg-[--border]" />
          </h2>
          {projects.map((project, idx) => (
            <div
              key={idx}
              className="bg-[--card] border border-[--border] rounded-[12px] p-7 mb-4 transition-all hover:border-[--accent]"
            >
              <div className="text-[18px] font-bold text-[--text] mb-1">
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
              <p className="text-[14px] text-[--text2] mb-3">{project.description}</p>
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
        <section className="py-20">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[--accent] uppercase mb-10 flex items-center gap-3">
            技术栈
            <span className="flex-1 h-[1px] bg-[--border]" />
          </h2>
          <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-4">
            {skills.map((skill, idx) => (
              <div
                key={idx}
                className="bg-[--card] border border-[--border] rounded-[12px] p-5 transition-all hover:border-[--accent] hover:-translate-y-0.5"
              >
                <h3 className="text-[13px] text-[--accent] uppercase tracking-wide mb-3">
                  {skill.category}
                </h3>
                <div className="text-[14px] text-[--text2] leading-7">
                  {skill.items.map((item, i) => (
                    <div key={i}>{item}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Education Section */}
        <section className="py-20">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[--accent] uppercase mb-10 flex items-center gap-3">
            教育经历
            <span className="flex-1 h-[1px] bg-[--border]" />
          </h2>
          <div className="bg-[--card] border border-[--border] rounded-[12px] p-6 flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="text-[20px] font-bold text-[--text]">
                xx工业大学
              </div>
              <div className="text-[14px] text-[--text2]">
                数据科学与大数据技术 · 本科 · 2021.09 ~ 2025.06
              </div>
            </div>
            <div className="flex gap-5 text-[13px] text-[--text3]">
              <span>
                绩点排名 <strong className="text-[--accent2]">前 15%</strong>
              </span>
              <span>
                CET-4 <strong className="text-[--accent2]">488</strong>
              </span>
              <span>
                CET-6 <strong className="text-[--accent2]">455</strong>
              </span>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="py-20">
          <h2 className="text-[13px] font-semibold tracking-[3px] text-[--accent] uppercase mb-10 flex items-center gap-3">
            联系方式
            <span className="flex-1 h-[1px] bg-[--border]" />
          </h2>
          <div className="grid grid-cols-[1fr,1fr] gap-8">
{/* 直接联系 - 主要信息 */}
    <div>
      <h3 className="text-[12px] text-[--text3] uppercase tracking-wide mb-4">直接联系</h3>
      <div className="space-y-3">
        <a
          href="tel:17516476723"
          className="group flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-[--bg2]"
        >
          <div className="w-10 h-10 rounded-full bg-[--accent] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Phone className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[12px] text-[--text3] uppercase">手机</div>
            <div className="text-[15px] text-[--text] font-medium">17516476723</div>
          </div>
        </a>
        <a
          href="mailto:17516476723@163.com"
          className="group flex items-center gap-4 p-3 rounded-lg transition-all hover:bg-[--bg2]"
        >
          <div className="w-10 h-10 rounded-full bg-[--accent] flex items-center justify-center text-white group-hover:scale-110 transition-transform">
            <Mail className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12px] text-[--text3] uppercase">邮箱</div>
            <div className="text-[15px] text-[--text] font-medium truncate">17516476723@163.com</div>
          </div>
        </a>
        <div className="flex items-center gap-4 p-3">
          <div className="w-10 h-10 rounded-full bg-[--bg2] flex items-center justify-center text-[--text3]">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[12px] text-[--text3] uppercase">位置</div>
            <div className="text-[15px] text-[--text] font-medium">江苏南京</div>
          </div>
        </div>
      </div>
    </div>

    {/* 社交链接 - 次要信息 */}
    <div>
      <h3 className="text-[12px] text-[--text3] uppercase tracking-wide mb-4">社交链接</h3>
      <div className="grid grid-cols-2 gap-3">
        <a
          href="https://github.com/XiaoCheng991"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-[--border] transition-all hover:border-[--accent] hover:bg-[--bg2]"
        >
          <Github className="w-6 h-6 text-[--text2] transition-colors" />
          <span className="text-[13px] text-[--text]">GitHub</span>
        </a>
        <a
          href="https://gitee.com/XiaoCheng991"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-[--border] transition-all hover:border-[--accent] hover:bg-[--bg2]"
        >
          <ExternalLink className="w-6 h-6 text-[--text2] transition-colors" />
          <span className="text-[13px] text-[--text]">Gitee</span>
        </a>
        <a
          href="https://blog.csdn.net/qq_60985619"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-[--border] transition-all hover:border-[--accent] hover:bg-[--bg2]"
        >
          <ExternalLink className="w-6 h-6 text-[--text2] transition-colors" />
          <span className="text-[13px] text-[--text]">CSDN</span>
        </a>
        <div className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-[--border] bg-[--bg2]">
          <img
            src="/logo_icon.svg"
            alt="NebulaHub Logo"
            className="w-8 h-8 rounded transition-transform hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Cdefs%3E%3ClinearGradient id='grad' x1='0%25' y1='0%25' x2='100%25' y2='100%25'%3E%3Cstop offset='0%25' style='stop-color:%233b82f6'/%3E%3Cstop offset='100%25' style='stop-color:%23a855f7'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='32' height='32' rx='8' fill='url(%23grad)'/%3E%3Ctext x='16' y='22' font-family='Arial' font-size='16' font-weight='bold' fill='white' text-anchor='middle'%3EN%3C/text%3E%3C/svg%3E";
            }}
          />
          <span className="text-[13px] text-[--text]">NebulaHub</span>
        </div>
      </div>
    </div>          </div>
        </section>

        {/* Footer */}
        <footer className="py-16 border-t border-[--border] text-center">
          <p className="text-[13px] text-[--text3]">
            © 2026 程永强。Powered by <span className="text-[--accent]">NebulaHub</span>
          </p>
        </footer>
      </div>
    </div>
  );
}
