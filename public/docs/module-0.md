---
title: 脚手架与工程底子
slug: vite-scaffolding
date: 2026-09-19
tags: [技术, 前端, Vite]
readTime: 15
---

# 模块 0 笔记 : 脚手架与工程底子

## 实现思路
<!-- 提示: 这个模块做了什么？ 项目怎么分层的？为什么先搭骨架再分层？ -->

1. 这个模块主要是以 Vite 创建的 vue 和 react 两个项目的脚手架为主，同步开发，两相对比。
    - 主要做了删除初始化项目时的冗余文件，搭建项目骨架
    - 集成了`Pinia`、`React Query`、`Zustand`此类状态管理库
    - 安装了`axios`, 在api层封装了请求拦截器和响应拦截器，统一处理请求和响应的错误
    - 在`vite.config.ts`和`tsconfig.json`中配置了路径别名

2. 项目分层主要是采用技术分层
    - `api` 层: 封装 axios 请求，统一处理请求和响应的错误
    - `components` 层: 公共组件
    - `views/pages` 层: 页面组件
    - `stores` 层: 状态管理
    - `types` 层: 类型定义
    - `router` 层: 路由管理

3. 为什么先搭骨架再分层？
    - 先搭建项目骨架，保证项目结构清晰，便于后续开发
    - 分层可以让代码更易维护，降低耦合度，提高复用性

## 关键差异对比
<!-- 提示: vue-ts vs react-ts 脚手架 (入口文件、组件形态、类型检查器);
     页面目录 views/ vs pages/;
     改状态的路径(Pinia 直接改 vs Zustand 不可变更新) -->

|   对比项    |      Vue版       |    React版     | 为什么                                                                                                                                    |
|:--------:|:---------------:|:-------------:|:---------------------------------------------------------------------------------------------------------------------------------------|
|   入口文件   |     main.ts     |   main.tsx    | React 的`tsx`文件原生支持JSX语法，必须用tsx后缀；Vue template写在`.vue`单文件中，入口只做挂载，用`.ts`即可                                                              |
|   组件形态   | Composition API |     Hooks     | Composition API（`<script setup>`）基于响应式 ref/reactive; React函数组件只能用Hooks。而这都是为了封装逻辑，但响应式底层完全不同：Vue是 Proxy 自动追踪依赖，React Hooks 靠依赖数组手动声明依赖 |
|   页面目录   |     views/      |    pages/     | 约定俗成的规范而已                                                                                                                              |
|  改状态的路径  |    Pinia 直接改    | Zustand 不可变更新 | Vue采用响应式 **Proxy**，直接修改对象属性可以自动捕获变更，触发视图更新；React遵循**不可变数据思想**，状态只是只读，不能直接修改原对象，必须返回新对象，Zustand延续这个规范，让React检测 state 变化触发重渲染            |


## 关键 API / 配置
<!-- 提示: Axios 封装做了哪三件事？vite alias 和 tsconfig paths 为什么配两处? React Query 的 QueryClient 是什么角色？ -->

1. Axios 封装：
   - 请求拦截器：对请求进行统一处理，如添加 token、设置请求头等，统一配置`/api`前缀
   - 响应拦截器：对响应进行统一处理，如处理状态码、错误信息等
   - 错误处理：Promise.reject(new Error('请求失败'))，统一处理请求失败的情况

2. vite alias 和 tsconfig paths 配置两处的原因：
    - vite alias 用于在项目中使用别名导入模块（方便开发者使用）
    - tsconfig paths 用于 TypeScript 编译器识别别名路径，保证类型检查和编译正常（方便编译器识别）

3. React Query 的 QueryClient 角色：
    - QueryClient 是 React Query 的全局实例，管理整套请求缓存、全局配置，提供数据获取、缓存、更新和同步的功能
    - 通过`QueryClientProvider`注入到整个React应用，所有`useQuery`/`useMutation`共用这一份缓存
    - 它允许在组件之间共享数据，减少重复请求，提高性能和用户体验
      > 类比：Pinia是全局状态库, Pinia既管客户端UI状态，又管服务端接口数据；Zustand管客户端状态，React Query管服务端状态

## 踩过的坑
<!-- 每条写：现象 -> 原因 -> 解决 -->

暂无

## 面试考点
<!-- 提示: Pinia vs Vuex？ Pinia vs 全局变量(响应式追踪)? Axios 封装?
          history 路由为什么需要服务器回退? React 为什么拆服务器状态/客户端状态？-->

