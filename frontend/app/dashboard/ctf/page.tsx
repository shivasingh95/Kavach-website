"use client";
// frontend/app/dashboard/ctf/page.tsx

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { CTFChallengeSkeleton } from "@/components/shared/Skeletons";
import EmptyState from "@/components/shared/EmptyState";
import {
  Flag,
  ShieldAlert,
  CheckCircle2,
  Globe,
  Lock,
  Search,
  Terminal,
  Code,
  Package,
  Trophy,
  Target,
  ChevronRight,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  category: string;
  solveCount: number;
  isActive: boolean;
  isSolvedByUser?: boolean;
}

interface UserStats {
  totalPoints: number;
  ctfSolves: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const DIFFICULTY_COLORS = {
  EASY: "text-green-400 bg-green-400/10 border-green-400/20",
  MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
  HARD: "text-orange-400 bg-orange-400/10 border-orange-400/20",
  EXPERT: "text-red-400 bg-red-400/10 border-red-400/20",
} as const;

const DIFFICULTY_LEFT_BORDER = {
  EASY: "border-l-green-400",
  MEDIUM: "border-l-yellow-400",
  HARD: "border-l-orange-400",
  EXPERT: "border-l-red-400",
} as const;

const CATEGORY_ICONS: Record<string, React.FC<{ size?: number | string; className?: string }>> = {
  WEB: Globe,
  CRYPTO: Lock,
  FORENSICS: Search,
  PWNING: Terminal,
  REVERSING: Code,
  OSINT: Search,
  MISC: Package,
};

const CATEGORIES = ["ALL", "WEB", "CRYPTO", "FORENSICS", "PWNING", "REVERSING", "OSINT", "MISC"];
const DIFFICULTIES = ["ALL", "EASY", "MEDIUM", "HARD", "EXPERT"];

// ─── Challenge Card ───────────────────────────────────────────────────────────

function ChallengeCard({ challenge, index }: { challenge: CTFChallenge; index: number }) {
  const router = useRouter();
  const diff = challenge.difficulty as keyof typeof DIFFICULTY_COLORS;
  const CategoryIcon = CATEGORY_ICONS[challenge.category.toUpperCase()] ?? Flag;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.4) }}
      onClick={() => router.push(`/dashboard/ctf/${challenge.id}`)}
      className={`relative bg-[#0a0f1c]/60 backdrop-blur-xl border-l-[3px] border border-white/5 hover:border-white/15 rounded-2xl p-5 transition-all duration-200 group cursor-pointer flex flex-col h-full ${
        DIFFICULTY_LEFT_BORDER[diff]
      } ${challenge.isSolvedByUser ? "opacity-70" : ""}`}
    >
      {/* Solved badge */}
      {challenge.isSolvedByUser && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 size={18} className="text-green-400" />
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex gap-2 flex-wrap">
          <span className="flex items-center gap-1 px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-white/10 border border-white/5 text-white/70">
            <CategoryIcon size={10} />
            {challenge.category}
          </span>
          <span className={`px-2.5 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${DIFFICULTY_COLORS[diff]}`}>
            {challenge.difficulty}
          </span>
        </div>
        <div className="font-mono text-lg font-bold text-kavach-cyan flex-shrink-0 ml-2">
          {challenge.points}
          <span className="text-[10px] text-[var(--text-secondary)] font-normal ml-0.5">pts</span>
        </div>
      </div>

      <h3 className="text-base font-bold mb-2 group-hover:text-kavach-cyan transition-colors leading-snug pr-6">
        {challenge.title}
      </h3>

      <p className="text-[var(--text-secondary)] text-xs mb-4 flex-1 line-clamp-2 leading-relaxed">
        {challenge.description}
      </p>

      <div className="flex items-center justify-between pt-3 border-t border-white/5 mt-auto">
        <span className="text-xs text-[var(--text-secondary)]">
          {challenge.solveCount} {challenge.solveCount === 1 ? "solve" : "solves"}
        </span>
        <span className="flex items-center gap-1 text-xs font-semibold text-kavach-cyan">
          {challenge.isSolvedByUser ? "View" : "Solve"} <ChevronRight size={13} />
        </span>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function CTFPage() {
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [diffFilter, setDiffFilter] = useState("ALL");

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [chalRes, progressRes] = await Promise.allSettled([
          api.get("/ctf/challenges"),
          api.get("/progress/me"),
        ]);

        if (chalRes.status === "fulfilled") {
          setChallenges(chalRes.value.data.data.challenges ?? []);
        } else {
          setError("Failed to load challenges.");
        }

        if (progressRes.status === "fulfilled") {
          const summary = progressRes.value.data?.data?.summary;
          if (summary) {
            setUserStats({ totalPoints: summary.totalPoints ?? 0, ctfSolves: summary.ctfSolves ?? 0 });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchAll();
  }, []);

  const filtered = useMemo(() => {
    return challenges.filter((c) => {
      const catMatch = categoryFilter === "ALL" || c.category.toUpperCase() === categoryFilter;
      const diffMatch = diffFilter === "ALL" || c.difficulty === diffFilter;
      return catMatch && diffMatch;
    });
  }, [challenges, categoryFilter, diffFilter]);

  // Sort: unsolved first, then solved
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      if (a.isSolvedByUser === b.isSolvedByUser) return 0;
      return a.isSolvedByUser ? 1 : -1;
    });
  }, [filtered]);

  const solvedCount = challenges.filter((c) => c.isSolvedByUser).length;

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 relative z-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2 flex items-center gap-3">
            <Flag className="text-kavach-cyan" size={32} />
            CTF <span className="text-gradient">Arena</span>
          </h1>
          <p className="text-[var(--text-secondary)] text-sm">
            Test your skills in our custom Capture The Flag challenges.
          </p>
        </div>

        {/* User stats bar */}
        {userStats && (
          <div className="flex gap-4 bg-[#0a0f1c]/60 border border-white/5 rounded-xl px-5 py-3">
            <div className="text-center">
              <div className="font-mono text-xl font-bold text-kavach-cyan">{userStats.totalPoints}</div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Points</div>
            </div>
            <div className="w-px bg-white/10" />
            <div className="text-center">
              <div className="font-mono text-xl font-bold text-green-400">{userStats.ctfSolves}</div>
              <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Solves</div>
            </div>
            {challenges.length > 0 && (
              <>
                <div className="w-px bg-white/10" />
                <div className="text-center">
                  <div className="font-mono text-xl font-bold text-white">{solvedCount}/{challenges.length}</div>
                  <div className="text-[10px] text-[var(--text-secondary)] uppercase tracking-wider">Progress</div>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Error banner */}
      {error && (
        <div className="p-4 mb-6 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <ShieldAlert size={18} />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Filters */}
      {!isLoading && challenges.length > 0 && (
        <div className="space-y-3 mb-6">
          {/* Category filter */}
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-all duration-150 ${
                  categoryFilter === cat
                    ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/30"
                    : "bg-white/5 text-[var(--text-secondary)] border border-white/5 hover:border-white/15 hover:text-white"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Difficulty filter */}
          <div className="flex flex-wrap gap-2">
            {DIFFICULTIES.map((d) => (
              <button
                key={d}
                onClick={() => setDiffFilter(d)}
                className={`px-3 py-1 rounded-lg text-[10px] font-semibold uppercase tracking-wider transition-all duration-150 ${
                  diffFilter === d
                    ? "bg-white/15 text-white border border-white/20"
                    : "bg-white/5 text-[var(--text-secondary)] border border-transparent hover:border-white/10 hover:text-white"
                }`}
              >
                {d}
              </button>
            ))}
          </div>

          {/* Result count */}
          <p className="text-xs text-[var(--text-secondary)]">
            Showing{" "}
            <span className="text-white font-medium">{sorted.length}</span> of{" "}
            {challenges.length} challenges
          </p>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <CTFChallengeSkeleton key={i} />
          ))}
        </div>
      ) : sorted.length === 0 ? (
        <EmptyState
          icon={challenges.length === 0 ? Flag : Target}
          title={challenges.length === 0 ? "No Challenges Active" : "No Results"}
          description={
            challenges.length === 0
              ? "Check back later for new CTF challenges."
              : "Try adjusting your category or difficulty filters."
          }
          action={
            categoryFilter !== "ALL" || diffFilter !== "ALL"
              ? { label: "Clear filters", onClick: () => { setCategoryFilter("ALL"); setDiffFilter("ALL"); } }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {sorted.map((challenge, index) => (
            <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
