---
title: 订单结算与历史
slug: module-5
date: 2026-10-13
tags: [技术, 前端, Vue, React]
readTime: 12
---

# 模块 5 笔记：订单结算 + 订单历史

## 实现思路

### 六步旅程

1. **想清楚**：Order/OrderItem 类型、POST/GET /orders 约定、**优惠券三层派生链**、受保护路由
2. **静态骨架**：/checkout /orders 路由 + 两页写死渲染 + 「去结算」跳转
3. **拆分组件**：CheckoutForm（三层派生链）、OrderList、OrderStatusTag（映射型组件）
4. **接入数据**：结算页读 cart store（快照转换）→ 下单 → 清空购物车；订单历史分页（useInfiniteQuery vs 手动组装）
5. **状态管理**：下单动作已随第 4 步完成；错误边界作为选做（见文末）
6. **验证与笔记**：下单闭环、无限滚动测试

### 下单数据流

```
购物车条目 CartItem[]（store，唯一数据源）
  → 显式快照转换（map 挑契约字段）→ OrderItem[]
  → CheckoutForm 三层派生链（小计 → 折扣 → 应付，零存储）
  → emit submit → 页面组装 payload → createOrder（mock 后端算价）
  → 成功：清空购物车 + 跳订单历史
  → React：invalidateQueries 让订单列表缓存失效（新订单可见）
```

### 订单历史数据流
```
进入页面 → 拉第 1 页
  → Vue：onMounted 手动 loadPage(1)，loadMore 追加（四件套手动管理）
  → React：useInfiniteQuery 自动管理（data.pages + getNextPageParam 声明式判定）
```

## 关键差异对比

| 项 | Vue 版 | React 版 | 为什么 |
|----|--------|----------|--------|
| 1️⃣ 无限滚动 | **手动组装四件套**：page / orders / hasMore / loading 全手动维护，loadPage 里手写追加逻辑 | `useInfiniteQuery`：框架管理分页状态——`data.pages`（结构化分页）、`hasNextPage`（自动）、`fetchNextPage`、`isFetchingNextPage` | 专用 API 把「分页状态管理 + 追加合并 + 下一页判定 + 加载态」收口成声明式——手写四件套容易错（追加忘了区分首页替换、hasMore 判断写错等） |
| 2️⃣ 下一页判定 | 手动维护 `page.value`，`hasMore` 由接口返回直接存 | `getNextPageParam: (lastPage, allPages) => lastPage.hasMore ? allPages.length + 1 : undefined`——**返回 undefined 即没有更多**，hasNextPage 自动派生 | React Query 的声明式判定：你只说「怎么算下一页」，框架自动算 hasNextPage |
| 3️⃣ 缓存与失效 | 无缓存——onMounted 每次进页面重新拉取（天然不存在「数据过期」） | 有缓存——下单后需 `invalidateQueries({ queryKey: ['orders'] })` 让列表失效重拉 | **有缓存才需要缓存管理**：React Query 秒显旧数据 + 后台刷新（stale-while-revalidate 思想）；代价是数据变更后要主动失效 |
| 4️⃣ 金额计算 | mock 的 `calcTotal` 在 **API 层（模拟后端）** 算价，前端应付仅展示参考 | 同左 | 前端金额不可信（可篡改、并发下价格会变）——**下单金额以下单返回的 totalAmount 为准**，真实电商铁律 |
| 5️⃣ 三层派生链 | computed 链式组合：`subtotal` → `discount`（依赖 couponId+subtotal）→ `payable`（依赖 discount）——依赖**自动追踪** | useMemo 链式组合：每环手动声明依赖（`[items]` / `[couponId, subtotal]` / `[subtotal, discount]`) | 派生状态的派生状态——**链式组合**时 Vue 自动追踪，React 每环手动（忘写 → 级联错误：第二层错第三层跟着错） |
| 6️⃣ 快照转换 | `items.map(({ productId, name, price, quantity, image }) => ({...}))` 显式挑字段 | 同左 | CartItem 的 `id`/`specs` 是**购物车合并用字段**，不属于订单契约——显式挑选 = 契约明确，多余字段不混入存储 |

## 关键 API / 配置

1. **`useInfiniteQuery`**（React Query）：`queryFn({ pageParam })` / `initialPageParam` / `getNextPageParam(lastPage, allPages)` / `hasNextPage` / `fetchNextPage()` / `isFetchingNextPage`；渲染用 `data.pages.flatMap(p => p.list)` 扁平化；
2. **`invalidateQueries({ queryKey })`**（React Query）：把缓存标记为「过期」并触发重新拉取——**不是删除缓存**（旧数据先显示，新数据回来替换），stale-while-revalidate 思想；
3. **`Record<OrderStatus, { color; text }>`**（TS）：映射表 + **穷举检查**——OrderStatus 加新状态漏写映射 → 编译报错（if/else 链漏了不报错），用类型系统保证映射完整；
4. **`a-empty` / `Empty`**：空态组件（空购物车 / 无订单）；
5. **`a-spin :spinning` / `<Spin spinning>`**：加载遮罩（分页加载时盖住列表）。

## 踩过的坑

1. **下单后订单列表不显示新订单**（React）：现象（下单成功跳转后列表没有刚下的单）→ 原因（React Query 缓存了 ['orders'] 的旧数据，跳转时秒显缓存）→ 解决（下单成功后 `invalidateQueries` 失效该缓存）——**有缓存就必须管理缓存**。
2. **空购物车能进结算页**：现象（购物车删空后手动输 URL 仍可进 /checkout）→ 原因（守卫只挡未登录，不挡空车）→ 解决（结算页内再做 items.length === 0 的空态分支）——**守卫管身份，页面管业务前置条件**，两层防御各司其职。

## 面试考点

