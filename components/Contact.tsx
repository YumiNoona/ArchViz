"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import { haptic } from "ios-haptics";
import { saveEnquiry } from "@/lib/supabase";

export default function Contact() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const [form, setForm] = useState({ name: "", email: "", contact: "", project: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (form.contact.length !== 10) {
      alert("Invalid number. Please enter a 10-digit mobile number.");
      return;
    }

    setLoading(true);
    const { error } = await saveEnquiry(form);
    setLoading(false);
    if (!error) {
      haptic.confirm();
      setSubmitted(true);
    } else {
      alert("Error sending enquiry. Please try again.");
    }
  };

  useEffect(() => {
    if (submitted) {
      const timer = setTimeout(() => {
        setSubmitted(false);
        setForm({ name: "", email: "", contact: "", project: "", message: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [submitted]);

  const contacts = [
    { icon: Mail, label: "Email", value: "admin@i-pds.com", href: `mailto:admin@i-pds.com` },
    { icon: Phone, label: "Phone", value: "020-66268888", href: `tel:020-66268888` },
    { icon: MapPin, label: "Studio", value: "Pune, Maharashtra", href: "https://maps.app.goo.gl/9X78pEzdHqe1iFya6" },
  ];

  return (
    <section
      id="contact"
      ref={ref}
      className="relative py-32 overflow-hidden bg-background"
    >
      {/* Background glow */}
      <div
        className="absolute right-[-10%] top-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none opacity-20"
        style={{ background: "radial-gradient(circle, var(--brand-accent) 0%, transparent 70%)", filter: "blur(120px)" }}
      />

      <div className="max-w-7xl mx-auto px-8 lg:px-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* LEFT */}
          <div className="space-y-12">
            <div>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.7 }}
                className="flex items-center gap-3 mb-8"
              >
                <div className="w-8 h-px bg-brand-accent" />
                <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-brand-accent">
                  Contact Us
                </span>
              </motion.div>

              <div className="space-y-2 mb-8">
                <div className="overflow-hidden">
                  <motion.h2
                    initial={{ y: "110%" }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl lg:text-7xl font-medium tracking-tighter"
                  >
                    Let's build
                  </motion.h2>
                </div>
                <div className="overflow-hidden">
                  <motion.h2
                    initial={{ y: "110%" }}
                    animate={inView ? { y: 0 } : {}}
                    transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
                    className="text-6xl lg:text-7xl font-medium tracking-tighter text-sweep"
                  >
                    together.
                  </motion.h2>
                </div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2, duration: 0.7 }}
                className="text-lg text-muted-foreground font-light leading-relaxed max-w-md"
              >
                Have a project in mind? Share your brief and we'll respond within 24 hours.
              </motion.p>
            </div>

            {/* Contact info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3, duration: 0.7 }}
              className="space-y-6"
            >
              {contacts.map(({ icon: Icon, label, value, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith("http") ? "_blank" : undefined}
                  rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="flex items-center gap-5 group max-w-fit"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-secondary border border-border group-hover:border-brand-accent/30 group-hover:bg-secondary/80 transition-all">
                    <Icon size={18} className="text-muted-foreground group-hover:text-brand-accent transition-colors" />
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground/60 mb-0.5">
                      {label}
                    </p>
                    <p className="text-base font-medium transition-colors group-hover:text-foreground">
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
              <div className="premium-card p-16 text-center border-brand-accent/20">
                <div className="w-16 h-16 rounded-full mx-auto mb-6 flex items-center justify-center bg-brand-accent/10 border border-brand-accent/20">
                  <ArrowUpRight size={28} className="text-brand-accent" />
                </div>
                <h3 className="text-3xl font-medium tracking-tight mb-4">Message sent.</h3>
                <p className="text-muted-foreground font-light">
                  We'll review your project details and get back to you shortly.
                </p>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="premium-card p-10 space-y-6"
              >
                <div className="grid sm:grid-cols-2 gap-6">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Rahul Sharma"
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent/40 focus:ring-1 focus:ring-brand-accent/10 transition-all"
                      value={form.name}
                      onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="sharma@i-pds.com"
                      required
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent/40 focus:ring-1 focus:ring-brand-accent/10 transition-all"
                      value={form.email}
                      onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                      Mobile Number
                    </label>
                    <input
                      type="tel"
                      placeholder="e.g. 9876543210"
                      required
                      pattern="[0-9]{10}"
                      minLength={10}
                      maxLength={10}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent/40 focus:ring-1 focus:ring-brand-accent/10 transition-all"
                      value={form.contact}
                      onInvalid={e => (e.target as HTMLInputElement).setCustomValidity("Invalid number")}
                      onInput={e => (e.target as HTMLInputElement).setCustomValidity("")}
                      onChange={e => {
                        const val = e.target.value.replace(/\D/g, "");
                        if (val.length <= 10) setForm(p => ({ ...p, contact: val }));
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                    Project Name / Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Shree Sadhna Phase 2, Pune"
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent/40 focus:ring-1 focus:ring-brand-accent/10 transition-all"
                    value={form.project}
                    onChange={e => setForm(p => ({ ...p, project: e.target.value }))}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground ml-1">
                    How can we help?
                  </label>
                  <textarea
                    placeholder="Describe your vision, scope, and timeline..."
                    required
                    rows={5}
                    className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm outline-none focus:border-brand-accent/40 focus:ring-1 focus:ring-brand-accent/10 transition-all resize-none"
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={loading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group w-full py-4 rounded-2xl bg-foreground text-background text-base font-medium flex items-center justify-center gap-3 mt-4 overflow-hidden disabled:opacity-50 transition-all shadow-xl shadow-black/20"
                >
                  <motion.div 
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
                    style={{ skewX: '-20deg' }}
                  />
                  {loading ? "Sending..." : "Send Enquiry"} 
                  <motion.div
                    animate={loading ? {} : { x: [0, 2, 0], y: [0, -2, 0] }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: "easeInOut" }}
                  >
                    <ArrowUpRight size={18} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </motion.div>
                </motion.button>

                <p className="text-[10px] text-center text-muted-foreground tracking-wide font-medium py-2">
                  CONFIDENTIAL · 24H RESPONSE TIME
                </p>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
