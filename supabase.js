import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config.js";

export { SUPABASE_URL };

const PLACEHOLDER_URL = "https://your-project-ref.supabase.co";

// vendor/supabase.js（UMD 版 supabase-js）会把自己挂到 window.supabase 上
if (!window.supabase?.createClient) {
  throw new Error("未找到 supabase-js，请确认 vendor/supabase.js 已随页面加载");
}

export const isConfigured =
  SUPABASE_URL !== PLACEHOLDER_URL && !SUPABASE_ANON_KEY.startsWith("your-");

// 未配置时不创建客户端，避免 createClient 因 URL 非法直接抛错
export const supabase = isConfigured
  ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  : null;

async function query(builder) {
  const { data, error } = await builder;
  if (error) throw error;
  return data ?? [];
}

export const fetchTimeline = () =>
  query(supabase.from("timeline").select("*").order("date", { ascending: false }));

export const fetchProjects = () =>
  query(supabase.from("projects").select("*").order("created_at", { ascending: false }));

export const fetchSkills = () =>
  query(supabase.from("skills").select("*").order("level", { ascending: false }));