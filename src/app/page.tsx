import Link from "next/link";
import { posts } from "@/lib/posts";
import { getDocsList, getDocContent } from "@/lib/docs";
import BlogClient from "@/components/blog-client";
import { getAllTags } from "@/lib/tags";
import SearchTrigger from "@/components/SearchTrigger";
import Sidebar from "@/components/Sidebar";

function countWords(content: string): number {
  return content.replace(/\s/g, "").length;
}

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
    wordCount: countWords(getDocContent(doc.urlSlug) || ""),
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
    wordCount: countWords(p.content),
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

  // Light-theme sidebar data
  const sidebarTags = getAllTags();
  const yearCounts: Record<string, number> = {};
  for (const p of posts) {
    if (p.date) {
      const year = p.date.substring(0, 4);
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  }
  for (const doc of docs) {
    if (doc.date) {
      const year = doc.date.substring(0, 4);
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  }
  const archives = Object.entries(yearCounts).sort(([a], [b]) =>
    b.localeCompare(a)
  );

  return (
    <div className="max-w-2xl mx-auto px-5 py-6 home-container light-page-layout">
      <Sidebar />

      {/* Main content: Posts */}
      <div className="min-w-0 flex-1 home-main">
        {/* Hero — dark: code/h1/comment  |  light: badge */}
        <section className="mb-12 pt-4">
          {/* Dark theme: terminal-style hero (完全隐藏在浅色) */}
          <div className="sd">
            <div className="flex items-center gap-2 text-xs font-mono text-primary/60 mb-4">
              <span>{`// system.init()`}</span>
              <span className="cursor-blink" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-foreground leading-tight">
              <span className="text-primary">Halcyon</span>
              <span className="text-secondary"> Blog</span>
            </h1>
            <p className="text-foreground/50 font-mono text-sm max-w-xl">
              {`喜忧参半，皆是日常`}
            </p>
          </div>
          {/* Light theme: status badge only */}
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
            <div className="sd flex items-center gap-3 mb-3">
              <h2 className="text-sm font-mono text-primary tracking-wider">
                {`[ posts ]`}
              </h2>
              <span className="flex-1 h-[1px] bg-border" />
              <span className="text-xs font-mono text-foreground/30">
                {totalCount} entries
              </span>
            </div>
            <div className="sl flex items-center gap-3 mb-6">
              <span className="section-count-light text-base font-medium text-foreground">
                所有文章
              </span>
              <span className="section-count-light ml-auto text-base font-medium text-foreground/50">
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
      </div>

      {/* Right sidebar: search + categories + archives */}
      <aside className="sl sidebar-right">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="sidebar-card">
            <SearchTrigger />
          </div>

          {/* Categories */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">分类</div>
            <div className="sidebar-card-list">
              {sidebarTags.slice(0, 10).map((t) => (
                <Link key={t.name} href={`/tags`} className="sidebar-card-item">
                  <span>{t.name}</span>
                  <span className="sidebar-card-count">{t.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Archives */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">归档</div>
            <div className="sidebar-card-list">
              {archives.map(([year, count]) => (
                <div key={year} className="sidebar-card-item">
                  <span>{year}</span>
                  <span className="sidebar-card-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
