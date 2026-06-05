"use client";

import { useEffect, useState } from "react";
import { Trophy } from "lucide-react";
import { api } from "@/lib/api";

export default function LeaderboardSidebar() {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await api.get('/ctf/leaderboard?limit=10');
        setLeaderboard(res.data.data.leaderboard);
      } catch (error) {
        console.error("Failed to fetch leaderboard", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchLeaderboard();
  }, []);

  return (
    <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sticky top-24">
      <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
        <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-400">
          <Trophy size={20} />
        </div>
        <h3 className="text-xl font-bold text-white">Top Hackers</h3>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="h-12 bg-white/5 animate-pulse rounded-lg" />
          ))}
        </div>
      ) : leaderboard.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No points awarded yet.</p>
      ) : (
        <div className="space-y-2">
          {leaderboard.map((user) => (
            <div 
              key={user.id} 
              className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className={`font-bold w-6 text-center ${
                  user.rank === 1 ? 'text-yellow-400' : 
                  user.rank === 2 ? 'text-gray-300' : 
                  user.rank === 3 ? 'text-amber-600' : 'text-gray-500'
                }`}>
                  #{user.rank}
                </span>
                <span className="text-white font-medium truncate">{user.name}</span>
              </div>
              <span className="font-mono font-bold text-kavach-cyan ml-4">
                {user.totalPoints}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
