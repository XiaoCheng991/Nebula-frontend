import Link from "next/link";
import { posts } from "@/lib/posts";

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

function renderMarkdownLine(line: string): string {
  // Bold: **text**
  line = line.replace(/\*\*(.+?)\*\*/g, '<strong class="text-primary">$1</strong>');
  // Italic: *text*
  line = line.replace(/\*(.+?)\*/g, '<em class="text-foreground/80">$1</em>');
  // Inline code: `text`
  line = line.replace(/`(.+?)`/g, '<code class="bg-muted px-1 py-0.5 text-xs font-mono text-secondary">$1</code>');
  // Blockquote: > text
  if (line.startsWith("> ")) {
    return `<div class="border-l-2 border-secondary/50 pl-4 py-2 my-4 text-foreground/60 italic">${line.slice(2)}</div>`;
  }
  // Horizontal rule
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
      html += `<h2 class="text-xl font-bold mt-8 mb-3 text-foreground">${line.slice(3)}</h2>`;
    } else if (line.startsWith('### ')) {
      if (inList) { html += '</ul>'; inList = false; }
      html += `<h3 class="text-base font-semibold mt-6 mb-2 text-foreground/90">${line.slice(4)}</h3>`;
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

export default function HomePage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Hero */}
      <section className="mb-16 pt-8">
        <div className="flex items-center gap-2 text-xs font-mono text-primary/60 mb-4">
          <span>{`// system.init()`}</span>
          <span className="cursor-blink" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-foreground">
          NebulaHub{' '}
          <span className="text-secondary text-glow-secondary">Blog</span>
        </h1>
        <p className="text-foreground/50 font-mono text-sm max-w-xl">
          {`/* 代码、想法与技术笔记 */`}
        </p>
      </section>

      {/* Posts */}
      <section>
        <div className="flex items-center gap-3 mb-8">
          <h2 className="text-sm font-mono text-primary tracking-wider">
            {`[ posts ]`}
          </h2>
          <span className="flex-1 h-[1px] bg-border" />
          <span className="text-xs font-mono text-foreground/30">
            {posts.length} entries
          </span>
        </div>

        <div className="space-y-2">
          {posts.map((post) => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className="block group border border-border bg-card/50 p-5 hover:border-primary/40 hover:border-glow transition-all duration-200 slide-in-left"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3 className="text-base font-semibold text-foreground group-hover:text-primary transition-colors flex items-center gap-2">
                  <span className="text-primary/40 group-hover:text-primary transition-colors">{`> `}</span>
                  {post.title}
                </h3>
                <span className="text-xs font-mono text-foreground/30 whitespace-nowrap">
                  {formatDate(post.date)}
                </span>
              </div>
              <p className="text-sm text-foreground/50 pl-4 mb-3 leading-relaxed">
                {post.summary}
              </p>
              <div className="flex items-center gap-3 pl-4 text-xs font-mono">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 border border-border text-foreground/40 group-hover:border-primary/30 group-hover:text-primary/60 transition-colors"
                  >
                    #{tag}
                  </span>
                ))}
                <span className="text-foreground/20">|</span>
                <span className="text-foreground/30">
                  {post.readTime} min read
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About preview */}
      <section className="mt-16 pt-8 border-t border-border">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-sm font-mono text-primary tracking-wider">
            {`[ about ]`}
          </h2>
          <span className="flex-1 h-[1px] bg-border" />
        </div>
        <p className="text-sm text-foreground/50 max-w-xl">
          这里是 Kyon 的技术博客，记录学习、工作和一些有趣的项目。
          <br />
          <Link href="/about" className="text-primary hover:text-glow inline-flex items-center gap-1 transition-colors mt-2">
            查看完整简介
            <span className="text-lg">→</span>
          </Link>
        </p>
      </section>
    </div>
  );
}
