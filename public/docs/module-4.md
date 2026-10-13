---
title: 登录注册
slug: module-4
date: 2026-10-12
tags: [技术, 前端, Vue, React]
readTime: 12
---

# 模块 4 笔记：登录/注册 + 权限守护

## 实现思路

### 六步旅程

1. **想清楚**：login/register API 约定、token 存储策略（localStorage，键 `'token'`，与模块 0 拦截器注释一致）、受保护路由清单（/cart）
2. **静态骨架**：/login、/register 路由 + 表单页渲染
3. **拆分组件**：LoginForm / RegisterForm（UI + **声明式校验**内聚，emit submit；业务归父级/store）
4. **接入数据**：mock 认证 API + auth store（token/user + localStorage 持久化）+ **拦截器自动附带 token（模块 0 伏笔兑现）**
5. **状态管理**：守卫落地——Vue `beforeEach` + meta vs React `RequireAuth` 包装器 + redirect 跳回来源页 + 登出
6. **验证与笔记**：登录/登出/未登录重定向全流程测试

### 认证数据流

```
LoginForm（收集 + 声明式校验）
  → emit submit(values)
  → 页面调 authStore.login(values)
  → mock API 校验 → 签发 token + user
  → store 状态更新 → watch / subscribe → localStorage 持久化（变化时写）
  → 请求拦截器：每次请求自动附带 Authorization: Bearer <token>
  → 访问受保护路由 → 守卫检查 isLoggedIn
      → 未登录：重定向 /login?redirect=来源页
      → 登录成功：读取 redirect 跳回
```

### 关键设计约定
- **token 存 localStorage**（键 `'token'`）——简单、刷新不丢；真实项目推荐 httpOnly cookie（见面试考点 3）
- **注册成功即登录**（返回 token）——省一次跳转，两页成功处理一致
- **权限边界**：浏览商品公开；涉及「我的数据」（购物车）才受保护

## 关键差异对比

| 项 | Vue 版 | React 版 | 为什么 |
|----|--------|----------|--------|
| 1️⃣ 守卫形态 | `beforeEach` **全局导航钩子**（框架内置，注册一次管所有路由）+ `meta.requiresAuth` 标记 | `RequireAuth` **包装器组件**（手动组装，包住受保护路由） | Vue Router 内置守卫能力（配置式哲学）；React Router「路由即组件」——权限控制本质是**条件渲染**（没登录就不渲染目标页），靠组件组装 |
| 2️⃣ 拦截方式 | 守卫**返回路由位置对象** = 重定向（返回 undefined 放行 / false 取消） | 渲染 `<Navigate to="..." replace />`（声明式重定向组件） | 钩子里用**返回值**表达意图；组件树里用**组件**表达 |
| 3️⃣ 表单数据管理 | antdv：`:model="formState"` + `v-model:value`——值由**你的响应式对象**管 | antd：`Form.Item` 的 `name` 注册，值由 **Form 内部管理**，`onFinish` 把 values 给你（**不需要 useState 管字段**） | React 显式状态哲学下逐字段 useState 太啰嗦，antd 用 Form 实例收口；Vue 模板双向绑定是语言级能力，值放响应式对象自然 |
| 4️⃣ 校验规则 | 声明式 `rules`（集中定义在表单组件） | 声明式 `rules`（写在 Form.Item 上） | **两边一致**：规则与校验时机解耦——Form 接管时机（失焦/提交），`@finish` / `onFinish` 只在全部通过后触发 |
| 5️⃣ 确认密码取值 | validator 直接读同组件的 `formState.password` | `dependencies={['password']}` + `getFieldValue('password')` | Vue 的值在响应式对象里直接可读；React 的值在 Form 内部 store，要声明字段联动 + API 取值 |
| 6️⃣ isLoggedIn 派生 | store 里 `computed(() => token !== '')` | **不存字段**，selector 派生 `useAuthStore((s) => s.token !== '')` | 派生状态不存储：Vue computed 标准写法；Zustand 无计算属性，使用处计算（呼应模块 3 的派生状态概念） |
| 7️⃣ 登录态持久化 | `watch([token, user])` 变化时写 | `useAuthStore.subscribe` 变化时写 | 复用模块 3 的持久化三要素：时机（变化时写、初始化时读）、序列化、防御 |

