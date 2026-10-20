import { useSyncExternalStore } from "react";
import { HABITS_TABLE, HABITS_USER_KEY, supabase } from "@/lib/supabase";

/**
 * 每日打卡 store（localStorage + Supabase 双写版）。
 *
 * 数据源：public/docs/打卡图.md。按语义分两类模块：
 *   - check：可打卡项（每周训练 / 英语学习），计入进度、 streak 与坚持日历
 *   - tips ：提醒备注（每日固定基础 / 饮食要点），只做展示，不计入完成度
 *
 * 模块内容可在页面内编辑（增删条目、增删模块、切换每日/按周），
 * 配置存 localStorage，日期归属 Asia/Shanghai（东八区），跨日自动切换。
 *
 * 打卡记录（records）双写：
 *   - 本地 localStorage 兜底 + 首帧即时渲染
 *   - Supabase habit_records 表（方案 A：固定 user_key + 宽松 RLS）
 * anon key 未配置时 supabase 为 null，自动降级为纯 localStorage。
 */

export const HABIT_STORAGE_KEY = "kyon:habits:checkin:v1";
export const HABIT_CONFIG_KEY = "kyon:habits:config:v1";

export type HabitBlockKind = "check" | "tips";
export type HabitBlockScope = "daily" | "weekday";

export interface HabitEntry {
  id: string;
  title: string;
}

/** 一天的模块内容。daily 模块只有一份，weekday 模块有 7 份（下标 0 = 周日）。 */
export interface HabitDay {
  title: string;
  hint?: string;
  items: HabitEntry[];
}

export interface HabitBlock {
  id: string;
  /** 模块名，如「每周训练日程」；按周模块的每天可另有自己的标题 */
  title: string;
  kind: HabitBlockKind;
  scope: HabitBlockScope;
  days: HabitDay[];
}

/** 渲染层消费的「某一天的某个模块」。 */
export interface HabitGroup {
  id: string;
  title: string;
  hint?: string;
  kind: HabitBlockKind;
  scope: HabitBlockScope;
  habits: Habit[];
}

export interface Habit {
  id: string;
  title: string;
}

export interface HabitSnapshot {
  /** YYYY-MM-DD（Asia/Shanghai） */
  date: string;
  /** "Mon" .. "Sun" */
  weekday: string;
  /** 周一 .. 周日 */
  weekdayLabel: string;
  checked: string[];
  done: number;
  total: number;
  streak: number;
}

const WEEK_CN = ["周日", "周一", "周二", "周三", "周四", "周五", "周六"];
const WEEKDAY_LABEL: Record<string, string> = {
  Mon: "周一",
  Tue: "周二",
  Wed: "周三",
  Thu: "周四",
  Fri: "周五",
  Sat: "周六",
  Sun: "周日",
};

/* === 默认模块（由 public/docs/打卡图.md 整理而来） === */

function daysDaily(title: string, hint: string | undefined, items: HabitEntry[]): HabitBlock["days"] {
  return [{ title, hint, items }];
}

