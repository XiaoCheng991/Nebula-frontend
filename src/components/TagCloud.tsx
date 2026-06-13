"use client";

import {useMemo, useState} from "react";
import {useRouter} from "next/navigation";
import type {TagStat} from "@/lib/tag-color";
import {getTagColor} from "@/lib/tag-color";
import {FEATURE_CAP, RARE_THRESHOLD} from "@/lib/tag-taxonomy";

/**
 * Tags index - three sections, geeking out inside the same
 * cyan / violet / magenta / black / mono / radius-0 brand.
 *
 *  1. Spectrum bar - one slim row per tag, width = count / max.
 *     Acts as a histogram + nav. Top tags glow cyan, the rest sit
 *     in foreground/40. Click or Enter to navigate.
 *  2. Frequent grid - the "feature" 12. Two-column rows again,
 *     but each tile now carries an inline ASCII bar that grows
 *     on hover (pure CSS width animation) plus the existing
 *     shortcut prefix + count + tick.
 *  3. Rare tail - everything <= RARE_THRESHOLD collapsed by
 *     default, Expand / Collapse toggle, no row count change.
 *
 * Motion is restrained: pure CSS, opt-in via prefers-reduced-motion.
 * No GSAP / framer. No external icon library.
 */

const RARITY_LABEL: Record<number, string> = {
  1: "rare.once",
  2: "rare.twice",
};

interface TagCloudProps {
  tags: TagStat[];
}

function shortOf(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "??";
  const ascii = trimmed.replace(/[^\x00-\x7F]/g, "");
  if (ascii.length >= 2) return ascii.slice(0, 2).toUpperCase();
  if (ascii.length === 1) return ascii.toUpperCase() + ascii.toUpperCase();
  // CJK-only tag: take the first 2 code points verbatim.
  const chars = Array.from(trimmed);
  if (chars.length === 1) return chars[0] + chars[0];
  return chars.slice(0, 2).join("");
}

// ▏▎▍▇█ - six-step density glyph. We use it to render a
// tiny "spectrum" preview on each spectrum row's left edge.
// Width classes are Tailwind so the tailwind compiler keeps them.
const GLYPH_STEPS = ["▏", "▎", "▍", "▆", "▇", "█"];

