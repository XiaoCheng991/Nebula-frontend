"use client";

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { ArrowLeft, Braces, Minimize, AlertCircle, CheckCheck, Copy, Trash2, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type FormatMode = 'pretty' | 'compact';

const SAMPLE_JSON = `{
  "name": "NebulaHub",
  "version": "1.0.0",
  "description": "橙光 - 你的个人空间",
  "features": [
    "碎碎念日记",
    "博客收藏",
    "文件存储",
    "原图分享"
  ],
  "settings": {
    "theme": "auto",
    "language": "zh-CN",
    "notifications": true
  },
  "stats": {
    "posts": 42,
    "files": 128,
    "images": 256
  }
}`;

export default function JsonFormatterPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<FormatMode>('pretty');
  const [copied, setCopied] = useState(false);
  const [validating, setValidating] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const validateAndFormat = useCallback(
    (formatMode: FormatMode) => {
      setValidating(true);
      setError(null);
      setMode(formatMode);

      try {
        const trimmed = input.trim();
        if (!trimmed) {
          setOutput('');
          setValidating(false);
          return;
        }

        const parsed = JSON.parse(trimmed);
        const formatted =
          formatMode === 'pretty'
            ? JSON.stringify(parsed, null, 2)
            : JSON.stringify(parsed);

        setOutput(formatted);
      } catch (e) {
        const message = e instanceof Error ? e.message : '无效 JSON';
        setError(message);
        setOutput('');
      } finally {
        setValidating(false);
      }
    },
    [input]
  );

  const handleCopy = useCallback(async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [output]);

  const handleClear = useCallback(() => {
    setInput('');
    setOutput('');
    setError(null);
    inputRef.current?.focus();
  }, []);

  const handleLoadSample = useCallback(() => {
    setInput(SAMPLE_JSON);
    setOutput('');
    setError(null);
  }, []);

  const handleDownload = useCallback(() => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'formatted.json';
    a.click();
    URL.revokeObjectURL(url);
  }, [output]);

  const inputLines = input ? input.split('\n').length : 0;
  const outputChars = output.length;

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* 背景装饰 */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 -left-60 w-[500px] h-[500px] bg-cyan-400/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-blue-400/8 rounded-full blur-3xl" />
      </div>

      {/* 顶部导航 */}
      <div className="relative z-10 container mx-auto px-4 pt-6 pb-4">
        <Link
          href="/tools"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-900/70 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          返回工具箱
        </Link>
      </div>

      {/* 主内容 */}
      <section className="relative z-10 container mx-auto px-4 pb-24">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <Braces className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white">
                JSON 格式化
              </h1>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                粘贴 JSON 数据，实时校验并格式化输出
              </p>
            </div>
          </div>

          {/* 工具栏 */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <Button
              size="sm"
              onClick={() => validateAndFormat('pretty')}
              disabled={!input.trim() || validating}
              className={cn(
                'gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:scale-[1.02] transition-transform shadow-md shadow-cyan-500/20'
              )}
            >
              <Braces className="h-4 w-4" />
              格式化
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={() => validateAndFormat('compact')}
              disabled={!input.trim() || validating}
              className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-white/70 dark:hover:bg-slate-800/70"
            >
              <Minimize className="h-4 w-4" />
              压缩
            </Button>

            <div className="flex-1" />

            <Button
              size="sm"
              variant="outline"
              onClick={handleLoadSample}
              className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-white/70 dark:hover:bg-slate-800/70"
            >
              <FileText className="h-4 w-4" />
              示例
            </Button>

            <Button
              size="sm"
              variant="outline"
              onClick={handleClear}
              disabled={!input && !output}
              className="gap-2 rounded-xl border-slate-200 dark:border-slate-700 hover:bg-white/70 dark:hover:bg-slate-800/70"
            >
              <Trash2 className="h-4 w-4" />
              清空
            </Button>
          </div>

          {/* 编辑区域 */}
          <div className="grid lg:grid-cols-2 gap-4 min-h-[440px]">
            {/* 输入面板 */}
            <div className="relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  输入
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {inputLines} 行
                </span>
              </div>
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  // 清除旧错误/输出
                  if (error) setError(null);
                }}
                placeholder='粘贴 JSON 数据，例如：&#10;{"name": "NebulaHub", "version": "1.0.0"}'
                spellCheck={false}
                className="flex-1 w-full px-4 py-3 bg-transparent font-mono text-sm text-slate-800 dark:text-slate-200 placeholder:text-slate-400/60 resize-none focus:outline-none min-h-[380px]"
              />
            </div>

            {/* 输出面板 */}
            <div className="relative bg-white/70 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200/50 dark:border-slate-800/50 rounded-2xl overflow-hidden flex flex-col">
              <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200/50 dark:border-slate-800/50">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    输出
                  </span>
                  {output && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500/10 text-green-600 dark:text-green-400 text-[11px] font-medium">
                      <CheckCheck className="h-3 w-3" />
                      有效 JSON
                    </span>
                  )}
                  {error && (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-600 dark:text-red-400 text-[11px] font-medium">
                      <AlertCircle className="h-3 w-3" />
                      无效 JSON
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1.5">
                  {output && (
                    <>
                      <button
                        onClick={handleDownload}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="下载 JSON 文件"
                      >
                        <Download className="h-4 w-4 text-slate-500" />
                      </button>
                      <button
                        onClick={handleCopy}
                        className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="复制结果"
                      >
                        {copied ? (
                          <CheckCheck className="h-4 w-4 text-green-500" />
                        ) : (
                          <Copy className="h-4 w-4 text-slate-500" />
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="flex-1 relative min-h-[380px]">
                {error ? (
                  <div className="absolute inset-0 p-4 overflow-auto">
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900/50 rounded-xl p-4 font-mono text-sm text-red-700 dark:text-red-300">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-semibold mb-1">JSON 格式错误</p>
                          <p className="opacity-80">{error}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : output ? (
                  <pre className="absolute inset-0 p-4 overflow-auto font-mono text-sm text-slate-800 dark:text-slate-200 whitespace-pre-wrap break-all">
                    {output}
                  </pre>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400 dark:text-slate-600">
                    <p className="text-sm">
                      点击 &quot;格式化&quot; 查看结果
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 底部信息 */}
          {output && (
            <div className="mt-4 flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
              <span>
                已格式化为 {mode === 'pretty' ? '美化' : '紧凑'} 模式
              </span>
              <span className="font-mono">
                {outputChars} 字符
              </span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
