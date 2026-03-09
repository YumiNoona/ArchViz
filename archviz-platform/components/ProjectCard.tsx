"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, Calendar } from "lucide-react";
import { Project } from "@/data/projects";
import { cn } from "@/lib/utils";

const typeColors: Record<string, string> = {
  Residential: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Commercial: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  "Mixed-Use": "bg-violet-500/10 text-violet-400 border-violet-500/20",
  Hospitality: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cultural: "bg-rose-500/10 text-rose-400 border-rose-500/20",
};

const gradients: Record<string, string> = {
  "luminara-tower": "from-indigo-900/80 via-violet-900/60 to-slate-900/80",
  "helix-pavilion": "from-blue-900/80 via-cyan-900/60 to-slate-900/80",
  "villa-solara": "from-amber-900/80 via-orange-900/60 to-slate-900/80",
  "nexus-district": "from-purple-900/80 via-indigo-900/60 to-slate-900/80",
  "aurora-resort": "from-teal-900/80 via-emerald-900/60 to-slate-900/80",
  "meridian-museum": "from-rose-900/80 via-pink-900/60 to-slate-900/80",
};

interface ProjectCardProps {
  project: Project;
  index: number;
  onLaunch: (project: Project) => void;
}

export default function ProjectCard({ project, index, onLaunch }: ProjectCardProps) {
  const [hovered, setHovered] = useState(false);

  const gradient = gradients[project.id] || "from-slate-900/80 via-gray-900/60 to-slate-900/80";

  return (
    <motion.article
      className="group relative bg-card border border-border rounded-2xl overflow-hidden cursor-pointer"
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ duration: 0.7, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{
        scale: 1.015,
        y: -4,
        boxShadow: "0 20px 60px hsl(238 84% 67% / 0.12), 0 4px 24px hsl(238 84% 67% / 0.06)",
      }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => onLaunch(project)}
    >
      {/* Image area */}
      <div className="relative h-56 overflow-hidden">
        {/* Gradient background (used as fallback) */}
        <div className={cn("absolute inset-0 bg-gradient-to-br", gradient)} />

        {/* Architectural SVG visualization */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <ProjectSvg id={project.id} />
        </div>

        {/* Hover overlay */}
        <motion.div
          className="absolute inset-0 bg-primary/10"
          animate={{ opacity: hovered ? 1 : 0 }}
          transition={{ duration: 0.3 }}
        />

        {/* Type badge */}
        <div className="absolute top-4 left-4">
          <span
            className={cn(
              "text-[10px] font-medium tracking-wider uppercase px-2.5 py-1 rounded-full border",
              typeColors[project.type] || "bg-muted text-muted-foreground border-border"
            )}
          >
            {project.type}
          </span>
        </div>

        {/* Arrow icon on hover */}
        <motion.div
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-primary/90 flex items-center justify-center"
          initial={{ opacity: 0, scale: 0.6 }}
          animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.6 }}
          transition={{ duration: 0.2 }}
        >
          <ArrowUpRight size={14} className="text-white" />
        </motion.div>

        {/* Featured badge */}
        {project.featured && (
          <div className="absolute bottom-4 right-4">
            <span className="text-[9px] font-medium tracking-widest uppercase px-2 py-0.5 rounded-full bg-primary/20 text-primary border border-primary/30">
              Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        <h3
          className="text-xl font-light mb-2 group-hover:text-primary transition-colors duration-300"
          style={{ fontFamily: "var(--font-display)" }}
        >
          {project.title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
          {project.description}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 text-xs text-muted-foreground mb-5">
          <span className="flex items-center gap-1">
            <MapPin size={10} />
            {project.location}
          </span>
          <span className="flex items-center gap-1">
            <Calendar size={10} />
            {project.year}
          </span>
        </div>

        {/* Launch button */}
        <button
          className="w-full py-2.5 rounded-xl border border-border/60 text-sm font-medium text-muted-foreground 
            hover:bg-primary hover:text-primary-foreground hover:border-primary 
            transition-all duration-300 group-hover:border-primary/30"
          onClick={(e) => {
            e.stopPropagation();
            onLaunch(project);
          }}
        >
          Launch Experience
        </button>
      </div>
    </motion.article>
  );
}

// Unique SVG per project type
function ProjectSvg({ id }: { id: string }) {
  const svgs: Record<string, React.ReactNode> = {
    "luminara-tower": (
      <svg width="140" height="180" viewBox="0 0 140 180" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white">
        <rect x="45" y="20" width="50" height="150" />
        <rect x="55" y="10" width="30" height="160" opacity="0.5" />
        {Array.from({ length: 16 }).map((_, i) => (
          <line key={i} x1="45" y1={20 + i * 9} x2="95" y2={20 + i * 9} opacity="0.3" />
        ))}
        <line x1="70" y1="0" x2="70" y2="20" />
      </svg>
    ),
    "helix-pavilion": (
      <svg width="160" height="140" viewBox="0 0 160 140" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white">
        <ellipse cx="80" cy="70" rx="60" ry="40" />
        <ellipse cx="80" cy="70" rx="40" ry="25" opacity="0.5" />
        <ellipse cx="80" cy="70" rx="20" ry="12" opacity="0.3" />
        <line x1="80" y1="30" x2="80" y2="110" opacity="0.3" />
        <line x1="20" y1="70" x2="140" y2="70" opacity="0.3" />
      </svg>
    ),
    "villa-solara": (
      <svg width="180" height="130" viewBox="0 0 180 130" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white">
        <polygon points="90,20 150,70 30,70" />
        <rect x="40" y="70" width="100" height="50" />
        <rect x="75" y="85" width="30" height="35" opacity="0.5" />
        {Array.from({ length: 4 }).map((_, i) => (
          <rect key={i} x={50 + i * 22} y="80" width="14" height="16" opacity="0.3" />
        ))}
      </svg>
    ),
  };

  return (
    <>{svgs[id] || (
      <svg width="160" height="160" viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-white">
        <rect x="30" y="30" width="100" height="100" />
        <rect x="50" y="50" width="60" height="60" opacity="0.5" />
        <line x1="30" y1="30" x2="50" y2="50" opacity="0.3" />
        <line x1="130" y1="30" x2="110" y2="50" opacity="0.3" />
        <line x1="30" y1="130" x2="50" y2="110" opacity="0.3" />
        <line x1="130" y1="130" x2="110" y2="110" opacity="0.3" />
      </svg>
    )}</>
  );
}
