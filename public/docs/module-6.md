---
title: 主题切换 + 全局布局
slug: module-6
date: 2026-10-13
tags: [技术, 前端, Vue, React]
readTime: 12
---

# 模块 6 笔记：主题切换 + 全局布局

## 实现思路

### 六步旅程

1. **想清楚**：主题方案（CSS 变量 + antd 算法**两层跟随**）、初始化优先级（存储 > 系统偏好 > light）、布局结构、React 侧选 Context 的理由
2. **静态骨架**：**嵌套路由重构**（AppLayout 布局父路由）+ Header 导航/用户区 + 主题按钮占位
3. **拆分组件**：AppHeader、ThemeToggle（受控组件——theme 归数据源，按钮只渲染 + 上报）
4. **接入数据**：theme 全链路——Pinia / **Context + useTheme** + CSS 变量 + antd `darkAlgorithm` + matchMedia 读系统偏好
5. **状态管理**：实时跟随系统（matchMedia change 事件，**仅当用户未显式选择时**）
6. **验证与笔记**：两层跟随、刷新保持、系统联动测试

### 主题数据流（两层跟随）

```
theme store（Pinia）/ ThemeContext（React）
  → ①组件库层：ConfigProvider theme.algorithm（darkAlgorithm / defaultAlgorithm）
  → ②自定义样式层：document.documentElement.dataset.theme = 'dark'
      → <html data-theme="dark"> → CSS 变量切换 → 自定义样式跟随
  → 持久化：变化时写 localStorage；初始化优先级：存储 > 系统偏好 > light
  → 实时联动：未显式选择时，matchMedia change 事件跟随系统
```

### 布局数据流（嵌套路由）
```
Vue：{ path: '/', component: AppLayout, children: [各页面] } → AppLayout 渲染 <router-view />
React：<Route element={<AppLayout />}>（pathless 布局路由）→ AppLayout 渲染 <Outlet />
登录/注册独立布局（children/布局 Route 之外）
```

## 关键差异对比

| 项 | Vue 版 | React 版 | 为什么 |
|----|--------|----------|--------|
| 1️⃣ 状态方案 | Pinia store（theme ref + toggle 动作） | **Context + useTheme**（createContext + Provider + 自定义 Hook） | 主题是**低频更新的全局状态**——Context 的正确用例（高频更新会造成 Provider 下消费组件的重渲染风暴，模块 1 的教训反过来用）；Pinia 什么都放 |
| 2️⃣ 消费安全 | `useThemeStore()` 直接可用 | `createContext<T \| null>(null)` + 自定义 Hook 内 `if (!ctx) throw`——**null 检查模式** | React 的 useContext 在没包 Provider 时返回默认值（null）**静默失败**；抛错把「忘包 Provider」变成显式错误 |
| 3️⃣ 副作用放置 | store 里 `watch(theme, ..., { immediate: true })` 写 `document.documentElement.dataset.theme` | Provider 里 `useEffect([theme])` 做同样的事 | 数据变化的副作用挂在数据源旁边——store/Provider 是状态的家，副作用跟着家走 |
| 4️⃣ 持久化订阅 | store 里 `watch(theme)` 写 localStorage | Provider 里 `useEffect([theme])` 写 localStorage | 复用模块 3 三要素（时机/序列化/防御——主题值是枚举，序列化简单） |
| 5️⃣ 嵌套路由 | `{ path: '/', component: AppLayout, children: [...] }`，子路由**相对路径**，出口 `<router-view />` | `<Route element={<AppLayout />}>`（**无 path 布局路由**），出口 `<Outlet />`，子路由完整路径 | 结构等价、写法不同：Vue 的 children 在配置里，React 的「children」是 JSX 嵌套 |
| 6️⃣ 导航高亮 | `router-link-active` 类**自动添加** | `NavLink` 的 `className={({ isActive }) => ...}` **手动判断** | Vue Router 内置高亮类；React Router 给你 isActive 让你决定怎么用——内置 vs 组合的又一例 |
| 7️⃣ 系统联动监听 | store 里 `matchMedia.addEventListener`（应用同生命周期，无需清理） | Provider 里 useEffect + **return 清理函数**（移除监听） | React 的 effect 返回清理是**规范**（即使根级组件理论不用）；模块 0 生命周期清理的呼应 |

