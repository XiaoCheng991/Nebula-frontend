"use client";

import { useEffect, useState } from "react";
import {IconMoon, IconSun} from "@tabler/icons-react";

const THEME_EVENT = "theme-change";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);

    const applyTheme = () => {
      const stored = localStorage.getItem("theme");

      let light;

      if (stored === "light") light = true;
      else if (stored === "dark") light = false;
      else light = window.matchMedia("(prefers-color-scheme: light)").matches;

      setIsLight(light)
      document.documentElement.classList.toggle("light", light);
    }

    applyTheme();

    window.addEventListener(THEME_EVENT, applyTheme);
    return () => window.removeEventListener(THEME_EVENT, applyTheme);
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
    window.dispatchEvent(new Event(THEME_EVENT));
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
      {isLight ? <IconSun size={18} /> : <IconMoon size={18} />}
    </button>
  );
}
