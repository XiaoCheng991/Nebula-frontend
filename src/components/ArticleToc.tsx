"use client";

import { useEffect, useState } from "react";
import type { TocItem } from "./MarkdownRenderer";

export default function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);

  useEffect(() => {
    if (!items.length) return;
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => Boolean(element));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
        if (visible) setActiveId(visible.target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 1] },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
  }, [items]);

  if (items.length === 0) return null;

  return (
    <nav aria-label="文章目录" className="toc-list font-mono">
      <div className="toc-title">[ contents ]</div>
      <ol className="toc-ol">
        {items.map((item) => (
          <li key={item.id} style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}>
            <a
              href={`#${item.id}`}
              aria-current={activeId === item.id ? "true" : undefined}
              className={[
                "block py-1 text-[11px] leading-snug transition-colors",
                activeId === item.id
                  ? "text-primary"
                  : "text-foreground/50 hover:text-primary",
              ].join(" ")}
            >
              {item.title}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
