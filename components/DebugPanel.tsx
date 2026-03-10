"use client";
import { useSiteConfig, DebugPreset } from "./SiteConfigProvider";

import { useState, useEffect, createContext, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Settings2, X, Type, Palette, Layout, Eye, Zap, Globe, Save, Trash2 as Trash } from "lucide-react";

/* ══════════════════════════════════════════════════════════
   FONTS
══════════════════════════════════════════════════════════ */
export const FONTS = [
  {
    id: "editorial",
    label: "Editorial",
    sub: "Cormorant Garamond · architectural serif",
    display: "'Cormorant Garamond', Georgia, serif",
    body: "'DM Sans', system-ui, sans-serif",
    url: null,
  },
  {
    id: "vercel",
    label: "Vercel / Geist",
    sub: "Inter · sharp modern system",
    display: "'Inter', system-ui, sans-serif",
    body: "'Inter', system-ui, sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "supabase",
    label: "Supabase",
    sub: "DM Sans · technical precision",
    display: "'DM Sans', system-ui, sans-serif",
    body: "'DM Sans', system-ui, sans-serif",
    url: null,
  },
  {
    id: "apple",
    label: "Apple SF Pro",
    sub: "System · immaculate precision",
    display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif",
    body: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif",
    url: null,
  },
  {
    id: "chanel",
    label: "Chanel",
    sub: "Playfair Display · haute couture",
    display: "'Playfair Display', 'Didot', serif",
    body: "'Jost', 'DM Sans', sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Jost:wght@300;400;500&display=swap",
  },
  {
    id: "neue",
    label: "Swiss Neue",
    sub: "Space Grotesk · bold Swiss design",
    display: "'Space Grotesk', system-ui, sans-serif",
    body: "'Space Grotesk', system-ui, sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap",
  },
  {
    id: "mono",
    label: "Mono / Terminal",
    sub: "JetBrains Mono · raw technical",
    display: "'JetBrains Mono', 'DM Mono', monospace",
    body: "'JetBrains Mono', 'DM Mono', monospace",
    url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap",
  },
  {
    id: "fraunces",
    label: "Fraunces",
    sub: "Fraunces · optical soft serif",
    display: "'Fraunces', serif",
    body: "'Outfit', sans-serif",
    url: "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap",
  },
] as const;

/* ══════════════════════════════════════════════════════════
   DARK THEMES  (3 total)
══════════════════════════════════════════════════════════ */
const DARK_THEMES = [
  {
    id: "obsidian",
    label: "Obsidian",
    sub: "Warm violet charcoal",
    sw: ["#0C0B18", "#16152A", "#A78BFA"],
    vars: {
      "--background":"240 15% 6%","--foreground":"40 18% 91%",
      "--card":"240 14% 9%","--card-foreground":"40 18% 91%",
      "--border":"240 10% 14%","--muted":"240 12% 13%","--muted-foreground":"240 6% 50%",
      "--primary":"258 78% 70%","--primary-foreground":"0 0% 100%",
      "--secondary":"240 12% 13%","--secondary-foreground":"40 12% 78%",
      "--accent":"258 78% 70%","--accent-foreground":"0 0% 100%",
      "--input":"240 10% 14%","--ring":"258 78% 70%",
    },
  },
  {
    id: "vercel-dark",
    label: "Vercel",
    sub: "Pure ash black",
    sw: ["#0A0A0A", "#171717", "#EDEDED"],
    vars: {
      "--background":"0 0% 4%","--foreground":"0 0% 93%",
      "--card":"0 0% 7%","--card-foreground":"0 0% 93%",
      "--border":"0 0% 12%","--muted":"0 0% 10%","--muted-foreground":"0 0% 46%",
      "--primary":"0 0% 92%","--primary-foreground":"0 0% 5%",
      "--secondary":"0 0% 10%","--secondary-foreground":"0 0% 80%",
      "--accent":"0 0% 92%","--accent-foreground":"0 0% 5%",
      "--input":"0 0% 12%","--ring":"0 0% 92%",
    },
  },
  {
    id: "midnight-teal",
    label: "Midnight Teal",
    sub: "Deep ocean & teal glow",
    sw: ["#030E12", "#072030", "#14B8A6"],
    vars: {
      "--background":"196 60% 4%","--foreground":"185 25% 90%",
      "--card":"196 55% 7%","--card-foreground":"185 25% 90%",
      "--border":"196 35% 12%","--muted":"196 40% 10%","--muted-foreground":"196 12% 50%",
      "--primary":"174 85% 42%","--primary-foreground":"196 60% 4%",
      "--secondary":"196 40% 10%","--secondary-foreground":"185 20% 75%",
      "--accent":"174 85% 42%","--accent-foreground":"196 60% 4%",
      "--input":"196 35% 12%","--ring":"174 85% 42%",
    },
  },
  {
    id: "ember",
    label: "Ember",
    sub: "Dark amber & fire",
    sw: ["#0D0700", "#1E1100", "#F59E0B"],
    vars: {
      "--background":"28 70% 4%","--foreground":"40 30% 90%",
      "--card":"28 60% 7%","--card-foreground":"40 30% 90%",
      "--border":"28 40% 12%","--muted":"28 45% 10%","--muted-foreground":"28 12% 50%",
      "--primary":"38 96% 54%","--primary-foreground":"28 70% 4%",
      "--secondary":"28 45% 10%","--secondary-foreground":"40 22% 75%",
      "--accent":"38 96% 54%","--accent-foreground":"28 70% 4%",
      "--input":"28 40% 12%","--ring":"38 96% 54%",
    },
  },
] as const;

