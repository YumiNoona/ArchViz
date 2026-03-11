import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Project type ──────────────────────────────────────────────────────────────
export type ProjectType  = "Residential" | "Commercial" | "Mixed-Use" | "Hospitality" | "Cultural";
export type AccessType   = "public" | "password" | "otp";

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  image_url: string;
  image_url_dark: string;     // optional dark-mode thumbnail
  image_url_light: string;    // optional light-mode thumbnail
  stream_url: string;
  type: ProjectType;
  location: string;
  year: string;
  featured: boolean;
  sort_order: number;
  access_type: AccessType;
  access_password: string;
  created_at?: string;
}

export interface ProjectLink {
  id: string;
  project_id: string;
  token: string;
  client_name: string;
  client_email: string;
  note: string;
  expires_at: string | null;
  created_at: string;
}

export interface OtpCode {
  id: string;
  link_token: string;
  code: string;
  email: string;
  expires_at: string;
  used: boolean;
}

// ── Projects CRUD ─────────────────────────────────────────────────────────────
export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("sort_order", { ascending: true });
  if (error) console.error("getProjects:", error.message);
  return data ?? [];
}

export async function getProjectByToken(token: string): Promise<{ project: Project | null; link: ProjectLink | null }> {
  const { data: link } = await supabase
    .from("project_links")
    .select("*")
    .eq("token", token)
    .single();

  if (!link) return { project: null, link: null };

  // Check expiry
  if (link.expires_at && new Date(link.expires_at) < new Date()) {
    return { project: null, link: null };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", link.project_id)
    .single();

  return { project: project ?? null, link };
}

export async function createProject(
  fields: Omit<Project, "id" | "created_at" | "image_url" | "image_url_dark" | "image_url_light">,
  imageFile: File,
  imageDarkFile?: File | null,
  imageLightFile?: File | null,
): Promise<{ error: string | null }> {
  const uploadImage = async (file: File, suffix = "") => {
    const ext  = file.name.split(".").pop() ?? "jpg";
    const path = `${fields.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Date.now()}${suffix}.${ext}`;
    const { error } = await supabase.storage.from("project-images").upload(path, file, { upsert: false, contentType: file.type });
    if (error) return { url: "", error: error.message };
    const { data } = supabase.storage.from("project-images").getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  };

  const main = await uploadImage(imageFile);
  if (main.error) return { error: main.error };

  let darkUrl  = "";
  let lightUrl = "";
  if (imageDarkFile)  { const r = await uploadImage(imageDarkFile,  "-dark");  if (!r.error) darkUrl  = r.url; }
  if (imageLightFile) { const r = await uploadImage(imageLightFile, "-light"); if (!r.error) lightUrl = r.url; }

  const { error: insertErr } = await supabase.from("projects").insert([{
    ...fields,
    image_url:       main.url,
    image_url_dark:  darkUrl,
    image_url_light: lightUrl,
  }]);
  return { error: insertErr?.message ?? null };
}

export async function updateProject(id: string, patch: Partial<Project>): Promise<{ error: string | null }> {
  const { error } = await supabase.from("projects").update(patch).eq("id", id);
  return { error: error?.message ?? null };
}

export async function deleteProject(id: string): Promise<{ error: string | null }> {
  const { data } = await supabase.from("projects").select("image_url,image_url_dark,image_url_light").eq("id", id).single();
  if (data) {
    const toRemove = [data.image_url, data.image_url_dark, data.image_url_light]
      .filter(Boolean)
      .map(url => { try { const u = new URL(url); const p = u.pathname.split("/project-images/"); return p.length===2 ? p[1] : null; } catch { return null; } })
      .filter(Boolean) as string[];
    if (toRemove.length) await supabase.storage.from("project-images").remove(toRemove);
  }
  const { error } = await supabase.from("projects").delete().eq("id", id);
  return { error: error?.message ?? null };
}

export async function updateProjectOrder(ids: string[]): Promise<void> {
  await Promise.all(ids.map((id, i) => supabase.from("projects").update({ sort_order: i }).eq("id", id)));
}

// ── Private links ─────────────────────────────────────────────────────────────
export async function getLinksForProject(projectId: string): Promise<ProjectLink[]> {
  const { data } = await supabase
    .from("project_links")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });
  return data ?? [];
}

export async function createLink(link: {
  project_id: string;
  client_name: string;
  client_email: string;
  note?: string;
  expires_at?: string | null;
}): Promise<{ data: ProjectLink | null; error: string | null }> {
  const { data, error } = await supabase
    .from("project_links")
    .insert([link])
    .select()
    .single();
  return { data: data ?? null, error: error?.message ?? null };
}

export async function deleteLink(id: string): Promise<void> {
  await supabase.from("project_links").delete().eq("id", id);
}

// ── OTP ───────────────────────────────────────────────────────────────────────
export async function createOtp(linkToken: string, email: string): Promise<{ code: string; error: string | null }> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { error } = await supabase.from("otp_codes").insert([{
    link_token: linkToken, code, email, expires_at: expiresAt,
  }]);
  return { code, error: error?.message ?? null };
}

export async function verifyOtp(linkToken: string, code: string): Promise<{ valid: boolean }> {
  const { data } = await supabase
    .from("otp_codes")
    .select("*")
    .eq("link_token", linkToken)
    .eq("code", code)
    .eq("used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return { valid: false };
  await supabase.from("otp_codes").update({ used: true }).eq("id", data.id);
  return { valid: true };
}

// ── Visitors ──────────────────────────────────────────────────────────────────
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

export async function getVisitors() {
  const { data, error } = await supabase
    .from("visitors").select("*").order("timestamp", { ascending: false });
  return { data: data ?? [], error };
}

export async function getVisitorStats() {
  const { data } = await supabase.from("visitors").select("project,project_id,timestamp,email");
  if (!data) return { total: 0, unique: 0, byProject: [], recent7: 0 };
  const total   = data.length;
  const unique  = new Set(data.map((v: { email: string }) => v.email)).size;
  const recent7 = data.filter((v: { timestamp: string }) =>
    (Date.now() - new Date(v.timestamp).getTime()) < 7 * 24 * 60 * 60 * 1000
  ).length;
  const byProject = Object.entries(
    data.reduce((acc: Record<string, number>, v: { project: string }) => {
      acc[v.project] = (acc[v.project] ?? 0) + 1; return acc;
    }, {})
  ).map(([project, count]) => ({ project, count: count as number }))
   .sort((a, b) => b.count - a.count);
  return { total, unique, byProject, recent7 };
}
