---
title: Vue 生命周期
slug: vue-lifecycle
date: 2026-09-21
tags: [技术, 前端, Vue]
readTime: 20
---

# Vue 生命周期

## 一、生命周期是什么

> Vue 组件从"被创建"到"被销毁"，会经历一系列阶段。Vue 在每个阶段提供一个**回调函数入口**， 可以在特定时机执行代码 
> —— 这些回调函数就叫**生命周期钩子（Lifecycle Hooks）**

```
即每个人的一天：

睡醒 ------> 洗漱 ------> 吃饭 ------> 上班 ------> 下班 ------> 睡觉
 ｜           ｜           ｜          ｜          ｜          ｜
出生hook    洗漱hook     吃饭hook    上班hook    下班hook    睡觉hook
```

不需要在每个阶段都写代码，但是**想在某个阶段做事时，知道去哪个钩子写就行**。

## 二、Vue3 完整生命周期流程图

```rich
          **createApp(App).mount('#app')**
                    │
                    ▼
┌────────────────────────────────────────────┐
│  ① **setup(）**                                │  ← Vue 3 组合式API的入口
│     所有代码最先执行的地方                     │
│     ref()、computed()、watch(） 在这里注册    │
│     ⚠️ 此时还没有 DOM, template 还没渲染      │
└────────────────────┬───────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────┐
│  ② **onBeforeMount()**                         │  ← DOM 还没挂载
│     Vue 已经编译好 template，生成了虚拟DOM      │
│     但还没插入到页面的 #app 容器里              │
└────────────────────┬────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  ③ **onMounted(）**                              │  ← DOM 已经挂载完毕 ⭐
│     页面上已经能看到渲染出来的 HTML 了            │
│     ✅ 这里可以操作 DOM（获取元素、初始化第三方库） │
│     ✅ 这里可以发网络请求（但不推荐，见后文)       │
│     ⚠️ watch({ immediate: true }) 在这一步执行 │
└────────────────────┬─────────────────────────┘
                     │
                     ▼
           ┌─── 数据变化？──────┐
           │                  │
           │  响应式系统检测    │
           │  ref/props 变了   │
           │                  │
           ▼                  ▼
┌────────────────────┐    不变，等待用户操作
│ ④ **onBeforeUpdate()**│
│   DOM 还没更新      │
│   此时读到的是旧DOM  │
└────────┬───────────┘
         │
         ▼
┌──────────────────┐
│ ⑤ **onUpdate()**     │  ← DOM 已经更新完毕
│   新的 DOM 已就位  │     ⚠️ 不要在里面改状态，会死循环
└────────┬─────────┘
         │
         └─── 回到等待状态，直到下次数据变化或组件销毁

                    ┌─── 用户导航离开 / v-if=false ──────┐
                    │                                  │
                    ▼                                  ▼
┌────────────────────────────────┐  ┌────────────────────────────────┐
│  ⑥ **onBeforeUnmount()**          │  │  ⑦ **onUnmounted()**               │
│    组件还存在于 DOM 中           │  │    组件已从 DOM 移除              │
│    ✅ 清理定时器、取消订阅        │  │    ✅ 最后的清理机会              │
│    ✅ 移除全局事件监听           │  │    ⚠️ 这里访问不到 DOM 了         │
└───────────────────────────────┘  └────────────────────────────────┘
```

## 三、结合项目

1. **setup()** - 最先执行：

```js
// 这整个 <script setup> 就是 setup() 的语法糖
<script setup lang="ts">
import { ref, watch } from 'vue'
import rtpe { Porduct } from '@/types/product.ts';

// ===== 这些代码在 setup 阶段同步执行 =====
const products = ref<Product[]>([])      // 创建响应式引用，值 = []
const loading = ref(false)               // 创建响应式引用，值 = false
const page = ref(1)                      // 创建响应式引用，值 = 1
const total = ref(0)                     // 创建响应式引用，值 = 0

// watch 注册（但回调还没执行，要等 mounted 阶段才触发 immediate）
watch(
  [searchParams, page],
  ([params, p]) => { load({ ...params, page: p }) },
  { immediate: true },
)

// 函数定义（只是注册，没被调用）
function load(params) { ... }
function handlePageChange(newPage) { ... }
</script>
```

**setup()** 时的状态：
- DOM：❌不存在
- 数据：✅已就绪(ref都创建好了)
- 网络请求：❌未发起（watch回调还没执行）

---

2.**onBeforeMount()** - 编译好了但还没插到页面

```js
import { onBeforeMount } from 'vue'

onBeforeMount(() => {
  // Vue 已经把 template 编译成了虚拟DOM树
  // 但页面上还看不到任何东西
  // 此时 DOM 里面没有 <div class="product-list">
  console.log(document.querySelector('.product-list'))
  // -> null (DOM 好没插入)
})
```

**实际开发中很少用这个钩子**。99% 的场景都不需要关心 "编译好了但还没挂载" 这个中间状态

---

3.**onMounted()** - ⭐️DOM 就绪，页面可见

```js
import { onMounted } from 'vue'

onMounted(() => {
  // ✅此时页面上已经有 HTML 了
  console.log(document.querySelector('.product-list'))
  // -> <div class="product-list">...</div> (能拿到真实 DOM)
    
  // ✅ 可以操作 DOM：获取元素尺寸、初始化拖拽库等
  // ✅ 可以启动轮询定时器
  // ✅ 可以发网络请求（但项目用了 watch immediate，效果一样）
})
```

