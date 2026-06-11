import Link from "next/link";
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
  }));

  const postItems = posts.map((p) => ({
    ...p,
    isDoc: false,
    href: `/blog/${p.slug}`,
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
      {/* Hero */}
      <section className="mb-16 pt-8">
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

        <BlogClient
          items={pageItems}
          totalCount={totalCount}
          currentPage={safePage}
          totalPages={totalPages}
          pageSize={pageSize}
        />
      </section>

      {/* About preview */}
      <section className="mt-16">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-mono text-primary tracking-wider">
            {`[ about ]`}
          </h2>
          <span className="flex-1 h-[1px] bg-border" />
        </div>
        <p className="text-sm text-foreground/50 max-w-xl">
          这里是 Kyon 的技术博客，记录学习、工作和一些有趣的项目。
          <br />
          <Link
            href="/about"
            className="inline-flex items-center gap-1 text-primary hover:text-glow transition-colors mt-2"
          >
            查看完整简介
            <span className="text-lg">→</span>
          </Link>
        </p>
      </section>
    </div>
  );
}
