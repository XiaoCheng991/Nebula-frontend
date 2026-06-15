"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QUOTES } from "@/lib/quotes";

/**
 * Random-quote panel - docked top-left, expands downward.
 *
 *  - Stays attached to the left margin so it never covers the
 *    centered blog list (which starts at x ~ 192px on the 1024px+
 *    viewport). On narrow screens it shrinks and docks to the top,
 *    a horizontal strip.
 *  - Two states: collapsed chip (default) and expanded panel
 *    (click to open). The chip is mostly empty - a tiny `[>] quote`
 *    glyph only - so the expanded view feels like a deliberate
 *    gesture rather than a second nav item.
 *  - Expanded panel shows the full quote, attribution line, a
 *    counter (3/12), and a [re-roll] button. Click outside or
 *    press [x] to fold back. State (idx + open) persists in
 *    localStorage so it remembers where you left it.
 *  - Quotes live in src/lib/quotes.ts.
 *  - SSR / hydration: server renders quote 0 with the chip state
 *    so SSR matches the first client paint.
 */

const STORAGE_KEY = "kyon:quote:state";
const STORAGE_IDX_KEY = "kyon:quote:idx";

interface PersistedShape {
  idx: number;
  open: boolean;
}

let hydratedGlobal = false;

function pickInitial(seed?: { body: string; by: string }): PersistedShape {
  if (typeof window === "undefined") return { idx: 0, open: false };
  if (!hydratedGlobal) {
    hydratedGlobal = true;
    return { idx: 0, open: false };
  }
  try {
    const shapeRaw = localStorage.getItem(STORAGE_KEY);
    const shapeParsed = shapeRaw ? JSON.parse(shapeRaw) : null;
    const idxRaw = localStorage.getItem(STORAGE_IDX_KEY);
    let idx =
      typeof shapeParsed?.idx === "number"
        ? shapeParsed.idx
        : typeof idxRaw === "string"
        ? Number.parseInt(idxRaw, 10)
        : 0;
    if (typeof idx !== "number" || Number.isNaN(idx) || idx < 0) idx = 0;
    if (idx >= QUOTES.length) idx = 0;
    // Legacy on-by-default from the very first iteration showed panel
    // open at boot. We now collapse it by default - open feels too
    // greedy for a lazy chip. Re-collapse retroactively.
    const open =
      typeof shapeParsed?.open === "boolean" ? false : false;
    return { idx, open };
  } catch {
    return { idx: 0, open: false };
  }
}

function nextIndex(prev: number): number {
  if (QUOTES.length <= 1) return 0;
  let next = prev;
  while (next === prev) next = Math.floor(Math.random() * QUOTES.length);
  return next;
}

interface RandomQuoteProps {
  initialQuote?: { body: string; by: string };
}

export default function RandomQuote({ initialQuote }: RandomQuoteProps = {}) {
  const [state, setState] = useState<PersistedShape>({
    idx: 0,
    open: false,
  });
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setHydrated(true);
    if (initialQuote) {
      const i = QUOTES.findIndex(
        (q) => q.body === initialQuote.body && q.by === initialQuote.by
      );
      setState({ idx: i < 0 ? 0 : i, open: false });
    } else {
      setState((prev) => ({ ...prev, ...pickInitial() }));
    }
  }, [initialQuote]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // silent
    }
  }, [state, hydrated]);

  // Click-outside / Escape to fold.
  useEffect(() => {
    if (!state.open) return;
    const onDoc = (e: MouseEvent) => {
      const root = document.getElementById("random-quote-root");
      if (!root) return;
      if (!root.contains(e.target as Node)) {
        setState((prev) => ({ ...prev, open: false }));
      }
    };
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setState((prev) => ({ ...prev, open: false }));
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onEsc);
    };
  }, [state.open]);

  const reRoll = useCallback(() => {
    setState((prev) => ({ ...prev, idx: nextIndex(prev.idx) }));
  }, []);

  const close = useCallback(() => {
    setState((prev) => ({ ...prev, open: false }));
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({ ...prev, open: !prev.open }));
  }, []);

  const quote = useMemo(() => QUOTES[state.idx], [state.idx]);

  return (
    <div
      id="random-quote-root"
      className="fixed z-[60] font-mono"
      // Top-left, vertically hangs below the header band (h-14 = 56px).
      // We park 24px from the left edge (left-6) and 80px from the top
      // (top-20) which is 56 [nav] + 24 [gutter].
      style={{ top: 80, left: 24, width: 280 }}
    >
      {/* ============================================================ */}
      {/* COLLAPSED CHIP                                              */}
      {/* ============================================================ */}
      {!state.open && (
        <button
          type="button"
          onClick={toggle}
          aria-label="open random quote"
          className="group flex items-center gap-2 h-9 px-3 text-[11px] text-foreground/65 hover:text-primary transition-colors"
          style={{
            background: "hsl(var(--secondary) / 0.08)",
            border: "1px solid hsl(var(--secondary) / 0.35)",
            backdropFilter: "blur(4px)",
            width: 280,
          }}
        >
          <span
            aria-hidden
            className="shrink-0 text-[10px] text-secondary/80 tracking-wider"
          >
            {`[>]`}
          </span>
          <span
            className="truncate tracking-wide text-left flex-1"
            title={`${quote.body} - ${quote.by}`}
          >
            {quote.body}
            <span className="text-foreground/35">{` - ${quote.by}`}</span>
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
      {state.open && (
        <div
          role="dialog"
          aria-label="random quote"
          className="text-[12px]"
          style={{
            background: "hsl(var(--background) / 0.92)",
            border: "1px solid hsl(var(--secondary) / 0.45)",
            backdropFilter: "blur(8px)",
            boxShadow: "0 0 0 1px hsl(var(--secondary) / 0.10)",
            width: 280,
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
              onClick={close}
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
              {`${state.idx + 1}/${QUOTES.length}`}
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
