"use client";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="py-20 border-t border-border bg-background flex items-center justify-center">
      <div className="max-w-7xl mx-auto text-center px-6">
        <h2 className="text-2xl md:text-5xl font-medium tracking-tighter uppercase opacity-80">
          All Rights Reserved IPDS 2026
        </h2>
      </div>
    </footer>
  );
}
