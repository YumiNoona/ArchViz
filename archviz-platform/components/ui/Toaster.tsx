"use client";

// Minimal toast implementation
export function Toaster() {
  return <div id="toaster" className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 pointer-events-none" />;
}
