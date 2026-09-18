"use client";

import { useEffect, useRef } from "react";

export default function CopyCodeButton({ revision }: { revision: string }) {
  const markerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const root = markerRef.current?.parentElement;
    if (!root) return;
    const buttons = Array.from(root.querySelectorAll<HTMLButtonElement>(".code-copy-button"));
    const timers = new Map<HTMLButtonElement, number>();
    let disposed = false;
    const onClick = async (button: HTMLButtonElement) => {
      const code = button.parentElement?.querySelector("code");
      if (!code || button.disabled) return;
      clearTimeout(timers.get(button));
      button.disabled = true;
      try {
        const plain = code.textContent ?? "";
        const rich = `<meta charset="utf-8"><div style="white-space:pre;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;">${code.innerHTML}</div>`;
        if (typeof ClipboardItem !== "undefined") {
          try {
            await navigator.clipboard.write([
              new ClipboardItem({
                "text/plain": new Blob([plain], { type: "text/plain" }),
                "text/html": new Blob([rich], { type: "text/html" }),
              }),
            ]);
          } catch {
            await navigator.clipboard.writeText(plain);
          }
        } else {
          await navigator.clipboard.writeText(plain);
        }
        if (!disposed) button.textContent = "已复制";
      } catch {
        if (!disposed) button.textContent = "复制失败，请手动选择";
      } finally {
        if (!disposed) {
          button.disabled = false;
          timers.set(button, window.setTimeout(() => {
            button.textContent = "复制代码";
          }, 2000));
        }
      }
    };
    const listeners = buttons.map((button) => {
      const listener = () => onClick(button);
      button.addEventListener("click", listener);
      return { button, listener };
    });
    return () => {
      disposed = true;
      listeners.forEach(({ button, listener }) => button.removeEventListener("click", listener));
      timers.forEach((timer) => clearTimeout(timer));
    };
  }, [revision]);

  return <span ref={markerRef} hidden />;
}
