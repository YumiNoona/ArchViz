"use client";

import * as React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { type ThemeProviderProps } from "next-themes/dist/types";

function ThemeRipple() {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const animRef = React.useRef<number>();

  React.useEffect(() => {
    const handler = (e: CustomEvent) => {
      const { x, y, toLight } = e.detail;
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Resize canvas to window
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Guard: x/y must be valid numbers
      const cx = typeof x === "number" && isFinite(x) ? x : canvas.width / 2;
      const cy = typeof y === "number" && isFinite(y) ? y : canvas.height / 2;

      const fillColor = toLight ? "#F5EFE0" : "#0C0B18";
      canvas.style.display = "block";
      const ctx = canvas.getContext("2d")!;

      // Max radius = distance to furthest corner
      const maxR = Math.hypot(
        Math.max(cx, canvas.width - cx),
        Math.max(cy, canvas.height - cy)
      ) + 10;

      const duration = 720;
      const start = performance.now();

      const tick = (now: number) => {
        const raw = Math.min((now - start) / duration, 1);
        // ease out cubic
        const t = 1 - Math.pow(1 - raw, 3);
        const r = Math.max(0, t * maxR); // always non-negative

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fillStyle = fillColor;
        ctx.fill();

        if (raw < 1) {
          animRef.current = requestAnimationFrame(tick);
        } else {
          setTimeout(() => {
            canvas.style.display = "none";
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }, 60);
        }
      };

      if (animRef.current) cancelAnimationFrame(animRef.current);
      animRef.current = requestAnimationFrame(tick);
    };

    window.addEventListener("theme-toggle" as any, handler);
    return () => {
      window.removeEventListener("theme-toggle" as any, handler);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed", inset: 0, width: "100vw", height: "100vh",
        display: "none", zIndex: 9997, pointerEvents: "none",
      }}
    />
  );
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider {...props}>
      <ThemeRipple />
      {children}
    </NextThemesProvider>
  );
}
