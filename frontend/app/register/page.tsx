"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, User, UserPlus, ArrowRight, ArrowLeft, Chrome } from "lucide-react";
import { AuthInput } from "@/components/ui/AuthInput";
import { AuthPageWrapper } from "@/components/ui/AuthBackground";
import { PasswordStrength } from "@/components/ui/PasswordStrength";
import { useAuth } from "@/lib/AuthContext";
import { signInWithGoogle } from "@/lib/firebase";
import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ─── Schema ──────────────────────────────────────────────────────────────────

const registerSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[a-z]/, "Must contain a lowercase letter")
      .regex(/\d/, "Must contain a number")
      .regex(/[!@#$%^&*(),.?":{}|<>_\-+=[\]\\\/~`]/, "Must contain a special character"),
    confirmPassword: z.string(),
    agreeToTerms: z.literal(true, {
      errorMap: () => ({ message: "You must agree to the terms" }),
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// ─── Animation Variants ─────────────────────────────────────────────────────

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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 80 : -80,
    opacity: 0,
  }),
};

// ─── Register Page ──────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onChange",
  });

  const watchPassword = watch("password", "");
  const watchEmail = watch("email", "");
  const watchName = watch("name", "");

  const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(watchEmail);
  const isNameValid = watchName.length >= 2;

  const goToStep2 = async () => {
    const valid = await trigger(["name", "email"]);
    if (valid) {
      setDirection(1);
      setStep(2);
    }
  };

  const goToStep1 = () => {
    setDirection(-1);
    setStep(1);
  };

  const onSubmit = async (data: RegisterFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      await api.post(`/auth/register`, {
        email: data.email,
        name: data.name,
        password: data.password,
      });
      setSuccess(true);
      setTimeout(() => {
        router.push("/login?registered=true");
      }, 2000);
    } catch (error: any) {
      setServerError(
        error.response?.data?.message || "An error occurred during registration. Please try again."
      );
      setTimeout(() => setServerError(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
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

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } catch (error: any) {
      if (error.code === "auth/popup-closed-by-user") return;
      setServerError(
        error.response?.data?.message || error.message || "Google sign-up failed. Please try again."
      );
      setTimeout(() => setServerError(null), 5000);
    } finally {
      setIsGoogleLoading(false);
    }
  };

  return (
    <AuthPageWrapper
      backgroundTitle="Start Your Journey"
      backgroundSubtitle="Join hundreds of cybersecurity enthusiasts learning, building, and competing together. Your first step towards becoming a security professional starts here."
    >
      <AnimatePresence mode="wait">
        {success ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 bg-green-500/10 border border-green-500/20 rounded-2xl text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", bounce: 0.5 }}
              className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-5"
            >
              <svg className="w-8 h-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
            <h3 className="text-xl font-semibold text-white mb-2">Account Created!</h3>
            <p className="text-sm text-green-200/70">Redirecting you to login...</p>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Header */}
            <motion.div variants={itemVariants} className="mb-6">
              <h1 className="text-3xl font-bold mb-2">
                Join <span className="text-gradient">Kavach</span>
              </h1>
              <p className="text-[var(--text-secondary)] text-sm">
                Create an account to start your cybersecurity journey.
              </p>
            </motion.div>

            {/* Step indicator */}
            <motion.div variants={itemVariants} className="flex items-center gap-3 mb-6">
              {[1, 2].map((s) => (
                <div key={s} className="flex items-center gap-2 flex-1">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                      step >= s
                        ? "bg-kavach-cyan/20 text-kavach-cyan border border-kavach-cyan/40"
                        : "bg-white/5 text-white/30 border border-white/10"
                    }`}
                  >
                    {s}
                  </div>
                  <span
                    className={`text-xs font-medium transition-colors duration-200 ${
                      step >= s ? "text-white/80" : "text-white/30"
                    }`}
                  >
                    {s === 1 ? "Profile" : "Security"}
                  </span>
                  {s === 1 && (
                    <div className="flex-1 h-px bg-white/10 mx-1">
                      <motion.div
                        className="h-full bg-kavach-cyan/50"
                        initial={{ width: 0 }}
                        animate={{ width: step >= 2 ? "100%" : "0%" }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </motion.div>

            {/* Error banner */}
            <AnimatePresence>
              {serverError && (
                <motion.div
                  initial={{ opacity: 0, y: -10, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={{ opacity: 0, y: -10, height: 0 }}
                  className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center"
                >
                  {serverError}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Google Sign-Up (only on step 1) */}
            {step === 1 && (
              <>
                <motion.div variants={itemVariants}>
                  <button
                    type="button"
                    onClick={handleGoogleSignUp}
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

                <motion.div variants={itemVariants} className="relative my-6">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10" />
                  </div>
                  <div className="relative flex justify-center">
                    <span className="px-4 text-xs text-[var(--text-secondary)] bg-[#070b19]">
                      or create with email
                    </span>
                  </div>
                </motion.div>
              </>
            )}

            {/* Multi-step form */}
            <form onSubmit={handleSubmit(onSubmit)}>
              <AnimatePresence mode="wait" custom={direction}>
                {step === 1 && (
                  <motion.div
                    key="step1"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <AuthInput
                      label="Full Name"
                      placeholder="John Doe"
                      registration={register("name")}
                      error={errors.name?.message}
                      icon={User}
                      isValid={isNameValid && !errors.name}
                    />

                    <AuthInput
                      label="Email Address"
                      type="email"
                      placeholder="john@example.com"
                      registration={register("email")}
                      error={errors.email?.message}
                      icon={Mail}
                      isValid={isEmailValid && !errors.email}
                    />

                    <button
                      type="button"
                      onClick={goToStep2}
                      className="w-full btn-primary py-3.5 mt-4 flex items-center justify-center gap-2"
                    >
                      Continue
                      <ArrowRight size={18} />
                    </button>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step2"
                    custom={direction}
                    variants={slideVariants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="space-y-4"
                  >
                    <AuthInput
                      label="Password"
                      type="password"
                      placeholder="••••••••"
                      registration={register("password")}
                      error={errors.password?.message}
                      icon={Lock}
                    />

                    <PasswordStrength password={watchPassword} />

                    <AuthInput
                      label="Confirm Password"
                      type="password"
                      placeholder="••••••••"
                      registration={register("confirmPassword")}
                      error={errors.confirmPassword?.message}
                      icon={Lock}
                    />

                    {/* Terms checkbox */}
                    <div className="pt-2">
                      <label className="flex items-start gap-3 cursor-pointer group">
                        <div className="relative mt-0.5">
                          <input
                            type="checkbox"
                            {...register("agreeToTerms")}
                            className="sr-only peer"
                          />
                          <div className="w-4 h-4 rounded border border-white/20 bg-white/5 peer-checked:bg-kavach-cyan/20 peer-checked:border-kavach-cyan/50 transition-all duration-200 flex items-center justify-center">
                            <svg
                              className="w-2.5 h-2.5 text-kavach-cyan opacity-0 peer-checked:opacity-100 transition-opacity"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        </div>
                        <span className="text-xs text-[var(--text-secondary)] leading-relaxed">
                          I agree to the{" "}
                          <span className="text-kavach-cyan/70 hover:text-kavach-cyan cursor-pointer">
                            Terms of Service
                          </span>{" "}
                          and{" "}
                          <span className="text-kavach-cyan/70 hover:text-kavach-cyan cursor-pointer">
                            Privacy Policy
                          </span>
                        </span>
                      </label>
                      {errors.agreeToTerms && (
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-xs text-red-400 ml-7 mt-1 block"
                        >
                          {errors.agreeToTerms.message}
                        </motion.span>
                      )}
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={goToStep1}
                        className="flex items-center justify-center gap-1.5 py-3 px-5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white text-sm font-medium transition-all duration-200"
                      >
                        <ArrowLeft size={16} />
                        Back
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 btn-primary py-3.5 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>
                            <UserPlus size={18} />
                            Create Account
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>

            {/* Footer */}
            <motion.div
              variants={itemVariants}
              className="mt-8 text-center text-sm text-[var(--text-secondary)]"
            >
              Already have an account?{" "}
              <Link
                href="/login"
                className="text-kavach-cyan hover:text-white transition-colors font-medium"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthPageWrapper>
  );
}
