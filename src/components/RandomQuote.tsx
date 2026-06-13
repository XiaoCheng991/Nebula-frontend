"use client";

import { useState } from "react";
import type { Quote } from "@/data/quotes";

interface RandomQuoteProps {
  initialQuote: Quote;
}

export default function RandomQuote({ initialQuote }: RandomQuoteProps) {
  const [quote, setQuote] = useState<Quote>(initialQuote);
  const [fading, setFading] = useState(false);

  const refresh = async () => {
    setFading(true);
    try {
      const res = await fetch("/api/quote");
      if (res.ok) {
        const next = (await res.json()) as Quote;
        setQuote(next);
      }
    } catch {
      // ignore — keep current
    } finally {
      setTimeout(() => setFading(false), 200);
    }
  };

  return (
    <button
      type="button"
      onClick={refresh}
      className="group block w-full text-left text-xs font-mono text-foreground/40 hover:text-foreground/55 transition-colors py-1"
      title="点击换一条"
    >
      <span className="transition-opacity duration-200" style={{ opacity: fading ? 0 : 1 }}>
        <span className="text-primary/35">{`> `}</span>
        {quote.text}
        {quote.author && <span className="text-foreground/25">{` — ${quote.author}`}</span>}
        <span className="text-foreground/15"> · /q</span>
      </span>
    </button>
  );
}
