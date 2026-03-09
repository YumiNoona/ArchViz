"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { LayoutGrid, Sliders } from "lucide-react";
import { projects, Project, ProjectType } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import ProjectCarousel, { CarouselStyle } from "./ProjectCarousel";
import LaunchModal from "./LaunchModal";
import { haptic, cn } from "@/lib/utils";
import { useDebug } from "./DebugPanel";

const filters: Array<ProjectType | "All"> = ["All","Residential","Commercial","Mixed-Use","Hospitality","Cultural"];

export default function ProjectGrid() {
  const [filter, setFilter] = useState<ProjectType | "All">("All");
  const [selected, setSelected] = useState<Project | null>(null);
  const [view, setView] = useState<"grid" | "carousel">("carousel");
  const { carouselStyle } = useDebug();

  const filtered = filter === "All" ? projects : projects.filter((p) => p.type === filter);

  return (
    <section id="projects" className="relative py-28 overflow-hidden" aria-labelledby="projects-title">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 mb-12">
          <div>
            <motion.span className="text-xs font-medium tracking-[0.15em] uppercase text-primary/70 block mb-3"
              initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
              — Portfolio
            </motion.span>
            <motion.h2 id="projects-title" className="font-light leading-tight"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.5rem,5vw,4rem)" }}
              initial={{ opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: 0.1 }}>
              Live Projects
            </motion.h2>
          </div>

          <motion.div className="flex items-center gap-3 flex-wrap"
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 0.2 }}>
            <div className="flex items-center gap-1.5 flex-wrap">
              {filters.map((f) => {
                const count = f === "All" ? projects.length : projects.filter(p => p.type === f).length;
                const active = filter === f;
                return (
                  <motion.button key={f} onClick={() => { haptic(5); setFilter(f); }}
                    className={cn("relative px-3.5 py-1.5 rounded-full text-xs transition-all duration-200",
                      active ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground border border-border")}
                    whileTap={{ scale: 0.95 }}>
                    {active && <motion.span layoutId="proj-filter" className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }} />}
                    <span className="relative">{f} <span className="opacity-50">{count}</span></span>
                  </motion.button>
                );
              })}
            </div>

            <div className="flex items-center gap-0.5 p-1 rounded-xl border"
              style={{ background: "hsl(var(--muted)/0.6)", borderColor: "hsl(var(--border)/0.5)" }}>
              {([["carousel", Sliders], ["grid", LayoutGrid]] as const).map(([v, Icon]) => (
                <button key={v} onClick={() => { haptic(5); setView(v); }}
                  className={cn("w-8 h-7 rounded-lg flex items-center justify-center transition-all",
                    view === v ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground")}>
                  <Icon size={13} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        <motion.div layout>
          {view === "carousel" ? (
            <motion.div key="carousel" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              <ProjectCarousel projects={filtered} onLaunch={(p) => { haptic(10); setSelected(p); }} style={carouselStyle as CarouselStyle} />
            </motion.div>
          ) : (
            <motion.div key="grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
              {filtered.map((p, i) => (
                <ProjectCard key={p.id} project={p} index={i} onLaunch={(p) => { haptic(10); setSelected(p); }} />
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {selected && <LaunchModal project={selected} onClose={() => setSelected(null)} />}
    </section>
  );
}
