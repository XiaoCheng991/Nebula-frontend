"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const THEME_EVENT = "theme-change";

/**
 * 浅色专属页面守卫：当页面被切换到深色主题时，重定向回博客列表页。
 * 用于 /plans、/music 这类浅色三列/播放器专属页面——深色下这些页面
 * 的布局不适用（深色走顶部导航栏），直接回首页更符合设计意图。
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
      if (!isLight) router.replace("/");
    };
    // 深色下直接访问该页：立即跳回首页
    check();
    window.addEventListener(THEME_EVENT, check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener(THEME_EVENT, check);
      window.removeEventListener("storage", check);
    };
  }, [router]);

  return null;
}
