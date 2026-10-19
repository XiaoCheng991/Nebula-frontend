import { IconCalendarBolt } from "@tabler/icons-react";
import { dateInShanghai, getHeatmap } from "@/lib/habits";

/**
 * 坚持日历：GitHub 式 contribution 图。列=周（周日对齐），行=周一至周日，
 * 颜色深浅=当日完成度。纯消费 getHeatmap()，不含日期推算逻辑。
 */
const WEEKDAY_LABELS = ["日", "一", "二", "三", "四", "五", "六"];

export default function HabitHeatmap() {
  const data = getHeatmap();
  const today = dateInShanghai();

  // 月份标签：按每周首日所属月份合并相邻周，宽度用周数列数换算
  const months: { label: string; span: number }[] = [];
  for (const week of data.weeks) {
    const m = Number(week.days[0].date.slice(5, 7));
    const label = `${m}月`;
    const last = months[months.length - 1];
    if (last && last.label === label) last.span += 1;
    else months.push({ label, span: 1 });
  }

  return (
    <section className="heat-card" aria-label="坚持日历">
      <header className="heat-head">
        <h2>
          <IconCalendarBolt size={16} />
          坚持日历
        </h2>
        <p>过去一年每一天的完成度，颜色越深越接近全勤。</p>
      </header>

      <div className="heat-scroll">
        <div className="heat-body">
          <div className="heat-months" aria-hidden="true">
            {months.map((m, i) => (
              <span
                key={`${m.label}-${i}`}
                className="heat-month"
                /* 直接传像素宽度，避免 CSS 里 calc 乘法（部分 linter 不识别） */
                style={{ "--span": `${m.span * 13}px` } as React.CSSProperties}
              >
                {m.label}
              </span>
            ))}
          </div>

          <div className="heat-weekdays" aria-hidden="true">
            {WEEKDAY_LABELS.map((label, i) =>
              i === 1 || i === 3 || i === 5 ? <span key={i}>{label}</span> : <span key={i} />
            )}
          </div>

          <div
            className="heat-grid"
            role="grid"
            aria-label={`坚持日历，共 ${data.activeDays} 天有打卡`}
          >
            {data.weeks.map((week) =>
              week.days.map((day) => (
                <span
                  key={day.date}
                  className={`heat-cell lv-${day.level}${
                    day.date === today ? " is-today" : day.future ? " is-future" : ""
                  }`}
                  data-level={day.level}
                  title={`${day.date} · ${day.done}/${day.total}${day.level === 4 ? " 全勤" : ""}`}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <footer className="heat-foot">
        <p className="heat-summary">
          过去一年打卡 <b>{data.activeDays}</b> 天，其中全勤 <b>{data.fullDays}</b> 天
        </p>
        <div className="heat-legend" aria-hidden="true">
          <span>少</span>
          {[0, 1, 2, 3, 4].map((lv) => (
            <i key={lv} className={`heat-cell lv-${lv}`} />
          ))}
          <span>多</span>
        </div>
      </footer>
    </section>
  );
}
