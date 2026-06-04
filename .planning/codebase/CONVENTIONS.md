# Code Conventions

**Analysis Date:** 2026/06/03
**Last Updated:** 2026/06-03

## 文件/目录命名

| 类型 | 规范 | 示例 |
|------|------|------|
| React 组件 | PascalCase | `Button.tsx`, `AvatarCropDialog.tsx` |
| 工具函数/文件 | camelCase | `utils.ts`, `cn()`, `logger.ts` |
| 路由目录 | kebab-case / 单数 | `src/app/blog/[slug]/` |
| 类型文件 | 与模块同名 | `types.ts` |
| API 模块 | 与资源同名 | `src/lib/api/modules/blog.ts` |
| Hooks | `use` 前缀 + camelCase | `useTheme.ts`, `usePagePermission.ts` |

## 导入约定

- **路径别名**: `@/*` → `./src/*` (tsconfig `paths` 对齐 `components.json` `aliases`)
- **Radix 组件**: `@radix-ui/react-*`
- **shadcn 组件**: `@/components/ui/*`
- **桶导出**: 无显式 `index.ts`，按路径直入
- **排序**: React → Next → 第三方 → `@/` 内部 → 相对路径

```typescript
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"
```

## 组件模式

### Client Component (当前主流)
```tsx
"use client"
import { useState, useEffect } from 'react'

export default function BlogPage() {
  const [starCounts, setStarCounts] = useState<Record<string, string>>({})
}
```

### Props + forwardRef
```tsx
interface UserAvatarProps {
  userId?: number
  username?: string
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const UserAvatar = React.forwardRef<HTMLDivElement, UserAvatarProps>(
  ({ size = 'md', className, ...props }, ref) => { /* ... */ }
)
UserAvatar.displayName = 'UserAvatar'
```

## 样式约定

- **主力**: Tailwind CSS + `tailwind-merge` + `clsx` → `cn()` (src/lib/utils.ts)
- **类名排序**: 布局 → 尺寸 → 间距 → 颜色 → 边框 → 动画 → 交互
- **响应式**: mobile-first, `sm:` `md:` `lg:` `xl:` `2xl:`
- **暗色模式**: 全量 `dark:` 前缀
- **CSS 变量**: shadcn/ui HSL 主题 (`hsl(var(--xxx))`)
- **主题切换**: `next-themes` + `class` 策略 + `localStorage('theme')` + 防闪白内联脚本
- **CVA**: `class-variance-authority` 管理组件变体

## TypeScript

- `strict: true`, `target: ES2017`, `module: bundler`
- `any`: warn 级别，部分 Supabase 回调仍用
- `enum`: 未使用，替代为联合类型/const 对象
- 泛型: `debounce<T>`, `throttle<T>` 等工具函数广泛使用

## 错误处理

```typescript
// toast 通知
toast({ title: "错误", description: err.message, variant: "destructive" })

// API try/catch
try {
  const { data, error } = await supabase.from('posts').select()
  if (error) throw error
} catch (error: any) {
  apiLogger.error('Context:', error)
}

// 多请求
const [memosRes, articlesRes] = await Promise.allSettled([getMemos(), getArticles()])
```

- 日志: `apiLogger` (src/lib/utils/logger.ts)
- 生产构建: `babel-plugin-transform-remove-console` 移除 console
- 错误边界: `src/app/error.tsx` + `src/app/global-error.tsx`

## 状态管理

| 范围 | 方案 |
|------|------|
| 服务数据 | TanStack Query |
| 全局认证 | React Context (src/lib/user-context.tsx) |
| 页面权限 | src/hooks/useAppStore.ts |
| 局部 | useState / useReducer |

无 Redux/Zustand/MobX。

## Git

```
cf894c0  perf: 首屏加载优化
550b544  feature：账号自媒体数据抓取
c09c9ed  fix：头像
```

简洁单行，冒号混用中英文。直接在 main 提交，无 feature 分支。

## ESLint

`eslint.config.mjs` (flat config, ESLint v9):
- 继承: `eslint-config-next/core-web-vitals` + typescript-eslint
- `no-console: warn` (允许 warn/error)
- `no-explicit-any: warn`
- `no-unused-vars: error` (忽略 `_` 前缀)
- `ban-types: error`

---

*Convention analysis: 2026/06/03*
