"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { animate, stagger } from "animejs";

export function LoadingScreen({ onComplete }: { onComplete?: () => void }) {
  const [progress, setProgress] = useState(0);
  const svgRef = useRef<SVGSVGElement>(null);
  const initialized = useRef(false);
  const onCompleteRef = useRef(onComplete);

  // Update ref when prop changes, without triggering effects
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    const start = Date.now();
    const duration = 1500;

    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const raw = Math.min(elapsed / duration, 1);
      
      const eased = 1 - Math.pow(1 - raw, 3);
      const nextProgress = Math.min(Math.round(eased * 100), 100);
      setProgress(nextProgress);

      if (nextProgress >= 100) {
        clearInterval(timer);
        setTimeout(() => onCompleteRef.current?.(), 500);
      }
    }, 16);

    if (svgRef.current) {
      animate(svgRef.current.querySelectorAll("path"), {
        strokeDashoffset: [400, 0],
        opacity: [0, 1],
        duration: 1200,
        delay: stagger(120),
        easing: "easeInOutQuart",
      });
    }

    return () => clearInterval(timer);
  }, []); 

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black overflow-hidden"
    >
      <div className="relative flex flex-col items-center">
        <motion.span
          className="absolute -top-12 text-[10px] font-mono text-white/40 tracking-[0.3em] uppercase whitespace-nowrap"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          Initializing Visualization {progress}%
        </motion.span>

        <div className="relative">
          <svg
            ref={svgRef}
            width="240"
            height="80"
            viewBox="0 0 240 80"
            fill="none"
            className="drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
          >
            {/* I */}
            <path d="M40 20V60" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* P */}
            <path d="M80 60V20H110C121 20 121 40 110 40H80" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* D */}
            <path d="M150 20V60C175 60 175 20 150 20Z" stroke="white" strokeWidth="2" strokeLinecap="round" />
            {/* S */}
            <path d="M220 20H195C185 20 185 40 220 40C230 40 230 60 220 60H195" stroke="white" strokeWidth="2" strokeLinecap="round" />
          </svg>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div
              className="w-[1px] bg-white h-24 shadow-[0_0_20px_rgba(255,255,255,1)]"
              style={{ left: `${progress}%`, position: "absolute", opacity: 0.5 }}
            />
          </div>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="mt-8 text-[11px] uppercase tracking-[0.5em] text-white/30 font-mono"
        >
          Architectural Real-Time Systems
        </motion.p>
      </div>

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(226,255,175,0.05)_0%,transparent_70%)] pointer-events-none" />
    </motion.div>
  );
}
