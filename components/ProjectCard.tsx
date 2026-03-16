"use client";

import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Play, BookOpen, Activity, MapPin, Construction, Star, ChevronRight,
} from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";
import { haptic } from "ios-haptics";
import type { Project } from "@/lib/supabase";

// ─── Props ────────────────────────────────────────────────────────────────────

interface ProjectCardProps {
  project: Project & {
    completion_percent?: number;
    has_live_updates?: boolean;
  };
  index?: number;
  onLaunch: (project: Project) => void;
  onViewStory?: (project: Project) => void;
  onViewUpdates?: (project: Project) => void;
  priority?: boolean;
}

// ─── 3D Tilt Hook ─────────────────────────────────────────────────────────────

function use3DTilt() {
  const [tilt, setTilt] = useState({ x: 0, y: 0, glintX: 50, glintY: 50 });

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width;
    const ny = (e.clientY - rect.top) / rect.height;
    setTilt({ x: -(ny - 0.5) * 16, y: (nx - 0.5) * 16, glintX: nx * 100, glintY: ny * 100 });
  }, []);

  const onMouseLeave = useCallback(() => {
    setTilt({ x: 0, y: 0, glintX: 50, glintY: 50 });
  }, []);

  return { tilt, onMouseMove, onMouseLeave };
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ProjectCard({
  project,
  index = 0,
  onLaunch,
  onViewStory,
  onViewUpdates,
  priority = false,
}: ProjectCardProps) {
  const { config } = useSiteConfig();
  const { resolvedTheme } = useTheme();
  const { tilt, onMouseMove, onMouseLeave } = use3DTilt();
  const [hovered, setHovered] = useState(false);

  const thumbnail =
    resolvedTheme === "dark"
      ? project.image_url_dark || project.image_url
      : project.image_url_light || project.image_url;

  const hoverEffect = config?.cardHoverEffect ?? "glow";

  function cardShadow(): React.CSSProperties {
    if (!hovered) return {};
    if (hoverEffect === "glow") return { boxShadow: "0 0 0 1px hsl(var(--primary)/0.4), 0 20px 60px hsl(var(--primary)/0.12)" };
    if (hoverEffect === "lift") return { transform: "translateY(-8px)" };
    return {};
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.16, 1, 0.3, 1] }}
      style={{ perspective: 900 }}
      onMouseMove={onMouseMove}
      onMouseLeave={() => { onMouseLeave(); setHovered(false); }}
      onMouseEnter={() => { setHovered(true); haptic(); }}
      className="group"
    >
      <motion.div
        animate={{ rotateX: tilt.x, rotateY: tilt.y, ...cardShadow() }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        style={{ transformStyle: "preserve-3d", willChange: "transform", background: "hsl(var(--card))" }}
        className={`relative rounded-2xl overflow-hidden border border-border transition-all duration-500`}
      >
        {/* ── Thumbnail ── */}
        <div className="relative aspect-[4/3] overflow-hidden">
          <motion.img
            src={thumbnail}
            alt={project.title}
            loading={priority ? "eager" : "lazy"}
            animate={{ scale: hovered ? 1.06 : 1 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="w-full h-full object-cover"
          />

          {/* Cursor-tracked glint */}
          <motion.div
            style={{
              background: `radial-gradient(circle at ${tilt.glintX}% ${tilt.glintY}%, rgba(255,255,255,0.16) 0%, transparent 60%)`,
            }}
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 pointer-events-none"
          />

          {hoverEffect === "tint" && (
            <motion.div
              animate={{ opacity: hovered ? 0.15 : 0 }}
              className="absolute inset-0 pointer-events-none"
              style={{ background: "hsl(var(--primary))" }}
            />
          )}

          <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex items-center gap-2">
            {project.featured && (
              <span
                className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-widest"
                style={{ fontFamily: "var(--font-mono)", background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              >
                <Star size={9} fill="currentColor" strokeWidth={0} />Featured
              </span>
            )}
            <span
              className="px-2 py-0.5 rounded-full bg-black/50 backdrop-blur-sm text-white/70 text-[10px] border border-white/10"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {project.type}
            </span>
          </div>

          {project.has_live_updates && (
            <div className="absolute top-3 right-3 flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-500/20 backdrop-blur-sm border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-emerald-300 text-[10px] uppercase tracking-widest" style={{ fontFamily: "var(--font-mono)" }}>Live</span>
            </div>
          )}

          {project.completion_percent != null && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5" style={{ background: "rgba(255,255,255,0.1)" }}>
              <motion.div
                initial={{ width: 0 }}
                whileInView={{ width: `${project.completion_percent}%` }}
                viewport={{ once: true }}
                transition={{ duration: 1.4, ease: "easeOut", delay: 0.3 }}
                className="h-full"
                style={{ background: "hsl(var(--primary))" }}
              />
            </div>
          )}
        </div>

        {/* ── Body ── */}
        <div className="p-5" style={{ background: "hsl(var(--card))" }}>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3
              className="font-light leading-tight text-xl"
              style={{ fontFamily: "var(--font-display)", color: "hsl(var(--foreground))" }}
            >
              {project.title}
            </h3>
            <span
              className="shrink-0 text-xs px-1.5 py-0.5 rounded border mt-0.5"
              style={{
                fontFamily: "var(--font-mono)",
                color: "hsl(var(--primary))",
                background: "hsl(var(--primary)/0.08)",
                borderColor: "hsl(var(--primary)/0.2)",
              }}
            >
              {project.year}
            </span>
          </div>

          <div
            className="flex items-center gap-1.5 text-xs mb-3"
            style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}
          >
            <MapPin size={11} />
            {project.location}
          </div>

          <p
            className="text-sm leading-relaxed line-clamp-2 mb-4"
            style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)" }}
          >
            {project.description}
          </p>

          {project.completion_percent != null && (
            <div className="flex items-center gap-2 mb-4">
              <Construction size={12} style={{ color: "hsl(var(--primary)/0.7)" }} />
              <div className="flex-1 h-1 rounded-full" style={{ background: "hsl(var(--border))" }}>
                <div
                  className="h-full rounded-full"
                  style={{ width: `${project.completion_percent}%`, background: "hsl(var(--primary))" }}
                />
              </div>
              <span className="text-xs" style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>
                {project.completion_percent}%
              </span>
            </div>
          )}

          {/* Story + Updates buttons */}
          {(onViewStory || onViewUpdates) && (
            <div className="grid grid-cols-2 gap-2 mb-2">
              {onViewStory && (
                <motion.button
                  onClick={() => { haptic(); onViewStory(project); }}
                  whileTap={{ scale: 0.96 }}
                  className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs border transition-all duration-200"
                  style={{
                    background: "hsl(var(--surface-1))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "hsl(var(--primary)/0.4)";
                    e.currentTarget.style.color = "hsl(var(--primary))";
                    e.currentTarget.style.background = "hsl(var(--primary)/0.06)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "hsl(var(--border))";
                    e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                    e.currentTarget.style.background = "hsl(var(--surface-1))";
                  }}
                >
                  <BookOpen size={13} />View Story
                </motion.button>
              )}

              {onViewUpdates && (
                <motion.button
                  onClick={() => { haptic(); onViewUpdates(project); }}
                  whileTap={{ scale: 0.96 }}
                  className="relative flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs border transition-all duration-200"
                  style={{
                    background: "hsl(var(--surface-1))",
                    borderColor: "hsl(var(--border))",
                    color: "hsl(var(--muted-foreground))",
                    fontFamily: "var(--font-body)",
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = "rgba(52,211,153,0.4)";
                    e.currentTarget.style.color = "rgb(52,211,153)";
                    e.currentTarget.style.background = "rgba(52,211,153,0.06)";
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = "hsl(var(--border))";
                    e.currentTarget.style.color = "hsl(var(--muted-foreground))";
                    e.currentTarget.style.background = "hsl(var(--surface-1))";
                  }}
                >
                  {project.has_live_updates && (
                    <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  )}
                  <Activity size={13} />Site Updates
                </motion.button>
              )}
            </div>
          )}

          {/* Primary CTA */}
          <motion.button
            onClick={() => { haptic.confirm(); onLaunch(project); }}
            whileTap={{ scale: 0.97 }}
            className="relative w-full overflow-hidden flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-medium text-sm group/cta"
            style={{
              background: "hsl(var(--primary))",
              color: "hsl(var(--primary-foreground))",
              fontFamily: "var(--font-body)",
              boxShadow: "0 4px 20px hsl(var(--primary)/0.22)",
            }}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={hovered ? { x: "200%" } : { x: "-100%" }}
              transition={{ duration: 0.65, ease: "easeInOut" }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none"
            />
            <Play size={14} fill="currentColor" strokeWidth={0} />
            Start Experience
            <ChevronRight size={14} className="ml-auto group-hover/cta:translate-x-0.5 transition-transform" />
          </motion.button>
        </div>

        {hoverEffect === "border-trace" && hovered && (
          <div className="absolute inset-0 rounded-2xl pointer-events-none"
            style={{ boxShadow: "inset 0 0 0 1px hsl(var(--primary)/0.45)" }} />
        )}
      </motion.div>
    </motion.div>
  );
}
