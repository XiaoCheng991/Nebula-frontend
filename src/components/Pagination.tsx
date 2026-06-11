"use client";

import Link from "next/link";

const PAGE_SIZES = [10, 20, 50];

export default function Pagination({
  currentPage,
  totalPages,
  pageSize,
}: {
  currentPage: number;
  totalPages: number;
  pageSize: number;
}) {
  const safePage = Math.min(currentPage, totalPages);

  return (
    <div className="flex items-center justify-between mt-8">
      {/* Page size selector — pill style */}
      <div className="flex items-center gap-2 text-xs font-mono text-foreground/50">
        <span>每页</span>
        <div className="flex items-center gap-px border border-border overflow-hidden">
          {PAGE_SIZES.map((sz) => (
            <Link
              key={sz}
              href={`/?page=1&size=${sz}`}
              className={`px-2.5 py-1 hover:bg-primary/10 transition-colors ${
                pageSize === sz
                  ? "bg-primary/10 text-primary"
                  : "text-foreground/40 hover:text-foreground/60"
              }`}
            >
              {sz}
            </Link>
          ))}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-2 text-xs font-mono">
        {safePage > 1 ? (
          <Link
            href={`/?page=${safePage - 1}&size=${pageSize}`}
            className="px-3 py-1.5 border border-border hover:border-primary/40 text-foreground/60 hover:text-primary transition-colors"
          >
            ← prev
          </Link>
        ) : (
          <span className="px-3 py-1.5 border border-border/40 text-foreground/20 cursor-default">
            ← prev
          </span>
        )}
        <span className="text-foreground/40 px-2">
          {safePage} / {totalPages}
        </span>
        {safePage < totalPages ? (
          <Link
            href={`/?page=${safePage + 1}&size=${pageSize}`}
            className="px-3 py-1.5 border border-border hover:border-primary/40 text-foreground/60 hover:text-primary transition-colors"
          >
            next →
          </Link>
        ) : (
          <span className="px-3 py-1.5 border border-border/40 text-foreground/20 cursor-default">
            next →
          </span>
        )}
      </div>
    </div>
  );
}