const DEFAULT_BLOCKS: HabitBlock[] = [
  {
    id: "tips-basic",
    title: "每日固定基础",
    kind: "tips",
    scope: "daily",
    days: daysDaily("每日固定基础", "每天必做，做完打勾", [
      { id: "wake", title: "寅时醒（约5点）：精力好→面东冥想8~12分钟+吞津；疲惫→直接回笼补觉" },
      { id: "breakfast", title: "早餐：高蛋白+少量慢碳（蛋+燕麦/玉米/全麦），餐后慢走5~10分钟" },
      { id: "water", title: "饮水：温水1.8~2.2L，少量多次" },
      { id: "nap", title: "13:00左右小憩≤20分钟（定闹钟），不超30分钟" },
      { id: "meditate", title: "睡前冥想10分钟放松，尽量0点前上床" },
      { id: "screen", title: "21点后少看屏幕" },
      { id: "nosnack", title: "不吃夜宵、不喝含糖饮料" },
    ]),
  },
  {
    id: "training",
    title: "每周训练日程",
    kind: "check",
    scope: "weekday",
    days: [
      daysDaily("周日 · 完全休息", undefined, [{ id: "rest", title: "仅冥想，不运动" }])[0],
      daysDaily("周一 · 力量训练", "傍晚18:00–19:30，25分钟", [
        { id: "warmup", title: "热身3~5分钟（踏步/肩环绕/转髋）" },
        { id: "pushup", title: "跪姿或标准俯卧撑 40秒×2轮" },
        { id: "row", title: "反向划船 40秒×2轮" },
        { id: "squat", title: "徒手深蹲 40秒×2轮" },
        { id: "plank", title: "平板支撑 40秒×2轮" },
        { id: "stretch", title: "拉伸5分钟" },
      ])[0],
      daysDaily("周二 · 养生 + 有氧", undefined, [
        { id: "baduanjin", title: "八段锦 1遍（约12分钟）" },
        { id: "walk", title: "平地快走 30分钟" },
      ])[0],
      daysDaily("周三 · 力量训练", "同周一动作", [
        { id: "strength-full", title: "热身 → 俯卧撑/反向划船/深蹲/平板 ×2轮 → 拉伸" },
      ])[0],
      daysDaily("周四 · 静养日", undefined, [{ id: "stroll", title: "散步15~20分钟（可选）" }])[0],
      daysDaily("周五 · 力量训练", "同周一动作", [
        { id: "strength-full", title: "热身 → 俯卧撑/反向划船/深蹲/平板 ×2轮 → 拉伸" },
      ])[0],
      daysDaily("周六 · 养生 + 有氧", undefined, [
        { id: "baduanjin", title: "八段锦 1遍" },
        { id: "walk", title: "平地快走 30分钟" },
      ])[0],
    ],
  },
  {
    id: "english",
    title: "英语学习",
    kind: "check",
    scope: "daily",
    days: daysDaily("英语学习", "每日30分钟", [
      { id: "words", title: "单词新学+复习 10分钟（10~15个新词）" },
      { id: "listening", title: "听力/口语跟读 10分钟" },
      { id: "reading", title: "阅读或写作 10分钟" },
    ]),
  },
  {
    id: "tips-diet",
    title: "饮食要点",
    kind: "tips",
    scope: "daily",
    days: daysDaily("饮食要点", "减脂核心，仅作提醒", [
      { id: "calorie", title: "每日热量温和缺口（300~400大卡），7~8分饱" },
      { id: "protein", title: "蛋白质吃够：约130g/天（蛋/肉/鱼虾/豆腐）" },
      { id: "breakfast-low-carb", title: "早餐少精制碳水（拒白粥馒头包子）" },
      { id: "dinner", title: "晚餐减碳水，19:30前吃完" },
      { id: "avoid", title: "避开：奶茶、油炸、糕点、夜宵" },
    ]),
  },
];

/* === 日期工具：Asia / Shanghai === */

export function dateInShanghai(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Shanghai",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function weekdayInShanghai(d: Date = new Date()): string {
  return new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Shanghai", weekday: "short" }).format(d);
}

/** ISO 日期（YYYY-MM-DD）→ 0..6（0=周日）。UTC 正午取，免时区偏移。 */
export function utcDow(iso: string): number {
  return new Date(`${iso}T12:00:00Z`).getUTCDay();
}

function shiftIso(iso: string, days: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return dateInShanghai(d);
}

/* === 配置（可编辑模块） === */

function emptyDay(title: string): HabitDay {
  return { title, items: [] };
}

/** 容错：daily 只留 1 天，weekday 补齐 7 天；条目字段补齐。 */
function normalizeBlock(b: HabitBlock): HabitBlock {
  const days = Array.isArray(b?.days) ? b.days : [];
  const clean = (d: HabitDay | undefined, fallbackTitle: string): HabitDay => ({
    title: typeof d?.title === "string" ? d.title : fallbackTitle,
    hint: typeof d?.hint === "string" ? d.hint : undefined,
    items: (Array.isArray(d?.items) ? d.items : [])
      .filter((it) => it && typeof it.title === "string")
      .map((it) => ({ id: String(it.id), title: it.title })),
  });
  if (b.scope === "weekday") {
    return {
      ...b,
      days: Array.from({ length: 7 }, (_, i) => clean(days[i], WEEK_CN[i])),
    };
  }
  return { ...b, days: [clean(days[0], b.title)] };
}

export function normalizeConfig(blocks: unknown): HabitBlock[] {
  if (!Array.isArray(blocks)) return DEFAULT_BLOCKS.map(normalizeBlock);
  const out = blocks
    .filter((b): b is HabitBlock => !!b && typeof b === "object" && typeof (b as HabitBlock).id === "string")
    .map((b) =>
      normalizeBlock({
        id: b.id,
        title: typeof b.title === "string" ? b.title : "",
        kind: b.kind === "tips" ? "tips" : "check",
        scope: b.scope === "weekday" ? "weekday" : "daily",
        days: b.days,
      })
    );
  return out.length ? out : DEFAULT_BLOCKS.map(normalizeBlock);
}

