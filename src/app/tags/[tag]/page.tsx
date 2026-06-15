import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "@/lib/posts";
import { getDocsList } from "@/lib/docs";
import { getAllTags } from "@/lib/tags";
import { getTagColor } from "@/lib/tag-color";
import BlogClient from "@/components/blog-client";

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

interface PageProps {
  params: Promise<{ tag: string }>;
}

export default async function TagPostsPage({ params }: PageProps) {
  const { tag: rawTag } = await params;
  const tag = decodeURIComponent(rawTag);

  // Verify tag exists
  const allTags = getAllTags();
  if (!allTags.find((t) => t.name === tag)) {
    notFound();
  }

  // Collect items with this tag
  const items: Item[] = [];

  for (const post of posts) {
    if (post.tags?.includes(tag)) {
      items.push({
        slug: post.slug,
        title: post.title,
        summary: post.summary,
        date: post.date,
        tags: post.tags,
        readTime: post.readTime || 0,
        isDoc: false,
        href: `/blog/${post.slug}`,
        cover: post.cover,
      });
    }
  }

  for (const doc of getDocsList()) {
    if (doc.tags?.includes(tag)) {
      items.push({
        slug: `docs/${doc.slug}`,
        title: doc.title,
        summary: doc.summary,
        date: doc.date,
        tags: doc.tags,
        readTime: doc.readTime || 0,
        isDoc: true,
        href: `/blog/docs/${doc.urlSlug}`,
        cover: doc.cover,
      });
    }
  }

  // Sort by date desc
  items.sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  const colorClass = getTagColor(tag);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link
        href="/tags"
        className="inline-flex items-center gap-2 text-xs font-mono text-foreground/40 hover:text-primary transition-colors mb-6"
      >
        <span>{`←`}</span>
        <span>{`[ back to tags ]`}</span>
      </Link>

      {/* Header */}
      <section className="mb-10">
        <h1 className="text-4xl font-bold mb-2 text-foreground leading-tight">
          <span className="text-primary">[</span>
          <span className="text-secondary"> tag: </span>
          <span className={colorClass}>{tag}</span>
          <span className="text-primary"> ]</span>
        </h1>
        <p className="text-foreground/50 font-mono text-sm">
          {items.length} 篇文章 · 按日期倒序
        </p>
      </section>

      {/* Posts */}
      <section>
        {items.length === 0 ? (
          <p className="text-sm text-foreground/40 font-mono py-12 text-center">
            // no posts found for this tag
          </p>
        ) : (
          <BlogClient
            items={items}
            totalCount={items.length}
            currentPage={1}
            totalPages={1}
            pageSize={50}
          />
        )}
      </section>
    </div>
  );
}
