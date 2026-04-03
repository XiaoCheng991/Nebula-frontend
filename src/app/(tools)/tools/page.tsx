import Link from 'next/link';
import { ArrowRight, Braces, Scan, Wand2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

const tools = [
  {
    id: 'json-formatter',
    title: 'JSON 格式化',
    description: '美化、压缩、校验 JSON 数据，实时语法检查，支持多格式输出',
    icon: Braces,
    color: 'from-cyan-500 to-blue-500',
    shadowColor: 'shadow-cyan-500/20',
    tagColor: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
    status: '上线',
  },
  {
    id: 'pdf-ocr',
    title: 'PDF OCR 识别',
    description: '从 PDF 文档中提取文字，支持图片内文字识别',
    icon: Scan,
    color: 'from-violet-500 to-purple-500',
    shadowColor: 'shadow-violet-500/20',
    tagColor: 'bg-violet-500/10 text-violet-600 dark:text-violet-400',
    status: '开发中',
  },
  {
    id: 'image-denoiser',
    title: '图片去水印',
    description: '涂抹去除图片水印，智能填充背景',
    icon: Wand2,
    color: 'from-orange-500 to-amber-500',
    shadowColor: 'shadow-orange-500/20',
    tagColor: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
    status: '开发中',
  },
];

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
      <section className="relative z-10 container mx-auto px-4 pt-40 pb-8 text-center">
        <div className="max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-[var(--glass-border)] px-4 py-2 rounded-full text-sm font-medium mb-8 shadow-lg">
            <span className="text-foreground">免费 · 无需登录 · 纯前端处理</span>
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
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const Icon = tool.icon;
            const isActive = tool.status === '上线';

            return (
              <div
                key={tool.id}
                className="group relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-3xl p-8 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${tool.color} rounded-2xl flex items-center justify-center shadow-lg ${tool.shadowColor} mb-6 group-hover:scale-110 transition-transform`}>
                  <Icon className="h-7 w-7 text-white" />
                </div>

                <h3 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">
                  {tool.title}
                </h3>

                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed mb-6 min-h-[44px]">
                  {tool.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${tool.tagColor}`}>
                    {tool.status}
                  </span>

                  {isActive ? (
                    <Link href={`/tools/${tool.id}`}>
                      <Button
                        size="sm"
                        className={`gap-1.5 rounded-xl bg-gradient-to-r ${tool.color} text-white hover:scale-105 transition-transform`}
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
