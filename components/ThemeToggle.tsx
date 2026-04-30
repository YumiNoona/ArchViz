"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return (
    <div className="w-9 h-9 rounded-lg border border-border bg-secondary/50 animate-pulse" />
  );

  const isDark = theme === "dark";

  const handleToggle = (e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    const toLight = isDark; // switching FROM dark → TO light

    // Fire ripple BEFORE setTheme so canvas covers the swap
    window.dispatchEvent(
      new CustomEvent("theme-toggle", { detail: { x, y, toLight } })
    );

    // Small delay so the ripple starts before DOM class changes
    setTimeout(() => setTheme(isDark ? "light" : "dark"), 30);
  };

  return (
    <button
      onClick={handleToggle}
      className="relative w-9 h-9 rounded-lg border border-border bg-background hover:bg-secondary/50 transition-colors flex items-center justify-center group"
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={isDark ? "dark" : "light"}
          initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
          transition={{ duration: 0.15, ease: "circOut" }}
          className="text-foreground"
        >
          {isDark ? <Moon size={16} /> : <Sun size={16} />}
        </motion.div>
      </AnimatePresence>
    </button>
  );
}