## 关键 API / 配置

1. **`router.beforeEach(to => ...)`**（Vue）：全局前置守卫。返回值三语义：`undefined`/`true` 放行、`false` 取消导航、**路由位置对象 = 重定向**；
2. **`meta`**（Vue）：路由元信息——把「路由的附加数据」（如 `requiresAuth`）挂在路由配置上，守卫按它判断；
3. **`<Navigate>`**（React Router）：声明式重定向组件，渲染即跳转（`replace` 不留历史记录）；
4. **`useLocation`**（React Router）：拿当前路径（守卫重定向时作为 redirect 参数）；
5. **`useSearchParams`**（React Router）：读 query 参数（登录页读 redirect）；
6. **antd Form 的 `rules` + `validator`**：声明式校验；自定义校验器返回 Promise（resolve 通过 / reject 报错）；
7. **`dependencies` + `getFieldValue`**（antd React）：字段联动校验（确认密码依赖密码字段）；
8. **`message`**：成功/失败轻提示（登录成功 / 用户名或密码错误）；
9. **`config.headers.Authorization = 'Bearer <token>'`**：附带 token 的标准 HTTP 格式（Bearer 认证方案）。

## 踩过的坑

1. **守卫里 useAuthStore 的调用时机**：现象（若在 `router/index.ts` 模块顶层调 `useAuthStore()`，报 `no active Pinia`）→ 原因（模块加载早于 `main.ts` 里的 `app.use(pinia)`，调用时还没有活跃的 Pinia 实例——**模块 0 的坑重演**）→ 解决（**在守卫回调内部调用**——导航发生时应用已挂载、Pinia 已激活）。教训：组件外用 store 永远要问「调用时机在 pinia 激活之前还是之后」。
2. **mock 用户库刷新丢失**：现象（注册的新账号刷新页面后登录不上）→ 原因（mock 用户库是内存变量，页面刷新即重置）→ 解决（用户库持久化到 localStorage——复用模块 3 的持久化三要素；和 `cart-items` 同一模式）。

## 面试考点

### 1. React 为什么没有路由守卫？怎么实现等价效果？

**一句话**：React Router 的哲学是「路由即组件」——权限控制本质是**条件渲染**（没登录就不渲染目标页、渲染重定向），没有全局钩子就用包装器组件组装。

**展开**：
- `RequireAuth` 包住受保护路由：内部检查登录态，不通过渲染 `<Navigate>`；
- 对比 Vue 的 `beforeEach`（框架内置全局钩子 + meta 标记）；
- 两种都合法，差异源自设计哲学：**框架提供能力（Vue）vs 一切皆组件（React）**。

### 2. beforeEach 和 RequireAuth 各自的取舍？

**一句话**：beforeEach **集中管理**（一个函数管所有路由，适合权限矩阵复杂的项目）；RequireAuth **就地声明**（受保护路由显式包一层，一眼看出哪些页面要守）。

**展开**：
- beforeEach + meta：权限规则集中、可做复杂逻辑（角色矩阵、白名单）；劣势是规则分散在 meta 配置里，路由多了要维护；
- RequireAuth：类型安全、显式、可组合（可嵌套）；劣势是**忘了包就不守**——没有集中检查点；
- 真实项目两种都可能用（全局兜底 + 页面级细粒度）。

### 3. token 存哪？三种存储对比？

**一句话**：localStorage（持久、XSS 可读）/ sessionStorage（会话级、同样 XSS 可读）/ **httpOnly cookie**（JS 读不到、最安全、需服务端配合 + CSRF 防护）。

**展开**：
- 本项目 localStorage：简单 + 刷新不丢，教学够用；
- 真实项目推荐 **httpOnly cookie**：XSS 偷不走 token；代价是服务端要设置、要防 CSRF；
- 面试加分：能说出 trade-off（便利性 vs 安全性）而不是背一个答案。

