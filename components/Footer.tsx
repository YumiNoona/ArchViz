"use client";

import { useSiteConfig } from "./SiteConfigProvider";

export default function Footer() {
  const { config } = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 px-8 lg:px-16 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-8">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-secondary border border-border">
            <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
              <path d="M1 13 L7 1 L13 13" className="stroke-vastu-green" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground tracking-tight">
              {config.brand || "VastuChitra"}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
              © {year} · ArchViz & Design
            </span>
          </div>
        </div>

        <p className="text-xs text-muted-foreground font-light tracking-wide max-w-xs text-center sm:text-left">
          {config.footerTagline || "Real-time architecture visualization and immersive digital experiences."}
        </p>

        <div className="flex items-center gap-8">
          {[
            { label: "Overview", href: "#overview" },
            { label: "Portfolio", href: "#projects" },
            { label: "Contact",  href: "#contact"  },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground hover:text-vastu-green transition-colors"
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
