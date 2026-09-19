"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { formatDate } from "@/lib/utils";

interface Item {
  slug: string;
  title: string;
  summary: string;
  date: string;
  tags: string[];
  readTime: number;
  isDoc: boolean;
  href: string;
  cover?: string;
}

function formatDateOrEmpty(date: string): string {
  return formatDate(date) ?? "";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", String(page));
    params.set("size", String(pageSize));
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  };

  return (
    <>
      <div className="space-y-3">
        {items.map((item, idx) => {
          const delay = Math.min(idx, 6) * 0.04;
          const date = formatDateOrEmpty(item.date);
          return (
            <Link
              key={item.slug}
              href={item.href}
              className="card-rise group block border border-border/60 bg-card/20 hover:border-primary/40 hover:bg-card/35 transition-colors duration-300 overflow-hidden"
              style={{ animationDelay: `${delay}s` }}
            >
              {item.cover ? (
                /* ---- with cover image: left thumb + right content ---- */
                <div className="flex items-stretch">
                  <div className="shrink-0 w-[80px] sm:w-[100px] h-auto p-3 flex items-center justify-center">
                    <Image
                      src={item.cover}
                      alt=""
                      className="w-full h-auto object-cover opacity-70 group-hover:opacity-100 transition-opacity duration-300"
                      style={{ maxHeight: "96px" }}
                      width={100}
                      height={96}
                      sizes="(max-width: 639px) 56px, 76px"
                      quality={50}
                      loading="lazy"
                      decoding="async"
                    />
                  </div>
                  <div className="flex-1 p-5 pt-3 sm:pt-5">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                        <span className="text-primary/50 group-hover:text-primary transition-all duration-200 group-hover:translate-x-1">
                          {"› "}
                        </span>
                        {item.title}
                      </h3>
                      {date && (
                        <span className="text-xs font-mono text-foreground/40 whitespace-nowrap shrink-0">
                          {date}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-foreground/60 mb-3 leading-relaxed line-clamp-2">
                      {item.summary}
                    </p>
                    <div className="flex items-center gap-2 text-xs font-mono flex-wrap">
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
                  </div>
                </div>
              ) : (
                /* ---- no cover: full-width text card, no thumb box ---- */
                <div className="p-5">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                      <span className="text-primary/50 group-hover:text-primary transition-all duration-200 group-hover:translate-x-1">
                        {"› "}
                      </span>
                      {item.title}
                    </h3>
                    {date && (
                      <span className="text-xs font-mono text-foreground/40 whitespace-nowrap shrink-0">
                        {date}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-foreground/60 leading-relaxed line-clamp-2">
                    {item.summary}
                  </p>
                  <div className="flex items-center gap-2 text-xs font-mono flex-wrap mt-3">
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
                </div>
              )}
            </Link>
          );
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 mt-10 text-xs font-mono">
        {currentPage > 1 ? (
          <Link
            href={buildPageUrl(currentPage - 1)}
            className="px-3 py-1.5 border border-border text-foreground/50 hover:border-primary/50 hover:text-primary transition-colors"
          >
            ← prev
          </Link>
        ) : (
          <span className="px-3 py-1.5 border border-border text-foreground/25 disabled:opacity-25 select-none">
            ← prev
          </span>
        )}
        <span className="text-foreground/30 tabular-nums">
          {currentPage} / {totalPages}
        </span>
        {currentPage < totalPages ? (
          <Link
            href={buildPageUrl(currentPage + 1)}
            className="px-3 py-1.5 border border-border text-foreground/50 hover:border-primary/50 hover:text-primary transition-colors"
          >
            next →
          </Link>
        ) : (
          <span className="px-3 py-1.5 border border-border text-foreground/25 select-none">
            next →
          </span>
        )}
      </div>
    </>
  );
}
