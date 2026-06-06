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
  order: number;
}

/**
 * Parse YAML frontmatter from markdown content.
 * Supports:
 *   ---
 *   title: My Title
 *   tags: [tag1, tag2]
 *   tags:
 *     - tag1
 *     - tag2
 *   readTime: 15
 *   ---
 */
function parseFrontmatter(content: string): Record<string, any> {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const yaml = match[1];
  const result: Record<string, any> = {};

  for (const line of yaml.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    // Array syntax: "- item"
    if (trimmed.startsWith("- ")) {
      const key = Object.keys(result).length > 0 ? null : null;
      // Skip top-level arrays for now
      continue;
    }

    const colonIdx = trimmed.indexOf(":");
    if (colonIdx === -1) continue;

    const key = trimmed.slice(0, colonIdx).trim();
    const value = trimmed.slice(colonIdx + 1).trim();

    // Parse arrays: [a, b, c]
    if (value.startsWith("[") && value.endsWith("]")) {
      result[key] = value
        .slice(1, -1)
        .split(",")
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
  // Remove frontmatter from content for summary extraction
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
    if (started && line.trim() && !line.startsWith("#") && !line.startsWith(">")) {
      parts.push(line.replace(/\*\*/g, "").replace(/[\[\]{}]/g, "").trim());
      if (parts.length >= 3) break;
    }
  }

  const summary = parts.join(" ").trim();
  return summary.length > 120 ? summary.slice(0, 120) + "…" : (summary || title);
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

    return { slug, filename, title, summary, tags, readTime, order: index };
  });
}

/**
 * Get raw markdown content (with frontmatter stripped for rendering).
 */
export function getDocContent(slug: string): string | null {
  const filePath = path.join(DOCS_DIR, `${slug}.md`);
  if (!fs.existsSync(filePath)) return null;
  const content = fs.readFileSync(filePath, "utf-8");
  // Strip frontmatter for rendering
  return content.replace(/^---\s*\n[\s\S]*?\n---\s*\n/, "");
}

export function getDocMeta(slug: string): DocFile | null {
  const list = getDocsList();
  return list.find((d) => d.slug === slug) || null;
}
