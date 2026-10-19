"use client";

import { useEffect, useState } from "react";
import { IconCheck, IconEdit, IconFlame } from "@tabler/icons-react";
import HabitHeatmap from "@/components/HabitHeatmap";
import HabitTips from "@/components/HabitTips";
import HabitEditor from "@/components/HabitEditor";
import { groupsForDate, refreshIfNewDay, toggleHabit, useHabits } from "@/lib/habits";

/**
 * /plans 打卡面板：进度环 + 坚持日历 + 可打卡模块。
 * 提醒类（tips）模块不在此处，改由 HabitTips 以悬浮面板展示。
 * 视觉跟随浅色液态玻璃（22px 圆角 / 半透明白底 / 噪点 / 青紫光斑）。
 */
export default function HabitTracker() {
  const snap = useHabits();
  // 模块配置与勾选记录都只在客户端，SSR 用的是默认空态。
  // 用挂载闸门让 SSR HTML 与客户端首帧一致，避免 hydration 不一致报错。
  const [ready, setReady] = useState(false);
  const [editing, setEditing] = useState(false);
  // 浅色下「每日提醒」由右侧常驻栏 PlansTipsPanel 承担，FAB 只在深色渲染。
  const [isLight, setIsLight] = useState(false);
  const groups = groupsForDate(snap.date).filter((g) => g.kind === "check");
  const pct = snap.total ? Math.round((snap.done / snap.total) * 100) : 0;

  // 跨日自动切换：挂载比对 + 每分钟轮询（0 点过后不必手动刷新）。
  useEffect(() => {
    const syncTheme = () => setIsLight(document.documentElement.classList.contains("light"));
    syncTheme();
    setReady(true);
    refreshIfNewDay();
    const timer = window.setInterval(refreshIfNewDay, 60_000);
    window.addEventListener("theme-change", syncTheme);
    return () => {
      window.clearInterval(timer);
      window.removeEventListener("theme-change", syncTheme);
    };
  }, []);

  if (editing) return <HabitEditor onDone={() => setEditing(false)} />;
  if (!ready) return <div className="habit-tracker habit-tracker-booting" aria-hidden="true" />;

  return (
    <div className="habit-tracker">
      <header className="habit-head">
        <div className="habit-prose">
          <span className="habit-pill">
            <IconFlame size={14} />
            今日打卡
          </span>
          <h1 className="habit-title">{snap.weekdayLabel}的坚持</h1>
          <p className="habit-sub">
            目标：减脂 → 薄肌塑形｜作息养护｜英语学习。点一下条目，就是今天完成的事。
          </p>
        </div>

        <div className="habit-summary">
          {/* 直接传百分比字符串（如 "56%"），避免 CSS 里 calc 乘法（部分 linter 不识别） */}
          <div className="habit-ring" style={{ "--pct": `${pct}%` } as React.CSSProperties}>
            <div className="habit-ring-inner">
              <span className="habit-ring-num">{pct}%</span>
              <span className="habit-ring-label">
                {snap.done}/{snap.total}
              </span>
            </div>
          </div>
          <dl className="habit-stats">
            <div>
              <dt>连续全勤</dt>
              <dd>{snap.streak} 天</dd>
            </div>
            <div>
              <dt>日期</dt>
              <dd className="habit-date">{snap.date}</dd>
            </div>
          </dl>
          <button type="button" className="habit-edit-btn" onClick={() => setEditing(true)}>
            <IconEdit size={14} />
            编辑
          </button>
        </div>
      </header>

      <HabitHeatmap />

      <div className="habit-groups">
        {groups.map((group) => {
          const doneInGroup = group.habits.filter((h) => snap.checked.includes(h.id)).length;
          return (
            <section className="habit-group" key={`${group.id}-${group.title}`}>
              <div className="habit-group-head">
                <h2>{group.title}</h2>
                <span className="habit-group-count">
                  {doneInGroup}/{group.habits.length}
                </span>
              </div>
              {group.hint ? <p className="habit-group-hint">{group.hint}</p> : null}
              <ul className="habit-list">
                {group.habits.map((habit) => {
                  const checked = snap.checked.includes(habit.id);
                  return (
                    <li key={habit.id}>
                      <button
                        type="button"
                        className={`habit-item${checked ? " is-done" : ""}`}
                        aria-pressed={checked}
                        onClick={() => toggleHabit(habit.id)}
                      >
                        <span className="habit-box" aria-hidden="true">
                          <IconCheck size={14} />
                        </span>
                        <span className="habit-item-title">{habit.title}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
        {groups.length === 0 ? (
          <p className="habit-empty">还没有可打卡模块，点右上角「编辑」添加。</p>
        ) : null}
      </div>

      {isLight ? null : (
        <HabitTips groups={groupsForDate(snap.date).filter((g) => g.kind === "tips")} />
      )}
    </div>
  );
}
