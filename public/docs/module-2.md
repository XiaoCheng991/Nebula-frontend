---
title: 商品详情页
slug: module-2
date: 2026-10-09
tags: [技术, 前端, Vue, React]
readTime: 15
---

# 模块 2 笔记：商品详情（路由、轮播、规格、加购）

## 实现思路

### 六步旅程
1. **想清楚**：`ProductDetail` 接口（extends Product，多 gallery/specs）、`GET /products/:id` 约定、详情页结构、路由规划
2. **静态骨架**：建 router 配置、列表页挂路由 + 「查看详情」跳转、详情页写死假数据渲染
3. **拆分组件**：拆出 ProductGallery（纯展示）、SpecSelector（受控）、AddToCart（非受控）
4. **接入数据**：根据**路由参数**异步获取详情，处理 loading / 404 / 错误三种态
5. **状态管理**：加入购物车写入 cart store（跨页面共享，存快照）
6. **验证与笔记**：跳转/轮播/规格/加购测试；对比笔记

### 详情页数据流
```
路由参数 id
  → watch(() => route.params.id) / useEffect([id])
  → 请求 getProductDetail(id)
  → 四种 UI 态：loading（未返回）/ 404（null）/ 错误（抛错）/ 正常（对象）
  → 选规格（受控状态在页面）+ 选数量（非受控状态在子组件）
  → 点加购 → cart store（快照 + 同规格合并数量）
```

### API 约定
```text
GET /products/:id
Response: ApiResponse<ProductDetail>
业务约定: code === 0 成功；商品不存在返回 null（前端显示 404 态）
```

### 路由规划
```text
/              → 重定向到 /products
/products      → 商品列表页
/products/:id  → 商品详情页
```

> 记忆点：Vue 的路由是「**配置**」，React 的路由是「**组件**」。

## 关键差异对比

| 项            | Vue 版                                                     | React 版                                                        | 为什么                                                                                          |
|--------------|-----------------------------------------------------------|----------------------------------------------------------------|----------------------------------------------------------------------------------------------|
| 1️⃣ 路由配置哲学   | 配置对象：`createRouter({ routes: [...] })`，中央化、一个文件管所有路由      | 组件声明：`<Routes><Route path element /></Routes>`，路由即组件树，写在 JSX 里 | React 的设计哲学是「一切皆组件」，路由也表达成组件；Vue 把路由抽象成配置数据集中管理                                              |
| 2️⃣ 路由参数获取   | `useRoute().params.id`——**路由对象是响应式的**，能被 watch 追踪         | `useParams()`——返回参数对象，值类型 `string \| undefined`，是渲染时的普通值       | Vue 路由对象可被响应式追踪；React 的 params 只是渲染传入的值，靠重新渲染更新                                              |
| 3️⃣ 参数变化重新请求 | `watch(() => route.params.id, load, { immediate: true })` | `useEffect(() => load(Number(id)), [id])`                      | 两者都是「依赖驱动」：watch 自动追踪响应式依赖，useEffect 靠**手动声明**依赖数组；Vue 用 `immediate` 做首查，React 靠 effect 首次执行 |
| 4️⃣ 自定义单元格   | `#bodyCell` 插槽（模板层）                                       | `columns[].render` 函数（配置层）                                     | Vue 模板天然适合插槽；React 的列配置是 JS 对象，用 render 返回 JSX 更自然                                           |
| 5️⃣ 受控模式     | `defineModel()`——v-model 的组合式写法（props + emit 的语法糖）        | `value + onChange` 双 props，显式写                                 | 本质相同（状态在父、子上报变化）；Vue 有 v-model 语法糖，React 没有，必须显式                                             |
| 6️⃣ 派生状态     | `computed`——依赖变化自动重算并缓存，Vue 自动知道依赖谁                       | **无计算属性** → 使用处计算或 `useMemo`（手动声明依赖，模块 3 讲）                    | Vue 有响应式依赖追踪；React 没有，必须手动声明依赖或每次渲染重算。**注意：useState 的对应物是 ref，不是 computed**                  |
| 7️⃣ 不可变更新    | `existing.quantity += quantity`——直接改，Proxy 自动拦截并通知        | `items.map(...)` 生成新数组 + 替换为新对象                                | Vue 靠 Proxy 拦截原地修改；React 靠**引用比较**判断变化，原地改引用不变 → 不重渲染                                        |
| 8️⃣ 样式隔离     | `<style scoped>` 内置隔离，样式必须跟着组件走                           | 全局 CSS，任意文件定义都生效（进阶用 CSS Modules 获得隔离）                         | Vue 的 SFC 自带 scoped；React 默认全局 CSS，靠命名约定隔离                                                   |

