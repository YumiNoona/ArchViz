"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import { ArrowRight, ChevronDown, Play, Building2, Award, Clock } from "lucide-react";
import { haptic } from "@/lib/utils";
import { useSiteConfig } from "./SiteConfigProvider";

// ── Floating orb ─────────────────────────────────────────────────────────────
function Orb({ size, x, y, delay, color }: { size: number; x: string; y: string; delay: number; color: string }) {
  return (
    <motion.div
      className="absolute rounded-full pointer-events-none"
      style={{ width: size, height: size, left: x, top: y, background: color, filter: "blur(60px)", opacity: 0 }}
      animate={{ opacity: [0, 0.15, 0.08, 0.18, 0.06], scale: [1, 1.1, 0.95, 1.05, 1] }}
      transition={{ duration: 8 + delay, repeat: Infinity, ease: "easeInOut", delay }}
    />
  );
}

// ── Animated architecture SVG ─────────────────────────────────────────────────
function ArchSVG() {
  return (
    <svg viewBox="0 0 520 520" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      {/* Outer ring — slow spin */}
      <motion.circle cx="260" cy="260" r="230" stroke="hsl(38 70% 62% / 0.08)" strokeWidth="1" strokeDasharray="8 12"
        animate={{ rotate: 360 }} transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "260px 260px" }} />
      {/* Mid ring */}
      <motion.circle cx="260" cy="260" r="180" stroke="hsl(38 70% 62% / 0.12)" strokeWidth="0.5"
        animate={{ rotate: -360 }} transition={{ duration: 28, repeat: Infinity, ease: "linear" }}
        style={{ transformOrigin: "260px 260px" }} />
      {/* Inner ring */}
      <circle cx="260" cy="260" r="130" stroke="hsl(38 70% 62% / 0.06)" strokeWidth="0.5" />

      {/* Building 1 — tall centre */}
      <motion.g initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.2, delay: 0.4 }}>
        <rect x="224" y="140" width="72" height="220" rx="3" fill="hsl(38 70% 62% / 0.06)" stroke="hsl(38 70% 62% / 0.3)" strokeWidth="0.8" />
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <g key={i}>
            <rect x="234" y={152 + i*22} width="18" height="12" rx="1" fill="hsl(38 70% 62% / 0.12)" stroke="hsl(38 70% 62% / 0.2)" strokeWidth="0.4" />
            <rect x="262" y={152 + i*22} width="18" height="12" rx="1" fill="hsl(38 70% 62% / 0.12)" stroke="hsl(38 70% 62% / 0.2)" strokeWidth="0.4" />
          </g>
        ))}
        {/* Antenna */}
        <line x1="260" y1="140" x2="260" y2="112" stroke="hsl(38 70% 62% / 0.4)" strokeWidth="0.8" />
        <motion.circle cx="260" cy="110" r="3" fill="hsl(38 70% 62%)"
          animate={{ opacity: [1, 0.3, 1] }} transition={{ duration: 2, repeat: Infinity }} />
      </motion.g>

      {/* Building 2 — left */}
      <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }}>
        <rect x="158" y="210" width="52" height="150" rx="2" fill="hsl(30 30% 18% / 0.8)" stroke="hsl(38 70% 62% / 0.2)" strokeWidth="0.6" />
        {[0,1,2,3,4].map(i => (
          <rect key={i} x="167" y={222 + i*26} width="14" height="10" rx="1" fill="hsl(38 70% 62% / 0.1)" stroke="hsl(38 70% 62% / 0.15)" strokeWidth="0.4" />
        ))}
        {[0,1,2,3,4].map(i => (
          <rect key={i} x="188" y={222 + i*26} width="14" height="10" rx="1" fill="hsl(38 70% 62% / 0.1)" stroke="hsl(38 70% 62% / 0.15)" strokeWidth="0.4" />
        ))}
      </motion.g>

      {/* Building 3 — right */}
      <motion.g initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.7 }}>
        <rect x="310" y="195" width="58" height="165" rx="2" fill="hsl(30 30% 18% / 0.8)" stroke="hsl(38 70% 62% / 0.2)" strokeWidth="0.6" />
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x="319" y={206 + i*24} width="14" height="11" rx="1" fill="hsl(38 70% 62% / 0.1)" stroke="hsl(38 70% 62% / 0.15)" strokeWidth="0.4" />
        ))}
        {[0,1,2,3,4,5].map(i => (
          <rect key={i} x="341" y={206 + i*24} width="14" height="11" rx="1" fill="hsl(38 70% 62% / 0.1)" stroke="hsl(38 70% 62% / 0.15)" strokeWidth="0.4" />
        ))}
      </motion.g>

      {/* Ground */}
      <motion.line x1="100" y1="360" x2="420" y2="360" stroke="hsl(38 70% 62% / 0.15)" strokeWidth="0.8"
        initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5, delay: 1 }} />

      {/* Glow under buildings */}
      <ellipse cx="260" cy="362" rx="80" ry="8" fill="hsl(38 70% 62% / 0.06)" />

      {/* Floating measurement lines */}
      <motion.g animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ duration: 4, repeat: Infinity }}>
        <line x1="210" y1="140" x2="190" y2="140" stroke="hsl(38 70% 62% / 0.4)" strokeWidth="0.6" />
        <line x1="210" y1="360" x2="190" y2="360" stroke="hsl(38 70% 62% / 0.4)" strokeWidth="0.6" />
        <line x1="194" y1="140" x2="194" y2="360" stroke="hsl(38 70% 62% / 0.25)" strokeWidth="0.5" strokeDasharray="3 4" />
        <text x="178" y="255" fill="hsl(38 70% 62% / 0.5)" fontSize="7" fontFamily="DM Mono, monospace">220m</text>
      </motion.g>

      {/* Stars / dots */}
      {[[160,165],[380,180],[140,290],[395,270],[175,400],[345,410]].map(([cx,cy],i)=>(
        <motion.circle key={i} cx={cx} cy={cy} r="1.5" fill="hsl(38 70% 62%)"
          animate={{ opacity: [0.2,0.8,0.2], scale:[1,1.3,1] }}
          transition={{ duration:2+i*0.4, repeat:Infinity, delay:i*0.3 }} />
      ))}
    </svg>
  );
}

