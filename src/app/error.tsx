'use client';

import { useEffect } from 'react';
import { apiLogger } from '@/lib/utils/logger'
import { useRouter } from 'next/navigation';
import { AlertTriangle, Home, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    apiLogger.error('Global error caught:', error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-orange-500/5 via-transparent to-orange-500/3">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 -left-40 w-96 h-96 bg-red-400/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-orange-400/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 max-w-2xl w-full text-center bg-white/70 dark:bg-gray-900/70 backdrop-blur-xl border border-white/40 dark:border-gray-700/40 rounded-3xl shadow-xl p-12">
        {/* 图标 */}
        <div className="relative mx-auto w-24 h-24 mb-6">
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-red-500/20 to-red-500/5" />
          <div className="relative flex items-center justify-center h-full">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>

        {/* 标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">
            出错了
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            页面遇到了一些问题，请稍后重试
          </p>
        </div>

        {/* 操作按钮 */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold shadow-lg shadow-orange-500/25 transition-all duration-300 hover:scale-105"
          >
            <RefreshCw className="h-4 w-4" />
            重试
          </button>
          <button
            onClick={() => router.push('/home')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-white/50 dark:bg-white/10 hover:bg-white/70 dark:hover:bg-white/20 border border-white/40 dark:border-gray-700/40 text-slate-700 dark:text-slate-300 font-medium transition-all duration-300"
          >
            <Home className="h-4 w-4" />
            返回首页
          </button>
        </div>
      </div>
    </div>
  );
}
