import Link from "next/link";
import Image from "next/image";
import { posts } from "@/lib/posts";
import { getDocsList, getDocContent } from "@/lib/docs";
import BlogClient from "@/components/blog-client";
import { getAllTags } from "@/lib/tags";
import SearchTrigger from "@/components/SearchTrigger";
import ThemeToggle from "@/components/ThemeToggle";
import {
  IconBrandGithub,
  IconBrandBilibili,
  IconMail,
  IconRss,
} from "@tabler/icons-react";

function countWords(content: string): number {
  return content.replace(/\s/g, "").length;
}

// Tabler-style inline SVG icons (16x16 viewBox)
function IconHome() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 9.5L12 3L21 9.5" />
      <path d="M5 11V19H9M15 11V19H19V11" />
    </svg>
  );
}
function IconUser() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="8" r="3" />
      <path d="M4 21V14a4 4 0 018 0v7M20 21V14a4 4 0 00-3-3.87" />
    </svg>
  );
}
function IconTool() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14.752 18.35C14.41 18.73 14 19.06 14 19.5a2.5 2.5 0 005 0c0-.44-.33-.77-.65-1.15A5.5 5.5 0 0014.752 18.35z" />
      <path d="M14.752 18.35l-4.976-4.976a3.5 3.5 0 010-4.95l1.8-1.8a2.5 2.5 0 003.5 0l2.5-2.5a1.5 1.5 0 00-2.12-2.12l-2.5 2.5a3.5 3.5 0 000 4.95z" />
    </svg>
  );
}
function IconFile() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2L14 8H20" />
      <path d="M8 13h8" />
      <path d="M8 17h8" />
    </svg>
  );
}
function IconSearch() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="11" cy="11" r="6" />
      <path d="M21 21L15 15" />
    </svg>
  );
}
function IconMoon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12.79A9 9 0 0111.21 3 9 9 0 0021 12.79z" />
    </svg>
  );
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; size?: string }>;
}) {
  const { page, size } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || "1", 10) || 1);
  const pageSize = [10, 20, 50].includes(parseInt(size || "10", 10))
    ? parseInt(size || "10", 10)
    : 10;

  const docs = getDocsList();

  const docItems = docs.map((doc) => ({
    slug: `docs/${doc.slug}`,
    title: doc.title,
    summary: doc.summary,
    date: doc.date,
    tags: doc.tags.length > 0 ? doc.tags : ["笔记"],
    readTime: doc.readTime || 0,
    isDoc: true,
    href: `/blog/docs/${doc.urlSlug}`,
    cover: doc.cover,
    wordCount: countWords(getDocContent(doc.urlSlug) || ""),
  }));

  const postItems = posts.map((p) => ({
    slug: p.slug,
    title: p.title,
    summary: p.summary,
    date: p.date,
    tags: p.tags,
    readTime: p.readTime,
    isDoc: false,
    href: `/blog/${p.slug}`,
    cover: p.cover,
    wordCount: countWords(p.content),
  }));

  const allItems = [...docItems, ...postItems].sort((a, b) => {
    if (!a.date && !b.date) return 0;
    if (!a.date) return 1;
    if (!b.date) return -1;
    return b.date.localeCompare(a.date);
  });

  const totalCount = allItems.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageItems = allItems.slice(startIdx, startIdx + pageSize);

  // Light-theme sidebar data
  const sidebarTags = getAllTags();
  const yearCounts: Record<string, number> = {};
  for (const p of posts) {
    if (p.date) {
      const year = p.date.substring(0, 4);
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  }
  for (const doc of docs) {
    if (doc.date) {
      const year = doc.date.substring(0, 4);
      yearCounts[year] = (yearCounts[year] || 0) + 1;
    }
  }
  const archives = Object.entries(yearCounts).sort(([a], [b]) =>
    b.localeCompare(a)
  );

  return (
    <div className="max-w-4xl px-5 py-10 home-container">
      {/* Light-theme sidebar: avatar + nav */}
      <aside className="sl sidebar-light">
        <div className="flex flex-col gap-3">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-full overflow-hidden border border-border/60">
            <Image src="/avatar/XiaoCheng991.jpeg" alt="avatar"
                   width={96} height={96} className="w-full h-full object-cover" />
          </div>

          {/* Name + tagline */}
          <div className="flex flex-col gap-1">
            <span className="text-xl font-bold text-foreground">Halcyon</span>
            <span className="text-sm text-foreground/50">谁还记得？</span>
          </div>

          {/* Social icons (bare, no glass box) */}
          <div className="flex gap-4 text-foreground/60">
            <a href="https://github.com/XiaoCheng991" target="_blank" rel="noreferrer" aria-label="GitHub"
               className="hover:text-primary transition-colors"><IconBrandGithub size={20} /></a>
            <a href="https://space.bilibili.com/3546566354798756" target="_blank" rel="noreferrer" aria-label="Bilibili"
               className="hover:text-primary transition-colors"><IconBrandBilibili size={20} /></a>
            <a href="mailto:kyon991@proton.me" aria-label="Email"
               className="hover:text-primary transition-colors"><IconMail size={20} /></a>
            <a href="/feed.xml" aria-label="RSS"
               className="hover:text-primary transition-colors"><IconRss size={20} /></a>
          </div>

          {/* Nav items — English, flex column, left-aligned */}
          <nav className="flex flex-col gap-3 w-full">
            <Link href="/" className="nav-item-light flex items-center gap-2 text-base font-medium"><IconHome />Home</Link>
            <Link href="/about" className="nav-item-light flex items-center gap-2 text-base font-medium"><IconUser />About</Link>
            <Link href="/about" className="nav-item-light flex items-center gap-2 text-base font-medium"><IconTool />Projects</Link>
            <Link href="/about" className="nav-item-light flex items-center gap-2 text-base font-medium"><IconFile />Plans</Link>
            <div className="nav-item-light flex items-center gap-2 text-base font-medium cursor-pointer"><IconSearch />Search</div>
            <div className="nav-item-light flex items-center gap-2 text-base font-medium">
              <IconMoon />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content: Hero + Posts */}
      <div className="min-w-0 flex-1">
        {/* Hero — dark: code/h1/comment  |  light: badge */}
        <section className="mb-12 pt-4">
          {/* Dark theme: terminal-style hero (完全隐藏在浅色) */}
          <div className="sd">
            <div className="flex items-center gap-2 text-xs font-mono text-primary/60 mb-4">
              <span>{`// system.init()`}</span>
              <span className="cursor-blink" />
            </div>
            <h1 className="text-4xl font-bold mb-3 text-foreground leading-tight">
              <span className="text-primary">Kyon</span>
              <span className="text-secondary"> Blog</span>
            </h1>
            <p className="text-foreground/50 font-mono text-sm max-w-xl">
              {`谁还记得`}
            </p>
          </div>
          {/* Light theme: status badge only */}
          <div className="sl">
            <div className="hero-badge">
              <span className="hero-badge-dot" />
              <span>v3.0 · 正在写作</span>
            </div>
          </div>
        </section>

        {/* Posts + Docs */}
        <section>
          <div className="section-header">
            <div className="sd flex items-center gap-3">
              <h2 className="text-sm font-mono text-primary tracking-wider">
                {`[ posts ]`}
              </h2>
              <span className="flex-1 h-[1px] bg-border" />
              <span className="text-xs font-mono text-foreground/30">
                {totalCount} entries
              </span>
            </div>
            <div className="sl flex items-center gap-3 mb-6">
              <h2 className="section-count-light text-base font-medium text-foreground">
                所有文章
              </h2>
              <span className="section-count-light text-base font-medium text-foreground/50">
                {totalCount} 篇
              </span>
            </div>
          </div>

          <BlogClient
            items={pageItems}
            totalCount={totalCount}
            currentPage={safePage}
            totalPages={totalPages}
            pageSize={pageSize}
          />
        </section>
      </div>

      {/* Right sidebar: search + categories + archives */}
      <aside className="sl sidebar-right">
        <div className="flex flex-col gap-4">
          {/* Search */}
          <div className="sidebar-card">
            <SearchTrigger />
          </div>

          {/* Categories */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">分类</div>
            <div className="sidebar-card-list">
              {sidebarTags.map((t) => (
                <Link key={t.name} href={`/tags`} className="sidebar-card-item">
                  <span>{t.name}</span>
                  <span className="sidebar-card-count">{t.count}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Archives */}
          <div className="sidebar-card">
            <div className="sidebar-card-title">归档</div>
            <div className="sidebar-card-list">
              {archives.map(([year, count]) => (
                <div key={year} className="sidebar-card-item">
                  <span>{year}</span>
                  <span className="sidebar-card-count">{count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
