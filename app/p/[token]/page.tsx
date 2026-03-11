"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Mail, Eye, EyeOff, ArrowRight, RefreshCw, CheckCircle2, X, Sun, Moon } from "lucide-react";
import { getProjectByToken, verifyOtp, Project, ProjectLink } from "@/lib/supabase";
import { useTheme } from "next-themes";

// ── Helpers ───────────────────────────────────────────────────────────────────
function useToken() {
  if (typeof window === "undefined") return "";
  return window.location.pathname.split("/p/")[1] ?? "";
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PrivateLinkPage() {
  const token = useToken();
  const [project, setProject] = useState<Project | null>(null);
  const [link,    setLink]    = useState<ProjectLink | null>(null);
  const [status,  setStatus]  = useState<"loading"|"not-found"|"gate"|"granted">("loading");
  const [gate,    setGate]    = useState<"password"|"otp">("password");

  useEffect(() => {
    if (!token) { setStatus("not-found"); return; }
    (async () => {
      const { project: p, link: l } = await getProjectByToken(token);
      if (!p || !l) { setStatus("not-found"); return; }
      setProject(p);
      setLink(l);
      if (p.access_type === "public")   { setStatus("granted"); return; }
      if (p.access_type === "password") { setGate("password"); setStatus("gate"); return; }
      if (p.access_type === "otp")      { setGate("otp");      setStatus("gate"); return; }
      setStatus("granted");
    })();
  }, [token]);

  if (status === "loading") return <Loader />;
  if (status === "not-found") return <NotFound />;
  if (status === "gate") return (
    <GatePage
      project={project!}
      link={link!}
      mode={gate}
      onGranted={() => setStatus("granted")}
    />
  );
  return <ProjectView project={project!} link={link!} />;
}

// ── Loader ────────────────────────────────────────────────────────────────────
function Loader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "hsl(240 15% 6%)" }}>
      <div className="w-8 h-8 border-2 rounded-full animate-spin"
        style={{ borderColor: "hsl(258 78% 70%/0.2)", borderTopColor: "hsl(258 78% 70%)" }} />
    </div>
  );
}

// ── Not Found ─────────────────────────────────────────────────────────────────
function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4" style={{ background: "hsl(240 15% 6%)" }}>
      <X size={32} className="mb-4" style={{ color: "hsl(0 60% 55%)" }} />
      <h1 className="text-xl font-light mb-2" style={{ color: "hsl(40 18% 88%)", fontFamily: "Georgia, serif" }}>
        Link not found or expired
      </h1>
      <p className="text-sm text-center" style={{ color: "hsl(240 6% 50%)" }}>
        This link may have expired or been revoked. Please contact your architect.
      </p>
    </div>
  );
}

