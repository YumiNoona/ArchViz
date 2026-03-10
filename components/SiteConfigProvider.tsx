"use client";

import {
  createContext, useContext, useState, useEffect, useCallback, ReactNode,
} from "react";
import { supabase } from "@/lib/supabase";

// ── Types ────────────────────────────────────────────────────────────────────
export interface SiteConfig {
  brand:        string;
  eyebrow:      string;
  headline:     [string, string, string];
  sub:          string;
  cta:          string;
  ctaSecondary: string;
  stats: { value: string; label: string }[];
  faviconEmoji: string;
}

export interface DebugPreset {
  name: string;
  fontId: string;
  darkId: string;
  lightId: string;
  heroVariant: string;
  footerVariant: string;
  carouselStyle: string;
  animStyle: string;
  cursorStyle: string;
}

interface SiteConfigCtx {
  config: SiteConfig;
  setConfig: (c: SiteConfig) => void;
  saveConfig: (c: SiteConfig) => Promise<void>;
  saving: boolean;
  presets: DebugPreset[];
  savePreset: (p: DebugPreset) => Promise<void>;
  deletePreset: (name: string) => Promise<void>;
  presetsLoading: boolean;
}

// ── Defaults ─────────────────────────────────────────────────────────────────
export const DEFAULT_CONFIG: SiteConfig = {
  brand:        "VastuChitra ArchViz",
  eyebrow:      "Unreal Engine · Pixel Streaming",
  headline:     ["Immersive", "Architecture", "Experiences"],
  sub:          "Walk through every space before a single brick is laid. Photorealistic real-time environments streamed to any browser.",
  cta:          "Explore Projects",
  ctaSecondary: "Watch Demo",
  stats: [
    { value: "UE5",   label: "Powered by"    },
    { value: "4K",    label: "Resolution"    },
    { value: "60fps", label: "Framerate"     },
    { value: "6+",    label: "Projects live" },
  ],
  faviconEmoji: "🏛",
};

// ── Context ──────────────────────────────────────────────────────────────────
const Ctx = createContext<SiteConfigCtx>({
  config: DEFAULT_CONFIG,
  setConfig: () => {},
  saveConfig: async () => {},
  saving: false,
  presets: [],
  savePreset: async () => {},
  deletePreset: async () => {},
  presetsLoading: false,
});

export const useSiteConfig = () => useContext(Ctx);

// ── Key names in Supabase site_settings table ────────────────────────────────
const SITE_CONFIG_KEY   = "site_config";
const PRESETS_KEY       = "debug_presets";

// ── Provider ─────────────────────────────────────────────────────────────────
export function SiteConfigProvider({ children }: { children: ReactNode }) {
  const [config, setConfigState] = useState<SiteConfig>(DEFAULT_CONFIG);
  const [saving, setSaving]      = useState(false);
  const [presets, setPresets]    = useState<DebugPreset[]>([]);
  const [presetsLoading, setPresetsLoading] = useState(false);

  // Load on mount
  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", SITE_CONFIG_KEY)
          .single();
        if (data?.value) setConfigState(data.value as SiteConfig);
      } catch { /* table might not exist yet — will use default */ }

      setPresetsLoading(true);
      try {
        const { data } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", PRESETS_KEY)
          .single();
        if (data?.value) setPresets(data.value as DebugPreset[]);
      } catch { /* no presets yet */ }
      setPresetsLoading(false);
    })();
  }, []);

  const saveConfig = useCallback(async (c: SiteConfig) => {
    setSaving(true);
    setConfigState(c);
    try {
      await supabase.from("site_settings").upsert(
        { key: SITE_CONFIG_KEY, value: c },
        { onConflict: "key" }
      );
    } catch { /* ignore — config is at least in local state */ }
    setSaving(false);
  }, []);

  const savePreset = useCallback(async (p: DebugPreset) => {
    const updated = [...presets.filter(x => x.name !== p.name), p];
    setPresets(updated);
    try {
      await supabase.from("site_settings").upsert(
        { key: PRESETS_KEY, value: updated },
        { onConflict: "key" }
      );
    } catch { /* local only */ }
  }, [presets]);

  const deletePreset = useCallback(async (name: string) => {
    const updated = presets.filter(x => x.name !== name);
    setPresets(updated);
    try {
      await supabase.from("site_settings").upsert(
        { key: PRESETS_KEY, value: updated },
        { onConflict: "key" }
      );
    } catch { /* local only */ }
  }, [presets]);

  return (
    <Ctx.Provider value={{
      config, setConfig: setConfigState, saveConfig, saving,
      presets, savePreset, deletePreset, presetsLoading,
    }}>
      {children}
    </Ctx.Provider>
  );
}
