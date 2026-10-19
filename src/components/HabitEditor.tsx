"use client";

import { useState } from "react";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import {
  getConfig,
  newBlockId,
  newEntryId,
  resetConfig,
  saveConfig,
  type HabitBlock,
  type HabitBlockKind,
  type HabitBlockScope,
  type HabitEntry,
} from "@/lib/habits";

const WEEK_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];

/**
 * 页面内编辑器：改模块标题/类型（打卡 or 提醒）/范围（每日 or 按周），
 * 增删条目，增删模块。保存即写入 localStorage 并立即生效，不必改代码。
 */
export default function HabitEditor({ onDone }: { onDone: () => void }) {
  const [draft, setDraft] = useState<HabitBlock[]>(() => getConfig());
  const [dayIdx, setDayIdx] = useState<number[]>(() => getConfig().map(() => 1));

  const patch = (id: string, next: Partial<HabitBlock>) =>
    setDraft((prev) => prev.map((b) => (b.id === id ? { ...b, ...next } : b)));

  const patchDay = (id: string, idx: number, next: Partial<HabitBlock["days"][number]>) =>
    setDraft((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const days = b.days.slice();
        days[idx] = { ...days[idx], ...next };
        return { ...b, days };
      })
    );

  const patchItems = (id: string, idx: number, items: HabitEntry[]) =>
    patchDay(id, idx, { items });

  const addBlock = () => {
    const block: HabitBlock = {
      id: newBlockId(),
      title: "新模块",
      kind: "check",
      scope: "daily",
      days: [{ title: "新模块", items: [] }],
    };
    setDraft((prev) => [...prev, block]);
    setDayIdx((prev) => [...prev, 1]);
  };

  const removeBlock = (id: string) => {
    setDraft((prev) => prev.filter((b) => b.id !== id));
    setDayIdx((prev) => prev.slice(0, -1));
  };

  return (
    <section className="habit-editor" aria-label="编辑打卡模块">
      <header className="habit-editor-head">
        <h2>编辑打卡</h2>
        <p>改完即生效。删除条目不清理历史记录，只从今日清单移除。</p>
      </header>

      <div className="habit-editor-blocks">
        {draft.map((block, bi) => {
          const idx = block.scope === "weekday" ? Math.min(dayIdx[bi] ?? 1, 6) : 0;
          const day = block.days[idx] ?? block.days[0];
          return (
            <article className="habit-editor-block" key={block.id}>
              <div className="habit-editor-row">
                <input
                  className="habit-input"
                  value={block.title}
                  aria-label="模块名"
                  onChange={(e) => patch(block.id, { title: e.target.value })}
                />
                <select
                  className="habit-select"
                  value={block.kind}
                  aria-label="模块类型"
                  onChange={(e) => patch(block.id, { kind: e.target.value as HabitBlockKind })}
                >
                  <option value="check">可打卡</option>
                  <option value="tips">仅提醒</option>
                </select>
                <select
                  className="habit-select"
                  value={block.scope}
                  aria-label="生效范围"
                  onChange={(e) =>
                    patch(block.id, { scope: e.target.value as HabitBlockScope })
                  }
                >
                  <option value="daily">每日</option>
                  <option value="weekday">按周</option>
                </select>
                <button
                  type="button"
                  className="habit-icon-btn"
                  aria-label="删除模块"
                  onClick={() => removeBlock(block.id)}
                >
                  <IconTrash size={14} />
                </button>
              </div>

              {block.scope === "weekday" ? (
                <div className="habit-editor-days" role="tablist" aria-label="选择星期">
                  {WEEK_CN.map((label, i) => (
                    <button
                      key={label}
                      type="button"
                      role="tab"
                      aria-selected={i === idx}
                      className={`habit-day-tab${i === idx ? " is-active" : ""}`}
                      onClick={() =>
                        setDayIdx((prev) => prev.map((v, j) => (j === bi ? i : v)))
                      }
                    >
                      {label}
                    </button>
                  ))}
                </div>
              ) : null}

              <div className="habit-editor-row">
                <input
                  className="habit-input"
                  value={day.title}
                  aria-label="当日标题"
                  onChange={(e) => patchDay(block.id, idx, { title: e.target.value })}
                />
                <input
                  className="habit-input"
                  value={day.hint ?? ""}
                  placeholder="备注（可选）"
                  aria-label="备注"
                  onChange={(e) => patchDay(block.id, idx, { hint: e.target.value })}
                />
              </div>

              <ul className="habit-editor-items">
                {day.items.map((item) => (
                  <li key={item.id}>
                    <input
                      className="habit-input"
                      value={item.title}
                      aria-label="条目"
                      onChange={(e) =>
                        patchItems(
                          block.id,
                          idx,
                          day.items.map((it) =>
                            it.id === item.id ? { ...it, title: e.target.value } : it
                          )
                        )
                      }
                    />
                    <button
                      type="button"
                      className="habit-icon-btn"
                      aria-label="删除条目"
                      onClick={() =>
                        patchItems(
                          block.id,
                          idx,
                          day.items.filter((it) => it.id !== item.id)
                        )
                      }
                    >
                      <IconTrash size={13} />
                    </button>
                  </li>
                ))}
              </ul>

              <button
                type="button"
                className="habit-add-btn"
                onClick={() =>
                  patchItems(block.id, idx, [...day.items, { id: newEntryId(), title: "新条目" }])
                }
              >
                <IconPlus size={13} />
                加条目
              </button>
            </article>
          );
        })}
      </div>

      <button type="button" className="habit-add-btn habit-add-block" onClick={addBlock}>
        <IconPlus size={14} />
        加模块
      </button>

      <footer className="habit-editor-foot">
        <button type="button" className="habit-btn" onClick={onDone}>
          取消
        </button>
        <button
          type="button"
          className="habit-btn habit-btn-ghost"
          onClick={() => {
            if (window.confirm("恢复为默认清单？当前编辑内容将丢失。")) resetConfig();
            onDone();
          }}
        >
          恢复默认
        </button>
        <button
          type="button"
          className="habit-btn habit-btn-primary"
          onClick={() => {
            saveConfig(draft);
            onDone();
          }}
        >
          保存
        </button>
      </footer>
    </section>
  );
}
