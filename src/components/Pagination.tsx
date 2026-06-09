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
      <div className="flex items-center gap-2 text-xs font-mono text-foreground/40">
        <span>每页</span>
        <select
          value={pageSize}
          onChange={(e) => {
            window.location.href = `/?page=1&size=${e.target.value}`;
          }}
          className="bg-background border border-border text-foreground/60 px-2 py-1 text-xs font-mono cursor-pointer hover:border-primary/50 focus:border-primary focus:outline-none transition-colors"
        >
          {PAGE_SIZES.map((sz) => (
            <option key={sz} value={sz}>{sz}</option>
          ))}
        </select>
        <span>条</span>
      </div>

      <div className="flex items-center gap-2 text-xs font-mono">
        {safePage > 1 ? (
          <Link
            href={`/?page=${safePage - 1}&size=${pageSize}`}
            className="px-3 py-1.5 border border-border hover:border-primary/50 text-foreground/60 hover:text-primary transition-colors"
          >
            ← prev
          </Link>
        ) : (
          <span className="px-3 py-1.5 border border-border text-foreground/20 cursor-default">← prev</span>
        )}
        <span className="text-foreground/40 px-2">
          {safePage} / {totalPages}
        </span>
        {safePage < totalPages ? (
          <Link
            href={`/?page=${safePage + 1}&size=${pageSize}`}
            className="px-3 py-1.5 border border-border hover:border-primary/50 text-foreground/60 hover:text-primary transition-colors"
          >
            next →
          </Link>
        ) : (
          <span className="px-3 py-1.5 border border-border text-foreground/20 cursor-default">next →</span>
        )}
      </div>
    </div>
  );
}
