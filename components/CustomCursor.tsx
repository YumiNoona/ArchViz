"use client";

import { useEffect, useRef } from "react";

export default function CustomCursor() {
  const dotRef  = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const pos     = useRef({ x: -200, y: -200 });
  const ring    = useRef({ x: -200, y: -200 });
  const hover   = useRef(false);
  const raf     = useRef<number>();

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.matchMedia("(pointer: coarse)").matches) return;

    // Hide system cursor
    document.documentElement.style.cursor = "none";

    const onMove = (e: MouseEvent) => {
      pos.current.x = e.clientX;
      pos.current.y = e.clientY;
    };

    const onOver = (e: MouseEvent) => {
      const el = (e.target as HTMLElement).closest(
        "a, button, [role=button], input, textarea, select, label"
      );
      hover.current = !!el;
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      raf.current = requestAnimationFrame(tick);

      const dot  = dotRef.current;
      const rng  = ringRef.current;
      if (!dot || !rng) return;

      const { x, y } = pos.current;
      const h = hover.current;

      // Dot snaps instantly
      dot.style.transform = `translate3d(${x - 4}px, ${y - 4}px, 0)`;

      // Ring lags
      ring.current.x = lerp(ring.current.x, x, 0.18);
      ring.current.y = lerp(ring.current.y, y, 0.18);

      const rs = h ? 44 : 28;
      rng.style.transform = `translate3d(${ring.current.x - rs / 2}px, ${ring.current.y - rs / 2}px, 0)`;
      rng.style.width  = `${rs}px`;
      rng.style.height = `${rs}px`;
      rng.style.borderColor = h ? "rgba(196,164,120,0.7)" : "rgba(196,164,120,0.35)";
      rng.style.borderWidth  = h ? "1.5px" : "1px";

      // Dot size
      const ds = h ? 6 : 8;
      dot.style.width  = `${ds}px`;
      dot.style.height = `${ds}px`;
      dot.style.background = h ? "rgba(196,164,120,0.9)" : "#c4a478";
    };

    raf.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      if (raf.current) cancelAnimationFrame(raf.current);
      document.documentElement.style.cursor = "";
    };
  }, []);

  const base: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    pointerEvents: "none",
    zIndex: 99999,
    willChange: "transform",
  };

  return (
    <>
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          ...base,
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: "#c4a478",
          transition: "width 0.15s ease, height 0.15s ease, background 0.2s ease",
        }}
      />
      {/* Ring */}
      <div
        ref={ringRef}
        style={{
          ...base,
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid rgba(196,164,120,0.35)",
          transition: "width 0.2s ease, height 0.2s ease, border-color 0.2s ease, border-width 0.2s ease",
        }}
      />
    </>
  );
}
