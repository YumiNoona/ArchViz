"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";
import { haptic } from "ios-haptics";

const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Contact",  href: "#contact"  },
];

export default function Navbar() {
  const { config } = useSiteConfig();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const v = window.scrollY;
      setScrolled(v > 60);
      if (v > lastY.current + 8 && v > 150) setHidden(true);
      else if (v < lastY.current - 4) setHidden(false);
      lastY.current = v;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed top-0 left-0 right-0 z-[60]"
        animate={{ y: hidden ? -80 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 transition-all duration-500"
          style={{
            background: scrolled ? "rgba(8,6,4,0.85)" : "transparent",
            backdropFilter: scrolled ? "blur(20px) saturate(160%)" : "none",
            borderBottom: scrolled ? "1px solid rgba(196,164,120,0.08)" : "1px solid transparent",
          }}
        />

        <div className="relative max-w-7xl mx-auto px-8 lg:px-16 h-16 flex items-center justify-between">

          {/* Logo */}
          <motion.a
            href="/"
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-center gap-3"
          >
            <div
              className="w-7 h-7 rounded-lg flex items-center justify-center"
              style={{ background: "rgba(196,164,120,0.1)", border: "1px solid rgba(196,164,120,0.2)" }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M1 13 L7 1 L13 13" stroke="#c4a478" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3.5 8.5 L10.5 8.5" stroke="rgba(196,164,120,0.5)" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <span
              className="text-sm font-medium"
              style={{ fontFamily: "var(--font-display)", color: "rgba(245,235,215,0.85)", letterSpacing: "0.01em" }}
            >
              {config.brand || "VastuChitra"}
            </span>
          </motion.a>

          {/* Desktop nav */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="hidden md:flex items-center gap-1"
          >
            {navLinks.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                className="px-4 py-2 text-sm rounded-full transition-colors duration-200"
                style={{ color: "rgba(196,164,120,0.5)" }}
                onMouseEnter={e => e.currentTarget.style.color = "#c4a478"}
                onMouseLeave={e => e.currentTarget.style.color = "rgba(196,164,120,0.5)"}
              >
                {label}
              </a>
            ))}

            <motion.a
              href="#contact"
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => haptic()}
              className="ml-3 px-5 py-2 rounded-full text-xs font-medium"
              style={{
                background: "rgba(196,164,120,0.1)",
                border: "1px solid rgba(196,164,120,0.25)",
                color: "#c4a478",
              }}
            >
              Get in Touch
            </motion.a>
          </motion.div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2"
            style={{ color: "rgba(196,164,120,0.6)" }}
            onClick={() => { setMobileOpen(!mobileOpen); haptic(); }}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-[55] md:hidden flex items-start justify-center pt-20 px-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div
              className="absolute inset-0"
              style={{ background: "rgba(8,6,4,0.92)", backdropFilter: "blur(20px)" }}
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              className="relative w-full rounded-2xl p-6 space-y-1"
              style={{ background: "rgba(196,164,120,0.04)", border: "1px solid rgba(196,164,120,0.12)" }}
              initial={{ opacity: 0, y: -12, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {navLinks.map(({ label, href }, i) => (
                <motion.a
                  key={label}
                  href={href}
                  className="block px-4 py-3 rounded-xl text-base font-light"
                  style={{ color: "rgba(245,235,215,0.7)", fontFamily: "var(--font-display)" }}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => setMobileOpen(false)}
                  onMouseEnter={e => e.currentTarget.style.color = "#c4a478"}
                  onMouseLeave={e => e.currentTarget.style.color = "rgba(245,235,215,0.7)"}
                >
                  {label}
                </motion.a>
              ))}
              <div className="pt-3 mt-3" style={{ borderTop: "1px solid rgba(196,164,120,0.1)" }}>
                <a
                  href="#contact"
                  className="block text-center py-3 rounded-xl text-sm font-medium"
                  style={{ background: "rgba(196,164,120,0.9)", color: "#0c0a07" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Get in Touch
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
