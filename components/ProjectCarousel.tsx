"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, MapPin, Star } from "lucide-react";
import type { Project } from "@/lib/supabase";

export type CarouselStyle = "fan-3d" | "drift" | "stack" | "reveal" | "filmstrip" | "dynamic";

interface CarouselProps {
  projects: Project[];
  style?: CarouselStyle;
  onLaunch: (project: Project) => void;
  onViewStory?: (project: Project) => void;
  onViewUpdates?: (project: Project) => void;
  onExplore?: (project: Project) => void;
}

function wrap(i: number, len: number) { return ((i % len) + len) % len; }

// ── Shared Explore button ─────────────────────────────────────────────────────

function ExploreBtn({ project, onExplore }: { project: Project; onExplore?: (p: Project) => void }) {
  if (!onExplore) return null;
  return (
    <motion.button
      onClick={(e: React.MouseEvent) => { e.stopPropagation(); onExplore(project); }}
      className="btn-vercel w-full flex items-center justify-center gap-2 py-2.5"
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
    setActive(wrap(idx, projects.length));
  }, [projects.length]);

  useEffect(() => {
    if (paused) return;
    autoRef.current = setInterval(() => setActive(a => wrap(a + 1, projects.length)), 6000);
    return () => clearInterval(autoRef.current);
  }, [paused, projects.length]);

  const getPos = (offset: number) => {
    const positions: Record<number, { x: number; z: number; ry: number; scale: number; opacity: number; zIndex: number }> = {
      [-2]: { x: -340, z: -180, ry: 40, scale: 0.7, opacity: 0.2, zIndex: 0 },
      [-1]: { x: -220, z: -90,  ry: 25, scale: 0.85, opacity: 0.6, zIndex: 1 },
      [0]:  { x: 0,    z: 0,   ry: 0,  scale: 1.0,  opacity: 1.0, zIndex: 10 },
      [1]:  { x: 220,  z: -90,  ry: -25,scale: 0.85, opacity: 0.6, zIndex: 1 },
      [2]:  { x: 340,  z: -180, ry: -40,scale: 0.7, opacity: 0.2, zIndex: 0 },
    };
    return positions[offset] ?? { x: 0, z: -300, ry: 0, scale: 0.5, opacity: 0, zIndex: 0 };
  };

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="relative flex items-center justify-center h-[520px]" style={{ perspective: 1200 }}>
        {projects.map((p, i) => {
          const offset = wrap(i - active, projects.length);
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
                stiffness: 180,
                damping: 30,
              }}
              className="absolute w-[320px] cursor-pointer"
              style={{
                zIndex: pos.zIndex,
                transformStyle: "preserve-3d",
              }}
              onClick={() => !isActive && goto(i)}
            >
              <div className={`bevel-card overflow-hidden bg-secondary/80 backdrop-blur-xl ${isActive ? "border-vastu-green/20" : ""}`}>
                {/* Image */}
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-80" />
                  
                  {p.featured && (
                    <div className="absolute top-4 left-4">
                      <span className="px-2 py-0.5 rounded-full bg-vastu-green/20 border border-vastu-green/30 text-vastu-green text-[10px] uppercase font-bold tracking-widest backdrop-blur-md">
                        Featured
                      </span>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-xl font-medium tracking-tight mb-1">{p.title}</p>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground uppercase tracking-widest font-medium">
                      <MapPin size={10} className="text-vastu-green" />{p.location}
                    </div>
                  </div>
                </div>

                {/* Sub-panel */}
                <AnimatePresence>
                  {isActive && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                      className="p-5 border-t border-border bg-background/50"
                    >
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
                        {p.description}
                      </p>
                      <ExploreBtn project={p} onExplore={onExplore} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-8 mt-4">
        <button
          onClick={() => goto(active - 1)}
          className="p-2.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
        >
          <ChevronLeft size={20} />
        </button>

        <div className="flex gap-2">
          {projects.map((_, i) => (
            <button
              key={i}
              onClick={() => goto(i)}
              className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-vastu-green" : "w-1.5 bg-border hover:bg-muted-foreground/30"}`}
            />
          ))}
        </div>

        <button
          onClick={() => goto(active + 1)}
          className="p-2.5 rounded-full bg-secondary border border-border text-muted-foreground hover:text-foreground hover:border-foreground/20 transition-all"
        >
          <ChevronRight size={20} />
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
    <div className="relative aspect-[21/9] rounded-2xl overflow-hidden border border-border bg-secondary/20">
      <AnimatePresence mode="wait">
        <motion.img 
          key={p.id} 
          src={p.image_url} 
          alt={p.title} 
          initial={{ opacity: 0, scale: 1.05 }} 
          animate={{ opacity: 1, scale: 1 }} 
          exit={{ opacity: 0 }} 
          transition={{ duration: 0.8 }} 
          className="absolute inset-0 w-full h-full object-cover" 
        />
      </AnimatePresence>
      <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/40 to-transparent" />
      
      <AnimatePresence mode="wait">
        <motion.div 
          key={p.id} 
          initial={{ opacity: 0, x: -20 }} 
          animate={{ opacity: 1, x: 0 }} 
          exit={{ opacity: 0, x: 20 }} 
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} 
          className="absolute inset-0 flex flex-col justify-center px-12 max-w-lg"
        >
          <p className="text-[10px] uppercase tracking-widest font-bold text-vastu-green mb-3">{p.type} · {p.year}</p>
          <h2 className="text-5xl font-medium tracking-tight text-foreground mb-4">{p.title}</h2>
          <p className="text-muted-foreground mb-8 text-lg font-light leading-relaxed line-clamp-2">{p.description}</p>
          <div className="w-56">
            <ExploreBtn project={p} onExplore={onExplore} />
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute top-1/2 -translate-y-1/2 right-8 flex flex-col gap-3">
        <button onClick={() => setActive(wrap(active - 1, projects.length))} className="p-3 rounded-full bg-background/50 border border-white/10 backdrop-blur-md text-white/50 hover:text-white transition-colors"><ChevronLeft size={20} /></button>
        <button onClick={() => setActive(wrap(active + 1, projects.length))} className="p-3 rounded-full bg-background/50 border border-white/10 backdrop-blur-md text-white/50 hover:text-white transition-colors"><ChevronRight size={20} /></button>
      </div>
    </div>
  );
}

// ── Stack ─────────────────────────────────────────────────────────────────────

function StackCarousel({ projects, onExplore }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const [active, setActive] = useState(0);
  const next = () => setActive(wrap(active + 1, projects.length));
  const p = projects[active];

  return (
    <div className="flex flex-col items-center py-10">
      <div className="relative w-[360px] h-[480px]" style={{ perspective: 1000 }}>
        {projects.map((proj, i) => {
          const offset = wrap(i - active, projects.length);
          if (offset >= 3) return null;
          return (
            <motion.div
              key={proj.id}
              animate={{ 
                y: -offset * 12, 
                z: -offset * 40, 
                scale: 1 - offset * 0.05, 
                opacity: 1 - offset * 0.3,
                filter: `blur(${offset * 1}px)`
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="absolute inset-0 rounded-2xl overflow-hidden bevel-card bg-secondary/80 cursor-pointer origin-bottom"
              style={{ zIndex: projects.length - offset }}
              onClick={next}
            >
              <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover" />
              {offset === 0 && (
                <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-background via-transparent to-transparent">
                  <div className="mb-4">
                    <p className="text-2xl font-medium tracking-tight text-white mb-1">{proj.title}</p>
                    <p className="text-xs text-vastu-green uppercase tracking-widest font-bold">{proj.location}</p>
                  </div>
                  <ExploreBtn project={proj} onExplore={onExplore} />
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

// ── Filmstrip ─────────────────────────────────────────────────────────────────

function FilmstripCarousel({ projects, onExplore }: CarouselProps & { onExplore?: (p: Project) => void }) {
  const [active, setActive] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      const el = scrollRef.current;
      const card = el.children[active] as HTMLElement;
      if (card) {
        el.scrollTo({ left: card.offsetLeft - el.clientWidth / 2 + card.clientWidth / 2, behavior: "smooth" });
      }
    }
  }, [active]);

  return (
    <div className="w-full space-y-8">
      <div ref={scrollRef} className="flex gap-6 overflow-x-auto no-scrollbar py-4 px-[10%]">
        {projects.map((proj, i) => (
          <motion.div
            key={proj.id}
            animate={{ 
              scale: i === active ? 1 : 0.9, 
              opacity: i === active ? 1 : 0.4 
            }}
            onClick={() => setActive(i)}
            className={`w-[450px] shrink-0 rounded-2xl overflow-hidden bevel-card transition-all duration-500 cursor-pointer ${i === active ? "ring-2 ring-vastu-green/20" : ""}`}
          >
            <div className="aspect-video relative">
              <img src={proj.image_url} alt={proj.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />
              <div className="absolute bottom-6 left-6">
                <h3 className="text-2xl font-medium tracking-tight text-white">{proj.title}</h3>
                <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold mt-1">{proj.type}</p>
              </div>
            </div>
            {i === active && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="p-6 bg-background/50 border-t border-border"
              >
                <ExploreBtn project={proj} onExplore={onExplore} />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
      
      <div className="flex justify-center gap-2">
        {projects.map((_, i) => (
          <button 
            key={i} 
            onClick={() => setActive(i)} 
            className={`h-1.5 rounded-full transition-all duration-500 ${i === active ? "w-8 bg-vastu-green" : "w-1.5 bg-border hover:bg-muted-foreground/30"}`}
          />
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
    case "filmstrip": return <FilmstripCarousel {...props} />;
    case "reveal":    return <RevealCarousel {...props} />;
    default:          return <Fan3DCarousel {...props} />;
  }
}
