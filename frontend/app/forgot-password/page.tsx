"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Mail, ArrowLeft, Check } from "lucide-react";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthPageWrapper } from "@/components/ui/AuthBackground";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "@/lib/firebase";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const triggerError = (message: string) => {
    setError(message);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
    setTimeout(() => setError(null), 5000);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      triggerError("Email is required");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err: any) {
      triggerError(err.message || "Failed to send reset email.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageWrapper
      backgroundTitle="Defend the Digital Frontier"
      backgroundSubtitle="Join K.A.V.A.C.H. — the cybersecurity community building the next generation of security professionals through hands-on challenges and real-world learning."
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-kavach-cyan/10 border border-kavach-cyan/20 rounded-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-16 h-16 bg-kavach-cyan/20 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <Check className="w-8 h-8 text-kavach-cyan" />
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Check your email</h3>
            <p className="text-sm text-kavach-cyan/70 mb-6">
              We've sent a password reset link to <br />
              <span className="text-white font-medium">{email}</span>
            </p>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-medium transition-colors"
            >
              <ArrowLeft size={16} />
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-8">
              <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-6">
                <ArrowLeft size={16} />
                Back to login
              </Link>
              <h1 className="text-3xl font-bold mb-2">
                Reset <span className="text-gradient">Password</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                Enter your email address and we'll send you a link to reset your password.
              </p>
            </motion.div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{
                    opacity: 1,
                    y: 0,
                    height: "auto",
                    x: shakeError ? [0, -8, 8, -8, 8, 0] : 0,
                  }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center"
                >
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Form */}
            <form onSubmit={onSubmit} className="space-y-4">
              <motion.div variants={itemVariants}>
                <AuthInput
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  icon={Mail}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn-primary py-3.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Send Reset Link"
                  )}
                </button>
              </motion.div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthPageWrapper>
  );
}