/* 配置远端存放：复用 habit_records 的单行哨兵（habit_key = "__config__"），
 * 全量 JSON 存 title 列，done_on 用固定日期占位。records 的所有查询都 neq 掉该行，
 * 两者互不干扰；这样无需新建表、无需额外 RLS 策略。
 * 时间戳 at 用于「以新者覆盖」：换设备/换浏览器时不会再回退成默认清单。 */
const CONFIG_ROW_KEY = "__config__";
const CONFIG_ROW_DATE = "1970-01-01";

interface StoredConfig {
  at: number;
  blocks: HabitBlock[];
}

/** 本地配置最后修改时间（ms）；用于与远端 at 比较决定谁覆盖谁。0 = 未知（旧格式数据）。 */
let configUpdatedAt = 0;
/** 本地是否存过配置。false = 换浏览器首次访问（此时远端为准）。 */
let configFromLocal = false;

function loadConfig(): HabitBlock[] {
  if (typeof window === "undefined") return DEFAULT_BLOCKS.map(normalizeBlock);
  try {
    const raw = localStorage.getItem(HABIT_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const blocks = Array.isArray(parsed) ? parsed : parsed?.blocks;
      if (Array.isArray(blocks)) {
        configFromLocal = true;
        configUpdatedAt = Array.isArray(parsed) ? 0 : Number(parsed?.at) || 0;
        return normalizeConfig(blocks);
      }
    }
  } catch {
    // silent
  }
  configUpdatedAt = 0;
  return DEFAULT_BLOCKS.map(normalizeBlock);
}

/** 只写本地（离线兜底）。 */
function writeConfigLocal() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HABIT_CONFIG_KEY, JSON.stringify({ at: configUpdatedAt, blocks: config }));
  } catch {
    // silent
  }
}

function persistConfig() {
  writeConfigLocal();
  scheduleConfigSync();
  // 配置变了（条目文本/模块可能变）：重刷远端记录行内容
  scheduleRemoteSync();
}

export function getConfig(): HabitBlock[] {
  return config;
}

/** 保存页面内编辑结果：立即生效并通知所有订阅者。 */
export function saveConfig(blocks: HabitBlock[]) {
  config = normalizeConfig(blocks);
  configUpdatedAt = Date.now();
  persistConfig();
  rebuild();
  emit();
}

export function resetConfig() {
  config = DEFAULT_BLOCKS.map(normalizeBlock);
  configUpdatedAt = Date.now();
  persistConfig();
  rebuild();
  emit();
}

let idSeq = 0;
export function newEntryId(): string {
  idSeq += 1;
  return `e${Date.now().toString(36)}${idSeq}`;
}

export function newBlockId(): string {
  idSeq += 1;
  return `b${Date.now().toString(36)}${idSeq}`;
}

/* === 打卡记录 === */

type Records = Record<string, string[]>;

function load(): Records {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(HABIT_STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    const out: Records = {};
    for (const [date, ids] of Object.entries(parsed as Record<string, unknown>)) {
      if (Array.isArray(ids)) out[date] = ids.filter((v): v is string => typeof v === "string");
    }
    return out;
  } catch {
    return {};
  }
}

function persistLocal() {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(HABIT_STORAGE_KEY, JSON.stringify(records));
  } catch {
    // silent
  }
}

/* === Supabase 远端同步（方案 A：固定 user_key + 宽松 RLS） ===
 * 双写策略：
 *   - persist() 先写 localStorage（离线兜底、首帧即时渲染）
 *   - 异步把 records 全量 diff 到 habit_records 表（按日期删+插，幂等）
 *   - 初始化时 mergeRemote() 拉远端与本地并集合并
 * 任一步失败都静默，不影响本地功能。 */

let remoteInFlight = false;
let remoteTimer: ReturnType<typeof setTimeout> | null = null;

/** 某一天的可打卡条目 id → { title 条目文本, group 当日分组名 }（写远端时补内容）。 */
function habitMetaByDate(date: string): Map<string, { title: string; group: string }> {
  const map = new Map<string, { title: string; group: string }>();
  for (const g of groupsForDate(date)) {
    for (const h of g.habits) {
      map.set(h.id, { title: h.title, group: g.title });
    }
  }
  return map;
}

/**
 * 把某一天的勾选覆盖写入远端（先删后插，幂等）。
 * 每行同时写入条目文本 title 与所属模块 group_id，使库中记录自解释；
 * 已从清单删除的条目不再落库。
 */
