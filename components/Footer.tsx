"use client";

import { useDebug } from "./DebugPanel";

const BRAND = "Interactive Visualization";
const LINKS = {
  Product: ["Projects", "Stream Demo", "Technology"],
  Company: ["About", "Contact", "Careers"],
  Legal: ["Privacy", "Terms", "Cookies"],
};

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-primary/15 border border-primary/25 flex items-center justify-center">
        <svg width="13" height="13" viewBox="0 0 14 14" fill="none">
          <rect x="1" y="1" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))" />
          <rect x="7.5" y="1" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))" opacity="0.4" />
          <rect x="1" y="7.5" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))" opacity="0.4" />
          <rect x="7.5" y="7.5" width="5.5" height="5.5" rx="1.2" fill="hsl(var(--primary))" />
        </svg>
      </div>
      <span className="text-sm font-medium">{BRAND}</span>
    </div>
  );
}

// Variant A: Minimal single line
function FooterMinimal() {
  return (
    <footer className="border-t border-border/30 py-8 px-6">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <Logo />
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
        <div className="flex items-center gap-5 text-xs text-muted-foreground">
          {["Privacy", "Terms", "Contact"].map(l => <a key={l} href="#" className="hover:text-foreground transition-colors">{l}</a>)}
        </div>
      </div>
    </footer>
  );
}

// Variant B: Full grid
function FooterFull() {
  return (
    <footer className="border-t border-border/30 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-14">
          <div className="col-span-2 md:col-span-1">
            <Logo />
            <p className="text-xs text-muted-foreground mt-3 leading-relaxed max-w-[180px]">
              Real-time architecture visualization powered by Unreal Engine.
            </p>
          </div>
          {Object.entries(LINKS).map(([section, links]) => (
            <div key={section}>
              <p className="text-[10px] font-medium tracking-widest uppercase text-muted-foreground mb-3">{section}</p>
              <ul className="space-y-2">
                {links.map(l => <li key={l}><a href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a></li>)}
              </ul>
            </div>
          ))}
        </div>
        <div className="pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {BRAND}. All rights reserved.</p>
          <p className="text-xs text-muted-foreground/50">Powered by Unreal Engine 5 · Vagon Streams</p>
        </div>
      </div>
    </footer>
  );
}

// Variant C: Centered
function FooterCentered() {
  return (
    <footer className="border-t border-border/30 py-14 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <Logo />
        <div className="flex items-center justify-center gap-7 mt-6 mb-8">
          {["Projects", "About", "Contact", "Privacy", "Terms"].map(l => (
            <a key={l} href="#" className="text-sm text-muted-foreground hover:text-foreground transition-colors">{l}</a>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} {BRAND}.</p>
      </div>
    </footer>
  );
}

export default function Footer() {
  const { footerVariant } = useDebug();
  if (footerVariant === "full") return <FooterFull />;
  if (footerVariant === "centered") return <FooterCentered />;
  return <FooterMinimal />;
}
