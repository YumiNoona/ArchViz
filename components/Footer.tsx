"use client";

import { useSiteConfig } from "./SiteConfigProvider";

export default function Footer() {
  const { config } = useSiteConfig();
  const year = new Date().getFullYear();

  return (
    <footer
      className="py-10 px-8 lg:px-16"
      style={{ borderTop: "1px solid rgba(196,164,120,0.06)", background: "#080604" }}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className="w-6 h-6 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(196,164,120,0.08)", border: "1px solid rgba(196,164,120,0.15)" }}
          >
            <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
              <path d="M1 13 L7 1 L13 13" stroke="#c4a478" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M3.5 8.5 L10.5 8.5" stroke="rgba(196,164,120,0.5)" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <span className="text-xs" style={{ color: "rgba(196,164,120,0.35)", fontFamily: "var(--font-mono)" }}>
            © {year} {config.brand || "VastuChitra"}
          </span>
        </div>

        <p className="text-xs text-center" style={{ color: "rgba(196,164,120,0.2)", fontFamily: "var(--font-mono)" }}>
          {config.footerTagline || "Real-time architecture visualization · Mumbai, India"}
        </p>

        <div className="flex items-center gap-4">
          {[
            { label: "Projects", href: "#projects" },
            { label: "Contact",  href: "#contact"  },
          ].map(({ label, href }) => (
            <a
              key={label}
              href={href}
              className="text-xs transition-colors duration-200"
              style={{ color: "rgba(196,164,120,0.25)" }}
              onMouseEnter={e => e.currentTarget.style.color = "rgba(196,164,120,0.6)"}
              onMouseLeave={e => e.currentTarget.style.color = "rgba(196,164,120,0.25)"}
            >
              {label}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
