---
title: 购物车页
slug: module-3
date: 2026-10-10
tags: [技术, 前端, Vue, React]
readTime: 10
---

# 模块 3 笔记：购物车（增删改、合计、持久化）

## 实现思路

### 六步旅程

1. **想清楚**：页面结构（CartTable / QuantityStepper / CartSummary / 空态）、`/cart` 路由、交互清单、持久化策略（变化时写、初始化时读）
2. **静态骨架**：注册 /cart 路由 + 写死 2 条渲染（**前置修正**：CartItem 加唯一 id）
3. **拆分组件**：CartTable（条目表格）、QuantityStepper（受控步进器）、CartSummary（纯展示合计栏）
4. **接入数据**：store 为唯一数据源（**无请求层**）+ 增删改动作闭环 + 空购物车态
5. **状态管理**：合计换成 computed / useMemo + localStorage 持久化
6. **验证与笔记**：增删改、刷新持久化、防御验证测试

### 数据流

```
cart store（唯一数据源，localStorage 持久化）
  → 页面读取渲染（items）
  → 事件上行：QuantityStepper → CartTable → Page
  → 页面调 store 动作（changeQuantity / removeFromCart / clearCart / addToCart）
  → 状态变化
  → watch(items, { deep }) / store.subscribe → localStorage 写入
  → 派生状态 computed / useMemo → 合计栏
```

> 本模块和模块 1/2 的最大不同：**没有请求层**——购物车是客户端状态，store 就是唯一数据源。

## 关键差异对比

| 项                   | Vue 版                                                                   | React 版                                                       | 为什么                                                                                                                           |
|---------------------|-------------------------------------------------------------------------|---------------------------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------|
| 1️⃣ 派生状态            | `computed`——依赖**自动追踪**（Proxy，读了谁就依赖谁）+ 缓存                               | `useMemo`——依赖**手动声明**（依赖数组）+ 缓存                               | Vue 有响应式依赖追踪；React 没有，必须手动声明。忘写依赖 → 旧闭包 bug。**这是两个框架最核心的对应概念之一**                                                              |
| 2️⃣ 数据源模式           | 购物车页**直接读 store**（无请求层）                                                 | 同左（useCartStore 选择器）                                          | 购物车是**客户端状态**（store 就是源）；列表页是**服务器状态**（走接口 + 缓存/竞态处理）。数据的所有权决定取数路径                                                            |
| 3️⃣ 持久化订阅           | `watch(items, fn, { deep: true })`                                      | `useCartStore.subscribe(fn)`                                  | Vue 用 watch 订阅响应式变化，**deep 才能捕捉 `existing.quantity +=` 这种原地修改**；Zustand 提供 store 级 subscribe，每次 set 全量通知（没有 deep 概念——每次都是新对象） |
| 4️⃣ 动作修改            | 响应式直接改：`existing.quantity +=` / `items.value = items.value.filter(...)` | 不可变更新：`items.map(...)` / `items.filter(...)` 生成新数组，命中对象替换为新对象 | Proxy 拦截原地修改 vs 引用比较（原地改 = 没变化 = 不重渲染）                                                                                        |
| 5️⃣ 跨层通信            | 逐层上报：QuantityStepper → CartTable → Page（emit 链）                         | 同构：回调 props 链                                                 | 简单清晰；跨多层时 Vue 用 provide/inject、React 用 Context（模块 6 主题）                                                                       |
| 6️⃣ 受控 vs 非受控（同类输入） | QuantityStepper **受控**（defineModel）；AddToCart **非受控**                   | 同构（value+onChange / 内部 useState）                              | **归属决定模式**：数量是条目的持久属性（被表格渲染 + 合计用，共享）→ 受控；加购前的一次性输入（自用）→ 非受控                                                                  |

## 关键 API / 配置

