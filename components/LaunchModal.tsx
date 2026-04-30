"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, CheckCircle2, Phone, Mail, Eye, EyeOff, SendHorizonal, Monitor, Smartphone } from "lucide-react";
import { Project, saveVisitor, verifyOtp } from "@/lib/supabase";
import { haptic } from "ios-haptics";

interface Props {
  project: Project | null;
  onClose: () => void;
  privateToken?: string;
  clientEmail?: string;
}

type Stage =
  | "form"
  | "submitting"
  | "instructions"
  | "success"
  | "pw-wrong"
  | "otp-sending"
  | "otp-sent"
  | "otp-verifying";

const SALES_EMAIL = "admin@i-pds.com";
const SALES_PHONE = "020-66268888";

// Theme
const BRAND_ACCENT = "#e2ffaf";

export default function LaunchModal({ project, onClose, privateToken, clientEmail }: Props) {
  const [stage, setStage] = useState<Stage>("form");
  const [name, setName] = useState("");
  const [email, setEmail] = useState(clientEmail || "");
  const [contact, setContact] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpErr, setOtpErr] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const access = project?.access_type ?? "public";

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(email)) e.email = "Enter a valid email";

    const digitsOnly = contact.replace(/\D/g, "");
    if (!contact.trim()) {
      e.contact = "Phone is required";
    } else if (digitsOnly.length < 10) {
      e.contact = "Please enter a valid 10-digit mobile number";
    }

    setErrors(e);
    return !Object.keys(e).length;
  };

  // Debug shortcut removed

  const normalizePhone = (p: string) => {
    const n = p.replace(/[\s\-()]/g, "");
    if (n.startsWith("+")) return n;
    if (n.length === 10) return `+91${n}`;
    return `+${n}`;
  };

  const launch = async () => {
    if (!project) return;
    setStage("submitting");
    try {
      await saveVisitor({ name, email, contact, project: project.title, project_id: project.id });
      fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipients: [{ name, email, project: project.title }],
          subject: "Welcome to {{project}} — IPDS ArchViz",
          body: `Hi {{name}},\n\nThank you for exploring {{project}}.\n\nWarm regards,\nIPDS ArchViz Studio`,
        }),
      }).catch(() => { });
    } catch { /* silent */ }
    setStage("instructions");
    haptic.confirm();
  };

  const finishLaunch = () => {
    if (!project) return;
    setStage("success");
    haptic.confirm();
    setTimeout(() => {
      window.open(project.stream_url, "_blank", "noopener,noreferrer");
      onClose();
    }, 1800);
  };

  const sendOtp = async () => {
    if (!validate() || !project) return;
    haptic();
    setStage("otp-sending");
    setOtpErr("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkToken: privateToken || `main-${project.id}`,
        phone: normalizePhone(contact),
        email,
        projectTitle: project.title,
        clientName: name,
      }),
    });
    if (res.ok) {
      setCodeSent(true);
      setStage("otp-sent");
    } else {
      const d = await res.json().catch(() => ({}));
      setOtpErr(d.error ?? "Failed to send code. Please try again.");
      setStage("form");
    }
  };

  const verifyCode = async () => {
    if (!project || otp.replace(/\s/g, "").length < 4) {
      setOtpErr("Enter the code we sent you.");
      return;
    }
    setStage("otp-verifying");
    const { valid } = await verifyOtp(privateToken || `main-${project.id}`, otp.replace(/\s/g, ""));
    if (valid) {
      await launch();
    } else {
      setOtpErr("Incorrect code — please try again.");
      setStage("otp-sent");
    }
  };

  const submit = async () => {
    if (!validate() || !project) return;
    haptic();
    if (access === "public") { await launch(); return; }
    if (access === "password") {
      if (password === project.access_password) { await launch(); }
      else { setStage("pw-wrong"); }
      return;
    }
    if (access === "otp") { await sendOtp(); return; }
  };

  if (!project) return null;

  const iStyle = (key?: string): React.CSSProperties => ({
    background: "rgba(20, 20, 20, 0.4)",
    border: `1px solid ${key && errors[key] ? "hsl(0 50% 45%)" : "rgba(255, 255, 255, 0.1)"}`,
    color: "#ffffff",
  });

  return (
    <AnimatePresence>
      <motion.div className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

        <motion.div className="absolute inset-0" onClick={onClose}
          style={{ background: "hsl(222 24% 3%/0.8)", backdropFilter: "blur(12px)" }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />

        <motion.div className="relative w-full max-w-[720px] premium-card overflow-hidden"
          layout
          initial={{ scale: 0.88, opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ scale: 0.88, opacity: 0, y: 20 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          role="dialog" aria-modal="true">

          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px"
            style={{ background: `linear-gradient(90deg,transparent,${BRAND_ACCENT},transparent)`, opacity: 0.5 }} />

          <button onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center z-10 transition-colors"
            style={{ background: "rgba(255, 255, 255, 0.05)", color: "rgba(255, 255, 255, 0.4)" }}
            onMouseEnter={e => e.currentTarget.style.color = BRAND_ACCENT}
            onMouseLeave={e => e.currentTarget.style.color = "rgba(255, 255, 255, 0.4)"}>
            <X size={13} />
          </button>

          <AnimatePresence mode="wait">

            {/* ── INSTRUCTIONS ──────────────────────────────────────── */}
            {stage === "instructions" && (
              <motion.div key="instructions" className="p-12"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <h2 className="text-4xl font-medium tracking-tight mb-8 text-white">Before you start</h2>

                <div className="p-8 rounded-[2.5rem] mb-12 bg-white/[0.02] border border-white/10 relative overflow-hidden group">
                  <p className="text-base leading-relaxed text-muted-foreground relative z-10 font-light">
                    <strong className="text-white/40 mb-4 block uppercase tracking-[0.4em] text-[10px] font-bold">Important Session Notice</strong>
                    These immersive experiences run on high-performance cloud GPUs. To manage costs and ensure availability,
                    <span className="text-foreground"> each session is </span>
                    <span className="text-yellow-400 font-bold underline underline-offset-4 decoration-yellow-400/30">
                      limited to 15 minutes
                    </span>. 
                    Inactive sessions will be automatically disconnected to free up resources.
                  </p>
                </div>

                <InstructionsTabs />

                <motion.button onClick={finishLaunch}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  className="relative group w-full py-4 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-8 overflow-hidden transition-all shadow-xl shadow-black/20"
                >
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
                    style={{ skewX: '-20deg' }}
                  />
                  I Understand, Start Stream <ArrowRight size={14} />
                </motion.button>
              </motion.div>
            )}

            {/* ── SUCCESS ───────────────────────────────────────────── */}
            {stage === "success" && (
              <motion.div key="success" className="p-10 text-center"
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <motion.div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-5"
                  style={{ background: "hsl(142 40% 35%/0.12)", border: "1px solid hsl(142 40% 40%/0.25)" }}
                  animate={{ scale: [1, 1.08, 1] }} transition={{ duration: 0.5 }}>
                  <CheckCircle2 size={26} style={{ color: "hsl(142 55% 52%)" }} />
                </motion.div>
                <h3 className="text-2xl font-medium tracking-tight mb-2 text-foreground">
                  Launching Experience
                </h3>
                <p className="text-xs text-muted-foreground mb-8">
                  Opening <span className="text-brand-accent font-medium">{project.title}</span> in a new tab…
                </p>
                <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255, 255, 255, 0.1)" }}>
                  <motion.div className="h-full rounded-full" style={{ background: BRAND_ACCENT }}
                    initial={{ width: "0%" }} animate={{ width: "100%" }}
                    transition={{ duration: 1.6, ease: "linear" }} />
                </div>
              </motion.div>
            )}

            {/* ── WRONG PASSWORD ────────────────────────────────────── */}
            {stage === "pw-wrong" && (
              <motion.div key="pw-wrong" className="p-8 text-center"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
                <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ background: "hsl(0 50% 40%/0.12)", border: "1px solid hsl(0 50% 40%/0.25)" }}>
                  <X size={20} style={{ color: "hsl(0 65% 62%)" }} />
                </div>
                <h3 className="text-lg font-medium tracking-tight mb-2"
                  style={{ color: "#ffffff" }}>
                  Incorrect Password
                </h3>
                <p className="text-sm font-light mb-6 leading-relaxed" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                  Please contact our sales team to request access to this project.
                </p>
                <div className="flex gap-3 mb-4">
                  <a href={`mailto:${SALES_EMAIL}?subject=Access Request — ${project.title}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm border font-medium transition-colors"
                    style={{ borderColor: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.8)" }}>
                    <Mail size={13} /> Email Sales
                  </a>
                  <a href={`tel:${SALES_PHONE}`}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold uppercase tracking-widest transition-transform"
                    style={{ background: BRAND_ACCENT, color: "#000000" }}>
                    <Phone size={13} /> Call Sales
                  </a>
                </div>
                <button onClick={() => { setStage("form"); setPassword(""); }}
                  className="text-xs uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors">
                  ← Try again
                </button>
              </motion.div>
            )}

            {/* ── OTP — enter code ──────────────────────────────────── */}
            {(stage === "otp-sent" || stage === "otp-verifying") && (
              <motion.div key="otp-verify"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                <div className="p-7 pb-5" style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
                  <h2 className="text-xl font-medium tracking-tight mb-1"
                    style={{ color: "#ffffff" }}>
                    Enter your code
                  </h2>
                  <p className="text-sm font-light" style={{ color: "rgba(255, 255, 255, 0.6)" }}>
                    Code sent to{" "}
                    <span style={{ color: BRAND_ACCENT }}>{contact}</span>
                  </p>
                </div>
                <div className="p-7 space-y-5">
                  <OtpBoxes value={otp} onChange={setOtp} />
                  {otpErr && (
                    <motion.p className="text-xs text-center" style={{ color: "hsl(0 60% 58%)" }}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}>{otpErr}</motion.p>
                  )}
                  <motion.button onClick={verifyCode}
                    disabled={stage === "otp-verifying"}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    className="relative group w-full py-4 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-4 overflow-hidden disabled:opacity-50 transition-all shadow-xl shadow-black/20"
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
                      style={{ skewX: '-20deg' }}
                    />
                    {stage === "otp-verifying"
                      ? <><Loader2 size={14} className="animate-spin" /> Verifying…</>
                      : <>Verify & Launch <ArrowRight size={14} /></>}
                  </motion.button>
                  <button onClick={() => { setStage("form"); setOtp(""); setOtpErr(""); }}
                    className="w-full text-xs uppercase font-bold tracking-widest text-white/40 hover:text-white transition-colors">
                    ← Back
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── MAIN FORM ─────────────────────────────────────────── */}
            {(stage === "form" || stage === "submitting" || stage === "otp-sending") && (
              <motion.div key="form" exit={{ opacity: 0 }}>
                <div className="p-7 pt-9 space-y-4">
                  <h2 className="text-2xl font-medium tracking-tight" style={{ color: "#ffffff" }}>
                    {project.title}
                  </h2>
                  <p className="text-sm font-light leading-relaxed mb-4 pb-4 border-b border-white/10" style={{ color: "rgba(255, 255, 255, 0.5)" }}>
                    Enter your details for private access.
                  </p>

                  {/* Name */}
                  <LField label="Full Name" error={errors.name}>
                    <input type="text" placeholder="Alex Johnson" value={name}
                      onChange={e => { setName(e.target.value); setErrors(p => ({ ...p, name: "" })); }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={iStyle("name")}
                      onFocus={e => e.currentTarget.style.borderColor = "hsl(38 50% 38%)"}
                      onBlur={e => e.currentTarget.style.borderColor = errors.name ? "hsl(0 50% 45%)" : "hsl(222 18% 15%)"} />
                  </LField>

                  {/* Email */}
                  <LField label="Email Address" error={errors.email}>
                    <input type="email" placeholder="alex@studio.com" value={email}
                      onChange={e => { setEmail(e.target.value); setErrors(p => ({ ...p, email: "" })); }}
                      className="w-full px-4 py-2.5 rounded-xl text-sm focus:outline-none"
                      style={iStyle("email")}
                      onFocus={e => e.currentTarget.style.borderColor = "hsl(38 50% 38%)"}
                      onBlur={e => e.currentTarget.style.borderColor = errors.email ? "hsl(0 50% 45%)" : "hsl(222 18% 15%)"} />
                  </LField>

                  {/* Phone — with inline Send Code for OTP */}
                  <LField label="Phone / WhatsApp" error={errors.contact}>
                    <div className="flex gap-2">
                      <input type="tel" placeholder="9876543210" value={contact}
                        onChange={e => { setContact(e.target.value); setErrors(p => ({ ...p, contact: "" })); }}
                        className="flex-1 px-4 py-2.5 outline-none rounded-xl text-sm font-light transition-colors"
                        style={iStyle("contact")}
                        onFocus={e => e.currentTarget.style.borderColor = BRAND_ACCENT}
                        onBlur={e => e.currentTarget.style.borderColor = errors.contact ? "hsl(0 50% 45%)" : "rgba(255, 255, 255, 0.1)"} />
                      {access === "otp" && (
                        <motion.button
                          onClick={sendOtp}
                          disabled={stage === "otp-sending"}
                          className="flex-shrink-0 px-4 py-0 rounded-xl text-[10px] uppercase font-bold tracking-widest flex items-center gap-1.5 transition-colors"
                          style={{
                            background: "rgba(255, 255, 255, 0.05)", color: BRAND_ACCENT, border: "1px solid rgba(255, 255, 255, 0.1)",
                            opacity: stage === "otp-sending" ? 0.6 : 1
                          }}
                          whileHover={{ background: "rgba(255, 255, 255, 0.1)" }} whileTap={{ scale: 0.96 }}>
                          {stage === "otp-sending"
                            ? <Loader2 size={11} className="animate-spin mx-auto" />
                            : <>{codeSent ? "Resend" : "Send Code"}</>}
                        </motion.button>
                      )}
                    </div>
                  </LField>

                  {/* Password field — only for password access */}
                  {access === "password" && (
                    <LField label="Access Password">
                      <div className="relative">
                        <input type={showPw ? "text" : "password"} placeholder="Enter access password"
                          value={password} onChange={e => setPassword(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && submit()}
                          className="w-full px-4 py-2.5 pr-10 rounded-xl text-sm focus:outline-none"
                          style={iStyle()}
                          onFocus={e => e.currentTarget.style.borderColor = "hsl(38 50% 38%)"}
                          onBlur={e => e.currentTarget.style.borderColor = "hsl(222 18% 15%)"} />
                        <button type="button" onClick={() => setShowPw(!showPw)}
                          className="absolute right-3 top-1/2 -translate-y-1/2"
                          style={{ color: "hsl(38 8% 40%)" }}>
                          {showPw ? <EyeOff size={13} /> : <Eye size={13} />}
                        </button>
                      </div>
                    </LField>
                  )}

                  {/* OTP error if send failed */}
                  {otpErr && (stage === "form") && (
                    <p className="text-xs" style={{ color: "hsl(0 60% 58%)" }}>{otpErr}</p>
                  )}

                  {/* Main CTA — hidden for OTP (Send Code button is the CTA) */}
                  {access !== "otp" && (
                    <motion.button onClick={submit}
                      disabled={stage === "submitting"}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative group w-full py-4 rounded-2xl bg-foreground text-background text-xs font-bold uppercase tracking-[0.2em] flex items-center justify-center gap-3 mt-4 overflow-hidden disabled:opacity-50 transition-all shadow-xl shadow-black/20"
                    >
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out"
                        style={{ skewX: '-20deg' }}
                      />
                      {stage === "submitting"
                        ? <><Loader2 size={14} className="animate-spin" /> Launching…</>
                        : <>Launch Experience <ArrowRight size={14} /></>}
                    </motion.button>
                  )}

                  <p className="text-[10px] text-center pt-2 font-bold uppercase tracking-widest" style={{ color: "rgba(255, 255, 255, 0.2)" }}>
                    Details are private. No spam.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function LField({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "hsl(38 8% 46%)" }}>{label}</label>
      {children}
      {error && (
        <motion.p className="text-[11px] mt-1" style={{ color: "hsl(0 60% 58%)" }}
          initial={{ opacity: 0, y: -3 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>
      )}
    </div>
  );
}

function OtpBoxes({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const boxes = 6;
  const refs = Array.from({ length: boxes }, () => ({ current: null as HTMLInputElement | null }));

  const handle = (i: number, v: string) => {
    const digit = v.replace(/\D/, "").slice(-1);
    const arr = (value + "      ").slice(0, boxes).split("");
    arr[i] = digit || " ";
    onChange(arr.join("").trimEnd());
    if (digit && i < boxes - 1) refs[i + 1].current?.focus();
  };

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !(value[i] || "").trim() && i > 0) refs[i - 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, boxes);
    onChange(txt);
    refs[Math.min(txt.length, boxes - 1)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: boxes }).map((_, i) => (
        <input key={i} ref={el => { refs[i].current = el; }}
          type="text" inputMode="numeric" maxLength={1}
          value={(value[i] || "").trim()}
          onChange={e => handle(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-10 h-14 text-center text-xl font-light rounded-xl outline-none transition-colors border-2"
          style={{
            background: "rgba(20, 20, 20, 0.4)",
            borderColor: `${(value[i] || "").trim() ? BRAND_ACCENT : "rgba(255, 255, 255, 0.1)"}`,
            color: "#ffffff",
          }}
          onFocus={e => e.currentTarget.style.borderColor = BRAND_ACCENT}
          onBlur={e => e.currentTarget.style.borderColor = (value[i] || "").trim() ? BRAND_ACCENT : "rgba(255, 255, 255, 0.1)"}
        />
      ))}
    </div>
  );
}

function InstructionsTabs() {
  const [tab, setTab] = useState<"desktop" | "mobile">("desktop");

  return (
    <div>
      <div className="flex p-1 rounded-xl mb-5 border border-white/5" style={{ background: "rgba(255,255,255,0.03)" }}>
        <button
          onClick={() => setTab('desktop')}
          className={`flex-1 py-2.5 text-xs font-medium rounded-lg flex items-center justify-center gap-2.5 transition-colors ${tab === 'desktop' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
        >
          <Monitor size={15} /> Desktop
        </button>
        <button
          onClick={() => setTab('mobile')}
          className={`flex-1 py-2.5 text-xs font-medium rounded-lg flex items-center justify-center gap-2.5 transition-colors ${tab === 'mobile' ? 'bg-white/10 text-white shadow-sm' : 'text-white/40 hover:text-white/60'}`}
        >
          <Smartphone size={15} /> Mobile
        </button>
      </div>

      <div className="space-y-3 min-h-[220px]">
        {tab === "desktop" ? (
          <>
            <ControlRow label="Look Around" desc="Left Mouse Button + Drag" />
            <ControlRow label="Move / Walk" desc="W / A / S / D or Arrow Keys" />
            <ControlRow label="Interact / Select" desc="Left Click" />
            <ControlRow label="Zoom" desc="Mouse Scroll Wheel" />
            <ControlRow label="Orbit" desc="Right Mouse Button + Drag" />
          </>
        ) : (
          <>
            <ControlRow label="Look Around" desc="One Finger Drag" />
            <ControlRow label="Interact / Select" desc="Single Tap" />
            <ControlRow label="Zoom" desc="Pinch Gesture" />
          </>
        )}
      </div>
    </div>
  );
}

function ControlRow({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex justify-between items-center gap-3 py-3 border-b border-white/5 last:border-0">
      <span className="text-sm font-medium text-white/85">{label}</span>
      <span className="text-xs text-white/65 bg-white/5 px-3 py-1.5 rounded-md border border-white/5 whitespace-nowrap">{desc}</span>
    </div>
  );
}
