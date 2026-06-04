# Technology Stack

**Analysis Date:** 2026/06-03
**Last Updated:** 2026/06-03

## Runtime & Language

- TypeScript 5.6.3 (strict: true, target: ES2017, module: bundler)
- Node.js 18+
- npm (package-lock.json)

## UI 框架

- Next.js 14.2.35 (App Router, RSC 默认)
- React 18.3.1
- Tailwind CSS 3.4.13
- shadcn/ui — Radix-based 可访问组件 (newYork 风格)
- Radix UI 1.4.3 — 无样式原语
- Framer Motion 12.38.0 — 动画
- Lucide React 0.447.0 — 主力图标
- react-icons 5.6.0 — 补充图标

## 数据 & 状态

- @supabase/supabase-js — 认证 + PostgreSQL + Storage
- @supabase/ssr — SSR 场景 Supabase 客户端
- @tanstack/react-query 5.96.2 — 服务端缓存
- class-variance-authority 0.7.1 — 组件变体
- Zod 3.23.8 — Schema 校验
- React Context — 全局认证态、主题、国际化

## 内容

- next-mdx-remote 6.0.0 — MDX 渲染
- react-syntax-highlighter 15.5.0 — 代码高亮
- remark-gfm 4.0.1 — GFM Markdown
- rehype-highlight 7.0.2 — 语法高亮
- turndown 7.2.2 — HTML→Markdown
- reading-time 1.5.0

## 文件 & 媒体

- Sharp 0.33.5 — 服务端图片处理
- @dnd-kit/core 6.3.1 + @dnd-kit/sortable 10.0.0

## 工具函数

- clsx 2.1.1 + tailwind-merge 2.6.0 → cn()
- date-fns 4.1.0
- p-limit 5.0.0

## 样式 & 主题

- next-themes 0.4.6 — 暗色/亮色切换
- @tailwindcss/typography 0.5.19
- tailwindcss-animate 1.0.7 — 动画 keyframes

## 交互

- sonner 2.0.7 — Toast 通知
- recharts 2.12.7 — 图表
- next-themes 0.4.6 — 主题切换

## 国际化

- 自定义方案: `src/lib/i18n/locales/en.json` + `zh.json`
- 基于 React Context，无第三方 i18n 库

## 构建

- next dev (Turbopack) / next build / next lint
- babel-plugin-transform-remove-console — 生产移除 console
- postcss + autoprefixer — CSS 处理

## 已移除依赖（不再使用）

旧版有但当前 package.json 已删除: Zustand, Tiptap, Monaco, pdf-lib, tesseract.js, @anthropic-ai/sdk, @ai-sdk/openai, openai, ai, minio, onnxruntime-web, react-easy-crop

## 配置文件

next.config.ts / tailwind.config.ts / tsconfig.json / eslint.config.mjs / postcss.config.js / components.json / vercel.json

---

*Stack analysis: 2026/06/03*