async function writeDateRemote(date: string, ids: string[]) {
  if (!supabase) return;
  const { error: delError } = await supabase
    .from(HABITS_TABLE)
    .delete()
    .eq("user_key", HABITS_USER_KEY)
    .eq("done_on", date);
  if (delError) console.warn("[habits] 删除远端记录失败:", delError.message);
  if (ids.length === 0) return;
  const meta = habitMetaByDate(date);
  const rows = ids
    .filter((id) => meta.has(id))
    .map((id) => {
      const m = meta.get(id)!;
      return {
        user_key: HABITS_USER_KEY,
        habit_key: id,
        group_id: m.group,
        title: m.title,
        done_on: date,
      };
    });
  if (rows.length === 0) return;
  const { error: insError } = await supabase.from(HABITS_TABLE).insert(rows);
  if (insError) console.warn("[habits] 写入远端记录失败:", insError.message);
}

async function syncRemote() {
  if (!supabase || remoteInFlight) return;
  remoteInFlight = true;
  try {
    const { data, error } = await supabase
      .from(HABITS_TABLE)
      .select("done_on, habit_key")
      .eq("user_key", HABITS_USER_KEY)
      .neq("habit_key", CONFIG_ROW_KEY);
    if (error) {
      console.warn("[habits] 读取远端记录失败:", error.message);
      return;
    }
    const remoteDates = new Set<string>();
    for (const r of data ?? []) remoteDates.add(r.done_on as string);

    const localDates = new Set(Object.keys(records));
    // 1) 本地有记录的日期：删掉远端该日期全部行，再插入本地该日期的勾（幂等）
    for (const [date, ids] of Object.entries(records)) {
      await writeDateRemote(date, ids);
    }
    // 2) 远端有、本地没有的日期（其他设备/旧数据）：删除避免脏数据残留
    const staleDates = [...remoteDates].filter((d) => !localDates.has(d));
    if (staleDates.length > 0) {
      await supabase
        .from(HABITS_TABLE)
        .delete()
        .eq("user_key", HABITS_USER_KEY)
        .in("done_on", staleDates);
    }
  } catch (e) {
    // 网络/权限失败不影响本地功能，但需留痕便于排查
    console.warn("[habits] 同步打卡记录失败:", e);
  } finally {
    remoteInFlight = false;
  }
}

function scheduleRemoteSync() {
  if (!supabase) return;
  if (remoteTimer) clearTimeout(remoteTimer);
  remoteTimer = setTimeout(() => void syncRemote(), 400);
}

/** 初始化/重连时拉远端记录，与本地并集合并后通知订阅者。 */
async function mergeRemote() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from(HABITS_TABLE)
      .select("done_on, habit_key")
      .eq("user_key", HABITS_USER_KEY)
      .neq("habit_key", CONFIG_ROW_KEY);
    if (error) return;
    const remote: Records = {};
    const remoteDates = new Set<string>();
    for (const r of data ?? []) {
      const date = r.done_on as string;
      const key = r.habit_key as string;
      (remote[date] ??= []).push(key);
      remoteDates.add(date);
    }
    let changed = false;
    const merged: Records = { ...records };
    for (const [date, ids] of Object.entries(remote)) {
      const cur = merged[date] ?? [];
      const next = [...new Set([...cur, ...ids])];
      if (next.length !== cur.length) {
        merged[date] = next;
        changed = true;
      }
    }
    if (changed) {
      records = merged;
      persistLocal();
      rebuild();
      emit();
    }
    // 本地已有但远端缺失的日期：补推上库（老数据首次入库走这条）
    const missing = Object.keys(records).filter((d) => !remoteDates.has(d));
    for (const date of missing) {
      await writeDateRemote(date, records[date] ?? []);
    }
  } catch (e) {
    console.warn("[habits] 合并远端记录失败:", e);
  }
}

/* === 配置远端同步（复用 habit_records 哨兵行，免建新表） === */

let configInFlight = false;
let configTimer: ReturnType<typeof setTimeout> | null = null;

