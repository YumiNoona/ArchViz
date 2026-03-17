"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mail, Send, CheckCircle2, AlertTriangle, Eye, EyeOff, RefreshCw } from "lucide-react";

interface Visitor {
  id: string; name: string; email: string; contact: string;
  project: string; project_id: string; timestamp: string;
}

export default function EmailTab({ visitors }: { visitors: Visitor[] }) {
  const [subject, setSubject] = useState("Thank you for your interest in {{project}}");
  const [body, setBody] = useState(
`Hi {{name}},

Thank you for exploring {{project}} through our interactive platform.

We'd love to discuss how we can bring your vision to life with the same level of detail and immersion.

Feel free to reply to this email or reach us at your convenience.

Warm regards,
The ArchViz Studio Team`);
  const [target, setTarget] = useState<"all" | "project">("all");
  const [selProject, setSelProject] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ sent: number; failed: number } | null>(null);
  const [preview, setPreview] = useState(false);

  const projects = Array.from(new Set(visitors.map(v => v.project)));
  const recipients = target === "all" ? visitors : visitors.filter(v => v.project === selProject);

  const interpolate = (template: string, v: Visitor) =>
    template.replace(/\{\{name\}\}/g, v.name).replace(/\{\{project\}\}/g, v.project);

  const sendEmails = async () => {
    if (!recipients.length) return;
    setSending(true);
    setResult(null);
    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipients, subject, body }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ sent: 0, failed: recipients.length });
    }
    setSending(false);
  };

  const sampleVisitor = recipients[0] ?? { name: "Alex", project: "Sample Project", email: "", contact: "", id: "", project_id: "", timestamp: "" };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="max-w-4xl space-y-8 pb-20"
    >
      {/* Header Info */}
      <div className="bevel-card p-6 bg-secondary/30 border-vastu-green/20">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-vastu-green/10 border border-vastu-green/20 text-vastu-green">
            <Mail size={18} />
          </div>
          <div>
            <h3 className="text-lg font-medium tracking-tight mb-1">Resend Campaigns</h3>
            <p className="text-sm text-muted-foreground font-light leading-relaxed">
              Automated outreach powered by Resend. Make sure `RESEND_API_KEY` is set in your environment variables.
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration */}
        <div className="lg:col-span-2 space-y-6">
          <section className="space-y-4">
            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Recipient Target</label>
            <div className="flex gap-2">
              {(["all", "project"] as const).map(opt => (
                <button 
                  key={opt} 
                  onClick={() => setTarget(opt)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                    target === opt 
                    ? "bg-foreground text-background border-foreground shadow-sm" 
                    : "bg-secondary/50 text-muted-foreground border-border hover:border-muted-foreground/30"
                  }`}
                >
                  {opt === "all" ? `All Visitors (${visitors.length})` : "Specific Project"}
                </button>
              ))}
            </div>
            
            <AnimatePresence>
              {target === "project" && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <select 
                    value={selProject} 
                    onChange={e => setSelProject(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-vastu-green/20"
                  >
                    <option value="">Select a project…</option>
                    {projects.map(p => (
                      <option key={p} value={p}>{p} ({visitors.filter(v => v.project === p).length} visitors)</option>
                    ))}
                  </select>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <section className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Subject Line</label>
              <input 
                type="text" 
                value={subject} 
                onChange={e => setSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-secondary/50 border border-border text-sm focus:outline-none focus:ring-1 focus:ring-vastu-green/20"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Message Body</label>
              <textarea 
                value={body} 
                onChange={e => setBody(e.target.value)}
                rows={12}
                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-sm font-mono focus:outline-none focus:ring-1 focus:ring-vastu-green/20 resize-none"
              />
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Variables: <span className="text-vastu-green">{"{{name}}"}</span>, <span className="text-vastu-green">{"{{project}}"}</span>
              </p>
            </div>
          </section>

          <footer className="pt-6 border-t border-border flex items-center justify-between gap-4">
            <button 
              onClick={() => setPreview(!preview)}
              className="px-6 h-10 rounded-xl border border-border text-sm font-medium hover:bg-secondary transition-colors flex items-center gap-2"
            >
              {preview ? <EyeOff size={14} /> : <Eye size={14} />}
              {preview ? "Hide Preview" : "Preview Message"}
            </button>
            <button 
              onClick={sendEmails}
              disabled={sending || !recipients.length || (target === "project" && !selProject)}
              className="flex-1 btn-vercel h-10 px-8 text-sm disabled:opacity-40 disabled:hover:bg-primary"
            >
              {sending ? <RefreshCw size={14} className="animate-spin" /> : <Send size={14} />}
              {sending ? "Sending..." : `Send to ${recipients.length} Recipient${recipients.length !== 1 ? "s" : ""}`}
            </button>
          </footer>
        </div>

        {/* Preview Panel */}
        <div className="space-y-4">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Live Preview</label>
          <div className="bevel-card p-6 bg-secondary/20 relative min-h-[400px]">
            <div className="absolute top-4 right-4 text-[10px] font-bold text-vastu-green/50 uppercase tracking-widest">Preview Mode</div>
            <div className="space-y-4">
              <div>
                <span className="text-[10px] font-bold text-muted-foreground uppercase mr-2">Subject:</span>
                <span className="text-sm font-medium">{interpolate(subject, sampleVisitor)}</span>
              </div>
              <hr className="border-border" />
              <div className="text-sm leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans">
                {interpolate(body, sampleVisitor)}
              </div>
            </div>
          </div>

          <AnimatePresence>
            {result && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  result.failed === 0 ? "bg-vastu-green/10 border-vastu-green/20 text-vastu-green" : "bg-red-400/10 border-red-400/20 text-red-400"
                }`}
              >
                {result.failed === 0 ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <div className="text-xs font-medium">
                  {result.failed === 0 ? `Successfully sent ${result.sent} emails.` : `Sent ${result.sent}, Failed ${result.failed}.`}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}
