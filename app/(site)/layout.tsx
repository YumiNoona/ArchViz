"use client";

import { ThemeProvider } from "@/components/ThemeProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      enableSystem={false} 
      storageKey="ipds-site-theme"
      disableTransitionOnChange={false}
    >
      {children}
    </ThemeProvider>
  );
}
