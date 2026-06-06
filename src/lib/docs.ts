import * as fs from "fs";
import * as path from "path";

const DOCS_DIR = path.join(process.cwd(), "public", "docs");

export interface DocFile {
  slug: string;
  filename: string;
  title: string;
  summary: string;
  tags: string[];
  readTime: number;
  date: string;
  order: number;
}

/**
 * Parse frontmatter: supports --- delimited or bare key-value at top.
 * Handles time: 2026/06/06, date: 2026-06-06, etc.
 */
function parseFrontmatter(content: string): Record<string, any> {
  let fmBlock: string | null = null;

  const withDelimiter = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (withDelimiter) {
    fmBlock = withDelimiter[1];
  } else {
    const lines = content.split("\n");
    const blockLines: string[] = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) break;
      if (trimmed.startsWith("#")) break;
      const colonIdx = trimmed.indexOf(":");
      if (colonIdx === -1) break;
      blockLines.push(line);
    }
    if (blockLines.length > 0) {
      fmBlock = blockLines.join("\n");
    }
  }

  if (!fmBlock) return {};

  const result: Record<string, any> = {};

  for (const line of fmBlock.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    // Parse arrays: [a, b, c] — supports both English comma and Chinese dunhao
    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(/[,、\s]+/)
        .map((s) => s.trim().replace(/['"]/g, ""))
        .filter(Boolean);
    }
    // Parse numbers
    else if (/^\d+$/.test(value)) {
      result[key] = parseInt(value, 10);
    }
    // Parse booleans
    else if (value === "true") {
      result[key] = true;
    } else if (value === "false") {
      result[key] = false;
    }
    // Parse quoted strings
    else if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      result[key] = value.slice(1, -1);
    }
    // Plain string
    else {
      result[key] = value;
    }
  }

  return result;
}

function extractTitle(content: string, frontmatter: Record<string, any>): string {
  if (frontmatter.title) return String(frontmatter.title);
  const match = content.match(/^#\s+(.+)$/m);
  return match ? match[1].trim() : "Untitled";
}

function extractSummary(content: string, title: string): string {
  const withoutFm = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  const lines = withoutFm.split("\n");
  let started = false;
  const parts: string[] = [];

  for (const line of lines) {
    if (line.startsWith("# ")) {
      if (started) break;
      started = true;
      continue;
    }
    if (started && line.trim() && !line.startsWith("#") && !line.startsWith(">") && !line.startsWith("![[")) {
      const text = line
        .replace(/!\[([^\]]*)\]\([^)]+\)/g, "")
        .replace(/\[([^\]]*)\]\([^)]+\)/g, "$1")
        .replace(/\*\*/g, "")
        .replace(/[`{}_*#]/g, "")
        .trim();
      if (text) parts.push(text);
      if (parts.length >= 3) break;
    }
  }

  const summary = parts.join(" ").trim();
  return summary.length > 30 ? summary.slice(0, 30) + "…" : (summary || title);
}

/**
 * Normalize date string: accepts 2026/06/06, 2026-06-06, 2026.06.06 etc.
 * Returns ISO string for formatting.
 */
function normalizeDate(raw: string): string {
  if (!raw) return "";
  raw = raw.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(raw)) return raw;
  // 2026/06/06 or 2026.06.06
  const parts = raw.split(/[\.\//]+/);
  if (parts.length >= 3 && /^\d{4}$/.test(parts[0]) && /^\d{1,2}$/.test(parts[1]) && /^\d{1,2}$/.test(parts[2])) {
    return `${parts[0]}-${parts[1].padStart(2, "0")}-${parts[2].padStart(2, "0")}`;
  }
  return "";
}

export function getDocsList(): DocFile[] {
  if (!fs.existsSync(DOCS_DIR)) return [];

  const files = fs.readdirSync(DOCS_DIR).filter((f) => f.endsWith(".md"));

  return files.map((filename, index) => {
    const filePath = path.join(DOCS_DIR, filename);
    const content = fs.readFileSync(filePath, "utf-8");
    const slug = filename.replace(/\.md$/, "");
    const fm = parseFrontmatter(content);
    const title = extractTitle(content, fm);
    const summary = extractSummary(content, title);
    const tags = Array.isArray(fm.tags) ? fm.tags.map(String) : [];
    const readTime = typeof fm.readTime === "number" ? fm.readTime : 0;
    // Accept time:, date:, published: keys
    const rawDate = fm.time || fm.date || fm.published || "";
    const date = normalizeDate(String(rawDate));

    return { slug, filename, title, summary, tags, readTime, date, order: index };
  });
}

/**
 * Get raw markdown content (with frontmatter stripped for rendering).
 */
export function getDocContent(slug: string): string | null {
  const decoded = decodeURIComponent(slug);
  const filePath = path.join(DOCS_DIR, `${decoded}.md`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");

  // Strip frontmatter: try --- delimited first, then fallback (key: value at top)
  let stripped = content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
  if (stripped === content) {
    const lines = content.split("\n");
    let startIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) break;
      if (trimmed.startsWith("#")) break;
      const ci = trimmed.indexOf(":");
      if (ci === -1) break;
      const key = trimmed.slice(0, ci).trim().toLowerCase();
      if (["title", "tags", "readtime", "time", "date", "published"].includes(key)) {
        startIdx = i + 1;
      } else {
        break;
      }
    }
    stripped = lines.slice(startIdx).join("\n");
  }

  // Remove first-level heading (# title) — page title already shows it
  stripped = stripped.trimStart();
  const firstLine = stripped.split('\n')[0];
  if (firstLine && /^#\s+.+$/.test(firstLine)) {
    stripped = stripped.slice(firstLine.length).replace(/^(\r?\n)/, '');
  }

  // Normalize image paths: ../img/ → /img/
  stripped = stripped.replace(/!\[([^\]]*)\]\(\.\.\/img\//g, '![$1](/img/');

  return stripped;
}

export function getDocMeta(slug: string): DocFile | null {
  const decoded = decodeURIComponent(slug);
  const list = getDocsList();
  return list.find((d) => d.slug === decoded) || null;
}
