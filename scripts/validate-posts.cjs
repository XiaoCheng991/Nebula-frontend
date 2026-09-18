const fs = require("node:fs");
const path = require("node:path");
const MarkdownIt = require("markdown-it");
const { parseFrontmatter } = require("../src/lib/article-metadata");

const root = process.cwd();
const directory = path.join(root, "public/docs");
const publicDirectory = path.join(root, "public");
const files = fs.readdirSync(directory).filter((name) => name.endsWith(".md"));
const renderer = new MarkdownIt({ html: true });
const routes = new Map();
const errors = [];

function report(filename, message) {
  errors.push(`${filename}: ${message}`);
}

function validDate(value) {
  const match = String(value).match(/^(\d{4})([-/.])(\d{1,2})\2(\d{1,2})$/);
  if (!match) return false;
  const [, year, , month, day] = match;
  const date = new Date(`${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T00:00:00Z`);
  return date.getUTCFullYear() === Number(year)
    && date.getUTCMonth() + 1 === Number(month)
    && date.getUTCDate() === Number(day)
    && (match[2] !== "-" || (month.length === 2 && day.length === 2));
}

function checkImage(filename, source) {
  if (/^https?:\/\//i.test(source)) {
    try {
      new URL(source);
    } catch {
      report(filename, `图片 URL 无效：${source}`);
    }
    return;
  }
  if (!source.startsWith("/img/") && !source.startsWith("../img/")) {
    report(filename, `图片应使用 HTTP(S) URL、/img/ 或 ../img/ 路径：${source}`);
    return;
  }
  try {
    const relative = decodeURIComponent(source.split(/[?#]/)[0].replace(/^\.\.\//, "/"));
    const target = path.resolve(publicDirectory, `.${relative}`);
    if (!target.startsWith(`${publicDirectory}${path.sep}`)
      || !fs.existsSync(target) || !fs.statSync(target).isFile()) {
      report(filename, `本地图片不存在：${source}`);
    }
  } catch {
    report(filename, `图片路径无法解析：${source}`);
  }
}

for (const filename of files) {
  const content = fs.readFileSync(path.join(directory, filename), "utf8");
  const metadata = parseFrontmatter(content);
  if (content.startsWith("---") && !/^---\s*\n[\s\S]*?\n---/.test(content)) {
    report(filename, "元数据缺少结束分隔符 ---");
  }
  if (typeof metadata.title !== "string" || !metadata.title.trim()) {
    report(filename, "title 必须是非空文本");
  }
  if (!Array.isArray(metadata.tags) || !metadata.tags.length
    || metadata.tags.some((tag) => typeof tag !== "string" || !tag.trim())) {
    report(filename, "tags 必须是非空列表，例如 [技术、随笔]");
  }
  if (!validDate(metadata.time || metadata.date || metadata.published || "")) {
    report(filename, "日期缺失或无效，使用 date: YYYY-MM-DD（兼容 time: YYYY/MM/DD）");
  }
  if (metadata.readtime !== undefined
    && (!Number.isInteger(metadata.readtime) || metadata.readtime < 0)) {
    report(filename, "readTime 必须是非负整数");
  }
  if (metadata.draft !== undefined) {
    report(filename, "不支持 draft 字段，请将草稿移到 content/drafts，public 中的文件会公开");
  }
  const slug = filename.replace(/\.md$/, "");
  const urlSlug = typeof metadata.slug === "string" && metadata.slug.trim()
    ? metadata.slug.trim() : `article-${slug}`;
  if (metadata.slug !== undefined
    && (typeof metadata.slug !== "string" || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(metadata.slug))) {
    report(filename, "slug 使用小写英文、数字和连字符，或省略以使用文件名");
  }
  for (const route of new Set([slug, urlSlug])) {
    if (routes.has(route)) report(filename, `地址 ${route} 与 ${routes.get(route)} 冲突`);
    else routes.set(route, filename);
  }
  const tokens = renderer.parse(content, {});
  const visit = (token) => {
    if (token.type === "image") checkImage(filename, token.attrGet("src") || "");
    if (token.type === "html_block" || token.type === "html_inline") {
      for (const match of token.content.matchAll(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi)) {
        checkImage(filename, match[1] ?? match[2] ?? match[3]);
      }
    }
    for (const child of token.children || []) visit(child);
  };
  tokens.forEach(visit);
}

if (errors.length) {
  console.error(`文章校验失败（${errors.length} 项）：\n${errors.map((error) => `- ${error}`).join("\n")}`);
  process.exitCode = 1;
} else {
  console.log(`文章校验通过：${files.length} 篇。外部图片未进行联网可用性检测。`);
}
