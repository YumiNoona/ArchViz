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
    <div>
      <label className="block text-xs font-mono text-[var(--vc-muted)] uppercase tracking-widest mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="w-full px-3 py-2 rounded-xl bg-[var(--vc-bg)] border border-[var(--vc-border)] text-[var(--vc-fg)] text-sm font-sans focus:outline-none focus:border-[var(--vc-gold)]/50 transition-colors" {...props} />;
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="w-full px-3 py-2 rounded-xl bg-[var(--vc-bg)] border border-[var(--vc-border)] text-[var(--vc-fg)] text-sm font-sans focus:outline-none focus:border-[var(--vc-gold)]/50 transition-colors resize-none" rows={3} {...props} />;
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { children: React.ReactNode }) {
  return (
    <select className="w-full px-3 py-2 rounded-xl bg-[var(--vc-bg)] border border-[var(--vc-border)] text-[var(--vc-fg)] text-sm font-sans focus:outline-none focus:border-[var(--vc-gold)]/50 transition-colors" {...props}>
      {children}
    </select>
  );
}

function SaveBtn({ loading, onClick }: { loading?: boolean; onClick: () => void }) {
  return (
    <button
      onClick={() => { haptic(); onClick(); }}
      disabled={loading}
      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--vc-gold)] text-black font-sans font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-50"
    >
      {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
      Save
    </button>
  );
}

// ─── Phase status icon ────────────────────────────────────────────────────────

function PhaseIcon({ status }: { status: string }) {
  if (status === "complete") return <CheckCircle2 size={14} className="text-[var(--vc-gold)]" />;
  if (status === "active") return <Circle size={14} className="text-emerald-400 animate-pulse" />;
  return <Clock size={14} className="text-[var(--vc-muted)]" />;
}

// ─── Main Admin Blog Tab ──────────────────────────────────────────────────────

