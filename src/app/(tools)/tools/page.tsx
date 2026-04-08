import Link from 'next/link';
import {
  ArrowRight, Braces, ImagePlus, Scan, Eraser, FileSearch,
  Clock, Palette, QrCode, FileType, ImageIcon, Lock,
  FileCode, Sparkles, Zap
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Tool {
  id: string;
  title: string;
  description: string;
  icon: any;
  color: string;
  shadowColor: string;
  tagColor: string;
  status: '上线' | '开发中' | '规划中';
  tags?: { label: string; color: string; icon?: any }[];
}

const tools: Tool[] = [
  // ── 已上线 ──
  {
    id: 'json-formatter',
    title: 'JSON 格式化',
    description: '美化、压缩、校验 JSON 数据，支持格式转换与高亮显示',
    icon: Braces,
    color: 'from-cyan-500 to-blue-500',
    shadowColor: 'shadow-cyan-500/20',
    tagColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    status: '上线',
    tags: [
      { label: '美化压缩', color: 'cyan' },
      { label: '格式校验', color: 'blue' },
      { label: '格式转换', color: 'indigo' },
    ],
  },
  {
    id: 'toolkit',
    title: '图片工具箱',
    description: 'OCR 文字识别 · 图片去水印 · PDF 文档识别与搜索',
    icon: ImagePlus,
    color: 'from-orange-500 to-amber-500',
    shadowColor: 'shadow-orange-500/20',
    tagColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    status: '上线',
    tags: [
      { label: 'OCR 识别', color: 'orange', icon: Scan },
      { label: '图片去水印', color: 'amber', icon: Eraser },
      { label: 'PDF 识别', color: 'violet' },
    ],
  },
  {
    id: 'base64-converter',
    title: 'Base64 转换',
    description: '文本与 Base64 字符串互转，支持解码编码',
    icon: FileCode,
    color: 'from-sky-500 to-cyan-500',
    shadowColor: 'shadow-sky-500/20',
    tagColor: 'bg-sky-500/10 text-sky-600 dark:text-sky-400',
    status: '开发中',
  },
  // ── 规划中 ──
  {
    id: 'timestamp-converter',
    title: '时间戳转换',
    description: 'Unix 时间戳与日期时间互转，支持多时区与格式',
    icon: Clock,
    color: 'from-emerald-500 to-teal-500',
    shadowColor: 'shadow-emerald-500/20',
    tagColor: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    status: '规划中',
  },
  {
    id: 'color-picker',
    title: '颜色提取器',
    description: '上传图片自动提取主色调与配色方案，支持 HEX / RGB 格式',
    icon: Palette,
    color: 'from-pink-500 to-rose-500',
    shadowColor: 'shadow-pink-500/20',
    tagColor: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
    status: '规划中',
  },
  {
    id: 'qr-generator',
    title: '二维码生成',
    description: '输入文本或链接，一键生成高清二维码',
    icon: QrCode,
    color: 'from-indigo-500 to-purple-500',
    shadowColor: 'shadow-indigo-500/20',
    tagColor: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    status: '规划中',
  },
  {
    id: 'image-compressor',
    title: '图片压缩',
    description: '纯前端压缩图片，支持 JPG / PNG / WebP 质量调节',
    icon: ImageIcon,
    color: 'from-amber-500 to-yellow-500',
    shadowColor: 'shadow-amber-500/20',
    tagColor: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    status: '规划中',
  },
  {
    id: 'password-generator',
    title: '密码生成器',
    description: '自定义长度与字符类型的强密码生成，支持一键复制',
    icon: Lock,
    color: 'from-slate-500 to-zinc-500',
    shadowColor: 'shadow-slate-500/20',
    tagColor: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
    status: '规划中',
  },
];

const statusLabel = (status: Tool['status']) => {
  if (status === '上线') return '上线';
  if (status === '开发中') return '开发中';
  return '规划中';
};

const tagColorMap: Record<string, string> = {
  orange: 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 border border-orange-200/50 dark:border-orange-800/30',
  amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800/30',
  violet: 'bg-violet-50 dark:bg-violet-950/30 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-800/30',
  cyan: 'bg-cyan-50 dark:bg-cyan-950/30 text-cyan-600 dark:text-cyan-400 border border-cyan-200/50 dark:border-cyan-800/30',
  blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800/30',
  indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800/30',
};

export default function ToolsPage() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-40 w-96 h-96 bg-cyan-400/10 rounded-full blur-3xl" />
        <div className="absolute top-3/4 -right-40 w-96 h-96 bg-blue-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-violet-400/8 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 container mx-auto px-4 pt-28 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[var(--glass-border)] px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
            <Sparkles className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-foreground">免费 · 无需登录 · 纯前端处理</span>
            <Zap className="h-3.5 w-3.5 text-amber-500" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            <span className="bg-gradient-to-r from-cyan-500 via-blue-500 to-violet-500 bg-clip-text text-transparent">
              工具箱
            </span>
          </h1>

          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            实用小工具合集，所有数据处理均在本地完成
          </p>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="relative z-10 container mx-auto px-4 pb-24">
        <div className="max-w-5xl mx-auto grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.status === '上线';

            return (
              <div
                key={tool.id}
                className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center shadow-lg ${tool.shadowColor} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-6 w-6 text-white" />
                </div>

                <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-2">
                  {tool.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-4 min-h-[42px]">
                  {tool.description}
                </p>

                {/* 子功能标签 */}
                {tool.tags && (
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {tool.tags.map((tag) => {
                      const TagIcon = tag.icon;
                      return (
                        <span
                          key={tag.label}
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-medium ${tagColorMap[tag.color] || ''}`}
                        >
                          {TagIcon && <TagIcon className="h-2.5 w-2.5" />}
                          {tag.label}
                        </span>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium ${tool.tagColor}`}>
                    {statusLabel(tool.status)}
                  </span>

                  {isActive ? (
                    <Link href={`/tools/${tool.id}`}>
                      <Button
                        size="sm"
                        className={`gap-1.5 rounded-lg bg-gradient-to-r ${tool.color} text-white hover:scale-105 transition-transform`}
                      >
                        使用
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    </Link>
                  ) : (
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      即将推出
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
