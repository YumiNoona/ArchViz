"use client";

/**
 * ProjectBlogPage — Full cinematic story page for a project
 * Uses the same CSS vars (hsl(var(--*))) and haptic() util as the rest of the codebase.
 * Loads blog data from Supabase via getProjectBlog() on mount.
 */

import { useState, useRef, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import {
  ArrowLeft, MapPin, Calendar, ChevronDown, Play,
  ZoomIn, X, Building2, Layers, Wrench, Lightbulb,
  Camera, Video, Clock, CheckCircle2, Circle, Construction,
} from "lucide-react";
import { haptic } from "ios-haptics";
import { getProjectBlog } from "@/lib/supabase";
import type { Project } from "@/lib/supabase";
import type { ProjectBlogFull, BlogSection, ConstructionPhase, SiteUpdate } from "@/lib/supabase";

// ─── Props ────────────────────────────────────────────────────────────────────

interface Props {
  project: Project & { completion_percent?: number; has_live_updates?: boolean };
  onBack: () => void;
  onLaunchExperience: () => void;
}

// ─── Floating Particle Canvas ─────────────────────────────────────────────────

function ParticleField() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const c = ref.current;
    if (!c) return;
    const ctx = c.getContext("2d")!;
    c.width = c.offsetWidth; c.height = c.offsetHeight;
    const ps = Array.from({ length: 50 }, () => ({
      x: Math.random() * c.width, y: Math.random() * c.height,
      vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.2 + 0.4, a: Math.random() * 0.35 + 0.08,
    }));
    let id: number;
    function draw() {
      ctx.clearRect(0, 0, c!.width, c!.height);
      ps.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x = c!.width; if (p.x > c!.width) p.x = 0;
        if (p.y < 0) p.y = c!.height; if (p.y > c!.height) p.y = 0;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(var(--primary-h, 45),60%,55%,${p.a})`;
        ctx.fill();
      });
      id = requestAnimationFrame(draw);
    }
    draw();
    return () => cancelAnimationFrame(id);
  }, []);
  return <canvas ref={ref} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Section Heading ──────────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <motion.h2
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="font-light leading-none"
      style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3rem)", color: "hsl(var(--foreground))" }}
    >
      {children}
    </motion.h2>
  );
}

// ─── Info Card ────────────────────────────────────────────────────────────────

const ICONS: Record<string, React.ReactNode> = {
  Layers: <Layers size={22} />, Wrench: <Wrench size={22} />,
  Lightbulb: <Lightbulb size={22} />, Building2: <Building2 size={22} />,
};

function InfoCard({ section, index }: { section: BlogSection; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.55, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={e => { haptic(); (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--primary)/0.35)"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = "hsl(var(--border))"; }}
    >
      <div className="absolute top-4 right-4 opacity-15 group-hover:opacity-50 transition-opacity" style={{ color: "hsl(var(--primary))" }}>
        {section.icon_name ? ICONS[section.icon_name] ?? <Layers size={22} /> : <Layers size={22} />}
      </div>
      <h3 className="font-medium text-lg mb-2" style={{ fontFamily: "var(--font-display)", color: "hsl(var(--foreground))" }}>
        {section.title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>
        {section.body}
      </p>
    </motion.div>
  );
}

// ─── Construction Timeline ────────────────────────────────────────────────────

function ConstructionTimeline({ phases }: { phases: ConstructionPhase[] }) {
  return (
    <div className="relative pl-8">
      <div className="absolute left-3 top-0 bottom-0 w-px" style={{ background: "linear-gradient(to bottom, hsl(var(--primary)), hsl(var(--primary)/0.1))" }} />
      <div className="space-y-6">
        {phases.map((ph, i) => (
          <motion.div key={i} initial={{ opacity: 0, x: -16 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.08 }} className="relative">
            <div className={`absolute -left-[21px] w-4 h-4 rounded-full border-2 flex items-center justify-center
              ${ph.status === "complete" ? "border-primary bg-primary" : ph.status === "active" ? "border-primary bg-transparent animate-pulse" : "bg-transparent"}`}
              style={{ borderColor: ph.status === "upcoming" ? "hsl(var(--border))" : "hsl(var(--primary))" }}>
              {ph.status === "complete" && <CheckCircle2 size={9} style={{ color: "hsl(var(--primary-foreground))" }} />}
              {ph.status === "active" && <Circle size={7} style={{ color: "hsl(var(--primary))" }} />}
            </div>
            <div className={ph.status === "upcoming" ? "opacity-40" : ""}>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium" style={{
                  color: ph.status === "complete" ? "hsl(var(--foreground))" : ph.status === "active" ? "hsl(var(--primary))" : "hsl(var(--muted-foreground))",
                  fontFamily: "var(--font-body)",
                }}>{ph.label}</span>
                {ph.phase_date && <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{ph.phase_date}</span>}
              </div>
              {ph.percentage != null && ph.status === "active" && (
                <div className="mt-2 h-1.5 rounded-full overflow-hidden" style={{ background: "hsl(var(--border))" }}>
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: `${ph.percentage}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ background: "hsl(var(--primary))" }}
                  />
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Media Lightbox ───────────────────────────────────────────────────────────

