---
title: Vue vs React 对比总结（面试版）
slug: vue-vs-react-summary
date: 2026-10-15
tags: [技术, 前端, Vue, React]
readTime: 18
---

# Vue vs React 对比总结（面试版）

> 使用说明：下面的要点是「骨架 + 素材结论」——把每节要点改写成 2-4 句连贯的话（面试口径），总长一页半以内。细节回查各模块笔记。

## 一、核心哲学差异（总纲）

要点：
- Vue：框架多给能力——响应式追踪（Proxy）、路由守卫、errorHandler、v-model 语法糖；API 面向配置和双向绑定
- React：一切皆组件/JSX；状态显式（useState）、数据流显式（value + onChange）、能力靠组装（RequireAuth、手写 ErrorBoundary）
- 总纲一句话：「内置能力 vs 组装能力」「自动追踪 vs 手动声明」贯穿所有具体差异

（来源：module-0/1 总纲，各模块反复出现）

## 二、响应式系统

要点：
- Vue 3 核心链路：Proxy 拦截读写 → track（读时收集 activeEffect）→ trigger（写时通知依赖重跑）
- 三层结构：WeakMap<target, Map<key, Set<effect>>>；WeakMap 弱引用 → 对象销毁依赖自动回收
- 依赖精确：effect 读什么收集什么——改 count 不触发 text 依赖（精确更新的底层依据）
- React：没有属性级追踪——组件重新执行 + 依赖比对（useMemo/useEffect 的依赖数组）
- 派生状态：computed（依赖自动追踪 + 缓存）vs useMemo（手动声明 + 缓存）；忘写依赖 = stale closure，且在派生链中级联放大
- 派生状态不存储：源头是唯一事实来源（类比数据库不存冗余列）
- 手写版与真实 Vue 3 的差距：嵌套 effect 栈、分支切换依赖清理、computed 懒执行 + 脏检查、scheduler 批量异步更新（nextTick）

（来源：手写 mini-reactive + module-1/3/5 的 computed/useMemo 对比）

## 三、组件与通信

要点：
- 组件形态：SFC 三段式（template + script setup + scoped style）vs 函数组件返回 JSX（.tsx）
- 单向数据流：props 只读（两框架一致）；子 → 父：emit vs 回调 props（React 没有 emit 概念）
- 受控 vs 非受控：状态被几个组件共享 → 提升到最近公共父级（受控：value+onChange / defineModel）；单组件自用 → 留内部（非受控：事件载荷）
- v-model 本质 = props 下行 + 事件上行的语法糖（defineModel 是它的组合式写法）
- 事件载荷 vs 状态：非受控子组件在事件发生那一刻把内部状态传上来（AddToCart 的 quantity）
- 样式隔离：scoped 必须跟组件走 vs 全局 CSS 靠命名约定（进阶 CSS Modules）
- 跨层通信：逐层上报（简单清晰）vs provide/inject / Context（跨层注入，模块 6 的 Context 用例）

（来源：module-1/2/3 对比表 + one-way-data-flow.md）

## 四、路由

要点：
- 配置哲学：配置对象（createRouter + children + 相对路径 + router-view）vs 组件声明（pathless Route + Outlet + 完整路径）
- 参数获取：useRoute().params.id（响应式对象，watch 追踪）vs useParams()（string | undefined，useEffect 依赖数组）
- 守卫（标志性对比）：beforeEach 全局钩子 + meta（集中管理，不漏守）vs RequireAuth 包装器（就地声明，忘了包就不守）
- 导航与高亮：router.push vs useNavigate；router-link-active 自动 vs NavLink isActive 手动
- SPA history 模式需要服务端回退：刷新深层路径 → 服务器返回 index.html 让前端路由接管（Vite appType spa 内置；生产 Nginx try_files）

（来源：module-2/4 + 模块 0 的 SPA 回退发现）

## 五、状态管理

要点：
- 状态分类决策：服务器状态（走接口 + 缓存/竞态处理）vs 客户端状态（直接 store）——数据的所有权决定取数路径
- 方案版图：Vue = Pinia 一把抓；React = React Query（服务器）+ Zustand（客户端高频）+ Context（客户端低频）
- 不可变更新 vs 响应式直接改：+= / push 直接改（Proxy 拦截）vs map / filter 生成新数组（引用变化是渲染信号）
- 持久化三要素：时机（变化时写、初始化时读）、序列化（JSON + as 断言）、防御（try/catch 兜底）
- 派生链：computed/useMemo 链式组合（三层派生链），跨层通信逐层上报 vs provide/inject / Context

（来源：module-1/3/5/6 对比表）

## 六、表单

要点：
- antd 两端 API 差异：model + v-model（值由你的对象管）vs Form.Item name 注册（Form 内部管理，onFinish 交付 values，不需要 useState 管字段）
- 声明式校验：rules 与校验时机解耦——finish/onFinish 只在全部通过后触发（vs 手写一堆 if）
- 确认密码取值：formState 直读（Vue）vs dependencies + getFieldValue（React）
- 错误流转：store 动作抛错 → 页面 catch → message 轻提示

（来源：module-4 对比表）

## 七、渲染与性能

要点：
- 派生缓存：computed/useMemo 缓存派生值（依赖不变不重算）
- 服务器状态缓存：React Query 秒显旧数据 + 后台刷新（stale-while-revalidate）；invalidateQueries = 标记过期触发重拉，不是删缓存
- 无限滚动：useInfiniteQuery 收口分页四件套（page/orders/hasMore/loading → data.pages / hasNextPage / fetchNextPage）
- 更新粒度：Vue 属性级精确更新（手写响应式的 track/trigger 依据）vs React 整函数重渲染（Zustand selector 缓解）
- 数据正确性：金额以后端为准、hasMore 后端给（分页协议）——前端只做展示与交互

（来源：module-3/5 对比表）

## 八、错误处理

要点：
- React：渲染错误 = 整树卸载（白屏）→ ErrorBoundary class 隔离爆炸半径（getDerivedStateFromError + componentDidCatch）；只捕渲染期错误，事件处理器/异步要 try/catch 自己管
- Vue：错误沿捕获链传播（onErrorCaptured → app.config.errorHandler 全局兜底），内置更全局
- hooks 时代 class 的合法场景：ErrorBoundary 需要两个生命周期，hooks 无等价物（react-error-boundary 库内部也是 class）

（来源：module-5 第 5 步）

## 九、选型建议（收尾升华，写你自己的观点）

提示角度（没有标准答案，讲依据）：
- Vue：上手快、模板直观、官方全家桶统一（Router/Pinia/Devtools）、中小团队交付效率
- React：生态最大、灵活度高、TS 生态成熟、大厂标配、跨端延伸（React Native）
- 趋同面：组件化、单向数据流、声明式 UI、Hooks/Composition API 心智相似——会一个，另一个上手很快
- 你的真实体验：本项目两边都写了，说出 1-2 个你自己的具体感受（面试最加分）
