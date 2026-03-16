"use client";

/**
 * ProjectCarousel v3
 * Single "Explore Project" button on active card.
 * Styles: fan-3d | drift | stack | reveal | filmstrip
 * New prop: onExplore(project) — opens the full detail page
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, MapPin, Star } from "lucide-react";
import { haptic } from "ios-haptics";
import type { Project } from "@/lib/supabase";

export type CarouselStyle = "fan-3d" | "drift" | "stack" | "reveal" | "filmstrip";

interface CarouselProps {
  projects: Project[];
  style?: CarouselStyle;
  onLaunch: (project: Project) => void;
  onViewStory?: (project: Project) => void;
  onViewUpdates?: (project: Project) => void;
  onExplore?: (project: Project) => void;
}

const GOLD = "#c4a478";
const GOLD_DIM = "rgba(196,164,120,0.5)";
const GOLD_FAINT = "rgba(196,164,120,0.12)";
const BG = "#080604";

function wrap(i: number, len: number) { return ((i % len) + len) % len; }

// ── Shared Explore button ─────────────────────────────────────────────────────

function ExploreBtn({ project, onExplore }: { project: Project; onExplore?: (p: Project) => void }) {
  if (!onExplore) return null;
  return (
    <motion.button
      onClick={e => { e.stopPropagation(); haptic.confirm(); onExplore(project); }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium"
      style={{ background: GOLD, color: BG }}
    >
      Explore Project <ArrowUpRight size={13} />
    </motion.button>
  );
}

// ── Fan 3D ────────────────────────────────────────────────────────────────────

function Fan3DCarousel({ projects, onExplore }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const autoRef = useRef<ReturnType<typeof setInterval>>();

  const goto = useCallback((idx: number) => {
    haptic();
    setActive(wrap(idx, projects.length));
  }, [projects.length]);

  useEffect(() => {
    if (paused) return;
    autoRef.current = setInterval(() => setActive(a => wrap(a + 1, projects.length)), 5500);
    return () => clearInterval(autoRef.current);
  }, [paused, projects.length]);

  // Position data for up to 5 visible cards
  const getPos = (offset: number) => {
    const positions: Record<number, { x: number; z: number; ry: number; scale: number; opacity: number; zIndex: number }> = {
      [-2]: { x: -360, z: -140, ry: 32, scale: 0.72, opacity: 0.2, zIndex: 0 },
      [-1]: { x: -210, z: -70,  ry: 20, scale: 0.84, opacity: 0.5, zIndex: 1 },
      [0]:  { x: 0,    z: 0,   ry: 0,  scale: 1.00, opacity: 1.0, zIndex: 10 },
      [1]:  { x: 210,  z: -70,  ry: -20,scale: 0.84, opacity: 0.5, zIndex: 1 },
      [2]:  { x: 360,  z: -140, ry: -32,scale: 0.72, opacity: 0.2, zIndex: 0 },
    };
    return positions[offset] ?? { x: 0, z: -200, ry: 0, scale: 0.5, opacity: 0, zIndex: 0 };
  };

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative flex items-center justify-center" style={{ height: 500, perspective: 1400 }}>
        {projects.map((p, i) => {
          const offset = wrap(i - active, projects.length);
          // Normalise offset to -2..2 range for display
          const norm = offset > projects.length / 2 ? offset - projects.length : offset;
          if (Math.abs(norm) > 2) return null;
          const pos = getPos(norm);
          const isActive = norm === 0;

          return (
            <motion.div
              key={p.id}
              animate={{
                x: pos.x,
                z: pos.z,
                rotateY: pos.ry,
                scale: pos.scale,
                opacity: pos.opacity,
              }}
              transition={{
                type: "spring",
                stiffness: 220,
                damping: 34,
                mass: 0.9,
              }}
              style={{
                zIndex: pos.zIndex,
                transformStyle: "preserve-3d",
                position: "absolute",
                width: 300,
                cursor: isActive ? "default" : "pointer",
              }}
              onClick={() => !isActive && goto(i)}
            >
              <div
                className="rounded-2xl overflow-hidden"
                style={{
                  border: `1px solid ${isActive ? "rgba(196,164,120,0.3)" : "rgba(196,164,120,0.07)"}`,
                  boxShadow: isActive ? "0 24px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,164,120,0.15)" : "none",
                  transition: "box-shadow 0.4s, border-color 0.4s",
                }}
              >
                {/* Image */}
                <div className="relative" style={{ aspectRatio: "4/3" }}>
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" style={{ display: "block" }} />
                  <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(8,6,4,0.9) 0%, rgba(8,6,4,0.2) 50%, transparent 100%)" }} />

                  {p.featured && (
                    <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full text-[10px]" style={{ background: "rgba(196,164,120,0.18)", border: `1px solid rgba(196,164,120,0.3)`, color: GOLD, fontFamily: "var(--font-mono)", backdropFilter: "blur(8px)" }}>
                      <Star size={8} fill={GOLD} strokeWidth={0} />Featured
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="font-light text-lg leading-tight text-white mb-1" style={{ fontFamily: "var(--font-display)" }}>{p.title}</p>
                    <div className="flex items-center gap-1 text-xs" style={{ color: GOLD_DIM }}>
                      <MapPin size={9} />{p.location}
                    </div>
                  </div>
                </div>

                {/* Expanded panel on active card only */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: "rgba(12,10,7,0.98)", overflow: "hidden" }}
                    >
                      <div className="p-4 space-y-3">
                        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "rgba(196,164,120,0.45)", fontFamily: "var(--font-body)" }}>
                          {p.description}
                        </p>
                        <ExploreBtn project={p} onExplore={onExplore} />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Arrows */}
      <div className="flex items-center justify-center gap-6 mt-2">
        <button
          onClick={() => goto(active - 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: "rgba(196,164,120,0.07)", border: `1px solid ${GOLD_FAINT}`, color: GOLD_DIM }}
        >
          <ChevronLeft size={16} />
        </button>

        {/* Dots */}
        <div className="flex gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              className="rounded-full transition-all duration-400"
              style={{
                width: i === active ? 22 : 6,
                height: 6,
                background: i === active ? GOLD : "rgba(196,164,120,0.18)",
              }}
            />
          ))}
        </div>

        <button
          onClick={() => goto(active + 1)}
          className="w-10 h-10 rounded-full flex items-center justify-center transition-all hover:scale-105"
          style={{ background: "rgba(196,164,120,0.07)", border: `1px solid ${GOLD_FAINT}`, color: GOLD_DIM }}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}