在 **onMounted()**里发请求有两种方式：

```js
    // 方式一：在 onMounted 里发请求（很多教程这么教）
    onMounted(async () => {
      const data = await getProducts({ page: 1 })
      products.value = data.list
    })
    
    // 方式二：用 watch + immediate（本项目用的，更优雅）
    watch([searchParams, page], ([params, p]) => {
      load({ ...params, page: p })
    }, { immediate: true })
```

方式二更佳，因为：
- 搜索或者翻页时，watch 会自动触发 **load()**
- 方式一需要在 `handleSearch`, `handlePageChange` 里手动再调用过一次 **load()**
- watch 把 “依赖变化 -> 重新加载” 这件事声明式地表达出来了

---

4.**onBeforeUpdate()** + 5.**onUpdated()** - 数据变了，DOM 要更新

```rich
                用户点击第2页
                    │
                    ▼
              page.value = 2
                    │
                    ▼
        Vue 检测到 ref 变化，触发 re-render
                    │
                    ▼
┌──────── **onBeforeUpdate()** ─────────────┐
│  ⚠️ 此时 DOM 还是旧的（第1页的数据）      │
│  如果你在这里读 DOM，拿到的是过时的内容     │
└──────────────────┬────────────────────┘
                   │
                   ▼
        Vue 用新的虚拟 DOM 对比旧的
        计算出最小化的 DOM 操作（diff 算法）
                   │
                   ▼
┌──────────── **onUpdated()** ───────────────┐
│  ✅ DOM 已经是第2页的数据了               │
│  ⚠️ 不要在这里修改状态（改 ref → 再触发     │
│     update → 再触发 onUpdated → 死循环）  │
└───────────────────────────────────── ───┘
```

**实际开发中也很少直接用**。Vue的响应式系统已经处理好了大部分场景。只需要在操作 DOM 并且必须在更新后执行时采用。

---

6.onBeforeUnmount() + 7.onUnmounted() - 组件销毁前后

当用户从商品列表页导航到其他页面（比如用了 Vue Router）, **「ProductList.vue」**就会被销毁;

```js
import { onBeforeUnmount, onUnmounted } from 'vue'

let pollTimer: number

onMounted(() => {
  // 假设在这里启动了一个轮询定时器
  pollTimer = setInterval(() => {
    load({ ...searchParams.value, page: page.value })
  }, 30000)
})

onBeforeUnmount(() => {
  // ✅ 组件即将被销毁，DOM 还在
  // 清理定时器！否则组件销毁后定时器还在跑，内存泄漏
  clearInterval(pollTimer)
})

onUnmounted(() => {
  // ✅ 组件已销毁，DOM 已移除
  // 最后的清理机会
})
```

为什么要清理：

- 用户进入商品列表页 -> mounted -> setInterval 开始跑(每30s刷新)
- 用户离开商品列表页 -> 组件销毁，但 setInterval 还在跑！
- 内存泄漏‼️（定时器引用了一个已经不存在的组件）
- 用户再次进入 -> mounted -> 又一个 setInterval
- 这就有2个定时器在运行，更严重

## 四、`<script setup>` 和 生命周期的关系

代码中其实并没有具体的写 setup() 函数，也没有显示调用 **onMounted**。这是因为 `<script setup>` 是 Vue 3 的语法糖，Vue 会自动把`<script setup>`中的代码放到 setup() 函数里执行。

**对应关系**：

| 代码                              | 	实际执行时机                           |
|---------------------------------|-----------------------------------|
| ref([])                         | setup() 阶段，同步创建                   |
| computed(...)                   | 	setup() 阶段，同步创建（但值是懒计算的）         |
| watch(..., { immediate: true }) | setup() 注册，onMounted 阶段执行回调       |
| watch(...)（没有 immediate）        | setup() 注册，等依赖变化时才执行              |
| `<template>` 里的内容               | onBeforeMount 之前编译，onMounted 时已可见 |

## 五、什么时候用哪个钩子（速查）

| 你要做的事                   | 用哪个钩子                                     |
|-------------------------|-------------------------------------------|
| 发网络请求获取数据               | `watch` + immediate（推荐）或 `onMounted`（也可以） |
| 操作 DOM（获取元素、测量尺寸）       | `onMounted` ✅                             |
| 初始化第三方库（ECharts、地图等）    | `onMounted` ✅                             |
| 添加全局事件监听（window.resize） | `onMounted` ✅，配合 `onUnmounted` 清理         |
| 启动轮询/定时器                | `onMounted`，配合 `onBeforeUnmount` 清理       |
| 数据变了，需要在 DOM 更新后操作      | `onUpdated` ⚠️（慎用）                        |
| 组件销毁前清理资源               | `onBeforeUnmount` ✅                       |
| 创建响应式数据、计算属性            | 直接写在 `<script setup>` 顶层                  |

**核心要点**:
- `setup()` 是同步的，一次性跑完
- `onMounted` 是所有子组件都挂载完后才触发
- `watch({ immediate })` 的回调在 `onMounted` 阶段执行，而它触发的异步请求返回后会再出发一轮 `onUpdated`，所以要注意不要在 `onUpdated` 里再去改状态，否则会死循环