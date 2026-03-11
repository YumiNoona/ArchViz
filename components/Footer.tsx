"use client";
import { useSiteConfig } from "./SiteConfigProvider";

export default function Footer() {
  const { config } = useSiteConfig();
  const { brand, footerTagline, footerLinks } = config;
  const year = new Date().getFullYear();

  const sections = {
    Studio: [
      { label: "Projects",  href: footerLinks?.Projects || "#projects" },
      { label: "About",     href: footerLinks?.About    || "#about"    },
      { label: "Process",   href: "#process"                           },
    ],
    Company: [
      { label: "Contact",   href: footerLinks?.Contact  || "#contact"  },
    ],
    Legal: [
      { label: "Privacy",   href: footerLinks?.Privacy  || "#"         },
      { label: "Terms",     href: footerLinks?.Terms    || "#"         },
    ],
  };

  return (
    <footer style={{ borderTop: "1px solid hsl(var(--border)/0.4)", background: "hsl(var(--surface-1))" }}>
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-16">
        <div className="grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12">

          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                style={{ background: "hsl(var(--primary)/0.12)", border: "1px solid hsl(var(--primary)/0.25)" }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M2 14 L8 2 L14 14" stroke="hsl(var(--primary))" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M4.5 9.5 L11.5 9.5" stroke="hsl(var(--primary)/0.5)" strokeWidth="1" strokeLinecap="round" />
                </svg>
              </div>
              <span className="text-sm font-medium" style={{ fontFamily: "var(--font-display)" }}>{brand || "VastuChitra"}</span>
            </div>
            <p className="text-xs leading-relaxed max-w-[200px]" style={{ color: "hsl(var(--muted-foreground))" }}>
              {footerTagline || "Architectural visualisation studio. Mumbai, India."}
            </p>
          </div>

          {Object.entries(sections).map(([section, links]) => (
            <div key={section}>
              <p className="text-[10px] font-medium tracking-[0.18em] uppercase mb-4"
                style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{section}</p>
              <ul className="space-y-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <a href={href} className="text-xs transition-colors duration-200"
                      style={{ color: "hsl(var(--foreground)/0.55)" }}
                      onMouseEnter={e => e.currentTarget.style.color = "hsl(var(--foreground))"}
                      onMouseLeave={e => e.currentTarget.style.color = "hsl(var(--foreground)/0.55)"}>
                      {label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3"
          style={{ borderTop: "1px solid hsl(var(--border)/0.4)" }}>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
            © {year} {brand || "VastuChitra"} · All rights reserved
          </p>
          <p className="text-xs" style={{ color: "hsl(var(--muted-foreground)/0.6)" }}>
            Mumbai, India
          </p>
        </div>
      </div>
    </footer>
  );
}
