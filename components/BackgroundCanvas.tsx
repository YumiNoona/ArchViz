"use client";

import { useEffect, useRef } from "react";
import { animate } from "animejs";

export default function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = 0, H = 0;
    const resize = () => {
      W = canvas.width  = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize, { passive: true });

    // Orbs as JS objects to animate with Anime.js
    const orbs = [
      { x: 0.15, y: 0.25, r: 0.4, h: 30, opacity: 0.03 },
      { x: 0.82, y: 0.18, r: 0.3, h: 20, opacity: 0.03 },
      { x: 0.55, y: 0.7,  r: 0.35, h: 22, opacity: 0.03 },
    ];

    // Particles — minimal floating dust
    const COUNT = 28;
    const particles = Array.from({ length: COUNT }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: Math.random() * 1.2 + 0.3,
      a: Math.random() * 0.25 + 0.05,
    }));

    // Animate Orbs using Anime.js
    orbs.forEach((orb, i) => {
      animate(orb, {
        x: [orb.x - 0.05, orb.x + 0.05],
        y: [orb.y - 0.05, orb.y + 0.05],
        opacity: [0.02, 0.04],
        duration: 4000 + i * 1000,
        easing: "easeInOutQuad",
        alternate: true,
        loop: true,
      });
    });

    // Animate Particles
    particles.forEach((p, i) => {
      animate(p, {
        x: [p.x, (p.x + 0.1) % 1],
        y: [p.y, (p.y + 0.1) % 1],
        duration: 10000 + i * 2000,
        easing: "linear",
        loop: true,
      });
    });

    let rafId: number;
    const draw = () => {
      ctx.clearRect(0, 0, W, H);

      // Draw orbs
      for (const o of orbs) {
        const cx = o.x * W;
        const cy = o.y * H;
        const r  = o.r * Math.min(W, H);
        const g  = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
        g.addColorStop(0, `rgba(226, 255, 175, ${o.opacity})`);
        g.addColorStop(1, "rgba(226, 255, 175, 0)");
        ctx.fillStyle = g;
        ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
      }

      // Draw particles
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x * W, p.y * H, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(226, 255, 175, ${p.a})`;
        ctx.fill();
      }

      rafId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(rafId);
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