// ── Reveal ────────────────────────────────────────────────────────────────────

function RevealCarousel({ projects, onExplore }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const [active, setActive] = useState(0);
  const p = projects[active];

  return (
    <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "16/7", border: `1px solid ${GOLD_FAINT}` }}>
      <AnimatePresence mode="wait">
        <motion.img key={p.id} src={p.image_url} alt={p.title} initial={{ opacity: 0, scale: 1.04 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.6 }} className="absolute inset-0 w-full h-full object-cover" />
      </AnimatePresence>
      <div className="absolute inset-0" style={{ background: "linear-gradient(90deg, rgba(8,6,4,0.88) 0%, rgba(8,6,4,0.4) 55%, transparent 100%)" }} />
      <AnimatePresence mode="wait">
        <motion.div key={p.id} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 24 }} transition={{ duration: 0.42 }} className="absolute inset-0 flex flex-col justify-center pl-10 pr-6 max-w-sm">
          <p className="text-[10px] uppercase tracking-[0.22em] mb-2" style={{ color: GOLD_DIM, fontFamily: "var(--font-mono)" }}>{p.type} · {p.year}</p>
          <h2 className="font-light text-4xl text-white mb-2" style={{ fontFamily: "var(--font-display)" }}>{p.title}</h2>
          <p className="text-sm mb-5 line-clamp-2" style={{ color: "rgba(255,255,255,0.5)" }}>{p.description}</p>
          <ExploreBtn project={p} onExplore={onExplore} />
        </motion.div>
      </AnimatePresence>
      <button onClick={() => { haptic(); setActive(wrap(active - 1, projects.length)); }} className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(8,6,4,0.7)", color: GOLD_DIM }}><ChevronLeft size={16} /></button>
      <button onClick={() => { haptic(); setActive(wrap(active + 1, projects.length)); }} className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center" style={{ background: "rgba(8,6,4,0.7)", color: GOLD_DIM }}><ChevronRight size={16} /></button>
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
        {projects.map((_, i) => (
          <button key={i} onClick={() => { haptic(); setActive(i); }} className="rounded-full transition-all" style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? GOLD : "rgba(255,255,255,0.2)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Stack ─────────────────────────────────────────────────────────────────────

function StackCarousel({ projects, onExplore }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const [active, setActive] = useState(0);
  const next = () => { haptic(); setActive(wrap(active + 1, projects.length)); };
  const prev = () => { haptic(); setActive(wrap(active - 1, projects.length)); };
  const p = projects[active];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="relative w-80 h-[420px]" style={{ perspective: 900 }}>
        {projects.map((proj, i) => {
          const offset = wrap(i - active, projects.length);
          if (offset >= 4) return null;
          return (
            <motion.div
              key={proj.id}
              animate={{ y: -offset * 10, z: -offset * 30, rotateX: offset * 1.5, scale: 1 - offset * 0.04, opacity: 1 - offset * 0.22 }}
              style={{ position: "absolute", inset: 0, zIndex: projects.length - offset, borderRadius: 16, overflow: "hidden", border: `1px solid ${GOLD_FAINT}`, cursor: "pointer" }}
              onClick={next}
            >
              <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover" />
              {offset === 0 && (
                <div className="absolute inset-0 flex flex-col justify-end p-5 space-y-3" style={{ background: "linear-gradient(to top, rgba(8,6,4,0.92) 0%, rgba(8,6,4,0.1) 60%, transparent 100%)" }}>
                  <div>
                    <p className="text-white font-light text-2xl" style={{ fontFamily: "var(--font-display)" }}>{p.title}</p>
                    <p className="text-xs mt-0.5" style={{ color: GOLD_DIM }}>{p.location}</p>
                  </div>
                  <ExploreBtn project={p} onExplore={onExplore} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button onClick={prev} className="p-2.5 rounded-xl" style={{ border: `1px solid ${GOLD_FAINT}`, color: GOLD_DIM }}><ChevronLeft size={16} /></button>
        <button onClick={next} className="p-2.5 rounded-xl" style={{ border: `1px solid ${GOLD_FAINT}`, color: GOLD_DIM }}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

// ── Drift ─────────────────────────────────────────────────────────────────────

function DriftCarousel({ projects, onExplore }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const [active, setActive] = useState(0);
  const [dir, setDir] = useState(1);
  const go = (n: number, d: number) => { haptic(); setDir(d); setActive(wrap(n, projects.length)); };
  const p = projects[active];

  const variants = {
    enter: (d: number) => ({ x: d > 0 ? 260 : -260, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (d: number) => ({ x: d > 0 ? -260 : 260, opacity: 0 }),
  };

  return (
    <div className="relative max-w-xs mx-auto">
      <div className="overflow-hidden rounded-2xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={p.id} custom={dir} variants={variants} initial="enter" animate="center" exit="exit" transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}>
            <div className="relative rounded-2xl overflow-hidden" style={{ aspectRatio: "3/4", border: `1px solid ${GOLD_FAINT}` }}>
              <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex flex-col justify-end p-5 space-y-3" style={{ background: "linear-gradient(to top, rgba(8,6,4,0.92) 0%, rgba(8,6,4,0.15) 60%, transparent 100%)" }}>
                <div>
                  <p className="text-[10px] uppercase tracking-widest mb-1" style={{ color: GOLD_DIM, fontFamily: "var(--font-mono)" }}>{p.type}</p>
                  <p className="font-light text-2xl text-white" style={{ fontFamily: "var(--font-display)" }}>{p.title}</p>
                  <p className="text-xs mt-0.5 line-clamp-2" style={{ color: "rgba(255,255,255,0.45)" }}>{p.description}</p>
                </div>
                <ExploreBtn project={p} onExplore={onExplore} />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex justify-center items-center gap-4 mt-4">
        <button onClick={() => go(active - 1, -1)} className="p-2 rounded-xl" style={{ border: `1px solid ${GOLD_FAINT}`, color: GOLD_DIM }}><ChevronLeft size={16} /></button>
        <div className="flex gap-1.5">
          {projects.map((_, i) => (
            <button key={i} onClick={() => go(i, i > active ? 1 : -1)} className="rounded-full transition-all" style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? GOLD : "rgba(196,164,120,0.18)" }} />
          ))}
        </div>
        <button onClick={() => go(active + 1, 1)} className="p-2 rounded-xl" style={{ border: `1px solid ${GOLD_FAINT}`, color: GOLD_DIM }}><ChevronRight size={16} /></button>
      </div>
    </div>
  );
}

// ── Filmstrip ─────────────────────────────────────────────────────────────────

function FilmstripCarousel({ projects, onExplore }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const [active, setActive] = useState(0);
  const p = projects[active];

  return (
    <div className="w-full overflow-hidden">
      <motion.div
        animate={{ x: `-${active * 284}px` }}
        transition={{ type: "spring", stiffness: 240, damping: 34 }}
        className="flex gap-4 pb-4"
        style={{ width: `${projects.length * 284}px` }}
      >
        {projects.map((proj, i) => (
          <motion.div
            key={proj.id}
            animate={{ scale: i === active ? 1 : 0.93, opacity: i === active ? 1 : 0.45 }}
            onClick={() => { haptic(); setActive(i); }}
            className="w-64 shrink-0 rounded-xl overflow-hidden cursor-pointer"
            style={{ border: `1px solid ${i === active ? "rgba(196,164,120,0.3)" : GOLD_FAINT}` }}
          >
            <div className="relative aspect-video">
              <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 flex items-end p-3" style={{ background: "linear-gradient(to top, rgba(8,6,4,0.8), transparent)" }}>
                <span className="text-white font-light text-base" style={{ fontFamily: "var(--font-display)" }}>{proj.title}</span>
              </div>
            </div>
            {i === active && (
              <div className="p-3" style={{ background: "rgba(12,10,7,0.98)" }}>
                <ExploreBtn project={p} onExplore={onExplore} />
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>
      <div className="flex justify-center gap-1.5 mt-2">
        {projects.map((_, i) => (
          <button key={i} onClick={() => { haptic(); setActive(i); }} className="rounded-full transition-all" style={{ width: i === active ? 20 : 6, height: 6, background: i === active ? GOLD : "rgba(196,164,120,0.18)" }} />
        ))}
      </div>
    </div>
  );
}

// ── Main export ───────────────────────────────────────────────────────────────

export default function ProjectCarousel({ style = "fan-3d", onExplore, ...rest }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const props = { ...rest, onExplore };
  switch (style) {
    case "stack":     return <StackCarousel {...props} />;
    case "drift":     return <DriftCarousel {...props} />;
    case "filmstrip": return <FilmstripCarousel {...props} />;
    case "reveal":    return <RevealCarousel {...props} />;
    default:          return <Fan3DCarousel {...props} />;
  }
}
