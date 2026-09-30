---
title: 商品列表页
slug: module-1
date: 2026-09-29
tags: [技术, 前端, Vue, React]
readTime: 15
---

# 模块 1 笔记：商品列表（表格、分页、搜索）

## 实现思路
   <!-- 提示：六步法怎么走的？数据流向：搜索/翻页 → 状态变化 → watch(或 queryKey) → 请求 → 更新 -->


- **六步大纲**：
    1. **想清楚**：定义 `Product` interface 与 `GET /products` API 约定；画页面结构（搜索区 + 表格 + 分页）
    2. **静态骨架**：写死 3 条假数据渲染表格、分页、搜索框（不接请求）
    3. **拆分组件**：拆出 SearchBar、ProductTable、AppPagination；明确 props 与事件
    4. **接入数据**：mock 异步获取替换假数据，处理 loading
    5. **状态管理**：列表状态提升到 store（Vue: Pinia / React: React Query + Zustand）；补齐错误态、防抖、空数据
    6. **验证与笔记**：全部交互手动测试；对比笔记（含「换成另一个框架会怎么写」）

## 关键差异对比
   <!-- 提示：
   1. 状态分层哲学：Pinia 一把抓 vs React Query(服务器状态) + Zustand(客户端状态)
   2. 数据获取触发：watch([searchParams, page], { immediate: true }) vs useQuery({ queryKey })
   3. 竞态处理成本：手写请求序号(约5行) vs React Query 自动(0行)
   4. loading/error：手写 ref + try/catch vs React Query 自动提供
   5. 子→父通信：emit vs 回调 props（详见 one-way-data-flow.md）
   6. Vue computed 包装分页配置 vs React 直接用 props
   -->

| 项                            | Vue 版                                           | React 版                                                      | 为什么                                                             |
|------------------------------|-------------------------------------------------|--------------------------------------------------------------|-----------------------------------------------------------------|
| 1️⃣ 状态分层                     | Pinia是兼顾客户端和服务端统一管理状态                           | React Query来管理服务端的状态：对应接口返回的数据；Zustand管理客户端的状态：对应页面需要渲染相关的数据 | 核心在于React没有响应式，必须依靠库；Vue可以自动追踪依赖，而React需要依靠Zustand的订阅机制         |
| 2️⃣ 触发机制                     | watch immediate是在setup阶段同步首查，依赖变化自动重新加载         | queryKey是依赖声明，key变化自动 refetch，挂载自动首查                         | 两者都是声明式：声明依赖，变化自动执行，不用手动调                                       |                                                       
| 3️⃣ 竞态处理                     | 手写请求序号 seq，响应回来时 seq 不匹配就丢弃                     | React Query自动（0行）                                            | React Query 按 key 订阅，组件之人当前 key 的结果，旧key的响应自动丢弃 --- 服务器状态库的价值实证 |
| 4️⃣ loading/error            | 手写：loading ref + try/catch 存 error + finally 复位 | React Query自动提供`isLoading/error`                             | 错误是「状态」不是异常；React Query把查询生命周期自动化                               |
| 5️⃣ 子->父通信                   | emit事件进行通知                                      | 回调props                                                      |                                                                 |
| 6️⃣ computed 包装 vs 直接用 props | 计算属性中去监听                                        | 依旧依靠props                                                    |                                                                 |


## 关键 API / 配置
   <!-- 提示：antd Table 的 pagination 配置（current/pageSize/total/onChange）；
        React Query 的 queryKey/queryFn/retry；Zustand 的 set 不可变更新；
        storeToRefs（为什么不能直接解构 store）；请求序号 seq 模式 -->

1. **antd Table 的 pagination 分页配置**：
    - `current`：当前页码
    - `pageSize`：每页条数
    - `total`：总条数
    - `onChange`：页码或每页条数变化时的回调
2. **useQuery**的 `queryKey/queryFn/retry`：
    - `queryKey`：依赖声明，变化时触发请求
    - `queryFn`：异步请求函数
    - `retry`：失败重试次数，默认 3 次

3. Vue侧（Pinia）：
    - `storeToRefs`：解构 store 时保持响应性
    - 请求序号`seq`：手动解决，避免竞态问题

4. React侧（React Query + Zustand）：
    - queryKey/queryFn/retry：依赖声明、请求函数、默认重试 3 次
    - `set`：不可变更新状态，确保状态更新正确

## 踩过的坑
   <!-- 提示：
   1. Table 自带分页 → 页面出现两个分页器 → 移除独立 Pagination 改用内置
   2. React Query 默认 retry 3 次 → 错误不是立即显示 → 等重试耗尽或 retry: 0
   每条写：现象 → 原因 → 解决 -->

1. Vue中的`<a-table>`和React的Ant Design中`<Table>`组件自带分页功能，只需要配置一个`pagination`属性即可
2. React Query默认会进行3次重试，如果请求失败，错误不会立即显示，而是等到重试耗尽或者设置`retry: 0`后才会显示错误信息。Vue中的会直接拿到报错信息或者捕获异常进行显示。