/* ══════════════════════════════════════════════════════════
   LIGHT THEMES  (4 total)
══════════════════════════════════════════════════════════ */
const LIGHT_THEMES = [
  {
    id: "saffron",
    label: "Saffron",
    sub: "Warm amber cream",
    sw: ["#F5EFE0", "#FDE9C5", "#EA6A1A"],
    vars: {
      "--background":"38 52% 95%","--foreground":"220 30% 10%",
      "--card":"38 40% 91%","--card-foreground":"220 30% 10%",
      "--border":"38 20% 80%","--muted":"38 25% 88%","--muted-foreground":"220 14% 42%",
      "--primary":"22 92% 48%","--primary-foreground":"0 0% 100%",
      "--secondary":"38 30% 86%","--secondary-foreground":"220 25% 15%",
      "--accent":"22 92% 48%","--accent-foreground":"0 0% 100%",
      "--input":"38 20% 80%","--ring":"22 92% 48%",
    },
  },
  {
    id: "arctic",
    label: "Arctic Sky",
    sub: "Sky blue & fresh teal",
    sw: ["#EBF5FF", "#C8E6FF", "#0EA5E9"],
    vars: {
      "--background":"210 70% 97%","--foreground":"215 35% 10%",
      "--card":"210 55% 93%","--card-foreground":"215 35% 10%",
      "--border":"210 30% 84%","--muted":"210 35% 90%","--muted-foreground":"215 16% 44%",
      "--primary":"199 89% 46%","--primary-foreground":"0 0% 100%",
      "--secondary":"210 30% 88%","--secondary-foreground":"215 28% 18%",
      "--accent":"199 89% 46%","--accent-foreground":"0 0% 100%",
      "--input":"210 30% 84%","--ring":"199 89% 46%",
    },
  },
  {
    id: "rose-linen",
    label: "Rose Linen",
    sub: "Dusty rose & terracotta",
    sw: ["#FDF0F0", "#F9E0E0", "#DC4444"],
    vars: {
      "--background":"0 40% 97%","--foreground":"355 30% 12%",
      "--card":"0 28% 93%","--card-foreground":"355 30% 12%",
      "--border":"0 20% 84%","--muted":"0 22% 90%","--muted-foreground":"355 12% 45%",
      "--primary":"4 78% 52%","--primary-foreground":"0 0% 100%",
      "--secondary":"0 22% 88%","--secondary-foreground":"355 25% 18%",
      "--accent":"4 78% 52%","--accent-foreground":"0 0% 100%",
      "--input":"0 20% 84%","--ring":"4 78% 52%",
    },
  },
  {
    id: "forest",
    label: "Forest Sage",
    sub: "Deep green & gold",
    sw: ["#F0F5EE", "#DCF0D8", "#3D8F4A"],
    vars: {
      "--background":"120 25% 96%","--foreground":"130 35% 10%",
      "--card":"120 18% 91%","--card-foreground":"130 35% 10%",
      "--border":"120 15% 82%","--muted":"120 15% 88%","--muted-foreground":"130 12% 44%",
      "--primary":"135 45% 35%","--primary-foreground":"0 0% 100%",
      "--secondary":"120 15% 86%","--secondary-foreground":"130 28% 15%",
      "--accent":"135 45% 35%","--accent-foreground":"0 0% 100%",
      "--input":"120 15% 82%","--ring":"135 45% 35%",
    },
  },
] as const;

