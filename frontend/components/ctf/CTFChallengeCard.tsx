"use client";

import { useState } from "react";
import { Flag, Terminal, ExternalLink } from "lucide-react";
import CategoryIcon from "./CategoryIcon";
import DifficultyBadge from "./DifficultyBadge";
import { api } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/AuthContext";
import MarkdownRenderer from "@/components/(public)/MarkdownRenderer";

interface CTFChallengeCardProps {
  challenge: any;
  onSolve?: () => void;
}

export default function CTFChallengeCard({ challenge, onSolve }: CTFChallengeCardProps) {
  const { isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [flagInput, setFlagInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error("Please login to submit flags");
      return;
    }
    if (!flagInput.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await api.post('/ctf/submit', {
        challengeId: challenge.id,
        flag: flagInput.trim()
      });
      
      if (res.data.data.isCorrect) {
        toast.success(`Correct! You earned ${res.data.data.pointsAwarded} points.`);
        setIsOpen(false);
        setFlagInput("");
        if (onSolve) onSolve();
      } else {
        toast.error("Incorrect flag. Try again!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to submit flag");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div 
        onClick={() => setIsOpen(true)}
        className="group flex flex-col h-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden transition-all duration-300 hover:border-kavach-cyan/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:-translate-y-1 cursor-pointer"
      >
        <div className="p-6 flex flex-col flex-grow relative">
          <div className="absolute top-4 right-4 text-gray-500 group-hover:text-kavach-cyan transition-colors">
            <CategoryIcon category={challenge.category} size={24} />
          </div>
          
          <div className="flex gap-2 mb-4">
            <DifficultyBadge difficulty={challenge.difficulty} />
          </div>

          <h3 className="text-xl font-bold text-white mb-2 group-hover:text-kavach-cyan transition-colors pr-8">
            {challenge.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-6 line-clamp-2">
            {challenge.description}
          </p>

          <div className="mt-auto flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-kavach-cyan font-mono font-bold bg-kavach-cyan/10 px-3 py-1 rounded-lg">
              <Flag size={14} />
              {challenge.points} pts
            </div>
            
            <div className="text-xs text-gray-500 flex items-center gap-1">
              <Terminal size={12} /> {challenge.category}
            </div>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div 
            className="bg-[#0a0a0a] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
              <div className="flex items-center gap-3">
                <CategoryIcon category={challenge.category} size={24} />
                <h2 className="text-2xl font-bold text-white">{challenge.title}</h2>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto flex-grow">
              <div className="flex gap-2 mb-6">
                <DifficultyBadge difficulty={challenge.difficulty} />
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-kavach-cyan/10 text-kavach-cyan border-kavach-cyan/20">
                  {challenge.points} Points
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase border bg-white/5 text-gray-400 border-white/10">
                  {challenge.category}
                </span>
              </div>

              <div className="prose prose-invert prose-sm max-w-none mb-8">
                <MarkdownRenderer content={challenge.description} />
              </div>

              {challenge.link && (
                <a 
                  href={challenge.link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white transition-colors mb-8"
                >
                  <ExternalLink size={16} /> Open Challenge Environment
                </a>
              )}
            </div>

            {/* Modal Footer / Submit */}
            <div className="p-6 border-t border-white/5 bg-black/50">
              <form onSubmit={handleSubmit} className="flex gap-3">
                <input
                  type="text"
                  placeholder="KAVACH{flag_goes_here}"
                  value={flagInput}
                  onChange={e => setFlagInput(e.target.value)}
                  className="flex-grow bg-[#050505] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-kavach-cyan font-mono"
                  required
                />
                <button
                  type="submit"
                  disabled={isSubmitting || !flagInput.trim()}
                  className="px-6 py-3 bg-kavach-cyan text-black font-bold rounded-xl hover:bg-cyan-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                >
                  {isSubmitting ? "Submitting..." : "Submit Flag"}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
