"use client";

import { motion, useInView } from "framer-motion";
import {
  History,
  Award,
  Building2,
  Users2,
  Sparkles,
  ArrowRight
} from "lucide-react";
import { useRef } from "react";

const milestones = [
  {
    year: "2018",
    title: "Project Hemanti",
    description: "Founded with a vision to revolutionize architectural storytelling through real-time technology.",
    icon: Sparkles
  },
  {
    year: "2020",
    title: "Cloud Expansion",
    description: "Pioneered pixel streaming for interactive 3D walkthroughs accessible on any device.",
    icon: Building2
  },
  {
    year: "2022",
    title: "Global Recognition",
    description: "Successfully delivered 200+ projects for top-tier developers across Southeast Asia.",
    icon: Award
  },
  {
    year: "2024",
    title: "Next-Gen Fidelity",
    description: "Implementing AI-driven lighting and physics to reach photorealism in real-time.",
    icon: History
  }
];

const stats = [
  { label: "Projects Delivered", value: "350+", icon: Building2 },
  { label: "Happy Clients", value: "120+", icon: Users2 },
  { label: "Years Experience", value: "8+", icon: History },
  { label: "Awards Won", value: "15", icon: Award },
];

export default function WorkShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section id="work" ref={ref} className="py-32 bg-secondary/10 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-accent/5 rounded-full blur-[120px] -mr-64 -mt-32 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col md:flex-row gap-20">

          {/* Left: Stats & Intro */}
          <div className="md:w-1/3 space-y-12">
            <div>
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-px bg-brand-accent" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-accent">
                  Our Work
                </span>
              </div>
              <h2 className="text-4xl md:text-5xl font-medium tracking-tighter mb-6 leading-tight">
                Our Legacy in <br /> <span className="text-sweep">Visualization.</span>
              </h2>
              <p className="text-muted-foreground font-light leading-relaxed">
                Over the past decade, we have partnered with visionary architects and developers to bring unbuilt spaces to life with unparalleled clarity and immersion.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-8">
              {stats.map((s, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={inView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: i * 0.1 }}
                  className="space-y-1"
                >
                  <p className="text-3xl font-medium tracking-tight text-foreground">{s.value}</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60">{s.label}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right: Milestones */}
          <div className="md:w-2/3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {milestones.map((m, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={inView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                  className="p-8 rounded-[2.5rem] bg-background border border-border hover:border-brand-accent/30 transition-all group"
                >
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-brand-accent group-hover:text-black transition-colors">
                    <m.icon size={20} />
                  </div>
                  <div className="space-y-4">
                    <span className="text-[10px] font-bold text-brand-accent uppercase tracking-widest">{m.year}</span>
                    <h3 className="text-xl font-medium tracking-tight">{m.title}</h3>
                    <p className="text-sm text-muted-foreground font-light leading-relaxed">{m.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Call to Action */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8 }}
              className="mt-12 flex justify-center sm:justify-start"
            >
              <button 
                onClick={() => {
                  document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
                }}
                className="group flex items-center gap-3 px-8 py-4 bg-brand-accent text-black font-bold uppercase tracking-[0.2em] text-[10px] rounded-full hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-brand-accent/20"
              >
                Explore Full Portfolio
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
