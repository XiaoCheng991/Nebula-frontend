"use client";

import MarkdownIt from "markdown-it";
import { useMemo } from "react";

interface MarkdownRendererProps {
  content: string;
}

/* ------------------------------------------------------------------ */
/*  Pre-process: fix Feishu export escaping (outside math mode)       */
/* ------------------------------------------------------------------ */

function preprocessMarkdown(md: string): string {
  let result = "";
  let inMath = false;
  let i = 0;

  while (i < md.length) {
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
/*  Wrap headings into <details>/<summary>                            */
/* ------------------------------------------------------------------ */

function wrapSections(md: string): string {
  const lines = md.split("\n");
  const out: string[] = [];
  const stack: { level: number; id: string }[] = [];
  let headingIdx = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const m = line.match(/^(#{1,6})\s+(.+)$/);
    if (m) {
      const level = m[1].length;
      const title = m[2].trim();

      // Close any open details with level >= current level
      while (stack.length > 0 && stack[stack.length - 1].level >= level) {
        const closed = stack.pop()!;
        out.push(`</details>`);
      }

      // If there's a previous open details at a higher level, close it too
      // (not needed — we close >= level)

      // Open new details
      headingIdx++;
      const id = `h${headingIdx}`;
      out.push(`<details open id="${id}" data-level="${level}">`);
      out.push(`<summary>${title}</summary>`);
      stack.push({ level, id });
    } else {
      out.push(line);
    }
  }

  // Close all remaining
  while (stack.length > 0) {
    stack.pop();
    out.push(`</details>`);
  }

  return out.join("\n");
}

/* ------------------------------------------------------------------ */
/*  CSS                                                                    */
/* ------------------------------------------------------------------ */

const CSS_ID = "md-render-details";

const cssContent = `
.md-render { line-height: 1.7; color: hsl(var(--foreground) / 0.85); }
.md-render details { margin: 0.5rem 0; }
.md-render details > summary {
  cursor: pointer; list-style: none; user-select: none;
  color: hsl(var(--foreground)); font-weight: 600; padding: 0.3rem 0;
  font-size: inherit;
}
.md-render details > summary::-webkit-details-marker,
.md-render details > summary::marker { display: none; content: none; }
.md-render details > summary:hover { color: hsl(var(--primary)); }
.md-render details > :not(summary) { margin-left: 1rem; }
.md-render details > :not(summary):first-of-type { margin-top: 0.25rem; }
.md-render details details { margin-left: 0.5rem; }

/* First-level headings */
.md-render > details > summary { font-size: 1.15rem; }
.md-render > details > details > summary { font-size: 1rem; }
.md-render > details > details > details > summary { font-size: 0.95rem; }

/* Blockquote */
.md-render blockquote {
  border-left: 2px solid hsl(var(--secondary) / 0.5);
  padding: 0.5rem 1rem; margin: 0.75rem 0;
  color: hsl(var(--foreground) / 0.6); font-style: italic;
}
.md-render blockquote p { margin: 0.2rem 0; }

/* Lists */
.md-render ul { list-style: disc; padding-left: 1.5rem; margin: 0.5rem 0; }
.md-render ol { list-style: decimal; padding-left: 1.5rem; margin: 0.5rem 0; }
.md-render li { font-size: 0.875rem; line-height: 1.7; margin: 0.15rem 0; }

/* Inline code */
.md-render code {
  background: hsl(var(--muted)); padding: 0.15rem 0.4rem;
  font-size: 0.8rem; font-family: 'Space Mono', 'Fira Code', monospace;
  color: hsl(var(--secondary));
}

/* Links */
.md-render a { color: hsl(var(--primary)); text-decoration: underline; text-underline-offset: 2px; }
.md-render a:hover { text-shadow: 0 0 8px hsl(var(--primary) / 0.3); }

/* Strong / Em */
.md-render strong { color: hsl(var(--primary)); font-weight: 600; }
.md-render em { color: hsl(var(--foreground) / 0.8); }

/* HR */
.md-render hr { border-color: hsl(var(--border)); margin: 1.5rem 0; }
`;

function injectStyle() {
  if (typeof document === "undefined") return;
  if (document.getElementById(CSS_ID)) return;
  const el = document.createElement("style");
  el.id = CSS_ID;
  el.textContent = cssContent;
  document.head.appendChild(el);
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const html = useMemo(() => {
    const md = preprocessMarkdown(content);
    const wrapped = wrapSections(md);
    const renderer = new MarkdownIt({
      html: true,       // Allow raw HTML (our <details>/<summary>)
      linkify: true,    // Auto-link URLs
      breaks: false,
    });
    return renderer.render(wrapped);
  }, [content]);

  useMemo(() => injectStyle(), []);

  return (
    <div
      className="md-render"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
