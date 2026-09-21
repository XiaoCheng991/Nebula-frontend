import { posts } from "@/lib/posts";
import { getDocsList } from "@/lib/docs";
import BlogClient from "@/components/blog-client";

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string }>;
}) {
  const { page, size } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const pageSize = [10, 20, 50].includes(parseInt(size || "10", 10))
    ? parseInt(size || "10", 10)
    : 10;

  const docs = getDocsList();

  const docItems = docs.map((doc) => ({
    slug: `docs/${doc.slug}`,
    title: doc.title,
    summary: doc.summary,
    date: doc.date,
    tags: doc.tags.length > 0 ? doc.tags : ["笔记"],
    readTime: doc.readTime || 0,
    isDoc: true,
    href: `/blog/docs/${doc.urlSlug}`,
    cover: doc.cover,
  }));

  const postItems = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    date: p.date,
    tags: p.tags,
    readTime: p.readTime,
    isDoc: false,
    href: `/blog/${p.slug}`,
    cover: p.cover,
  }));

  const allItems = [...docItems, ...postItems].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  const totalCount = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageItems = allItems.slice(startIdx, startIdx + pageSize);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero — dark: code/h1/comment  |  light: glass K-logo + badge + subtitle */}
      <section className="mb-12 pt-4">
        {/* Dark theme: terminal-style hero (完全隐藏在浅色) */}
        <div className="sd">
          <div className="flex items-center gap-2 text-xs font-mono text-primary/60 mb-4">
            <span>{`// system.init()`}</span>
            <span className="cursor-blink" />
          </div>
          <h1 className="text-4xl font-bold mb-3 text-foreground leading-tight">
            <span className="text-primary">Kyon</span>
            <span className="text-secondary"> Blog</span>
          </h1>
          <p className="text-foreground/50 font-mono text-sm max-w-xl">
            {`/* 代码、想法与技术笔记 */`}
          </p>
        </div>
        {/* Light theme: liquid-glass K logo + status badge + subtitle */}
        <div className="sl">
          <div className="hero-badge">
            <span className="hero-badge-dot" />
            <span>v3.0 · 正在写作</span>
          </div>
        </div>
      </section>

      {/* Posts + Docs */}
      <section>
        <div className="section-header">
          <div className="sd flex items-center gap-3">
            <h2 className="text-sm font-mono text-primary tracking-wider">
              {`[ posts ]`}
            </h2>
            <span className="flex-1 h-[1px] bg-border" />
            <span className="text-xs font-mono text-foreground/30">
              {totalCount} entries
            </span>
          </div>
          <div className="sl flex items-center gap-3 mb-6">
            <h2 className="text-sm font-medium">
              所有文章
            </h2>
            <span className="section-count-light flex items-center px-2.5 py-0.5 text-[11px] font-medium">
              {totalCount} 篇
            </span>
          </div>
        </div>

        <BlogClient
          items={pageItems}
          totalCount={totalCount}
          currentPage={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      </section>
      {/* RandomQuote moved out to layout.tsx - fixed bottom-right, dock-style. */}
    </div>
  );
}
