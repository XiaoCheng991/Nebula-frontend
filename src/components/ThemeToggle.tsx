"use client";

import { useState } from "react";
import {IconMoon, IconSun} from "@tabler/icons-react";

const THEME_EVENT = "theme-change";

export default function ThemeToggle() {
  const [isLight, setIsLight] = useState(false);

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

  return (
    <button onClick={toggle} className="menu-item w-full text-left">
      {isLight ? <IconSun size={18} /> : <IconMoon size={18} />}
      <span className="theme-toggle-label">{isLight ? "To Dark" : "To Light"}</span>
    </button>
  );
}
