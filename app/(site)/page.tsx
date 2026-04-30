"use client";

import { useState, useEffect, useRef } from "react";
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
import WorkShowcase from "@/components/WorkShowcase";
import { supabase, getActiveProjects, type Project } from "@/lib/supabase";
import { ThemeProvider } from "@/components/ThemeProvider";

export default function Home() {
  const [detailProject, setDetailProject] = useState<Project | null>(null);
  const [launchProject, setLaunchProject] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Pre-fetch projects during loader so grid is instant after loading screen
  const [prefetchedProjects, setPrefetchedProjects] = useState<Project[] | null>(null);

  useEffect(() => {
    // Start fetching projects immediately — in parallel with the loading screen
    getActiveProjects().then(setPrefetchedProjects);

    const params = new URLSearchParams(window.location.search);
    const projectId = params.get("project");
    if (projectId) {
      supabase
        .from("projects")
        .select("*")
        .eq("id", projectId)
        .single()
        .then(({ data }) => {
          if (data) setDetailProject(data as Project);
        });
    }
  }, []);

  const handleBack = () => {
    setDetailProject(null);
    if (window.history.pushState) {
      const newUrl =
        window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.pushState({ path: newUrl }, "", newUrl);
    }
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
                <ThemeProvider key={`theme-${detailProject.id}`} attribute="class" defaultTheme="dark" enableSystem={false} storageKey={`ipds-project-${detailProject.id}`}>
                  <ProjectDetail
                    key={detailProject.id}
                    project={detailProject}
                    onBack={handleBack}
                    onLaunch={p => setLaunchProject(p)}
                  />
                </ThemeProvider>
              ) : (
                <ThemeProvider key="theme-site" attribute="class" defaultTheme="dark" enableSystem={false} storageKey="ipds-site-theme">
                  <main key="main" className="relative min-h-screen overflow-x-hidden">
                    <BackgroundCanvas />
                    <div className="relative z-[1]">
                      <Navbar />
                      <Hero />
                      {/* Pass prefetched data so grid renders immediately */}
                      <ProjectGrid
                        onSelectProject={p => setDetailProject(p)}
                        initialProjects={prefetchedProjects}
                      />
                      <WorkShowcase />
                      <Contact />
                      <Footer />
                    </div>
                  </main>
                </ThemeProvider>
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
