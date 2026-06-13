"use client";

import { useRouter } from "next/navigation";
import type { TagStat } from "@/lib/tag-color";

/**
 * Tag cloud — list rows, count-scaled font, single accent.
 *  - INPUT ALREADY SORTED on the server by getAllTags(). Do not re-sort here.
 *    Re-sorting on the client was triggering React hydration mismatches
 *    when the file system read returned tags in slightly different order
 *    between the server render and the client re-render.
 *  - Font-size scales smoothly with log(count+1) so growth is gradual.
 *  - Hover lifts to a glow; opacity scales with count weight.
 */
interface TagCloudProps {
  tags: TagStat[]; // server-side pre-sorted
}

export default function TagCloud({ tags }: TagCloudProps) {
  const router = useRouter();

  if (tags.length === 0) {
    return (
      <p className="text-xs text-foreground/40 font-mono">// no tags yet</p>
    );
  }

  const minCount = Math.min(...tags.map((t) => t.count));
  const maxCount = Math.max(...tags.map((t) => t.count));

  const scale = (c: number) => {
    const norm =
      maxCount === minCount
        ? 0.5
        : Math.log(c + 1) / Math.log(maxCount + 1);
    return 12 + Math.round(norm * 7); // 12px .. 19px
  };

  return (
    <div className="border border-border/60">
      <ul className="divide-y divide-border/60">
        {tags.map(({ name, count }) => {
          const fontSize = scale(count);
          const opacity =
            maxCount === minCount
              ? 70
              : 40 +
                Math.round(
                  ((count - minCount) / (maxCount - minCount)) * 45
                );
          return (
            <li key={name}>
              <button
                type="button"
                onClick={() =>
                  router.push(`/tags/${encodeURIComponent(name)}`)
                }
                className="group w-full flex items-baseline justify-between gap-4 px-4 py-2.5 text-left transition-colors hover:bg-card/30 focus:outline-none focus-visible:bg-card/40"
              >
                <span
                  className="font-mono tracking-wide text-primary transition-all duration-200 group-hover:text-glow"
                  style={{ fontSize: `${fontSize}px`, opacity: opacity / 100 }}
                >
                  {name}
                </span>
                <span className="font-mono tabular-nums text-foreground/30 text-xs group-hover:text-primary/60 transition-colors">
                  {String(count).padStart(2, "0")}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
