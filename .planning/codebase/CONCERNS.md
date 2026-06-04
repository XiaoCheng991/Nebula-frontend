# Codebase Concerns

**Analysis Date:** 2026/06-03
**Last Updated:** 2026/06-03

## 🔴 严重

### 零测试覆盖
无一个测试文件。Auth、文件上传、权限校验全部裸奔。
建议: 优先 vitest + @testing-library/react，覆盖 utils.ts + 关键 API。

### 死链 redirect / → /home
src/app/page.tsx 硬编码 redirect('/home')，但 /home 路由不存在。
访问 / 直接 404。实际内容在 /blog、/about。

### GitHub API Rate Limit
首页无认证 fetch api.github.com（60 req/hr 匿名限制）。
开几个标签页就超限 → star 数拉不到，catch 兜底逻辑不完善。

### import 已删除模块（构建失败）
src/app/blog/page.tsx 顶部 import 了多个已不存在的模块:
- @/lib/user-context（useUser 不存在）
- @/lib/api（getLocalUserInfo 不存在）
- @/lib/api/modules/file（uploadAvatar 不存在）
- @/hooks/useAppStore（usePagePermission 不存在）
- @/lib/supabase/modules/blog（getArticles/getTags/addWebsiteCollection/deleteWebsiteCollection）
- @/lib/supabase/modules/memo（getMemos）
这些文件已被 git 从代码库中删除，但 blog/page.tsx 的 import 还没有清理。**当前项目应该构建失败**——除非这些文件在 git 状态中被标记为 D（deleted from working tree）但仍存在于最近一次 commit。

验证: `grep -r "from.*@/lib/user-context" src/` 确认无文件匹配。

## 🟠 高

### 巨型组件（885 行）
src/app/blog/page.tsx 整页 Client Component:
- fetch GitHub API
- CRUD 书签
- 头像上传 + 裁剪
- 权限判断
- 多个 Dialog 状态
全在一个文件。任何 state 变更都导致整页 re-render。

### 浏览器直连 Supabase（SQL 注入面）
blog/page.tsx 直接在浏览器调用 supabase.from('sys_users').select().in('id', userIds)。
虽然 Supabase 参数化查询，但表名暴露给客户端 = 信息泄露。推荐 Server Action 隔离。

### 权限仅前端校验
hasAdminAccess / blogWritePerm / memoWritePerm 都在前端 store。没有服务端二次校验。直接 curl API 即可绕过。

### 头像上传无服务端校验
handleAvatarUpload 只检查 file.type.startsWith('image/')（可伪造）和 size（10MB）。无 mime 校验、无病毒扫描、无尺寸限制。

## 🟡 中

### 暗色模式防闪白脚本用 dangerouslySetInnerHTML
layout.tsx 中内联 <script dangerouslySetInnerHTML={{ __html: themeScript }}>。在 CSP 模式下可能被拦截。

### 无错误监控
生产无 Sentry。用户 bug 只能靠复现。

### 国际化方案简陋
src/lib/i18n/locales/ 只有 zh.json/en.json，无复数/插值/类型安全。大部分 UI 硬编码中文。

## 🟢 低

### 图片懒加载
next/image 默认 lazy，但 memo 图片 <img> 标签无 loading="lazy"。

### 无 PWA
无 manifest、无 service worker、无离线支持。

## 依赖健康

### 已过期（package.json 已移除）
Zustand, Tiptap, Monaco, pdf-lib, tesseract.js, @anthropic-ai/sdk, @ai-sdk/openai, openai, ai, minio, onnxruntime-web, react-easy-crop

### 当前主力版本（健康）
Next.js 14.2.35 / React 18.3.1 / TypeScript 5.6.3 / Tailwind 3.4.13 — 各系列最新 patch

---

*Concerns audit: 2026/06/03*
