"use client";

import { useEffect, useRef } from "react";
import { useDebug } from "./DebugPanel";

export type CursorVariant = "dot-ring" | "crosshair" | "spotlight" | "magnetic";

export default function CustomCursor() {
  const { cursorVariant } = useDebug();

  return <CursorEngine variant={cursorVariant as CursorVariant} />;
}

/* ─── Engine — pure RAF, zero React re-renders per frame ──── */
function CursorEngine({ variant }: { variant: CursorVariant }) {
  const aRef = useRef<HTMLDivElement>(null); // primary (always snaps)
  const bRef = useRef<HTMLDivElement>(null); // secondary (optional trail)
  const cRef = useRef<HTMLCanvasElement>(null); // spotlight canvas
  const mouse = useRef({ x: -200, y: -200 });
  const trail = useRef({ x: -200, y: -200 });
  const hover = useRef(false);
  const raf   = useRef<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // ── mouse position — captured synchronously, no lag ──
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };

    // ── hover detection ──
    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "button,a,[role=button],input,textarea,select,[data-cursor]"
      );
      hover.current = !!el;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    // ────────────────────────────────────────────────────
    // DOT-RING
    // ────────────────────────────────────────────────────
    const tickDotRing = () => {
      const { x, y } = mouse.current;
      const h = hover.current;
      const a = aRef.current;
      const b = bRef.current;

      if (a) {
        // Dot snaps — translate by half size (4px)
        a.style.transform = `translate3d(${x - 4}px,${y - 4}px,0)`;
        a.style.width  = h ? "10px" : "8px";
        a.style.height = h ? "10px" : "8px";
        a.style.background = h ? "#fff" : "hsl(var(--primary,167 139 250))";
      }

      if (b) {
        // Ring trails with lerp 0.28 — feels responsive not laggy
        trail.current.x = lerp(trail.current.x, x, 0.28);
        trail.current.y = lerp(trail.current.y, y, 0.28);
        const s = h ? 52 : 34;
        b.style.transform = `translate3d(${trail.current.x - s / 2}px,${trail.current.y - s / 2}px,0)`;
        b.style.width  = `${s}px`;
        b.style.height = `${s}px`;
        b.style.borderColor = h ? "rgba(255,255,255,0.55)" : "hsl(var(--primary,167 139 250)/0.4)";
        b.style.background  = h ? "hsl(var(--primary)/0.06)" : "transparent";
      }

      raf.current = requestAnimationFrame(tickDotRing);
    };

    // ────────────────────────────────────────────────────
    // CROSSHAIR
    // ────────────────────────────────────────────────────
    const tickCrosshair = () => {
      const { x, y } = mouse.current;
      const h = hover.current;
      const a = aRef.current;
      const b = bRef.current;

      if (a) {
        // Center dot snaps
        a.style.transform = `translate3d(${x - 2}px,${y - 2}px,0)`;
        a.style.opacity = h ? "1" : "0.7";
      }
      if (b) {
        // Crosshair ring trails slightly
        trail.current.x = lerp(trail.current.x, x, 0.32);
        trail.current.y = lerp(trail.current.y, y, 0.32);
        const s = h ? 44 : 30;
        b.style.transform = `translate3d(${trail.current.x - s / 2}px,${trail.current.y - s / 2}px,0)`;
        b.style.width  = `${s}px`;
        b.style.height = `${s}px`;
      }

      raf.current = requestAnimationFrame(tickCrosshair);
    };

    // ────────────────────────────────────────────────────
    // SPOTLIGHT — canvas spotlight follows cursor
    // ────────────────────────────────────────────────────
    const tickSpotlight = () => {
      const { x, y } = mouse.current;
      const h = hover.current;
      const c = cRef.current;
      const a = aRef.current;

      if (a) {
        // Small precise dot snaps
        a.style.transform = `translate3d(${x - 3}px,${y - 3}px,0)`;
        a.style.opacity = "1";
      }

      if (c) {
        trail.current.x = lerp(trail.current.x, x, 0.2);
        trail.current.y = lerp(trail.current.y, y, 0.2);
        const ctx = c.getContext("2d")!;
        c.width  = window.innerWidth;
        c.height = window.innerHeight;
        ctx.clearRect(0, 0, c.width, c.height);

        const r = h ? 140 : 100;
        const grd = ctx.createRadialGradient(trail.current.x, trail.current.y, 0, trail.current.x, trail.current.y, r);
        grd.addColorStop(0, "rgba(167,139,250,0.10)");
        grd.addColorStop(0.4, "rgba(167,139,250,0.04)");
        grd.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, c.width, c.height);
      }

      raf.current = requestAnimationFrame(tickSpotlight);
    };

    // ────────────────────────────────────────────────────
    // MAGNETIC — dot snaps, outer blob morphs toward cursor
    // ────────────────────────────────────────────────────
    const tickMagnetic = () => {
      const { x, y } = mouse.current;
      const h = hover.current;
      const a = aRef.current;
      const b = bRef.current;

      if (a) {
        a.style.transform = `translate3d(${x - 4}px,${y - 4}px,0)`;
        a.style.width  = h ? "12px" : "8px";
        a.style.height = h ? "12px" : "8px";
      }
      if (b) {
        // Magnetic blob — lerp 0.22, slight scale on hover
        trail.current.x = lerp(trail.current.x, x, 0.22);
        trail.current.y = lerp(trail.current.y, y, 0.22);
        const s = h ? 56 : 40;
        b.style.transform = `translate3d(${trail.current.x - s / 2}px,${trail.current.y - s / 2}px,0) rotate(${(trail.current.x - x) * 0.18}deg)`;
        b.style.width  = h ? `${s + 8}px` : `${s}px`;
        b.style.height = h ? `${s - 8}px` : `${s}px`;
        b.style.borderRadius = h ? "40% 60% 55% 45% / 55% 45% 55% 45%" : "50%";
      }

      raf.current = requestAnimationFrame(tickMagnetic);
    };

    const tickers: Record<CursorVariant, () => void> = {
      "dot-ring":   tickDotRing,
      "crosshair":  tickCrosshair,
      "spotlight":  tickSpotlight,
      "magnetic":   tickMagnetic,
    };

    raf.current = requestAnimationFrame(tickers[variant] ?? tickDotRing);

    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
    };
  }, [variant]);

  // ── Spotlight variant uses canvas ──
  if (variant === "spotlight") {
    return (
      <>
        <Style />
        {/* Spotlight canvas behind everything */}
        <canvas ref={cRef}
          style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh",
            pointerEvents: "none", zIndex: 9995 }} />
        {/* Precise dot on top */}
        <div ref={aRef} style={{
          position: "fixed", top: 0, left: 0, width: 6, height: 6,
          background: "hsl(var(--primary))", borderRadius: "50%",
          pointerEvents: "none", zIndex: 9999, willChange: "transform",
          transition: "opacity .15s",
        }} />
      </>
    );
  }

  // ── Crosshair variant ──
  if (variant === "crosshair") {
    return (
      <>
        <Style />
        {/* Center dot */}
        <div ref={aRef} style={{
          position: "fixed", top: 0, left: 0, width: 4, height: 4,
          background: "hsl(var(--primary))", borderRadius: "50%",
          pointerEvents: "none", zIndex: 9999, willChange: "transform",
        }} />
        {/* Crosshair ring — CSS draws the lines via box-shadow */}
        <div ref={bRef} style={{
          position: "fixed", top: 0, left: 0, width: 30, height: 30,
          pointerEvents: "none", zIndex: 9998, willChange: "transform",
          // Crosshair lines
          background: "transparent",
          // Lines via pseudo — we'll use outline + box-shadow trick
          border: "1px solid hsl(var(--primary)/0.55)",
          borderRadius: "2px",
          transition: "width .18s ease, height .18s ease",
          // Crosshair tick marks
          boxShadow: [
            // top tick
            `0 -8px 0 0 hsl(var(--primary)/0.5)`,
            // bottom tick
            `0 8px 0 0 hsl(var(--primary)/0.5)`,
            // left tick
            `-8px 0 0 0 hsl(var(--primary)/0.5)`,
            // right tick
            `8px 0 0 0 hsl(var(--primary)/0.5)`,
          ].join(","),
        }} />
      </>
    );
  }

  // ── Magnetic variant ──
  if (variant === "magnetic") {
    return (
      <>
        <Style />
        <div ref={aRef} style={{
          position: "fixed", top: 0, left: 0, width: 8, height: 8,
          background: "#fff", borderRadius: "50%",
          pointerEvents: "none", zIndex: 9999, willChange: "transform",
          transition: "width .12s, height .12s",
          mixBlendMode: "difference",
        }} />
        <div ref={bRef} style={{
          position: "fixed", top: 0, left: 0, width: 40, height: 40,
          border: "1.5px solid hsl(var(--primary)/0.5)",
          background: "hsl(var(--primary)/0.06)",
          borderRadius: "50%",
          pointerEvents: "none", zIndex: 9998, willChange: "transform",
          transition: "width .2s ease, height .2s ease, border-radius .3s ease",
        }} />
      </>
    );
  }

  // ── Default: dot-ring ──
  return (
    <>
      <Style />
      <div ref={aRef} style={{
        position: "fixed", top: 0, left: 0, width: 8, height: 8,
        background: "hsl(var(--primary))", borderRadius: "50%",
        pointerEvents: "none", zIndex: 9999, willChange: "transform",
        transition: "width .12s ease, height .12s ease, background .12s ease",
      }} />
      <div ref={bRef} style={{
        position: "fixed", top: 0, left: 0, width: 34, height: 34,
        border: "1px solid hsl(var(--primary)/0.38)",
        borderRadius: "50%",
        pointerEvents: "none", zIndex: 9998, willChange: "transform",
        transition: "width .18s ease, height .18s ease, border-color .18s ease, background .18s ease",
      }} />
    </>
  );
}

function Style() {
  return (
    <style>{`
      @media (pointer: fine) { * { cursor: none !important; } }
    `}</style>
  );
}
