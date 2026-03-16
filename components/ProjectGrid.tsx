"use client";

/**
 * ProjectGrid.tsx
 * Shows projects in Carousel or Grid view.
 * Does NOT manage the detail page — that lives in page.tsx.
 * Props:
 *   onSelectProject(p) — called when user clicks Explore on any card/carousel item
 */

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowUpRight, MapPin, LayoutGrid, Rows3 } from "lucide-react";
import { getProjects, Project, ProjectType } from "@/lib/supabase";
import ProjectCarousel, { CarouselStyle } from "./ProjectCarousel";
import { haptic } from "ios-haptics";
import { useDebug } from "./DebugPanel";

const GOLD = "#c4a478";
const BG = "#080604";

const FILTERS: Array<ProjectType | "All"> = [
  "All", "Residential", "Commercial", "Mixed-Use", "Hospitality", "Cultural",
];

// ── Label ─────────────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-3">
      <div className="w-4 h-px" style={{ background: GOLD }} />
      <span className="text-xs uppercase tracking-[0.25em]" style={{ color: "rgba(196,164,120,0.55)", fontFamily: "var(--font-mono)" }}>
        {children}
      </span>
    </div>
  );
}

// ── Grid card ─────────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  index,
  onExplore,
}: {
  project: Project;
  index: number;
  onExplore: (p: Project) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setTilt({
      x: ((e.clientY - rect.top) / rect.height - 0.5) * -7,
      y: ((e.clientX - rect.left) / rect.width - 0.5) * 7,
    });
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 48 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.75, delay: index * 0.09, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 1000 }}
      onMouseMove={onMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setTilt({ x: 0, y: 0 }); }}
      className="cursor-pointer"
      onClick={() => { haptic(); onExplore(project); }}
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y }}
        transition={{ type: "spring", stiffness: 200, damping: 26 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative rounded-2xl overflow-hidden"
      >
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={project.image_url}
            alt={project.title}
            loading="lazy"
            animate={{ scale: hovered ? 1.07 : 1 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover"
          />

          {/* Overlay */}
          <div
            className="absolute inset-0 transition-opacity duration-500"
            style={{
              background: "linear-gradient(to top, rgba(8,6,4,0.95) 0%, rgba(8,6,4,0.25) 55%, transparent 100%)",
              opacity: hovered ? 1 : 0.75,
            }}
          />

          {/* Shimmer */}
          <motion.div
            animate={{ opacity: hovered ? 1 : 0, x: hovered ? "200%" : "-100%" }}
            transition={{ duration: 0.65, ease: "easeInOut" }}
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg, transparent 40%, rgba(196,164,120,0.1) 50%, transparent 60%)" }}
          />

          {/* Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            {project.featured && (
              <span
                className="text-[10px] px-2 py-1 rounded-full uppercase tracking-wider"
                style={{ background: "rgba(196,164,120,0.15)", border: "1px solid rgba(196,164,120,0.3)", color: GOLD, fontFamily: "var(--font-mono)", backdropFilter: "blur(8px)" }}
              >
                Featured
              </span>
            )}
            <span
              className="text-[10px] px-2 py-1 rounded-full uppercase tracking-wider"
              style={{ background: "rgba(8,6,4,0.55)", border: "1px solid rgba(196,164,120,0.15)", color: "rgba(196,164,120,0.65)", fontFamily: "var(--font-mono)", backdropFilter: "blur(8px)" }}
            >
              {project.type}
            </span>
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-xl font-light leading-tight mb-1.5" style={{ fontFamily: "var(--font-display)", color: "rgba(245,235,215,0.95)" }}>
              {project.title}
            </h3>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: "rgba(196,164,120,0.5)" }}>
              <MapPin size={10} />
              <span style={{ fontFamily: "var(--font-mono)" }}>{project.location} · {project.year}</span>
            </div>
          </div>
        </div>

        {/* Explore CTA — appears on hover */}
        <motion.div
          animate={{ opacity: hovered ? 1 : 0, y: hovered ? 0 : 10 }}
          transition={{ duration: 0.22 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
        >
          <div
            className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium"
            style={{ background: "rgba(196,164,120,0.95)", color: BG, backdropFilter: "blur(10px)", boxShadow: "0 8px 32px rgba(196,164,120,0.3)" }}
          >
            Explore Project <ArrowUpRight size={13} />
          </div>
        </motion.div>

        {/* Border */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
          style={{ border: `1px solid ${hovered ? "rgba(196,164,120,0.3)" : "rgba(196,164,120,0.08)"}` }}
        />
      </motion.div>
    </motion.div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export default function ProjectGrid({ onSelectProject }: { onSelectProject: (p: Project) => void }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ProjectType | "All">("All");
  const [view, setView] = useState<"carousel" | "grid">("carousel");
  const { carouselStyle } = useDebug();

  useEffect(() => {
    getProjects().then(d => { setProjects(d); setLoading(false); });
  }, []);

  const filtered = filter === "All" ? projects : projects.filter(p => p.type === filter);

  const handleExplore = (p: Project) => { haptic(); onSelectProject(p); };

  return (
    <section id="projects" className="py-28" style={{ background: BG }}>
      <div className="max-w-7xl mx-auto px-8 lg:px-16">

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-10 mb-14">
          <div>
            <SectionLabel>Portfolio</SectionLabel>
            <h2
              className="font-light leading-[0.9]"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 5vw, 5rem)", color: "rgba(245,235,215,0.95)", letterSpacing: "-0.02em" }}
            >
              Selected<br />
              <span style={{ color: GOLD, fontStyle: "italic" }}>Projects</span>
            </h2>
          </div>

          <div className="flex flex-col items-end gap-4">
            {/* View toggle */}
            <div
              className="flex items-center p-1 rounded-xl"
              style={{ background: "rgba(196,164,120,0.04)", border: "1px solid rgba(196,164,120,0.1)" }}
            >
              {([
                { v: "carousel" as const, Icon: Rows3, label: "Carousel" },
                { v: "grid" as const, Icon: LayoutGrid, label: "Grid" },
              ]).map(({ v, Icon, label }) => (
                <motion.button
                  key={v}
                  onClick={() => { setView(v); haptic(); }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-all duration-200"
                  style={{
                    background: view === v ? "rgba(196,164,120,0.13)" : "transparent",
                    color: view === v ? GOLD : "rgba(196,164,120,0.35)",
                    border: view === v ? "1px solid rgba(196,164,120,0.28)" : "1px solid transparent",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  <Icon size={12} />{label}
                </motion.button>
              ))}
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap justify-end">
              {FILTERS.map(f => (
                <motion.button
                  key={f}
                  onClick={() => { setFilter(f); haptic(); }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="px-4 py-1.5 rounded-full text-xs transition-all duration-200"
                  style={{
                    background: filter === f ? "rgba(196,164,120,0.1)" : "transparent",
                    border: `1px solid ${filter === f ? "rgba(196,164,120,0.38)" : "rgba(196,164,120,0.13)"}`,
                    color: filter === f ? GOLD : "rgba(196,164,120,0.38)",
                    fontFamily: "var(--font-mono)",
                  }}
                >
                  {f}
                </motion.button>
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center py-32">
            <div className="w-6 h-6 rounded-full border border-current border-t-transparent animate-spin" style={{ color: "rgba(196,164,120,0.4)" }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24 text-sm" style={{ color: "rgba(196,164,120,0.3)" }}>No projects in this category yet.</div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "carousel" ? (
              <motion.div key="carousel" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.38 }}>
                {/*
                  Pass a custom onExplore so carousel's "Story"/"Updates" buttons
                  open the detail page instead of a separate blog view.
                  "Start Experience" still launches directly.
                  We pass onViewStory/onViewUpdates = handleExplore to open detail.
                */}
                <ProjectCarousel
                  projects={filtered}
                  style={carouselStyle as CarouselStyle}
                  onLaunch={() => {}} // LaunchModal is handled via page.tsx — carousel passes up
                  onViewStory={handleExplore}
                  onViewUpdates={handleExplore}
                  onExplore={handleExplore}
                />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.38 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              >
                {filtered.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} onExplore={handleExplore} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
