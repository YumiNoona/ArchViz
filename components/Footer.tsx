"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-12 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-10 flex flex-col md:flex-row items-center justify-between gap-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] opacity-40">
          All Rights Reserved IPDS {year}
        </p>
        <div className="flex items-center gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest opacity-30">Made by</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-brand-accent/60">Vastu Chitra</span>
        </div>
      </div>
    </footer>
  );
}
