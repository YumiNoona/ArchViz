"use client";

import { useState, useEffect } from "react";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

// ─────────────────────────────────────────────────
//  ADMIN CONFIG — set your password here
//  In production, use environment variable instead:
//  process.env.NEXT_PUBLIC_ADMIN_PASS
// ─────────────────────────────────────────────────
const ADMIN_PASSWORD = "archviz2025";

export default function AdminPage() {
  const [authed, setAuthed] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    // persist login in sessionStorage (clears on tab close)
    const stored = sessionStorage.getItem("av_admin");
    if (stored === "1") setAuthed(true);
    setChecked(true);
  }, []);

  const handleLogin = (pass: string) => {
    if (pass === ADMIN_PASSWORD) {
      sessionStorage.setItem("av_admin", "1");
      setAuthed(true);
      return true;
    }
    return false;
  };

  const handleLogout = () => {
    sessionStorage.removeItem("av_admin");
    setAuthed(false);
  };

  if (!checked) return null;
  if (!authed) return <AdminLogin onLogin={handleLogin} />;
  return <AdminDashboard onLogout={handleLogout} />;
}
