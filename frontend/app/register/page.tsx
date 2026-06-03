"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { api } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthInput } from "@/components/ui/AuthInput";

// Use api client

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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
      setServerError(error.response?.data?.message || "An error occurred during registration. Please try again.");
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
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-kavach-cyan/20 blur-3xl rounded-full" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-[#7c3aed]/20 blur-3xl rounded-full" />

        <div className="relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold mb-2">
              Join <span className="text-gradient">Kavach</span>
            </h1>
            <p className="text-[var(--text-secondary)] text-sm">
              Create an account to start your cybersecurity journey.
            </p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-green-500/10 border border-green-500/20 rounded-2xl text-center"
            >
              <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-green-400">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-white mb-2">Registration Successful!</h3>
              <p className="text-sm text-green-200/70">Redirecting you to login...</p>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {serverError && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium">
                  {serverError}
                </div>
              )}

              <AuthInput
                label="Full Name"
                placeholder="John Doe"
                registration={register("name")}
                error={errors.name?.message}
              />

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

              <AuthInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                registration={register("confirmPassword")}
                error={errors.confirmPassword?.message}
              />

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full btn-primary py-3.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                ) : (
                  "Create Account"
                )}
              </button>
            </form>
          )}

          <div className="mt-8 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{" "}
            <Link href="/login" className="text-kavach-cyan hover:text-white transition-colors font-medium">
              Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
