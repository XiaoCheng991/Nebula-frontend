import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocContent, getDocMeta, getDocsList } from "@/lib/docs";
import ArticleNavigation from "@/components/ArticleNavigation";
import { getPrevNextArticle, getRelatedArticles } from "@/lib/article-navigation";
import type { ArticleRef } from "@/lib/article-navigation";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import { getTableOfContents } from "@/components/MarkdownRenderer";
import FloatingToc from "@/components/FloatingToc";
import ReadModeToggle from "@/components/ReadModeToggle";
import ReadingBreath from "@/components/ReadingBreath";

type Props = {
  params: Promise<{ docSlug: string }>;
};

export async function generateStaticParams() {
  return getDocsList().map((doc) => ({ docSlug: doc.urlSlug }));
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { docSlug } = await params;
  const meta = getDocMeta(docSlug);
  if (!meta) return { title: "Not Found" };
  return {
    title: `${meta.title} // Kyon Blog`,
    description: meta.summary,
  };
}

export default async function DocPage({ params }: Props) {
  const { docSlug } = await params;
  const content = getDocContent(docSlug);
  const meta = getDocMeta(docSlug);

  if (!content || !meta) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-foreground/40 hover:text-primary transition-colors mb-8"
      >
        <span>{`←`}</span>
        <span>{`[ back to index ]`}</span>
      </Link>

      <div className="flex items-center gap-2 mb-8">
        <ReadingBreath />
        <div className="flex items-center gap-2 text-xs font-mono text-primary/50">
          <span className="px-1.5 py-0.5 border border-secondary/40 text-secondary/70 text-[10px]">
            DOCS
          </span>
          {meta.date && (
            <>
              <span className="text-foreground/20">|</span>
              <span>{meta.date}</span>
            </>
          )}
          {meta.readTime > 0 && (
            <>
              <span className="text-foreground/20">|</span>
              <span>{meta.readTime} min read</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-4 mb-6 flex-wrap">
        <h1 className="text-2xl font-bold tracking-tight text-foreground text-glow flex-1 min-w-0">
          {meta.title}
        </h1>
        <div className="flex items-center gap-2 shrink-0">
          <ReadModeToggle />
        </div>
      </div>

      {meta.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-8 flex-wrap">
          {meta.tags.map((tag) => (
            <span
              key={tag}
              className="px-2 py-0.5 border border-border text-xs font-mono text-foreground/40"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      <FloatingToc items={getTableOfContents(content)} />
      <article className="prose prose-sm max-w-none">
        <MarkdownRenderer content={content} />
      </article>

      {(() => {
        const current: ArticleRef = {
          key: `doc:${meta.urlSlug}`,
          href: `/blog/docs/${meta.urlSlug}`,
          title: meta.title,
          summary: meta.summary,
          date: meta.date,
          tags: meta.tags,
          type: "doc",
        };
        const { prev, next } = getPrevNextArticle(current);
        const related = getRelatedArticles(current);
        return <ArticleNavigation data={{ current, prev, next, related }} />;
      })()}
    </div>
  );
}
