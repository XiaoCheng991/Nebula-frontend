import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Supabase 客户端（浏览器端，仅 anon key + RLS 放行）。
 *
 * 凭证约定（与 about/page.tsx 一致）：
 *   - NEXT_PUBLIC_SUPABASE_URL：项目 URL，缺省回退到已硬编码的项目地址
 *   - NEXT_PUBLIC_SUPABASE_ANON_KEY：anon public key，必须在 .env.local 配置
 *
 * anon key 缺失时返回 null，调用方（habits.ts）自动降级为纯 localStorage，
 * 保证现有功能不受影响；配好 key 并重启 dev server 后自动启用远端同步。
 */

const supabaseUrl = (
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://vzxtwpfxuyqyjitoqgap.supabase.co"
).replace(/\/$/, "");
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase: SupabaseClient | null = supabaseKey
  ? createClient(supabaseUrl, supabaseKey)
  : null;

/** 打卡记录表（方案 A：固定 user_key，RLS 宽松放行） */
export const HABITS_TABLE = "habit_records";
export const HABITS_USER_KEY = "me";
