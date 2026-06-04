# External Integrations

**Analysis Date:** 2026/06-03
**Last Updated:** 2026/06-03

## Supabase（核心后端）

- SDK: @supabase/supabase-js + @supabase/ssr
- Auth: Email/password + GitHub OAuth
- Database: PostgreSQL
- Storage: 头像等文件存储
- Client 文件:
  - src/lib/supabase/client.ts — 浏览器端
  - src/lib/supabase/server.ts — 服务端
  - src/lib/supabase/types.ts — 类型定义
- 功能模块:
  - src/lib/supabase/modules/blog.ts
  - src/lib/supabase/modules/memo.ts
  - src/lib/supabase/modules/website.ts

## 认证

- Supabase Auth — Email/password + GitHub OAuth
- 路由保护: src/middleware.ts
- 部分旧 auth 文件已被移除（src/lib/auth.ts, src/lib/api/adapters/auth-adapter.ts 等）

## 外部 API

### GitHub API（首页 star 计数）
- GET api.github.com/users/{owner}/repos?per_page=100 — 批量 star
- GET api.github.com/repos/{owner}/{repo} — 单仓库 fallback
- 无认证，rate limit 60 req/hr
- 文件: src/app/blog/page.tsx 内直接 fetch

### Bilibili API（抓取）
- api.bilibili.com/x/relation/stat — 粉丝数
- api.bilibili.com/x/space/acc/info — 用户信息
- JSONP 跨域

### 社交平台（agent-reach.ts）
- ✅ GitHub — 真实 API
- ✅ Bilibili — 真实 API
- ❌ 小红书/抖音/微博/YouTube/Twitter — Mock 数据

## 对象存储

### Supabase Storage
- Bucket: user-avatar（推测）
- 规则: public read, auth write
- 文件: src/lib/supabase/client.ts 调用

### MinIO
- 旧版 SDK minio 8.0.6 已从依赖剔除
- 代码 src/lib/minio.ts 理论上还在但未被引用
- 环境变量 MINIO_* 已不需要

## 缓存

- TanStack Query — 浏览器内存，服务端状态缓存
- localStorage — 用户信息、主题、语言
- 无外部缓存层（Redis 等）

## 监控

- src/lib/utils/logger.ts — 结构化日志（dev only）
- babel-plugin-transform-remove-console — 构建时移除
- 无 Sentry / LogRocket 等生产监控

## CI / CD

- vercel.json — Vercel 部署
- 无 GitHub Actions
- lint: next lint（仅静态检查）

## 环境变量（必需）

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- NEXT_PUBLIC_APP_URL
- NEXT_PUBLIC_APP_NAME

旧版（已移除）: MINIO_*, MINIMAX_*, NEXT_PUBLIC_GITHUB_CLIENT_ID

---

*Integration audit: 2026/06/03*
