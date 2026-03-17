"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowRight, ChevronRight } from "lucide-react";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden flex flex-col items-center text-center px-6">
      {/* Background radial glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[600px] bg-[radial-gradient(circle_at_center,rgba(226,255,175,0.08)_0%,transparent_70%)] pointer-events-none" />

      {/* Hero Content */}
      <div className="relative z-10 max-w-4xl flex flex-col items-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary border border-border text-[10px] sm:text-xs font-medium tracking-wide text-muted-foreground mb-8"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-vastu-green animate-pulse" />
          Real-time Unreal Engine Experiences
          <ChevronRight size={12} className="opacity-50" />
        </motion.div>

        {/* Main Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-5xl sm:text-6xl md:text-8xl font-medium tracking-tighter leading-[1] mb-6"
        >
          Explore <span className="text-sweep">Architecture</span> <br className="hidden md:block" /> Before It's Built
        </motion.h1>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed mb-12"
        >
          Immersive 3D walkthroughs streamed directly to your browser. Experience photorealistic spaces with zero lag, powered by Unreal Engine Pixel Streaming.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-center gap-4"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-vercel h-12 px-8 text-base group"
            onClick={() => {
              document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            View Projects
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary h-12 px-8 text-base"
            onClick={() => {
              document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Contact Sales
          </motion.button>
        </motion.div>
      </div>

      {/* Grid Floor Visualization */}
      <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      <div 
        className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[200%] h-[400px] opacity-20 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
          transform: 'perspective(500px) rotateX(60deg)',
          maskImage: 'radial-gradient(ellipse at center, black 10%, transparent 70%)'
        }}
      />
    </section>
  );
}