1. Pinia vs Vuex
    - Pinia 是 Vue3 官方推荐的状态管理库，基于 Composition API，API 更简洁，支持模块化和 TypeScript，性能更好
    - Vuex 是 Vue2 官方推荐的状态管理库，基于 Options API，API 较复杂，模块化支持不如 Pinia，性能略差
    - Pinia 支持响应式追踪，直接修改对象属性可以自动捕获变更，触发视图更新
    - Vuex 需要通过 中间 mutation 才能修改状态

2. Pinia vs 全局变量(响应式追踪)
    - Pinia 是响应式的，直接修改对象属性可以自动捕获变更，触发视图更新
    - 全局变量是非响应式的，修改全局变量不会触发视图更新，需要手动刷新组件

3. Axios 封装
    - 封装 Axios 可以统一处理请求和响应的错误，减少重复代码，提高可维护性
    - 可以统一设置请求头、请求前缀、超时时间

4. history 路由为什么需要服务器回退
    - history 路由模式下，前端路由是基于浏览器的，当用户直接访问一个深层路由时，浏览器会向服务器发送请求，如果服务器没有配置回退，会返回 404（开发环境Vite内置了这个配置）
    - 配置回退后，服务器会返回 index.html，前端路由接管路由，保证应用正常运行

5. React 为什么拆服务器状态/客户端状态
    - React Query 只管【服务端接口数据】，负责数据获取、缓存、更新和同步
    - Zustand 只管【前端 UI 本地状态】，负责组件间共享状态和本地状态管理
    - 两者职责完全不同，是互补，拆分可以让代码更清晰，职责更明确，提高可维护性

## 如果换成另一个框架我会怎么写
<!-- 比如「用 Vue 的 Pinia 定义计数器」换成 React + Zustand 时，那些概念时直接对应的(状态、动作)？哪些思维方式变了（响应式追踪 vs 重新执行函数）？ -->

1. 直接对应的概念： `state`(状态)、`action`（动作）
    - Pinia：`state`存数据，`action`修改数据
    - Zustand：store 对象里面的属性 = `state`; set 里面定义的函数 = `action`
      > 二者可以一一映射

2. 思维本质的巨大差异： Vue响应式依赖追踪 VS React函数组件 + 引用更新出发重渲染
    - Vue（Pinia）：**Proxy自动追踪依赖**。组件读取了哪个响应式变量，就自动绑定依赖；变量原地修改，自动通知组件更新。
    - React（Zustand）：**没有自动依赖收集**。靠引用对比，必须返回新状态对象，组件才会重新执行函数、拿到新值；并且可以**精确订阅部分状态**，减少不必要渲染。

### 代码对照

> Vue是 defineStore()，React是create<>()

1. Vue3 + Pinia（组合式写法）
   ```ts
   // stores/counter.ts
   import { defineStore } from 'pinia'
   import { ref } from 'vue'
   
   export const useCounterStore = defineStore('counter', () => {
   // state
   const count = ref(0)
   
   // action
   function increment() {
   // ✅ 原地直接修改，Proxy监听，自动更新视图
   count.value++
   }
   return { count, increment }
   })
   ```
    - 组件使用
   ```text
      <script setup lang="ts">
      import { useCounterStore } from '@/stores/counter'
   
      const counterStore = useCounterStore()
      </script>
      <template>
        <div>{{ counterStore.count }}</div>
        <button @click="counterStore.increment()">+1</button>
      </template>
   ```
2. React + Zustand 等价实现
   ```tsx
   // stores/counter.ts
   import { create } from 'zustand'
   
   type CounterState = {
     count: number
     increment: () => void
   }
   
   // state + action 写在一起
   export const useCounterStore = create<CounterState>((set) => ({
     count: 0,
     increment: () => {
       // ❗不能直接写 state.count++ 原地修改！
       // ✅ set函数接收回调，返回全新状态对象（不可变）
       set((state) => ({
         count: state.count + 1
       }))
     }
   }))
   ```
    - 组件使用
   ```tsx
   // Counter.tsx
   import { useCounterStore } from './stores/counter'
   
   export default function Counter() {
     // 订阅你需要的状态，只取count和increment
     const count = useCounterStore(s => s.count)
     const increment = useCounterStore(s => s.increment)
   
     return (
       <div>
         <div>{count}</div>
         <button onClick={increment}>+1</button>
       </div>
     )
   }
   ```