/* ══════════════════════════════════════════════════════════
   CAROUSEL STYLES
══════════════════════════════════════════════════════════ */
const CAROUSEL_STYLES = [
  { id: "fan-3d", label: "3D Fan", sub: "Perspective rotation spread" },
  { id: "glass-stack", label: "Glass Stack", sub: "Frosted stacked cards" },
  { id: "coverflow", label: "Coverflow", sub: "iTunes-style flip" },
  { id: "orbital", label: "Orbital", sub: "Circular orbit layout" },
] as const;

/* ══════════════════════════════════════════════════════════
   PAGE ANIMATIONS
══════════════════════════════════════════════════════════ */
const PAGE_ANIMATIONS = [
  { id: "fade-blur", label: "Fade + Blur", sub: "Soft blur reveal" },
  { id: "slide-up", label: "Slide Up", sub: "Classic upward slide" },
  { id: "spring-pop", label: "Spring Pop", sub: "Bouncy spring entrance" },
  { id: "split-reveal", label: "Split Reveal", sub: "Text splits apart" },
  { id: "scramble", label: "Scramble", sub: "Matrix text scramble" },
  { id: "stagger-wave", label: "Stagger Wave", sub: "Wave through words" },
] as const;

/* ══════════════════════════════════════════════════════════
   CURSOR VARIANTS
══════════════════════════════════════════════════════════ */
const CURSOR_VARIANTS = [
  { id: "dot-ring",   label: "Dot + Ring",   sub: "Classic dot with trailing ring" },
  { id: "crosshair",  label: "Crosshair",    sub: "Precision architectural reticle" },
  { id: "spotlight",  label: "Spotlight",    sub: "Soft glow follows cursor" },
  { id: "magnetic",   label: "Magnetic",     sub: "Morphing blob with blend mode" },
] as const;

export const HERO_VARIANTS = [
  { id: "split", label: "Split", sub: "Text left · visual right" },
  { id: "centered", label: "Centered", sub: "Full center · cinematic" },
  { id: "bold", label: "Bold Type", sub: "Giant headline · minimal" },
] as const;

export const FOOTER_VARIANTS = [
  { id: "minimal", label: "Minimal", sub: "Single line" },
  { id: "full", label: "Full Grid", sub: "Links & brand" },
  { id: "centered", label: "Centered", sub: "Logo + links" },
] as const;

/* ══════════════════════════════════════════════════════════
   CONTEXT
══════════════════════════════════════════════════════════ */
interface DebugCtx {
  heroVariant: string;
  footerVariant: string;
  carouselStyle: string;
  pageAnimation: string;
  cursorVariant: string;
}
const DebugContext = createContext<DebugCtx>({
  heroVariant: "split", footerVariant: "minimal",
  carouselStyle: "fan-3d", pageAnimation: "fade-blur",
  cursorVariant: "dot-ring",
});
export const useDebug = () => useContext(DebugContext);

