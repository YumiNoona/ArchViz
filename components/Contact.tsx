"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mail, MapPin, Phone, ArrowRight } from "lucide-react";
import { haptic } from "@/lib/utils";
import { useSiteConfig } from "./SiteConfigProvider";

export default function Contact() {
  const { config } = useSiteConfig();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", project: "", message: "" });
  const [focused, setFocused] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault(); haptic(12); setSubmitted(true);
  };

  const infoItems = [
    { icon: Mail,   label: "Email",   value: config.contactEmail   || "hello@vastuchitra.com",   href: `mailto:${config.contactEmail}` },
    { icon: Phone,  label: "Phone",   value: config.contactPhone   || "+91 97639 65277",         href: `tel:${config.contactPhone}`   },
    { icon: MapPin, label: "Studio",  value: config.contactAddress || "Mumbai, Maharashtra",      href: "#" },
  ];

  const inputStyle = (key: string): React.CSSProperties => ({
    width: "100%",
    padding: "12px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    background: "hsl(var(--surface-1))",
    border: `1px solid ${focused === key ? "hsl(var(--primary)/0.4)" : "hsl(var(--border))"}`,
    color: "hsl(var(--foreground))",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.2s",
  });

  return (
    <section id="contact" className="relative py-32 px-6 overflow-hidden"
      style={{ borderTop: "1px solid hsl(var(--border)/0.4)" }}>

      {/* Bg glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[50vw] h-[50vw] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, hsl(var(--primary)/0.04) 0%, transparent 70%)", filter: "blur(80px)" }} />

      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-16 items-start">

          {/* LEFT */}
          <div>
            <motion.span className="inline-block text-xs font-medium tracking-[0.2em] uppercase mb-5 px-3 py-1.5 rounded-full border"
              style={{ color: "hsl(var(--primary))", borderColor: "hsl(var(--primary)/0.2)", background: "hsl(var(--primary)/0.06)", fontFamily: "var(--font-mono)" }}
              initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}>
              {config.contactEyebrow || "Start a Project"}
            </motion.span>

            <motion.h2 className="font-light leading-tight mb-6"
              style={{ fontFamily: "var(--font-display)", fontSize: "clamp(2.8rem, 5vw, 4.5rem)" }}
              initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.1, duration: 0.8 }}>
              {config.contactHeading || "Let's Build"}<br />
              <span className="text-gradient italic">{config.contactHeadingEm || "Something Real"}</span>
            </motion.h2>

            <motion.p className="leading-relaxed mb-10 text-base"
              style={{ color: "hsl(var(--muted-foreground))", maxWidth: "38ch", fontWeight: 300 }}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.2, duration: 0.7 }}>
              {config.contactBody || "Share your project brief and we'll get back within 24 hours with a proposal tailored to your development."}
            </motion.p>

            {/* Info items */}
            <motion.div className="space-y-4"
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: 0.3, duration: 0.7 }}>
              {infoItems.map(({ icon: Icon, label, value, href }) => (
                <a key={label} href={href}
                  className="flex items-center gap-4 group py-1">
                  <div className="w-10 h-10 rounded-xl border flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:border-primary/30"
                    style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))" }}>
                    <Icon size={14} style={{ color: "hsl(var(--primary)/0.7)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-widest uppercase mb-0.5"
                      style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>{label}</p>
                    <p className="text-sm transition-colors duration-200 group-hover:text-foreground"
                      style={{ color: "hsl(var(--foreground)/0.75)" }}>{value}</p>
                  </div>
                </a>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — Form */}
          <motion.div
            initial={{ opacity: 0, x: 24 }} whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7, delay: 0.15 }}>
            {submitted ? (
              <div className="p-12 rounded-3xl border text-center"
                style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(142 40% 30%/0.3)" }}>
                <div className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "hsl(142 55% 45%/0.1)", border: "1px solid hsl(142 40% 35%/0.3)" }}>
                  <Send size={22} style={{ color: "#34d399" }} />
                </div>
                <h3 className="text-2xl font-light mb-3" style={{ fontFamily: "var(--font-display)" }}>Sent. We'll be in touch.</h3>
                <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>Expect a response within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="p-8 rounded-3xl border space-y-4"
                style={{ background: "hsl(var(--surface-1))", borderColor: "hsl(var(--border))" }}>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Name</label>
                    <input type="text" placeholder="Rahul Sharma" required value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      onFocus={() => setFocused("name")} onBlur={() => setFocused("")}
                      style={inputStyle("name")} />
                  </div>
                  <div>
                    <label className="block text-xs mb-1.5" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Email</label>
                    <input type="email" placeholder="rahul@developer.com" required value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                      style={inputStyle("email")} />
                  </div>
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Project / Development</label>
                  <input type="text" placeholder="Shree Sadhna Phase 2, Andheri" value={form.project}
                    onChange={e => setForm(p => ({ ...p, project: e.target.value }))}
                    onFocus={() => setFocused("project")} onBlur={() => setFocused("")}
                    style={inputStyle("project")} />
                </div>

                <div>
                  <label className="block text-xs mb-1.5" style={{ color: "hsl(var(--muted-foreground))", fontFamily: "var(--font-mono)" }}>Tell us about your project</label>
                  <textarea placeholder="Type of development, number of units, timeline, what you need..." required
                    rows={4} value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    onFocus={() => setFocused("message")} onBlur={() => setFocused("")}
                    style={{ ...inputStyle("message"), resize: "vertical" }} />
                </div>

                <motion.button type="submit"
                  className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{ background: "hsl(var(--primary))", color: "hsl(var(--primary-foreground))", boxShadow: "0 6px 24px hsl(var(--primary)/0.25)" }}
                  whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}>
                  Send Enquiry <ArrowRight size={14} />
                </motion.button>

                <p className="text-[11px] text-center" style={{ color: "hsl(var(--muted-foreground))" }}>
                  We respond within 24 hours. All enquiries are confidential.
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