### 4. Axios 拦截器做了哪四件事？

**一句话**：①baseURL 统一 ②请求拦截器**自动附带 token** ③响应拦截器统一错误处理（HTTP 层）④业务码统一检查（code !== 0 拒绝）。

**展开**：
- 为什么在拦截器做：统一（一处生效）、防漏（忘写也不漏）、可替换（换 httpOnly cookie 只改这里）；
- 追问「响应拦截器还能做什么」：**401 统一跳登录**（token 失效处理）、错误日志上报。

### 5. 声明式校验 vs 手写校验？

**一句话**：`rules` 声明「规则」，Form 接管「校验时机」（失焦/提交），`finish/onFinish` 只在全部通过后触发——**规则与时机解耦**。

**展开**：
- 手写校验 = 提交时一堆 if：规则散落、时机手工管理、漏校验难发现；
- 声明式：规则集中、可读、antd 自动在正确时机校验并展示错误；
- 追问自定义校验：validator 返回 Promise（antd React resolve/reject）/ 抛错（antdv）。

### 6. 守卫里为什么要在回调内调用 useAuthStore？

**一句话**：Pinia 的 store 必须在 `app.use(pinia)` 之后才能在组件外调用；`router/index.ts` 的模块加载早于 main.ts 的 use(pinia)——顶层调用会报 `no active Pinia`。

**展开**：
- 回调的执行时机是「导航发生时」——那时应用已挂载、Pinia 已激活；
- 这是「模块加载顺序」的经典坑（本项目模块 0 首次踩过，这里重演）——**组件外用 store 永远要问调用时机**。

### 7. 登录后怎么跳回来源页？

**一句话**：守卫重定向时把来源路径放进 query（`?redirect=/cart`），登录成功后读取 redirect 优先跳转，没有则回默认页。

**展开**：
- 链路：守卫 `query: { redirect: to.fullPath }` → 登录页读 query → `router.push(redirect)`；
- **安全细节（加分）**：redirect 要校验只允许**站内路径**（必须以 `/` 开头、不含 `//`），防止「开放重定向漏洞」（被诱导跳到钓鱼站）。

## 如果换成另一个框架我会怎么写

### 1. beforeEach → React 怎么实现「全局」效果？

- **Vue**：注册一次，所有导航都过，集中不漏；
- **React Router**：没有全局钩子——每个受保护路由显式包 RequireAuth（忘了包 = 漏守）；或自己组装「集中式守卫」（路径白名单 + 顶层守卫组件）；
- **效果差异**：集中式不漏但规则集中维护；包装器显式但靠自觉。真实 React 项目常两者结合（布局级守卫 + 敏感页面单独包）。

### 2. RequireAuth → Vue 里等价物？

- **Vue 也能组件包装**（AuthGuard + slot 或嵌套路由 + `router-view`），但**惯用法是 beforeEach + meta**；
- 对比结论：Vue 给了两种选择（内置守卫更惯用），React 只有一种（组件组装）——**内置能力 vs 组装能力**，选型时优先用框架惯用法。

### 3. antd 两端 Form API 差异的根因？

- **React 版**：Form 内部管理值——因为 React 受控表单逐字段 useState 太啰嗦，antd 用 Form 实例收口，`onFinish` 时交付 values；
- **Vue 版**：模板双向绑定（v-model）是框架级能力，值放在你的响应式对象里自然；
- **本质**：React 的「状态显式传递」哲学 vs Vue 的「响应式绑定」哲学，在表单这个场景的具体体现。

### 4. token 放 httpOnly cookie 后，拦截器还要做什么？

- **不用再手动附 Authorization**——浏览器对同源请求自动携带 cookie；
- **但要防 CSRF**（SameSite 属性 / CSRF token）——安全模型从「防 XSS 偷 token」变成「防跨站伪造请求」；
- 拦截器的角色转变：从「附带 token」变成「统一处理 401 跳登录」；
- 面试加分：说清迁移不只是换存储位置，而是**安全对抗面的变化**（XSS ↔ CSRF）。
