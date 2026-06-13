import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocContent, getDocMeta, getDocsList } from "@/lib/docs";
import MarkdownRenderer from "@/components/MarkdownRenderer";
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

      <h1 className="text-2xl font-bold tracking-tight mb-3 text-foreground text-glow">
        {meta.title}
      </h1>

      {meta.tags.length > 0 && (
        <div className="flex items-center gap-2 mb-8">
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

      <article className="prose prose-sm max-w-none">
        <MarkdownRenderer content={content} />
      </article>

      <div className="mt-20 pt-8 flex flex-col items-center gap-4 text-xs font-mono text-foreground/25">
        <div className="flex items-center gap-3">
          <span className="h-[1px] w-8 bg-border" />
          <span className="text-primary/40">◆</span>
          <span className="h-[1px] w-8 bg-border" />
        </div>
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="text-foreground/30 hover:text-primary transition-colors"
          >
            返回列表
          </Link>
          <span className="text-foreground/15">|</span>
          <span>Kyon Blog</span>
        </div>
      </div>
    </div>
  );
}
