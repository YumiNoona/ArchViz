"use client";
import { useSiteConfig } from "./SiteConfigProvider";
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { haptic } from "@/lib/utils";
import { Menu, X } from "lucide-react";

const navLinks = [
  { label: "Projects", href: "#projects" },
  { label: "Studio",   href: "#about"    },
  { label: "Process",  href: "#process"  },
  { label: "Contact",  href: "#contact"  },
];

export default function Navbar() {
  const { config } = useSiteConfig();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [hidden,      setHidden]      = useState(false);
  const [activeLink,  setActiveLink]  = useState("");
  const lastY = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const v = window.scrollY;
      setScrolled(v > 60);
      if (v > lastY.current + 8 && v > 150) setHidden(true);
      else if (v < lastY.current - 4)        setHidden(false);
      lastY.current = v;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <motion.nav
        className="fixed left-0 right-0 z-[60]"
        style={{ top: 0 }}
        animate={{ y: hidden ? -100 : 0, opacity: hidden ? 0 : 1 }}
        transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}>

        {/* Backdrop */}
        <div className="absolute inset-0 transition-all duration-500"
          style={{
            background: scrolled ? "hsl(var(--background)/0.88)" : "transparent",
            backdropFilter: scrolled ? "blur(16px) saturate(140%)" : "none",
            borderBottom: scrolled ? "1px solid hsl(var(--border)/0.5)" : "1px solid transparent",
          }} />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-10 h-16 flex items-center justify-between">

          {/* Logo */}
          <motion.a href="/" className="flex items-center gap-3 group"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: [0.16,1,0.3,1] }}>
            {/* Monogram mark */}
            <div className="w-8 h-8 rounded-xl flex items-center justify-center relative overflow-hidden"
              style={{ background: "hsl(var(--primary)/0.12)", border: "1px solid hsl(var(--primary)/0.25)" }}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 14 L8 2 L14 14" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                <path d="M4.5 9.5 L11.5 9.5" stroke="hsl(var(--primary)/0.5)" strokeWidth="1" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-sm font-medium tracking-wide"
              style={{ fontFamily: "var(--font-display)", color: "hsl(var(--foreground))" }}>
              {config.brand || "VastuChitra"}
            </span>
          </motion.a>

          {/* Nav links — desktop */}
          <motion.div className="hidden lg:flex items-center gap-1"
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}>
            {navLinks.map(({ label, href }) => (
              <a key={label} href={href}
                className="relative px-4 py-2 text-sm rounded-full transition-colors duration-200"
                style={{ color: activeLink === label ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}
                onMouseEnter={() => setActiveLink(label)}
                onMouseLeave={() => setActiveLink("")}>
                {activeLink === label && (
                  <motion.div className="absolute inset-0 rounded-full"
                    layoutId="nav-pill"
                    style={{ background: "hsl(var(--surface-2))" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }} />
                )}
                <span className="relative z-10">{label}</span>
              </a>
            ))}
          </motion.div>

          {/* Right: theme + CTA */}
          <motion.div className="hidden lg:flex items-center gap-3"
            initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.15 }}>
            <ThemeToggle />
            <a href="#contact" onClick={() => haptic(8)}
              className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium transition-all"
              style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
              onMouseEnter={e => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = ""; }}>
              Get in Touch
            </a>
          </motion.div>

          {/* Mobile */}
          <div className="flex items-center gap-3 lg:hidden">
            <ThemeToggle />
            <button onClick={() => { setMobileOpen(!mobileOpen); haptic(6); }}
              className="p-2 rounded-xl" style={{ color: "hsl(var(--foreground))" }}>
              {mobileOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div className="fixed inset-0 z-[55] lg:hidden"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <div className="absolute inset-0" style={{ background: "hsl(var(--background)/0.95)", backdropFilter: "blur(20px)" }}
              onClick={() => setMobileOpen(false)} />
            <motion.div className="absolute top-20 left-6 right-6 p-6 rounded-2xl border space-y-1"
              style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))" }}
              initial={{ opacity: 0, y: -12, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.35, ease: [0.16,1,0.3,1] }}>
              {navLinks.map(({ label, href }, i) => (
                <motion.a key={label} href={href}
                  className="block px-4 py-3 rounded-xl text-base transition-colors"
                  style={{ color: "hsl(var(--foreground)/0.8)", fontFamily: "var(--font-display)" }}
                  initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  onClick={() => { setMobileOpen(false); haptic(6); }}
                  onMouseEnter={e => { e.currentTarget.style.background = "hsl(var(--surface-2))"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
                  onMouseLeave={e => { e.currentTarget.style.background = ""; e.currentTarget.style.color = "hsl(var(--foreground)/0.8)"; }}>
                  {label}
                </motion.a>
              ))}
              <div className="pt-3 border-t" style={{ borderColor: "hsl(var(--border))" }}>
                <a href="#contact"
                  className="block text-center py-3 rounded-xl text-sm font-medium"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))" }}
                  onClick={() => setMobileOpen(false)}>
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
