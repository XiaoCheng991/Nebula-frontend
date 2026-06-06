import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";
import MarkdownRenderer from "@/components/MarkdownRenderer";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

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
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-foreground/40 hover:text-primary transition-colors mb-8"
      >
        <span>{`←`}</span>
        <span>{`[ back to index ]`}</span>
      </Link>

      <div className="flex items-center gap-2 text-xs font-mono text-primary/50 mb-3">
        <span>{`// ${post.date}`}</span>
        <span className="text-foreground/20">|</span>
        <span>{`// ${post.readTime} min read`}</span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-3 text-foreground text-glow">
        {post.title}
      </h1>

      <div className="flex items-center gap-2 mb-8">
        {post.tags.map((tag) => (
          <span
            key={tag}
            className="px-2 py-0.5 border border-border text-xs font-mono text-foreground/40"
          >
            #{tag}
          </span>
        ))}
      </div>

      <article className="prose prose-sm max-w-none">
        <MarkdownRenderer content={post.content} />
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
