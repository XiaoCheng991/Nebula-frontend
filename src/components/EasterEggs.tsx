"use client";

import { useEffect } from "react";

/**
 * Client-only easter eggs.
 *
 *  C: console ascii banner on first mount, plus a welcome note
 *  A: konami-code key sequence triggers a brief visual glitch on
 *     headings + ascii art reveal in console
 *
 * Mounted once in root layout, no props.
 */

let isFirstMount = true;

export default function EasterEggs() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isFirstMount) return;
    isFirstMount = false;

    // ---------- C: console welcome ----------
    const banner = [
      "   __ __  __ __   ___  __ ___  ",
      "  | '_ `'_ \\'_ `\\/ o `'_ \\/ o |",
      "  | . . . / . . /|  _| . /|  _|",
      "  |_| |_||_||_||_| |_||_||_| |_",
      "        ~signal received~",
    ].join("\n");
    console.log(
      "%c" + banner,
      "color:#a64dff;font-family:monospace;font-size:13px;line-height:1;",
    );
    console.log(
      "%c[ kyon // blog ] %c welcome,hacker. 慢慢浏览,不要 ctrl+w.",
      "color:#00e5ff;font-weight:bold;",
      "color:#bfbfbf;",
    );

    // ---------- A: konami ----------
    const seq = [
      "ArrowUp","ArrowUp","ArrowDown","ArrowDown",
      "ArrowLeft","ArrowRight","ArrowLeft","ArrowRight",
      "b","a",
    ];
    let idx = 0;
    let armed = false;
    let unglitchTimer: number | null = null;

    const asciiWin = [
      "  *   *   *   *   *   *   *   ",
      "   \\ | / \\ | / \\ | / \\ | /    ",
      "  - O - K - y - o - n - O -    ",
      "   / | \\ / | \\ / | \\ / | \\    ",
      "  *   *   *   *   *   *   *   ",
    ].join("\n");

    const onKey = (e: KeyboardEvent) => {
      // Use key + ignore modifier keys to be friendly on macOS layouts
      const expected = seq[idx];
      const ok = expected.startsWith("Arrow")
        ? e.key === expected
        : e.key.toLowerCase() === expected;
      if (ok) {
        idx++;
        if (idx >= seq.length) {
          idx = 0;
          trigger();
        }
      } else {
        // restart matching on current key if it equals first element
        idx = e.key.toLowerCase() === seq[0].toLowerCase() ||
              e.key === seq[0]
          ? 1 : 0;
      }
    };

    const trigger = () => {
      if (armed) return;
      armed = true;

      // Apply brief glitch class to top-level headings & nav
      const targets = document.querySelectorAll<HTMLElement>(
        "h1, h2, .card-rise",
      );
      targets.forEach((el) => {
        el.style.transition = "filter 80ms linear, transform 80ms linear";
        el.style.filter = "hue-rotate(180deg) saturate(2)";
        el.style.transform = "translateX(2px)";
      });
      // toggle back after a moment
      unglitchTimer = window.setTimeout(() => {
        targets.forEach((el) => {
          el.style.filter = "";
          el.style.transform = "";
        });
        if (unglitchTimer) window.clearTimeout(unglitchTimer);
        window.setTimeout(() => {
          armed = false;
        }, 800);
      }, 320);

      // Reveal in console
      console.log(
        "%c" + asciiWin,
        "color:#00e5ff;font-family:monospace;font-size:13px;line-height:1;",
      );
      console.log(
        "%c[ skill-tree unlocked ] %c $\u00A0→ yep,你按对了。👁",
        "color:#a64dff;font-weight:bold;",
        "color:#bfbfbf;",
      );
    };

    window.addEventListener("keydown", onKey, { passive: true });
    return () => {
      window.removeEventListener("keydown", onKey);
      if (unglitchTimer) window.clearTimeout(unglitchTimer);
    };
  }, []);

  return null;
}
