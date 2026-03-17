"use client";

import { ThemeProvider } from "@/components/ThemeProvider";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider 
      attribute="class" 
      defaultTheme="dark" 
      storageKey="vastu-admin-theme"
      enableSystem={false}
    >
      {children}
    </ThemeProvider>
  );
}
