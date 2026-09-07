"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Lock, Check, ArrowLeft } from "lucide-react";
import { AuthPageWrapper } from "@/components/ui/AuthBackground";
import { AuthInput } from "@/components/ui/AuthInput";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

function SetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError(null);

    if (!token) {
      setError("This password setup link is invalid.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${API_URL}/auth/set-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword: password }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || "Unable to set password.");
      }
      setSuccess(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to set password.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthPageWrapper
      backgroundTitle="Secure Your Account"
      backgroundSubtitle="Set a password to access your K.A.V.A.C.H. member account."
    >
      <div className="mb-8">
        <Link href="/login" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} />
          Back to login
        </Link>
        <h1 className="text-3xl font-bold mb-2">
          Set <span className="text-gradient">Password</span>
        </h1>
        <p className="text-[var(--text-secondary)] text-sm">
          Create a password for your approved member account.
        </p>
      </div>

      {error && (
        <div className="mb-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm font-medium text-center">
          {error}
        </div>
      )}

      {success ? (
        <div className="p-6 bg-kavach-cyan/10 border border-kavach-cyan/20 rounded-2xl text-center">
          <Check className="w-10 h-10 text-kavach-cyan mx-auto mb-3" />
          <h2 className="text-lg font-semibold text-white">Password saved</h2>
          <p className="text-sm text-kavach-cyan/70 mt-2">Redirecting you to login...</p>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-4">
          <AuthInput label="New Password" type="password" placeholder="At least 8 characters" value={password} onChange={(event) => setPassword(event.target.value)} icon={Lock} />
          <AuthInput label="Confirm Password" type="password" placeholder="Repeat your password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} icon={Lock} />
          <button type="submit" disabled={isSubmitting} className="w-full btn-primary py-3.5 mt-4 disabled:opacity-50 disabled:cursor-not-allowed">
            {isSubmitting ? "Saving..." : "Set Password"}
          </button>
        </form>
      )}
    </AuthPageWrapper>
  );
}

export default function SetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-[#050816]" />}>
      <SetPasswordContent />
    </Suspense>
  );
}
