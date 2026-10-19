"use client";

import { useEffect, useRef, useState } from "react";
import { IconBulb, IconX } from "@tabler/icons-react";
import type { HabitGroup } from "@/lib/habits";

/**
 * 悬浮提示面板：承载「提醒型」模块（每日固定基础 / 饮食要点）。
 * 这类内容只作提醒、不计入打卡完成度，故不占主区域。
 * 点击外部或 Escape 关闭。
 */
export default function HabitTips({ groups }: { groups: HabitGroup[] }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const count = groups.reduce((n, g) => n + g.habits.length, 0);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("pointerdown", onDown);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("pointerdown", onDown);
    };
  }, [open]);

  if (groups.length === 0) return null;

  return (
    <div className={`habit-tips${open ? " is-open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="habit-tips-fab"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        <IconBulb size={16} />
        每日提醒
        <span className="habit-tips-badge">{count}</span>
      </button>

      {open ? (
        <div className="habit-tips-panel" role="dialog" aria-label="每日提醒">
          <div className="habit-tips-panel-head">
            <span>每日提醒</span>
            <button type="button" aria-label="关闭" onClick={() => setOpen(false)}>
              <IconX size={14} />
            </button>
          </div>
          <div className="habit-tips-body">
            {groups.map((group) => (
              <section className="habit-tips-group" key={`${group.id}-${group.title}`}>
                <h3>
                  {group.title}
                  {group.hint ? <span>{group.hint}</span> : null}
                </h3>
                <ul>
                  {group.habits.map((h) => (
                    <li key={h.id}>{h.title}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
