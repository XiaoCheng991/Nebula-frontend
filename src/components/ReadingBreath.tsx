"use client";

import { useEffect, useState } from "react";

/**
 * Reading-breath indicator — Three vertical neon bars that pulse in a
 * terminal "data-stream" rhythm, expressing the article actively being read.
 *
 * Not interactive on its own. Reuses the original data-stream bar styling
 * from the legacy back-to-top button. Sits next to the post metadata.
 */
export default function ReadingBreath() {
  const [pulse, setPulse] = useState(true);

  // Subtle “page is alive” pacing — disable when tab hidden to save GPU.
  useEffect(() => {
    const onVis = () => setPulse(!document.hidden);
    onVis();
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div
      className="inline-flex items-end gap-[3px] px-2 py-[2px]"
      title="reading"
      aria-label="reading"
      style={{
        height: "16px",
        opacity: 0.85,
      }}
    >
      <span
        className="reading-bar"
        style={
          {
            "--h": "8px",
            animationDelay: "0s",
            animationPlayState: pulse ? "running" : "paused",
          } as React.CSSProperties
        }
      />
      <span
        className="reading-bar"
        style={
          {
            "--h": "13px",
            animationDelay: "0.18s",
            animationPlayState: pulse ? "running" : "paused",
          } as React.CSSProperties
        }
      />
      <span
        className="reading-bar"
        style={
          {
            "--h": "10px",
            animationDelay: "0.36s",
            animationPlayState: pulse ? "running" : "paused",
          } as React.CSSProperties
        }
      />
      <style jsx>{`
        @keyframes reading-breath {
          0%,
          100% {
            transform: scaleY(0.55);
            opacity: 0.55;
          }
          50% {
            transform: scaleY(1);
            opacity: 1;
          }
        }
        .reading-bar {
          display: block;
          width: 2.5px;
          height: var(--h);
          border-radius: 1px;
          background: hsl(var(--primary) / 0.75);
          box-shadow: 0 0 4px hsl(var(--primary) / 0.45);
          animation: reading-breath 1.4s ease-in-out infinite;
          transform-origin: bottom;
        }
      `}</style>
    </div>
  );
}
