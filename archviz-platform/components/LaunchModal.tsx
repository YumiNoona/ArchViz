"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { Project } from "@/data/projects";
import { saveVisitor } from "@/lib/supabase";
import { haptic } from "@/lib/utils";

interface LaunchModalProps {
  project: Project | null;
  onClose: () => void;
}

type Stage = "form" | "submitting" | "success";

export default function LaunchModal({ project, onClose }: LaunchModalProps) {
  const [stage, setStage] = useState<Stage>("form");
  const [formData, setFormData] = useState({ name: "", email: "", contact: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = "Enter a valid email";
    if (!formData.contact.trim()) newErrors.contact = "Contact number is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate() || !project) return;

    haptic(10);
    setStage("submitting");

    try {
      await saveVisitor({
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        project: project.title,
        project_id: project.id,
      });
    } catch {
      // Log silently — don't block the user experience
      console.warn("Could not save visitor data");
    }

    setStage("success");
    haptic(15);

    // Launch the stream
    setTimeout(() => {
      window.open(project.streamURL, "_blank", "noopener,noreferrer");
      onClose();
      setStage("form");
      setFormData({ name: "", email: "", contact: "" });
    }, 1800);
  };

  if (!project) return null;

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[100] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0 bg-black/70 backdrop-blur-md"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        />

        {/* Modal */}
        <motion.div
          className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
          initial={{ scale: 0.88, opacity: 0, y: 20, filter: "blur(8px)" }}
          animate={{ scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ scale: 0.88, opacity: 0, y: 20, filter: "blur(8px)" }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
        >
          {/* Ambient glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-px bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted/50 hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors z-10"
            aria-label="Close modal"
          >
            <X size={14} />
          </button>

          <AnimatePresence mode="wait">
            {stage === "success" ? (
              <motion.div
                key="success"
                className="p-10 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.4 }}
              >
                <motion.div
                  className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-5"
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <CheckCircle2 size={28} className="text-emerald-400" />
                </motion.div>
                <h3
                  className="text-2xl font-light mb-2"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  Launching Experience
                </h3>
                <p className="text-sm text-muted-foreground">
                  Opening {project.title} in a new tab...
                </p>
                <motion.div
                  className="mt-6 h-1 rounded-full bg-muted overflow-hidden"
                >
                  <motion.div
                    className="h-full bg-primary rounded-full"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.6, ease: "linear" }}
                  />
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                {/* Header */}
                <div className="p-8 pb-6 border-b border-border/50">
                  <div className="mb-4">
                    <span className="text-[10px] font-medium tracking-widest uppercase text-primary/70 border border-primary/20 rounded-full px-2.5 py-1 bg-primary/5">
                      {project.type}
                    </span>
                  </div>
                  <h2
                    id="modal-title"
                    className="text-2xl font-light mb-1.5"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    {project.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Form */}
                <div className="p-8 pt-6 space-y-5">
                  <p className="text-xs text-muted-foreground">
                    Share your details to access this experience
                  </p>

                  <div className="space-y-4">
                    <FormField
                      label="Full Name"
                      id="name"
                      type="text"
                      placeholder="Alex Johnson"
                      value={formData.name}
                      error={errors.name}
                      onChange={(v) => setFormData((p) => ({ ...p, name: v }))}
                    />
                    <FormField
                      label="Email Address"
                      id="email"
                      type="email"
                      placeholder="alex@studio.com"
                      value={formData.email}
                      error={errors.email}
                      onChange={(v) => setFormData((p) => ({ ...p, email: v }))}
                    />
                    <FormField
                      label="Phone / WhatsApp"
                      id="contact"
                      type="tel"
                      placeholder="+1 555 000 0000"
                      value={formData.contact}
                      error={errors.contact}
                      onChange={(v) => setFormData((p) => ({ ...p, contact: v }))}
                    />
                  </div>

                  <motion.button
                    onClick={handleSubmit}
                    disabled={stage === "submitting"}
                    className="w-full mt-2 py-3.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium 
                      flex items-center justify-center gap-2.5 hover:bg-primary/90 
                      transition-all duration-200 disabled:opacity-70 shadow-lg shadow-primary/20"
                    whileTap={{ scale: 0.98 }}
                    whileHover={{ y: -1 }}
                  >
                    {stage === "submitting" ? (
                      <>
                        <Loader2 size={15} className="animate-spin" />
                        Preparing Experience...
                      </>
                    ) : (
                      <>
                        Start Experience
                        <ArrowRight size={15} />
                      </>
                    )}
                  </motion.button>

                  <p className="text-[10px] text-center text-muted-foreground/60">
                    Your information is kept private and used only for project access.
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

interface FormFieldProps {
  label: string;
  id: string;
  type: string;
  placeholder: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
}

function FormField({ label, id, type, placeholder, value, error, onChange }: FormFieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-xs font-medium text-muted-foreground mb-1.5"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full px-4 py-2.5 rounded-xl bg-background/50 border text-sm placeholder:text-muted-foreground/40
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-all duration-200
          ${error ? "border-destructive/50 ring-1 ring-destructive/20" : "border-border"}`}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
      />
      {error && (
        <motion.p
          id={`${id}-error`}
          className="text-[11px] text-destructive mt-1"
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  );
}
