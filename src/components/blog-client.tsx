"use client";

import Link from "next/link";

interface Item {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readTime: number;
  isDoc: boolean;
  href: string;
}

export default function BlogClient({
  items,
  currentPage,
  totalPages,
  pageSize,
}: {
  items: Item[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
}) {
  return (
    <>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const delay = 0.06 + idx * 0.07; // 0.06s → 0.13s → ... → ~0.55s
          return (
            <Link
              key={item.slug}
              href={item.href}
              className="card-rise group block border border-border/60 bg-card/20 p-5 hover:border-primary/40 hover:bg-card/35 transition-all duration-300"
              style={{ animationDelay: `${delay}s` }}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary/50 group-hover:text-primary transition-all duration-200 group-hover:translate-x-1">
                    {"› "}
                  </span>
                  {item.title}
                </h3>
                {item.date && (
                  <span className="text-xs font-mono text-foreground/40 whitespace-nowrap shrink-0">
                    {new Date(item.date).toLocaleDateString("zh-CN", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                    })}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/60 pl-4 mb-3 leading-relaxed">
                {item.summary}
              </p>
              <div className="flex items-center gap-2 pl-4 text-xs font-mono flex-wrap">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-block px-2.5 py-[3.5px] text-[10.5px] border text-primary/60 bg-primary/[0.06] border-primary/15 group-hover:text-primary/85 group-hover:border-primary/35 group-hover:bg-primary/[0.10] transition-all duration-200"
                  >
                    {tag}
                  </span>
                ))}
                {item.readTime > 0 && (
                  <>
                    <span className="text-foreground/25">·</span>
                    <span className="text-foreground/35 group-hover:text-primary/40 transition-colors text-[10px]">
                      {item.readTime}m read
                    </span>
                  </>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-10 text-xs font-mono">
        <button
          className="px-3 py-1.5 border border-border text-foreground/50 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          disabled={currentPage <= 1}
          onClick={() => {
            const url = new URL(location.pathname, location.origin);
            url.searchParams.set("page", String(currentPage - 1));
            url.searchParams.set("size", String(pageSize));
            location.href = url.toString();
          }}
        >
          ← prev
        </button>
        <span className="text-foreground/30 tabular-nums">
          {currentPage} / {totalPages}
        </span>
        <button
          className="px-3 py-1.5 border border-border text-foreground/50 hover:border-primary/50 hover:text-primary transition-colors disabled:opacity-25 disabled:cursor-not-allowed"
          disabled={currentPage >= totalPages}
          onClick={() => {
            const url = new URL(location.pathname, location.origin);
            url.searchParams.set("page", String(currentPage + 1));
            url.searchParams.set("size", String(pageSize));
            location.href = url.toString();
          }}
        >
          next →
        </button>
      </div>
    </>
  );
}