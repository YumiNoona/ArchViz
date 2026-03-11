"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, Layers, Users, Zap, Award, Clock } from "lucide-react";
import { useSiteConfig } from "./SiteConfigProvider";

const services = [
  {
    icon: Eye,
    title: "Architectural Visualisation",
    desc: "Photorealistic renders and fully interactive 3D walkthroughs of residential, commercial, and mixed-use developments.",
  },
  {
    icon: Layers,
    title: "Pre-Sales Marketing",
    desc: "Give buyers the experience of stepping inside their future home before construction. Convert earlier, reduce uncertainty.",
  },
  {
    icon: Users,
    title: "Client Presentations",
    desc: "Impress investors and stakeholders with live, explorable environments instead of static PDFs and slideshows.",
  },
  {
    icon: Zap,
    title: "Real-Time Walkthroughs",
    desc: "Stream interactive 3D spaces directly to any browser — no downloads, no installs. Explore on desktop, tablet, or mobile.",
  },
];

const process = [
  { step: "01", title: "Brief & Reference",  desc: "We study your plans, reference imagery, and design language to fully understand the vision." },
  { step: "02", title: "3D Modelling",        desc: "Every facade, interior, and landscape element is built to accurate scale in our studio." },
  { step: "03", title: "Lighting & Materials", desc: "Physically accurate lighting and material responses — dawn, dusk, or golden hour on demand." },
  { step: "04", title: "Interactive Delivery", desc: "Streamed to a secure, branded link your clients can explore on any device, any time." },
];

export default function About() {
  const { config } = useSiteConfig();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });

  return (
    <>
      {/* ─── WHO WE ARE ─────────────────────────────────────────────── */}
      <section id="about" ref={ref} className="relative py-32 px-6 overflow-hidden"
        style={{ borderTop: "1px solid hsl(var(--border)/0.4)" }}>

        {/* Background accent */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[40vw] h-[40vw] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.04) 0%, transparent 70%)", filter: "blur(80px)" }} />

        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-24">

            {/* LEFT */}
            <div>
              <motion.span className="inline-block text-xs font-medium tracking-[0.2em] uppercase mb-5 px-3 py-1.5 rounded-full border"
                style={{ color: "hsl(var(--primary))", borderColor: "hsl(var(--primary)/0.2)", background: "hsl(var(--primary)/0.06)", fontFamily: "var(--font-mono)" }}
                initial={{ opacity: 0, y: 16 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6 }}>
                {config.aboutEyebrow || "Who We Are"}
              </motion.span>

              <motion.h2 className="font-light leading-[1.1] mb-8"
                style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 5vw, 4.5rem)", color: "hsl(var(--foreground))" }}
                initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 0.1 }}>
                {config.aboutHeading || "We Turn Blueprints"}<br />
                <span className="text-gradient italic">{config.aboutHeadingEm || "Into Experiences"}</span>
              </motion.h2>

              <motion.p className="leading-relaxed mb-6 text-base"
                style={{ color: "hsl(var(--muted-foreground))", fontWeight: 300, maxWidth: "42ch" }}
                initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.7 }}>
                {config.aboutBody || "VastuChitra is a Mumbai-based architectural visualisation studio. We specialise in turning architectural drawings into immersive, interactive 3D experiences — giving developers, architects, and their clients an honest look at what they're building."}
              </motion.p>
              <motion.p className="leading-relaxed text-base"
                style={{ color: "hsl(var(--muted-foreground))", fontWeight: 300, maxWidth: "42ch" }}
                initial={{ opacity: 0, y: 20 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3, duration: 0.7 }}>
                With over 8 years of experience and 150+ projects delivered, we work with developers across India to shorten sales cycles, improve client confidence, and communicate design intent like never before.
              </motion.p>

              {/* Credentials row */}
              <motion.div className="flex items-center gap-6 mt-10 pt-8"
                style={{ borderTop: "1px solid hsl(var(--border)/0.5)" }}
                initial={{ opacity: 0 }} animate={inView ? { opacity: 1 } : {}}
                transition={{ delay: 0.4, duration: 0.6 }}>
                {[
                  { icon: Award, label: "150+ Projects" },
                  { icon: Clock, label: "8 Years Studio" },
                  { icon: Users, label: "Pan-India Clients" },
                ].map(({ icon: Icon, label }) => (
                  <div key={label} className="flex items-center gap-2">
                    <Icon size={14} style={{ color: "hsl(var(--primary))" }} />
                    <span className="text-sm" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)", fontSize: "11px" }}>{label}</span>
                  </div>
                ))}
              </motion.div>
            </div>

            {/* RIGHT — service grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {services.map((s, i) => {
                const Icon = s.icon;
                return (
                  <motion.div key={i}
                    className="p-6 rounded-2xl border relative overflow-hidden group"
                    style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))" }}
                    initial={{ opacity: 0, y: 24 }} animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.15 + i * 0.1, duration: 0.6 }}
                    whileHover={{ y: -3, borderColor: "hsl(var(--primary)/0.25)" }}>
                    {/* Hover glow */}
                    <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                      style={{ background: "radial-gradient(circle at 30% 30%, hsl(var(--primary)/0.05) 0%, transparent 70%)" }} />
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4 relative"
                      style={{ background: "hsl(var(--primary)/0.1)", border: "1px solid hsl(var(--primary)/0.2)" }}>
                      <Icon size={16} style={{ color: "hsl(var(--primary))" }} />
                    </div>
                    <h3 className="text-base font-normal mb-2 leading-snug"
                      style={{ fontFamily: "var(--font-display)", color: "hsl(var(--foreground))" }}>
                      {s.title}
                    </h3>
                    <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{s.desc}</p>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* ── PROCESS ── */}
          <div id="process">
            <motion.div className="text-center mb-14"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="inline-block text-xs font-medium tracking-[0.2em] uppercase mb-4 px-3 py-1.5 rounded-full border"
                style={{ color: "hsl(var(--primary))", borderColor: "hsl(var(--primary)/0.2)", background: "hsl(var(--primary)/0.06)", fontFamily: "var(--font-mono)" }}>
                How We Work
              </span>
              <h2 className="font-light" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.2rem, 4vw, 3.5rem)" }}>
                From Brief to <span className="text-gradient italic">Walkthrough</span>
              </h2>
            </motion.div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {process.map((p, i) => (
                <motion.div key={i} className="relative p-6 rounded-2xl border"
                  style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))" }}
                  initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.6 }}
                  whileHover={{ y: -2 }}>
                  {/* Connector line */}
                  {i < 3 && (
                    <div className="hidden lg:block absolute top-8 left-full w-6 z-10 pointer-events-none"
                      style={{ height: "1px", background: "linear-gradient(90deg, hsl(var(--primary)/0.3), transparent)" }} />
                  )}
                  <div className="text-3xl font-light mb-4 text-gradient-gold"
                    style={{ fontFamily: "var(--font-display)", lineHeight: 1 }}>
                    {p.step}
                  </div>
                  <h3 className="text-sm font-medium mb-2" style={{ color: "hsl(var(--foreground))" }}>{p.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>{p.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
