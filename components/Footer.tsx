"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-20 border-t border-border bg-background flex items-center justify-center">
      <div className="max-w-7xl mx-auto text-center px-6">
        <p className="text-[10px] md:text-xs font-bold uppercase tracking-[0.3em] opacity-40">
          All Rights Reserved IPDS 2026
        </p>
      </div>
    </footer>
  );
}
