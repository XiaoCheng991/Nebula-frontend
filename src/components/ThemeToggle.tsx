"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("theme");
    if (stored === "light") {
      setIsLight(true);
    } else if (stored === "dark") {
      setIsLight(false);
    } else {
      setIsLight(
        window.matchMedia("(prefers-color-scheme: light)").matches,
      );
    }
  }, []);

  const toggle = () => {
    const next = !isLight;
    setIsLight(next);
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="切换主题"
        className="theme-toggle" id="theme-toggle-btn"
        disabled
      >
        ◐
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isLight ? "切换为深色模式" : "切换为浅色模式"}
      className="theme-toggle" id="theme-toggle-btn"
      title={isLight ? "切换为深色模式" : "切换为浅色模式"}
    >
      {isLight ? "☀" : "☾"}
    </button>
  );
}
