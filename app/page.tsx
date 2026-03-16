"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import CustomCursor from "@/components/CustomCursor";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import ProjectDetail from "@/components/ProjectDetail";
import LaunchModal from "@/components/LaunchModal";
import type { Project } from "@/lib/supabase";

export default function Home() {
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [launchProject, setLaunchProject] = useState<Project | null>(null);

  const handleBack = () => {
    setDetailProject(null);
    setTimeout(() => {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <CustomCursor />

      <AnimatePresence mode="wait">
        {detailProject ? (
          // Full-screen project detail — Hero / Navbar / rest of site are unmounted
          <ProjectDetail
            key={detailProject.id}
            project={detailProject}
            onBack={handleBack}
            onLaunch={p => setLaunchProject(p)}
          />
        ) : (
          // Main site
          <main key="main" className="relative min-h-screen overflow-x-hidden">
            <BackgroundCanvas />
            <div className="relative z-[1]">
              <Navbar />
              <Hero />
              <ProjectGrid onSelectProject={p => setDetailProject(p)} />
              <Contact />
              <Footer />
            </div>
          </main>
        )}
      </AnimatePresence>

      {/* LaunchModal lives outside both views */}
      {launchProject && (
        <LaunchModal project={launchProject} onClose={() => setLaunchProject(null)} />
      )}
    </>
  );
}
