"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, useSpring, AnimatePresence } from "framer-motion";
import { ArrowDown } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";

// ── Floating 3D Building ──────────────────────────────────────────────────────
function Building3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>();
  const mouseRef = useRef({ x: 0.5, y: 0.5 });
  const rotRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0;

    const resize = () => {
      W = canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      H = canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };
    resize();

    const onMouse = (e: MouseEvent) => {
      mouseRef.current.x = e.clientX / window.innerWidth;
      mouseRef.current.y = e.clientY / window.innerHeight;
    };
    window.addEventListener("mousemove", onMouse, { passive: true });

    // 3D projection helpers
    const project = (x: number, y: number, z: number, rx: number, ry: number) => {
      const cosX = Math.cos(rx), sinX = Math.sin(rx);
      const cosY = Math.cos(ry), sinY = Math.sin(ry);
      const y2 = y * cosX - z * sinX;
      const z2 = y * sinX + z * cosX;
      const x2 = x * cosY + z2 * sinY;
      const z3 = -x * sinY + z2 * cosY;
      const fov = 600;
      const scale = fov / (fov + z3 + 400);
      const cw = W / (2 * window.devicePixelRatio);
      const ch = H / (2 * window.devicePixelRatio);
      return { sx: cw + x2 * scale, sy: ch + y2 * scale, scale, z: z3 };
    };

    const drawFace = (
      pts: { sx: number; sy: number }[],
      fillStyle: string,
      strokeStyle: string,
      lw = 0.5
    ) => {
      ctx.beginPath();
      ctx.moveTo(pts[0].sx, pts[0].sy);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i].sx, pts[i].sy);
      ctx.closePath();
      ctx.fillStyle = fillStyle;
      ctx.fill();
      ctx.strokeStyle = strokeStyle;
      ctx.lineWidth = lw;
      ctx.stroke();
    };

    let t = 0;

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      t += 0.006;

      const cw = W / (2 * window.devicePixelRatio);
      const ch = H / (2 * window.devicePixelRatio);
      ctx.clearRect(0, 0, cw * 2, ch * 2);

      // Smooth rotation tracking mouse
      const targetRX = (mouseRef.current.y - 0.5) * 0.35 + Math.sin(t * 0.3) * 0.06;
      const targetRY = (mouseRef.current.x - 0.5) * 0.55 + Math.cos(t * 0.25) * 0.08;
      rotRef.current.x += (targetRX - rotRef.current.x) * 0.04;
      rotRef.current.y += (targetRY - rotRef.current.y) * 0.04;

      const rx = rotRef.current.x;
      const ry = rotRef.current.y;

      // ── MAIN TOWER ──────────────────────────────────────────────────────
      const tw = 80, td = 80;
      const heights = [320, 220, 160]; // main, wing1, wing2

      const buildings = [
        { ox: 0, oz: 0, w: tw, d: td, h: heights[0] },
        { ox: -100, oz: -20, w: 55, d: 55, h: heights[1] },
        { ox: 90, oz: 30, w: 45, d: 45, h: heights[2] },
        { ox: -160, oz: 60, w: 35, d: 35, h: 100 },
        { ox: 150, oz: -40, w: 30, d: 30, h: 80 },
      ];

      // Draw ground grid
      const gridSize = 60;
      const gridCount = 6;
      ctx.globalAlpha = 0.12;
      for (let gi = -gridCount; gi <= gridCount; gi++) {
        const p1 = project(gi * gridSize, 200, -gridCount * gridSize, rx, ry);
        const p2 = project(gi * gridSize, 200, gridCount * gridSize, rx, ry);
        const p3 = project(-gridCount * gridSize, 200, gi * gridSize, rx, ry);
        const p4 = project(gridCount * gridSize, 200, gi * gridSize, rx, ry);
        ctx.beginPath();
        ctx.moveTo(p1.sx, p1.sy);
        ctx.lineTo(p2.sx, p2.sy);
        ctx.strokeStyle = "rgba(196,164,120,0.4)";
        ctx.lineWidth = 0.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(p3.sx, p3.sy);
        ctx.lineTo(p4.sx, p4.sy);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Sort buildings back to front
      const sorted = buildings.map((b, i) => {
        const c = project(b.ox, 200, b.oz, rx, ry);
        return { ...b, depth: c.z, i };
      }).sort((a, b) => b.depth - a.depth);

      for (const b of sorted) {
        const { ox, oz, w, d, h } = b;
        const oy = 200; // ground level Y

        // 8 corners: bottom 4, top 4
        const corners = [
          project(ox - w/2, oy,   oz - d/2, rx, ry),
          project(ox + w/2, oy,   oz - d/2, rx, ry),
          project(ox + w/2, oy,   oz + d/2, rx, ry),
          project(ox - w/2, oy,   oz + d/2, rx, ry),
          project(ox - w/2, oy-h, oz - d/2, rx, ry),
          project(ox + w/2, oy-h, oz - d/2, rx, ry),
          project(ox + w/2, oy-h, oz + d/2, rx, ry),
          project(ox - w/2, oy-h, oz + d/2, rx, ry),
        ];

        const isMain = b.i === 0;
        const baseAlpha = isMain ? 1 : 0.75;

        // Bottom face
        ctx.globalAlpha = baseAlpha * 0.3;
        drawFace([corners[0],corners[1],corners[2],corners[3]], "rgba(20,15,10,0.6)", "rgba(196,164,120,0.1)");

        // Front face (oz - d/2)
        ctx.globalAlpha = baseAlpha * 0.9;
        const frontGrad = ctx.createLinearGradient(corners[4].sx, corners[4].sy, corners[0].sx, corners[0].sy);
        frontGrad.addColorStop(0, isMain ? "rgba(45,38,28,0.95)" : "rgba(35,30,22,0.85)");
        frontGrad.addColorStop(1, isMain ? "rgba(28,22,16,0.98)" : "rgba(20,17,12,0.9)");
        drawFace([corners[0],corners[1],corners[5],corners[4]], frontGrad, "rgba(196,164,120,0.25)", isMain ? 0.8 : 0.4);

        // Right face
        ctx.globalAlpha = baseAlpha * 0.7;
        drawFace([corners[1],corners[2],corners[6],corners[5]], "rgba(30,25,18,0.85)", "rgba(196,164,120,0.15)", isMain ? 0.6 : 0.3);

        // Left face
        ctx.globalAlpha = baseAlpha * 0.6;
        drawFace([corners[0],corners[3],corners[7],corners[4]], "rgba(22,18,13,0.8)", "rgba(196,164,120,0.12)");

        // Back face
        ctx.globalAlpha = baseAlpha * 0.5;
        drawFace([corners[2],corners[3],corners[7],corners[6]], "rgba(18,15,10,0.75)", "rgba(196,164,120,0.08)");

        // Top face — brightest
        ctx.globalAlpha = baseAlpha;
        const topGrad = ctx.createLinearGradient(corners[4].sx, corners[4].sy, corners[6].sx, corners[6].sy);
        topGrad.addColorStop(0, isMain ? "rgba(80,65,42,0.95)" : "rgba(55,45,30,0.8)");
        topGrad.addColorStop(1, isMain ? "rgba(55,44,28,0.85)" : "rgba(38,32,20,0.7)");
        drawFace([corners[4],corners[5],corners[6],corners[7]], topGrad, "rgba(196,164,120,0.5)", isMain ? 1 : 0.5);

        // Windows on front face (main building only)
        if (isMain) {
          ctx.globalAlpha = 1;
          const rows = 9, cols = 3;
          for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
              const wx = ox - w/2 + (col + 0.5) * (w / cols) + (w / cols) * 0.1;
              const wy = oy - (row + 1) * (h / (rows + 1));
              const wz = oz - d/2 - 1;
              const wsize = 8;
              const wc = [
                project(wx - wsize/2, wy - wsize/2 * 1.4, wz, rx, ry),
                project(wx + wsize/2, wy - wsize/2 * 1.4, wz, rx, ry),
                project(wx + wsize/2, wy + wsize/2 * 1.4, wz, rx, ry),
                project(wx - wsize/2, wy + wsize/2 * 1.4, wz, rx, ry),
              ];
              const lit = Math.sin(t * 2 + row * 0.8 + col * 1.3) > 0.2;
              ctx.globalAlpha = lit ? 0.55 : 0.12;
              drawFace(wc,
                lit ? "rgba(255,230,150,0.7)" : "rgba(40,35,25,0.4)",
                "rgba(196,164,120,0.2)", 0.3
              );
            }
          }
          // Antenna
          ctx.globalAlpha = 0.8;
          const ant1 = project(ox, oy - h, oz, rx, ry);
          const ant2 = project(ox, oy - h - 60, oz, rx, ry);
          ctx.beginPath();
          ctx.moveTo(ant1.sx, ant1.sy);
          ctx.lineTo(ant2.sx, ant2.sy);
          ctx.strokeStyle = "rgba(196,164,120,0.6)";
          ctx.lineWidth = 1;
          ctx.stroke();
          // Blinking light
          const blink = Math.sin(t * 4) > 0;
          ctx.globalAlpha = blink ? 0.9 : 0.2;
          ctx.beginPath();
          ctx.arc(ant2.sx, ant2.sy, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,80,80,0.9)";
          ctx.fill();
        }

        ctx.globalAlpha = 1;
      }

      // Atmospheric haze at base
      const hazeGrad = ctx.createLinearGradient(0, cw * 1.2, 0, ch * 2);
      hazeGrad.addColorStop(0, "rgba(8,6,4,0)");
      hazeGrad.addColorStop(1, "rgba(8,6,4,0.5)");
      ctx.fillStyle = hazeGrad;
      ctx.fillRect(0, 0, cw * 2, ch * 2);
    };

    draw();
    window.addEventListener("resize", resize, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current!);
      window.removeEventListener("mousemove", onMouse);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ imageRendering: "pixelated" }}
    />
  );
}

