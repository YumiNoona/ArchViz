"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import { haptic } from "@/lib/utils";

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  if (!mounted) return <div className="w-9 h-9" />;

  const isDark = theme === "dark";

  return (
    <motion.button
      onClick={() => {
        haptic(6);
        setTheme(isDark ? "light" : "dark");
      }}
      className="relative w-9 h-9 rounded-full flex items-center justify-center border border-border hover:border-primary/50 transition-colors duration-300 overflow-hidden"
      whileTap={{ scale: 0.9 }}
      aria-label={`Switch to ${isDark ? "light" : "dark"} mode`}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={isDark ? "moon" : "sun"}
          initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
          animate={{ rotate: 0, opacity: 1, scale: 1 }}
          exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          {isDark ? (
            <Sun size={15} className="text-muted-foreground" />
          ) : (
            <Moon size={15} className="text-muted-foreground" />
          )}
        </motion.div>
      </AnimatePresence>
    </motion.button>
  );
}