// ── Gate Page ─────────────────────────────────────────────────────────────────
function GatePage({ project, link, mode, onGranted }: {
  project: Project; link: ProjectLink; mode: "password"|"otp"; onGranted: () => void;
}) {
  const [pw,       setPw]       = useState("");
  const [showPw,   setShowPw]   = useState(false);
  const [email,    setEmail]    = useState(link.client_email || "");
  const [phone,    setPhone]    = useState("");
  const [usePhone, setUsePhone] = useState(true); // prefer SMS
  const [otpCode,  setOtpCode]  = useState("");
  const [otpSent,  setOtpSent]  = useState(false);
  const [channel,  setChannel]  = useState(""); // "sms-twilio" | "sms-vonage" | "email-resend"
  const [sending,  setSending]  = useState(false);
  const [checking, setChecking] = useState(false);
  const [error,    setError]    = useState("");
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  const startCountdown = () => {
    setCountdown(60);
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setCountdown(n => { if (n <= 1) { clearInterval(timerRef.current); return 0; } return n - 1; });
    }, 1000);
  };

  const checkPassword = () => {
    if (pw === project.access_password) { onGranted(); }
    else { setError("Incorrect password. Please try again."); }
  };

  const sendOtp = async () => {
    const contact = usePhone ? phone : email;
    if (!contact) { setError(usePhone ? "Enter your phone number (with country code)." : "Enter your email address."); return; }
    setSending(true); setError("");
    const res = await fetch("/api/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        linkToken: link.token,
        phone:  usePhone ? contact : undefined,
        email:  usePhone ? undefined : contact,
        projectTitle: project.title,
        clientName: link.client_name,
      }),
    });
    const data = await res.json().catch(() => ({}));
    setSending(false);
    if (res.ok) { setOtpSent(true); setChannel(data.channel ?? ""); startCountdown(); }
    else { setError(data.error ?? "Failed to send code. Please try again."); }
  };

  const verifyCode = async () => {
    if (otpCode.length !== 6) { setError("Enter the 6-digit code."); return; }
    setChecking(true); setError("");
    const { valid } = await verifyOtp(link.token, otpCode);
    setChecking(false);
    if (valid) onGranted();
    else setError("Invalid or expired code. Try again.");
  };

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14,
    background: "hsl(240 14% 9%)", border: "1px solid hsl(240 10% 18%)",
    color: "hsl(40 18% 88%)", outline: "none",
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "hsl(240 15% 6%)" }}>
      {/* Ambient glow */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(258 78% 70%/0.06) 0%, transparent 65%)", filter: "blur(60px)" }} />
      </div>

      <motion.div className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}>

        {/* Project thumbnail */}
        {project.image_url && (
          <div className="relative w-full h-36 rounded-2xl overflow-hidden mb-6"
            style={{ border: "1px solid hsl(240 10% 14%)" }}>
            <img src={project.image_url} alt={project.title}
              className="absolute inset-0 w-full h-full object-cover" style={{ filter: "brightness(0.55)" }} />
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-xs mb-1" style={{ color: "hsl(258 60% 75%)", fontFamily: "Georgia, serif" }}>
                Private Preview
              </p>
              <h2 className="text-lg font-light text-center px-4" style={{ color: "hsl(40 18% 92%)", fontFamily: "Georgia, serif" }}>
                {project.title}
              </h2>
              {link.client_name && (
                <p className="text-xs mt-1" style={{ color: "hsl(40 10% 55%)" }}>for {link.client_name}</p>
              )}
            </div>
          </div>
        )}

        <div className="rounded-2xl border p-7" style={{ background: "hsl(240 14% 9%)", borderColor: "hsl(240 10% 14%)" }}>
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ background: "hsl(258 78% 70%/0.1)", border: "1px solid hsl(258 78% 70%/0.2)" }}>
              {mode === "otp" ? <Mail size={15} style={{ color: "hsl(258 78% 72%)" }} />
                              : <Lock size={15} style={{ color: "hsl(258 78% 72%)" }} />}
            </div>
            <div>
              <h3 className="text-sm font-medium" style={{ color: "hsl(40 18% 85%)" }}>
                {mode === "otp" ? "Email Verification" : "Access Required"}
              </h3>
              <p className="text-xs" style={{ color: "hsl(240 6% 48%)" }}>
                {mode === "otp" ? "We'll send a 6-digit code via SMS or email" : "Enter the password to continue"}
              </p>
            </div>
          </div>

          {/* ── PASSWORD MODE ── */}
          {mode === "password" && (
            <div className="space-y-4">
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  placeholder="Enter password"
                  value={pw}
                  onChange={e => { setPw(e.target.value); setError(""); }}
                  onKeyDown={e => e.key === "Enter" && checkPassword()}
                  style={inp}
                  onFocus={e => e.currentTarget.style.borderColor = "hsl(258 60% 60%)"}
                  onBlur={e => e.currentTarget.style.borderColor = "hsl(240 10% 18%)"}
                />
                <button type="button" onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "hsl(240 6% 42%)" }}>
                  {showPw ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <GateBtn onClick={checkPassword} label="Continue" icon={<ArrowRight size={14} />} />
            </div>
          )}

          {/* ── OTP MODE ── */}
          {mode === "otp" && (
            <div className="space-y-4">
              {!otpSent ? (
                <>
                  {/* SMS / Email toggle */}
                  <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: "hsl(240 10% 18%)" }}>
                    {[{ id: true, label: "📱 SMS" }, { id: false, label: "✉️ Email" }].map(({ id, label }) => (
                      <button key={String(id)} onClick={() => { setUsePhone(id); setError(""); }}
                        className="flex-1 py-2 text-xs font-medium transition-all"
                        style={{
                          background: usePhone === id ? "hsl(258 60% 55%)" : "transparent",
                          color: usePhone === id ? "#fff" : "hsl(240 6% 48%)",
                        }}>
                        {label}
                      </button>
                    ))}
                  </div>
                  {usePhone ? (
                    <input
                      type="tel"
                      placeholder="+91 98765 43210"
                      value={phone}
                      onChange={e => { setPhone(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && sendOtp()}
                      style={inp}
                      onFocus={e => e.currentTarget.style.borderColor = "hsl(258 60% 60%)"}
                      onBlur={e => e.currentTarget.style.borderColor = "hsl(240 10% 18%)"}
                    />
                  ) : (
                    <input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={e => { setEmail(e.target.value); setError(""); }}
                      onKeyDown={e => e.key === "Enter" && sendOtp()}
                      style={inp}
                      onFocus={e => e.currentTarget.style.borderColor = "hsl(258 60% 60%)"}
                      onBlur={e => e.currentTarget.style.borderColor = "hsl(240 10% 18%)"}
                    />
                  )}
                  <GateBtn onClick={sendOtp} label={sending ? "Sending…" : `Send Code via ${usePhone ? "SMS" : "Email"}`} disabled={sending}
                    icon={sending ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"/> : <Mail size={14}/>} />
                </>
              ) : (
                <>
                  <div className="text-center py-2">
                    <CheckCircle2 size={18} className="mx-auto mb-2" style={{ color: "hsl(142 55% 52%)" }} />
                    <p className="text-xs" style={{ color: "hsl(240 6% 52%)" }}>
                      Code sent via{" "}
                      <span style={{ color: "hsl(40 15% 72%)" }}>
                        {channel.startsWith("sms") ? `SMS to ${phone}` : `email to ${email}`}
                      </span>
                    </p>
                  </div>
                  {/* 6-digit input */}
                  <OtpInput value={otpCode} onChange={setOtpCode} />
                  <GateBtn onClick={verifyCode} label={checking ? "Verifying…" : "Verify Code"} disabled={checking}
                    icon={checking ? <div className="w-3 h-3 border border-current border-t-transparent rounded-full animate-spin"/> : <ArrowRight size={14}/>} />
                  <button
                    onClick={() => { if (countdown === 0) { setOtpSent(false); setOtpCode(""); } }}
                    className="w-full text-center text-xs py-1"
                    style={{ color: countdown > 0 ? "hsl(240 6% 36%)" : "hsl(258 60% 65%)", cursor: countdown > 0 ? "default" : "pointer" }}>
                    {countdown > 0 ? `Resend in ${countdown}s` : "Resend code"}
                  </button>
                </>
              )}
            </div>
          )}

          {/* Error */}
          <AnimatePresence>
            {error && (
              <motion.p className="mt-3 text-xs rounded-lg px-3 py-2"
                style={{ color: "hsl(0 65% 62%)", background: "hsl(0 50% 40%/0.08)", border: "1px solid hsl(0 50% 40%/0.18)" }}
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <p className="text-center text-xs mt-4" style={{ color: "hsl(240 6% 34%)" }}>
          Powered by VastuChitra ArchViz
        </p>
      </motion.div>
    </div>
  );
}

// ── OTP 6-box input ───────────────────────────────────────────────────────────
function OtpInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const refs = Array.from({ length: 6 }, () => useRef<HTMLInputElement>(null));

  const handleKey = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !refs[i].current?.value && i > 0) {
      refs[i - 1].current?.focus();
    }
  };

  const handleChange = (i: number, v: string) => {
    const digit = v.replace(/\D/, "").slice(-1);
    const arr = value.split("");
    arr[i] = digit;
    const next = arr.join("").padEnd(6, "").slice(0, 6);
    onChange(next.trimEnd());
    if (digit && i < 5) refs[i + 1].current?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const txt = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    onChange(txt);
    refs[Math.min(txt.length, 5)].current?.focus();
    e.preventDefault();
  };

  return (
    <div className="flex gap-2 justify-center">
      {Array.from({ length: 6 }).map((_, i) => (
        <input
          key={i}
          ref={refs[i]}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[i] ?? ""}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKey(i, e)}
          onPaste={handlePaste}
          className="w-10 h-12 text-center text-lg font-light rounded-xl focus:outline-none"
          style={{
            background: "hsl(240 14% 7%)",
            border: `1px solid ${value[i] ? "hsl(258 60% 60%)" : "hsl(240 10% 18%)"}`,
            color: "hsl(40 18% 90%)",
            transition: "border-color .15s",
          }}
          onFocus={e => e.currentTarget.style.borderColor = "hsl(258 60% 62%)"}
          onBlur={e => e.currentTarget.style.borderColor = value[i] ? "hsl(258 60% 60%)" : "hsl(240 10% 18%)"}
        />
      ))}
    </div>
  );
}