### 1. useInfiniteQuery 解决了什么问题？和手写分页的差异？

**一句话**：把「分页状态管理、追加合并、下一页判定、加载态」收口成声明式 API——手写四件套（page/orders/hasMore/loading）容易错。

**展开**：
- 手写痛点：追加逻辑要区分「首页替换 / 后续追加」、下一页页码手动维护、hasMore 和 loading 容易写漏；
- useInfiniteQuery：`data.pages` 结构化保存每页数据（flatMap 扁平化渲染）、`getNextPageParam` 声明式判定（undefined = 没有更多）、`hasNextPage`/`isFetchingNextPage` 自动派生；
- 追问「触底自动加载怎么做」：监听滚动（IntersectionObserver），触底调 `fetchNextPage()`——UI 交互层的事，和本 API 正交。

### 2. invalidateQueries 做了什么？是删除缓存吗？

**一句话**：不是删除——是把 queryKey 标记为「过期」并触发重新拉取；旧数据先显示，新数据回来后替换。

**展开**：
- stale-while-revalidate 思想：先给旧数据（快），后台刷新（准）；
- 触发时机：活跃的组件实例立即重拉；不活跃的下次挂载时重拉；
- 对比：手动方案（Vue 版）无缓存，每次进页面 loading 重拉——简单但体验略差（无秒显）。

### 3. 为什么下单金额以后端为准？

**一句话**：前端金额不可信（可篡改、并发下价格可能变化）——前端应付仅展示参考，以下单返回的 totalAmount 为准。

**展开**：
- mock 的 `calcTotal` 放在 API 层（模拟后端算价）；
- 真实电商：优惠券规则由后端下发、价格以后端下单时点为准（前端展示价可能已过期）；
- 延伸：前端校验都不做安全假设（模块 4 的 store 钳制同理）——「UI 层限制只是交互体验，数据正确性由数据层保证」。

### 4. 三层派生链为什么每环都不存储？

**一句话**：派生状态不存储（模块 3 结论）——小计/折扣/应付都是**计算规则**，存任何一环都会产生不同步风险。

**展开**：
- 链式组合：第二层依赖第一层的结果（discount 依赖 subtotal）、第三层依赖第二层（payable 依赖 discount）；
- Vue computed 自动追踪（链上任何源头变，整条链自动失效重算）；
- React useMemo 手动声明——**忘写一环会级联出错**：discount 忘写 subtotal → 券条件用旧小计 → 应付金额错（且第二层的错会传染第三层）。

### 5. 下单快照转换为什么要显式挑字段？

**一句话**：CartItem 的 id/specs 是购物车合并用字段，不属于订单契约——显式 map 挑选让契约明确，多余字段不混入存储。

**展开**：
- 直接传整个对象：TS 结构兼容不会报错（宽类型赋窄参数），但多余字段会被 JSON 序列化存进 localStorage（数据膨胀、语义混乱）；
- 显式转换 = 「两种领域对象之间的边界」——下单本质是**数据形态转换**（购物车 → 订单），边界处的显式映射是好习惯。

### 6. hasMore 为什么由后端返回而不是前端算？

**一句话**：分页协议的标准做法——后端最清楚「还有没有」，前端只信协议。

**展开**：
- 前端算 `page × size < total` 在数据并发变化时可能算错（别人刚下单，total 变了）；
- 协议化（hasMore）让前后端解耦：前端不需要知道 size 是多少、total 怎么变。

## 如果换成另一个框架我会怎么写

### 1. Vue 手动无限滚动 → React useInfiniteQuery？四件套哪去了？

- `page` → 被 `data.pageParams` + `getNextPageParam` 内部管理；
- `orders` → `data.pages`（结构化保存每页，flatMap 扁平化）；
- `hasMore` → `hasNextPage`（由 getNextPageParam 返回值自动派生）；
- `loading` → `isLoading`（首屏）/ `isFetchingNextPage`（加载下一页）；
- 本质：四件套从「手动状态」变成「框架派生」——和模块 1 的「React Query 管服务器状态」一脉相承。

### 2. invalidateQueries → Vue 手动方案需要吗？

- **不需要**——手动方案无缓存，每次 onMounted 重新拉取，天然没有「数据过期」问题；
- 这是「有缓存才需要缓存管理」的体现：React Query 的缓存带来秒显体验，代价是要在数据变更时主动失效；
- 代价对比：手动方案简单但每次 loading；缓存方案要懂失效时机但体验好——**复杂度不会消失，只会转移**。

### 3. 三层派生链在 React 里忘写一环的依赖会怎样？

- 例如 discount 的依赖数组忘写 `subtotal`：券条件判断用旧小计 → 应付金额错；
- **级联特性**：第二层的错会传染第三层（payable 依赖 discount 的结果）——派生链越长，stale closure 的影响越隐蔽；
- 防线：exhaustive-deps 静态检查（模块 3 已装）；Vue 侧无此问题（自动追踪）。

### 4. ErrorBoundary 在 Vue 里的对应物？（选做练习的概念部分）

- **React**：ErrorBoundary 组件（class 组件 `componentDidCatch` 或 `react-error-boundary` 库）——捕获**渲染期**错误（不含事件处理器/异步）；
- **Vue**：`onErrorCaptured`（组件级捕获后代错误）/ `app.config.errorHandler`（全局）；
- 面试点：React 的边界**只捕渲染期错误**（事件处理器和异步回调要 try/catch 自己管）；Vue 的 errorHandler 更全局——又是「框架内置能力 vs 组件组装」的对比；
- 选做练习：React 装 `react-error-boundary`，用 `<ErrorBoundary fallback={<Result status="error" />}>` 包住 CheckoutPage；Vue 在 AppLayout 用 `onErrorCaptured` 记录后代错误。
