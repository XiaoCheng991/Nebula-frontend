---
title: Vite 的 SPA 回退机制
slug: blog-vite-spa-fallback
date: 2026-09-18
tags: [技术, 前端, Vite]
readTime: 7
---

# Vite 的 SPA 回退机制

记录前端学习时遇到的 Vite SPA 回退机制问题，分析原因。 了解路由跳转不存在的页面时，不会直接报错404，而是返回一个`index.html`页面。

## 背景

在使用 Vite 构建的单页应用（SPA）中，当用户导航到一个不存在的路由`/api/products`时，应用会发出请求，但其实请求的内容是不存在的。
为了临时验证我们封装的 request 拦截器是否生效，在`main.tsx`中添加了下面的拦截代码:

```ts
    import request from './api/request'
    request.get('/products').catch(() => {}) // 404也会走相应拦截器的错误分支
```

本来我们在不知道 Vite 的 SPA 回退机制的前提下，预期是在控制台看到404错误。

结果是在控制台没有输出，并且请求返回的也不是404，而是200，内容是一个html页面。

## 修改方案

由于 Vite dev server默认 appType: 'spa', 即任何匹配不到静态文件的请求，都会返回`index.html` (状态码200)，而不是404。

原本的catch没有打印错误信息，所以错误会被静默吞掉，应该修改为以下:

```ts
    import request from './api/request'
    request.get('/products').catch((e: Error) => {
      console.log('拦截器拦截到错误:', e.message)  // 预期输出: 请求失败
    })
```

## 总结

1. 为什么Vite要返回一个`index.html`页面:
   - **为了让前端路由的「深链接」能工作**。比如以后有`/product/1`这样的路由，用户直接刷新这个URL时，请求先到服务器，服务器必须返回`index.html`让前端路由接管。
2. 为什么控制台没有报错:
   - 响应的Content-Type是`text/html`，而不是`application/json`，所以 axios 不按 JSON 解析，response.data 是那段 html;
   - 响应拦截器的res.code取到的只能是 undefined, undefined !== 0 成立，则业务失败，会走 Promise.reject(new Error('请求失败')) --- 拦截器正确的拒绝了。
   - 但是这个错误被临时验证代码里的`.catch(() => {})`吞掉了，所以控制台没有输出。

---

### 延伸知识

Vite SPA 路由回退(history模式 fallback)

#### 两种路由模式对比

1. hash 模式(`/#/product/1`)
   - `#`后面的内容不会发给服务端。刷新时请求永远只请求跟路径 `/`，不需要服务器额外配置。缺点：URL带`#`不好看。
2. history 模式(`/product/1`, 即Vue Router)
   - 不带`#`, 但是刷新、直接访问深链接时，请求路径是完整的 `/product/1`, 必须服务器配置 fallback。（Vite本地开发服务器内置了这个回退逻辑）:
     ```
     vite serve
     ```
   - 打包上线后，服务器必须配置 fallback，否则刷新或直接访问深链接时会返回404。
     ```
     location / {
       root /你的dist目录;
       try_files $uri/ /index.html;
     }
     ```
