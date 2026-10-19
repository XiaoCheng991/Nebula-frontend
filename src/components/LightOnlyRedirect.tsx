"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const THEME_EVENT = "theme-change";
/** 切到深色瞬间的隐藏标记：见 globals.css 中 .switching-light-only 规则 */
const HIDING_CLASS = "switching-light-only";

/**
 * 浅色专属页面守卫：当页面被切换到深色主题时，重定向回博客列表页。
 * 用于 /plans、/music 这类浅色三列/播放器专属页面——深色下这些页面
 * 的布局不适用（深色走顶部导航栏），直接回首页更符合设计意图。
 *
 * 跳转前先给 documentElement 加 .switching-light-only，把当前浅色专属页
 * 容器立即隐藏——避免 html.light class 被移除后、路由跳转完成前，
 * 页面闪现一帧没有任何样式的裸 HTML。跳转完成（组件卸载）时清理该 class。
 *
 * 监听两个信号：
 *   - theme-change 事件（页面内 ThemeToggle 等切换后派发）
 *   - storage 事件（其他标签页切换主题）
 */
export default function LightOnlyRedirect() {
  const router = useRouter();

  useEffect(() => {
    const check = () => {
      const isLight = document.documentElement.classList.contains("light");
      if (!isLight) {
        // 先隐藏当前浅色专属页内容，再异步跳首页，中间不留裸样式帧
        document.documentElement.classList.add(HIDING_CLASS);
        router.replace("/");
      }
    };
    // 深色下直接访问该页：立即跳回首页
    check();
    window.addEventListener(THEME_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener(THEME_EVENT, check);
      window.removeEventListener("storage", check);
      document.documentElement.classList.remove(HIDING_CLASS);
    };
  }, [router]);

  return null;
}
