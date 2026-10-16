"use client";

import { useEffect, useMemo, useState } from "react";
import type { TocItem } from "./MarkdownRenderer";

/**
 * 文章目录（右侧栏 / 浮动面板共用）。
 *
 * - 标题过多时列表自身滚动（max-height + overflow-y），不再被视窗裁切，
 *   且滚轮在目录内滚动不会带动正文。
 * - 顶级标题（最小 level）可折叠：标题前有箭头按钮，点击收起其下所有子级。
 */
export default function ArticleToc({ items }: { items: TocItem[] }) {
  const [activeId, setActiveId] = useState(items[0]?.id);
  const [collapsed, setCollapsed] = useState<ReadonlySet<string>>(() => new Set());

  /* 折叠模型：每个条目归属于最近的顶级标题；顶级标题记录其是否有子级 */
  const { topLevel, owner, expandable } = useMemo(() => {
    const top = items.length ? Math.min(...items.map((item) => item.level)) : 2;
    const ownerMap = new Map<string, string>();
    const expandableSet = new Set<string>();
    let currentTop = "";
    for (const item of items) {
      if (item.level === top) {
        currentTop = item.id;
        ownerMap.set(item.id, item.id);
      } else if (currentTop) {
        ownerMap.set(item.id, currentTop);
        expandableSet.add(currentTop);
      }
    }
    return { topLevel: top, owner: ownerMap, expandable: expandableSet };
  }, [items]);

  const activate = (id: string) => {
    setActiveId(id);
    /* 高亮落到被折叠的分支时自动展开，保证当前章节可见 */
    const parent = owner.get(id);
    if (parent && parent !== id) {
      setCollapsed((prev) => {
        if (!prev.has(parent)) return prev;
        const next = new Set(prev);
        next.delete(parent);
        return next;
      });
    }
  };

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
        if (visible) activate(visible.target.id);
      },
      { rootMargin: "-96px 0px -65% 0px", threshold: [0, 1] },
    );
    headings.forEach((heading) => observer.observe(heading));
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  if (items.length === 0) return null;

  const toggle = (id: string) =>
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <nav aria-label="文章目录" className="toc-list font-mono">
      <div className="toc-title">[ contents ]</div>
      <ol className="toc-ol">
        {items
          .filter((item) => {
            const parent = owner.get(item.id);
            return !parent || parent === item.id || !collapsed.has(parent);
          })
          .map((item) => {
            const isTop = item.level === topLevel || !owner.get(item.id);
            const canExpand = isTop && expandable.has(item.id);
            const open = !collapsed.has(item.id);
            return (
              <li
                key={item.id}
                className="toc-li"
                style={{ paddingLeft: `${(item.level - 2) * 0.75}rem` }}
              >
                {canExpand ? (
                  <button
                    type="button"
                    className="toc-caret"
                    aria-expanded={open}
                    aria-label={open ? `收起 ${item.title}` : `展开 ${item.title}`}
                    onClick={() => toggle(item.id)}
                  >
                    <svg width="8" height="10" viewBox="0 0 8 10" aria-hidden="true">
                      <path d="M1.5 1 L6.5 5 L1.5 9" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                ) : (
                  <span className="toc-caret-spacer" aria-hidden="true" />
                )}
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
            );
          })}
      </ol>
    </nav>
  );
}