export default function TagCloud({ tags }: TagCloudProps) {
  const router = useRouter();
  const [tailOpen, setTailOpen] = useState(false);

  if (tags.length === 0) {
    return (
      <p className="text-xs text-foreground/40 font-mono py-8">
        // no tags yet
      </p>
    );
  }

  const maxCount = useMemo(
    () => tags.reduce((m, t) => (t.count > m ? t.count : m), 0),
    [tags]
  );

  // The frequent grid shows the FIRST FEATURE_CAP tags, but only
  // those with at least one post. Everything else collapses into
  // the rare.tail below. Single source of truth for the rare count.
  const frequent = tags.slice(0, FEATURE_CAP);
  const rest = tags.slice(frequent.length);
  const tail = rest.filter((t) => t.count <= RARE_THRESHOLD);

  const handleGo = (name: string) =>
    router.push(`/tags/${encodeURIComponent(name)}`);

  const onKey = (e: React.KeyboardEvent<HTMLButtonElement>, name: string) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleGo(name);
    }
  };

  return (
    <div className="space-y-12">
      {/* ============================================================ */}
      {/* 1. SPECTRUM                                                  */}
      {/* ============================================================ */}
      <section aria-label="tag frequency spectrum">
        <div className="flex items-baseline justify-between mb-3 font-mono text-[11px] tracking-wider uppercase">
          <div className="flex items-center gap-2 text-foreground/45">
            <span className="text-primary/70">{`//`}</span>
            <span>frequency.spectrum</span>
          </div>
          <span className="text-foreground/30 tabular-nums normal-case tracking-normal">
            {tags.length} t · max {maxCount}
          </span>
        </div>

        <div
          className="border border-border/60 bg-background/40 grid-bg"
          role="list"
        >
          {tags.map(({ name, count }, idx) => {
            const pct = Math.max(2, Math.round((count / maxCount) * 100));
            const isHot = idx < 4;
            return (
              <button
                key={name}
                type="button"
                role="listitem"
                onClick={() => handleGo(name)}
                onKeyDown={(e) => onKey(e, name)}
                aria-label={`tag ${name}, ${count} posts`}
                className={`group relative flex items-center gap-3 px-3 py-[7px] w-full text-left font-mono focus:outline-none focus-visible:bg-primary/[0.06] ${
                  idx !== tags.length - 1 ? "border-b border-border/30" : ""
                } hover:bg-primary/[0.04] transition-colors`}
              >
                {/* glyph density hint */}
                <span
                  aria-hidden
                  className={`shrink-0 w-4 text-xs text-center tabular-nums transition-colors ${
                    isHot
                      ? "text-primary/80 group-hover:text-primary"
                      : "text-foreground/30 group-hover:text-foreground/60"
                  }`}
                >
                  {GLYPH_STEPS[Math.min(5, Math.ceil((count / maxCount) * 6)) - 1] || "▏"}
                </span>

                {/* tag name */}
                <span
                  className={`shrink-0 w-[88px] truncate text-[13px] tracking-wide transition-colors ${
                    isHot
                      ? "text-primary group-hover:text-glow"
                      : "text-foreground/70 group-hover:text-foreground"
                  }`}
                >
                  {name}
                </span>

                {/* bar track */}
                <span className="relative flex-1 h-[10px] bg-foreground/[0.04] overflow-hidden">
                  <span
                    aria-hidden
                    className={`absolute inset-y-0 left-0 transition-[width,background] duration-300 ease-out ${
                      isHot
                        ? "bg-primary/55 group-hover:bg-primary/80 group-hover:text-glow"
                        : "bg-foreground/20 group-hover:bg-primary/40"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </span>

                {/* count */}
                <span
                  className={`shrink-0 w-8 text-right text-xs tabular-nums transition-colors ${
                    isHot
                      ? "text-primary/85"
                      : "text-foreground/45 group-hover:text-foreground/80"
                  }`}
                >
                  {count.toString().padStart(2, "0")}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ============================================================ */}
      {/* 2. FEATURE TILES                                             */}
      {/* ============================================================ */}
      <section aria-label="feature tiles">
        <div className="flex items-baseline justify-between mb-3 font-mono text-[11px] tracking-wider uppercase">
          <div className="flex items-center gap-2 text-foreground/45">
            <span className="text-secondary/70">{`//`}</span>
            <span>feature.tiles</span>
          </div>
          <span className="text-foreground/30 tabular-nums normal-case tracking-normal">
            top {frequent.length} of {tags.length}
          </span>
        </div>

        <div className="border border-border/60 bg-background/40">
          <ul className="grid grid-cols-1 md:grid-cols-2">
            {frequent.map(({ name, count }, idx) => {
              const isHot = idx < 4;
              const prefix = shortOf(name);
              const pct = Math.max(6, Math.round((count / maxCount) * 100));
              const last = idx === frequent.length - 1;
              const tagColorClass = getTagColor(name);
              return (
                <li
                  key={name}
                  className={`relative ${
                    idx % 2 === 0 ? "md:border-r" : ""
                  } ${
                    !last ? "border-b" : ""
                  } border-border/40 transition-colors hover:bg-primary/[0.04]`}
                >
                  <button
                    type="button"
                    onClick={() => handleGo(name)}
                    onKeyDown={(e) => onKey(e, name)}
                    aria-label={`tag ${name}, ${count} posts`}
                    className="group w-full px-4 pt-3 pb-4 text-left focus:outline-none focus-visible:bg-primary/[0.06]"
                  >
                    {/* Row 1: shortcut + name + count + tick */}
                    <div className="flex items-center gap-3 mb-3">
                      <span
                        className={[
                          "font-mono shrink-0 text-[10px] tracking-wider px-1.5 py-[2px] border transition-colors",
                          isHot
                            ? "text-primary/75 border-primary/30 group-hover:border-primary/60"
                            : "text-foreground/35 border-border/60 group-hover:text-foreground/55 group-hover:border-foreground/30",
                        ].join(" ")}
                      >
                        {prefix}
                      </span>

                      <span
                        className={[
                          "font-mono tracking-wide flex-1 truncate transition-colors text-[14px] leading-[1.4]",
                          tagColorClass,
                        ].join(" ")}
                        style={{ paddingTop: "1px" }}
                      >
                        {name}
                      </span>

                      <span
                        className={[
                          "font-mono tabular-nums shrink-0 text-xs transition-colors w-6 text-right",
                          isHot
                            ? "text-primary/70 group-hover:text-primary"
                            : "text-foreground/35 group-hover:text-foreground/55",
                        ].join(" ")}
                      >
                        {count}
                      </span>

                      <span
                        className={[
                          "font-mono shrink-0 text-xs w-3 text-center transition-all",
                          isHot
                            ? "text-primary group-hover:translate-x-0.5"
                            : "text-foreground/25 opacity-0 group-hover:opacity-100 group-hover:text-foreground/55 group-hover:translate-x-0.5",
                        ].join(" ")}
                      >
                        →
                      </span>
                    </div>

                    {/* Row 2: inline ascii bar - width =
                        count / maxCount, animates on hover */}
                    <div className="flex items-center gap-2 font-mono text-[10px] text-foreground/30">
                      <span className="shrink-0">[</span>
                      <span
                        aria-hidden
                        className="relative h-[8px] flex-1 bg-foreground/[0.05] overflow-hidden"
                      >
                        <span
                          className={[
                            "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out",
                            isHot
                              ? "bg-primary/45 group-hover:bg-primary/75"
                              : "bg-foreground/20 group-hover:bg-primary/40",
                          ].join(" ")}
                          style={{ width: `${pct}%` }}
                        />
                      </span>
                      <span className="shrink-0">]</span>
                      <span className="shrink-0 tabular-nums w-7 text-right">
                        {pct}%
                      </span>
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ============================================================ */}
      {/* 3. RARE TAIL                                                 */}
      {/* ============================================================ */}
      {(() => {
        // Even when "tail" is empty (e.g. very small datasets),
        // surface the toggle so the structure never disappears.
        const hasTail = tail.length > 0;
        return (
          <section aria-label="rare tags tail">
            <div className="flex items-baseline justify-between mb-3 font-mono text-[11px] tracking-wider uppercase">
              <div className="flex items-center gap-2 text-foreground/45">
                <span className="text-accent/70">{`//`}</span>
                <span>rare.tail</span>
              </div>
              <button
                type="button"
                onClick={() => setTailOpen((v) => !v)}
                aria-expanded={tailOpen}
                className="font-mono text-foreground/40 hover:text-primary transition-colors flex items-center gap-2 normal-case tracking-normal"
              >
                <span className="tabular-nums">{tail.length}</span>
                <span>le {RARE_THRESHOLD}</span>
                <span className="text-foreground/30">
                  {tailOpen ? "[-]" : "[+]"}
                </span>
              </button>
            </div>

            {hasTail ? (
              tailOpen && (
                <div className="border border-border/60 bg-background/40">
                  <ul>
                    {tail.map(({ name, count }, idx) => {
                      const last = idx === tail.length - 1;
                      return (
                        <li
                          key={name}
                          className={
                            !last
                              ? "border-b border-border/30"
                              : ""
                          }
                        >
                          <button
                            type="button"
                            onClick={() => handleGo(name)}
                            onKeyDown={(e) => onKey(e, name)}
                            aria-label={`tag ${name}, ${count} posts`}
                            className="group w-full flex items-center gap-3 px-3 py-2 text-left font-mono text-[12px] hover:bg-primary/[0.04] focus:outline-none focus-visible:bg-primary/[0.06] transition-colors"
                          >
                            <span className="text-foreground/25 group-hover:text-foreground/55 transition-colors w-4">
                              ·
                            </span>
                            <span
                              className={`${getTagColor(
                                name
                              )} flex-1 truncate group-hover:text-glow transition-colors`}
                            >
                              {name}
                            </span>
                            <span className="text-foreground/30 tabular-nums w-12 text-right">
                              {RARITY_LABEL[count] ||
                                `${count} posts`}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )
            ) : (
              <p className="font-mono text-[12px] text-foreground/30">
                {`// tail empty - every tag has more than ${RARE_THRESHOLD} posts`}
              </p>
            )}
          </section>
        );
      })()}
    </div>
  );
}