async function syncConfigRemote() {
  if (!supabase || configInFlight) return;
  configInFlight = true;
  try {
    // 单行覆盖：先删后插（habit_records 无唯一约束，upsert 不可用）
    await supabase
      .from(HABITS_TABLE)
      .delete()
      .eq("user_key", HABITS_USER_KEY)
      .eq("habit_key", CONFIG_ROW_KEY);
    await supabase.from(HABITS_TABLE).insert({
      user_key: HABITS_USER_KEY,
      habit_key: CONFIG_ROW_KEY,
      done_on: CONFIG_ROW_DATE,
      title: JSON.stringify({ at: configUpdatedAt || Date.now(), blocks: config }),
    });
  } catch (e) {
    console.warn("[habits] 同步打卡配置失败:", e);
  } finally {
    configInFlight = false;
  }
}

function scheduleConfigSync() {
  if (!supabase) return;
  if (configTimer) clearTimeout(configTimer);
  configTimer = setTimeout(() => void syncConfigRemote(), 400);
}

/** 初始化拉远端配置：仅当远端比本地新才覆盖，否则把本地推上去。 */
async function mergeConfigRemote() {
  if (!supabase) return;
  try {
    const { data, error } = await supabase
      .from(HABITS_TABLE)
      .select("title")
      .eq("user_key", HABITS_USER_KEY)
      .eq("habit_key", CONFIG_ROW_KEY)
      .order("created_at", { ascending: false })
      .limit(1);
    if (error) {
      console.warn("[habits] 读取远端配置失败:", error.message);
      return;
    }
    const stored = data?.length ? (JSON.parse(data[0].title) as StoredConfig) : null;
    const remoteBlocks = Array.isArray(stored?.blocks) ? stored!.blocks : null;
    const remoteAt = Number(stored?.at) || 0;

    // 1) 远端还没有配置：把本地（含默认清单）推上去
    if (!remoteBlocks) {
      if (!configUpdatedAt) configUpdatedAt = Date.now();
      writeConfigLocal();
      scheduleConfigSync();
      return;
    }
    // 2) 本地没有任何配置（换浏览器首次访问）：以远端为准
    if (!configFromLocal) {
      config = normalizeConfig(remoteBlocks);
      configUpdatedAt = remoteAt;
      writeConfigLocal();
      rebuild();
      emit();
      return;
    }
    // 3) 本地是旧格式（无时间戳，可能是用户已编辑但从未同步）：以本地为准
    if (!configUpdatedAt) {
      configUpdatedAt = Date.now();
      writeConfigLocal();
      scheduleConfigSync();
      return;
    }
    // 4) 比时间戳：新的赢
    if (remoteAt > configUpdatedAt) {
      config = normalizeConfig(remoteBlocks);
      configUpdatedAt = remoteAt;
      writeConfigLocal();
      rebuild();
      emit();
      return;
    }
    // 本地更新：推上去
    scheduleConfigSync();
  } catch (e) {
    console.warn("[habits] 合并远端配置失败:", e);
  }
}

function persist() {
  if (typeof window === "undefined") return;
  persistLocal();
  scheduleRemoteSync();
}

/* === 派生：某天的模块与条目 === */

function blockDay(block: HabitBlock, iso: string): HabitDay {
  const d = block.scope === "weekday" ? block.days[utcDow(iso)] : block.days[0];
  return d ?? emptyDay(block.title);
}

export function groupsForDate(iso: string, cfg: HabitBlock[] = config): HabitGroup[] {
  return cfg.map((b) => {
    const d = blockDay(b, iso);
    return {
      id: b.id,
      title: d.title || b.title,
      hint: d.hint,
      kind: b.kind,
      scope: b.scope,
      habits: d.items.map((it) => ({ id: it.id, title: it.title })),
    };
  });
}

/** 当日可打卡条目 id（仅 check 模块；tips 不计入完成度） */
export function habitIdsForDate(iso: string, cfg: HabitBlock[] = config): string[] {
  return groupsForDate(iso, cfg)
    .filter((g) => g.kind === "check")
    .flatMap((g) => g.habits.map((h) => h.id));
}

/* === 状态 === */

let config: HabitBlock[] = loadConfig();
let records: Records = load();
let snapshot: HabitSnapshot = buildSnapshot(records, config);
const listeners = new Set<() => void>();

// 客户端初始化：拉远端记录与本地并集合并（anon key 未配置时自动跳过）
if (typeof window !== "undefined") {
  void mergeRemote();
  void mergeConfigRemote();
}

function emit() {
  listeners.forEach((l) => l());
}

