"use client";

import { useEffect, useState } from "react";
import { IconMoon, IconSun } from "@tabler/icons-react";

const THEME_EVENT = "theme-change";

export default function ThemeToggleIcon() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    const applyTheme = () => {
      const stored = localStorage.getItem("theme");
      let light;
      if (stored === "light") light = true;
      else if (stored === "dark") light = false;
      else light = window.matchMedia("(prefers-color-scheme: light)").matches;
      setIsLight(light);
      document.documentElement.classList.toggle("light", light);
    };
    applyTheme();
    window.addEventListener(THEME_EVENT, applyTheme);
    return () => window.removeEventListener(THEME_EVENT, applyTheme);
  }, []);

  const toggle = () => {
    const next = !isLight;
    if (next) {
      document.documentElement.classList.add("light");
      localStorage.setItem("theme", "light");
    } else {
      document.documentElement.classList.remove("light");
      localStorage.setItem("theme", "dark");
    }
    window.dispatchEvent(new Event(THEME_EVENT));
  };

  return (
      <button
          className="h-7 w-7 flex item-center justify-center transition-colors text-foreground/65 border border-transparent hover:text-primary hover:border-primary/40"
          onClick={toggle}
          aria-label="切换主题"
          style={{ background: "none", cursor: "pointer", display: "flex", alignItems: "center" }}
      >
        {isLight ? <IconSun size={18} /> : <IconMoon size={18} />}
      </button>
  );
}
