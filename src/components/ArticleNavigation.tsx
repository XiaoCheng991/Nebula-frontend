import Link from "next/link";
import type { ArticleRef } from "@/lib/article-navigation";

export interface ArticleNavigationData {
  current: ArticleRef;
  prev?: ArticleRef;
  next?: ArticleRef;
  related?: ArticleRef[];
}

function PrevNextLink({
  label,
  item,
  align,
}: {
  label: string;
  item: ArticleRef;
  align: "prev" | "next";
}) {
  const right = align === "next";
  return (
    <Link
      href={item.href}
      className={`group block min-w-0 px-4 py-1 ${
        right ? "text-right" : "text-left"
      }`}
    >
      <div
        className={`text-[10px] font-mono tracking-[0.18em] text-foreground/40 group-hover:text-primary transition-colors ${
          right ? "justify-end" : ""
        } flex items-center gap-1.5`}
      >
        {!right && <span aria-hidden>←</span>}
        {label}
        {right && <span aria-hidden>→</span>}
      </div>
      <div className="mt-1 truncate font-mono text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
        {item.title}
      </div>
    </Link>
  );
}

export default function ArticleNavigation({ data }: { data: ArticleNavigationData }) {
  const { prev, next, related = [] } = data;

  return (
    <div className="mt-12 border-border/50 pt-8">
      <div className="mb-6 flex items-center gap-3 text-xs font-mono text-foreground/30">
        <span className="text-primary/40">◆</span>
        <span>continue reading</span>
        <span className="h-[1px] flex-1 bg-border/50" />
      </div>

      {prev || next ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-0">
          <div className={prev ? "" : "hidden"}>
            {prev ? (
              <PrevNextLink align="prev" label="PREVIOUS" item={prev} />
            ) : null}
          </div>
          <div className={next ? "sm:border-l sm:border-border/40" : "hidden"}>
            {next ? (
              <PrevNextLink align="next" label="NEXT" item={next} />
            ) : null}
          </div>
        </div>
      ) : null}

      {related.length > 0 ? (
        <>
          <div className="mt-10 mb-3 text-[11px] font-mono tracking-[0.14em] text-foreground/35">
            related
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className="group border border-border/50 bg-background/40 p-3 transition-colors hover:border-primary/35 hover:bg-background/70"
              >
                <div className="truncate font-mono text-xs font-semibold text-foreground/75 group-hover:text-primary transition-colors">
                  {item.title}
                </div>
                {item.tags.length > 0 ? (
                  <div className="mt-1 flex flex-wrap gap-1 text-[10px] font-mono text-foreground/30 group-hover:text-foreground/45">
                    {item.tags.slice(0, 3).map((tag) => (
                      <span key={tag}>#{tag}</span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        </>
      ) : null}

      <div className="mt-12 flex flex-col items-center gap-4 text-xs font-mono text-foreground/25">
        <div className="flex items-center gap-3">
          <span className="h-[1px] w-8 bg-border" />
          <span className="text-primary/40">◆</span>
          <span className="h-[1px] w-8 bg-border" />
        </div>
        <div className="flex items-center gap-4">
          <Link href="/" className="text-foreground/30 hover:text-primary transition-colors">
            返回列表
          </Link>
          <span className="text-foreground/15">|</span>
          <span>Kyon Blog</span>
        </div>
      </div>
    </div>
  );
}