function GateBtn({ onClick, label, icon, disabled }: {
  onClick: () => void; label: string; icon?: React.ReactNode; disabled?: boolean;
}) {
  return (
    <motion.button
      onClick={onClick}
      disabled={disabled}
      className="w-full py-2.5 rounded-xl text-sm font-medium flex items-center justify-center gap-2"
      style={{ background: "hsl(258 78% 68%)", color: "#fff", opacity: disabled ? 0.7 : 1 }}
      whileHover={disabled ? {} : { y: -1 }} whileTap={disabled ? {} : { scale: 0.97 }}>
      {icon}{label}
    </motion.button>
  );
}

// ── Project View — what the client actually sees ───────────────────────────────
function ProjectView({ project, link }: { project: Project; link: ProjectLink }) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = !mounted || theme === "dark";

  // Pick the right thumbnail based on current theme
  const thumbnail = (() => {
    if (!mounted) return project.image_url;
    if (isDark  && project.image_url_dark)  return project.image_url_dark;
    if (!isDark && project.image_url_light) return project.image_url_light;
    return project.image_url;
  })();

  const bg   = isDark ? "hsl(240 15% 6%)"  : "hsl(38 52% 95%)";
  const card = isDark ? "hsl(240 14% 9%)"  : "hsl(38 40% 91%)";
  const bdr  = isDark ? "hsl(240 10% 14%)" : "hsl(38 20% 80%)";
  const fg   = isDark ? "hsl(40 18% 88%)"  : "hsl(220 30% 10%)";
  const sub  = isDark ? "hsl(240 6% 48%)"  : "hsl(220 14% 42%)";
  const acc  = isDark ? "hsl(258 78% 70%)" : "hsl(22 92% 48%)";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: bg, transition: "background .3s" }}>
      {/* Minimal top bar */}
      <header className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: bdr }}>
        <div>
          <span className="text-sm font-light" style={{ color: fg, fontFamily: "Georgia, serif" }}>
            VastuChitra <span style={{ color: acc }}>ArchViz</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          {link.client_name && (
            <span className="text-xs" style={{ color: sub }}>for {link.client_name}</span>
          )}
          {/* Theme toggle */}
          <button onClick={() => setTheme(isDark ? "light" : "dark")}
            className="w-8 h-8 rounded-full flex items-center justify-center border"
            style={{ borderColor: bdr }}>
            {isDark
              ? <Sun size={13} style={{ color: "hsl(38 65% 60%)" }} />
              : <Moon size={13} style={{ color: "hsl(220 60% 50%)" }} />}
          </button>
        </div>
      </header>

      {/* Main content — single project card, centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}>

            {/* Label */}
            <p className="text-xs uppercase tracking-widest mb-4 text-center" style={{ color: acc, letterSpacing: "0.15em" }}>
              Your Project Preview
            </p>

            {/* Card */}
            <div className="rounded-2xl overflow-hidden border" style={{ background: card, borderColor: bdr }}>
              {/* Image */}
              <div className="relative w-full h-56 overflow-hidden">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={project.title}
                    className="absolute inset-0 w-full h-full object-cover"
                    style={{ transition: "opacity .4s" }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center" style={{ color: sub }}>
                    No image
                  </div>
                )}
                {/* Access badge */}
                <div className="absolute top-3 right-3">
                  <span className="text-[10px] px-2 py-1 rounded-full"
                    style={{ background: "hsl(142 55% 40%/0.15)", color: "hsl(142 55% 60%)", border: "1px solid hsl(142 55% 40%/0.25)" }}>
                    Private
                  </span>
                </div>
              </div>

              {/* Info */}
              <div className="p-5">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h2 className="text-lg font-light leading-tight" style={{ color: fg, fontFamily: "Georgia, serif" }}>
                    {project.title}
                  </h2>
                  <span className="text-[11px] px-2 py-0.5 rounded flex-shrink-0 mt-0.5"
                    style={{ background: isDark ? "hsl(240 12% 14%)" : "hsl(38 25% 84%)", color: sub }}>
                    {project.type}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-4" style={{ color: sub }}>{project.description}</p>
                <div className="flex items-center gap-4 text-xs mb-5" style={{ color: sub }}>
                  <span>{project.location}</span>
                  <span>{project.year}</span>
                </div>

                {/* Launch button */}
                {project.stream_url ? (
                  <motion.button
                    onClick={() => setFormOpen(true)}
                    className="w-full py-3 rounded-xl text-sm font-medium"
                    style={{ background: acc, color: isDark ? "#fff" : "#fff", boxShadow: `0 6px 20px ${acc}33` }}
                    whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
                    Launch Immersive Tour →
                  </motion.button>
                ) : (
                  <div className="w-full py-3 rounded-xl text-sm text-center"
                    style={{ background: isDark ? "hsl(240 12% 13%)" : "hsl(38 20% 84%)", color: sub }}>
                    Tour coming soon
                  </div>
                )}
              </div>
            </div>

            <p className="text-center text-xs mt-6" style={{ color: isDark ? "hsl(240 6% 32%)" : "hsl(220 10% 60%)" }}>
              This is a private preview link. Please do not share.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Launch form modal (same as main site) */}
      <AnimatePresence>
        {formOpen && (
          <LaunchModal
            project={project}
            clientName={link.client_name}
            clientEmail={link.client_email}
            onClose={() => setFormOpen(false)}
            isDark={isDark}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Inline Launch Modal ────────────────────────────────────────────────────────
function LaunchModal({ project, clientName, clientEmail, onClose, isDark }: {
  project: Project; clientName: string; clientEmail: string;
  onClose: () => void; isDark: boolean;
}) {
  const [name,    setName]    = useState(clientName || "");
  const [email,   setEmail]   = useState(clientEmail || "");
  const [contact, setContact] = useState("");
  const [step,    setStep]    = useState<"form"|"launching">("form");

  const bg  = isDark ? "hsl(240 15% 6%)"  : "hsl(38 52% 95%)";
  const crd = isDark ? "hsl(240 14% 9%)"  : "hsl(38 40% 91%)";
  const bdr = isDark ? "hsl(240 10% 14%)" : "hsl(38 20% 80%)";
  const fg  = isDark ? "hsl(40 18% 88%)"  : "hsl(220 30% 10%)";
  const sub = isDark ? "hsl(240 6% 48%)"  : "hsl(220 14% 42%)";
  const acc = isDark ? "hsl(258 78% 70%)" : "hsl(22 92% 48%)";

  const inp: React.CSSProperties = {
    width: "100%", padding: "10px 14px", borderRadius: 12, fontSize: 14,
    background: isDark ? "hsl(240 14% 7%)" : "hsl(38 30% 87%)",
    border: `1px solid ${bdr}`, color: fg, outline: "none",
  };

  const submit = async () => {
    if (!name || !email) return;
    setStep("launching");
    // Save visitor
    await fetch("/api/send-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, contact, project: project.title, projectId: project.id }),
    }).catch(() => {});
    // Open stream
    setTimeout(() => {
      if (project.stream_url) window.open(project.stream_url, "_blank");
    }, 800);
  };

  return (
    <motion.div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(8px)" }}
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <motion.div className="w-full max-w-sm rounded-2xl border p-7"
        style={{ background: crd, borderColor: bdr }}
        initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 40, opacity: 0 }}>

        {step === "form" ? (
          <>
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-light text-base" style={{ color: fg, fontFamily: "Georgia, serif" }}>
                  Ready to launch?
                </h3>
                <p className="text-xs mt-0.5" style={{ color: sub }}>Quick confirmation before we open your tour</p>
              </div>
              <button onClick={onClose} style={{ color: sub }}><X size={16} /></button>
            </div>
            <div className="space-y-3 mb-4">
              <input placeholder="Your name" value={name} onChange={e => setName(e.target.value)} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = acc}
                onBlur={e => e.currentTarget.style.borderColor = bdr} />
              <input placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = acc}
                onBlur={e => e.currentTarget.style.borderColor = bdr} />
              <input placeholder="Phone (optional)" value={contact} onChange={e => setContact(e.target.value)} style={inp}
                onFocus={e => e.currentTarget.style.borderColor = acc}
                onBlur={e => e.currentTarget.style.borderColor = bdr} />
            </div>
            <motion.button onClick={submit} disabled={!name || !email}
              className="w-full py-3 rounded-xl text-sm font-medium"
              style={{ background: acc, color: "#fff", opacity: (!name || !email) ? 0.5 : 1 }}
              whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}>
              Launch Tour →
            </motion.button>
          </>
        ) : (
          <div className="text-center py-6">
            <div className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{ background: `${acc}18`, border: `1px solid ${acc}30` }}>
              <CheckCircle2 size={22} style={{ color: acc }} />
            </div>
            <h3 className="font-light mb-2" style={{ color: fg, fontFamily: "Georgia, serif" }}>Opening your tour…</h3>
            <p className="text-xs" style={{ color: sub }}>If it doesn't open automatically, check your popup settings.</p>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
