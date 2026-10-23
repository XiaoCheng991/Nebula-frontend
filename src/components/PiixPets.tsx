"use client";

import { useEffect, useState } from "react";
import { PiixPal } from "piixpal/react";

/**
 * 浅色主题专属像素宠物（Piixpal）
 *
 * 只渲染于浅色液态玻璃主题：深色（极客赛博朋克）下不显示。
 * 监听项目统一的 theme-change / storage 事件，切换主题时即时出现/消失。
 * 引擎由 piixpal/react wrapper 在浏览器端懒加载（SSR 安全，不输出额外 HTML）。
 */
export default function PiixPets() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const check = () =>
      setIsLight(document.documentElement.classList.contains("light"));
    check();
    window.addEventListener("theme-change", check);
    window.addEventListener("storage", check);
    return () => {
      window.removeEventListener("theme-change", check);
      window.removeEventListener("storage", check);
    };
  }, []);

  if (!isLight) return null;

  return <PiixPal pal="shel" />;
}