// ── Stats card ────────────────────────────────────────────────────────────────
function StatCard({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      className="px-5 py-4 rounded-2xl border relative overflow-hidden"
      style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))" }}
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -2, borderColor: "hsl(var(--primary)/0.3)" }}>
      <div className="text-2xl font-light mb-0.5 text-gradient-gold" style={{ fontFamily: "var(--font-display)" }}>
        {value}
      </div>
      <div className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>{label}</div>
    </motion.div>
  );
}

export default function Hero() {
  const { config } = useSiteConfig();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y   = useTransform(scrollYProgress, [0, 1], ["0%", "20%"]);
  const opa = useTransform(scrollYProgress, [0, 0.6], [1, 0]);

  const stats = [
    { value: "150+", label: "Projects Delivered" },
    { value: "8yr",  label: "Studio Experience"  },
    { value: "3D",   label: "Walkthroughs"        },
    { value: "100%", label: "Client Satisfaction" },
  ];

  return (
    <section ref={ref} className="relative min-h-screen flex items-center overflow-hidden grain"
      style={{ background: "hsl(var(--background))" }}>

      {/* ── Orbs ── */}
      <Orb size={600} x="60%" y="-10%" delay={0} color="hsl(38 70% 62%)" />
      <Orb size={400} x="5%"  y="40%"  delay={2} color="hsl(28 60% 55%)" />
      <Orb size={300} x="75%" y="60%"  delay={4} color="hsl(44 60% 58%)" />

      {/* ── Grid ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(hsl(var(--primary)/0.025) 1px, transparent 1px),
            linear-gradient(90deg, hsl(var(--primary)/0.025) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }} />

      {/* ── Vignette ── */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, hsl(var(--background)/0.6) 100%)" }} />

      <motion.div className="relative z-10 w-full max-w-7xl mx-auto px-6 lg:px-10 pt-32 pb-24"
        style={{ y, opacity: opa }}>

        <div className="grid lg:grid-cols-[1fr_480px] gap-16 items-center">

          {/* ── LEFT COLUMN ── */}
          <div>
            {/* Eyebrow */}
            <motion.div className="flex items-center gap-3 mb-8"
              initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
              <div className="w-1 h-8 rounded-full" style={{ background: "hsl(var(--primary))" }} />
              <span className="text-xs font-medium tracking-[0.25em] uppercase"
                style={{ color: "hsl(var(--primary))", fontFamily: "var(--font-mono)" }}>
                {config.eyebrow || "Architectural Visualisation Studio"}
              </span>
            </motion.div>

            {/* Headline */}
            <motion.h1 className="font-light leading-[1.05] mb-8"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(3rem, 6.5vw, 5.5rem)" }}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.15 }}>
              {(config.headline?.[0] ?? "Experience").split("").map((char, i) => (
                <motion.span key={i} className="inline-block"
                  style={{ color: "hsl(var(--foreground))" }}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.03, duration: 0.5, ease: [0.16,1,0.3,1] }}>
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              ))}
              <br />
              <span className="text-gradient italic">
                {config.headline?.[1] ?? "Architecture"}
              </span>
              <br />
              <motion.span style={{ color: "hsl(var(--foreground)/0.7)", fontWeight: 300 }}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.7 }}>
                {config.headline?.[2] ?? "Before It's Built"}
              </motion.span>
            </motion.h1>

            {/* Sub */}
            <motion.p className="text-lg leading-relaxed mb-10 max-w-lg"
              style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-body)", fontWeight: 300 }}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.7 }}>
              {config.sub || "We create immersive 3D architectural experiences that let clients, investors, and buyers explore every space before construction begins."}
            </motion.p>

            {/* CTAs */}
            <motion.div className="flex flex-wrap items-center gap-4 mb-14"
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.65, duration: 0.7 }}>
              <motion.a href="#projects" onClick={() => haptic(10)}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-medium"
                style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 8px 28px hsl(var(--primary)/0.3)" }}
                whileHover={{ scale: 1.02, y: -1 }} whileTap={{ scale: 0.97 }}>
                {config.cta || "View Our Work"} <ArrowRight size={14} />
              </motion.a>
              <motion.a href="#about" onClick={() => haptic(8)}
                className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-full text-sm border"
                style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground)/0.7)" }}
                whileHover={{ scale: 1.01, borderColor: "hsl(var(--primary)/0.4)", color: "hsl(var(--foreground))" }}
                whileTap={{ scale: 0.97 }}>
                <Play size={12} /> {config.ctaSecondary || "Our Process"}
              </motion.a>
            </motion.div>

            {/* Stats */}
            <motion.div className="grid grid-cols-2 sm:grid-cols-4 gap-3"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.75, duration: 0.6 }}>
              {stats.map((s, i) => <StatCard key={i} {...s} delay={0.8 + i * 0.08} />)}
            </motion.div>
          </div>

          {/* ── RIGHT — Architecture Illustration ── */}
          <motion.div className="relative hidden lg:block"
            initial={{ opacity: 0, x: 40 }} animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 1, ease: [0.16,1,0.3,1] }}>

            {/* Glow behind illustration */}
            <div className="absolute inset-0 rounded-full"
              style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.08) 0%, transparent 70%)", filter: "blur(40px)" }} />

            <ArchSVG />

            {/* Floating label cards */}
            <motion.div className="absolute top-[15%] right-[-8%] px-4 py-3 rounded-2xl border text-xs"
              style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))", backdropFilter: "blur(12px)" }}
              animate={{ y: [0,-6,0] }} transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400" style={{ boxShadow: "0 0 6px #34d399" }} />
                <span style={{ color: "hsl(var(--foreground)/0.8)", fontFamily: "var(--font-mono)" }}>Live Preview</span>
              </div>
            </motion.div>

            <motion.div className="absolute bottom-[22%] left-[-10%] px-4 py-3 rounded-2xl border text-xs"
              style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))" }}
              animate={{ y: [0,5,0] }} transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1.5 }}>
              <div className="flex items-center gap-2 mb-1">
                <Building2 size={11} style={{ color: "hsl(var(--primary))" }} />
                <span style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Active Project</span>
              </div>
              <div className="text-sm font-medium" style={{ color: "hsl(var(--foreground))", fontFamily: "var(--font-display)" }}>Shree Sadhna</div>
            </motion.div>
          </motion.div>
        </div>

        {/* Scroll cue */}
        <motion.div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}>
          <span className="text-[10px] tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Scroll</span>
          <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <ChevronDown size={14} style={{ color: "hsl(var(--primary)/0.5)" }} />
          </motion.div>
        </motion.div>
      </motion.div>
    </section>
  );
}
