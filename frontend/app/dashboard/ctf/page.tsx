"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Flag, ShieldAlert, CheckCircle2, ChevronRight, Lock } from "lucide-react";

interface CTFChallenge {
  id: string;
  title: string;
  description: string;
  points: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  category: string;
  isSolvable: boolean;
  solves: number;
}

export default function CTFPage() {
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        const res = await api.get("/ctf");
        setChallenges(res.data.data.challenges);
      } catch (err: any) {
        setError("Failed to load challenges. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchChallenges();
  }, []);

  const difficultyColors = {
    EASY: "text-green-400 bg-green-400/10 border-green-400/20",
    MEDIUM: "text-yellow-400 bg-yellow-400/10 border-yellow-400/20",
    HARD: "text-red-400 bg-red-400/10 border-red-400/20",
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
            <Flag className="text-kavach-cyan" size={32} />
            CTF <span className="text-gradient">Arena</span>
          </h1>
          <p className="text-[var(--text-secondary)]">
            Test your skills in our custom Capture The Flag challenges.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <ShieldAlert size={20} />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-kavach-cyan border-t-transparent rounded-full animate-spin" />
        </div>
      ) : challenges.length === 0 && !error ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <Flag size={48} className="mx-auto mb-4 text-white/20" />
          <h3 className="text-xl font-semibold mb-2">No Challenges Active</h3>
          <p className="text-[var(--text-secondary)]">
            Check back later for new CTF challenges.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {challenges.map((challenge, index) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              className="bg-[#0a0f1c]/60 backdrop-blur-xl border border-white/5 hover:border-white/20 rounded-2xl p-6 transition-all duration-300 group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-2">
                  <span className="px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full bg-white/10 border border-white/5 text-white/80">
                    {challenge.category}
                  </span>
                  <span className={`px-3 py-1 text-[10px] uppercase tracking-wider font-semibold rounded-full border ${difficultyColors[challenge.difficulty]}`}>
                    {challenge.difficulty}
                  </span>
                </div>
                <div className="text-lg font-bold text-kavach-cyan flex items-center gap-1">
                  {challenge.points} <span className="text-xs text-[var(--text-secondary)] font-normal uppercase">pts</span>
                </div>
              </div>

              <h3 className="text-xl font-bold mb-2 group-hover:text-kavach-cyan transition-colors">
                {challenge.title}
              </h3>
              <p className="text-[var(--text-secondary)] text-sm mb-6 flex-1 line-clamp-3">
                {challenge.description}
              </p>

              <div className="flex items-center justify-between pt-4 border-t border-white/5 mt-auto">
                <span className="text-xs text-[var(--text-secondary)] font-medium">
                  {challenge.solves} {challenge.solves === 1 ? "Solve" : "Solves"}
                </span>
                
                <button
                  disabled={!challenge.isSolvable}
                  className="flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-lg bg-kavach-cyan/10 text-kavach-cyan hover:bg-kavach-cyan/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {challenge.isSolvable ? (
                    <>Solve <ChevronRight size={16} /></>
                  ) : (
                    <><Lock size={16} /> Locked</>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
