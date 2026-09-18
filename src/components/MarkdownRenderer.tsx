import "server-only";
import { createHash } from "node:crypto";
import MarkdownIt from "markdown-it";
import CopyCodeButton from "./CopyCodeButton";
import hljs from "highlight.js/lib/common";

export interface TocItem {
  id: string;
  title: string;
  level: number;
}

function slugifyHeading(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^\p{Letter}\p{Number}]+/gu, "-")
    .replace(/^-+|-+$/g, "") || "section";
}

interface MarkdownRendererProps {
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Pre-process: fix Feishu export escaping (outside math mode)       */
/* ------------------------------------------------------------------ */

function preprocessMarkdown(md: string): string {
  const lines = md.split("\n");
  const offsets = [0];
  for (const line of lines) offsets.push(offsets[offsets.length - 1] + line.length + 1);
  const codeRanges = new Map(new MarkdownIt().parse(md, {})
    .filter((token) => (token.type === "fence" || token.type === "code_block") && token.map)
    .map((token) => [offsets[token.map![0]], Math.min(md.length, offsets[token.map![1]])]));
  let result = "";
  let inMath = false;
  let i = 0;

  while (i < md.length) {
    const codeEnd = codeRanges.get(i);
    if (codeEnd !== undefined) {
      result += md.slice(i, codeEnd);
      i = codeEnd;
      continue;
    }
    const ch = md[i];
    if (ch === "$" && (i === 0 || md[i - 1] !== "\\")) {
      inMath = !inMath;
      result += ch;
      i++;
      continue;
    }
    if (inMath) { result += ch; i++; continue; }
    if (ch === "\\" && i + 1 < md.length) {
      const next = md[i + 1];
      if (next === "." || next === "(" || next === ")" || next === "[" || next === "]") {
        result += next; i += 2; continue;
      }
    }
    result += ch;
    i++;
  }
  return result;
}

/* ------------------------------------------------------------------ */
/*  Wrap headings into <details> (open by default, no collapse)       */
/* ------------------------------------------------------------------ */

function wrapSections(md: string): string {
  const parser = new MarkdownIt({ html: true });
  const headingLines = new Set(parser.parse(md, {})
    .filter((token) => token.type === "heading_open" && token.map)
    .map((token) => token.map![0]));
  const lines = md.split("\n");
  const out: string[] = [];
  const stack: { level: number }[] = [];
  const usedIds = new Set<string>();

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (m && headingLines.has(i)) {
      const level = m[1].length;
      const title = m[2].trim();

      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        stack.pop();
        out.push("</details>");
      }

      const plainTitle = title
        .replace(/!\[([^\]]*)]\([^)]+\)/g, "$1")
        .replace(/\[([^\]]*)]\([^)]+\)/g, "$1")
        .replace(/[`*_~]/g, "")
        .replace(/<[^>]+>/g, "")
        .trim() || `Heading ${usedIds.size + 1}`;
      let id = slugifyHeading(plainTitle);
      let suffix = 2;
      while (usedIds.has(id)) {
        id = `${slugifyHeading(plainTitle)}-${suffix++}`;
      }
      usedIds.add(id);
      out.push(`<details open data-level="${level}">`);
      out.push(`<summary data-level="${level}" id="${id}"><a class="heading-anchor" href="#${id}" aria-label="跳转到 ${parser.utils.escapeHtml(plainTitle)}">${parser.renderInline(title)}</a></summary>`);
      stack.push({ level });
    } else {
      out.push(line);
    }
  }

  while (stack.length > 0) {
    stack.pop();
    out.push("</details>");
  }

  return out.join("\n");
}

export function getTableOfContents(content: string): TocItem[] {
  const wrapped = wrapSections(preprocessMarkdown(content));
  return [...wrapped.matchAll(/<summary data-level="(\d)" id="([^"]+)">/g)]
    .map((match) => ({
      level: Number(match[1]),
      id: match[2],
      title: wrapped.slice(match.index + match[0].length, wrapped.indexOf("</summary>", match.index))
        .replace(/<[^>]+>/g, "")
        .trim(),
    }))
    .filter((item) => item.level >= 2 && item.level <= 4);
}

/* ------------------------------------------------------------------ */
/*  CSS                                                                */
/* ------------------------------------------------------------------ */

const CSS_ID = "md-render-details";

const cssContent = `
.md-render { line-height: 1.7; color: hsl(var(--foreground) / 0.85); }

/* Details (always open) */
.md-render details { margin: 2rem 0 1.5rem 0; }
.md-render details > summary {
  cursor: default; list-style: none; user-select: none;
  color: hsl(var(--foreground)); font-weight: 600; padding: 0;
  pointer-events: none;
}
.md-render summary .heading-anchor {
  pointer-events: auto;
  color: inherit;
  text-decoration: none;
}
.md-render summary .heading-anchor::after {
  content: "#";
  margin-left: 0.5rem;
  color: hsl(var(--primary) / 0);
  font-size: 0.7em;
  vertical-align: middle;
  transition: color 0.2s ease;
}
.md-render summary .heading-anchor:hover::after,
.md-render summary .heading-anchor:focus-visible::after {
  color: hsl(var(--primary) / 0.8);
}
.md-render details > summary,
.md-render [id] {
  scroll-margin-top: 5rem;
}
.md-render details > summary::-webkit-details-marker,
.md-render details > summary::marker { display: none; content: none; }
.md-render details > :not(summary) { margin-left: 0; }
.md-render details details { margin: 1.25rem 0 1rem 0; }

/* Heading sizes — distinct from body text (body is ~0.95rem) */
.md-render details > summary[data-level="1"] { font-size: 2.5rem;  line-height: 1.15; letter-spacing: -0.02em; margin: 0 0 1.75rem 0; }
.md-render details > summary[data-level="2"] { font-size: 1.85rem; line-height: 1.2;  margin: 2rem 0 1rem 0; }
.md-render details > summary[data-level="3"] { font-size: 1.45rem; line-height: 1.25; margin: 1.5rem 0 0.75rem 0; }
.md-render details > summary[data-level="4"] { font-size: 1.15rem; line-height: 1.3;  margin: 1.25rem 0 0.6rem 0; }
.md-render details > summary[data-level="5"] { font-size: 1.05rem; line-height: 1.35; margin: 1rem 0 0.5rem 0; }
.md-render details > summary[data-level="6"] { font-size: 1rem;    line-height: 1.4;   margin: 0.85rem 0 0.4rem 0; }

/* Paragraphs */
.md-render p { margin: 1.25rem 0; line-height: 1.9; }

/* Blockquote — tight padding */
.md-render blockquote {
  border-left: 2px solid hsl(var(--secondary) / 0.5);
  padding: 0.25rem 0.75rem;
  margin: 1.25rem 0;
  color: hsl(var(--foreground) / 0.6);
  font-style: italic;
}
.md-render blockquote p { margin: 0.2rem 0; }

/* Lists */
.md-render ul { list-style: disc; padding-left: 1.75rem; margin: 1.25rem 0; }
.md-render ol { list-style: decimal; padding-left: 1.75rem; margin: 1.25rem 0; }
.md-render li { font-size: 0.925rem; line-height: 1.8; margin: 0.25rem 0; }

/* Images */
.md-render img {
  display: block;
  margin: 1.75rem auto;
  max-width: 100%;
  height: auto;
  border-radius: 6px;
  max-height: 65vh;
  animation: img-reveal 0.6s ease-out both;
}
@keyframes img-reveal {
  from { opacity: 0; filter: blur(8px); }
  to   { opacity: 1; filter: blur(0); }
}

/* Inline code */
.md-render :not(pre) > code {
  background: hsl(var(--muted) / 0.9);
  border-radius: 4px;
  padding: 0.2rem 0.55rem;
  margin-inline: 0.12em;
  box-decoration-break: clone;
  -webkit-box-decoration-break: clone;
  font-size: 0.8rem; font-family: 'Space Mono', 'Fira Code', monospace;
  color: hsl(var(--secondary));
}

/* Code blocks — wrap long lines, no horizontal overflow */
.md-render pre {
  position: relative;
  background: hsl(var(--muted) / 0.6);
  border: 1px solid hsl(var(--border));
  padding: 2.75rem 1.25rem 1rem;
  margin: 1.25rem 0;
  overflow-x: auto;
  font-family: 'Space Mono', 'Fira Code', 'Courier New', monospace;
  font-size: 0.82rem;
  line-height: 1.65;
  color: hsl(var(--foreground) / 0.85);
  border-radius: 4px;
}
.md-render pre code {
  background: transparent;
  padding: 0;
  color: inherit;
  font-size: inherit;
  white-space: pre-wrap;
  word-break: break-word;
  overflow-wrap: anywhere;
}

.md-render pre[data-language]::before {
  content: attr(data-language);
  position: absolute;
  top: 0.55rem;
  left: 1.25rem;
  color: hsl(var(--foreground) / 0.3);
  font-size: 0.7rem;
  pointer-events: none;
}

.md-render .code-copy-button {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  padding: 0.15rem 0.45rem;
  font-family: inherit;
  font-size: 12px;
  color: hsl(var(--foreground) / 0.55);
  border: 1px solid hsl(var(--border));
  background: hsl(var(--background) / 0.9);
  opacity: 1;
  transition: color 0.2s, border-color 0.2s, opacity 0.2s;
}

.md-render pre:hover .code-copy-button,
.md-render .code-copy-button:focus-visible {
  opacity: 1;
}

.md-render .code-copy-button:hover,
.md-render .code-copy-button:focus-visible {
  color: hsl(var(--primary));
  border-color: hsl(var(--primary) / 0.6);
}

.md-render .hljs-comment,
.md-render .hljs-quote { color: hsl(var(--foreground) / 0.4); font-style: italic; }
.md-render .hljs-keyword,
.md-render .hljs-selector-tag,
.md-render .hljs-literal { color: hsl(var(--secondary)); }
.md-render .hljs-string,
.md-render .hljs-attr,
.md-render .hljs-selector-attr { color: hsl(var(--primary)); }
.md-render .hljs-title,
.md-render .hljs-name,
.md-render .hljs-built_in { color: hsl(var(--accent)); }

/* Links */
.md-render a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
.md-render a:hover { text-shadow: 0 0 8px hsl(var(--primary) / 0.3); }

/* Strong / Em */
.md-render strong { color: hsl(var(--primary)); font-weight: 600; }
.md-render em { color: hsl(var(--foreground) / 0.8); }

/* HR */
.md-render hr { border-color: hsl(var(--border)); margin: 3rem 0; }
`;

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const md = preprocessMarkdown(content);
  const wrapped = wrapSections(md);
  const renderer = new MarkdownIt({
    html: true,
    linkify: true,
    breaks: false,
  });
  renderer.renderer.rules.fence = (tokens, index) => {
    const token = tokens[index];
    const language = (token.info || "").trim().split(/\s+/)[0] || "text";
    const highlighted = language !== "text" && hljs.getLanguage(language)
      ? hljs.highlight(token.content, { language }).value
      : renderer.utils.escapeHtml(token.content);
    const label = renderer.utils.escapeHtml(language);
    return `<pre data-language="${label}"><code class="language-${label}">${highlighted}</code><button type="button" class="code-copy-button" aria-live="polite">复制代码</button></pre>\n`;
  };
  const html = renderer.render(wrapped);
  const htmlWithLazy = html.replace(/<img([^>]*)>/gi, (_match, attrs) =>
    attrs.includes('loading=') ? `<img${attrs}>` : `<img${attrs} loading="lazy">`
  );

  return (
    <div className="md-render relative">
      <style id={CSS_ID} dangerouslySetInnerHTML={{ __html: cssContent }} />
      <div dangerouslySetInnerHTML={{ __html: htmlWithLazy }} />
      <CopyCodeButton revision={createHash("sha256").update(content).digest("hex")} />
    </div>
  );
}
