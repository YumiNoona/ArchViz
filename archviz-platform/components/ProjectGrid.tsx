"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { projects, Project, ProjectType } from "@/data/projects";
import ProjectCard from "./ProjectCard";
import LaunchModal from "./LaunchModal";
import { haptic } from "@/lib/utils";
import { cn } from "@/lib/utils";

const filters: Array<ProjectType | "All"> = ["All", "Residential", "Commercial", "Mixed-Use", "Hospitality", "Cultural"];

export default function ProjectGrid() {
  const [activeFilter, setActiveFilter] = useState<ProjectType | "All">("All");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = activeFilter === "All"
    ? projects
    : projects.filter((p) => p.type === activeFilter);

  const handleLaunch = (project: Project) => {
    haptic(10);
    setSelectedProject(project);
  };

  return (
    <section
      id="projects"
      className="relative py-32 px-6 overflow-hidden"
      aria-labelledby="projects-title"
    >
      {/* Section ambient light */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80vw] h-[60vh] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse, hsl(238 84% 67% / 0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="mb-16 max-w-xl">
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            <span className="text-xs font-medium tracking-widest uppercase text-primary/70">
              — Portfolio
            </span>
          </motion.div>

          <motion.h2
            id="projects-title"
            className="text-5xl lg:text-6xl font-light leading-tight mb-4"
            style={{ fontFamily: "var(--font-display)" }}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1 }}
          >
            Explore Our
            <br />
            <em className="not-italic text-gradient">Live Projects</em>
          </motion.h2>

          <motion.p
            className="text-muted-foreground text-base leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Step inside each project through real-time Unreal Engine streaming.
            No installation required — just your browser.
          </motion.p>
        </div>

        {/* Filter tabs */}
        <motion.div
          className="flex items-center gap-2 flex-wrap mb-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          {filters.map((filter) => {
            const isActive = activeFilter === filter;
            const count = filter === "All" ? projects.length : projects.filter(p => p.type === filter).length;

            return (
              <motion.button
                key={filter}
                onClick={() => {
                  haptic(6);
                  setActiveFilter(filter);
                }}
                className={cn(
                  "relative px-4 py-1.5 rounded-full text-sm transition-all duration-200",
                  isActive
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground border border-border hover:border-border/80"
                )}
                whileTap={{ scale: 0.96 }}
              >
                {isActive && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-primary"
                    layoutId="filter-pill"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.5 }}
                  />
                )}
                <span className="relative">
                  {filter}
                  <span className={cn(
                    "ml-1.5 text-[10px]",
                    isActive ? "text-primary-foreground/70" : "text-muted-foreground/60"
                  )}>
                    {count}
                  </span>
                </span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* Project grid */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          layout
        >
          {filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              layout
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <ProjectCard
                project={project}
                index={index}
                onLaunch={handleLaunch}
              />
            </motion.div>
          ))}
        </motion.div>

        {/* Empty state */}
        {filteredProjects.length === 0 && (
          <motion.div
            className="text-center py-20 text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No projects in this category yet.
          </motion.div>
        )}
      </div>

      {/* Launch modal */}
      {selectedProject && (
        <LaunchModal
          project={selectedProject}
          onClose={() => setSelectedProject(null)}
        />
      )}
    </section>
  );
}