## 关键 API / 配置

1. **`ConfigProvider theme.algorithm`**：`darkAlgorithm` / `defaultAlgorithm`（antd 5 与 antdv 4 均支持）——组件库暗色的开关，**只改 CSS 变量不改它，组件不会变暗**；
2. **`document.documentElement.dataset.theme`**：写 `<html data-theme="dark">` 属性——CSS 变量的切换开关；
3. **`window.matchMedia('(prefers-color-scheme: dark)')`**：`.matches` 读当前系统偏好；`addEventListener('change', fn)` 实时监听系统切换；
4. **`createContext` / `useContext` + 自定义 Hook**（React）：Context 的标准封装模式——Provider 持状态，自定义 Hook 消费 + null 检查；
5. **pathless Route / `<Outlet />`**（React Router）：无 path 的布局路由，子路由渲染在 Outlet 位置；
6. **`NavLink` 的 `className` 函数**：`({ isActive }) => isActive ? 'active' : ''`——导航高亮。

## 踩过的坑

1. **只改 CSS 变量，antd 组件还是亮的**：现象（页面背景变了、表格卡片还是亮色）→ 原因（自定义样式和组件库是**两套视觉来源**——CSS 变量只管自定义部分）→ 解决（ConfigProvider 的 `theme.algorithm` 和 CSS 变量**必须一起切**）。
2. **useTheme 报「必须在 ThemeProvider 内使用」**：现象（组件里用 useTheme 抛错）→ 原因（该组件渲染在 Provider 外面）→ 解决（检查 Provider 的包裹范围——比如 ConfigProvider/ThemeProvider 的嵌套顺序）。这是 null 检查模式**在按设计工作**：把静默失败变成显式报错。

## 面试考点

### 1. React Context 适合什么场景？什么时候不该用？

**一句话**：适合**低频更新的全局状态**（主题、当前用户、语言包）；高频更新（输入框、鼠标位置、列表数据）不该用——value 一变，**所有消费组件全部重渲染**，造成性能风暴。

**展开**：
- Context 的价值：避免 prop drilling（跨多层传 props）；
- Context 的代价：消费粒度粗——没有「只订阅某个字段」的能力（对比 Zustand 的 selector）；
- 本模块选 Context 正是因为主题是低频的：一天点不了几次；
- 延伸：React 19 的 `use(Context)` 可以条件读取，优化了部分场景，但消费粒度的问题本质未变。

### 2. 主题切换为什么要「两层跟随」？

**一句话**：自定义样式和组件库视觉是两套来源——CSS 变量只管自定义部分，antd 组件的暗色要靠它的主题算法；只改一层会出现「背景暗了、组件还亮着」的割裂。

**展开**：
- 层①：`ConfigProvider theme.algorithm` → antd 全家桶（表格/按钮/卡片）跟随；
- 层②：`<html data-theme>` → CSS 变量 → 自定义样式跟随；
- 面试延伸：antd 5 的 token 体系（colorBgBase 等）可以更细粒度定制——知道有这层即可。

### 3. 主题初始化的优先级设计？为什么用户选择 > 系统偏好？

**一句话**：localStorage → `prefers-color-scheme` → 默认 light——**显式选择是最强意图**，系统偏好是弱意图（合理默认），默认值兜底。

**展开**：
- 实时联动的边界也由这个优先级决定：未显式选择 → 跟随系统实时变化；显式选择后 → 不被系统覆盖；
- 延伸：三态设计（亮/暗/跟随系统）——`'system'` 时不写 localStorage、始终监听 matchMedia，用户显式选择才固化（真实产品常见）。