function buildSnapshot(recs: Records, cfg: HabitBlock[]): HabitSnapshot {
  const date = dateInShanghai();
  const ids = habitIdsForDate(date, cfg);
  const idSet = new Set(ids);
  const checked = (recs[date] ?? []).filter((id) => idSet.has(id));
  const done = checked.length;
  const total = ids.length;

  // 连续全勤日：今日已完成则从今日往前数，否则从昨日往前数（今日未完不断签）。
  let streak = 0;
  let cursor = done === total && total > 0 ? date : shiftIso(date, -1);
  for (;;) {
    const dayIds = habitIdsForDate(cursor, cfg);
    const dayChecked = recs[cursor] ?? [];
    if (dayIds.length === 0 || !dayIds.every((id) => dayChecked.includes(id))) break;
    streak += 1;
    cursor = shiftIso(cursor, -1);
  }

  return {
    date,
    weekday: weekdayInShanghai(),
    weekdayLabel: WEEKDAY_LABEL[weekdayInShanghai()] ?? "",
    checked,
    done,
    total,
    streak,
  };
}

function rebuild() {
  snapshot = buildSnapshot(records, config);
}

export function toggleHabit(id: string) {
  const date = snapshot.date;
  const current = records[date] ?? [];
  records = {
    ...records,
    [date]: current.includes(id) ? current.filter((v) => v !== id) : [...current, id],
  };
  persist();
  rebuild();
  emit();
}

/** 跨日检测：日期变了就重建快照并通知，返回是否有变化。 */
export function refreshIfNewDay(): boolean {
  const today = dateInShanghai();
  if (today === snapshot.date) return false;
  rebuild();
  emit();
  return true;
}

export function getHabitSnapshot(): HabitSnapshot {
  return snapshot;
}

/**
 *  hydration 用的服务端快照：空记录 + 默认模块，让 SSR HTML 与客户端首帧一致。
 * 必须缓存——React 用 Object.is 比对快照，每次新建对象会触发 infinite loop 警告。
 *
 * 注意：若客户端已有勾选记录，首帧数据会与 SSR 不同。useSyncExternalStore 只在
 * hydration 阶段用 serverSnapshot 比对；此处返回空态可保证首帧 DOM 一致，
 * hydration 完成后 store 会立刻用真实快照重渲染（视觉上无闪烁，因为通常已完成）。
 */
const SERVER_SNAPSHOT: HabitSnapshot = buildSnapshot({}, DEFAULT_BLOCKS);

export function getHabitServerSnapshot(): HabitSnapshot {
  return SERVER_SNAPSHOT;
}

export function subscribeHabits(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function useHabits(): HabitSnapshot {
  return useSyncExternalStore(subscribeHabits, getHabitSnapshot, getHabitServerSnapshot);
}

/* === 坚持日历（GitHub 式 contribution 图） === */

export interface HeatmapDay {
  date: string;
  done: number;
  total: number;
  /** 0=未打卡，1..3=部分完成，4=全勤 */
  level: number;
  /** 本周内还没到的日期 */
  future: boolean;
}

export interface HeatmapWeek {
  days: HeatmapDay[];
}

export interface HeatmapData {
  weeks: HeatmapWeek[];
  activeDays: number;
  fullDays: number;
  start: string;
  end: string;
}

export const HEATMAP_WEEKS = 53;

function levelOf(done: number, total: number): number {
  if (done <= 0) return 0;
  const ratio = total > 0 ? done / total : 0;
  if (ratio >= 1) return 4;
  return Math.min(3, Math.max(1, Math.ceil(ratio * 3)));
}

/**
 * 生成坚持日历数据：以「本周六」为终点往前推 weeks 周，周日对齐分列。
 */
export function getHeatmap(weeks: number = HEATMAP_WEEKS): HeatmapData {
  const today = dateInShanghai();
  const endSaturday = shiftIso(today, 6 - utcDow(today));
  const startSunday = shiftIso(endSaturday, -7 * (weeks - 1));

  const weeksOut: HeatmapWeek[] = [];
  let activeDays = 0;
  let fullDays = 0;

  for (let w = 0; w < weeks; w += 1) {
    const days: HeatmapDay[] = [];
    for (let d = 0; d < 7; d += 1) {
      const date = shiftIso(startSunday, w * 7 + d);
      const total = habitIdsForDate(date).length;
      const idSet = new Set(habitIdsForDate(date));
      const done = (records[date] ?? []).filter((id) => idSet.has(id)).length;
      const level = levelOf(done, total);
      if (done > 0) activeDays += 1;
      if (total > 0 && done === total) fullDays += 1;
      days.push({ date, done, total, level, future: date > today });
    }
    weeksOut.push({ days });
  }

  return { weeks: weeksOut, activeDays, fullDays, start: startSunday, end: endSaturday };
}
