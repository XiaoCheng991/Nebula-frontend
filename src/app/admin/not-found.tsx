'use client';

import { useRouter } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft, Search, Sparkles } from 'lucide-react';

export default function AdminNotFound() {
  const router = useRouter();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center p-6">
      <div className="admin-card max-w-2xl w-full text-center">
        {/* 装饰图标 */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[var(--accent)]/20 to-[var(--accent)]/5" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-[var(--accent)]/10 to-transparent" />
          <div className="relative flex items-center justify-center h-full">
            <FileQuestion className="h-12 w-12 text-[var(--accent)]" />
          </div>
          {/* 装饰光晕 */}
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-[var(--accent)]/10 blur-xl" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-[var(--accent)]/5 blur-xl" />
        </div>

        {/* 标题和描述 */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)]">404</h1>
            <Sparkles className="h-5 w-5 text-[var(--accent)]" />
          </div>
          <h2 className="text-xl font-semibold text-[var(--text-primary)] mb-2">
            页面未找到
          </h2>
          <p className="text-[var(--text-secondary)]">
            抱歉，您访问的页面不存在或已被移除
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <button
            onClick={() => router.push('/admin')}
            className="btn-primary gap-2"
          >
            <Home className="h-4 w-4" />
            返回首页
          </button>
          <button
            onClick={() => router.back()}
            className="btn-secondary gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
        </div>

        {/* 可能的原因 */}
        <div className="pt-6 border-t border-[var(--glass-border)]">
          <p className="text-sm text-[var(--text-tertiary)] mb-4">
            可能的原因：
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] justify-center sm:justify-start">
              <div className="p-1.5 rounded-lg bg-[var(--glass-bg)]">
                <Search className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>
              <span>页面地址输入错误</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] justify-center sm:justify-start">
              <div className="p-1.5 rounded-lg bg-[var(--glass-bg)]">
                <FileQuestion className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>
              <span>页面已被删除或移动</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)] justify-center sm:justify-start">
              <div className="p-1.5 rounded-lg bg-[var(--glass-bg)]">
                <Home className="h-3.5 w-3.5 text-[var(--text-muted)]" />
              </div>
              <span>您没有访问权限</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