/* ══════════════════════════════════════════════════════════
   PROVIDER
══════════════════════════════════════════════════════════ */
export function DebugProvider({ children }: { children: React.ReactNode }) {
  const [heroVariant, setHeroVariant] = useState("split");
  const [footerVariant, setFooterVariant] = useState("minimal");
  const [carouselStyle, setCarouselStyle] = useState("fan-3d");
  const [pageAnimation, setPageAnimation] = useState("fade-blur");
  const [cursorVariant, setCursorVariant] = useState("dot-ring");
  const [fontId, setFontId] = useState("editorial");
  const [darkId, setDarkId] = useState("obsidian");
  const [lightId, setLightId] = useState("saffron");
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState<"font" | "theme" | "layout" | "animation" | "site" | "presets">("font");

  const applyFont = (id: string) => {
    const f = FONTS.find(x => x.id === id);
    if (!f) return;
    setFontId(id);
    const old = document.getElementById("dbg-gf");
    if (old) old.remove();
    if (f.url) {
      const link = document.createElement("link");
      link.id = "dbg-gf"; link.rel = "stylesheet"; link.href = f.url;
      document.head.appendChild(link);
    }
    const root = document.documentElement;
    root.style.setProperty("--font-display", f.display);
    root.style.setProperty("--font-body", f.body);
    document.body.style.fontFamily = f.body;
    document.querySelectorAll("h1,h2,h3,h4").forEach(el => {
      (el as HTMLElement).style.fontFamily = f.display;
    });
  };

  const applyTheme = (id: string, dark: boolean) => {
    const list = dark ? DARK_THEMES : LIGHT_THEMES;
    const t = list.find(x => x.id === id);
    if (!t) return;
    const root = document.documentElement;
    Object.entries(t.vars).forEach(([k, v]) => root.style.setProperty(k, v as string));
    if (dark) setDarkId(id); else setLightId(id);
  };

  return (
    <DebugContext.Provider value={{ heroVariant, footerVariant, carouselStyle, pageAnimation, cursorVariant }}>
      {children}
      <DebugUI
        open={open} setOpen={setOpen} tab={tab} setTab={setTab}
        fontId={fontId} applyFont={applyFont}
        darkId={darkId} lightId={lightId} applyTheme={applyTheme}
        heroVariant={heroVariant} setHeroVariant={setHeroVariant}
        footerVariant={footerVariant} setFooterVariant={setFooterVariant}
        carouselStyle={carouselStyle} setCarouselStyle={setCarouselStyle}
        pageAnimation={pageAnimation} setPageAnimation={setPageAnimation}
        cursorVariant={cursorVariant} setCursorVariant={setCursorVariant}
      />
    </DebugContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════════
   PANEL UI
══════════════════════════════════════════════════════════ */
function DebugUI({ open, setOpen, tab, setTab, fontId, applyFont, darkId, lightId, applyTheme,
  heroVariant, setHeroVariant, footerVariant, setFooterVariant, carouselStyle, setCarouselStyle,
  pageAnimation, setPageAnimation, cursorVariant, setCursorVariant }: any) {

  const tabs = [
    { id: "font",      icon: Type,     label: "Fonts"  },
    { id: "theme",     icon: Palette,  label: "Theme"  },
    { id: "layout",    icon: Layout,   label: "Layout" },
    { id: "animation", icon: Zap,      label: "Motion" },
    { id: "site",      icon: Globe,    label: "Site"   },
    { id: "presets",   icon: Save,     label: "Presets"},
  ];

  return (
    <>
      <motion.button onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-[9985] w-11 h-11 rounded-full shadow-2xl flex items-center justify-center border"
        style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))", color: "hsl(var(--muted-foreground))" }}
        whileHover={{ scale: 1.1, color: "hsl(var(--foreground))" }} whileTap={{ scale: 0.9 }}
        title="Debug Panel">
        <AnimatePresence mode="wait">
          <motion.div key={open ? "x" : "s"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }} animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }} transition={{ duration: 0.18 }}>
            {open ? <X size={16} /> : <Settings2 size={16} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 right-6 z-[9984] w-[285px] rounded-2xl overflow-hidden shadow-2xl border"
            style={{ background: "hsl(var(--card))", borderColor: "hsl(var(--border))" }}
            initial={{ opacity: 0, y: 16, scale: 0.92 }} animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: "hsl(var(--border)/0.6)" }}>
              <div className="flex items-center gap-2">
                <Eye size={11} style={{ color: "hsl(var(--primary))" }} />
                <span className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>Design Debug</span>
              </div>
              <span className="text-[9px] font-mono tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground)/0.5)" }}>Live Preview</span>
            </div>

            {/* Tabs */}
            <div className="flex border-b" style={{ borderColor: "hsl(var(--border)/0.4)" }}>
              {tabs.map(({ id, icon: Icon, label }) => (
                <button key={id} onClick={() => setTab(id)}
                  className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-all duration-200"
                  style={{ color: tab === id ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))" }}>
                  <Icon size={11} />
                  <span className="text-[9px]">{label}</span>
                  {tab === id && (
                    <motion.div layoutId="dtab" className="absolute bottom-0 left-1 right-1 h-px rounded-full"
                      style={{ background: "hsl(var(--primary))" }}
                      transition={{ type: "spring", bounce: 0.25, duration: 0.3 }} />
                  )}
                </button>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="max-h-[360px] overflow-y-auto p-2.5 space-y-1">
              <AnimatePresence mode="wait">

                {/* ─ FONTS ─ */}
                {tab === "font" && (
                  <motion.div key="f" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => applyFont(f.id)}
                        className="w-full text-left p-3 rounded-xl border mb-1 transition-all"
                        style={{
                          borderColor: fontId === f.id ? "hsl(var(--primary)/0.4)" : "transparent",
                          background: fontId === f.id ? "hsl(var(--primary)/0.08)" : "transparent",
                        }}
                        onMouseOver={e => { if (fontId !== f.id) (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted)/0.6)"; }}
                        onMouseOut={e => { if (fontId !== f.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[11px] font-semibold" style={{ fontFamily: f.display, color: "hsl(var(--foreground))" }}>{f.label}</span>
                          {fontId === f.id && <span className="text-[9px]" style={{ color: "hsl(var(--primary))" }}>● Active</span>}
                        </div>
                        <div className="text-[9px] mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>{f.sub}</div>
                        <div className="text-sm font-light truncate" style={{ fontFamily: f.display, color: "hsl(var(--foreground)/0.85)" }}>
                          Architecture Experiences
                        </div>
                        <div className="text-[10px] mt-0.5 truncate" style={{ fontFamily: f.body, color: "hsl(var(--muted-foreground)/0.6)" }}>
                          Real-time visualization platform
                        </div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* ─ THEME ─ */}
                {tab === "theme" && (
                  <motion.div key="t" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Dark Modes</p>
                    {DARK_THEMES.map(t => (
                      <button key={t.id} onClick={() => applyTheme(t.id, true)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border mb-1 transition-all"
                        style={{ borderColor: darkId === t.id ? "hsl(var(--primary)/0.4)" : "transparent", background: darkId === t.id ? "hsl(var(--primary)/0.08)" : "transparent" }}
                        onMouseOver={e => { if (darkId !== t.id) (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted)/0.6)"; }}
                        onMouseOut={e => { if (darkId !== t.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          {t.sw.map((c, i) => <div key={i} className="w-5 h-5 rounded-full border-2" style={{ background: c, borderColor: "hsl(var(--card))", zIndex: 3 - i }} />)}
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{t.label}</div>
                          <div className="text-[10px]" style={{ color: "hsl(var(--muted-foreground)/0.6)" }}>{t.sub}</div>
                        </div>
                        {darkId === t.id && <span className="text-[9px]" style={{ color: "hsl(var(--primary))" }}>✓</span>}
                      </button>
                    ))}
                    <p className="text-[9px] font-medium tracking-widest uppercase px-1 mt-3 mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Light Modes</p>
                    {LIGHT_THEMES.map(t => (
                      <button key={t.id} onClick={() => applyTheme(t.id, false)}
                        className="w-full flex items-center gap-3 p-3 rounded-xl border mb-1 transition-all"
                        style={{ borderColor: lightId === t.id ? "hsl(var(--primary)/0.4)" : "transparent", background: lightId === t.id ? "hsl(var(--primary)/0.08)" : "transparent" }}
                        onMouseOver={e => { if (lightId !== t.id) (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted)/0.6)"; }}
                        onMouseOut={e => { if (lightId !== t.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                      >
                        <div className="flex -space-x-1.5 flex-shrink-0">
                          {t.sw.map((c, i) => <div key={i} className="w-5 h-5 rounded-full border-2" style={{ background: c, borderColor: "hsl(var(--card))", zIndex: 3 - i }} />)}
                        </div>
                        <div className="text-left flex-1">
                          <div className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{t.label}</div>
                          <div className="text-[10px]" style={{ color: "hsl(var(--muted-foreground)/0.6)" }}>{t.sub}</div>
                        </div>
                        {lightId === t.id && <span className="text-[9px]" style={{ color: "hsl(var(--primary))" }}>✓</span>}
                      </button>
                    ))}
                  </motion.div>
                )}

                {/* ─ LAYOUT ─ */}
                {tab === "layout" && (
                  <motion.div key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Hero</p>
                    {HERO_VARIANTS.map(v => (
                      <OptionRow key={v.id} label={v.label} sub={v.sub} active={heroVariant === v.id} onClick={() => setHeroVariant(v.id)} />
                    ))}
                    <p className="text-[9px] font-medium tracking-widest uppercase px-1 mt-3 mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Footer</p>
                    {FOOTER_VARIANTS.map(v => (
                      <OptionRow key={v.id} label={v.label} sub={v.sub} active={footerVariant === v.id} onClick={() => setFooterVariant(v.id)} />
                    ))}
                    <p className="text-[9px] font-medium tracking-widest uppercase px-1 mt-3 mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Carousel Style</p>
                    {CAROUSEL_STYLES.map(v => (
                      <OptionRow key={v.id} label={v.label} sub={v.sub} active={carouselStyle === v.id} onClick={() => setCarouselStyle(v.id)} />
                    ))}
                  </motion.div>
                )}

                {/* ─ ANIMATION ─ */}
                {tab === "animation" && (
                  <motion.div key="a" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Page Entrance</p>
                    {PAGE_ANIMATIONS.map(v => (
                      <OptionRow key={v.id} label={v.label} sub={v.sub} active={pageAnimation === v.id} onClick={() => setPageAnimation(v.id)} />
                    ))}
                    <p className="text-[9px] font-medium tracking-widest uppercase px-1 mt-3 mb-1.5" style={{ color: "hsl(var(--muted-foreground))" }}>Cursor Style</p>
                    {CURSOR_VARIANTS.map(v => (
                      <OptionRow key={v.id} label={v.label} sub={v.sub} active={cursorVariant === v.id} onClick={() => setCursorVariant(v.id)} />
                    ))}
                    <div className="mt-3 p-3 rounded-xl border" style={{ borderColor: "hsl(var(--border)/0.5)", background: "hsl(var(--muted)/0.4)" }}>
                      <p className="text-[10px] font-medium mb-1" style={{ color: "hsl(var(--foreground))" }}>Tip</p>
                      <p className="text-[9px] leading-relaxed" style={{ color: "hsl(var(--muted-foreground)/0.7)" }}>
                        Switch hero variant or animation to replay the entrance. Cursor changes instantly.
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* ─ SITE SETTINGS ─ */}
                {tab === "site" && (
                  <SiteTab />
                )}

                {/* ─ PRESETS ─ */}
                {tab === "presets" && (
                  <PresetsTab
                    fontId={fontId} darkId={darkId} lightId={lightId}
                    heroVariant={heroVariant} footerVariant={footerVariant}
                    carouselStyle={carouselStyle} animStyle={pageAnimation}
                    cursorStyle={cursorVariant}
                    applyFont={applyFont} applyTheme={applyTheme}
                    setHeroVariant={setHeroVariant} setFooterVariant={setFooterVariant}
                    setCarouselStyle={setCarouselStyle} setPageAnimation={setPageAnimation}
                    setCursorVariant={setCursorVariant}
                  />
                )}
              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2.5 border-t flex items-center gap-2" style={{ borderColor: "hsl(var(--border)/0.4)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[9px]" style={{ color: "hsl(var(--muted-foreground)/0.45)" }}>VastuChitra ArchViz · Live Config</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

function OptionRow({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left p-3 rounded-xl border mb-1 transition-all flex items-center justify-between"
      style={{ borderColor: active ? "hsl(var(--primary)/0.4)" : "transparent", background: active ? "hsl(var(--primary)/0.08)" : "transparent" }}
      onMouseOver={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "hsl(var(--muted)/0.6)"; }}
      onMouseOut={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
    >
      <div>
        <div className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{label}</div>
        <div className="text-[10px]" style={{ color: "hsl(var(--muted-foreground)/0.6)" }}>{sub}</div>
      </div>
      {active && <span className="text-[9px]" style={{ color: "hsl(var(--primary))" }}>✓</span>}
    </button>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  SITE TAB — edit hero content live, persisted to Supabase
// ════════════════════════════════════════════════════════════════════════════
function SiteTab() {
  const { config, saveConfig, saving } = useSiteConfig();
  const [draft, setDraft] = useState({ ...config });
  const [saved, setSaved] = useState(false);

  // Keep draft in sync if config loads async
  useEffect(() => { setDraft({ ...config }); }, [config.brand]);

  const set = (key: string, value: unknown) =>
    setDraft(d => ({ ...d, [key]: value }));

  const setHeadline = (i: number, v: string) => {
    const h = [...draft.headline] as [string, string, string];
    h[i] = v;
    setDraft(d => ({ ...d, headline: h }));
  };

  const setStat = (i: number, key: "value" | "label", v: string) => {
    const stats = draft.stats.map((s, idx) => idx === i ? { ...s, [key]: v } : s);
    setDraft(d => ({ ...d, stats }));
  };

  const handleSave = async () => {
    await saveConfig(draft);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const inp = "w-full px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none";
  const inpStyle = { background: "hsl(var(--muted)/0.5)", borderColor: "hsl(var(--border)/0.5)", color: "hsl(var(--foreground))" };

  return (
    <motion.div key="site" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="space-y-3">
        <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>Site Name</p>
        <input className={inp} style={inpStyle} value={draft.brand}
          onChange={e => set("brand", e.target.value)} placeholder="Brand name" />

        <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1 mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>Eyebrow Text</p>
        <input className={inp} style={inpStyle} value={draft.eyebrow}
          onChange={e => set("eyebrow", e.target.value)} placeholder="Subtitle above headline" />

        <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1 mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>Headline (3 words)</p>
        {[0, 1, 2].map(i => (
          <input key={i} className={inp} style={inpStyle} value={draft.headline[i]}
            onChange={e => setHeadline(i, e.target.value)} placeholder={`Word ${i + 1}`} />
        ))}

        <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1 mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>Subtext</p>
        <textarea className={inp} style={{ ...inpStyle, resize: "vertical" }} rows={2}
          value={draft.sub} onChange={e => set("sub", e.target.value)} />

        <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1 mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>CTA Buttons</p>
        <input className={inp} style={inpStyle} value={draft.cta}
          onChange={e => set("cta", e.target.value)} placeholder="Primary CTA" />
        <input className={inp} style={inpStyle} value={draft.ctaSecondary}
          onChange={e => set("ctaSecondary", e.target.value)} placeholder="Secondary CTA" />

        <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-1 mt-2" style={{ color: "hsl(var(--muted-foreground))" }}>Stats</p>
        {draft.stats.map((s, i) => (
          <div key={i} className="flex gap-1">
            <input className={inp} style={{ ...inpStyle, width: "40%" }} value={s.value}
              onChange={e => setStat(i, "value", e.target.value)} placeholder="Value" />
            <input className={inp} style={{ ...inpStyle, width: "60%" }} value={s.label}
              onChange={e => setStat(i, "label", e.target.value)} placeholder="Label" />
          </div>
        ))}

        <button onClick={handleSave} disabled={saving}
          className="w-full mt-3 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
          style={{ background: saved ? "hsl(142 55% 45%)" : "hsl(var(--primary))", color: "hsl(222 24% 5%)" }}>
          {saving ? "Saving…" : saved ? "✓ Saved!" : <><Save size={11} /> Apply & Save</>}
        </button>
        <p className="text-center text-[9px] mt-1" style={{ color: "hsl(var(--muted-foreground)/0.5)" }}>
          Saved to Supabase — persists across sessions
        </p>
      </div>
    </motion.div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
//  PRESETS TAB — save/load debug configurations
// ════════════════════════════════════════════════════════════════════════════
function PresetsTab({ fontId, darkId, lightId, heroVariant, footerVariant, carouselStyle, animStyle, cursorStyle,
  applyFont, applyTheme, setHeroVariant, setFooterVariant, setCarouselStyle, setPageAnimation, setCursorVariant }: {
  fontId: string; darkId: string; lightId: string; heroVariant: string; footerVariant: string;
  carouselStyle: string; animStyle: string; cursorStyle: string;
  applyFont: (id: string) => void; applyTheme: (dark: string, light: string) => void;
  setHeroVariant: (v: string) => void; setFooterVariant: (v: string) => void;
  setCarouselStyle: (v: string) => void; setPageAnimation: (v: string) => void;
  setCursorVariant: (v: string) => void;
}) {
  const { presets, savePreset, deletePreset, presetsLoading } = useSiteConfig();
  const [presetName, setPresetName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!presetName.trim()) return;
    setSaving(true);
    await savePreset({
      name: presetName.trim(), fontId, darkId, lightId,
      heroVariant, footerVariant, carouselStyle, animStyle, cursorStyle,
    });
    setSaving(false); setSaved(true);
    setTimeout(() => setSaved(false), 1500);
    setPresetName("");
  };

  const handleLoad = (p: DebugPreset) => {
    applyFont(p.fontId);
    applyTheme(p.darkId, p.lightId);
    setHeroVariant(p.heroVariant);
    setFooterVariant(p.footerVariant);
    setCarouselStyle(p.carouselStyle);
    setPageAnimation(p.animStyle);
    setCursorVariant(p.cursorStyle);
  };

  return (
    <motion.div key="presets" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
        Save Current Config
      </p>
      <div className="flex gap-1 mb-4">
        <input
          className="flex-1 px-2.5 py-1.5 rounded-lg text-xs border focus:outline-none"
          style={{ background: "hsl(var(--muted)/0.5)", borderColor: "hsl(var(--border)/0.5)", color: "hsl(var(--foreground))" }}
          placeholder="Preset name…" value={presetName}
          onChange={e => setPresetName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()}
        />
        <button onClick={handleSave} disabled={!presetName.trim() || saving}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40"
          style={{ background: saved ? "hsl(142 55% 45%)" : "hsl(var(--primary))", color: "hsl(222 24% 5%)" }}>
          {saving ? "…" : saved ? "✓" : <Save size={11} />}
        </button>
      </div>

      <p className="text-[9px] font-medium tracking-widest uppercase px-1 mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
        Saved Presets
      </p>

      {presetsLoading ? (
        <p className="text-[10px] text-center py-3" style={{ color: "hsl(var(--muted-foreground)/0.5)" }}>Loading…</p>
      ) : presets.length === 0 ? (
        <p className="text-[10px] text-center py-4" style={{ color: "hsl(var(--muted-foreground)/0.4)" }}>
          No presets saved yet.<br />Configure the tabs above then save here.
        </p>
      ) : (
        <div className="space-y-1">
          {presets.map(p => (
            <div key={p.name} className="flex items-center gap-1 p-2.5 rounded-xl border"
              style={{ borderColor: "hsl(var(--border)/0.4)", background: "hsl(var(--muted)/0.2)" }}>
              <button onClick={() => handleLoad(p)} className="flex-1 text-left">
                <p className="text-xs font-medium" style={{ color: "hsl(var(--foreground))" }}>{p.name}</p>
                <p className="text-[9px]" style={{ color: "hsl(var(--muted-foreground)/0.6)" }}>
                  {p.fontId} · {p.darkId} · {p.heroVariant}
                </p>
              </button>
              <button onClick={() => deletePreset(p.name)} className="p-1 rounded-lg opacity-40 hover:opacity-80"
                style={{ color: "hsl(0 65% 60%)" }}>
                <Trash size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-center text-[9px] mt-3" style={{ color: "hsl(var(--muted-foreground)/0.5)" }}>
        Presets saved to Supabase
      </p>
    </motion.div>
  );
}