// ── Scanline texture overlay ──────────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.03) 2px, rgba(0,0,0,0.03) 4px)",
        zIndex: 2,
      }}
    />
  );
}

// ── Floating stat pill ────────────────────────────────────────────────────────
function StatPill({ value, label, delay }: { value: string; label: string; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col items-center px-5 py-3 rounded-2xl"
      style={{
        background: "rgba(196,164,120,0.05)",
        border: "1px solid rgba(196,164,120,0.15)",
        backdropFilter: "blur(12px)",
      }}
    >
      <span className="text-2xl font-light" style={{ color: "#c4a478", fontFamily: "var(--font-display)", lineHeight: 1 }}>
        {value}
      </span>
      <span className="text-[10px] uppercase tracking-[0.2em] mt-1" style={{ color: "rgba(196,164,120,0.55)" }}>
        {label}
      </span>
    </motion.div>
  );
}

// ── Main Hero ─────────────────────────────────────────────────────────────────
export default function Hero() {
  const { config } = useSiteConfig();
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });
  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 0.5], [1, 0.94]);

  const [ready, setReady] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 100);
    return () => clearTimeout(t);
  }, []);

  const stats = config.stats?.length ? config.stats : [
    { value: "UE5", label: "Engine" },
    { value: "4K", label: "Resolution" },
    { value: "60fps", label: "Framerate" },
    { value: "6+", label: "Projects" },
  ];

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
      style={{ background: "#080604" }}
    >
      <Scanlines />

      {/* 3D Scene — full bleed */}
      <motion.div
        className="absolute inset-0"
        style={{ y, scale, opacity }}
      >
        <Building3D />
      </motion.div>

      {/* Radial vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 70% 80% at 50% 50%, transparent 30%, rgba(8,6,4,0.7) 100%)",
          zIndex: 3,
        }}
      />

      {/* Bottom gradient fade into next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-48 pointer-events-none"
        style={{
          background: "linear-gradient(to bottom, transparent, #080604)",
          zIndex: 4,
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col justify-between min-h-screen px-8 lg:px-16 py-32 max-w-7xl mx-auto w-full">
        {/* Top eyebrow */}
        <AnimatePresence>
          {ready && (
            <motion.div
              initial={{ opacity: 0, y: -16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3"
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: "#c4a478" }} />
              <span
                className="text-xs uppercase tracking-[0.3em]"
                style={{ color: "rgba(196,164,120,0.6)", fontFamily: "var(--font-mono)" }}
              >
                {config.eyebrow || "Architectural Visualisation Studio"}
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main headline — bottom left */}
        <div className="mt-auto pt-20">
          <div className="max-w-3xl">
            {(config.headline || ["Experience", "Architecture", "Before It's Built"]).map((line, i) => (
              <div key={i} className="overflow-hidden">
                <motion.h1
                  initial={{ y: "110%", opacity: 0 }}
                  animate={ready ? { y: 0, opacity: 1 } : {}}
                  transition={{ duration: 1, delay: 0.3 + i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                  className="block font-light leading-[0.95]"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontSize: "clamp(3.2rem, 7vw, 7rem)",
                    color: i === 1 ? "#c4a478" : "rgba(245,235,215,0.95)",
                    fontStyle: i === 1 ? "italic" : "normal",
                    letterSpacing: "-0.02em",
                  }}
                >
                  {line}
                </motion.h1>
              </div>
            ))}

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.8, duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 text-base leading-relaxed max-w-md"
              style={{ color: "rgba(196,164,120,0.45)", fontWeight: 300 }}
            >
              {config.sub || "Immersive 3D walkthroughs streamed to any browser — before a single brick is laid."}
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={ready ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-4 mt-10"
            >
              <motion.a
                href="#projects"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-sm font-medium"
                style={{
                  background: "#c4a478",
                  color: "#0c0a07",
                  boxShadow: "0 0 40px rgba(196,164,120,0.25)",
                }}
              >
                {config.cta || "Explore Projects"}
                <ArrowDown size={14} strokeWidth={2} />
              </motion.a>

              <motion.a
                href="#contact"
                whileHover={{ color: "#c4a478" }}
                className="text-sm transition-colors duration-200"
                style={{ color: "rgba(196,164,120,0.45)" }}
              >
                {config.ctaSecondary || "Get in touch →"}
              </motion.a>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={ready ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 1.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3 mt-12 flex-wrap"
          >
            {stats.map((s, i) => (
              <StatPill key={i} value={s.value} label={s.label} delay={1.2 + i * 0.07} />
            ))}
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
        initial={{ opacity: 0 }}
        animate={ready ? { opacity: 1 } : {}}
        transition={{ delay: 1.6 }}
      >
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
        >
          <ArrowDown size={16} style={{ color: "rgba(196,164,120,0.35)" }} />
        </motion.div>
      </motion.div>
    </section>
  );
}
