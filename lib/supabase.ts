import { createClient } from "@supabase/supabase-js";

const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Project type ──────────────────────────────────────────────────────────────
export type ProjectType  = "Residential" | "Commercial" | "Mixed-Use" | "Hospitality" | "Cultural";
export type AccessType   = "public" | "password" | "otp";

export interface BlogSection {
  title: string;
  body: string;
  highlight_phrases?: string;
}

export interface SiteUpdate {
  media_url: string;
  media_type: "image" | "video" | "youtube";
  thumbnail_url?: string;
  caption?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  long_description: string;
  image_url: string;
  image_url_dark: string;
  image_url_light: string;
  stream_url: string;
  type: ProjectType;
  location: string;
  year: string;
  featured: boolean;
  is_active: boolean;
  sort_order: number;
  access_type: AccessType;
  access_password: string;
  status: "draft" | "published" | "discarded";
  narrative_sections: BlogSection[];
  gallery_updates: SiteUpdate[];
  story?: string;
  has_live_updates?: boolean;
  created_at?: string;
}

export interface ProjectAuth {
  id: string;
  project_id: string;
  email?: string;
  code?: string;
  token?: string;
  expires_at?: string;
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

export async function getActiveProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });
  if (error) console.error("getActiveProjects:", error.message);
  return data ?? [];
}

export async function getProjectByToken(token: string): Promise<{ project: Project | null; auth: ProjectAuth | null }> {
  const { data: auth } = await supabase
    .from("project_auth")
    .select("*")
    .eq("token", token)
    .single();

  if (!auth) return { project: null, auth: null };

  if (auth.expires_at && new Date(auth.expires_at) < new Date()) {
    return { project: null, auth: null };
  }

  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", auth.project_id)
    .single();

  return { project: project ?? null, auth };
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

// ── Access Control (Auth) ──────────────────────────────────────────────────
export async function createOtp(projectId: string, email: string): Promise<{ code: string; error: string|null }> {
  const code = Math.floor(100000 + Math.random() * 900000).toString();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString();
  const { error } = await supabase.from("project_auth").insert([{
    project_id: projectId, email, code, expires_at: expiresAt,
  }]);
  return { code, error: error?.message ?? null };
}

export async function verifyOtp(projectIdOrToken: string, code: string): Promise<{ valid: boolean }> {
  // Try finding by token first (legacy/link) then projectId
  const { data } = await supabase
    .from("project_auth")
    .select("*")
    .or(`token.eq.${projectIdOrToken},project_id.eq.${projectIdOrToken}`)
    .eq("code", code)
    .eq("used", false)
    .gte("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .single();

  if (!data) return { valid: false };
  await supabase.from("project_auth").update({ used: true }).eq("id", data.id);
  return { valid: true };
}

export async function getProjectToken(projectId: string): Promise<string> {
  // Get existing or create a permanent one
  const { data } = await supabase
    .from("project_auth")
    .select("token")
    .eq("project_id", projectId)
    .is("email", null) // permanent share link
    .limit(1)
    .single();

  if (data?.token) return data.token;

  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
  await supabase.from("project_auth").insert([{ project_id: projectId, token }]);
  return token;
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

// ── Consolidated Content (JSONB) ──────────────────────────────────────────────

export async function getProjectBlog(projectId: string): Promise<Project | null> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .single();
  if (error) return null;
  return data;
}

export async function updateProjectBlogOverview(projectId: string, patch: Partial<Project>) {
  return updateProject(projectId, patch);
}

export async function upsertBlogSection(projectId: string, sections: BlogSection[]) {
  return updateProject(projectId, { narrative_sections: sections });
}

export async function addSiteUpdate(
  projectId: string,
  file: File,
  existingGallery: SiteUpdate[]
) {
  const slug = projectId.slice(0, 8);
  const ext = file.name.split(".").pop();
  const path = `${slug}-${Date.now()}.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("site-updates")
    .upload(path, file, { cacheControl: "3600", upsert: false });

  if (uploadErr) return { error: uploadErr };

  const { data: urlData } = supabase.storage.from("site-updates").getPublicUrl(path);
  const mediaType = file.type.includes("video") || ext === "mp4" ? "video" : "image";

  const newUpdate: SiteUpdate = {
    media_url: urlData.publicUrl,
    media_type: mediaType as any,
    caption: ""
  };

  const { error: updateErr } = await updateProject(projectId, {
    gallery_updates: [...existingGallery, newUpdate]
  });

  return { error: updateErr, url: urlData.publicUrl };
}

export async function setSiteUpdateThumbnail(projectId: string, index: number, file: File, existingGallery: SiteUpdate[]) {
  const ext = file.name.split('.').pop()?.toLowerCase();
  const path = `${projectId}/${Date.now()}_thumb.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("site-updates")
    .upload(path, file, { cacheControl: "3600", upsert: true });

  if (uploadErr) return { error: uploadErr };

  const { data: urlData } = supabase.storage.from("site-updates").getPublicUrl(path);

  const updatedGallery = [...existingGallery];
  updatedGallery[index] = { ...updatedGallery[index], thumbnail_url: urlData.publicUrl };

  const { error: updateErr } = await updateProject(projectId, {
    gallery_updates: updatedGallery
  });

  return { error: updateErr, url: urlData.publicUrl };
}

export async function addYoutubeToGallery(projectId: string, url: string, existingGallery: SiteUpdate[]) {
  // Try to normalize standard Youtube URLs to embeds or just save them raw
  let cleanUrl = url.trim();
  
  const newUpdate: SiteUpdate = {
    media_url: cleanUrl,
    media_type: "youtube",
    caption: ""
  };

  const { error: updateErr } = await updateProject(projectId, {
    gallery_updates: [...existingGallery, newUpdate]
  });

  return { error: updateErr };
}

export async function deleteSiteUpdate(projectId: string, mediaUrl: string, existingGallery: SiteUpdate[]) {
  const urlParts = mediaUrl.split("/site-updates/");
  if (urlParts[1]) {
    await supabase.storage.from("site-updates").remove([urlParts[1]]);
  }
  const filtered = existingGallery.filter(u => u.media_url !== mediaUrl);
  return updateProject(projectId, { gallery_updates: filtered });
}
