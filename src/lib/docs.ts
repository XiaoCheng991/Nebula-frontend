import * as fs from "fs";
import * as path from "path";
import { findColon, parseFrontmatter } from "./article-metadata";

const DOCS_DIR = path.join(process.cwd(), "public", "docs");

export interface DocFile {
  slug: string;
  urlSlug: string;
  filename: string;
  title: string;
  summary: string;
  tags: string[];
  readTime: number;
  date: string;
  order: number;
  cover?: string;
}


function extractTitle(content: string, fm: Record<string, any>): string {
  if (fm.title) return String(fm.title);
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

function extractSummary(content: string, title: string): string {
  let text = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  const lines = text.split("\n");
  let start = 0;
  for (let i = 0; i < lines.length; i++) {
    const t = lines[i].trim();
    if (!t || t.startsWith("#")) { start = i; break; }
    if (findColon(t) !== -1) { start = i + 1; continue; }
    start = i; break;
  }
  text = lines.slice(start).join("\n");

  const parts: string[] = [];
  for (const line of text.split("\n")) {
    if (line.startsWith("# ")) {
      if (parts.length > 0) break;
      continue;
    }
    if (line.trim() && !line.startsWith(">") && !line.startsWith("![")) {
      const cleaned = line
        .replace(/!\[([^\]]*)]\([^)]+\)/g, "")
        .replace(/\[([^\]]*)]\([^)]+\)/g, "$1")
        .replace(/\*\*/g, "")
        .replace(/[`{}_*#]/g, "")
        .trim();
      if (cleaned) parts.push(cleaned);
      if (parts.length >= 2) break;
    }
  }

  const summary = parts.join(" ").trim();
  return summary.length > 30 ? summary.slice(0, 30) + "…" : (summary || title);
}

function normalizeDate(raw: string): string {
  if (!raw) return "";
  raw = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  const p = raw.split(/[.\/]+/);
  if (p.length >= 3 && /^\d{4}$/.test(p[0])) {
    return `${p[0]}-${p[1].padStart(2, "0")}-${p[2].padStart(2, "0")}`;
  }
  return "";
}

/** Convert relative image path (../img/foo.jpg) to public URL (/img/foo.jpg) */
function resolveCoverPath(rel: string): string {
  return rel.replace(/^\.\.\//, "/");
}

export function getDocsList(): DocFile[] {
  if (!fs.existsSync(DOCS_DIR)) return [];
  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));

  return files.map((filename, index) => {
    const filePath = path.join(DOCS_DIR, filename);
    const content = fs.readFileSync(filePath, "utf-8");
    const slug = filename.replace(/\.md$/, "");
    const fm = parseFrontmatter(content);
    const urlSlug = typeof fm.slug === "string" && fm.slug.trim()
      ? fm.slug.trim()
      : `article-${slug}`;
    const title = extractTitle(content, fm);
    const summary = extractSummary(content, title);
    const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
    const readTime = fm.readtime !== undefined ? Number(fm.readtime) : 0;
    const rawDate = fm.time || fm.date || fm.published || "";
    const date = normalizeDate(String(rawDate));

    // Extract first image from Markdown content
    const imgMatch = content.match(/!\[[^\]]*]\(([^)]+)\)/);
    const cover = imgMatch ? resolveCoverPath(imgMatch[1]) : undefined;

    return { slug, urlSlug, filename, title, summary, tags, readTime, date, order: index, cover };
  });
}

export function getDocContent(slug: string): string | null {
  const list = getDocsList();
  const doc = list.find((d) => d.urlSlug === slug || d.slug === slug);
  if (!doc) return null;
  const filePath = path.join(DOCS_DIR, doc.filename);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");

  let stripped = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  if (stripped === content) {
    const lines = content.split("\n");
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      const t = lines[i].trim();
      if (!t || t.startsWith("#")) break;
      if (findColon(t) !== -1) { startIdx = i + 1; continue; }
      break;
    }
    stripped = lines.slice(startIdx).join("\n");
  }

  stripped = stripped.trimStart();
  const firstLine = stripped.split("\n")[0];
  if (firstLine && /^#.+$/.test(firstLine)) {
    stripped = stripped.slice(firstLine.length).replace(/^\r?\n/, "");
  }

  stripped = stripped.replace(/!\[([^\]]*)]\(\.\.\/img\//g, "![$1](/img/");

  return stripped;
}

export function getDocMeta(slug: string): DocFile | null {
  const list = getDocsList();
  return list.find((d) => d.urlSlug === slug || d.slug === slug) || null;
}
