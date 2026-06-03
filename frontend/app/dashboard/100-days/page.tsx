"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { hackingChallenges } from "@/lib/100-days-data";
import { CheckCircle2, ExternalLink, Trophy, Flame } from "lucide-react";
import Link from "next/link";
import { use100DaysProgress } from "@/hooks/use100DaysProgress";

export default function OneHundredDaysPage() {
  const { progress: progressData, toggleChallenge, isLoading } = use100DaysProgress();
  const [progressPercent, setProgressPercent] = useState(0);

  const completedCount = Object.keys(progressData).length;

  useEffect(() => {
    setProgressPercent((completedCount / hackingChallenges.length) * 100);
  }, [completedCount]);

  const rooms = hackingChallenges.filter(c => c.category === "Rooms");
  const challenges = hackingChallenges.filter(c => c.category === "Challenges");

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
            <Flame className="text-orange-500" size={32} />
            100 Days of <span className="text-gradient">Hacking</span>
          </h1>
          <p className="text-[var(--text-secondary)]">
            DrPraveenLalwani Challenge. Track your progress through 100 cybersecurity rooms and challenges.
          </p>
        </div>

        <div className="bg-[#0a0f1c]/80 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex items-center gap-4 min-w-[240px]">
          <div className="w-12 h-12 rounded-xl bg-kavach-cyan/10 flex items-center justify-center">
            <Trophy className="text-kavach-cyan" size={24} />
          </div>
          <div className="flex-1">
            <div className="flex justify-between text-sm mb-1 font-medium">
              <span>Progress</span>
              <span className="text-kavach-cyan">{completedCount}/100</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2">
              <div 
                className="bg-kavach-cyan h-2 rounded-full transition-all duration-500 ease-out shadow-[0_0_10px_rgba(0,240,255,0.5)]" 
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-12">
        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Rooms</h2>
            <div className="h-px bg-white/10 flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rooms.map((room, index) => (
              <ChallengeCard 
                key={room.id}
                challenge={room}
                index={index}
                isCompleted={!!progressData[room.id]}
                onToggle={() => toggleChallenge(room.id)}
              />
            ))}
          </div>
        </section>

        <section>
          <div className="flex items-center gap-4 mb-6">
            <h2 className="text-2xl font-bold">Challenges</h2>
            <div className="h-px bg-white/10 flex-1" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {challenges.map((challenge, index) => (
              <ChallengeCard 
                key={challenge.id}
                challenge={challenge}
                index={index}
                isCompleted={!!progressData[challenge.id]}
                onToggle={() => toggleChallenge(challenge.id)}
              />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function ChallengeCard({ challenge, index, isCompleted, onToggle }: { challenge: any, index: number, isCompleted: boolean, onToggle: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.05, 0.5) }}
      className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-300 ${
        isCompleted 
          ? "bg-green-500/5 border-green-500/20" 
          : "bg-[#0a0f1c]/50 border-white/5 hover:border-white/10 hover:bg-[#0a0f1c]/80"
      }`}
    >
      <button 
        onClick={onToggle}
        className="mt-0.5 flex-shrink-0 text-[var(--text-secondary)] hover:text-white transition-colors"
      >
        {isCompleted ? (
          <CheckCircle2 className="text-green-500" size={22} />
        ) : (
          <div className="w-[22px] h-[22px] rounded-full border-2 border-white/20 group-hover:border-white/40 transition-colors" />
        )}
      </button>
      
      <div className="flex-1 min-w-0">
        <h3 className={`font-medium text-sm mb-1 truncate ${isCompleted ? 'text-green-100/70 line-through decoration-green-500/50' : 'text-white'}`}>
          <span className="opacity-50 mr-2 text-xs">{challenge.id}.</span>
          {challenge.title}
        </h3>
        <Link 
          href={challenge.link} 
          target="_blank" 
          rel="noreferrer"
          className="text-xs text-kavach-cyan/70 hover:text-kavach-cyan flex items-center gap-1 w-fit"
        >
          View Resource <ExternalLink size={10} />
        </Link>
      </div>
    </motion.div>
  );
}
