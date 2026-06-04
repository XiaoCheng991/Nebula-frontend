import type { Metadata, ResolvingMetadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostBySlug, getPostSlugs } from "@/lib/posts";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function renderMarkdownLine(line: string): string {
  line = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary">$1</strong>');
  line = line.replace(/\*(.+?)\*/g, '<em class="text-foreground/80">$1</em>');
  line = line.replace(/`(.+?)`/g, '<code class="bg-muted px-1.5 py-0.5 text-xs font-mono text-secondary">$1</code>');
  if (line.startsWith("> ")) {
    return `<div class="border-l-2 border-secondary/50 pl-4 py-3 my-4 text-foreground/60 italic text-sm">${line.slice(2)}</div>`;
  }
  if (line === "---") {
    return '<hr class="border-border my-8" />';
  }
  return "";
}

function renderMarkdown(content: string): string {
  const lines = content.split('\n');
  let html = '';
  let inList = false;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h2 class="text-lg font-bold mt-8 mb-3 text-foreground">${line.slice(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 class="text-sm font-semibold mt-6 mb-2 text-foreground/90">${line.slice(4)}</h3>`;
    } else if (line.startsWith('- ')) {
      if (!inList) { html += '<ul class="list-disc list-inside space-y-1 ml-4 my-3 text-foreground/80">'; inList = true; }
      html += `<li class="text-sm">${renderMarkdownLine(line.slice(2))}</li>`;
    } else if (line.trim() === '') {
      if (inList) { html += '</ul>'; inList = false; }
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      const rendered = renderMarkdownLine(line);
      if (rendered) {
        html += rendered;
      } else if (line.trim()) {
        html += `<p class="text-sm leading-relaxed my-2 text-foreground/80">${line}</p>`;
      }
    }
  }
  if (inList) html += '</ul>';
  return html;
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getPostSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata(
  { params }: Props,
  parent: ResolvingMetadata
): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Not Found" };
  return {
    title: `${post.title} // NebulaHub Blog`,
    description: post.summary,
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      {/* Back button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-xs font-mono text-foreground/40 hover:text-primary transition-colors mb-8"
      >
        <span>{`←`}</span>
        <span>{`[ back to index ]`}</span>
      </Link>

      {/* Meta */}
      <div className="flex items-center gap-2 text-xs font-mono text-primary/50 mb-3">
        <span>{`// ${post.date}`}</span>
        <span className="text-foreground/20">|</span>
        <span>{`// ${post.readTime} min read`}</span>
      </div>

      {/* Title */}
      <h1 className="text-2xl font-bold tracking-tight mb-3 text-foreground text-glow">
        {post.title}
      </h1>

      {/* Tags */}
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

      {/* Content */}
      <article
        className="prose prose-sm max-w-none"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(post.content) }}
      />

      {/* Footer */}
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