## 面试考点
   <!-- 提示：
   1. 为什么 React 把服务器状态交给 React Query 而不是 Zustand？（痛点不同：缓存/竞态/过期）
   2. React Query 怎么处理错误？（自动捕获 + retry: 3 + 错误是状态不是异常）
   3. React Query 怎么解决竞态？（按 key 订阅，旧 key 的响应自动丢弃）
   4. 为什么 props 只读？（单向数据流，详见 one-way-data-flow.md）
   5. Vue watch immediate vs React Query 的依赖驱动（queryKey 就是依赖声明）
   6. 为什么不能直接解构 Pinia store？（丢失响应性，storeToRefs 解决）
   -->

1. 为什么 React 把服务器状态交给 React Query 而不是 Zustand？（痛点不同：缓存/竞态/过期）

> 服务器状态和客户端状态的痛点完全不同，工具应该跟着痛点走
- 客户端状态(搜索条件、页码、弹窗开关)：痛点是跨组件共享和更新通知 -> Zustand 这类轻量库够用
- 服务器状态(列表数据、详情数据)：痛点是缓存、去重、竞态、过期、后台刷新 -> 手写会很繁琐，React Query 这类专门库更合适
- React Query把这些全都自动化；塞进 Zustand 等于手写重造一个 React Query；

2. React Query 怎么处理错误？（自动捕获 + retry: 3 + 错误是状态不是异常）

> `queryFn` 抛错后 React Query 自动捕获，错误进入 error 状态，组件直接拿到 --- 不需要 try/catch
- `queryFn` 抛错 **/reject** -> 内部捕获 -> query 进入 error 状态 -> 组件按状态渲染UI
- 默认 retry 3次（指数退避）--- 瞬时网络抖动不会直接报错，重试耗尽才进入 error
- 核心理念：错误是「状态」不是「异常」--- 和 loading 一样属于查询生命周期

3. React Query 怎么解决竞态？（按 key 订阅，旧 key 的响应自动丢弃）

> 按 `queryKey`订阅 --- 组件只认当前 key 的结果，旧 key 的响应回来了也会被丢弃
- 快速点击第2页、第3页，产生两个在飞请求
- React Query为每个 key 独立管理查询；组件订阅的是当前key；
- 旧 key（第2页）的响应回来 --> 只写进旧 key 的缓存 -> 组件已订阅新key -> 显示不受影响
- 对比 Vue 手写：请求序号 seq，响应回来序号不匹配就丢弃

4. 为什么 props 只读？（单向数据流，详见 one-way-data-flow.md）
- 单一数据流 --- 数据所有者唯一（父组件或store），子组件只读渲染 + 事件上报

5. Vue watch immediate vs React Query 的依赖驱动（queryKey 就是依赖声明）
> 二者都是声明式的 --- 声明依赖，依赖变化自动重新执行，不用手动调用
- Vue：`watch([searchParams, page], load, { immediate: true })` --- 依赖变化自动重新load，`immediate` 让挂载时立即执行一次
- React：`useQuery({ queryKey: [...] })` --- **queryKey** 就是依赖声明，key 变化自动 refresh，挂载时自动执行第一次;
- 对应关系：watch 的依赖数组 ≈ queryKey；immediate：true ≈ React Query 挂载自动首查
- 区别：watch 是通用响应式机制，queryKey 是服务端状态专用（还带缓存/竞态/重试）

6. 为什么不能直接解构 Pinia store？（丢失响应性，storeToRefs 解决）
> 直接解构会丢失响应性 --- 解构出来的是普通值快照，后续变化不再通知组件
- `const { products } = store` -> products是「当时那一刻」的普通值；
- store 里数据变化后组件不更新了（响应链断了）
- `storeToRefs` 把每个状态包成 ref，解构后仍是响应式的；
- actions（函数）不能也不需要 storeToRefs -- 直接`store.xxx()`调用；
- React 对照：Zustand 用选择器`useStore((s) => s.count)`每次取新值，没这个问题；选择器还有性能好处（只订阅需要的字段）

## 如果换成另一个框架我会怎么写
   <!-- 思考题：
   1. Vue 的 Pinia store（products/loading/error + watch）→ 换成 React 怎么分工？
   2. Vue 的请求序号 seq → React 里还需要手写吗？
   3. Vue 的 watch([searchParams, page]) → React 里对应什么？
   -->

### 1. Vue 的 Pinia store（products/loading/error + watch）→ 换成 React 怎么分工？

- products（商品数据）、loading、error → React Query 管（data/isLoading/error 都是它返回的，不再手写）；
- searchParams（搜索条件）、page（页码）→ Zustand 管（客户端状态：查询条件）；
- watch([searchParams, page]) → queryKey 承担（查询条件放进 key，key 变化自动 refetch）；
- 结论：Pinia store 里「服务器状态的部分」整个消失（React Query 自动化），只剩「客户端状态部分」进 Zustand。

### 2. Vue 的请求序号 seq 在 React 里还需要手写吗？

- 不需要。React Query 按 key 订阅，旧 key 的响应自动丢弃，竞态零代码解决——这正是 React Query 的核心价值。

### 3. Vue 的 watch([searchParams, page], { immediate: true }) 对应 React 的什么？

- 对应 useQuery 的 queryKey: productKeys.list({ keyword, category, page })；
- watch 依赖数组 ≈ queryKey，immediate: true ≈ 挂载自动首查；
- 区别：watch 通用，queryKey 专为服务器状态设计（附带缓存/竞态/重试）。

