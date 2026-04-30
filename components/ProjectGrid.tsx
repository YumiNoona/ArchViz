"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { ArrowUpRight, MapPin, LayoutGrid, Rows3, Filter } from "lucide-react";
import Image from "next/image";
import { getActiveProjects, Project, ProjectType } from "@/lib/supabase";
import ProjectCarousel, { CarouselStyle } from "./ProjectCarousel";



import { animate } from "animejs";

function ProjectCard({
  project,
  index,
  onExplore,
  theme,
}: {
  project: Project;
  index: number;
  onExplore: (p: Project) => void;
  theme?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const [hovered, setHovered] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);

  useEffect(() => {
    if (iconRef.current) {
      animate(iconRef.current, {
        rotate: hovered ? 45 : 0,
        scale: hovered ? 1.15 : 1,
        duration: 250,
        easing: "easeOutCubic",
      });
    }
  }, [hovered]);

  // Pick theme-aware image
  const imgSrc =
    (theme === "light" && project.image_url_light) ||
    (theme === "dark" && project.image_url_dark) ||
    project.image_url;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: Math.min(index * 0.08, 0.3), ease: [0.16, 1, 0.3, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="group cursor-pointer"
      onClick={() => onExplore(project)}
    >
      <div className="relative overflow-hidden bg-secondary/30 h-full flex flex-col rounded-[2.5rem] border border-white/5 group-hover:border-brand-accent/20 group-hover:bg-secondary/50 transition-all duration-300 shadow-2xl group-hover:shadow-brand-accent/5">
        <div className="relative h-64 overflow-hidden bg-secondary/50">
          {/* Skeleton shimmer shown until image loads */}
          {!imgLoaded && (
            <div className="absolute inset-0 bg-secondary/60 animate-pulse" />
          )}
          <motion.div
            className="w-full h-full"
            animate={{ scale: hovered ? 1.05 : 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <Image
              src={imgSrc}
              alt={project.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className={`object-cover transition-opacity duration-500 ${imgLoaded ? "opacity-100" : "opacity-0"}`}
              onLoad={() => setImgLoaded(true)}
              loading={index < 3 ? "eager" : "lazy"}
              priority={index < 3}
            />
          </motion.div>
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
        </div>

        <div className="p-8 flex-1 flex flex-col">
          <div className="flex items-start justify-between mb-4">
            <h3 className={`text-2xl font-medium tracking-tight transition-colors ${hovered ? "text-brand-accent" : "text-foreground"}`}>
              {project.title}
            </h3>
            <div 
              ref={iconRef}
              className={`w-9 h-9 rounded-full border transition-all duration-500 flex items-center justify-center ${hovered ? "border-brand-accent/50 text-brand-accent" : "border-white/10 text-muted-foreground"}`}
            >
              <ArrowUpRight size={18} />
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={14} className="text-muted-foreground" />
            <span className="text-xs text-muted-foreground font-light">{project.location}</span>
            <span className="mx-2 w-1 h-1 rounded-full bg-border" />
            <span className="text-xs text-muted-foreground font-light">{project.year}</span>
          </div>

          <p className="text-sm text-muted-foreground/80 line-clamp-2 font-light leading-relaxed mb-8 flex-1">
            {project.description}
          </p>


        </div>
      </div>
    </motion.div>
  );
}

export default function ProjectGrid({
  onSelectProject,
  initialProjects,
}: {
  onSelectProject: (p: Project) => void;
  initialProjects?: Project[] | null;
}) {
  const [projects, setProjects] = useState<Project[]>(initialProjects ?? []);
  const [loading, setLoading] = useState(!initialProjects);
  const [view, setView] = useState<"carousel" | "grid">("grid");
  const [theme, setTheme] = useState<string>("dark");
  const carouselStyle = "dynamic";

  useEffect(() => {
    // If initialProjects arrives after mount (race condition), update state
    if (initialProjects && initialProjects.length > 0) {
      setProjects(initialProjects);
      setLoading(false);
      return;
    }
    // Fallback: fetch if nothing was prefetched
    if (projects.length === 0) {
      getActiveProjects().then(d => { setProjects(d); setLoading(false); });
    }
  }, [initialProjects, projects.length]);

  // Track theme for image switching
  useEffect(() => {
    const update = () => {
      setTheme(document.documentElement.classList.contains("light") ? "light" : "dark");
    };
    update();
    const observer = new MutationObserver(update);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  const filtered = projects;
  const handleExplore = (p: Project) => { onSelectProject(p); };

  return (
    <section id="projects" className="py-24 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-6">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="max-w-xl">
            <h2 className="text-4xl md:text-5xl font-medium tracking-tighter mb-4">
              Explore <span className="text-sweep">Featured</span> Projects
            </h2>
            <p className="text-muted-foreground text-lg font-light leading-relaxed">
              A curated selection of our most groundbreaking architectural visualizations.
            </p>
          </div>
 
          {/* Controls */}
          <div className="flex flex-col items-end gap-4">
            <div className="flex items-center gap-2 p-1 bg-secondary border border-border rounded-lg">
              <button 
                onClick={() => setView("grid")}
                className={`p-1.5 rounded-md transition-all ${view === "grid" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <LayoutGrid size={16} />
              </button>
              <button 
                onClick={() => setView("carousel")}
                className={`p-1.5 rounded-md transition-all ${view === "carousel" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
              >
                <Rows3 size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Project Content */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 py-20">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-[16/10] bg-secondary animate-pulse rounded-xl border border-border" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-32 border border-dashed border-border rounded-2xl">
            <p className="text-muted-foreground">No projects found.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {view === "carousel" ? (
              <motion.div 
                key="carousel" 
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="py-10"
              >
                <ProjectCarousel
                  projects={filtered}
                  style={carouselStyle as CarouselStyle || "dynamic"}
                  onLaunch={() => {}}
                  onViewStory={handleExplore}
                  onViewUpdates={handleExplore}
                  onExplore={handleExplore}
                />
              </motion.div>
            ) : (
              <motion.div
                key="grid"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
              >
                {filtered.map((p, i) => (
                  <ProjectCard key={p.id} project={p} index={i} onExplore={handleExplore} theme={theme} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </section>
  );
}
