"use client";
// frontend/app/dashboard/ctf/[id]/page.tsx

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import {
  Flag,
  Shield,
  Lock,
  Globe,
  Search,
  Terminal,
  Code,
  Package,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  Lightbulb,
  Users,
  Trophy,
  AlertCircle,
  Clock,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  Droplets,
  ExternalLink,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  points: number;
  hints: string[];
  solveCount: number;
  isActive: boolean;
  isSolvedByUser: boolean;
  firstBloodUser: string | null;
  attachmentUrl?: string;
}

interface Solver {
  displayName: string;
  solvedAt: string;
  isFirstBlood: boolean;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_CONFIG = {
  EASY: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20", label: "EASY" },
  MEDIUM: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/20", label: "MEDIUM" },
  HARD: { color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20", label: "HARD" },
  EXPERT: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/20", label: "EXPERT" },
};

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number | string; className?: string }>> = {
  WEB: Globe,
  CRYPTO: Lock,
  FORENSICS: Search,
  PWNING: Terminal,
  REVERSING: Code,
  OSINT: Search,
  MISC: Package,
};

function timeAgo(dateStr: string): string {
  const seconds = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

// ─── Confetti ─────────────────────────────────────────────────────────────────

function fireConfetti() {
  // Dynamic import to avoid SSR issues
  import("canvas-confetti").then((mod) => {
    const confetti = mod.default;
    confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ["#00f0ff", "#06d6a0", "#7c3aed"] });
    setTimeout(() => confetti({ particleCount: 60, spread: 120, origin: { y: 0.5 } }), 300);
  }).catch(() => {
    // canvas-confetti not installed — skip silently
  });
}

// ─── Solved State Card ────────────────────────────────────────────────────────

function SolvedCard({ points, solvedAt }: { points: number; solvedAt?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-green-500/30 bg-green-500/5 p-6 text-center"
    >
      <div className="w-16 h-16 rounded-2xl bg-green-500/10 flex items-center justify-center mx-auto mb-4">
        <CheckCircle2 className="text-green-400" size={32} />
      </div>
      <h3 className="text-xl font-bold text-green-400 mb-1">Challenge Solved!</h3>
      <p className="text-[var(--text-secondary)] text-sm mb-4">
        You earned{" "}
        <span className="font-mono text-green-400 font-bold">+{points} pts</span>
      </p>
      {solvedAt && (
        <p className="text-xs text-[var(--text-secondary)]">Solved {timeAgo(solvedAt)}</p>
      )}
      <Link
        href="/dashboard/leaderboard"
        className="mt-4 inline-flex items-center gap-2 text-xs text-kavach-cyan hover:text-white transition-colors"
      >
        View leaderboard <ExternalLink size={12} />
      </Link>
    </motion.div>
  );
}

// ─── Main Page Component ──────────────────────────────────────────────────────

