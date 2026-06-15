"use client";

import { useEffect, useState } from "react";

function getScrollPct(): number {
  const doc = document.documentElement;
  const scrollTop = window.scrollY || doc.scrollTop;
  const total = doc.scrollHeight - window.innerHeight;
  if (total <= 0) return 0;
  return Math.min(100, Math.max(0, (scrollTop / total) * 100));
}

// Geometry
// - Outer box 48x48, with 1px border on each side
// - Visible inner area = 46x46
// - Ring uses 50% / 50% so SVG centers itself regardless of font/border quirks
const BOX = 48;
const RING_R = 20;
const C = 2 * Math.PI * RING_R;

export default function BackToTop() {
  const [pct, setPct] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    let pending = false;
    const onScroll = () => {
      // Coalesce multiple scroll events into one state update per
      // animation frame; otherwise setState storms make React batch
      // and ring falls behind `pct` text by 60+ ms.
      if (pending) return;
      pending = true;
      rafId = window.requestAnimationFrame(() => {
        setPct(getScrollPct());
        pending = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, []);

  const offset = C - (pct / 100) * C;
  const scrollTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <button
      type="button"
      onClick={scrollTop}
      aria-label="回到顶部"
      title={`回到顶部 · ${Math.round(pct)}%`}
      className="group fixed bottom-6 right-6 z-[60] rounded-full cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95"
      style={{
        width: BOX,
        height: BOX,
        background: "hsl(var(--primary) / 0.06)",
        border: "1px solid hsl(var(--primary) / 0.4)",
        boxShadow:
          "0 0 12px hsl(var(--primary) / 0.08), inset 0 0 6px hsl(var(--primary) / 0.04)",
        backdropFilter: "blur(4px)",
        padding: 0,
        // cancel default button alignment so SVG inner box truly centers
        position: "fixed",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "hsl(var(--primary))";
        e.currentTarget.style.background = "hsl(var(--primary) / 0.12)";
        e.currentTarget.style.boxShadow =
          "0 0 18px hsl(var(--primary) / 0.35), inset 0 0 12px hsl(var(--primary) / 0.08)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "hsl(var(--primary) / 0.4)";
        e.currentTarget.style.background = "hsl(var(--primary) / 0.06)";
        e.currentTarget.style.boxShadow =
          "0 0 12px hsl(var(--primary) / 0.08), inset 0 0 6px hsl(var(--primary) / 0.04)";
      }}
    >
      {/* SVG ring — independent absolute layer, viewBox shares aspect
          with the button viewport, so cx/cy at 50% maps to the same
          center as the inner flex label below. */}
      <svg
        width="100%"
        height="100%"
        viewBox={`0 0 ${BOX} ${BOX}`}
        preserveAspectRatio="xMidYMid meet"
        style={{
          position: "absolute",
          inset: 0,
          transform: "rotate(-90deg)",
        }}
      >
        <circle
          cx="50%"
          cy="50%"
          r={RING_R}
          fill="none"
          stroke="hsl(var(--primary) / 0.15)"
          strokeWidth="2"
        />
        <circle
          cx="50%"
          cy="50%"
          r={RING_R}
          fill="none"
          stroke="hsl(var(--primary))"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={offset}
          style={{
            transition: "none",
            filter: "drop-shadow(0 0 3px hsl(var(--primary) / 0.6))",
          }}
        />
      </svg>

      {/* Center label — flex in normal flow, vertically stacked, same axis as SVG */}
      <div
        className="relative flex flex-col items-center justify-center text-primary leading-none pointer-events-none"
      >
        <span
          className="font-mono tabular-nums"
          style={{ fontSize: "10px", fontWeight: 600 }}
        >
          {Math.round(pct)}%
        </span>
        <span
          className="group-hover:hidden"
          style={{ fontSize: "9px", marginTop: "1px" }}
        >
          ▼
        </span>
        <span
          className="hidden group-hover:block"
          style={{ fontSize: "10px", marginTop: "1px" }}
        >
          ▲
        </span>
      </div>
    </button>
  );
}