1. **`computed` / `useMemo`**：派生状态 + 缓存。Vue 依赖自动追踪；React 手动声明依赖数组（忘写 = 旧闭包 bug）；
2. **`watch(items, fn, { deep: true })`**（Vue）：持久化的「变化时写」。**deep 是关键**——不加 deep 捕捉不到 `existing.quantity +=` 这种嵌套属性原地修改；
3. **`useCartStore.subscribe(fn)`**（Zustand）：store 级订阅，每次 set 触发回调，拿到新 state——React 侧的「变化时写」；
4. **`localStorage.getItem / setItem`**：浏览器本地存储（字符串键值对，约 5MB，同源共享，不随会话消失）；
5. **`JSON.stringify / JSON.parse` + `as` 断言**：序列化与反序列化。存储里只有字符串，读回的数据编译器无法验证类型，断言是承诺（真实项目加运行时校验如 zod）；
6. **`crypto.randomUUID()`**：浏览器内置 UUID 生成（条目唯一 id），无需装包；
7. **`a-empty` / `Empty`**：空态组件（购物车为空时 + 「去逛逛」导航）；
8. **`Math.min / Math.max` 钳制**：store 层数量守门（数据完整性不依赖 UI 层）。

## 踩过的坑

1. **购物车图片空白**：现象（加购后条目无图）→ 原因（模块 1 建 mock 时 `image` 字段留空，加购快照把空串存了进去；轮播有图是因为 gallery 动态生成，image 没人填）→ 解决（mock 里 `forEach` 按商品 id 生成缩略图 + 列表表格补 img 渲染——填了图之后列表的图片列会显示 URL 文本，必须一起改）。
2. **CartItem 缺唯一 id**：现象（静态骨架时发现）→ 原因（同商品不同规格是两个条目但 productId 相同，row-key 会冲突；删除/以后勾选无法唯一定位）→ 解决（加 `id: crypto.randomUUID()`，row-key、删除、合并、以后勾选全靠它）——**后续需求暴露前期设计不足，回头修正是常态**。

## 面试考点

### 1. computed vs useMemo 的区别？最大区别是什么？

**一句话**：两者都是「派生状态 + 缓存」，最大区别是**依赖追踪方式**——computed 自动（Proxy 追踪），useMemo 手动（依赖数组）。

**展开**：
- Vue computed：读了谁就自动依赖谁，不存在「忘写依赖」；
- React useMemo：忘写依赖 → 返回旧缓存值（旧闭包里的旧数据）——数据不更新的 bug，**不报错、难排查**；
- React 生态的补丁：`eslint-plugin-react-hooks` 的 exhaustive-deps 规则自动检查；
- 定位差异：computed 是 Vue 派生状态的标准写法；useMemo 是性能优化（小计算不用也行，每次重算代价小）。

### 2. 为什么合计用 computed/useMemo 而不是模板里直接算？

**一句话**：可读性（一长串表达式变一个语义化名字）、缓存（依赖不变不重算）、复用（多处用同一派生值）。

**展开**：
- 模板 inline reduce：每次渲染重算、和视图耦合、不可复用；
- computed/useMemo：定义一处，语义清晰；
- 诚实版：小数组重算代价很小——真正收益是可读性和复用，缓存对大数组/复杂计算才明显。面试时这么说比夸大缓存更专业。

### 3. 前端持久化三要素？

**一句话**：时机（变化时**写**、初始化时**读**）、序列化（JSON.stringify / parse）、防御（try/catch 兜底）。

**展开**：
- 时机错 → 数据丢失或互相覆盖；
- 序列化 → localStorage 只有字符串，对象必须序列化；读回的类型编译器无法验证（断言 + 真实项目加运行时校验）；
- 防御 → localStorage 可能被用户清除、隐私模式禁用、数据损坏（parse 抛错）——必须兜底退回默认值（本项目的 `catch { return [] }`）。

### 4. 手写持久化 vs 官方插件（pinia-plugin-persistedstate / Zustand persist）？

**一句话**：本质完全一样——都是「变化时写、初始化时读」；插件只是把这条链路封装了。

