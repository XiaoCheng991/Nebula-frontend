import { posts } from "./posts";
import { getDocsList } from "./docs";

export interface ArticleRef {
  key: string;
  href: string;
  title: string;
  summary?: string;
  date: string;
  tags: string[];
  type: "post" | "doc";
}

function buildArticleRefs(): ArticleRef[] {
  const postRefs: ArticleRef[] = posts.map((post) => ({
    key: `post:${post.slug}`,
    href: `/blog/${post.slug}`,
    title: post.title,
    summary: post.summary,
    date: post.date,
    tags: post.tags,
    type: "post",
  }));

  const docRefs: ArticleRef[] = getDocsList()
    .map((doc) => ({
      key: `doc:${doc.urlSlug}`,
      href: `/blog/docs/${doc.urlSlug}`,
      title: doc.title,
      summary: doc.summary,
      date: doc.date,
      tags: doc.tags,
      type: "doc",
    }));

  return [...postRefs, ...docRefs];
}

function parseDate(date: string): number | null {
  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  const timestamp = Date.parse(`${date}T00:00:00Z`);
  return Number.isFinite(timestamp) ? timestamp : null;
}

function sharedTagCount(tags: string[], currentTags: string[]): number {
  const current = new Set(currentTags);
  return tags.reduce((count, tag) => (current.has(tag) ? count + 1 : count), 0);
}

export function getPrevNextArticle(current: ArticleRef): { prev?: ArticleRef; next?: ArticleRef } {
  const articles = buildArticleRefs();
  const dated = articles
    .filter((article) => parseDate(article.date) !== null)
    .sort((a, b) => (parseDate(a.date) ?? 0) - (parseDate(b.date) ?? 0));

  const index = dated.findIndex((article) => article.key === current.key);
  if (index === -1) {
    return { prev: dated.length > 0 ? dated[dated.length - 1] : undefined, next: dated.length > 0 ? dated[0] : undefined };
  }

  return {
    prev: index > 0 ? dated[index - 1] : undefined,
    next: index < dated.length - 1 ? dated[index + 1] : undefined,
  };
}

export function getRelatedArticles(current: ArticleRef, limit = 3): ArticleRef[] {
  const articles = buildArticleRefs().filter((article) => article.key !== current.key);

  return articles
    .map((article) => {
      const tagScore = sharedTagCount(article.tags, current.tags) * 100;
      const dateScore = parseDate(article.date) !== null ? 10 : 0;
      return { article, score: tagScore + dateScore };
    })
    .sort((a, b) => b.score - a.score || a.article.title.localeCompare(b.article.title))
    .slice(0, limit)
    .map((item) => item.article);
}
