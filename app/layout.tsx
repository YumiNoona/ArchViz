"use client";

import { Cormorant_Garamond, DM_Sans, DM_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import { DebugProvider } from "@/components/DebugPanel";
import { SiteConfigProvider } from "@/components/SiteConfigProvider";
import { Toaster } from "@/components/ui/Toaster";
import CustomCursor from "@/components/CustomCursor";
import "@/styles/globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});
const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-dm-sans",
  display: "swap",
});
const dmMono = DM_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-mono",
  display: "swap",
});

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>VastuChitra ArchViz — Interactive Architecture Experiences</title>
        <meta name="description" content="Explore photorealistic real-time Unreal Engine architectural visualizations." />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta name="theme-color" content="#0D1117" />
      </head>
      <body className={`${cormorant.variable} ${dmSans.variable} ${dmMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false} disableTransitionOnChange={false}>
          <SiteConfigProvider>
            <DebugProvider>
              <CustomCursor />
              {children}
              <Toaster />
            </DebugProvider>
          </SiteConfigProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