function MediaLightbox({ item, onClose }: { item: SiteUpdate; onClose: () => void }) {
  useEffect(() => {
    haptic();
    const h = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.9)", backdropFilter: "blur(8px)" }}
    >
      <motion.div
        initial={{ scale: 0.92 }}
        animate={{ scale: 1 }}
        exit={{ scale: 0.92 }}
        onClick={e => e.stopPropagation()}
        className="relative max-w-5xl w-full rounded-2xl overflow-hidden border"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <button onClick={onClose} className="absolute top-3 right-3 z-10 p-2 rounded-full" style={{ background: "rgba(0,0,0,0.6)", color: "#fff" }}>
          <X size={16} />
        </button>
        {item.media_type === "image"
          ? <img src={item.media_url} alt={item.caption} className="w-full max-h-[80vh] object-contain" />
          : <video src={item.media_url} controls autoPlay className="w-full max-h-[80vh]" />
        }
        {(item.caption || item.update_date) && (
          <div className="p-4 border-t" style={{ borderColor: "hsl(var(--border))" }}>
            {item.caption && <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>{item.caption}</p>}
            {item.update_date && <p className="text-xs mt-1" style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>{item.update_date}</p>}
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Media Grid ───────────────────────────────────────────────────────────────

function MediaGrid({ updates }: { updates: SiteUpdate[] }) {
  const [sel, setSel] = useState<SiteUpdate | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {updates.map((u, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0.92 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.07 }}
            onClick={() => { setSel(u); haptic(); }}
            className="group relative aspect-video rounded-xl overflow-hidden cursor-zoom-in border"
            style={{ borderColor: "hsl(var(--border))", background: "hsl(var(--card))" }}
          >
            {u.media_type === "image"
              ? <img src={u.media_url} alt={u.caption} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              : (
                <div className="relative w-full h-full flex items-center justify-center" style={{ background: "hsl(var(--surface-1))" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
                    <Play size={14} fill="white" strokeWidth={0} className="text-white ml-0.5" />
                  </div>
                </div>
              )
            }
            <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-3">
              <div className="flex-1">
                {u.caption && <p className="text-white text-xs line-clamp-1" style={{ fontFamily: "var(--font-body)" }}>{u.caption}</p>}
                {u.update_date && <p className="text-xs mt-0.5" style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>{u.update_date}</p>}
              </div>
              {u.media_type === "image" ? <ZoomIn size={14} className="text-white ml-2" /> : <Video size={14} className="text-white ml-2" />}
            </div>
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {sel && <MediaLightbox item={sel} onClose={() => setSel(null)} />}
      </AnimatePresence>
    </>
  );
}

// ─── 3D Stats Card ────────────────────────────────────────────────────────────

function StatsCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  const [rx, setRx] = useState(0);
  const [ry, setRy] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  return (
    <motion.div
      ref={ref}
      style={{ perspective: 500 }}
      onMouseMove={e => {
        const r = ref.current!.getBoundingClientRect();
        setRy((e.clientX - r.left) / r.width - 0.5);
        setRx(-((e.clientY - r.top) / r.height - 0.5));
      }}
      onMouseLeave={() => { setRx(0); setRy(0); }}
      onMouseEnter={() => haptic()}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
    >
      <motion.div
        animate={{ rotateX: rx * 18, rotateY: ry * 18 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="relative rounded-xl p-5 text-center border overflow-hidden"
        style={{ transformStyle: "preserve-3d", background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
      >
        <div className="absolute inset-0 opacity-30 pointer-events-none" style={{ background: "radial-gradient(circle at 50% 0%, hsl(var(--primary)/0.15), transparent 70%)" }} />
        <div className="text-3xl font-light mb-1" style={{ fontFamily: "var(--font-display)", color: "hsl(var(--primary))" }}>{value}</div>
        <div className="text-xs uppercase tracking-widest" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{label}</div>
        {sub && <div className="text-xs mt-1 opacity-50" style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--foreground))" }}>{sub}</div>}
      </motion.div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ProjectBlogPage({ project, onBack, onLaunchExperience }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.22], [1, 0]);

  const [blogData, setBlogData] = useState<ProjectBlogFull | null>(null);
  const [blogLoading, setBlogLoading] = useState(true);

  useEffect(() => {
    getProjectBlog(project.id).then(b => {
      setBlogData(b);
      setBlogLoading(false);
    });
    // Scroll to top when blog opens
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [project.id]);

  // Fallback data while loading or if DB is empty
  const blog: ProjectBlogFull = blogData ?? {
    story: `${project.title} is a landmark ${project.type.toLowerCase()} project in ${project.location}. Our team approached this with the vision of creating a space that harmonises contemporary architectural language with contextual sensitivity. The design process began with an extensive site analysis and stakeholder consultation to understand the unique demands of the location — resulting in a structure that elevates the human experience within its walls.`,
    current_status: "Project currently under development. Check back for live construction updates.",
    completion_percent: project.completion_percent ?? 35,
    has_live_updates: project.has_live_updates ?? false,
    blog_sections: [
      { section_type: "about", sort_order: 0, title: "Design Philosophy", body: "The architecture draws from local vernacular traditions while asserting a confident contemporary identity. Natural light choreography and material contrast define the spatial experience.", icon_name: "Building2" },
      { section_type: "about", sort_order: 1, title: "Sustainability", body: "Passive cooling strategies, rainwater harvesting, and a high-performance building envelope deliver energy performance 35% better than baseline code requirements.", icon_name: "Lightbulb" },
      { section_type: "about", sort_order: 2, title: "Technology", body: "BIM coordination across all disciplines ensured clash-free construction documents. Unreal Engine visualisation was used throughout design reviews to maintain client alignment.", icon_name: "Layers" },
      { section_type: "challenge", sort_order: 0, title: "Site Complexity", body: "Irregular boundaries and varying ground conditions required bespoke structural solutions. Our engineering team developed innovative pile configurations for long-term stability.", icon_name: "Wrench" },
      { section_type: "challenge", sort_order: 1, title: "Material Sourcing", body: "Specified facade materials required careful supply-chain vetting to ensure both quality and sustainability certifications aligned with our environmental targets.", icon_name: "Layers" },
      { section_type: "challenge", sort_order: 2, title: "Design vs. Budget", body: "Value engineering without compromising design intent demanded creative collaboration between architects, quantity surveyors, and contractors across multiple iterations.", icon_name: "Lightbulb" },
    ],
    construction_phases: [
      { sort_order: 0, label: "Concept & Schematic Design", status: "complete", phase_date: "Q1 2024" },
      { sort_order: 1, label: "Design Development & Approvals", status: "complete", phase_date: "Q3 2024" },
      { sort_order: 2, label: "Construction Documentation", status: "complete", phase_date: "Q4 2024" },
      { sort_order: 3, label: "Foundation & Structure", status: "active", percentage: 70, phase_date: "Q1–Q2 2025" },
      { sort_order: 4, label: "Facade & Envelope", status: "upcoming", phase_date: "Q2 2025" },
      { sort_order: 5, label: "Interior Fit-Out", status: "upcoming", phase_date: "Q3 2025" },
      { sort_order: 6, label: "Handover", status: "upcoming", phase_date: "Q4 2025" },
    ],
    site_updates: [],
  };

  const aboutSections = blog.blog_sections.filter(s => s.section_type === "about");
  const challengeSections = blog.blog_sections.filter(s => s.section_type === "challenge");

  return (
    <div ref={containerRef} className="min-h-screen" style={{ background: "hsl(var(--background))", color: "hsl(var(--foreground))" }}>

      {/* Scroll progress bar */}
      <motion.div
        style={{ scaleX: scrollYProgress, transformOrigin: "0%", background: "hsl(var(--primary))" }}
        className="fixed top-0 left-0 right-0 h-0.5 z-50"
      />

      {/* Back button */}
      <motion.button
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => { haptic(); onBack(); }}
        className="fixed top-20 left-6 z-40 flex items-center gap-2 px-4 py-2 rounded-xl border text-sm transition-colors group"
        style={{ background: "hsl(var(--card)/0.85)", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))", backdropFilter: "blur(12px)", fontFamily: "var(--font-body)" }}
        onMouseEnter={e => { e.currentTarget.style.color = "hsl(var(--foreground))"; e.currentTarget.style.borderColor = "hsl(var(--primary)/0.4)"; }}
        onMouseLeave={e => { e.currentTarget.style.color = "hsl(var(--muted-foreground))"; e.currentTarget.style.borderColor = "hsl(var(--border))"; }}
      >
        <ArrowLeft size={15} className="group-hover:-translate-x-0.5 transition-transform" />
        All Projects
      </motion.button>

      {/* ═══ HERO ═══ */}
      <motion.section style={{ y: heroY }} className="relative h-[82vh] min-h-[480px] flex items-end overflow-hidden">
        <ParticleField />
        <div className="absolute inset-0">
          <img src={project.image_url} alt={project.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0" style={{ background: "linear-gradient(to top, hsl(var(--background)) 0%, rgba(0,0,0,0.4) 40%, transparent 100%)" }} />
        </div>

        <motion.div style={{ opacity: heroOpacity }} className="relative z-10 max-w-4xl mx-auto w-full px-6 pb-16">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border mb-4"
            style={{ background: "hsl(var(--primary)/0.1)", borderColor: "hsl(var(--primary)/0.3)", color: "hsl(var(--primary))", fontFamily: "var(--font-mono)", fontSize: 11 }}>
            <Building2 size={11} />
            {project.type}
          </motion.div>

          <motion.h1 initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3, duration: 0.8 }}
            className="font-light leading-none mb-4"
            style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem,8vw,6rem)", color: "#fff" }}>
            {project.title}
          </motion.h1>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
            className="flex flex-wrap items-center gap-4 text-sm" style={{ color: "rgba(255,255,255,0.6)", fontFamily: "var(--font-body)" }}>
            <span className="flex items-center gap-1.5"><MapPin size={13} />{project.location}</span>
            <span className="flex items-center gap-1.5"><Calendar size={13} />{project.year}</span>
            <span className="flex items-center gap-1.5"><Construction size={13} />{blog.completion_percent}% complete</span>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="mt-6 max-w-sm">
            <div className="flex justify-between text-xs mb-1.5" style={{ fontFamily: "var(--font-mono)" }}>
              <span style={{ color: "hsl(var(--primary))" }}>Project Completion</span>
              <span style={{ color: "rgba(255,255,255,0.55)" }}>{blog.completion_percent}%</span>
            </div>
            <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.15)" }}>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${blog.completion_percent}%` }}
                transition={{ delay: 0.8, duration: 1.5, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: "hsl(var(--primary))" }}
              />
            </div>
          </motion.div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.2 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1"
          style={{ color: "rgba(255,255,255,0.35)" }}>
          <span className="text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Scroll</span>
          <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8 }}><ChevronDown size={15} /></motion.div>
        </motion.div>
      </motion.section>

      {/* ═══ CONTENT ═══ */}
      <div className="max-w-4xl mx-auto px-6 py-16 space-y-20">

        {/* Stats */}
        <motion.div initial={{ opacity: 0, y: 32 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="grid grid-cols-3 gap-4">
          <StatsCard label="Project Type" value={project.type.split(/(?=[A-Z])/)[0]} sub={project.type} />
          <StatsCard label="Location" value={project.location.split(",")[0]} sub={project.location} />
          <StatsCard label="Year" value={project.year} sub="Estimated completion" />
        </motion.div>

        {/* Story */}
        <section>
          <SectionHeading>The Story</SectionHeading>
          <div className="w-10 h-px mt-3 mb-6" style={{ background: "hsl(var(--primary))" }} />
          <motion.p initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="text-base leading-loose" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>
            {blog.story || project.long_description || project.description}
          </motion.p>
        </section>

        {/* About */}
        {aboutSections.length > 0 && (
          <section>
            <SectionHeading>About This Project</SectionHeading>
            <div className="w-10 h-px mt-3 mb-6" style={{ background: "hsl(var(--primary))" }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {aboutSections.map((s, i) => <InfoCard key={s.id ?? i} section={s} index={i} />)}
            </div>
          </section>
        )}

        {/* Challenges */}
        {challengeSections.length > 0 && (
          <section>
            <SectionHeading>Challenges & Solutions</SectionHeading>
            <div className="w-10 h-px mt-3 mb-6" style={{ background: "hsl(var(--primary))" }} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {challengeSections.map((s, i) => <InfoCard key={s.id ?? i} section={s} index={i} />)}
            </div>
          </section>
        )}

        {/* Real-Time Updates */}
        <section>
          <div className="flex items-start justify-between mb-3">
            <SectionHeading>Real-Time Updates</SectionHeading>
            {blog.has_live_updates && (
              <div className="flex items-center gap-1.5 mt-2 px-3 py-1.5 rounded-full border"
                style={{ background: "rgba(52,211,153,0.08)", borderColor: "rgba(52,211,153,0.3)" }}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Live</span>
              </div>
            )}
          </div>
          <div className="w-10 h-px mb-4" style={{ background: "hsl(var(--primary))" }} />

          <motion.div initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="flex items-start gap-3 p-4 rounded-xl border mb-6"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}>
            <Clock size={15} style={{ color: "hsl(var(--primary))", marginTop: 1 }} className="shrink-0" />
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>
              {blog.current_status || "No status update yet."}
            </p>
          </motion.div>

          {blog.site_updates.length > 0 ? (
            <MediaGrid updates={blog.site_updates} />
          ) : (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed"
              style={{ borderColor: "hsl(var(--border))" }}>
              <Camera size={28} className="mb-3" style={{ color: "hsl(var(--muted-foreground))" }} />
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>No site photos uploaded yet.</p>
              <p className="text-xs mt-1 opacity-60" style={{ fontFamily: "var(--font-mono)", color: "hsl(var(--muted-foreground))" }}>
                Add images via Admin → Blog &amp; Updates
              </p>
            </div>
          )}
        </section>

        {/* Construction Timeline */}
        {blog.construction_phases.length > 0 && (
          <section>
            <SectionHeading>Construction Phases</SectionHeading>
            <div className="w-10 h-px mt-3 mb-8" style={{ background: "hsl(var(--primary))" }} />
            <ConstructionTimeline phases={blog.construction_phases} />
          </section>
        )}

        {/* CTA */}
        <motion.section
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden rounded-3xl p-10 md:p-16 text-center border"
          style={{
            borderColor: "hsl(var(--primary)/0.2)",
            background: "radial-gradient(ellipse at 50% 0%, hsl(var(--primary)/0.07) 0%, transparent 70%)",
          }}
        >
          <ParticleField />
          <div className="relative z-10">
            <p className="text-xs uppercase tracking-[0.3em] mb-3" style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>Experience the Vision</p>
            <h2 className="font-light mb-4" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2rem,4vw,3.2rem)", color: "hsl(var(--foreground))" }}>
              Step Inside {project.title}
            </h2>
            <p className="text-sm max-w-md mx-auto mb-8" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}>
              Walk through photorealistic spaces before a single brick is laid. Powered by Unreal Engine Pixel Streaming.
            </p>
            <motion.button
              onClick={() => { haptic.confirm(); onLaunchExperience(); }}
              whileTap={{ scale: 0.97 }}
              className="relative inline-flex items-center gap-3 px-10 py-4 rounded-2xl font-medium text-lg overflow-hidden group"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 8px 32px hsl(var(--primary)/0.3)", fontFamily: "var(--font-body)" }}
              onMouseEnter={() => haptic()}
            >
              <motion.div
                initial={{ x: "-100%" }}
                whileHover={{ x: "200%" }}
                transition={{ duration: 0.6 }}
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none"
              />
              <Play size={20} fill="currentColor" strokeWidth={0} />
              Start Immersive Experience
            </motion.button>
          </div>
        </motion.section>

      </div>
    </div>
  );
}
