"use client";

/**
 * AdminBlogTab.tsx
 *
 * Plug this in as Tab 5 inside your existing admin/page.tsx.
 * It lets admins:
 *  - Edit the story, current_status, completion_percent per project
 *  - Add/edit/delete "About" and "Challenge" blog sections
 *  - Manage construction phases with status + progress
 *  - Upload site update images/videos (real-time updates section)
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { haptic } from "ios-haptics";
import {
  ChevronDown,
  Plus,
  Trash2,
  Save,
  Upload,
  Image as ImageIcon,
  Video,
  Construction,
  BookOpen,
  Layers,
  CheckCircle2,
  Circle,
  Clock,
  AlertCircle,
  Loader2,
  Activity,
} from "lucide-react";
import {
  getProjectBlog,
  updateProjectBlogOverview,
  upsertBlogSection,
  deleteBlogSection,
  upsertConstructionPhase,
  deleteConstructionPhase,
  addSiteUpdate,
  deleteSiteUpdate,
  type BlogSection,
  type ConstructionPhase,
  type SiteUpdate,
} from "@/lib/supabase";
import { getProjects } from "@/lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Project { id: string; title: string; image_url: string; type: string; }

// ─── Small UI Helpers ─────────────────────────────────────────────────────────

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm font-sans focus:outline-none focus:ring-1 focus:ring-vastu-green/20 focus:border-vastu-green/50 transition-all" {...props} />;
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm font-sans focus:outline-none focus:ring-1 focus:ring-vastu-green/20 focus:border-vastu-green/50 transition-all resize-none" rows={3} {...props} />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-foreground text-sm font-sans focus:outline-none focus:ring-1 focus:ring-vastu-green/20 focus:border-vastu-green/50 transition-all appearance-none cursor-pointer" {...props}>
      {children}
    </select>
  );
}

function SaveBtn({ loading, onClick }: { loading?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={() => { haptic(); onClick(); }}
      disabled={loading}
      className="btn-vercel h-10 px-6 text-sm flex items-center gap-2"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      Save Changes
    </button>
  );
}

// ─── Phase status icon ────────────────────────────────────────────────────────

function PhaseIcon({ status }: { status: string }) {
  if (status === "complete") return <CheckCircle2 size={14} className="text-vastu-green" />;
  if (status === "active") return <Circle size={14} className="text-vastu-green animate-pulse" />;
  return <Clock size={14} className="text-muted-foreground" />;
}

// ─── Main Admin Blog Tab ──────────────────────────────────────────────────────

export default function AdminBlogTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string>("");
  const [blog, setBlog] = useState<Awaited<ReturnType<typeof getProjectBlog>> | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Overview form state
  const [story, setStory] = useState("");
  const [currentStatus, setCurrentStatus] = useState("");
  const [completionPercent, setCompletionPercent] = useState(0);
  const [hasLiveUpdates, setHasLiveUpdates] = useState(false);

  // Upload state
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploadCaption, setUploadCaption] = useState("");
  const [uploadDate, setUploadDate] = useState("");
  const [uploading, setUploading] = useState(false);

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3000);
    if (ok) haptic.confirm(); else haptic.error();
  }

  // Load projects list
  useEffect(() => {
    getProjects().then((ps) => {
      setProjects(ps as Project[]);
      if (ps.length > 0) setSelectedId(ps[0].id);
    });
  }, []);

  // Load blog data when project changes
  useEffect(() => {
    if (!selectedId) return;
    setLoading(true);
    getProjectBlog(selectedId).then((b) => {
      setBlog(b);
      if (b) {
        setStory(b.story ?? "");
        setCurrentStatus(b.current_status ?? "");
        setCompletionPercent(b.completion_percent ?? 0);
        setHasLiveUpdates(b.has_live_updates ?? false);
      }
      setLoading(false);
    });
  }, [selectedId]);

  // ── Save overview ──────────────────────────────────────────
  async function saveOverview() {
    setSaving("overview");
    const { error } = await updateProjectBlogOverview(selectedId, {
      story, current_status: currentStatus, completion_percent: completionPercent, has_live_updates: hasLiveUpdates
    });
    setSaving(null);
    showToast(error ? "Save failed" : "Saved!", !error);
    if (!error) setBlog((b) => b ? { ...b, story, current_status: currentStatus, completion_percent: completionPercent, has_live_updates: hasLiveUpdates } : b);
  }

  // ── Add blog section ───────────────────────────────────────
  async function addSection(type: "challenge" | "about") {
    const newSection: BlogSection = {
      section_type: type,
      sort_order: (blog?.blog_sections.filter((s) => s.section_type === type).length ?? 0),
      title: "New Section",
      body: "Describe this section here.",
    };
    const { error } = await upsertBlogSection(selectedId, newSection);
    if (!error) {
      showToast("Section added");
      const updated = await getProjectBlog(selectedId);
      setBlog(updated);
    }
  }

  async function saveSection(section: BlogSection) {
    setSaving(`section-${section.id}`);
    const { error } = await upsertBlogSection(selectedId, section);
    setSaving(null);
    showToast(error ? "Failed" : "Saved!", !error);
  }

  async function removeSection(id: string) {
    await deleteBlogSection(id);
    showToast("Deleted", true);
    setBlog((b) => b ? { ...b, blog_sections: b.blog_sections.filter((s) => s.id !== id) } : b);
  }

  // ── Construction phases ────────────────────────────────────
  async function addPhase() {
    const newPhase: ConstructionPhase = {
      sort_order: blog?.construction_phases.length ?? 0,
      label: "New Phase",
      status: "upcoming",
    };
    await upsertConstructionPhase(selectedId, newPhase);
    showToast("Phase added");
    const updated = await getProjectBlog(selectedId);
    setBlog(updated);
  }

  async function savePhase(phase: ConstructionPhase) {
    setSaving(`phase-${phase.id}`);
    await upsertConstructionPhase(selectedId, phase);
    setSaving(null);
    showToast("Saved!");
  }

  async function removePhase(id: string) {
    await deleteConstructionPhase(id);
    showToast("Deleted", true);
    setBlog((b) => b ? { ...b, construction_phases: b.construction_phases.filter((p) => p.id !== id) } : b);
  }

  // ── Upload site update ─────────────────────────────────────
  async function handleUpload() {
    const file = fileRef.current?.files?.[0];
    if (!file) return;
    setUploading(true);
    const { error } = await addSiteUpdate(selectedId, file, {
      caption: uploadCaption,
      update_date: uploadDate,
      sort_order: blog?.site_updates.length ?? 0,
    });
    setUploading(false);
    if (error) { showToast("Upload failed", false); return; }
    showToast("Uploaded!");
    setUploadCaption(""); setUploadDate("");
    if (fileRef.current) fileRef.current.value = "";
    haptic.confirm();
    const updated = await getProjectBlog(selectedId);
    setBlog(updated);
  }

  async function removeUpdate(update: SiteUpdate) {
    if (!update.id) return;
    await deleteSiteUpdate(update.id, update.media_url);
    showToast("Deleted", true);
    setBlog((b) => b ? { ...b, site_updates: b.site_updates.filter((u) => u.id !== update.id) } : b);
  }

  // ─────────────────────────────────────────────────────────────────────────

  if (projects.length === 0) {
    return <div className="flex items-center justify-center py-20 text-[var(--vc-muted)] font-sans text-sm">No projects found.</div>;
  }

  return (
    <div className="space-y-8 pb-16">
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl font-sans text-sm font-semibold shadow-xl
              ${toast.ok ? "bg-[var(--vc-gold)] text-black" : "bg-red-500 text-white"}`}
          >
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project selector */}
      <div className="flex flex-col md:flex-row md:items-center gap-4 justify-between">
        <div className="flex items-center gap-3">
          <BookOpen size={18} className="text-vastu-green" />
          <h2 className="text-xl font-medium tracking-tight">Project Blog & Updates</h2>
        </div>
        <div className="w-full md:w-64">
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id} className="bg-background">{p.title}</option>)}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-[var(--vc-gold)]" /></div>
      ) : (
        <>
          {/* ── Section A: Overview ── */}
          <section className="bevel-card p-6 bg-secondary/30 space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border text-vastu-green">
                <Construction size={18} />
              </div>
              <h3 className="text-lg font-medium tracking-tight">Build Overview</h3>
            </div>

            <Field label="Project Story">
              <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={6} placeholder="Write the story of this project..." />
            </Field>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Field label="Current Status">
                <Input value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)} placeholder="e.g. Structure 72% complete." />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Completion %">
                  <Input type="number" min={0} max={100} value={completionPercent} onChange={(e) => setCompletionPercent(Number(e.target.value))} />
                </Field>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Live Updates</label>
                  <button
                    onClick={() => { haptic(); setHasLiveUpdates(!hasLiveUpdates); }}
                    className={`flex items-center justify-center gap-2 h-10 w-full rounded-xl border transition-all ${hasLiveUpdates ? "border-vastu-green/40 bg-vastu-green/10 text-vastu-green" : "border-border bg-secondary/30 text-muted-foreground"}`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${hasLiveUpdates ? "bg-vastu-green animate-pulse" : "bg-muted-foreground/30"}`} />
                    <span className="text-xs font-semibold">{hasLiveUpdates ? "Active" : "Disabled"}</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t border-border/50">
              <SaveBtn loading={saving === "overview"} onClick={saveOverview} />
            </div>
          </section>

          {/* ── Section B: About & Challenge Blog Sections ── */}
          {(["about", "challenge"] as const).map((type) => {
            const sections = blog?.blog_sections.filter((s) => s.section_type === type) ?? [];
            return (
              <section key={type} className="bevel-card p-6 bg-secondary/20 space-y-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border text-vastu-green">
                      <Layers size={18} />
                    </div>
                    <h3 className="text-lg font-medium tracking-tight">
                      {type === "about" ? "Project About" : "Project Challenges"}
                    </h3>
                  </div>
                  <button onClick={() => { haptic(); addSection(type); }} className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2">
                    <Plus size={14} /> Add Section
                  </button>
                </div>

                {sections.length === 0 && (
                  <p className="text-muted-foreground text-sm font-light py-8 text-center bg-secondary/30 rounded-xl border border-dashed border-border">No content sections yet.</p>
                )}

                <div className="space-y-6">
                  {sections.map((s, i) => (
                    <div key={s.id ?? i} className="p-6 rounded-2xl bg-background border border-border space-y-4 relative group">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Field label="Title"><Input defaultValue={s.title} onBlur={(e) => { s.title = e.target.value; }} /></Field>
                        <Field label="Lucide Icon Name"><Input defaultValue={s.icon_name} placeholder="e.g. Layers" onBlur={(e) => { s.icon_name = e.target.value; }} /></Field>
                      </div>
                      <Field label="Section Content"><Textarea defaultValue={s.body} rows={4} onBlur={(e) => { s.body = e.target.value; }} /></Field>
                      <Field label="Highlight Phrases (comma-separated)">
                        <Input
                          defaultValue={s.highlight_phrases ?? ""}
                          placeholder="e.g. award-winning design, sustainable materials"
                          onBlur={(e) => { s.highlight_phrases = e.target.value; }}
                        />
                      </Field>
                      <div className="flex justify-between items-center pt-4 border-t border-border/50">
                        <button onClick={() => { haptic.error(); removeSection(s.id!); }} className="flex items-center gap-2 text-red-400 text-xs font-semibold hover:text-red-300 transition-colors">
                          <Trash2 size={14} /> Delete Section
                        </button>
                        <SaveBtn loading={saving === `section-${s.id}`} onClick={() => saveSection(s)} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* ── Section C: Construction Phases ── */}
          <section className="bevel-card p-6 bg-secondary/20 space-y-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border text-vastu-green">
                  <Activity size={18} />
                </div>
                <h3 className="text-lg font-medium tracking-tight">Timeline & Phases</h3>
              </div>
              <button onClick={() => { haptic(); addPhase(); }} className="px-4 py-2 rounded-xl bg-foreground text-background text-xs font-bold hover:opacity-90 transition-all flex items-center gap-2">
                <Plus size={14} /> Add Phase
              </button>
            </div>

            <div className="space-y-4">
              {(blog?.construction_phases ?? []).map((p, i) => (
                <div key={p.id ?? i} className="p-6 rounded-2xl bg-background border border-border space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Field label="Phase Label"><Input defaultValue={p.label} onBlur={(e) => { p.label = e.target.value; }} /></Field>
                    <Field label="Current Status">
                      <Select defaultValue={p.status} onChange={(e) => { p.status = e.target.value as "complete" | "active" | "upcoming"; }}>
                        <option value="complete" className="bg-background">✓ Complete</option>
                        <option value="active" className="bg-background">⬤ Active</option>
                        <option value="upcoming" className="bg-background">○ Upcoming</option>
                      </Select>
                    </Field>
                    <Field label="Target/Actual Date"><Input defaultValue={p.phase_date} placeholder="e.g. Q4 2024" onBlur={(e) => { p.phase_date = e.target.value; }} /></Field>
                  </div>
                  <div className="flex items-center gap-6">
                    <div className="w-32">
                      <Field label="Progress %"><Input type="number" min={0} max={100} defaultValue={p.percentage} onBlur={(e) => { p.percentage = Number(e.target.value); }} /></Field>
                    </div>
                    <div className="flex-1 pt-6">
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div className="h-full bg-vastu-green" style={{ width: `${p.percentage}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-border/50">
                    <button onClick={() => { haptic.error(); removePhase(p.id!); }} className="flex items-center gap-2 text-red-400 text-xs font-semibold hover:text-red-300 transition-colors">
                      <Trash2 size={14} /> Delete Phase
                    </button>
                    <SaveBtn loading={saving === `phase-${p.id}`} onClick={() => savePhase(p)} />
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── Section D: Site Update Media ── */}
          <section className="bevel-card p-6 bg-secondary/20 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-background border border-border text-vastu-green">
                <Upload size={18} />
              </div>
              <h3 className="text-lg font-medium tracking-tight">Project Live Updates</h3>
            </div>

            {/* Upload form */}
            <div className="p-8 rounded-2xl bg-background border-2 border-dashed border-border flex flex-col items-center text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-secondary flex items-center justify-center text-muted-foreground">
                <ImageIcon size={24} />
              </div>
              <div>
                <p className="text-sm font-semibold">Upload site media</p>
                <p className="text-xs text-muted-foreground mt-1">Images or videos of current progress</p>
              </div>
              
              <input ref={fileRef} type="file" accept="image/*,video/*" className="hidden" id="site-media-upload" onChange={() => handleUpload()} />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-xl">
                <Field label="Caption"><Input value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} placeholder="e.g. Foundation pour complete" /></Field>
                <Field label="Date Headline"><Input value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} placeholder="e.g. Mar 2025" /></Field>
              </div>
              
              <button 
                onClick={() => document.getElementById('site-media-upload')?.click()} 
                disabled={uploading} 
                className="btn-vercel h-11 px-8 text-sm"
              >
                {uploading ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                {uploading ? "Uploading..." : "Select File & Upload"}
              </button>
            </div>

            {/* Existing updates grid */}
            {(blog?.site_updates ?? []).length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {blog!.site_updates.map((u, i) => (
                  <div key={u.id ?? i} className="relative group rounded-xl overflow-hidden border border-border bg-background aspect-square">
                    {u.media_type === "image" ? (
                      <img src={u.media_url} alt={u.caption} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
                    ) : (
                      <div className="w-full h-full bg-secondary flex items-center justify-center">
                        <Video size={32} className="text-muted-foreground/40" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                      <p className="text-[10px] font-bold text-vastu-green uppercase tracking-widest mb-1">{u.update_date}</p>
                      <p className="text-xs text-white line-clamp-2">{u.caption || "Untitled Update"}</p>
                    </div>
                    <button
                      onClick={() => { haptic.error(); removeUpdate(u); }}
                      className="absolute top-2 right-2 p-2 rounded-full bg-black/50 text-white hover:bg-red-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