### 4. 跟随系统偏好的实时联动怎么实现？

**一句话**：`matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => ...)` + 仅当用户未显式选择（无 localStorage）时应用 `e.matches`。

**展开**：
- `matchMedia` 的两个能力：`.matches` 读当前值（初始化用）、`change` 事件听变化（联动用）；
- 语义设计：显式选择 > 系统跟随（见考点 3）；
- 清理策略：监听挂在 store/Provider（应用级）无需清理；挂在组件级必须清理（模块 0 的教训）。

### 5. 嵌套路由/布局路由两框架怎么实现？

**一句话**：Vue 用 `{ path: '/', component: Layout, children: [...] }` + `<router-view />`（子路由相对路径）；React 用 `<Route element={<Layout />}>`（无 path 布局路由）+ `<Outlet />`（子路由完整路径）。

**展开**：
- 结构等价：布局组件 + 页面出口；
- 差异：Vue 子路由路径相对父级；React 子路径完整、布局 Route 本身无 path；
- 应用：布局里放 Header/侧边栏，登录页放布局外（独立全屏）。

### 6. Context 的 null 检查模式是什么？

**一句话**：`createContext<T | null>(null)` + 自定义 Hook 内 `if (!ctx) throw`——把「忘包 Provider」从 undefined 静默失败变成显式报错。

**展开**：
- 不做检查：忘包 Provider 时 useContext 返回 null → 后续读属性时莫名其妙崩在别处，难排查；
- 做了检查：错误发生在使用点、信息明确（「useTheme 必须在 ThemeProvider 内使用」）；
- 这是「让错误尽早暴露」的通用原则（fail fast）。

## 如果换成另一个框架我会怎么写

### 1. Vue 的 Pinia theme store → React Context？为什么这个模块选 Context？

- Pinia 完全也能管 theme（一致性优先的团队会统一用 Pinia/Zustand 管所有状态）；
- 本模块选 Context 是**教学意图**：展示 Context 的正确用例 + null 检查模式；
- 选型依据：更新频率（低频 → Context 可用）+ 团队一致性（全项目统一一个方案更易维护）。

### 2. matchMedia 监听的清理策略差异？

- **Vue**：监听加在 store（与应用同生命周期）→ 无需清理；若加在组件 setup 里 → Vue 的 watch/computed 随组件卸载自动停止，但**原生 addEventListener 不会自动停**——组件里加的原生监听仍要手动移除（onUnmounted）；
- **React**：effect 返回清理函数是规范——即使 Provider 是根级组件；
- 共同原则：**谁加的谁删**（原生 DOM API 的监听永远要显式清理，框架只自动管自己注册的响应式副作用）。

### 3. 嵌套路由的 children/router-view 换成 React 的 pathless Route + Outlet？

- Vue：children 数组 + 相对路径 + `<router-view />` 出口；
- React：`<Route element={<Layout />}>` 不写 path（只承担布局）+ `<Outlet />` 出口 + 子路由完整路径；
- 等价映射：children ≈ JSX 嵌套、router-view ≈ Outlet、相对路径 ≈ 完整路径。

### 4. 三态主题（亮/暗/跟随系统）怎么扩展？

- `theme: 'light' | 'dark' | 'system'`；
- `'system'`：不写 localStorage（或写 'system'）、始终监听 matchMedia、跟随 `e.matches`；
- 显式选 light/dark：固化到 localStorage、移除跟随逻辑；
- UI 上是三选项的 Segmented 控件（antd 的 Segmented 组件）——比二态 toggle 更完整，真实产品标配。

## 选做练习（模块 5 遗留）

ErrorBoundary 的生产化：React 装 `react-error-boundary` 库替换手写 class（`<ErrorBoundary fallback={...}>`）；Vue 把 `app.config.errorHandler` 对接上报（真实项目对接 Sentry 等监控平台）。