export default function AdminBlogTab() {
  // Inject CSS vars matching the admin panel dark theme so --vc-* classes resolve
  useEffect(() => {
    const id = "vc-admin-blog-vars";
    if (document.getElementById(id)) return;
    const s = document.createElement("style");
    s.id = id;
    s.textContent = `:root {
      --vc-bg: hsl(0 0% 4%);
      --vc-card: hsl(0 0% 6%);
      --vc-fg: hsl(0 0% 93%);
      --vc-muted: hsl(0 0% 45%);
      --vc-border: hsl(0 0% 12%);
      --vc-gold: #c4a478;
    }`;
    document.head.appendChild(s);
    return () => { document.getElementById(id)?.remove(); };
  }, []);
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
      <div className="flex items-center gap-3">
        <BookOpen size={16} className="text-[var(--vc-gold)]" />
        <h2 className="font-serif text-2xl text-[var(--vc-fg)]">Project Blog & Updates</h2>
        <div className="ml-auto w-64">
          <Select value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="animate-spin text-[var(--vc-gold)]" /></div>
      ) : (
        <>
          {/* ── Section A: Overview ── */}
          <section className="rounded-2xl border border-[var(--vc-border)] bg-[var(--vc-card)] p-6 space-y-4">
            <h3 className="font-serif text-xl text-[var(--vc-fg)] flex items-center gap-2"><Construction size={16} className="text-[var(--vc-gold)]" />Overview</h3>

            <Field label="Project Story">
              <Textarea value={story} onChange={(e) => setStory(e.target.value)} rows={5} placeholder="Write the story of this project..." />
            </Field>
            <Field label="Current Build Status (shown in real-time section)">
              <Input value={currentStatus} onChange={(e) => setCurrentStatus(e.target.value)} placeholder="e.g. Structure 72% complete. Facade installation commencing Q2 2025." />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Completion % (0–100)">
                <Input type="number" min={0} max={100} value={completionPercent} onChange={(e) => setCompletionPercent(Number(e.target.value))} />
              </Field>
              <Field label="Live Updates Badge">
                <div
                  onClick={() => { haptic(); setHasLiveUpdates(!hasLiveUpdates); }}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-colors ${hasLiveUpdates ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-400" : "border-[var(--vc-border)] text-[var(--vc-muted)]"}`}
                >
                  <span className={`w-2 h-2 rounded-full ${hasLiveUpdates ? "bg-emerald-400 animate-pulse" : "bg-[var(--vc-border)]"}`} />
                  <span className="text-sm font-sans">{hasLiveUpdates ? "Live" : "Not Live"}</span>
                </div>
              </Field>
            </div>
            <div className="flex justify-end">
              <SaveBtn loading={saving === "overview"} onClick={saveOverview} />
            </div>
          </section>

          {/* ── Section B: About & Challenge Blog Sections ── */}
          {(["about", "challenge"] as const).map((type) => {
            const sections = blog?.blog_sections.filter((s) => s.section_type === type) ?? [];
            return (
              <section key={type} className="rounded-2xl border border-[var(--vc-border)] bg-[var(--vc-card)] p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif text-xl text-[var(--vc-fg)] flex items-center gap-2">
                    <Layers size={16} className="text-[var(--vc-gold)]" />
                    {type === "about" ? "About Sections" : "Challenge Sections"}
                  </h3>
                  <button onClick={() => { haptic(); addSection(type); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--vc-gold)]/10 border border-[var(--vc-gold)]/20 text-[var(--vc-gold)] text-xs font-sans hover:bg-[var(--vc-gold)]/20 transition-colors">
                    <Plus size={12} />Add
                  </button>
                </div>

                {sections.length === 0 && (
                  <p className="text-[var(--vc-muted)] text-sm font-sans py-4 text-center">No sections yet. Add one above.</p>
                )}

                {sections.map((s, i) => (
                  <div key={s.id ?? i} className="rounded-xl border border-[var(--vc-border)] p-4 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <Field label="Title"><Input defaultValue={s.title} onBlur={(e) => { s.title = e.target.value; }} /></Field>
                      <Field label="Icon (lucide name)"><Input defaultValue={s.icon_name} placeholder="e.g. Layers" onBlur={(e) => { s.icon_name = e.target.value; }} /></Field>
                    </div>
                    <Field label="Body"><Textarea defaultValue={s.body} onBlur={(e) => { s.body = e.target.value; }} /></Field>
                    <Field label="Highlight Phrases (comma-separated — shown in gold italic on site)">
                      <Input
                        defaultValue={s.highlight_phrases ?? ""}
                        placeholder="e.g. award-winning design, sustainable materials, 12 months"
                        onBlur={(e) => { s.highlight_phrases = e.target.value; }}
                      />
                    </Field>
                    <div className="flex justify-between">
                      <button onClick={() => { haptic.error(); removeSection(s.id!); }} className="flex items-center gap-1 text-red-400 text-xs font-sans hover:text-red-300 transition-colors"><Trash2 size={12} />Delete</button>
                      <SaveBtn loading={saving === `section-${s.id}`} onClick={() => saveSection(s)} />
                    </div>
                  </div>
                ))}
              </section>
            );
          })}

          {/* ── Section C: Construction Phases ── */}
          <section className="rounded-2xl border border-[var(--vc-border)] bg-[var(--vc-card)] p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl text-[var(--vc-fg)] flex items-center gap-2"><Construction size={16} className="text-[var(--vc-gold)]" />Construction Phases</h3>
              <button onClick={() => { haptic(); addPhase(); }} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[var(--vc-gold)]/10 border border-[var(--vc-gold)]/20 text-[var(--vc-gold)] text-xs font-sans hover:bg-[var(--vc-gold)]/20 transition-colors">
                <Plus size={12} />Add Phase
              </button>
            </div>

            {(blog?.construction_phases ?? []).map((p, i) => (
              <div key={p.id ?? i} className="rounded-xl border border-[var(--vc-border)] p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="Phase Label"><Input defaultValue={p.label} onBlur={(e) => { p.label = e.target.value; }} /></Field>
                  <Field label="Status">
                    <Select defaultValue={p.status} onChange={(e) => { p.status = e.target.value as "complete" | "active" | "upcoming"; }}>
                      <option value="complete">✓ Complete</option>
                      <option value="active">⬤ Active</option>
                      <option value="upcoming">○ Upcoming</option>
                    </Select>
                  </Field>
                  <Field label="Date (e.g. Q2 2025)"><Input defaultValue={p.phase_date} onBlur={(e) => { p.phase_date = e.target.value; }} /></Field>
                </div>
                <div className="flex items-center gap-3">
                  <Field label="Progress % (active only)">
                    <Input type="number" min={0} max={100} defaultValue={p.percentage} className="w-24" onBlur={(e) => { p.percentage = Number(e.target.value); }} />
                  </Field>
                </div>
                <div className="flex justify-between">
                  <button onClick={() => { haptic.error(); removePhase(p.id!); }} className="flex items-center gap-1 text-red-400 text-xs font-sans hover:text-red-300 transition-colors"><Trash2 size={12} />Delete</button>
                  <SaveBtn loading={saving === `phase-${p.id}`} onClick={() => savePhase(p)} />
                </div>
              </div>
            ))}
          </section>

          {/* ── Section D: Site Update Media ── */}
          <section className="rounded-2xl border border-[var(--vc-border)] bg-[var(--vc-card)] p-6 space-y-4">
            <h3 className="font-serif text-xl text-[var(--vc-fg)] flex items-center gap-2">
              <ImageIcon size={16} className="text-[var(--vc-gold)]" />Real-Time Site Updates
            </h3>

            {/* Upload form */}
            <div className="rounded-xl border border-dashed border-[var(--vc-border)] p-5 space-y-3">
              <p className="text-xs font-mono text-[var(--vc-muted)] uppercase tracking-widest">Upload Image or Video</p>
              <input ref={fileRef} type="file" accept="image/*,video/*" className="block text-sm font-sans text-[var(--vc-muted)] file:mr-3 file:px-3 file:py-1.5 file:rounded-lg file:border-0 file:bg-[var(--vc-gold)]/10 file:text-[var(--vc-gold)] file:text-xs file:font-sans file:cursor-pointer" />
              <div className="grid grid-cols-2 gap-3">
                <Field label="Caption"><Input value={uploadCaption} onChange={(e) => setUploadCaption(e.target.value)} placeholder="e.g. Foundation pour complete" /></Field>
                <Field label="Date"><Input value={uploadDate} onChange={(e) => setUploadDate(e.target.value)} placeholder="e.g. Mar 2025" /></Field>
              </div>
              <button onClick={() => { haptic(); handleUpload(); }} disabled={uploading} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[var(--vc-gold)] text-black font-sans font-semibold text-sm disabled:opacity-50">
                {uploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                Upload
              </button>
            </div>

            {/* Existing updates grid */}
            {(blog?.site_updates ?? []).length > 0 && (
              <div className="grid grid-cols-3 gap-3 mt-4">
                {blog!.site_updates.map((u, i) => (
                  <div key={u.id ?? i} className="relative group rounded-xl overflow-hidden border border-[var(--vc-border)]">
                    {u.media_type === "image" ? (
                      <img src={u.media_url} alt={u.caption} className="w-full aspect-video object-cover" />
                    ) : (
                      <div className="relative aspect-video bg-black flex items-center justify-center">
                        <Video size={24} className="text-white/40" />
                      </div>
                    )}
                    <div className="p-2 bg-[var(--vc-bg)]">
                      <p className="text-xs font-sans text-[var(--vc-muted)] line-clamp-1">{u.caption || "—"}</p>
                      {u.update_date && <p className="text-[10px] font-mono text-[var(--vc-gold)]">{u.update_date}</p>}
                    </div>
                    <button
                      onClick={() => { haptic.error(); removeUpdate(u); }}
                      className="absolute top-2 right-2 p-1 rounded-full bg-black/70 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 size={12} />
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
