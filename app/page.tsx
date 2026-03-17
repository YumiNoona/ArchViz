"use client";

import { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import Hero from "@/components/Hero";
import ProjectGrid from "@/components/ProjectGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import Navbar from "@/components/Navbar";
import BackgroundCanvas from "@/components/BackgroundCanvas";
import ProjectDetail from "@/components/ProjectDetail";
import LaunchModal from "@/components/LaunchModal";
import { LoadingScreen } from "@/components/LoadingScreen";
import type { Project } from "@/lib/supabase";

export default function Home() {
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [launchProject, setLaunchProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // We could pre-fetch data here if needed
  useEffect(() => {
    // Small delay to ensure styles are ready
    const timer = setTimeout(() => {
      // Logic for pre-loading assets could go here
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setDetailProject(null);
    setTimeout(() => {
      document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && (
          <LoadingScreen key="loader" onComplete={() => setIsLoading(false)} />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {!isLoading && (
          <div key="content">
            <AnimatePresence mode="wait">
              {detailProject ? (
                <ProjectDetail
                  key={detailProject.id}
                  project={detailProject}
                  onBack={handleBack}
                  onLaunch={p => setLaunchProject(p)}
                />
              ) : (
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

            {launchProject && (
              <LaunchModal project={launchProject} onClose={() => setLaunchProject(null)} />
            )}
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
