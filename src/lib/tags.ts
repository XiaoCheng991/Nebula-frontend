import { posts } from "./posts";
import { getDocsList } from "./docs";
import type { TagStat } from "./tag-color";

export type { TagStat };

/**
 * Aggregate tag counts from both posts (static) and docs (markdown).
 * Server-only — uses fs via docs.ts.
 */
export function getAllTags(): TagStat[] {
  const counts: Record<string, number> = {};

  for (const post of posts) {
    for (const tag of post.tags || []) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }

  for (const doc of getDocsList()) {
    for (const tag of doc.tags || []) {
      counts[tag] = (counts[tag] || 0) + 1;
    }
  }

  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}
