"use client";

/**
 * ProjectDetail.tsx
 * Full-screen project story page.
 * Rendered by page.tsx when a project is selected — completely replaces the main site view.
 * Props:
 *   project  — the Project object
 *   onBack   — () => void   go back to main site
 *   onLaunch — (p) => void  open LaunchModal
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useInView } from "framer-motion";
import {
  ArrowLeft, Play, ExternalLink, ChevronLeft, ChevronRight,
  CheckCircle2, Circle, Clock, MapPin, Calendar, Layers, ZoomIn,
} from "lucide-react";
import { getProjectBlog, Project, ProjectBlogFull, BlogSection } from "@/lib/supabase";

// ─── helpers ──────────────────────────────────────────────────────────────────

const GOLD = "#c4a478";
const GOLD_DIM = "rgba(196,164,120,0.55)";
const GOLD_FAINT = "rgba(196,164,120,0.15)";
const BG = "#080604";
const FG = "rgba(245,235,215,0.95)";
const MUTED = "rgba(196,164,120,0.4)";

/** Wrap occurrences of highlight phrases in gold spans */
function HighlightedText({ text, phrases }: { text: string; phrases: string[] }) {
  if (!phrases.length) return <>{text}</>;

  // Build regex that matches any phrase (case-insensitive)
  const escaped = phrases.map(p => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).filter(Boolean);
  if (!escaped.length) return <>{text}</>;
  const regex = new RegExp(`(${escaped.join("|")})`, "gi");
  const parts = text.split(regex);

  return (
    <>
      {parts.map((part, i) => {
        const isHighlight = escaped.some(e => new RegExp(`^${e}$`, "i").test(part));
        if (isHighlight) {
          return (
            <motion.span
              key={i}
              initial={{ color: MUTED }}
              whileInView={{ color: GOLD }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.04 }}
              style={{ fontStyle: "italic", fontFamily: "var(--font-display)" }}
            >
              {part}
            </motion.span>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

/** Animated paragraph that reveals word by word */
function AnimatedParagraph({ text, phrases, delay = 0 }: { text: string; phrases: string[]; delay?: number }) {
  const ref = useRef<HTMLParagraphElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });

  return (
    <motion.p
      ref={ref}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className="text-base leading-[1.95] font-light"
      style={{ color: MUTED }}
    >
      <HighlightedText text={text} phrases={phrases} />
    </motion.p>
  );
}

/** Section label */
function Label({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-5 h-px" style={{ background: GOLD }} />
      <span className="text-[11px] uppercase tracking-[0.28em]" style={{ color: GOLD_DIM, fontFamily: "var(--font-mono)" }}>
        {children}
      </span>
    </div>
  );
}

// ─── Phase timeline ───────────────────────────────────────────────────────────

function Timeline({ phases }: { phases: ProjectBlogFull["construction_phases"] }) {
  if (!phases.length) return null;
  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px" style={{ background: GOLD_FAINT }} />
      <div className="space-y-6 pl-6">
        {phases.map((p, i) => {
          const isComplete = p.status === "complete";
          const isActive = p.status === "active";
          return (
            <motion.div
              key={p.id || i}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="relative"
            >
              {/* dot */}
              <div
                className="absolute -left-6 top-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center"
                style={{
                  background: isComplete ? GOLD : isActive ? "rgba(196,164,120,0.2)" : "rgba(196,164,120,0.05)",
                  border: `1px solid ${isComplete ? GOLD : isActive ? GOLD_DIM : GOLD_FAINT}`,
                  boxShadow: isActive ? `0 0 10px rgba(196,164,120,0.4)` : "none",
                }}
              >
                {isComplete && <CheckCircle2 size={8} style={{ color: BG }} />}
                {isActive && <motion.div className="w-1.5 h-1.5 rounded-full" style={{ background: GOLD }} animate={{ scale: [1, 1.4, 1] }} transition={{ duration: 1.6, repeat: Infinity }} />}
              </div>

              <div className="flex items-start justify-between gap-4">
                <div>
                  <p
                    className="text-sm font-light"
                    style={{ color: isComplete ? "rgba(196,164,120,0.8)" : isActive ? FG : "rgba(196,164,120,0.35)" }}
                  >
                    {p.label}
                  </p>
                  {isActive && p.percentage != null && p.percentage > 0 && (
                    <div className="flex items-center gap-2 mt-1.5">
                      <div className="w-24 h-0.5 rounded-full overflow-hidden" style={{ background: "rgba(196,164,120,0.1)" }}>
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${p.percentage}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 1.2, ease: "easeOut" }}
                          className="h-full rounded-full"
                          style={{ background: `linear-gradient(90deg, ${GOLD_DIM}, ${GOLD})` }}
                        />
                      </div>
                      <span className="text-[10px]" style={{ color: GOLD, fontFamily: "var(--font-mono)" }}>{p.percentage}%</span>
                    </div>
                  )}
                </div>
                {p.phase_date && (
                  <span className="text-[10px] flex-shrink-0 mt-0.5" style={{ color: "rgba(196,164,120,0.3)", fontFamily: "var(--font-mono)" }}>
                    {p.phase_date}
                  </span>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Gallery lightbox ─────────────────────────────────────────────────────────

function Gallery({ media }: { media: ProjectBlogFull["site_updates"] }) {
  const images = media.filter(m => m.media_type === "image");
  const [active, setActive] = useState(0);
  const [lightbox, setLightbox] = useState(false);

  if (!images.length) return null;

  return (
    <div>
      {/* Main image */}
      <div className="relative rounded-2xl overflow-hidden mb-3" style={{ aspectRatio: "16/9" }}>
        <AnimatePresence mode="wait">
          <motion.img
            key={active}
            src={images[active]?.media_url}
            alt={images[active]?.caption ?? ""}
            className="absolute inset-0 w-full h-full object-cover cursor-zoom-in"
            initial={{ opacity: 0, scale: 1.03 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            onClick={() => setLightbox(true)}
          />
        </AnimatePresence>

        {/* Nav arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setActive(i => (i - 1 + images.length) % images.length)}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-100 opacity-70"
              style={{ background: "rgba(8,6,4,0.75)", border: `1px solid ${GOLD_FAINT}` }}
            >
              <ChevronLeft size={14} style={{ color: GOLD }} />
            </button>
            <button
              onClick={() => setActive(i => (i + 1) % images.length)}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-opacity hover:opacity-100 opacity-70"
              style={{ background: "rgba(8,6,4,0.75)", border: `1px solid ${GOLD_FAINT}` }}
            >
              <ChevronRight size={14} style={{ color: GOLD }} />
            </button>
          </>
        )}

        {/* Zoom hint */}
        <div className="absolute bottom-3 right-3 opacity-50 hover:opacity-100 transition-opacity pointer-events-none">
          <ZoomIn size={14} style={{ color: GOLD }} />
        </div>

        {/* Caption */}
        {images[active]?.caption && (
          <div className="absolute bottom-0 left-0 right-0 px-5 py-3" style={{ background: "linear-gradient(transparent, rgba(8,6,4,0.85))" }}>
            <p className="text-xs" style={{ color: "rgba(196,164,120,0.65)" }}>{images[active].caption}</p>
            {images[active].update_date && (
              <p className="text-[10px] mt-0.5" style={{ color: "rgba(196,164,120,0.35)", fontFamily: "var(--font-mono)" }}>{images[active].update_date}</p>
            )}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((m, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              className="flex-shrink-0 w-16 h-11 rounded-lg overflow-hidden transition-all duration-200"
              style={{
                border: `1px solid ${i === active ? GOLD : "rgba(196,164,120,0.1)"}`,
                opacity: i === active ? 1 : 0.45,
              }}
            >
              <img src={m.media_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center"
            style={{ background: "rgba(8,6,4,0.95)", backdropFilter: "blur(16px)" }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(false)}
          >
            <motion.img
              src={images[active]?.media_url}
              alt=""
              className="max-w-[90vw] max-h-[85vh] rounded-2xl object-contain"
              initial={{ scale: 0.92 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.92 }}
              transition={{ duration: 0.35 }}
            />
            {images.length > 1 && (
              <>
                <button onClick={e => { e.stopPropagation(); setActive(i => (i - 1 + images.length) % images.length); }} className="absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(196,164,120,0.1)", border: `1px solid ${GOLD_FAINT}` }}>
                  <ChevronLeft style={{ color: GOLD }} />
                </button>
                <button onClick={e => { e.stopPropagation(); setActive(i => (i + 1) % images.length); }} className="absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: "rgba(196,164,120,0.1)", border: `1px solid ${GOLD_FAINT}` }}>
                  <ChevronRight style={{ color: GOLD }} />
                </button>
              </>
            )}
            <button onClick={() => setLightbox(false)} className="absolute top-5 right-5 text-xs uppercase tracking-widest" style={{ color: GOLD_DIM, fontFamily: "var(--font-mono)" }}>ESC</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Blog section card ────────────────────────────────────────────────────────

function StorySection({ section, index }: { section: BlogSection; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const phrases = (section.highlight_phrases ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-4"
    >
      <h3
        className="text-2xl font-light"
        style={{ fontFamily: "var(--font-display)", color: FG, letterSpacing: "-0.01em" }}
      >
        {section.title}
      </h3>
      <AnimatedParagraph text={section.body} phrases={phrases} delay={0.1} />
    </motion.div>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export default function ProjectDetail({
  project,
  onBack,
  onLaunch,
}: {
  project: Project;
  onBack: () => void;
  onLaunch: (p: Project) => void;
}) {
  const [blog, setBlog] = useState<ProjectBlogFull | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Hero parallax
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
    getProjectBlog(project.id).then(setBlog).catch(() => {});
  }, [project.id]);

  const storyPhrases = (blog as any)?.highlight_phrases ?? [];
  const allSections = blog?.blog_sections ?? [];
  const images = blog?.site_updates?.filter(u => u.media_type === "image") ?? [];
  const phases = blog?.construction_phases ?? [];

  const specs = [
    { label: "Type", value: project.type },
    { label: "Location", value: project.location },
    { label: "Year", value: project.year },
    ...(blog?.current_status ? [{ label: "Status", value: blog.current_status }] : []),
    ...(blog?.completion_percent ? [{ label: "Progress", value: `${blog.completion_percent}%` }] : []),
  ];

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      style={{ background: BG, minHeight: "100vh" }}
    >
      {/* ── Sticky top bar ── */}
      <div
        className="fixed top-0 left-0 right-0 z-50 px-6 lg:px-16 py-4"
        style={{ background: "rgba(8,6,4,0.88)", backdropFilter: "blur(20px)", borderBottom: "1px solid rgba(196,164,120,0.07)" }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.button
            onClick={onBack}
            className="group flex items-center gap-2 text-sm"
            style={{ color: GOLD_DIM }}
            whileHover={{ x: -2 }}
            onMouseEnter={e => e.currentTarget.style.color = GOLD}
            onMouseLeave={e => e.currentTarget.style.color = GOLD_DIM}
          >
            <ArrowLeft size={14} />
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              Back to Projects
            </span>
          </motion.button>

          <div className="flex items-center gap-4">
            {blog?.has_live_updates && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)" }}>
                <motion.div className="w-1.5 h-1.5 rounded-full bg-emerald-400" animate={{ scale: [1, 1.3, 1] }} transition={{ duration: 1.4, repeat: Infinity }} />
                <span className="text-[10px] text-emerald-300" style={{ fontFamily: "var(--font-mono)" }}>Live Updates</span>
              </div>
            )}
            <span className="text-[10px] uppercase tracking-widest" style={{ color: "rgba(196,164,120,0.3)", fontFamily: "var(--font-mono)" }}>
              {project.type} · {project.year}
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero ── */}
      <div className="relative h-[100vh] overflow-hidden flex items-end">
        <motion.img
          src={project.image_url}
          alt={project.title}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ y: heroY }}
          initial={{ scale: 1.08 }}
          animate={{ scale: 1 }}
          transition={{ duration: 1.6, ease: [0.16, 1, 0.3, 1] }}
        />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(8,6,4,0.25) 0%, rgba(8,6,4,0.1) 40%, rgba(8,6,4,0.7) 70%, #080604 100%)" }} />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 w-full px-8 lg:px-20 pb-20 max-w-7xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="flex items-center gap-3 mb-5">
              <MapPin size={11} style={{ color: GOLD }} />
              <span className="text-xs uppercase tracking-[0.28em]" style={{ color: GOLD_DIM, fontFamily: "var(--font-mono)" }}>
                {project.location}
              </span>
            </div>
            <h1
              className="font-light mb-5"
              style={{
                fontFamily: "var(--font-display)",
                fontSize: "clamp(3.5rem, 8vw, 7rem)",
                color: FG,
                letterSpacing: "-0.025em",
                lineHeight: 0.9,
              }}
            >
              {project.title}
            </h1>
            <p className="text-lg font-light max-w-xl" style={{ color: MUTED }}>
              {project.description}
            </p>
          </motion.div>
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
        >
          <motion.div className="w-px h-10" style={{ background: `linear-gradient(to bottom, transparent, ${GOLD_DIM})` }} animate={{ scaleY: [0, 1, 0] }} transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }} />
        </motion.div>
      </div>

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-8 lg:px-20 py-24">
        <div className="grid lg:grid-cols-[1fr_320px] gap-16 lg:gap-24">

          {/* Left — story */}
          <div className="space-y-20">

            {/* Main story */}
            {(blog?.story || project.long_description) && (
              <section>
                <Label>The Story</Label>
                <AnimatedParagraph
                  text={blog?.story || project.long_description || ""}
                  phrases={[]}
                />
              </section>
            )}

            {/* Blog sections */}
            {allSections.length > 0 && (
              <section className="space-y-14">
                <Label>Project Narrative</Label>
                {allSections.map((s, i) => (
                  <StorySection key={s.id || i} section={s} index={i} />
                ))}
              </section>
            )}

            {/* Gallery */}
            {images.length > 0 && (
              <section>
                <Label>Site Gallery</Label>
                <Gallery media={blog?.site_updates ?? []} />
              </section>
            )}
          </div>

          {/* Right — sidebar (sticky) */}
          <div className="space-y-8 lg:sticky lg:top-24 lg:self-start">

            {/* Specs */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="p-6 rounded-2xl"
              style={{ background: "rgba(196,164,120,0.03)", border: "1px solid rgba(196,164,120,0.09)" }}
            >
              <Label>Project Details</Label>
              <div className="space-y-0">
                {specs.map(({ label, value }) => (
                  <div key={label} className="flex justify-between py-3" style={{ borderBottom: "1px solid rgba(196,164,120,0.06)" }}>
                    <span className="text-[10px] uppercase tracking-wider" style={{ color: "rgba(196,164,120,0.35)", fontFamily: "var(--font-mono)" }}>{label}</span>
                    <span className="text-sm" style={{ color: "rgba(196,164,120,0.75)" }}>{value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Completion ring */}
            {blog?.completion_percent != null && blog.completion_percent > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="p-6 rounded-2xl flex flex-col items-center"
                style={{ background: "rgba(196,164,120,0.03)", border: "1px solid rgba(196,164,120,0.09)" }}
              >
                <CompletionRing percent={blog.completion_percent} />
                <p className="text-xs mt-3 uppercase tracking-widest" style={{ color: GOLD_DIM, fontFamily: "var(--font-mono)" }}>
                  Overall Completion
                </p>
              </motion.div>
            )}

            {/* Timeline */}
            {phases.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="p-6 rounded-2xl"
                style={{ background: "rgba(196,164,120,0.03)", border: "1px solid rgba(196,164,120,0.09)" }}
              >
                <Label>Construction Timeline</Label>
                <Timeline phases={phases} />
              </motion.div>
            )}

            {/* Launch button */}
            {project.stream_url && (
              <motion.button
                onClick={() => onLaunch(project)}
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-medium text-sm"
                style={{ background: GOLD, color: BG, boxShadow: "0 0 40px rgba(196,164,120,0.25)" }}
              >
                <Play size={15} fill={BG} strokeWidth={0} />
                Launch Immersive Tour
                <ExternalLink size={13} />
              </motion.button>
            )}
          </div>
        </div>

        {/* ── Full-width CTA ── */}
        {project.stream_url && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.9 }}
            className="mt-32 rounded-3xl flex flex-col items-center text-center py-24 px-8 relative overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(196,164,120,0.06) 0%, rgba(196,164,120,0.02) 100%)", border: "1px solid rgba(196,164,120,0.1)" }}
          >
            {/* Glow */}
            <div className="absolute inset-0 pointer-events-none" style={{ background: "radial-gradient(ellipse 60% 40% at 50% 100%, rgba(196,164,120,0.08), transparent)" }} />

            <div className="w-20 h-20 rounded-full flex items-center justify-center mb-8" style={{ background: "rgba(196,164,120,0.08)", border: "1px solid rgba(196,164,120,0.2)" }}>
              <Play size={24} style={{ color: GOLD }} fill={GOLD} />
            </div>
            <h2
              className="font-light mb-5"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4.5vw, 4rem)", color: FG, letterSpacing: "-0.025em" }}
            >
              Step Inside the{" "}
              <span style={{ color: GOLD, fontStyle: "italic" }}>Experience</span>
            </h2>
            <p className="mb-10 max-w-md text-base leading-relaxed font-light" style={{ color: MUTED }}>
              Walk every room before a single brick is laid. Photorealistic real-time environments streamed to any browser — powered by Unreal Engine 5.
            </p>
            <motion.button
              onClick={() => onLaunch(project)}
              whileHover={{ scale: 1.05, y: -3 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-3 px-10 py-5 rounded-full font-medium text-base"
              style={{ background: GOLD, color: BG, boxShadow: "0 0 80px rgba(196,164,120,0.35)" }}
            >
              <Play size={18} fill={BG} strokeWidth={0} />
              Launch Immersive Tour
              <ExternalLink size={15} />
            </motion.button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

// ─── Completion ring (SVG) ────────────────────────────────────────────────────

function CompletionRing({ percent }: { percent: number }) {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const ref = useRef<SVGCircleElement>(null);
  const inView = useInView(ref as any, { once: true });

  return (
    <div className="relative w-28 h-28 flex items-center justify-center">
      <svg width="112" height="112" viewBox="0 0 112 112" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="56" cy="56" r={r} fill="none" strokeWidth="2" stroke="rgba(196,164,120,0.08)" />
        <motion.circle
          ref={ref}
          cx="56" cy="56" r={r}
          fill="none"
          strokeWidth="2"
          stroke={GOLD}
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={inView ? { strokeDashoffset: circ - (circ * percent) / 100 } : {}}
          transition={{ duration: 1.8, ease: "easeOut" }}
          style={{ filter: "drop-shadow(0 0 4px rgba(196,164,120,0.5))" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-light" style={{ color: GOLD, fontFamily: "var(--font-display)" }}>{percent}</span>
        <span className="text-[10px]" style={{ color: GOLD_DIM, fontFamily: "var(--font-mono)" }}>%</span>
      </div>
    </div>
  );
}
