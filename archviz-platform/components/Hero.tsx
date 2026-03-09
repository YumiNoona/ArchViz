"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowDown, Play } from "lucide-react";
import { haptic } from "@/lib/utils";

const floatingStats = [
  { value: "6+", label: "Live Projects" },
  { value: "4K", label: "Stream Quality" },
  { value: "60fps", label: "Real-time" },
];

export default function Hero() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.3 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 32, filter: "blur(8px)" },
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] },
    },
  };

  return (
    <section
      ref={ref}
      className="relative min-h-screen flex items-center overflow-hidden"
      aria-label="Hero section"
    >
      {/* Gradient mesh background */}
      <div className="absolute inset-0 overflow-hidden">
        {/* Main gradient orbs */}
        <motion.div
          className="absolute -top-1/4 -left-1/4 w-[60vw] h-[60vw] rounded-full opacity-30 dark:opacity-20"
          style={{
            background: "radial-gradient(circle, hsl(238 84% 67% / 0.4) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 30, 0],
            y: [0, -20, 0],
          }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute -bottom-1/4 -right-1/4 w-[50vw] h-[50vw] rounded-full opacity-20 dark:opacity-15"
          style={{
            background: "radial-gradient(circle, hsl(280 70% 60% / 0.4) 0%, transparent 70%)",
            filter: "blur(80px)",
          }}
          animate={{
            x: [0, -25, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full opacity-10"
          style={{
            background: "radial-gradient(circle, hsl(200 80% 60% / 0.3) 0%, transparent 70%)",
            filter: "blur(100px)",
          }}
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
        />

        {/* Grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `
              linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
              linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
            `,
            backgroundSize: "80px 80px",
          }}
        />

        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n' x='0' y='0'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <motion.div
        className="relative z-10 max-w-7xl mx-auto px-6 pt-24 pb-16 w-full"
        style={{ y, opacity }}
      >
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Content */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Eyebrow */}
            <motion.div variants={itemVariants} className="mb-6">
              <span className="inline-flex items-center gap-2 text-xs font-medium tracking-widest uppercase text-primary/80 border border-primary/20 rounded-full px-3 py-1.5 bg-primary/5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" />
                Unreal Engine · Pixel Streaming
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-6xl lg:text-7xl xl:text-8xl leading-[0.92] tracking-tight mb-6 font-light"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Interactive
              <br />
              <em className="not-italic text-gradient">Architecture</em>
              <br />
              Experiences
            </motion.h1>

            {/* Subheading */}
            <motion.p
              variants={itemVariants}
              className="text-muted-foreground text-lg leading-relaxed mb-10 max-w-md"
              style={{ fontFamily: "var(--font-body)" }}
            >
              Navigate through architectural spaces before they're built. 
              Photorealistic real-time visualization — streamed directly 
              to your browser, no download required.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-4 flex-wrap"
            >
              <motion.a
                href="#projects"
                onClick={() => haptic(10)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:shadow-xl"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                Explore Projects
                <ArrowDown size={15} />
              </motion.a>

              <motion.a
                href="#about"
                onClick={() => haptic(6)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full border border-border hover:border-border/80 text-sm font-medium text-muted-foreground hover:text-foreground transition-all duration-300"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.97 }}
              >
                <Play size={13} />
                How it works
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-8 mt-14 pt-8 border-t border-border/50"
            >
              {floatingStats.map((stat) => (
                <div key={stat.label}>
                  <div
                    className="text-2xl font-light text-foreground"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5 tracking-wide">
                    {stat.label}
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right: Visual */}
          <motion.div
            className="relative hidden lg:block"
            initial={{ opacity: 0, x: 60, filter: "blur(20px)" }}
            animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
            transition={{ duration: 1.2, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Main visual card */}
            <div className="relative">
              {/* Floating card 1 */}
              <motion.div
                className="absolute -top-8 -left-8 z-10 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl"
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <div className="w-3 h-3 rounded-full bg-primary animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-medium">Live Stream Active</div>
                    <div className="text-[10px] text-muted-foreground">Luminara Tower · 4K 60fps</div>
                  </div>
                </div>
              </motion.div>

              {/* Main image placeholder / gradient visual */}
              <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-border/30 shadow-2xl">
                <div
                  className="absolute inset-0"
                  style={{
                    background: `
                      radial-gradient(ellipse at 30% 40%, hsl(238 84% 40% / 0.8) 0%, transparent 50%),
                      radial-gradient(ellipse at 70% 60%, hsl(280 60% 30% / 0.6) 0%, transparent 50%),
                      radial-gradient(ellipse at 50% 80%, hsl(200 70% 20% / 0.4) 0%, transparent 60%),
                      linear-gradient(135deg, #0B0B18 0%, #0D0B1E 50%, #0A0D1A 100%)
                    `,
                  }}
                />

                {/* Architectural grid lines */}
                <svg
                  className="absolute inset-0 w-full h-full opacity-20"
                  viewBox="0 0 400 300"
                  fill="none"
                >
                  {/* Building silhouette */}
                  <rect x="120" y="80" width="160" height="200" stroke="hsl(238 84% 67%)" strokeWidth="0.5" fill="none" />
                  <rect x="150" y="60" width="100" height="220" stroke="hsl(238 84% 67%)" strokeWidth="0.5" fill="none" opacity="0.5" />
                  {/* Floor lines */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={i} x1="120" y1={80 + i * 16} x2="280" y2={80 + i * 16} stroke="hsl(238 84% 67%)" strokeWidth="0.3" opacity="0.4" />
                  ))}
                  {/* Perspective lines */}
                  <line x1="200" y1="0" x2="120" y2="80" stroke="hsl(238 84% 67%)" strokeWidth="0.3" opacity="0.3" />
                  <line x1="200" y1="0" x2="280" y2="80" stroke="hsl(238 84% 67%)" strokeWidth="0.3" opacity="0.3" />
                  {/* Ground */}
                  <line x1="0" y1="280" x2="400" y2="280" stroke="hsl(238 84% 67%)" strokeWidth="0.5" opacity="0.3" />
                  <line x1="60" y1="280" x2="200" y2="200" stroke="hsl(238 84% 67%)" strokeWidth="0.3" opacity="0.2" />
                  <line x1="340" y1="280" x2="200" y2="200" stroke="hsl(238 84% 67%)" strokeWidth="0.3" opacity="0.2" />
                  {/* Glow point */}
                  <circle cx="200" cy="170" r="60" fill="hsl(238 84% 67%)" opacity="0.03" />
                  <circle cx="200" cy="170" r="3" fill="hsl(238 84% 67%)" opacity="0.8" />
                </svg>

                {/* Scanning line effect */}
                <motion.div
                  className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
                  animate={{ top: ["10%", "90%", "10%"] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                />

                {/* Corner HUD elements */}
                <div className="absolute top-4 left-4">
                  <div className="text-[9px] text-primary/60 font-mono tracking-widest">REC ●</div>
                </div>
                <div className="absolute top-4 right-4">
                  <div className="text-[9px] text-primary/60 font-mono tracking-widest">4096×2160</div>
                </div>
                <div className="absolute bottom-4 left-4">
                  <div className="text-[9px] text-muted-foreground/50 font-mono">UE5 · Lumen · Nanite</div>
                </div>
                <div className="absolute bottom-4 right-4">
                  <div className="text-[9px] text-muted-foreground/50 font-mono">60.0 FPS</div>
                </div>
              </div>

              {/* Floating card 2 */}
              <motion.div
                className="absolute -bottom-6 -right-6 z-10 bg-card/90 backdrop-blur-xl border border-border/50 rounded-2xl p-4 shadow-2xl"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}
              >
                <div className="text-xs font-medium mb-1">Visitor Experience</div>
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 flex items-center justify-center text-[8px]">
                      {["A", "M", "K", "J", "R"][i]}
                    </div>
                  ))}
                  <div className="text-[10px] text-muted-foreground ml-1">+140</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-muted-foreground/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[10px] tracking-widest uppercase">Scroll</span>
        <motion.div
          className="w-px h-10 bg-gradient-to-b from-border to-transparent"
          animate={{ scaleY: [1, 0.5, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
      </motion.div>
    </section>
  );
}
