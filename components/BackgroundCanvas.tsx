"use client";

import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";

interface Particle {
  x: number; y: number;
  vx: number; vy: number;
  size: number; opacity: number;
  hue: number;
}

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { resolvedTheme } = useTheme();
  const animRef = useRef<number>();
  const particles = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const onMouse = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };
    window.addEventListener("mousemove", onMouse);

    // Init particles
    const N = 55;
    particles.current = Array.from({ length: N }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      size: Math.random() * 1.8 + 0.4,
      opacity: Math.random() * 0.5 + 0.1,
      hue: Math.random() * 60 + 240, // 240-300 = blue/violet range
    }));

    let t = 0;
    const draw = () => {
      t += 0.004;
      const isDark = resolvedTheme === "dark";
      const W = canvas.width, H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // ── Animated orbs ──────────────────────────────────────────
      const orbs = [
        { x: 0.15 + Math.sin(t * 0.7) * 0.08, y: 0.25 + Math.cos(t * 0.5) * 0.1, r: 0.38, hue: isDark ? 258 : 22, sat: isDark ? 70 : 85, lit: isDark ? 40 : 55, a: isDark ? 0.14 : 0.16 },
        { x: 0.82 + Math.cos(t * 0.6) * 0.07, y: 0.15 + Math.sin(t * 0.8) * 0.08, r: 0.28, hue: isDark ? 300 : 350, sat: isDark ? 60 : 75, lit: isDark ? 38 : 52, a: isDark ? 0.1 : 0.12 },
        { x: 0.55 + Math.sin(t * 0.4) * 0.12, y: 0.65 + Math.cos(t * 0.55) * 0.09, r: 0.32, hue: isDark ? 200 : 195, sat: isDark ? 55 : 70, lit: isDark ? 35 : 50, a: isDark ? 0.08 : 0.1 },
        { x: 0.1 + Math.cos(t * 0.35) * 0.06, y: 0.75 + Math.sin(t * 0.45) * 0.07, r: 0.22, hue: isDark ? 280 : 40, sat: isDark ? 65 : 80, lit: isDark ? 42 : 55, a: isDark ? 0.07 : 0.09 },
      ];

      for (const orb of orbs) {
        const grd = ctx.createRadialGradient(orb.x * W, orb.y * H, 0, orb.x * W, orb.y * H, orb.r * W);
        grd.addColorStop(0, `hsla(${orb.hue},${orb.sat}%,${orb.lit}%,${orb.a})`);
        grd.addColorStop(1, `hsla(${orb.hue},${orb.sat}%,${orb.lit}%,0)`);
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);
      }

      // ── Grid ──────────────────────────────────────────────────
      const gridAlpha = isDark ? 0.028 : 0.055;
      const gridSize = 80;
      ctx.strokeStyle = isDark ? `rgba(200,190,255,${gridAlpha})` : `rgba(40,30,20,${gridAlpha})`;
      ctx.lineWidth = 0.5;
      for (let x = 0; x < W; x += gridSize) {
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
      }
      for (let y = 0; y < H; y += gridSize) {
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
      }

      // ── Particles ─────────────────────────────────────────────
      const { x: mx, y: my } = mouseRef.current;
      for (const p of particles.current) {
        // Mouse repulsion
        const dx = p.x - mx, dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          const f = (120 - dist) / 120 * 0.3;
          p.vx += (dx / dist) * f;
          p.vy += (dy / dist) * f;
        }

        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.99; p.vy *= 0.99; // damping

        if (p.x < 0) p.x = W;
        if (p.x > W) p.x = 0;
        if (p.y < 0) p.y = H;
        if (p.y > H) p.y = 0;

        const alpha = (isDark ? 0.45 : 0.35) * p.opacity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = isDark
          ? `hsla(${p.hue},65%,72%,${alpha})`
          : `hsla(${p.hue - 40},60%,35%,${alpha})`;
        ctx.fill();
      }

      // ── Vignette ──────────────────────────────────────────────
      const vig = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.72);
      vig.addColorStop(0, "rgba(0,0,0,0)");
      vig.addColorStop(1, isDark ? "rgba(0,0,0,0.45)" : "rgba(0,0,0,0.08)");
      ctx.fillStyle = vig;
      ctx.fillRect(0, 0, W, H);

      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", onMouse);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [resolvedTheme]);

  return (
    <canvas ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }} />
  );
}
