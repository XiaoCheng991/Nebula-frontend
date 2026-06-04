# Testing Strategy & Coverage

**Analysis Date:** 2026/06/03
**Last Updated:** 2026/06-03

## 当前状态：⚠️ 零测试

```bash
find src -name "*.test.*" -o -name "*.spec.*" -o -name "__tests__"
# 结果：0 文件
```

无测试文件、框架或配置。

## 未安装

- Jest / Vitest
- @testing-library/react / @testing-library/dom
- Playwright / Cypress
- vitest.config.ts / jest.config.js

`package.json` scripts: `dev` / `build` / `start` / `lint`。**无 `test` 命令**。

## 推荐方案

```bash
npm install -D vitest @testing-library/react @testing-library/dom jsdom
```

理由：Vitest 与 Next.js + TS 原生兼容，比 Jest 快，配置少。

## 测试组织惯例

```
src/lib/__tests__/utils.test.ts
src/hooks/__tests__/useAppStore.test.ts
src/components/ui/Button.test.tsx
src/app/blog/__tests__/[slug].test.tsx
```

## 覆盖优先级

| 严重度 | 路径 | 说明 |
|--------|------|------|
| 🔴 严重 | 认证流程 | login/logout/token refresh |
| 🔴 严重 | 文件上传 | avatar crop + upload to Supabase Storage |
| 🟠 高 | 权限校验 | admin / blog_write / memo_write |
| 🟠 高 | Supabase RLS | Row Level Security |
| 🟡 中 | 博客 CRUD | 创建/编辑/删除、Slug 生成 |
| 🟡 中 | 工具函数 | cn() / formatDate() / debounce() / throttle() |
| 🟢 低 | 主题切换 | next-themes 切换/持久化 |
| 🟢 低 | 死链 | page.tsx → /home (不存在) |

## E2E (Playwright)

```bash
npm install -D @playwright/test && npx playwright install
```

核心旅程：首页加载 → 登录 → 头像上传 → 发布博客

## CI

无自定义 `.github/workflows/`。lint 由 `next lint` 覆盖，不拦截运行时 bug。

---

*Testing analysis: 2026/06/03*
