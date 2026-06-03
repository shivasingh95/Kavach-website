"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Trophy, Medal, Star, AlertTriangle } from "lucide-react";

interface LeaderboardUser {
  id: string;
  name: string;
  totalPoints: number;
}

export default function LeaderboardPage() {
  const [leaders, setLeaders] = useState<LeaderboardUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await api.get("/ctf/leaderboard");
        setLeaders(res.data.data.leaderboard);
      } catch (err: any) {
        setError("Failed to load leaderboard. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="w-full max-w-4xl mx-auto pb-12 relative z-10">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400/20 to-yellow-600/20 flex items-center justify-center mb-6 ring-1 ring-yellow-500/30 shadow-[0_0_30px_rgba(234,179,8,0.2)]">
          <Trophy className="text-yellow-500" size={36} />
        </div>
        <h1 className="text-3xl md:text-5xl font-bold mb-4">
          Global <span className="text-gradient">Leaderboard</span>
        </h1>
        <p className="text-[var(--text-secondary)] max-w-lg">
          The most elite operatives in the Kavach network. Solve CTF challenges and participate in events to climb the ranks.
        </p>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : leaders.length === 0 && !error ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
          <Trophy size={48} className="mx-auto mb-4 text-white/20" />
          <h3 className="text-xl font-semibold mb-2">No Rankings Yet</h3>
          <p className="text-[var(--text-secondary)]">
            Be the first to score points and claim the top spot!
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {leaders.map((user, index) => {
            const isTop3 = index < 3;
            let RankIcon = null;
            let rankColor = "text-white/40";
            let bgClass = "bg-[#0a0f1c]/60";
            let borderClass = "border-white/5";

            if (index === 0) {
              RankIcon = Trophy;
              rankColor = "text-yellow-400";
              bgClass = "bg-yellow-400/5";
              borderClass = "border-yellow-400/20";
            } else if (index === 1) {
              RankIcon = Medal;
              rankColor = "text-gray-300";
              bgClass = "bg-gray-300/5";
              borderClass = "border-gray-300/20";
            } else if (index === 2) {
              RankIcon = Medal;
              rankColor = "text-amber-600";
              bgClass = "bg-amber-600/5";
              borderClass = "border-amber-600/20";
            }

            return (
              <motion.div
                key={user.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className={`flex items-center p-4 sm:p-6 rounded-2xl backdrop-blur-xl border ${bgClass} ${borderClass} hover:bg-white/5 transition-colors`}
              >
                <div className={`w-12 text-center font-bold text-xl flex justify-center ${rankColor}`}>
                  {isTop3 && RankIcon ? <RankIcon size={24} /> : `#${index + 1}`}
                </div>
                
                <div className="ml-4 sm:ml-6 flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-white truncate">{user.name}</h3>
                </div>

                <div className="ml-4 text-right">
                  <div className="flex items-center gap-1.5 justify-end">
                    <Star size={16} className={isTop3 ? rankColor : "text-kavach-cyan"} />
                    <span className="font-black text-xl text-white">{user.totalPoints.toLocaleString()}</span>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest text-[var(--text-secondary)] font-semibold">Points</span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
