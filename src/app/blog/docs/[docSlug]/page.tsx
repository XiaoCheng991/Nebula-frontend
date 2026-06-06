import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDocContent, getDocMeta, getDocsList } from "@/lib/docs";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type Props = {
  params: Promise<{ docSlug: string }>;
};

export async function generateStaticParams() {
  return getDocsList().map((doc) => ({ docSlug: doc.slug }));
}

export async function generateMetadata(
  { params }: Props,
): Promise<Metadata> {
  const { docSlug } = await params;
  const meta = getDocMeta(docSlug);
  if (!meta) return { title: "Not Found" };
  return {
    title: `${meta.title} // NebulaHub Blog`,
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

      <div className="flex items-center gap-2 text-xs font-mono text-primary/50 mb-3">
        <span className="px-1.5 py-0.5 border border-secondary/40 text-secondary/70 text-[10px]">
          DOCS
        </span>
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-3 text-foreground text-glow">
        {meta.title}
      </h1>

      <article className="prose prose-sm max-w-none">
        <MarkdownRenderer content={content} />
      </article>

      <div className="mt-16 pt-6 border-t border-border flex items-center justify-between text-xs font-mono text-foreground/30">
        <span>{`/* end of document */`}</span>
        <Link
          href="/"
          className="text-primary/50 hover:text-primary transition-colors"
        >
          {`[ return to index ] →`}
        </Link>
      </div>
    </div>
  );
}
