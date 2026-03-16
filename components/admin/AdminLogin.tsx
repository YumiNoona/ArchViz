"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface Props { onLogin: (pass: string) => boolean; }

export default function AdminLogin({ onLogin }: Props) {
  const [pass, setPass] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [shaking, setShaking] = useState(false);

  const submit = () => {
    const ok = onLogin(pass);
    if (!ok) {
      setError("Incorrect password");
      setShaking(true);
      setTimeout(() => setShaking(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: "radial-gradient(circle, hsl(258 70% 40% / 0.12) 0%, transparent 70%)", filter: "blur(80px)" }} />
      </div>

      <motion.div className="relative w-full max-w-sm"
        initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <Lock size={20} className="text-primary" />
          </div>
          <h1 className="text-2xl font-light mb-1" style={{ fontFamily: "var(--font-display)" }}>
            Admin Access
          </h1>
          <p className="text-sm text-muted-foreground">Interactive Visualization Studio</p>
        </div>

        {/* Card */}
        <motion.div
          animate={shaking ? { x: [-6, 6, -4, 4, 0] } : { x: 0 }}
          transition={{ duration: 0.35 }}
          className="bg-card border border-border rounded-2xl p-7 shadow-xl"
        >
          <label className="block text-xs font-medium text-muted-foreground mb-2">Password</label>
          <div className="relative mb-1">
            <input
              type={show ? "text" : "password"}
              placeholder="0575"
              value={pass}
              onChange={(e) => { setPass(e.target.value); setError(""); }}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              className={`w-full px-4 py-3 pr-11 rounded-xl bg-background border text-sm placeholder:text-muted-foreground/40
                focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all
                ${error ? "border-destructive/50" : "border-border"}`}
              autoFocus
            />
            <button type="button" onClick={() => setShow(!show)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {show ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>
          {error && (
            <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
              className="text-[11px] text-destructive mb-3">{error}</motion.p>
          )}

          <motion.button onClick={submit}
            className="w-full mt-4 py-3 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            whileHover={{ y: -1 }} whileTap={{ scale: 0.98 }}
          >
            Enter Dashboard <ArrowRight size={14} />
          </motion.button>
        </motion.div>

        <p className="text-center text-[11px] text-muted-foreground/50 mt-5">
          This area is restricted to administrators only.
        </p>
      </motion.div>
    </div>
  );
}
