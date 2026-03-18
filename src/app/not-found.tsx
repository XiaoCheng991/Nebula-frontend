'use client';

import { useRouter } from 'next/navigation';
import { FileQuestion, Home, ArrowLeft, Sparkles } from 'lucide-react';

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/3">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-amber-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
      </div>

      <div
        className="relative z-10 max-w-2xl w-full text-center backdrop-blur-xl rounded-3xl shadow-xl p-12"
        style={{
          background: 'var(--glass-bg, rgba(255,255,255,0.7))',
          border: '1px solid var(--glass-border, rgba(255,255,255,0.4))',
        }}
      >
        {/* 装饰图标 */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/5" />
          <div className="absolute inset-2 rounded-full bg-gradient-to-br from-orange-500/10 to-transparent" />
          <div className="relative flex items-center justify-center h-full">
            <FileQuestion className="h-12 w-12 text-orange-500" />
          </div>
          <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-orange-500/10 blur-xl" />
          <div className="absolute -bottom-2 -left-2 w-8 h-8 rounded-full bg-orange-500/5 blur-xl" />
        </div>

        {/* 标题和描述 */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Sparkles className="h-5 w-5 text-orange-500" />
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 bg-clip-text text-transparent">
              404
            </h1>
            <Sparkles className="h-5 w-5 text-orange-500" />
          </div>
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-2">
            页面未找到
          </h2>
          <p className="text-slate-600 dark:text-slate-400">
            抱歉，您访问的页面不存在或已被移除
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push('/home')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105"
          >
            <Home className="h-4 w-4" />
            返回首页
          </button>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-medium transition-all duration-300"
            style={{
              background: 'var(--glass-bg, rgba(255,255,255,0.5))',
              border: '1px solid var(--glass-border, rgba(255,255,255,0.4))',
            }}
          >
            <ArrowLeft className="h-4 w-4" />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
