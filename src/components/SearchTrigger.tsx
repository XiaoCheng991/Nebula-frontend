"use client";

import { Search } from "lucide-react";

export default function SearchTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent("kyon:search"))}
      aria-label="打开搜索"
      className="group flex items-center gap-2 rounded-sm border border-border bg-background/40 search-glass px-3 py-1.5 text-foreground/50 transition-colors hover:border-primary/60 hover:text-primary hover:shadow-[0_0_10px_hsl(var(--primary)/0.2)] nav-glow sm:w-52"
    >
      <Search size={14} className="shrink-0" />
      <span className="flex-1 truncate text-left text-xs text-foreground/40 group-hover:text-foreground/60">
        搜索...
      </span>
      <kbd className="rounded-sm border border-border px-1.5 py-0.5 text-[10px] font-mono text-foreground/40 group-hover:border-primary/40">
        ⌘K
      </kbd>
    </button>
  );
}
