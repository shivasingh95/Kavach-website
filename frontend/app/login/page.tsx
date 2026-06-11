"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthInput } from "@/components/ui/AuthInput";
import { useAuth } from "@/lib/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = z.infer<typeof loginSchema>;

import { Suspense } from "react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const justRegistered = searchParams.get("registered") === "true";
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setIsSubmitting(true);
    try {
      // Allow axios to send/receive cookies (refresh token)
      const response = await axios.post(
        `${API_URL}/auth/login`,
        {
          email: data.email,
          password: data.password,
        },
        { withCredentials: true }
      );
      
      const { accessToken, user } = response.data.data;
      
      login(accessToken, user);
      
      setSuccess(true);
      setTimeout(() => {
        if (user.role === 'ADMIN') {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard");
        }
      }, 1000);
    } catch (error: any) {
      setServerError(error.response?.data?.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 flex items-center justify-center relative z-10">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-kavach-cyan/10 via-background to-background -z-10" />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md p-8 md:p-10 mx-4 bg-[#0a0f1c]/60 backdrop-blur-xl border border-white/5 rounded-3xl shadow-2xl relative overflow-hidden"
      >
        {/* Decorative corner glow */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-[#7c3aed]/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-kavach-cyan/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">
              Welcome <span className="text-gradient">Back</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Log in to access your Kavach dashboard.
            </p>
          </div>

          {justRegistered && !success && (
            <div className="mb-6 p-4 bg-green-500/10 border border-green-500/20 rounded-xl text-green-400 text-sm font-medium text-center">
              Account created! Please sign in.
            </div>
          )}

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-kavach-cyan/10 border border-kavach-cyan/20 rounded-2xl text-center"
            >
              <div className="w-12 h-12 bg-kavach-cyan/20 rounded-full flex items-center justify-center mx-auto mb-4 text-kavach-cyan">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Login Successful!</h3>
              <p className="text-sm text-kavach-cyan/70">Taking you to your dashboard...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
                  {serverError}
                </div>
              )}

              <AuthInput
                label="Email Address"
                type="email"
                placeholder="john@example.com"
                registration={register("email")}
                error={errors.email?.message}
              />

              <AuthInput
                label="Password"
                type="password"
                placeholder="••••••••"
                registration={register("password")}
                error={errors.password?.message}
              />

              <div className="flex justify-end mt-1">
                <Link href="/forgot-password" className="text-xs text-kavach-cyan/70 hover:text-kavach-cyan transition-colors">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3.5 mt-6 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Sign In"
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Don't have an account?{" "}
            <Link href="/register" className="text-kavach-cyan hover:text-white transition-colors font-medium">
              Join Kavach
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" /></div>}>
      <LoginContent />
    </Suspense>
  );
}
