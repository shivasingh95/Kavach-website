"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Mail, Lock, LogIn, Check } from "lucide-react";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthPageWrapper } from "@/components/ui/AuthBackground";
import { useAuth } from "@/lib/AuthContext";
import { signInWithGoogle } from "@/lib/firebase";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

// ─── Staggered animation variants ────────────────────────────────────────────

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

// ─── Login Content ───────────────────────────────────────────────────────────

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [shakeError, setShakeError] = useState(false);

  const justRegistered = searchParams.get("registered") === "true";
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const handleRedirect = (user: { role: string }) => {
    setSuccess(true);
    setTimeout(() => {
      if (user.role === "ADMIN") {
        router.push("/dashboard/admin");
      } else {
        router.push("/dashboard");
      }
    }, 1000);
  };

  const triggerError = (message: string) => {
    setServerError(message);
    setShakeError(true);
    setTimeout(() => setShakeError(false), 600);
    setTimeout(() => setServerError(null), 5000);
  };

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const response = await axios.post(
        `${API_URL}/auth/login`,
        { email: data.email, password: data.password },
        { withCredentials: true }
      );

      const { accessToken, user } = response.data.data;
      login(accessToken, user);
      handleRedirect(user);
    } catch (error: any) {
  triggerError(
    error.response?.data?.error ||
    error.response?.data?.message ||
    "Invalid email or password"
  );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setServerError(null);
    setIsGoogleLoading(true);
    try {
      const idToken = await signInWithGoogle();
      
      const response = await axios.post(
        `${API_URL}/auth/google`,
        { idToken },
        { withCredentials: true }
      );

      const { accessToken, user } = response.data.data;
      login(accessToken, user);
      handleRedirect(user);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") return;
triggerError(
  error.response?.data?.error ||
  error.response?.data?.message ||
  error.message ||
  "Google sign-in failed. Please try again."
);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthPageWrapper
      backgroundTitle="Defend the Digital Frontier"
      backgroundSubtitle="Join Kavach — the cybersecurity community building the next generation of security professionals through hands-on challenges and real-world learning."
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
              <svg className="w-8 h-8 text-kavach-cyan" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <motion.path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                />
              </svg>
            </motion.div>
            <h3 className="text-xl font-semibold text-white mb-2">Welcome Back!</h3>
            <p className="text-sm text-kavach-cyan/70">Taking you to your dashboard...</p>
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

  <Link
    href="/"
    className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-lg border border-kavach-cyan/20 text-kavach-cyan hover:bg-kavach-cyan/10 transition-all"
  >
    ← Home
  </Link>

  <h1 className="text-3xl font-bold mb-2">
    Welcome <span className="text-gradient">Back</span>
  </h1>

  <p className="text-[var(--text-secondary)] text-sm">
    Log in to access your Kavach dashboard.
  </p>

</motion.div>

            {/* Registration success banner */}
            {justRegistered && (
              <motion.div
                variants={itemVariants}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium text-center"
              >
                ✓ Account created successfully! Please sign in.
              </motion.div>
            )}

            {/* Error banner */}
            <AnimatePresence>
              {serverError && (
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
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign-In */}
            <motion.div variants={itemVariants}>
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={isGoogleLoading}
                className="w-full flex items-center justify-center gap-3 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-xl text-white text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isGoogleLoading ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.42 3.44 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Continue with Google
                  </>
                )}
              </button>
            </motion.div>

            {/* Divider */}
            <motion.div variants={itemVariants} className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 text-xs text-[var(--text-secondary)] bg-[#070b19] lg:bg-[#070b19]">
                  or sign in with email
                </span>
              </div>
            </motion.div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <motion.div variants={itemVariants}>
                <AuthInput
                  label="Email Address"
                  type="email"
                  placeholder="john@example.com"
                  registration={register("email")}
                  error={errors.email?.message}
                  icon={Mail}
                />
              </motion.div>

              <motion.div variants={itemVariants}>
                <AuthInput
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  registration={register("password")}
                  error={errors.password?.message}
                  icon={Lock}
                />
              </motion.div>

              <motion.div variants={itemVariants} className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer group">
                  <div className="relative">
                    <input type="checkbox" className="sr-only peer" />
                    <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-kavach-cyan/20 peer-checked:border-kavach-cyan/50 transition-all duration-200" />
                    <Check size={10} className="absolute top-0.5 left-0.5 text-kavach-cyan opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] group-hover:text-white/60 transition-colors">
                    Remember me
                  </span>
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-kavach-cyan/70 hover:text-kavach-cyan transition-colors"
                >
                  Forgot password?
                </Link>
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
                    <>
                      <LogIn size={18} />
                      Sign In
                    </>
                  )}
                </button>
              </motion.div>
            </form>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-8 text-center text-sm text-[var(--text-secondary)]"
            >
              Don't have an account?{" "}
              <Link
                href="/register"
                className="text-kavach-cyan hover:text-white transition-colors font-medium"
              >
                Join Kavach
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthPageWrapper>
  );
}

// ─── Page Export ──────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#050816]">
          <div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
