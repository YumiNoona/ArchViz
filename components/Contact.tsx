"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { haptic } from "ios-haptics";
import { useSiteConfig } from "./SiteConfigProvider";

export default function Contact() {
  const { config } = useSiteConfig();
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [form, setForm] = useState({ name: "", email: "", project: "", message: "" });
  const [focused, setFocused] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    haptic.confirm();
    setSubmitted(true);
  };

  const inputBase: React.CSSProperties = {
    width: "100%",
    padding: "13px 16px",
    borderRadius: "12px",
    fontSize: "14px",
    outline: "none",
    background: "rgba(196,164,120,0.03)",
    color: "rgba(245,235,215,0.85)",
    fontFamily: "var(--font-body)",
    transition: "border-color 0.2s, background 0.2s",
  };

  const inputStyle = (key: string): React.CSSProperties => ({
    ...inputBase,
    border: `1px solid ${focused === key ? "rgba(196,164,120,0.4)" : "rgba(196,164,120,0.1)"}`,
    background: focused === key ? "rgba(196,164,120,0.05)" : "rgba(196,164,120,0.02)",
  });

  const contacts = [
    { icon: Mail, label: "Email", value: config.contactEmail || "hello@vastuchitra.com", href: `mailto:${config.contactEmail || "hello@vastuchitra.com"}` },
    { icon: Phone, label: "Phone", value: config.contactPhone || "+91 97639 65277", href: `tel:${config.contactPhone}` },
    { icon: MapPin, label: "Studio", value: config.contactAddress || "Mumbai, Maharashtra", href: "#" },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 overflow-hidden"
      style={{ background: "#080604", borderTop: "1px solid rgba(196,164,120,0.08)" }}
    >
      {/* Background glow */}
      <div
        className="absolute right-[-20%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(196,164,120,0.04) 0%, transparent 70%)", filter: "blur(80px)" }}
      />

      <div className="max-w-7xl mx-auto px-8 lg:px-16">
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* LEFT */}
          <div>
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7 }}
              className="flex items-center gap-3 mb-6"
            >
              <div className="w-4 h-px" style={{ background: "#c4a478" }} />
              <span
                className="text-xs uppercase tracking-[0.25em]"
                style={{ color: "rgba(196,164,120,0.55)", fontFamily: "var(--font-mono)" }}
              >
                {config.contactEyebrow || "Get In Touch"}
              </span>
            </motion.div>

            {/* Heading */}
            <div className="overflow-hidden mb-2">
              <motion.h2
                initial={{ y: "110%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                className="font-light leading-[0.92]"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3rem, 5vw, 5rem)",
                  color: "rgba(245,235,215,0.95)",
                  letterSpacing: "-0.02em",
                }}
              >
                {config.contactHeading || "Let's Visualize"}
              </motion.h2>
            </div>
            <div className="overflow-hidden mb-8">
              <motion.h2
                initial={{ y: "110%" }}
                animate={inView ? { y: 0 } : {}}
                transition={{ duration: 0.9, delay: 0.18, ease: [0.16, 1, 0.3, 1] }}
                className="font-light leading-[0.92] italic"
                style={{
                  fontFamily: "var(--font-display)",
                  fontSize: "clamp(3rem, 5vw, 5rem)",
                  color: "#c4a478",
                  letterSpacing: "-0.02em",
                }}
              >
                {config.contactHeadingEm || "Your Vision"}
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="text-base leading-relaxed mb-12 max-w-sm"
              style={{ color: "rgba(196,164,120,0.45)", fontWeight: 300 }}
            >
              {config.contactBody || "Have a project in mind? Share your brief and we'll respond within 24 hours."}
            </motion.p>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.4, duration: 0.7 }}
              className="space-y-5"
            >
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  className="flex items-center gap-4 group"
                  style={{ color: "rgba(196,164,120,0.45)" }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:border-[rgba(196,164,120,0.3)]"
                    style={{ background: "rgba(196,164,120,0.04)", border: "1px solid rgba(196,164,120,0.1)" }}
                  >
                    <Icon size={13} style={{ color: "rgba(196,164,120,0.5)" }} />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-wider mb-0.5" style={{ color: "rgba(196,164,120,0.3)", fontFamily: "var(--font-mono)" }}>
                      {label}
                    </p>
                    <p className="text-sm transition-colors duration-200 group-hover:text-[rgba(196,164,120,0.8)]">
                      {value}
                    </p>
                  </div>
                </a>
              ))}
            </motion.div>
          </div>

          {/* RIGHT — form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.2, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            {submitted ? (
              <div
                className="p-12 rounded-3xl text-center"
                style={{ background: "rgba(196,164,120,0.03)", border: "1px solid rgba(196,164,120,0.12)" }}
              >
                <div
                  className="w-14 h-14 rounded-full mx-auto mb-5 flex items-center justify-center"
                  style={{ background: "rgba(196,164,120,0.08)", border: "1px solid rgba(196,164,120,0.2)" }}
                >
                  <ArrowUpRight size={22} style={{ color: "#c4a478" }} />
                </div>
                <h3
                  className="text-2xl font-light mb-3"
                  style={{ fontFamily: "var(--font-display)", color: "rgba(245,235,215,0.9)" }}
                >
                  Message received.
                </h3>
                <p className="text-sm" style={{ color: "rgba(196,164,120,0.4)" }}>
                  We'll be in touch within 24 hours.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="p-8 rounded-3xl space-y-4"
                style={{ background: "rgba(196,164,120,0.02)", border: "1px solid rgba(196,164,120,0.09)" }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(196,164,120,0.35)", fontFamily: "var(--font-mono)" }}>
                      Name
                    </label>
                    <input
                      type="text"
                      placeholder="Rahul Sharma"
                      required
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                      onFocus={() => setFocused("name")}
                      onBlur={() => setFocused("")}
                      style={inputStyle("name")}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(196,164,120,0.35)", fontFamily: "var(--font-mono)" }}>
                      Email
                    </label>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                      onFocus={() => setFocused("email")}
                      onBlur={() => setFocused("")}
                      style={inputStyle("email")}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(196,164,120,0.35)", fontFamily: "var(--font-mono)" }}>
                    Project
                  </label>
                  <input
                    type="text"
                    placeholder="Shree Sadhna Phase 2, Andheri"
                    value={form.project}
                    onChange={e => setForm(p => ({ ...p, project: e.target.value }))}
                    onFocus={() => setFocused("project")}
                    onBlur={() => setFocused("")}
                    style={inputStyle("project")}
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "rgba(196,164,120,0.35)", fontFamily: "var(--font-mono)" }}>
                    Message
                  </label>
                  <textarea
                    placeholder="Tell us about your development — type, units, timeline..."
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    onFocus={() => setFocused("message")}
                    onBlur={() => setFocused("")}
                    style={{ ...inputStyle("message"), resize: "vertical" }}
                  />
                </div>

                <motion.button
                  type="submit"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full py-3.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
                  style={{
                    background: "rgba(196,164,120,0.9)",
                    color: "#0c0a07",
                    boxShadow: "0 6px 30px rgba(196,164,120,0.2)",
                  }}
                >
                  Send Enquiry <ArrowUpRight size={14} />
                </motion.button>

                <p className="text-[11px] text-center" style={{ color: "rgba(196,164,120,0.25)" }}>
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
