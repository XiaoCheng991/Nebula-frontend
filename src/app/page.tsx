import Link from "next/link";
import { posts } from "@/lib/posts";
import { getDocsList } from "@/lib/docs";

function formatDate(dateStr: string): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default function HomePage() {
  const docs = getDocsList();
  const totalCount = posts.length + docs.length;

  // Flatten docs into the same shape as posts for unified rendering
  const docItems = docs.map((doc) => ({
    slug: `docs/${doc.slug}`,
    title: doc.title,
    summary: doc.summary,
    date: doc.date,  // doc date (may be empty)
    tags: doc.tags.length > 0 ? doc.tags : ["笔记"],
    readTime: doc.readTime || 0,
    isDoc: true,
    href: `/blog/docs/${doc.urlSlug}`,
  }));

  const postItems = posts.map((p) => ({
    ...p,
    isDoc: false,
    href: `/blog/${p.slug}`,
  }));

  const allItems = [...docItems, ...postItems];

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="mb-16 pt-8">
        <div className="flex items-center gap-2 text-xs font-mono text-primary/60 mb-4">
          <span>{`// system.init()`}</span>
          <span className="cursor-blink" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-foreground">
          Kyon{' '}
          <span className="text-secondary text-glow-secondary">Blog</span>
        </h1>
        <p className="text-foreground/50 font-mono text-sm max-w-xl">
          {`/* 代码、想法与技术笔记 */`}
        </p>
      </section>

      {/* Posts + Docs */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-sm font-mono text-primary tracking-wider">
            {`[ posts ]`}
          </h2>
          <span className="flex-1 h-[1px] bg-border" />
          <span className="text-xs font-mono text-foreground/30">
            {totalCount} entries
          </span>
        </div>

        <div className="space-y-2">
          {allItems.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="block group border border-border bg-card/50 p-5 hover:border-primary/40 hover:border-glow transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary/40 group-hover:text-primary transition-colors">{`> `}</span>
                  {item.isDoc && (
                    <span className="text-[10px] font-mono px-1.5 py-0.5 border border-secondary/40 text-secondary/70 shrink-0">
                      DOCS
                    </span>
                  )}
                  {item.title}
                </h3>
                {item.date && (
                  <span className="text-xs font-mono text-foreground/30 whitespace-nowrap">
                    {formatDate(item.date)}
                  </span>
                )}
              </div>
              <p className="text-sm text-foreground/50 pl-4 mb-3 leading-relaxed">
                {item.summary}
              </p>
              <div className="flex items-center gap-3 pl-4 text-xs font-mono">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 border border-border text-foreground/40 group-hover:border-primary/30 group-hover:text-primary/60 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
                {item.readTime > 0 && (
                  <>
                    <span className="text-foreground/20">|</span>
                    <span className="text-foreground/30">
                      {item.readTime} min read
                    </span>
                  </>
                )}
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="mt-16 pt-8 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-mono text-primary tracking-wider">
            {`[ about ]`}
          </h2>
          <span className="flex-1 h-[1px] bg-border" />
        </div>
        <p className="text-sm text-foreground/50 max-w-xl">
          这里是 Kyon 的技术博客，记录学习、工作和一些有趣的项目。
          <br />
          <Link href="/about" className="text-primary hover:text-glow inline-flex items-center gap-1 transition-colors mt-2">
            查看完整简介
            <span className="text-lg">→</span>
          </Link>
        </p>
      </section>
    </div>
  );
}
