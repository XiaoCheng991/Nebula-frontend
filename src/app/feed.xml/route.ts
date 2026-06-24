import { headers } from "next/headers";
import { posts } from "@/lib/posts";
import { getDocsList } from "@/lib/docs";

export const dynamic = "force-dynamic";

interface FeedItem {
  title: string;
  description: string;
  link: string;
  pubDate: string;
  guid: string;
  categories: string[];
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&")
    .replace(/</g, "<")
    .replace(/>/g, ">")
    .replace(/"/g, "&#34;")
    .replace(/'/g, "&apos;");
}

function toRfc822(dateStr: string): string {
  if (!dateStr) return new Date(0).toUTCString();
  const d = new Date(dateStr + "T00:00:00Z");
  return isNaN(d.getTime()) ? new Date(0).toUTCString() : d.toUTCString();
}

function buildItems(baseUrl: string): FeedItem[] {
  const docItems: FeedItem[] = getDocsList().map((doc) => ({
    title: doc.title,
    description: doc.summary,
    link: `${baseUrl}/blog/docs/${doc.urlSlug}`,
    pubDate: toRfc822(doc.date),
    guid: `${baseUrl}/blog/docs/${doc.urlSlug}`,
    categories: doc.tags,
  }));

  const postItems: FeedItem[] = posts.map((p) => ({
    title: p.title,
    description: p.summary,
    link: `${baseUrl}/blog/${p.slug}`,
    pubDate: toRfc822(p.date),
    guid: `${baseUrl}/blog/${p.slug}`,
    categories: p.tags,
  }));

  return [...docItems, ...postItems].sort((a, b) =>
    a.pubDate < b.pubDate ? 1 : a.pubDate > b.pubDate ? -1 : 0,
  );
}

function renderXml(title: string, description: string, baseUrl: string, items: FeedItem[]): string {
  const lastBuild = items[0]?.pubDate ?? new Date().toUTCString();
  const itemXml = items.map((it) => "<item>\n" +
    "    <title>" + escapeXml(it.title) + "</title>\n" +
    "    <link>" + escapeXml(it.link) + "\n" +
    "    <guid isPermaLink=\"true\">" + escapeXml(it.guid) + "</guid>\n" +
    "    <description>" + escapeXml(it.description) + "</description>\n" +
    "    <pubDate>" + it.pubDate + "</pubDate>" +
    it.categories.map((c) => "\n    <category>" + escapeXml(c) + "</category>").join("") +
    "\n  </item>"
  ).join("\n");

  return "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n" +
    "<rss version=\"2.0\" xmlns:atom=\"http://www.w3.org/2005/Atom\">\n" +
    "  <channel>\n" +
    "    <title>" + escapeXml(title) + "</title>\n" +
    "    <link>" + escapeXml(baseUrl) + "</link>\n" +
    "    <atom:link href=\"" + escapeXml(baseUrl + "/feed.xml") + "\" rel=\"self\" type=\"application/rss+xml\"/>\n" +
    "    <description>" + escapeXml(description) + "</description>\n" +
    "    <language>zh-CN</language>\n" +
    "    <lastBuildDate>" + lastBuild + "</lastBuildDate>\n" +
    "    <generator>NebulaHub</generator>\n" +
    (items.length ? "    " + itemXml.replace(/\n/g, "\n    ") + "\n" : "") +
    "  </channel>\n" +
    "</rss>";
}

export async function GET() {
  const h = headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${proto}://${host}`;

  const items = buildItems(baseUrl);
  const xml = renderXml(
    "Kyon // blog",
    "代码、想法与技术笔记",
    baseUrl,
    items,
  );

  return new Response(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}
