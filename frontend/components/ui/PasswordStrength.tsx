"use client";

import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface PasswordStrengthProps {
  password: string;
  showRequirements?: boolean;
}

interface Requirement {
  label: string;
  test: (pw: string) => boolean;
}

// ─── Requirements ────────────────────────────────────────────────────────────

const requirements: Requirement[] = [
  { label: "At least 8 characters", test: (pw) => pw.length >= 8 },
  { label: "One uppercase letter", test: (pw) => /[A-Z]/.test(pw) },
  { label: "One lowercase letter", test: (pw) => /[a-z]/.test(pw) },
  { label: "One number", test: (pw) => /\d/.test(pw) },
  { label: "One special character", test: (pw) => /[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/.test(pw) },
];

// ─── Strength Calculation ────────────────────────────────────────────────────

function getStrength(password: string): {
  score: number;
  label: string;
  color: string;
  bgColor: string;
} {
  if (!password) return { score: 0, label: "", color: "", bgColor: "" };

  const passed = requirements.filter((r) => r.test(password)).length;
  const ratio = passed / requirements.length;

  if (ratio <= 0.2) return { score: ratio, label: "Very Weak", color: "#ef4444", bgColor: "rgba(239,68,68,0.15)" };
  if (ratio <= 0.4) return { score: ratio, label: "Weak", color: "#f97316", bgColor: "rgba(249,115,22,0.15)" };
  if (ratio <= 0.6) return { score: ratio, label: "Fair", color: "#eab308", bgColor: "rgba(234,179,8,0.15)" };
  if (ratio <= 0.8) return { score: ratio, label: "Good", color: "#22c55e", bgColor: "rgba(34,197,94,0.15)" };
  return { score: ratio, label: "Strong", color: "#00f0ff", bgColor: "rgba(0,240,255,0.15)" };
}

// ─── Component ───────────────────────────────────────────────────────────────

export function PasswordStrength({ password, showRequirements = true }: PasswordStrengthProps) {
  const strength = getStrength(password);

  if (!password) return null;

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-3"
    >
      {/* Strength bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--text-secondary)]">Password strength</span>
          <motion.span
            key={strength.label}
            initial={{ opacity: 0, x: 5 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-xs font-semibold"
            style={{ color: strength.color }}
          >
            {strength.label}
          </motion.span>
        </div>

        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ backgroundColor: strength.color }}
            initial={{ width: 0 }}
            animate={{ width: `${strength.score * 100}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Requirements checklist */}
      {showRequirements && (
        <div className="grid grid-cols-1 gap-1.5 pt-1">
          {requirements.map((req) => {
            const passed = req.test(password);
            return (
              <motion.div
                key={req.label}
                className="flex items-center gap-2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.div
                  className="flex-shrink-0 w-4 h-4 rounded-full flex items-center justify-center"
                  style={{
                    backgroundColor: passed ? "rgba(0,240,255,0.15)" : "rgba(255,255,255,0.05)",
                    border: `1px solid ${passed ? "rgba(0,240,255,0.4)" : "rgba(255,255,255,0.1)"}`,
                  }}
                  animate={{ scale: passed ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 0.2 }}
                >
                  {passed ? (
                    <Check size={10} className="text-kavach-cyan" />
                  ) : (
                    <X size={10} className="text-white/20" />
                  )}
                </motion.div>
                <span
                  className={`text-xs transition-colors duration-200 ${
                    passed ? "text-kavach-cyan/80" : "text-[var(--text-secondary)]"
                  }`}
                >
                  {req.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}
