"use client";

import { useEffect, useState } from "react";

export default function ReadModeToggle() {
  const [enabled, setEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem("readMode");
    const initial = stored === "1" || document.documentElement.classList.contains("read-mode");
    setEnabled(initial);
  }, []);

  const toggle = () => {
    const next = !enabled;
    setEnabled(next);
    if (next) {
      document.documentElement.classList.add("read-mode");
      localStorage.setItem("readMode", "1");
    } else {
      document.documentElement.classList.remove("read-mode");
      localStorage.removeItem("readMode");
    }
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-pressed={false}
        aria-label="开启阅读模式"
        className="read-mode-toggle"
        disabled
      >
        阅读模式
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label={enabled ? "退出阅读模式" : "开启阅读模式"}
      className="read-mode-toggle"
    >
      {enabled ? "退出阅读" : "阅读模式"}
    </button>
  );
}