export default function CTFChallengePage() {
  const params = useParams();
  const router = useRouter();
  const challengeId = params?.id as string;

  // Data state
  const [challenge, setChallenge] = useState<CTFChallenge | null>(null);
  const [solvers, setSolvers] = useState<Solver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Submission state
  const [flag, setFlag] = useState("");
  const [showFlag, setShowFlag] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<{
    isCorrect: boolean;
    message: string;
    pointsAwarded?: number;
    isFirstBlood?: boolean;
    attemptsLeft?: number;
  } | null>(null);
  const [rateLimited, setRateLimited] = useState(false);

  // Hints state
  const [revealedHints, setRevealedHints] = useState<Record<number, string>>({});
  const [revealingHint, setRevealingHint] = useState<number | null>(null);

  // Solvers visibility
  const [showAllSolvers, setShowAllSolvers] = useState(false);

  // Fetch data
  useEffect(() => {
    if (!challengeId) return;

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const [chalRes, solversRes] = await Promise.all([
          api.get(`/ctf/challenges/${challengeId}`),
          api.get(`/ctf/challenges/${challengeId}/solvers`).catch(() => ({ data: { data: { solvers: [] } } })),
        ]);
        setChallenge(chalRes.data.data.challenge);
        setSolvers(solversRes.data.data.solvers ?? []);
      } catch (err: unknown) {
        const e = err as { response?: { status?: number } };
        if (e.response?.status === 404) {
          setError("This challenge does not exist or is no longer active.");
        } else {
          setError("Failed to load challenge. Please try again.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, [challengeId]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flag.trim() || isSubmitting) return;

    setIsSubmitting(true);
    setSubmitResult(null);

    try {
      const res = await api.post("/ctf/submit", {
        challengeId,
        flag: flag.trim(),
      });
      const result = res.data.data;

      setSubmitResult(result);

      if (result.isCorrect) {
        fireConfetti();
        // Update challenge state
        setChallenge((prev) =>
          prev ? { ...prev, isSolvedByUser: true, solveCount: prev.solveCount + 1 } : prev
        );
        setFlag("");
      }
    } catch (err: unknown) {
      const e = err as { response?: { status?: number; data?: { error?: string } } };
      if (e.response?.status === 429) {
        setRateLimited(true);
        setSubmitResult({ isCorrect: false, message: "Rate limit reached. Try again in 1 hour." });
      } else {
        setSubmitResult({
          isCorrect: false,
          message: e.response?.data?.error ?? "Submission failed. Please try again.",
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }, [flag, challengeId, isSubmitting]);

  const handleRevealHint = useCallback(async (index: number) => {
    if (revealedHints[index] !== undefined) return;
    setRevealingHint(index);
    try {
      const res = await api.patch(`/ctf/challenges/${challengeId}/hint/${index}`);
      setRevealedHints((prev) => ({ ...prev, [index]: res.data.data.hint }));
    } catch {
      // silently fail
    } finally {
      setRevealingHint(null);
    }
  }, [challengeId, revealedHints]);

  // ── Loading ──────────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto pb-12">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl p-8 space-y-4 animate-pulse">
              <div className="flex gap-2">
                <div className="h-6 w-20 bg-white/10 rounded-full" />
                <div className="h-6 w-16 bg-white/10 rounded-full" />
              </div>
              <div className="h-8 w-3/4 bg-white/10 rounded" />
              <div className="space-y-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-4 bg-white/5 rounded" style={{ width: `${80 + Math.random() * 20}%` }} />
                ))}
              </div>
            </div>
          </div>
          <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl p-6 space-y-4 animate-pulse">
            <div className="h-10 w-full bg-white/5 rounded-xl" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />
            <div className="h-12 w-full bg-kavach-cyan/10 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  // ── Error / Not Found ────────────────────────────────────────────────────────

  if (error || !challenge) {
    return (
      <div className="w-full max-w-6xl mx-auto pb-12">
        <Link href="/dashboard/ctf" className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-8">
          <ArrowLeft size={16} /> Back to challenges
        </Link>
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-5">
            <Flag className="text-red-400" size={28} />
          </div>
          <h3 className="text-xl font-bold mb-2">Challenge Not Found</h3>
          <p className="text-[var(--text-secondary)] text-sm">{error ?? "This challenge doesn't exist or has been removed."}</p>
        </div>
      </div>
    );
  }

  const diff = DIFFICULTY_CONFIG[challenge.difficulty] ?? DIFFICULTY_CONFIG.EASY;
  const CategoryIcon = CATEGORY_ICONS[challenge.category.toUpperCase()] ?? Flag;
  const visibleSolvers = showAllSolvers ? solvers : solvers.slice(0, 5);

  return (
    <div className="w-full max-w-6xl mx-auto pb-12 relative z-10">
      {/* Breadcrumb */}
      <Link
        href="/dashboard/ctf"
        className="inline-flex items-center gap-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors mb-8"
      >
        <ArrowLeft size={16} /> Back to challenges
      </Link>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ── LEFT: Challenge Info ─────────────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Header card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8"
          >
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="flex items-center gap-1.5 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold rounded-full bg-white/10 border border-white/5 text-white/80">
                <CategoryIcon size={12} />
                {challenge.category}
              </span>
              <span className={`px-3 py-1 text-[11px] uppercase tracking-wider font-semibold rounded-full border ${diff.color} ${diff.bg} ${diff.border}`}>
                {diff.label}
              </span>
              {challenge.isSolvedByUser && (
                <span className="flex items-center gap-1 px-3 py-1 text-[11px] uppercase tracking-wider font-semibold rounded-full bg-green-500/10 border border-green-500/20 text-green-400">
                  <CheckCircle2 size={11} /> Solved
                </span>
              )}
            </div>

            {/* Points + Title */}
            <div className="flex items-start justify-between gap-4 mb-3">
              <h1 className="text-2xl md:text-3xl font-bold text-white leading-tight">{challenge.title}</h1>
              <div className="text-right flex-shrink-0">
                <div className="font-mono text-3xl font-bold text-kavach-cyan">{challenge.points}</div>
                <div className="text-xs text-[var(--text-secondary)] uppercase tracking-wider">points</div>
              </div>
            </div>

            {/* Solve stats + first blood */}
            <div className="flex items-center gap-4 text-sm text-[var(--text-secondary)]">
              <span className="flex items-center gap-1.5">
                <Users size={14} />
                {challenge.solveCount} {challenge.solveCount === 1 ? "solve" : "solves"}
              </span>
              {challenge.firstBloodUser && (
                <span className="flex items-center gap-1.5 text-red-400">
                  <Droplets size={14} />
                  First blood: <strong className="text-red-300">{challenge.firstBloodUser}</strong>
                </span>
              )}
            </div>
          </motion.div>

          {/* Description */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6 md:p-8"
          >
            <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4">Description</h2>
            <div className="prose prose-invert prose-sm max-w-none text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
              {challenge.description}
            </div>
          </motion.div>

          {/* Hints */}
          {challenge.hints.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.12 }}
              className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                <Lightbulb size={14} /> Hints
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mb-4 italic">
                Revealing hints has no effect on your score in this version.
              </p>
              <div className="space-y-3">
                {challenge.hints.map((_, index) => (
                  <div key={index} className="border border-white/5 rounded-xl overflow-hidden">
                    {revealedHints[index] !== undefined ? (
                      <div className="p-4 bg-yellow-500/5 border-t border-yellow-500/10">
                        <p className="text-xs font-semibold text-yellow-400 mb-1">Hint {index + 1}</p>
                        <p className="text-sm text-white">{revealedHints[index]}</p>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRevealHint(index)}
                        disabled={revealingHint === index}
                        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
                      >
                        <span className="text-sm text-[var(--text-secondary)] flex items-center gap-2">
                          <Lock size={13} /> Hint {index + 1} — Click to reveal
                        </span>
                        {revealingHint === index ? (
                          <Loader2 size={14} className="animate-spin text-[var(--text-secondary)]" />
                        ) : (
                          <Eye size={14} className="text-[var(--text-secondary)]" />
                        )}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Solvers */}
          {solvers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-4 flex items-center gap-2">
                <Trophy size={14} /> Solved by ({solvers.length})
              </h2>
              <div className="space-y-2">
                {visibleSolvers.map((solver, index) => (
                  <div key={index} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center text-xs font-bold text-kavach-cyan flex-shrink-0">
                        {solver.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white flex items-center gap-1.5">
                          {solver.displayName}
                          {solver.isFirstBlood && (
                            <span className="text-[10px] text-red-400 flex items-center gap-0.5">
                              <Droplets size={9} /> 1st
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1">
                      <Clock size={11} />
                      {timeAgo(solver.solvedAt)}
                    </span>
                  </div>
                ))}
              </div>
              {solvers.length > 5 && (
                <button
                  onClick={() => setShowAllSolvers((p) => !p)}
                  className="mt-3 w-full flex items-center justify-center gap-1 text-xs text-[var(--text-secondary)] hover:text-white py-2 transition-colors"
                >
                  {showAllSolvers ? <><ChevronUp size={13} /> Show less</> : <><ChevronDown size={13} /> Show all {solvers.length} solvers</>}
                </button>
              )}
            </motion.div>
          )}
        </div>

        {/* ── RIGHT: Submission Sidebar ────────────────────────────────────── */}
        <div className="lg:sticky lg:top-6 self-start space-y-4">

          {/* Solved state or submission form */}
          {challenge.isSolvedByUser ? (
            <SolvedCard points={challenge.points} />
          ) : (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-[#0a0f1c]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-6"
            >
              <h2 className="text-sm font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-5">
                Submit Flag
              </h2>

              {/* Correct submission overlay */}
              <AnimatePresence>
                {submitResult?.isCorrect && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="mb-4 p-4 rounded-xl bg-green-500/10 border border-green-500/20 text-center"
                  >
                    <CheckCircle2 className="text-green-400 mx-auto mb-2" size={28} />
                    <p className="font-bold text-green-400">CORRECT! ✓</p>
                    {submitResult.pointsAwarded && (
                      <p className="text-sm text-green-300/80 mt-1">
                        +{submitResult.pointsAwarded} points awarded
                      </p>
                    )}
                    {submitResult.isFirstBlood && (
                      <p className="text-sm text-red-400 font-bold mt-1 animate-pulse flex items-center justify-center gap-1">
                        <Droplets size={14} /> FIRST BLOOD!
                      </p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Flag input */}
                <div>
                  <label className="block text-xs text-[var(--text-secondary)] mb-1.5 font-medium">Flag</label>
                  <div className="relative">
                    <input
                      type={showFlag ? "text" : "password"}
                      value={flag}
                      onChange={(e) => setFlag(e.target.value)}
                      placeholder="FLAG{...}"
                      disabled={rateLimited}
                      className={`w-full px-4 py-3 pr-11 rounded-xl bg-white/5 border text-sm font-mono text-white placeholder:text-white/20 outline-none transition-colors focus:border-kavach-cyan/50 ${
                        submitResult && !submitResult.isCorrect && submitResult.message
                          ? "border-red-500/40"
                          : "border-white/10"
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowFlag((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-secondary)] hover:text-white transition-colors"
                    >
                      {showFlag ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>

                  {/* Error feedback */}
                  {submitResult && !submitResult.isCorrect && (
                    <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                      <AlertCircle size={11} />
                      {submitResult.message}
                    </p>
                  )}
                </div>

                {/* Rate limit message */}
                {rateLimited && (
                  <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs flex items-center gap-2">
                    <Clock size={13} />
                    Too many attempts. Try again in 1 hour.
                  </div>
                )}

                {/* Submit */}
                <button
                  type="submit"
                  disabled={!flag.trim() || isSubmitting || rateLimited}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20 text-kavach-cyan font-semibold text-sm hover:bg-kavach-cyan/20 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Verifying...</>
                  ) : (
                    <><Send size={16} /> Submit Flag</>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Challenge meta */}
          <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl p-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Category</span>
              <span className="font-medium text-white">{challenge.category}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Difficulty</span>
              <span className={`font-semibold ${diff.color}`}>{diff.label}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Points</span>
              <span className="font-mono font-bold text-kavach-cyan">{challenge.points}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[var(--text-secondary)]">Solves</span>
              <span className="font-medium text-white">{challenge.solveCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
