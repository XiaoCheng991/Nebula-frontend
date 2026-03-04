# 后台管理系统设计方案

**日期**: 2026-03-04
**项目**: NebulaHub 橙光

---

## 一、整体架构设计

### 1.1 权限模型（RBAC）

```
用户(User) ──多对多── 角色(Role) ──多对多── 权限(Permission)
                    ↑
                    └─ 关联菜单(Menu)
```

### 1.2 数据结构设计

#### 用户 (User)
```typescript
interface AdminUser {
  id: number
  username: string
  displayName: string
  email: string
  avatar?: string
  status: 'active' | 'disabled'
  roles: number[]  // 角色ID列表
  createdAt?: string
  updatedAt?: string
}
```

#### 角色 (Role)
```typescript
interface AdminRole {
  id: number
  name: string
  code: string
  description?: string
  permissions: string[]  // 权限code列表
  menus: number[]        // 菜单ID列表
  createdAt?: string
  updatedAt?: string
}
```

#### 权限 (Permission)
```typescript
interface AdminPermission {
  id: number
  name: string
  code: string
  type: 'page' | 'button'
  path?: string
  description?: string
  createdAt?: string
}
```

#### 菜单 (Menu)
```typescript
interface AdminMenu {
  id: number
  parentId?: number
  name: string
  path?: string
  icon?: string
  sortOrder: number
  type: 'directory' | 'menu' | 'button'
  permissionCode?: string
  children?: AdminMenu[]
  createdAt?: string
}
```

#### 字典 (Dictionary)
```typescript
interface Dictionary {
  id: number
  code: string
  name: string
  type: 'config' | 'data'
  items: DictionaryItem[]
  createdAt?: string
  updatedAt?: string
}

interface DictionaryItem {
  id: number
  label: string
  value: string
  sortOrder: number
  status: 'enabled' | 'disabled'
}
```

#### 操作日志 (OperationLog)
```typescript
interface OperationLog {
  id: number
  userId: number
  username: string
  operation: string
  method: string
  params?: string
  ip?: string
  status: 'success' | 'failed'
  createdAt: string
}
```

---

## 二、前端路由结构

```
src/app/
├── admin/
│   ├── layout.tsx              # 后台布局（左侧侧边栏）
│   ├── page.tsx                # 后台首页/仪表盘
│   ├── users/
│   │   └── page.tsx            # 用户管理
│   ├── roles/
│   │   └── page.tsx            # 角色管理
│   ├── permissions/
│   │   └── page.tsx            # 权限管理
│   ├── menus/
│   │   └── page.tsx            # 菜单管理
│   ├── dictionaries/
│   │   └── page.tsx            # 字典配置
│   ├── logs/
│   │   └── page.tsx            # 操作日志
│   ├── settings/
│   │   └── page.tsx            # 系统设置
│   ├── blog/
│   │   ├── posts/
│   │   │   └── page.tsx        # 文章管理
│   │   ├── categories/
│   │   │   └── page.tsx        # 分类管理
│   │   ├── tags/
│   │   │   └── page.tsx        # 标签管理
│   │   └── comments/
│   │       └── page.tsx        # 评论管理
│   └── im/
│       ├── messages/
│       │   └── page.tsx        # 消息管理
│       ├── rooms/
│       │   └── page.tsx        # 聊天室管理
│       ├── sensitive-words/
│       │   └── page.tsx        # 敏感词管理
│       └── bans/
│           └── page.tsx        # 禁言管理
```

---

## 三、核心实现方案

### 3.1 权限控制流程

```
用户登录
    ↓
后端返回: userInfo, roles[], permissions[], menus[], routeConfigs[]
    ↓
前端存储到 Zustand store
    ↓
根据 menus[] 动态生成左侧侧边栏
    ↓
Middleware 服务端校验路由权限
    ↓
进入页面前端再校验权限
    ↓
按钮级别用 usePermission() hook 控制显示
```

### 3.2 关键文件结构

```
src/
├── hooks/
│   ├── usePermission.ts        # 权限检查 hook
│   ├── useAdminMenu.ts         # 后台菜单 hook
│   └── useAdminStore.ts        # 后台状态管理
├── components/
│   └── admin/
│       ├── layout/
│       │   ├── AdminLayout.tsx      # 后台布局
│       │   ├── Sidebar.tsx          # 左侧侧边栏
│       │   └── AdminHeader.tsx      # 后台顶部
│       ├── PermissionGuard.tsx       # 权限守卫组件
│       └── table/
│           └── DataTable.tsx         # 通用数据表格
├── lib/
│   ├── admin/
│   │   ├── types.ts            # 后台类型定义
│   │   ├── api.ts              # 后台 API
│   │   └── mock-data.ts        # Mock 数据（先用来开发）
│   └── middleware-utils.ts     # 扩展 middleware
└── middleware.ts               # 添加后台路由权限校验
```

---

## 四、分阶段开发计划

### 第一阶段：基础架构搭建
- [ ] 后台布局（左侧侧边栏 + 顶部Header）
- [ ] 路由结构和基础页面
- [ ] Middleware 权限校验
- [ ] Zustand store 设计
- [ ] 基础类型定义
- [ ] Mock 数据准备

### 第二阶段：权限核心模块
- [ ] 用户管理页面（CRUD + 分配角色）
- [ ] 角色管理页面（CRUD + 分配权限/菜单）
- [ ] 权限管理页面（CRUD）
- [ ] 菜单管理页面（树形结构）
- [ ] 权限守卫组件和 hook

### 第三阶段：系统管理模块
- [ ] 字典配置管理
- [ ] 操作日志查看
- [ ] 系统设置页面
- [ ] 动态路由加载（从字典读取）

### 第四阶段：博客管理模块
- [ ] 文章管理
- [ ] 分类管理
- [ ] 标签管理
- [ ] 评论管理

### 第五阶段：IM管理模块
- [ ] 消息查询
- [ ] 聊天室管理
- [ ] 敏感词管理
- [ ] 禁言管理

---

## 五、技术细节

### 5.1 UI组件库
- 继续使用 shadcn/ui
- 表格使用 `@tanstack/react-table` 实现排序、筛选、分页、行选择

### 5.2 状态管理
- 使用 Zustand 管理后台状态（用户、角色、权限、菜单）
- 持久化登录后的配置信息

### 5.3 权限检查示例

```tsx
// hook 用法
const { hasPermission, hasRole } = usePermission()

// 按钮级别控制
{hasPermission('user:create') && <Button>新增用户</Button>}

// 组件级别控制
<PermissionGuard permission="user:edit">
  <EditButton />
</PermissionGuard>
```

### 5.4 路由保护

- **Middleware**: 服务端校验 `/admin/*` 路由，普通用户直接跳转首页
- **客户端**: 进入页面前检查权限，无权限跳转403或首页