## 关键 API / 配置

1. **`createRouter` / `createWebHistory`**（Vue）：创建路由实例 + 指定 history 模式。history 模式的深层路径刷新依赖服务端 SPA 回退；
2. **`useRoute` / `useRouter`**（Vue）：`useRoute()` 读当前路由信息（params/query）；`useRouter()` 做编程式导航（push/back）。**两者别混**；
3. **`useParams` / `useNavigate`**（React）：对应上面的读取 / 导航；
4. **`a-carousel` / `Carousel`**：图片轮播组件；
5. **`#bodyCell`**（antdv）：Table 的自定义单元格插槽（对照 React 的 `columns[].render`）；
6. **`defineModel`**（Vue 3.4+）：v-model 的组合式写法 = props `modelValue` + emit `update:modelValue` 的语法糖；
7. **`a-result` / `Result`**：结果页组件，用于 404 态与错误态展示（status="404" / "error"）；
8. **`message`**：轻提示（规格未选全 → warning；加购成功 → success）；
9. **`Omit<T, K>`**（TS 工具类型）：去掉指定字段，`Omit<CartItem, 'quantity'>` 表示「除数量外的条目快照」——数量由 store 的合并逻辑管理，签名即文档；
10. **`!= null` 收窄**（TS）：宽松不等能同时排除 `null` 和 `undefined`，收窄为「有数据」的类型。

## 踩过的坑

暂略。

## 面试考点

### 1. Vue 路由和 React 路由的配置差异？为什么一个是配置一个是组件？

**一句话**：Vue 用配置对象（`createRouter` + routes 数组，中央化）；React 用组件声明（`<Routes>/<Route>`，路由即组件树）。

**展开**：
- React 的哲学是「一切皆组件」——路由也是组件，所以落在 JSX 里，能直接用组件能力（条件渲染、嵌套布局、传 props）；
- Vue 把路由抽象成配置数据，集中在 `router/index.ts`，配合 `app.use(router)` 注册 + `<router-view>` 作渲染出口；
- 一句话总结：配置式胜在「集中管理」，组件式胜在「表达力」。

### 2. 路由参数怎么拿？参数变了怎么重新请求？

**一句话**：Vue 用 `useRoute().params.id`（响应式）+ watch；React 用 `useParams()`（string | undefined）+ `useEffect([id])`。

**展开**：
- Vue：路由对象是响应式的 → `watch(() => route.params.id, load, { immediate: true })`，参数变化自动重新请求，`immediate` 管首次加载；
- React：params 是渲染时的普通值 → `useEffect(() => load(id), [id])`，依赖数组驱动；
- 本质：都是「依赖驱动」，区别在依赖追踪**自动**（Vue）还是**手动声明**（React）。

### 3. 什么是受控组件/非受控？什么时候用哪个？

**一句话**：受控 = 状态在父（状态源），子组件通过 `value + onChange`（React）/ `defineModel`（Vue）渲染 + 上报；非受控 = 状态在子组件内部，父需要时通过事件读取。

**展开**：
- 判断依据：**状态被几个组件使用**——多个组件共享 → 提升到最近公共父级（受控）；单个组件自用 → 留内部（非受控）；
- 本模块实例：SpecSelector 受控（选中的规格被 SpecSelector 渲染、AddToCart 加购时使用）；AddToCart 的数量非受控（只有它自己用，点加购时作为事件载荷上报）；
- 追问：React 里受控组件更可预测（单一数据源），非受控更简单（适合一次性取值）。

### 4. v-model 的本质是什么？

**一句话**：v-model = 「**props 下行 + 事件上行**」的语法糖。

