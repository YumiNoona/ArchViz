import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Visitor insert ────────────────────────────────────────
export interface VisitorEntry {
  name: string; email: string; contact: string;
  project: string; project_id: string;
}

export async function saveVisitor(data: VisitorEntry) {
  const { error } = await supabase.from("visitors").insert([{
    ...data, timestamp: new Date().toISOString(),
  }]);
  return { error: error?.message ?? null };
}

// ── Admin auth ────────────────────────────────────────────
export async function signInAdmin(email: string, password: string) {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  return { error };
}

export async function signOutAdmin() {
  await supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Dashboard data ────────────────────────────────────────
export async function getVisitors() {
  const { data, error } = await supabase
    .from("visitors")
    .select("*")
    .order("timestamp", { ascending: false });
  return { data: data ?? [], error };
}

export async function getVisitorStats() {
  const { data } = await supabase.from("visitors").select("project, project_id, timestamp, email");
  if (!data) return { total: 0, unique: 0, byProject: [], recent7: 0 };

  const total   = data.length;
  const unique  = new Set(data.map(v => v.email)).size;
  const recent7 = data.filter(v => {
    const d = new Date(v.timestamp);
    return (Date.now() - d.getTime()) < 7 * 24 * 60 * 60 * 1000;
  }).length;

  const byProject = Object.entries(
    data.reduce((acc: Record<string, number>, v) => {
      acc[v.project] = (acc[v.project] ?? 0) + 1;
      return acc;
    }, {})
  )
    .map(([project, count]) => ({ project, count }))
    .sort((a, b) => b.count - a.count);

  return { total, unique, byProject, recent7 };
}
