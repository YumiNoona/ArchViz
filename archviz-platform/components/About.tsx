"use client";

import { motion } from "framer-motion";
import { Cpu, Globe, Layers, Zap } from "lucide-react";

const features = [
  {
    icon: Cpu,
    title: "Unreal Engine 5",
    description: "Powered by Lumen global illumination and Nanite virtualized geometry for cinematic realism.",
  },
  {
    icon: Globe,
    title: "Browser Streaming",
    description: "Access full photorealistic experiences directly in your browser via Pixel Streaming technology.",
  },
  {
    icon: Layers,
    title: "Real-time Navigation",
    description: "Walk through spaces, change materials, adjust lighting — all in real-time, before construction.",
  },
  {
    icon: Zap,
    title: "60fps @ 4K",
    description: "Crystal-clear 4K resolution at silky smooth 60 frames per second, streamed to any device.",
  },
];

export default function About() {
  return (
    <section
      id="about"
      className="relative py-32 px-6 overflow-hidden border-t border-border/30"
      aria-labelledby="about-title"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute -right-1/4 top-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full opacity-5"
          style={{
            background: "radial-gradient(circle, hsl(238 84% 67%) 0%, transparent 70%)",
            filter: "blur(60px)",
          }}
        />
      </div>

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-20 items-center">
          {/* Left: Text */}
          <div>
            <motion.span
              className="text-xs font-medium tracking-widest uppercase text-primary/70 block mb-4"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              — Technology
            </motion.span>

            <motion.h2
              id="about-title"
              className="text-5xl lg:text-6xl font-light leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)" }}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              See Every Space
              <br />
              <em className="not-italic text-gradient">Before It's Built</em>
            </motion.h2>

            <motion.p
              className="text-muted-foreground text-base leading-relaxed mb-8 max-w-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
            >
              We deliver immersive architectural visualization using Unreal Engine 5 
              with Pixel Streaming, enabling you to navigate photorealistic spaces 
              from any browser, anywhere in the world.
            </motion.p>

            <motion.div
              className="flex items-center gap-3"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <div className="flex -space-x-2">
                {["UE5", "PS", "VG"].map((tag, i) => (
                  <div
                    key={tag}
                    className="w-9 h-9 rounded-full bg-primary/10 border-2 border-background flex items-center justify-center text-[9px] font-mono text-primary"
                  >
                    {tag}
                  </div>
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                Powered by Unreal Engine 5 · Vagon Streams
              </span>
            </motion.div>
          </div>

          {/* Right: Feature cards */}
          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="p-5 rounded-2xl bg-card border border-border/50 hover:border-primary/20 transition-colors duration-300"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ y: -2 }}
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center mb-4">
                  <feature.icon size={16} className="text-primary" />
                </div>
                <h3
                  className="text-base font-normal mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {feature.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
