"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { haptic } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const btnRef = useRef<HTMLButtonElement>(null);
  useEffect(() => setMounted(true), []);
  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  const toggle = () => {
    haptic(8);
    const goingToLight = isDark; // currently dark → going light
    if (btnRef.current) {
      const rect = btnRef.current.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;
      // dispatch BEFORE setTheme so we know direction correctly
      window.dispatchEvent(
        new CustomEvent("theme-toggle", { detail: { x, y, toLight: goingToLight } })
      );
    }
    // slight delay so canvas starts before DOM changes
    setTimeout(() => setTheme(isDark ? "light" : "dark"), 20);
  };

  return (
    <motion.button
      ref={btnRef}
      onClick={toggle}
      className="relative w-9 h-9 rounded-full flex items-center justify-center border border-border hover:border-primary/50 transition-colors duration-200 overflow-hidden"
      whileTap={{ scale: 0.85 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.div key={isDark ? "moon" : "sun"}
          initial={{ rotate: -180, opacity: 0, scale: 0.3 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 180, opacity: 0, scale: 0.3 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          {isDark
            ? <Sun size={14} className="text-amber-400" />
            : <Moon size={14} className="text-indigo-500" />}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