**展开**：
- 手写：逻辑直白，学本质，小项目够用；
- 插件：一行配置，额外支持选择字段持久化、storage 可替换（sessionStorage）、版本迁移；
- 面试策略：能说清手写原理再提插件，证明不是「只会调库」。

### 5. 为什么购物车直接读 store 而列表页走接口？

**一句话**：购物车是**客户端状态**（store 就是唯一数据源）；列表是**服务器状态**（要缓存、竞态处理，走接口 + 请求层/React Query）。

**展开**：
- 数据的「所有权」决定取数路径：从服务器来的数据有缓存/过期/竞态问题，需要专门处理；客户端生成和维护的数据（购物车、表单草稿）直接放 store；
- 混合情况：登录用户的服务器购物车要同步——先客户端 store、后端就绪后同步（真实电商的做法）。

### 6. 为什么数量钳制要在 store 做而不是只靠 UI 层？

**一句话**：数据完整性由数据层（store）保证，不能依赖 UI 层——UI 可能被绕过（直接调 store、改 localStorage）或改版。

**展开**：
- UI 的 min/max/disabled 只是**交互限制**；store 里 `Math.min(99, Math.max(1, quantity))` 是**数据守门**；
- 同源思路：服务端也必须校验（不能只信前端表单）——前后端各守一道是通用原则。

### 7. 购物车条目为什么需要唯一 id？

**一句话**：同商品不同规格是不同条目（productId 会重复），删除、合并、以后勾选结算都需要唯一定位。

**展开**：
- row-key 冲突（渲染错乱）、删除定位、模块 5 勾选结算的选中集合——全靠 id；
- 领域建模基本功：**集合里的实体要有身份标识**——「看起来一样的两条数据」和「同一条数据」必须可区分。

## 如果换成另一个框架我会怎么写

### 1. Vue 的 computed（依赖自动追踪）→ React 的 useMemo？忘写依赖会怎样？

- **Vue**：自动追踪，读了谁就依赖谁，「忘写依赖」这个概念不存在；
- **React**：忘写依赖数组里的项 → useMemo 返回**旧缓存值**（旧闭包里的旧数据）——UI 不更新的 bug，不报错、难排查；
- 生态补丁：exhaustive-deps 规则自动检查；
- **本质**：Proxy 依赖追踪 vs 重新执行 + 依赖比对——React 一贯哲学的延续。

### 2. Vue 的 watch(items, { deep: true }) → React 的 store.subscribe？

- **Vue**：watch 订阅响应式数据变化；**deep: true 才能捕捉嵌套属性的原地修改**（`existing.quantity +=`），不写 deep 会漏掉这类变化；
- **React/Zustand**：subscribe 订阅 store 的**每次 set**，回调拿到新 state——没有 deep 概念，因为每次更新都是新对象，天然全量通知；
- **对应关系**：都是「变化 → 回调」的订阅机制；差异在 Vue 按依赖粒度通知（要显式开 deep），React 全量通知（要自己比对关心的字段）。

### 3. Vue 直接改 items（+= / push / filter 赋值）→ React 的不可变更新？

- **Vue**：`existing.quantity +=`、`items.value.push(...)`、`items.value = items.value.filter(...)`——Proxy 拦截，直接改即可；
- **React**：`map` / `filter` / 展开生成**新数组**，命中对象替换为**新对象**——引用变化是渲染信号；
- **一句话**：同样的增删改，Vue 改「值」，React 改「引用」。

### 4. 手写持久化 → 官方 persist 插件，本质还是「变化时写、初始化时读」吗？

- **是**。插件内部同样是：订阅变化 → 序列化写入；初始化 → 反序列化读回；
- 插件的额外价值：字段选择（只持久化部分状态）、storage 可替换（sessionStorage）、数据版本迁移；
- 面试策略：先讲清手写三要素（时机/序列化/防御），再提插件是封装——证明懂原理而不是只会调库。
