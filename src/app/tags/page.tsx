import { getAllTags } from "@/lib/tags";
import TagCloud from "@/components/TagCloud";

/**
 * /tags - personal-tag index page.
 *
 * Layout (top -> bottom, server-rendered, single Client island
 * is the TagCloud below):
 *
 *   [ hero strip ]   $ tags --scan                  // total · unique · max · oldest
 *                    [ HUGE ASCII 'TAGS' tagline ]
 *                    lead caption
 *
 *   [ TagCloud ]     spectrum.spectrum   (full-width)
 *                    frequent.tags       (12 cells, 2-col grid + bar)
 *                    rare.tail           (collapsed by default)
 *
 *   [ footer ]       // end_of_index
 *
 * Typography stays mono throughout, head sizes use Space Mono
 * via globals. Headline tagline uses block glyphs to keep the
 * hacker/cyberpunk vibe without external assets.
 */

const HERO_GLYPH = [
  " ████████╗ █████╗  ██████╗ ███████╗",
  " ╚══██╔══╝██╔══██╗██╔════╝ ██╔════╝",
  "    ██║   ███████║██║  ███╗█████╗  ",
  "    ██║   ██╔══██║██║   ██║██╔══╝  ",
  "    ██║   ██║  ██║╚██████╔╝███████╗",
  "    ╚═╝   ╚═╝  ╚═╝ ╚═════╝ ╚══════╝",
];

export default function TagsPage() {
  const tags = getAllTags();

  // hero metadata - mirrors what each section below is showing.
  // spectrum = total, tiles = top-N, rare = collapsed tail.
  const total = tags.length;
  const maxCount = tags.reduce((m, t) => (t.count > m ? t.count : m), 0);
  const tileCap = 12;
  const tileCount = Math.min(tileCap, tags.length);
  const rareTags = Math.max(0, total - tileCount);
  // No real "oldest tag date" stored on tags yet - keep slot layout
  // consistent by surfacing a process label, never an empty cell.
  const totalPosts = tags.reduce((s, t) => s + t.count, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* ============================================================ */}
      {/* HERO                                                        */}
      {/* ============================================================ */}
      <section className="mb-12">
        {/* status bar */}
        <div className="flex items-center justify-between gap-4 mb-5 font-mono text-[11px] tracking-wider uppercase">
          <div className="flex items-center gap-2 text-secondary/80">
            <span className="text-foreground/30">{`>`}</span>
            <span>tags</span>
            <span className="text-foreground/30">--scan</span>
            <span className="cursor-blink" />
          </div>
          <div className="hidden sm:flex items-center gap-3 text-foreground/40 tabular-nums normal-case tracking-normal">
            <span>{total} tags</span>
            <span className="text-foreground/20">/</span>
            <span>{totalPosts} posts</span>
          </div>
        </div>

        {/* ascii headline */}
        <pre
          aria-hidden
          className="hidden md:block font-mono text-primary/85 leading-[1.05] text-[11px] lg:text-[13px] select-none whitespace-pre overflow-hidden"
        >
          {HERO_GLYPH.join("\n")}
        </pre>
        <pre
          aria-hidden
          className="md:hidden font-mono text-primary/85 leading-[1.05] text-[10px] select-none whitespace-pre overflow-hidden"
        >
          {HERO_GLYPH.map((line) => line.split("").map(() => "#").join("")).join("\n")}
        </pre>

        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <h1 className="sr-only">Tags index</h1>

        {/* inline lead caption */}
        <p className="mt-5 max-w-2xl text-foreground/55 leading-relaxed text-[14px]">
          {`A lattice of every topic this corner of the web has touched. `}
          <span className="font-mono text-foreground/40 text-[13px]">
            {`// freq desc · click to dive in`}
          </span>
        </p>

        {/* metadata row - replaces a chart, mirrors spectrum below */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-px bg-border/60 border border-border/60 font-mono text-[11px] uppercase tracking-wider">
          <MetaCell label="uniq.tags" value={String(total)} accent="primary" />
          <MetaCell label="posts.total" value={String(totalPosts)} />
          <MetaCell
            label="feature.tiles"
            value={String(tileCount)}
            accent="secondary"
          />
          <MetaCell
            label="rare.tail"
            value={String(rareTags)}
            accent="accent"
          />
        </div>
      </section>

      {/* ============================================================ */}
      {/* BODY: frequency spectrum + frequent grid + rare tail        */}
      {/* ============================================================ */}
      <TagCloud tags={tags} />

      {/* ============================================================ */}
      {/* FOOTER STRIP                                                */}
      {/* ============================================================ */}
      <footer className="mt-16 border-t border-border/40 pt-4 flex items-center justify-between font-mono text-[11px] text-foreground/35">
        <span className="flex items-center gap-2">
          <span className="text-foreground/20">{`//`}</span>
          <span>end_of_index</span>
        </span>
        <span className="flex items-center gap-2 tabular-nums normal-case tracking-normal">
          <span>max</span>
          <span className="text-primary/70">{maxCount}</span>
        </span>
      </footer>
    </div>
  );
}

function MetaCell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: "primary" | "secondary" | "accent";
}) {
  const accentClass =
    accent === "primary"
      ? "text-primary"
      : accent === "secondary"
        ? "text-secondary"
        : accent === "accent"
          ? "text-accent"
          : "text-foreground/80";
  return (
    <div className="bg-background px-3 py-2 flex flex-col gap-1">
      <span className="text-foreground/35">{label}</span>
      <span className={`text-[14px] tabular-nums ${accentClass}`}>{value}</span>
    </div>
  );
}
