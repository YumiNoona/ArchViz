"use client";

import { useEffect, useRef } from "react";

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef    = useRef<number>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = 0, H = 0;

    // Particles — minimal floating dust
    const COUNT = 28;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.0002,
      vy: (Math.random() - 0.5) * 0.0002,
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.25 + 0.05,
    }));

    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    let t = 0;
    const draw = () => {
      rafRef.current = requestAnimationFrame(draw);
      t += 0.004;

      ctx.clearRect(0, 0, W, H);

      // Subtle orbs
      const orbs = [
        { x: 0.15, y: 0.25, r: 0.4, h: 30 },
        { x: 0.82, y: 0.18, r: 0.3, h: 20 },
        { x: 0.55, y: 0.7,  r: 0.35, h: 22 },
      ];
      for (const o of orbs) {
        const cx = (o.x + Math.sin(t * 0.4) * 0.04) * W;
        const cy = (o.y + Math.cos(t * 0.35) * 0.04) * H;
        const r  = o.r * Math.min(W, H);
        const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(196,164,120,0.03)`);
        g.addColorStop(1, "rgba(196,164,120,0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Floating particles
      for (const p of particles) {
        p.x += p.vx + Math.sin(t * 0.3) * 0.00005;
        p.y += p.vy + Math.cos(t * 0.25) * 0.00005;
        if (p.x < 0) p.x = 1;
        if (p.x > 1) p.x = 0;
        if (p.y < 0) p.y = 1;
        if (p.y > 1) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196,164,120,${p.a})`;
        ctx.fill();
      }
    };

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current!);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0, mixBlendMode: "screen" }}
    />
  );
}
