"use client";

import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { animate, stagger } from "animejs";

export default function Hero() {
  const [mounted, setMounted] = useState(false);

  const line1Ref = useRef<HTMLDivElement>(null);
  const line2Ref = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Animate each line independently so whitespace-nowrap is preserved
    [line1Ref, line2Ref].forEach((lineRef, lineIndex) => {
      if (!lineRef.current) return;

      const text = lineRef.current.textContent || "";
      lineRef.current.innerHTML = text
        .split("")
        .map(
          (char) =>
            `<span class="inline-block opacity-0">${
              char === " " ? "&nbsp;" : char
            }</span>`
        )
        .join("");

      animate(lineRef.current.querySelectorAll("span"), {
        opacity: [0, 1],
        translateY: [20, 0],
        scale: [0.9, 1],
        rotateX: [30, 0],
        duration: 800,
        // stagger within the line; second line starts after first line's delay
        delay: stagger(30, { start: 200 + lineIndex * 400 }),
        easing: "outElastic(1, .8)",
      });
    });

    if (gridRef.current) {
      animate(gridRef.current, {
        backgroundPositionY: ["0px", "80px"],
        duration: 2000,
        easing: "linear",
        loop: true,
      });
    }
  }, [mounted]);

  if (!mounted) return null;

  return (
    <section
      className="
        relative
        pt-32
        pb-20
        md:pt-48
        md:pb-32
        overflow-hidden
        flex
        flex-col
        items-center
        text-center
        px-6
      "
    >
      {/* Radial glow */}
      <div
        className="
          absolute
          top-0
          left-1/2
          -translate-x-1/2
          w-full
          h-[600px]
          bg-[radial-gradient(circle_at_center,rgba(226,255,175,0.08)_0%,transparent_70%)]
          pointer-events-none
        "
      />

      <div
        className="
          relative
          z-10
          max-w-7xl
          flex
          flex-col
          items-center
        "
      >
        <h1
          className="
            text-5xl
            sm:text-6xl
            md:text-7xl
            lg:text-8xl
            font-medium
            tracking-tighter
            leading-[0.95]
            mb-6
            text-center
          "
        >
          {/* Each line gets its own ref — structure is never flattened */}
          <div ref={line1Ref} className="whitespace-nowrap block">
            Explore Architecture
          </div>
          <div ref={line2Ref} className="whitespace-nowrap block">
            Before It&apos;s Built
          </div>
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.6,
            delay: 0.8,
            ease: [0.16, 1, 0.3, 1],
          }}
          className="
            flex
            flex-col
            sm:flex-row
            items-center
            gap-4
          "
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-vercel h-12 px-8 text-base group"
            onClick={() => {
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            View Projects
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="btn-secondary h-12 px-8 text-base"
            onClick={() => {
              document
                .getElementById("contact")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Contact Sales
          </motion.button>
        </motion.div>
      </div>

      {/* Bottom border */}
      <div
        className="
          absolute
          bottom-0
          left-0
          w-full
          h-px
          bg-gradient-to-r
          from-transparent
          via-border
          to-transparent
        "
      />

      {/* Animated perspective grid */}
      <div
        ref={gridRef}
        className="
          absolute
          bottom-[-100px]
          left-1/2
          -translate-x-1/2
          w-[200%]
          h-[400px]
          opacity-20
          pointer-events-none
        "
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--border)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--border)) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
          transform: "perspective(500px) rotateX(60deg)",
          maskImage:
            "radial-gradient(ellipse at center, black 10%, transparent 70%)",
        }}
      />
    </section>
  );
}