"use client";

import { useEffect, useRef, useState } from "react";
import type { TocItem } from "./MarkdownRenderer";
import ArticleToc from "./ArticleToc";

export default function FloatingToc({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onEsc = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (items.length === 0) return null;

  return (
    <div ref={rootRef}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls="floating-toc"
        onClick={() => setOpen((value) => !value)}
        className="toc-float-trigger"
      >
        {open ? "收起" : "目录"}
      </button>
      {open && (
        <div id="floating-toc" className="toc-float-panel" aria-label="文章目录" role="dialog">
          <ArticleToc items={items} />
        </div>
      )}
    </div>
  );
}
