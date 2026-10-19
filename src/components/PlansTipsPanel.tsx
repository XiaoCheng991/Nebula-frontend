"use client";

import { IconBell } from "@tabler/icons-react";
import { groupsForDate, useHabits } from "@/lib/habits";

/**
 * /plans 右侧常驻「每日提醒」栏（浅色专属）。
 * 提醒型模块（每日固定基础 / 饮食要点）只作展示、不计入打卡完成度，
 * 故独立成右侧栏，不占中间主区域。深色下整页由 HabitTracker 渲染
 * 右下角 FAB 形态的 HabitTips，此处不显示（容器带 .sl，深色即隐藏）。
 */
export default function PlansTipsPanel() {
  const snap = useHabits();
  const groups = groupsForDate(snap.date).filter((g) => g.kind === "tips");

  if (groups.length === 0) return null;
  const count = groups.reduce((n, g) => n + g.habits.length, 0);

  return (
    <section className="habit-aside" aria-label="每日提醒">
      <header className="habit-aside-head">
        <span className="habit-aside-title">
          <IconBell size={14} />
          每日提醒
        </span>
        <span className="habit-aside-count">{count}</span>
      </header>
      <div className="habit-aside-body">
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
    </section>
  );
}
