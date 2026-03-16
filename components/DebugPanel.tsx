"use client";

import { useState, useEffect, useRef, createContext, useContext, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings2, X, Type, Palette, Layout, Eye, Zap, Globe, Save, Trash2 as Trash,
  Sparkles, AlignLeft,
} from "lucide-react";
import { haptic } from "ios-haptics";
import { useSiteConfig, DebugPreset, DebugLayout, SiteConfig, DEFAULT_LAYOUT } from "./SiteConfigProvider";

/* ══════════════════════════════════════════════════════════  FONTS  */
export const FONTS = [
  { id: "editorial",  label: "Editorial",      sub: "Cormorant Garamond · architectural serif", display: "'Cormorant Garamond', Georgia, serif",      body: "'DM Sans', system-ui, sans-serif",       url: null },
  { id: "vercel",     label: "Vercel / Geist",  sub: "Inter · sharp modern system",              display: "'Inter', system-ui, sans-serif",            body: "'Inter', system-ui, sans-serif",         url: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" },
  { id: "supabase",   label: "Supabase",        sub: "DM Sans · technical precision",            display: "'DM Sans', system-ui, sans-serif",          body: "'DM Sans', system-ui, sans-serif",       url: null },
  { id: "apple",      label: "Apple SF Pro",    sub: "System · immaculate precision",            display: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', sans-serif", body: "-apple-system, BlinkMacSystemFont, 'SF Pro Text', sans-serif", url: null },
  { id: "chanel",     label: "Chanel",          sub: "Playfair Display · haute couture",         display: "'Playfair Display', 'Didot', serif",         body: "'Jost', 'DM Sans', sans-serif",          url: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;1,400&family=Jost:wght@300;400;500&display=swap" },
  { id: "neue",       label: "Swiss Neue",      sub: "Space Grotesk · bold Swiss design",        display: "'Space Grotesk', system-ui, sans-serif",    body: "'Space Grotesk', system-ui, sans-serif", url: "https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap" },
  { id: "mono",       label: "Mono / Terminal", sub: "JetBrains Mono · raw technical",           display: "'JetBrains Mono', 'DM Mono', monospace",    body: "'JetBrains Mono', 'DM Mono', monospace", url: "https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,300;0,400;0,500;1,300&display=swap" },
  { id: "fraunces",   label: "Fraunces",        sub: "Fraunces · optical soft serif",            display: "'Fraunces', serif",                          body: "'Outfit', sans-serif",                   url: "https://fonts.googleapis.com/css2?family=Fraunces:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Outfit:wght@300;400;500&display=swap" },
] as const;

/* ══════════════════════════════════════════════════════════  THEMES  */
const DARK_THEMES = [
  { id: "obsidian",      label: "Ash Dark",      sub: "Warm charcoal — gold accent", sw: ["#131210", "#1C1A17", "#C89A3E"] as const, vars: { "--background": "16 8% 7%", "--foreground": "30 12% 92%", "--card": "20 6% 10%", "--card-foreground": "30 12% 92%", "--border": "20 5% 15%", "--muted": "20 5% 14%", "--muted-foreground": "25 6% 52%", "--primary": "38 70% 62%", "--primary-foreground": "20 8% 6%", "--secondary": "20 5% 14%", "--secondary-foreground": "30 10% 75%", "--accent": "38 70% 62%", "--accent-foreground": "20 8% 6%", "--input": "20 5% 15%", "--ring": "38 70% 62%", "--surface-1": "20 6% 10%", "--surface-2": "20 5% 14%" } },
  { id: "vercel-dark",   label: "Vercel",        sub: "Pure ash black",           sw: ["#0A0A0A", "#171717", "#EDEDED"] as const, vars: { "--background": "0 0% 4%", "--foreground": "0 0% 93%", "--card": "0 0% 7%", "--card-foreground": "0 0% 93%", "--border": "0 0% 12%", "--muted": "0 0% 10%", "--muted-foreground": "0 0% 46%", "--primary": "0 0% 92%", "--primary-foreground": "0 0% 5%", "--secondary": "0 0% 10%", "--secondary-foreground": "0 0% 80%", "--accent": "0 0% 92%", "--accent-foreground": "0 0% 5%", "--input": "0 0% 12%", "--ring": "0 0% 92%" } },
  { id: "midnight-teal", label: "Midnight Teal", sub: "Deep ocean & teal glow",   sw: ["#030E12", "#072030", "#14B8A6"] as const, vars: { "--background": "196 60% 4%", "--foreground": "185 25% 90%", "--card": "196 55% 7%", "--card-foreground": "185 25% 90%", "--border": "196 35% 12%", "--muted": "196 40% 10%", "--muted-foreground": "196 12% 50%", "--primary": "174 85% 42%", "--primary-foreground": "196 60% 4%", "--secondary": "196 40% 10%", "--secondary-foreground": "185 20% 75%", "--accent": "174 85% 42%", "--accent-foreground": "196 60% 4%", "--input": "196 35% 12%", "--ring": "174 85% 42%" } },
  { id: "ember",         label: "Ember",         sub: "Dark amber & fire",         sw: ["#0D0700", "#1E1100", "#F59E0B"] as const, vars: { "--background": "28 70% 4%", "--foreground": "40 30% 90%", "--card": "28 60% 7%", "--card-foreground": "40 30% 90%", "--border": "28 40% 12%", "--muted": "28 45% 10%", "--muted-foreground": "28 12% 50%", "--primary": "38 96% 54%", "--primary-foreground": "28 70% 4%", "--secondary": "28 45% 10%", "--secondary-foreground": "40 22% 75%", "--accent": "38 96% 54%", "--accent-foreground": "28 70% 4%", "--input": "28 40% 12%", "--ring": "38 96% 54%" } },
] as const;

const LIGHT_THEMES = [
  { id: "saffron",    label: "Warm Cream",  sub: "Warm cream — amber accent",   sw: ["#F9F5EE", "#FBF0E0", "#D97706"] as const, vars: { "--background": "38 55% 97%", "--foreground": "20 20% 10%", "--card": "36 45% 94%", "--card-foreground": "20 20% 10%", "--border": "36 20% 82%", "--muted": "36 30% 88%", "--muted-foreground": "25 15% 44%", "--primary": "28 80% 46%", "--primary-foreground": "0 0% 100%", "--secondary": "36 30% 88%", "--secondary-foreground": "20 18% 18%", "--accent": "28 80% 46%", "--accent-foreground": "0 0% 100%", "--input": "36 20% 82%", "--ring": "28 80% 46%", "--surface-1": "36 40% 93%", "--surface-2": "35 30% 88%" } },
  { id: "arctic",     label: "Arctic Sky",  sub: "Sky blue & fresh teal",       sw: ["#EBF5FF", "#C8E6FF", "#0EA5E9"] as const, vars: { "--background": "210 70% 97%", "--foreground": "215 35% 10%", "--card": "210 55% 93%", "--card-foreground": "215 35% 10%", "--border": "210 30% 84%", "--muted": "210 35% 90%", "--muted-foreground": "215 16% 44%", "--primary": "199 89% 46%", "--primary-foreground": "0 0% 100%", "--secondary": "210 30% 88%", "--secondary-foreground": "215 28% 18%", "--accent": "199 89% 46%", "--accent-foreground": "0 0% 100%", "--input": "210 30% 84%", "--ring": "199 89% 46%" } },
  { id: "rose-linen", label: "Rose Linen",  sub: "Dusty rose & terracotta",     sw: ["#FDF0F0", "#F9E0E0", "#DC4444"] as const, vars: { "--background": "0 40% 97%", "--foreground": "355 30% 12%", "--card": "0 28% 93%", "--card-foreground": "355 30% 12%", "--border": "0 20% 84%", "--muted": "0 22% 90%", "--muted-foreground": "355 12% 45%", "--primary": "4 78% 52%", "--primary-foreground": "0 0% 100%", "--secondary": "0 22% 88%", "--secondary-foreground": "355 25% 18%", "--accent": "4 78% 52%", "--accent-foreground": "0 0% 100%", "--input": "0 20% 84%", "--ring": "4 78% 52%" } },
  { id: "forest",     label: "Forest Sage", sub: "Deep green & gold",           sw: ["#F0F5EE", "#DCF0D8", "#3D8F4A"] as const, vars: { "--background": "120 25% 96%", "--foreground": "130 35% 10%", "--card": "120 18% 91%", "--card-foreground": "130 35% 10%", "--border": "120 15% 82%", "--muted": "120 15% 88%", "--muted-foreground": "130 12% 44%", "--primary": "135 45% 35%", "--primary-foreground": "0 0% 100%", "--secondary": "120 15% 86%", "--secondary-foreground": "130 28% 15%", "--accent": "135 45% 35%", "--accent-foreground": "0 0% 100%", "--input": "120 15% 82%", "--ring": "135 45% 35%" } },
] as const;

/* ══════════════════════════════════════════════════════════  OPTION LISTS  */
const CAROUSEL_STYLES = [
  { id: "fan-3d",      label: "3D Fan",      sub: "Perspective rotation spread" },
  { id: "glass-stack", label: "Glass Stack", sub: "Frosted stacked cards"        },
  { id: "coverflow",   label: "Coverflow",   sub: "iTunes-style flip"            },
  { id: "orbital",     label: "Orbital",     sub: "Circular orbit layout"        },
] as const;

const PAGE_ANIMATIONS = [
  { id: "fade-blur",    label: "Fade + Blur",  sub: "Soft blur reveal"     },
  { id: "slide-up",     label: "Slide Up",     sub: "Classic upward slide" },
  { id: "spring-pop",   label: "Spring Pop",   sub: "Bouncy spring"        },
  { id: "split-reveal", label: "Split Reveal", sub: "Text splits apart"    },
  { id: "scramble",     label: "Scramble",     sub: "Matrix text scramble" },
  { id: "stagger-wave", label: "Stagger Wave", sub: "Wave through words"   },
] as const;

const CURSOR_VARIANTS = [
  { id: "dot-ring",  label: "Dot + Ring", sub: "Classic primary dot with trailing ring"     },
  { id: "magnetic",  label: "Magnetic",   sub: "Morphing blob, inverts colours beneath it"  },
  { id: "xray",      label: "X-Ray",      sub: "Blend circle reveals depth layer under it"  },
  { id: "ink-drop",  label: "Ink Drop",   sub: "Squishes into underline on text hover"      },
  { id: "torch",     label: "Torch",      sub: "Darkens screen — focused beam of light"     },
  { id: "precision", label: "Precision",  sub: "Snappy reticle with tick marks"             },
] as const;

export const HERO_VARIANTS = [
  { id: "split",    label: "Split",     sub: "Text left · visual right" },
  { id: "centered", label: "Centered",  sub: "Full center · cinematic"  },
  { id: "bold",     label: "Bold Type", sub: "Giant headline · minimal" },
] as const;

export const FOOTER_VARIANTS = [
  { id: "minimal",  label: "Minimal",   sub: "Single line"   },
  { id: "full",     label: "Full Grid", sub: "Links & brand" },
  { id: "centered", label: "Centered",  sub: "Logo + links"  },
] as const;

const CARD_EFFECTS = [
  { id: "glow",         label: "Glow",        sub: "Warm ambient shadow bloom"         },
  { id: "tilt",         label: "3D Tilt",      sub: "Mouse-tracked 3D perspective tilt" },
  { id: "tint",         label: "Colour Tint",  sub: "Gold gradient overlay on hover"    },
  { id: "lift",         label: "Lift",         sub: "Card floats up with deep shadow"   },
  { id: "border-trace", label: "Border Trace", sub: "Light shimmer traces the border"   },
] as const;

/* ══════════════════════════════════════════════════════════  CONTEXT  */
interface DebugCtx {
  heroVariant: string;
  footerVariant: string;
  carouselStyle: string;
  pageAnimation: string;
  cursorVariant: string;
  cardHoverEffect: string;
}
const DebugContext = createContext<DebugCtx>({
  heroVariant: "split", footerVariant: "minimal",
  carouselStyle: "fan-3d", pageAnimation: "fade-blur", cursorVariant: "dot-ring",
  cardHoverEffect: "glow",
});
export const useDebug = () => useContext(DebugContext);

/* ══════════════════════════════════════════════════════════  DOM HELPERS (module-level, no closure issues) */
function applyFontToDom(id: string) {
  const f = FONTS.find(x => x.id === id);
  if (!f) return;
  const old = document.getElementById("dbg-gf");
  if (old) old.remove();
  if (f.url) {
    const lnk = document.createElement("link");
    lnk.id = "dbg-gf"; lnk.rel = "stylesheet"; lnk.href = f.url;
    document.head.appendChild(lnk);
  }
  document.documentElement.style.setProperty("--font-display", f.display);
  document.documentElement.style.setProperty("--font-body", f.body);
  document.body.style.fontFamily = f.body;
}

function applyThemeToDom(id: string, dark: boolean) {
  const list = (dark ? DARK_THEMES : LIGHT_THEMES) as readonly { id: string; vars: Record<string, string> }[];
  const t = list.find(x => x.id === id);
  if (!t) return;
  const selector = dark ? ".dark" : ".light";
  const vars = Object.entries(t.vars).map(([k, v]) => `  ${k}: ${v};`).join("\n");
  const styleId = dark ? "dbg-dark-theme" : "dbg-light-theme";
  let el = document.getElementById(styleId) as HTMLStyleElement | null;
  if (!el) { el = document.createElement("style"); el.id = styleId; document.head.appendChild(el); }
  el.textContent = `${selector} {\n${vars}\n}`;
}

/* ══════════════════════════════════════════════════════════  PROVIDER  */
export function DebugProvider({ children }: { children: React.ReactNode }) {
  const { layout, layoutLoaded, saveLayout, config } = useSiteConfig();

  const [heroVariant,   setHeroVariant]   = useState(DEFAULT_LAYOUT.heroVariant);
  const [footerVariant, setFooterVariant] = useState(DEFAULT_LAYOUT.footerVariant);
  const [carouselStyle, setCarouselStyle] = useState(DEFAULT_LAYOUT.carouselStyle);
  const [pageAnimation, setPageAnimation] = useState(DEFAULT_LAYOUT.animStyle);
  const [cursorVariant, setCursorVariant] = useState(DEFAULT_LAYOUT.cursorStyle);
  const [fontId,        setFontId]        = useState(DEFAULT_LAYOUT.fontId);
  const [darkId,        setDarkId]        = useState(DEFAULT_LAYOUT.darkId);
  const [lightId,       setLightId]       = useState(DEFAULT_LAYOUT.lightId);
  const [open,  setOpen]  = useState(false);
  const [tab,   setTab]   = useState<TabId>("font");

  // ── BUG FIX: only load from Supabase once, using a ref guard ──────────────
  // Previously this used `layoutLoaded` in the dep array which re-triggered on
  // every layout object reference change, AND the old persist() read stale
  // closure state because React batches setter calls.
  const didLoad = useRef(false);

  useEffect(() => {
    if (!layoutLoaded || didLoad.current) return;
    didLoad.current = true;

    setHeroVariant(layout.heroVariant);
    setFooterVariant(layout.footerVariant);
    setCarouselStyle(layout.carouselStyle);
    setPageAnimation(layout.animStyle);
    setCursorVariant(layout.cursorStyle);
    setFontId(layout.fontId);
    setDarkId(layout.darkId);
    setLightId(layout.lightId);

    // Apply visual changes to DOM immediately
    applyFontToDom(layout.fontId);
    applyThemeToDom(layout.darkId, true);
    applyThemeToDom(layout.lightId, false);
  }, [layoutLoaded, layout]);

  // ── BUG FIX: persist reads values from refs, not from stale closures ──────
  // We keep a ref mirror of all layout state so persist() always has latest values
  // without needing to be inside a functional setter chain.
  const stateRef = useRef<DebugLayout>(DEFAULT_LAYOUT);

  useEffect(() => {
    stateRef.current = {
      fontId, darkId, lightId,
      heroVariant, footerVariant, carouselStyle,
      animStyle: pageAnimation, cursorStyle: cursorVariant,
    };
  }, [fontId, darkId, lightId, heroVariant, footerVariant, carouselStyle, pageAnimation, cursorVariant]);

  const persist = useCallback((patch: Partial<DebugLayout>) => {
    const next = { ...stateRef.current, ...patch };
    stateRef.current = next;
    saveLayout(next);
  }, [saveLayout]);

  // ── Setters ────────────────────────────────────────────────────────────────
  const changeFont = (id: string) => {
    setFontId(id);
    applyFontToDom(id);
    persist({ fontId: id });
    haptic();
  };

  const changeDark = (id: string) => {
    setDarkId(id);
    applyThemeToDom(id, true);
    persist({ darkId: id });
    haptic();
  };

  const changeLight = (id: string) => {
    setLightId(id);
    applyThemeToDom(id, false);
    persist({ lightId: id });
    haptic();
  };

  const setHero    = (v: string) => { setHeroVariant(v);   persist({ heroVariant: v });    haptic(); };
  const setFooter  = (v: string) => { setFooterVariant(v); persist({ footerVariant: v });  haptic(); };
  const setCarousel = (v: string) => { setCarouselStyle(v); persist({ carouselStyle: v }); haptic(); };
  const setAnim    = (v: string) => { setPageAnimation(v); persist({ animStyle: v });       haptic(); };
  const setCursor  = (v: string) => { setCursorVariant(v); persist({ cursorStyle: v });     haptic(); };

  const loadPreset = (p: DebugPreset) => {
    setFontId(p.layout.fontId);
    setDarkId(p.layout.darkId);
    setLightId(p.layout.lightId);
    setHeroVariant(p.layout.heroVariant);
    setFooterVariant(p.layout.footerVariant);
    setCarouselStyle(p.layout.carouselStyle);
    setPageAnimation(p.layout.animStyle);
    setCursorVariant(p.layout.cursorStyle);
    applyFontToDom(p.layout.fontId);
    applyThemeToDom(p.layout.darkId, true);
    applyThemeToDom(p.layout.lightId, false);
    // stateRef will update via the useEffect above after the next render
    saveLayout(p.layout);
    haptic.confirm();
  };

  return (
    <DebugContext.Provider value={{ heroVariant, footerVariant, carouselStyle, pageAnimation, cursorVariant, cardHoverEffect: config.cardHoverEffect ?? "glow" }}>
      {children}
      <DebugUI
        open={open} setOpen={setOpen} tab={tab} setTab={setTab}
        fontId={fontId} changeFont={changeFont}
        darkId={darkId} lightId={lightId} changeDark={changeDark} changeLight={changeLight}
        heroVariant={heroVariant} setHero={setHero}
        footerVariant={footerVariant} setFooter={setFooter}
        carouselStyle={carouselStyle} setCarousel={setCarousel}
        pageAnimation={pageAnimation} setAnim={setAnim}
        cursorVariant={cursorVariant} setCursor={setCursor}
        loadPreset={loadPreset}
        stateRef={stateRef}
      />
    </DebugContext.Provider>
  );
}

/* ══════════════════════════════════════════════════════════  PANEL UI  */
type TabId = "font" | "theme" | "layout" | "motion" | "cards" | "site" | "content" | "presets";

const TABS: { id: TabId; icon: React.ElementType; label: string }[] = [
  { id: "font",    icon: Type,      label: "Font"    },
  { id: "theme",   icon: Palette,   label: "Theme"   },
  { id: "layout",  icon: Layout,    label: "Layout"  },
  { id: "motion",  icon: Zap,       label: "Motion"  },
  { id: "cards",   icon: Sparkles,  label: "Cards"   },
  { id: "site",    icon: Globe,     label: "Site"    },
  { id: "content", icon: AlignLeft, label: "Content" },
  { id: "presets", icon: Save,      label: "Saves"   },
];

// VastuChitra warm dark gold palette — panel uses its OWN fixed colours,
// not CSS vars, so it always looks correct regardless of active theme.
const GOLD              = "#c4a478";
const GOLD_DIM          = "rgba(196,164,120,0.45)";
const PANEL_BG          = "rgba(14,11,7,0.97)";
const PANEL_BORDER      = "rgba(196,164,120,0.1)";
const PANEL_BORDER_ACT  = "rgba(196,164,120,0.35)";
const PANEL_FG          = "rgba(245,235,215,0.85)";
const PANEL_FG_DIM      = "rgba(245,235,215,0.5)";
const PANEL_MONO        = "var(--font-mono)";

function DebugUI({
  open, setOpen, tab, setTab,
  fontId, changeFont,
  darkId, lightId, changeDark, changeLight,
  heroVariant, setHero,
  footerVariant, setFooter,
  carouselStyle, setCarousel,
  pageAnimation, setAnim,
  cursorVariant, setCursor,
  loadPreset, stateRef,
}: {
  open: boolean; setOpen: (v: boolean) => void;
  tab: TabId; setTab: (t: TabId) => void;
  fontId: string; changeFont: (id: string) => void;
  darkId: string; lightId: string; changeDark: (id: string) => void; changeLight: (id: string) => void;
  heroVariant: string; setHero: (v: string) => void;
  footerVariant: string; setFooter: (v: string) => void;
  carouselStyle: string; setCarousel: (v: string) => void;
  pageAnimation: string; setAnim: (v: string) => void;
  cursorVariant: string; setCursor: (v: string) => void;
  loadPreset: (p: DebugPreset) => void;
  stateRef: React.MutableRefObject<DebugLayout>;
}) {
  const row1 = TABS.slice(0, 4);
  const row2 = TABS.slice(4);

  return (
    <>
      {/* Toggle FAB */}
      <motion.button
        onClick={() => { setOpen(!open); haptic(); }}
        className="fixed bottom-6 right-6 z-[9985] w-11 h-11 rounded-full flex items-center justify-center"
        style={{
          background: open ? "rgba(196,164,120,0.14)" : PANEL_BG,
          border: `1px solid ${open ? PANEL_BORDER_ACT : PANEL_BORDER}`,
          color: open ? GOLD : GOLD_DIM,
          backdropFilter: "blur(16px)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px rgba(196,164,120,0.05)",
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.9 }}
        title="Design Studio"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={open ? "x" : "s"}
            initial={{ rotate: -90, opacity: 0, scale: 0.5 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.5 }}
            transition={{ duration: 0.18 }}
          >
            {open ? <X size={16} /> : <Settings2 size={16} />}
          </motion.div>
        </AnimatePresence>
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed bottom-20 right-6 z-[9984] w-[300px] rounded-2xl overflow-hidden flex flex-col"
            style={{
              background: PANEL_BG,
              border: `1px solid ${PANEL_BORDER}`,
              backdropFilter: "blur(28px) saturate(150%)",
              boxShadow: "0 40px 100px rgba(0,0,0,0.85), 0 0 0 1px rgba(196,164,120,0.05)",
              maxHeight: "calc(100vh - 120px)",
            }}
            initial={{ opacity: 0, y: 18, scale: 0.91 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.92 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Header */}
            <div className="px-4 py-3 flex items-center justify-between flex-shrink-0"
              style={{ borderBottom: `1px solid ${PANEL_BORDER}` }}>
              <div className="flex items-center gap-2.5">
                <div className="w-px h-3.5 rounded-full" style={{ background: GOLD }} />
                <span className="text-xs font-light tracking-wide" style={{ color: PANEL_FG, fontFamily: "var(--font-display)" }}>
                  Design Studio
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] tracking-widest uppercase" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>Live</span>
              </div>
            </div>

            {/* Tab rows — 2 × 4 */}
            <div className="flex-shrink-0" style={{ borderBottom: `1px solid ${PANEL_BORDER}` }}>
              {[row1, row2].map((row, ri) => (
                <div key={ri} className="flex"
                  style={{ borderBottom: ri === 0 ? `1px solid rgba(196,164,120,0.06)` : "none" }}>
                  {row.map(({ id, icon: Icon, label }) => (
                    <button key={id} onClick={() => { setTab(id); haptic(); }}
                      className="flex-1 flex flex-col items-center gap-0.5 py-2.5 relative transition-colors duration-150"
                      style={{
                        color: tab === id ? GOLD : "rgba(196,164,120,0.28)",
                        background: tab === id ? "rgba(196,164,120,0.05)" : "transparent",
                      }}>
                      <Icon size={11} />
                      <span className="text-[8px] leading-none tracking-wide" style={{ fontFamily: PANEL_MONO }}>{label}</span>
                      {tab === id && (
                        <motion.div layoutId="dtab"
                          className="absolute bottom-0 left-0 right-0 h-[2px] rounded-t-full"
                          style={{ background: GOLD }}
                          transition={{ type: "spring", bounce: 0.25, duration: 0.3 }} />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            {/* Scrollable content */}
            <div className="overflow-y-auto p-3 flex-1" style={{ maxHeight: 420 }}>
              <AnimatePresence mode="wait">

                {tab === "font" && (
                  <motion.div key="font" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    {FONTS.map(f => (
                      <button key={f.id} onClick={() => changeFont(f.id)}
                        className="w-full text-left p-3 rounded-xl mb-1 transition-all"
                        style={{ border: `1px solid ${fontId === f.id ? PANEL_BORDER_ACT : "transparent"}`, background: fontId === f.id ? "rgba(196,164,120,0.07)" : "transparent" }}
                        onMouseOver={e => { if (fontId !== f.id) (e.currentTarget as HTMLElement).style.background = "rgba(196,164,120,0.03)"; }}
                        onMouseOut={e => { if (fontId !== f.id) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                        <div className="flex justify-between items-start mb-0.5">
                          <span className="text-[11px] font-semibold" style={{ fontFamily: f.display, color: PANEL_FG }}>{f.label}</span>
                          {fontId === f.id && <span className="text-[9px]" style={{ color: GOLD }}>● active</span>}
                        </div>
                        <div className="text-[9px] mb-1" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>{f.sub}</div>
                        <div className="text-sm font-light" style={{ fontFamily: f.display, color: PANEL_FG_DIM }}>Architecture</div>
                      </button>
                    ))}
                  </motion.div>
                )}

                {tab === "theme" && (
                  <motion.div key="theme" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <PLabel>Dark Modes</PLabel>
                    {DARK_THEMES.map(t => <ThemeRow key={t.id} theme={t} active={darkId === t.id} onClick={() => changeDark(t.id)} />)}
                    <PLabel className="mt-3">Light Modes</PLabel>
                    {LIGHT_THEMES.map(t => <ThemeRow key={t.id} theme={t} active={lightId === t.id} onClick={() => changeLight(t.id)} />)}
                  </motion.div>
                )}

                {tab === "layout" && (
                  <motion.div key="layout" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <PLabel>Hero Layout</PLabel>
                    {HERO_VARIANTS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={heroVariant === v.id} onClick={() => setHero(v.id)} />)}
                    <PLabel className="mt-3">Footer Style</PLabel>
                    {FOOTER_VARIANTS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={footerVariant === v.id} onClick={() => setFooter(v.id)} />)}
                    <PLabel className="mt-3">Carousel Style</PLabel>
                    {CAROUSEL_STYLES.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={carouselStyle === v.id} onClick={() => setCarousel(v.id)} />)}
                  </motion.div>
                )}

                {tab === "motion" && (
                  <motion.div key="motion" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                    <PLabel>Page Entrance</PLabel>
                    {PAGE_ANIMATIONS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={pageAnimation === v.id} onClick={() => setAnim(v.id)} />)}
                    <PLabel className="mt-3">Cursor Style</PLabel>
                    {CURSOR_VARIANTS.map(v => <OptionRow key={v.id} label={v.label} sub={v.sub} active={cursorVariant === v.id} onClick={() => setCursor(v.id)} />)}
                  </motion.div>
                )}

                {tab === "cards" && <CardsTab />}
                {tab === "site" && <SiteTab />}
                {tab === "content" && <ContentTab />}
                {tab === "presets" && <PresetsTab stateRef={stateRef} loadPreset={loadPreset} />}

              </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="px-4 py-2 flex-shrink-0 flex items-center justify-between"
              style={{ borderTop: `1px solid ${PANEL_BORDER}` }}>
              <div className="flex items-center gap-2">
                <div className="w-3 h-px" style={{ background: GOLD_DIM }} />
                <span className="text-[9px]" style={{ color: "rgba(196,164,120,0.25)", fontFamily: PANEL_MONO }}>VastuChitra · auto-saved</span>
              </div>
              <span className="text-[9px]" style={{ color: "rgba(196,164,120,0.18)", fontFamily: PANEL_MONO }}>v17</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ══════════════════════════════════════════════════════════  SHARED ATOMS  */
function PLabel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <p className={`text-[9px] font-medium tracking-widest uppercase px-1 mb-1.5 ${className}`}
      style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>
      {children}
    </p>
  );
}

function OptionRow({ label, sub, active, onClick }: { label: string; sub: string; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full text-left p-2.5 rounded-xl mb-1 transition-all flex items-center justify-between"
      style={{ border: `1px solid ${active ? PANEL_BORDER_ACT : "transparent"}`, background: active ? "rgba(196,164,120,0.07)" : "transparent" }}
      onMouseOver={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(196,164,120,0.03)"; }}
      onMouseOut={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <div>
        <div className="text-xs font-light" style={{ color: active ? PANEL_FG : PANEL_FG_DIM }}>{label}</div>
        <div className="text-[9px]" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>{sub}</div>
      </div>
      {active && <span className="text-[9px]" style={{ color: GOLD }}>✓</span>}
    </button>
  );
}

function ThemeRow({ theme, active, onClick }: { theme: { label: string; sub: string; sw: readonly string[] }; active: boolean; onClick: () => void }) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 p-2.5 rounded-xl mb-1 transition-all"
      style={{ border: `1px solid ${active ? PANEL_BORDER_ACT : "transparent"}`, background: active ? "rgba(196,164,120,0.07)" : "transparent" }}
      onMouseOver={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "rgba(196,164,120,0.03)"; }}
      onMouseOut={e => { if (!active) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
      <div className="flex -space-x-1.5 flex-shrink-0">
        {theme.sw.map((c, i) => (
          <div key={i} className="w-4 h-4 rounded-full"
            style={{ background: c, border: "1.5px solid rgba(14,11,7,0.9)", zIndex: 3 - i }} />
        ))}
      </div>
      <div className="text-left flex-1">
        <div className="text-xs font-light" style={{ color: active ? PANEL_FG : PANEL_FG_DIM }}>{theme.label}</div>
        <div className="text-[9px]" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>{theme.sub}</div>
      </div>
      {active && <span className="text-[9px]" style={{ color: GOLD }}>✓</span>}
    </button>
  );
}

function Inp({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <div>
      <PLabel>{label}</PLabel>
      <input type={type} className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none mb-2"
        placeholder={placeholder}
        style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 2 }: { label: string; value: string; onChange: (v: string) => void; rows?: number }) {
  return (
    <div>
      <PLabel>{label}</PLabel>
      <textarea className="w-full px-2.5 py-1.5 rounded-lg text-xs focus:outline-none mb-2 resize-y" rows={rows}
        style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
        value={value} onChange={e => onChange(e.target.value)} />
    </div>
  );
}

function SaveBtn({ saving, saved, onClick }: { saving: boolean; saved: boolean; onClick: () => void }) {
  return (
    <>
      <button onClick={onClick} disabled={saving}
        className="w-full mt-1 py-2 rounded-xl text-xs font-medium flex items-center justify-center gap-1.5 transition-all"
        style={{
          background: saved ? "rgba(52,211,153,0.12)" : "rgba(196,164,120,0.1)",
          border: `1px solid ${saved ? "rgba(52,211,153,0.35)" : PANEL_BORDER_ACT}`,
          color: saved ? "rgb(52,211,153)" : GOLD,
        }}>
        {saving ? "Saving…" : saved ? "✓ Saved!" : <><Save size={11} />Save to Supabase</>}
      </button>
      <p className="text-center text-[9px] mt-1 mb-2" style={{ color: "rgba(196,164,120,0.2)", fontFamily: PANEL_MONO }}>
        Persists across all sessions & devices
      </p>
    </>
  );
}

/* ══════════════════════════════════════════════════════════  CARDS TAB  */
function CardsTab() {
  const { config, saveConfig, saving } = useSiteConfig();
  const [saved, setSaved] = useState(false);
  const current = config.cardHoverEffect ?? "glow";

  const handleSelect = async (id: string) => {
    haptic();
    await saveConfig({ ...config, cardHoverEffect: id as SiteConfig["cardHoverEffect"] });
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  };

  return (
    <motion.div key="cards" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PLabel>Card Hover Effect</PLabel>
      <p className="text-[9px] px-1 mb-2" style={{ color: "rgba(196,164,120,0.3)", fontFamily: PANEL_MONO }}>
        Applied to all project cards. Saves instantly.
      </p>
      {CARD_EFFECTS.map(e => (
        <button key={e.id} onClick={() => handleSelect(e.id)}
          className="w-full text-left p-2.5 rounded-xl mb-1 transition-all flex items-center justify-between"
          style={{ border: `1px solid ${current === e.id ? PANEL_BORDER_ACT : "transparent"}`, background: current === e.id ? "rgba(196,164,120,0.07)" : "transparent" }}
          onMouseOver={el => { if (current !== e.id) (el.currentTarget as HTMLElement).style.background = "rgba(196,164,120,0.03)"; }}
          onMouseOut={el => { if (current !== e.id) (el.currentTarget as HTMLElement).style.background = "transparent"; }}>
          <div>
            <div className="text-xs font-light" style={{ color: current === e.id ? PANEL_FG : PANEL_FG_DIM }}>{e.label}</div>
            <div className="text-[9px]" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>{e.sub}</div>
          </div>
          {current === e.id && <span className="text-[9px]" style={{ color: GOLD }}>✓ active</span>}
        </button>
      ))}
      {saved && <p className="text-center text-[10px] mt-2" style={{ color: "rgb(52,211,153)" }}>Effect saved ✓</p>}
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════  SITE TAB  */
function SiteTab() {
  const { config, saveConfig, saving } = useSiteConfig();
  const [d, setD] = useState<SiteConfig>({ ...config });
  const [saved, setSaved] = useState(false);

  // BUG FIX: was only syncing when config.brand changed — now syncs on any config update
  useEffect(() => { setD({ ...config }); }, [config]);

  const set = (k: keyof SiteConfig, v: unknown) => setD(p => ({ ...p, [k]: v }));
  const setHL = (i: number, v: string) => { const h = [...d.headline] as [string, string, string]; h[i] = v; setD(p => ({ ...p, headline: h })); };
  const setStat = (i: number, k: "value" | "label", v: string) => setD(p => ({ ...p, stats: p.stats.map((x, j) => j === i ? { ...x, [k]: v } : x) }));

  const save = async () => { await saveConfig(d); haptic.confirm(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <motion.div key="site" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-0.5">
      <Inp label="Brand Name"     value={d.brand}        onChange={v => set("brand", v)}        placeholder="VastuChitra ArchViz" />
      <Inp label="Favicon URL"    value={d.faviconUrl}   onChange={v => set("faviconUrl", v)}   placeholder="https://… svg/png" />
      <Inp label="Hero Image URL" value={d.heroImageUrl} onChange={v => set("heroImageUrl", v)} placeholder="https://… background" />
      <Inp label="Eyebrow"        value={d.eyebrow}      onChange={v => set("eyebrow", v)} />
      <PLabel>Headline (3 parts)</PLabel>
      <div className="flex gap-1 mb-2">
        {[0, 1, 2].map(i => (
          <input key={i} className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:outline-none"
            style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
            value={d.headline[i]} onChange={e => setHL(i, e.target.value)} />
        ))}
      </div>
      <Textarea label="Sub-heading" value={d.sub} onChange={v => set("sub", v)} rows={2} />
      <div className="flex gap-1.5">
        <div className="flex-1"><Inp label="Primary CTA"   value={d.cta}          onChange={v => set("cta", v)} /></div>
        <div className="flex-1"><Inp label="Secondary CTA" value={d.ctaSecondary} onChange={v => set("ctaSecondary", v)} /></div>
      </div>
      <PLabel>Stats</PLabel>
      {d.stats.map((s, i) => (
        <div key={i} className="flex gap-1 mb-1">
          <input className="w-16 px-2 py-1.5 rounded-lg text-xs focus:outline-none"
            style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
            value={s.value} onChange={e => setStat(i, "value", e.target.value)} placeholder="UE5" />
          <input className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:outline-none"
            style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
            value={s.label} onChange={e => setStat(i, "label", e.target.value)} placeholder="Powered by" />
        </div>
      ))}
      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════  CONTENT TAB  */
function ContentTab() {
  const { config, saveConfig, saving } = useSiteConfig();
  const [d, setD] = useState<SiteConfig>({ ...config });
  const [saved, setSaved] = useState(false);
  const [section, setSection] = useState<"about" | "contact" | "footer">("about");

  // BUG FIX: sync on any config change
  useEffect(() => { setD({ ...config }); }, [config]);

  const set = (k: keyof SiteConfig, v: unknown) => setD(p => ({ ...p, [k]: v }));
  const setFL = (k: keyof SiteConfig["footerLinks"], v: string) => setD(p => ({ ...p, footerLinks: { ...p.footerLinks, [k]: v } }));
  const setFeat = (i: number, k: "title" | "description", v: string) =>
    setD(p => ({ ...p, features: p.features.map((x, j) => j === i ? { ...x, [k]: v } : x) }));

  const save = async () => { await saveConfig(d); haptic.confirm(); setSaved(true); setTimeout(() => setSaved(false), 2000); };

  return (
    <motion.div key="content" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <div className="flex gap-1 mb-3">
        {(["about", "contact", "footer"] as const).map(s => (
          <button key={s} onClick={() => { setSection(s); haptic(); }}
            className="flex-1 py-1.5 rounded-lg text-[10px] capitalize transition-all"
            style={{
              background: section === s ? "rgba(196,164,120,0.09)" : "transparent",
              border: `1px solid ${section === s ? PANEL_BORDER_ACT : PANEL_BORDER}`,
              color: section === s ? GOLD : GOLD_DIM,
              fontFamily: PANEL_MONO,
            }}>
            {s}
          </button>
        ))}
      </div>

      {section === "about" && (
        <div className="space-y-0.5">
          <Inp label="Eyebrow"    value={d.aboutEyebrow}   onChange={v => set("aboutEyebrow", v)} />
          <Inp label="Heading"    value={d.aboutHeading}   onChange={v => set("aboutHeading", v)} />
          <Inp label="Heading em" value={d.aboutHeadingEm} onChange={v => set("aboutHeadingEm", v)} />
          <Textarea label="Body text" value={d.aboutBody} onChange={v => set("aboutBody", v)} rows={3} />
          <PLabel>Feature Cards</PLabel>
          {d.features.map((f, i) => (
            <div key={i} className="p-2 rounded-xl mb-1.5" style={{ border: `1px solid ${PANEL_BORDER}` }}>
              <input className="w-full px-2 py-1 rounded-lg text-xs focus:outline-none mb-1"
                style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
                value={f.title} onChange={e => setFeat(i, "title", e.target.value)} placeholder={`Feature ${i + 1}`} />
              <textarea className="w-full px-2 py-1 rounded-lg text-xs focus:outline-none resize-none"
                style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
                rows={2} value={f.description} onChange={e => setFeat(i, "description", e.target.value)} />
            </div>
          ))}
        </div>
      )}

      {section === "contact" && (
        <div className="space-y-0.5">
          <Inp label="Eyebrow"    value={d.contactEyebrow}   onChange={v => set("contactEyebrow", v)} />
          <Inp label="Heading"    value={d.contactHeading}   onChange={v => set("contactHeading", v)} />
          <Inp label="Heading em" value={d.contactHeadingEm} onChange={v => set("contactHeadingEm", v)} />
          <Textarea label="Body"  value={d.contactBody}      onChange={v => set("contactBody", v)} />
          <Inp label="Email"  type="email" value={d.contactEmail}   onChange={v => set("contactEmail", v)}   placeholder="hello@vastuchitra.com" />
          <Inp label="Phone"  type="tel"   value={d.contactPhone}   onChange={v => set("contactPhone", v)}   placeholder="+91 98765 43210" />
          <Inp label="Address"             value={d.contactAddress} onChange={v => set("contactAddress", v)} placeholder="Mumbai, India" />
        </div>
      )}

      {section === "footer" && (
        <div className="space-y-0.5">
          <Textarea label="Footer Tagline" value={d.footerTagline} onChange={v => set("footerTagline", v)} rows={2} />
          <PLabel>Footer Links (href)</PLabel>
          {(["Projects", "About", "Contact", "Privacy", "Terms"] as const).map(k => (
            <div key={k} className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] w-14 flex-shrink-0" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>{k}</span>
              <input className="flex-1 px-2 py-1.5 rounded-lg text-xs focus:outline-none"
                style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
                value={d.footerLinks[k]} onChange={e => setFL(k, e.target.value)} placeholder="#projects" />
            </div>
          ))}
        </div>
      )}

      <SaveBtn saving={saving} saved={saved} onClick={save} />
    </motion.div>
  );
}

/* ══════════════════════════════════════════════════════════  PRESETS TAB  */
function PresetsTab({
  stateRef,
  loadPreset,
}: {
  stateRef: React.MutableRefObject<DebugLayout>;
  loadPreset: (p: DebugPreset) => void;
}) {
  const { presets, savePreset, deletePreset, presetsLoading } = useSiteConfig();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    // BUG FIX: read from ref so we always get the actual current layout, not stale closure
    await savePreset({ name: name.trim(), layout: { ...stateRef.current }, config: {} });
    setSaving(false);
    setSaved(true);
    haptic.confirm();
    setTimeout(() => setSaved(false), 1500);
    setName("");
  };

  return (
    <motion.div key="presets" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
      <PLabel>Save Current Layout</PLabel>
      <div className="flex gap-1 mb-3">
        <input className="flex-1 px-2.5 py-1.5 rounded-lg text-xs focus:outline-none"
          style={{ background: "rgba(196,164,120,0.04)", border: `1px solid ${PANEL_BORDER}`, color: PANEL_FG }}
          placeholder="Preset name…" value={name}
          onChange={e => setName(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleSave()} />
        <button onClick={handleSave} disabled={!name.trim() || saving}
          className="px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-40 transition-all"
          style={{
            background: saved ? "rgba(52,211,153,0.12)" : "rgba(196,164,120,0.1)",
            border: `1px solid ${saved ? "rgba(52,211,153,0.35)" : PANEL_BORDER_ACT}`,
            color: saved ? "rgb(52,211,153)" : GOLD,
          }}>
          {saving ? "…" : saved ? "✓" : <Save size={11} />}
        </button>
      </div>

      <PLabel>Saved Presets</PLabel>
      {presetsLoading ? (
        <p className="text-[10px] text-center py-3" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>Loading…</p>
      ) : presets.length === 0 ? (
        <p className="text-[10px] text-center py-4 leading-relaxed" style={{ color: "rgba(196,164,120,0.25)", fontFamily: PANEL_MONO }}>
          No presets yet.<br />Configure the tabs then save here.
        </p>
      ) : (
        <div className="space-y-1">
          {presets.map(p => (
            <div key={p.name} className="flex items-center gap-1 p-2.5 rounded-xl"
              style={{ border: `1px solid ${PANEL_BORDER}`, background: "rgba(196,164,120,0.02)" }}>
              <button onClick={() => loadPreset(p)} className="flex-1 text-left">
                <p className="text-xs font-light" style={{ color: PANEL_FG }}>{p.name}</p>
                <p className="text-[9px]" style={{ color: GOLD_DIM, fontFamily: PANEL_MONO }}>
                  {p.layout.fontId} · {p.layout.darkId} · {p.layout.heroVariant}
                </p>
              </button>
              <button onClick={() => { deletePreset(p.name); haptic(); }}
                className="p-1.5 rounded-lg transition-opacity opacity-25 hover:opacity-60"
                style={{ color: "rgba(220,80,80,0.9)" }}>
                <Trash size={11} />
              </button>
            </div>
          ))}
        </div>
      )}
      <p className="text-center text-[9px] mt-3" style={{ color: "rgba(196,164,120,0.18)", fontFamily: PANEL_MONO }}>
        Presets saved to Supabase
      </p>
    </motion.div>
  );
}
