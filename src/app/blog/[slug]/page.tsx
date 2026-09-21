import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import ArticleNavigation from "@/components/ArticleNavigation";
import { getPrevNextArticle, getRelatedArticles } from "@/lib/article-navigation";
import type { ArticleRef } from "@/lib/article-navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getTableOfContents } from "@/components/MarkdownRenderer";
import FloatingToc from "@/components/FloatingToc";
import ReadModeToggle from "@/components/ReadModeToggle";
import ReadingBreath from "@/components/ReadingBreath";

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} // Kyon Blog`,
    description: post.summary,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Dark theme: original monospace back link — untouched */}
      <div className="sd">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-foreground/40 hover:text-primary transition-colors mb-8"
        >
          <span>{`←`}</span>
          <span>{`[ back to index ]`}</span>
        </Link>
      </div>
      {/* Light theme: glass pill — Chinese text, readable */}
      <div className="sl">
        <Link
          href="/"
          className="back-link-light group inline-flex items-center gap-2 text-xs text-foreground/70 hover:text-primary transition-colors mb-8"
        >
          <span className="transition-transform group-hover:-translate-x-0.5">←</span>
          <span>返回文章列表</span>
        </Link>
      </div>

      <div className="flex items-center gap-2 mb-8">
        <ReadingBreath />
        <div className="flex items-center gap-2 text-xs font-mono text-primary/50">
          <span>{`// ${post.date}`}</span>
          <span className="text-foreground/20">|</span>
          <span>{`// ${post.readTime} min read`}</span>
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-3xl font-bold tracking-tight text-foreground text-glow flex-1 min-w-0">
          {post.title}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <ReadModeToggle />
        </div>
      </div>

      <div className="flex items-center gap-2 mb-8 flex-wrap">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 border border-border text-xs font-mono text-foreground/40 detail-tag"
          >
            #{tag}
          </span>
        ))}
      </div>

      <FloatingToc items={getTableOfContents(post.content)} />
      <article className="prose prose-sm max-w-none">
        <MarkdownRenderer content={post.content} />
      </article>

      {(() => {
        const current: ArticleRef = {
          key: `post:${post.slug}`,
          href: `/blog/${post.slug}`,
          title: post.title,
          summary: post.summary,
          date: post.date,
          tags: post.tags,
          type: "post",
        };
        const { prev, next } = getPrevNextArticle(current);
        const related = getRelatedArticles(current);
        return <ArticleNavigation data={{ current, prev, next, related }} />;
      })()}
    </div>
  );
}
