import type { Metadata } from "next";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/Toaster";
import CustomCursor from "@/components/CustomCursor";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "ArchViz Studio — Interactive Architecture Experiences",
  description:
    "Explore real-time Unreal Engine architectural visualizations. Navigate through spaces before they're built.",
  openGraph: {
    title: "ArchViz Studio",
    description: "Interactive Architecture Experiences powered by Unreal Engine Pixel Streaming",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange={false}
        >
          <CustomCursor />
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