**展开**：
- `v-model="x"` 展开即 `:modelValue="x" + @update:modelValue="x = $event"`；
- Vue 3.4+ 的 `defineModel()` 是它在组合式 API 里的写法，子组件里得到一个可读写的 model；
- 面试点：正因为它只是语法糖，所以**没有破坏单向数据流**——子组件仍然只是「提醒父组件更新」，而不是直接改父的数据。

### 5. 购物车为什么存快照而不是引用？

**一句话**：快照（加购时固化 price/name/specs/image）符合电商语义——价格变动、商品下架都不影响已加购的条目。

**展开**：
- 快照：展示直接可用，无需反查；代价是冗余存储；
- 引用（只存 productId）：数据永远最新一致；但要反查、商品删除后购物车崩、且丢失「加购时的价格」这个历史信息；
- 真实电商（淘宝/京东）用的就是快照 + 下单时再次校验最新价格。

### 6. 四种数据状态怎么区分？`null` 和 `undefined` 的区别？

**一句话**：`undefined` = 还没返回（loading）；`null` = 资源不存在（404）；对象 = 成功；抛错 = 网络失败。

**展开**：
- 详情页据此渲染四种 UI：Spin 遮罩（loading）/ Result 404（null）/ 正常渲染 / Result error + 重试按钮；
- **关键设计**：mock 对不存在的 id 返回 `null`（而不是抛错）——前端才能区分「404」和「网络错误」；
- TS 技巧：`detail != null` 收窄为「有数据」的类型（同时排除 null 和 undefined）。

### 7. SPA history 模式为什么需要服务端回退？

**一句话**：history 模式下刷新深层路径时，浏览器会真实地向服务器请求这个路径，服务器必须返回 index.html 让前端路由接管。

**展开**：
- Vue Router 的 `createWebHistory` / React Router 的 `BrowserRouter` 都是 history 模式；
- 开发环境亲历：Vite 默认 `appType: 'spa'` 内置了回退（模块 0 那次 `/api/products` 返回 HTML 就是它）；
- 生产环境需要 Nginx 配置 `try_files $uri /index.html;`——面试常问的部署题。

## 如果换成另一个框架我会怎么写

### 1. Vue 的路由对象（响应式）→ React 的 params 只是普通值？重新获取的机制差异？

- **Vue**：`route` 是响应式对象，`watch(() => route.params.id)` 自动追踪——参数变 → 回调自动执行；
- **React**：`useParams()` 返回渲染时的普通值快照，本身不可监听——只能把它放进 `useEffect` 依赖数组，靠「重新渲染 → 依赖比对变化 → effect 重跑」；
- **本质**：Vue 是「数据变化通知」（Proxy 追踪），React 是「重新执行 + 依赖比对」。

### 2. Vue 的 defineModel 受控 → React 的 value+onChange？为什么 React 没有 v-model？

- **Vue**：`defineModel()` 一行搞定双向绑定，语法糖掩盖了 props + emit 的细节；
- **React**：显式写 `value` + `onChange`——父传当前值，子调用回调上报；
- **为什么 React 没有 v-model**：React 的核心原则是「props 只读 + 显式数据流」，v-model 这种「双向」语法糖会模糊数据流向；React 宁愿让你显式写 onChange，保持「数据只有一个来源」。

### 3. Vue 的 `existing.quantity +=` 直接改 → React 为什么必须 map 生成新对象？

- **Vue**：对象被 Proxy 包住，`existing.quantity += 1` 被拦截 → 精确通知依赖该属性的地方更新；
- **React**：没有属性级依赖追踪，判断「要不要重渲染」靠**引用比较**（Object.is）——原地改引用不变 → 认为没变化 → 不重渲染；
- 所以 React 必须生成新数组/新对象（`items.map`），让**引用变化成为「变化的信号」**。代价是手动不可变更新，收益是可预测的渲染。

### 4. Vue 的路由配置对象 → React 的组件声明式路由，各自优缺点？

- **Vue（配置对象）**：优——中央化，一眼看全所有路由，方便做全局守卫（`beforeEach`）；缺——路由与组件分离，动态逻辑要写在配置外；
- **React（组件声明）**：优——路由即组件，能用组件的一切能力（条件渲染、嵌套布局、传任意 props），动态路由更自然；缺——路由分散在 JSX 里，全局视角不如配置文件直观；
- 一句话：**配置式胜在集中管理，组件式胜在表达力**。
