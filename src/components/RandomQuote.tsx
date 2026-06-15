"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QUOTES } from "@/lib/quotes";

/**
 * Floating "word of the moment" patch.
 *
 *  - Mounts in the bottom-right, docked to the left of the BackToTop
 *    button (which sits at right-6 bottom-6 w-48). We park 96px to
 *    its left so the two never collide.
 *  - Two states: collapsed (chip with one truncated line) and
 *    expanded (panel with full quote, attribution, and a re-roll).
 *  - Click anywhere on the chip -> expand; click outside or [x] ->
 *    collapse. Re-roll is the only way to swap to a new line, on
 *    purpose: a floating patch that mutates under the cursor would
 *    feel haunted.
 *  - Animation is opacity + translate-y only (transform + opacity
 *    are GPU-cheap). No typewriter, no glitch, no particles - site
 *    already bans those.
 *  - Quotes come from src/lib/quotes.ts.
 *
 * Optional `initialQuote` prop kept for callers that want to lock
 * the first paint to a specific line (e.g. SSR with fixed seed).
 * If omitted, localStorage carries the last index across sessions,
 * falling back to Math.random() on first ever visit.
 */

const STORAGE_KEY = "kyon:quote:idx";
const COLLAPSED_OFFSET_RIGHT = "5.5rem"; // docks left of BackToTop (48px + gap)

// Module-level latch so the very first call after window exists
// returns 0 (matching SSR). All subsequent calls read localStorage.
// One latch per page lifetime is enough - the component only mounts once.
let hydratedGlobal = false;

interface RandomQuoteProps {
  initialQuote?: { body: string; by: string };
}

function indexOfQuote(body: string, by: string): number {
  const i = QUOTES.findIndex((q) => q.body === body && q.by === by);
  return i < 0 ? 0 : i;
}

function pickInitialIndex(seed?: { body: string; by: string }): number {
  if (seed) return indexOfQuote(seed.body, seed.by);
  if (typeof window === "undefined") return 0;
  // Server SSR / first client paint: always render quote 0 so
  // server markup and client first paint agree (no hydration flash).
  // After mount we swap to the persisted / random line.
  if (!hydratedGlobal) {
    hydratedGlobal = true;
    return 0;
  }
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return Math.floor(Math.random() * QUOTES.length);
  const n = Number.parseInt(raw, 10);
  if (Number.isNaN(n) || n < 0 || n >= QUOTES.length) return 0;
  return n;
}

function nextIndex(prev: number): number {
  if (QUOTES.length <= 1) return 0;
  let next = prev;
  // Tiny anti-flicker: never re-roll to the same line twice in a row.
  while (next === prev) {
    next = Math.floor(Math.random() * QUOTES.length);
  }
  return next;
}

export default function RandomQuote({ initialQuote }: RandomQuoteProps = {}) {
  const [idx, setIdx] = useState(0);
  const [open, setOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Hydrate once on mount. Updating state during render is unsafe,
  // so we run it in useEffect and let the first paint use the SSR
  // default (idx 0). After hydration, swap to the persisted value
  // (or the seed supplied via `initialQuote`).
  useEffect(() => {
    setIdx(pickInitialIndex(initialQuote));
    setHydrated(true);
  }, [initialQuote]);

  // Persist current index whenever it changes.
  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, String(idx));
    } catch {
      // localStorage disabled - silent, the quote still shows.
    }
  }, [idx, hydrated]);

  // Click-outside dismisses the panel.
  useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      const root = document.getElementById("random-quote-root");
      if (!root) return;
      if (!root.contains(e.target as Node)) setOpen(false);
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  const reRoll = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      setIdx((p) => nextIndex(p));
    },
    []
  );

  const quote = useMemo(() => QUOTES[idx], [idx]);

  return (
    <div
      id="random-quote-root"
      className="fixed bottom-6 z-[60] font-mono"
      style={{ right: COLLAPSED_OFFSET_RIGHT }}
    >
      {/* ============================================================ */}
      {/* COLLAPSED CHIP                                              */}
      {/* ============================================================ */}
      {!open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="open random quote"
          className="group flex items-center gap-2 h-9 max-w-[80vw] sm:max-w-[420px] px-3 text-[11px] text-foreground/65 hover:text-primary transition-colors"
          style={{
            background: "hsl(var(--secondary) / 0.08)",
            border: "1px solid hsl(var(--secondary) / 0.35)",
            backdropFilter: "blur(4px)",
          }}
        >
          <span
            aria-hidden
            className="shrink-0 text-[10px] text-secondary/80 tracking-wider"
          >
            {`[>]`}
          </span>
          <span
            className="truncate tracking-wide"
            title={`${quote.body} - ${quote.by}`}
          >
            {quote.body}
            <span className="text-foreground/35">
              {` - ${quote.by}`}
            </span>
          </span>
          <span
            aria-hidden
            className="shrink-0 text-[10px] text-foreground/30 group-hover:text-primary transition-colors"
          >
            [+]
          </span>
        </button>
      )}

      {/* ============================================================ */}
      {/* EXPANDED PANEL                                              */}
      {/* ============================================================ */}
      {open && (
        <div
          role="dialog"
          aria-label="random quote"
          className="w-[min(90vw,360px)] text-[12px]"
          style={{
            background: "hsl(var(--background) / 0.92)",
            border: "1px solid hsl(var(--secondary) / 0.45)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 0 1px hsl(var(--secondary) / 0.10)",
          }}
        >
          {/* header */}
          <div
            className="flex items-center justify-between px-3 py-2 text-[11px] uppercase tracking-wider"
            style={{
              borderBottom: "1px solid hsl(var(--secondary) / 0.20)",
              color: "hsl(var(--secondary) / 0.80)",
            }}
          >
            <span>// random.quote</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="close"
              className="text-foreground/45 hover:text-primary transition-colors normal-case tracking-normal"
            >
              [x]
            </button>
          </div>

          {/* body */}
          <div className="px-4 py-4 space-y-3">
            <p className="text-foreground/85 leading-relaxed text-[13px]">
              <span aria-hidden className="text-secondary/60 mr-1">
                "
              </span>
              {quote.body}
              <span aria-hidden className="text-secondary/60 ml-1">
                "
              </span>
            </p>
            <p className="text-[11px] text-foreground/40 uppercase tracking-wider">
              <span className="text-secondary/50">/ by </span>
              <span className="text-foreground/70 normal-case tracking-normal">
                {quote.by}
              </span>
            </p>
          </div>

          {/* footer */}
          <div
            className="flex items-center justify-between px-3 py-2 text-[10.5px] text-foreground/45 uppercase tracking-wider"
            style={{
              borderTop: "1px solid hsl(var(--secondary) / 0.20)",
            }}
          >
            <span className="tabular-nums normal-case tracking-normal">
              {`${idx + 1}/${QUOTES.length}`}
            </span>
            <button
              type="button"
              onClick={reRoll}
              className="flex items-center gap-2 text-secondary/80 hover:text-primary transition-colors normal-case tracking-normal"
            >
              <span aria-hidden>↻</span>
              <span>re-roll</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
