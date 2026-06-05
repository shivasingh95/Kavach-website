"use client";

import { useState, useMemo } from "react";
import CTFChallengeCard from "@/components/ctf/CTFChallengeCard";
import LeaderboardSidebar from "@/components/ctf/LeaderboardSidebar";
import { Filter, Search } from "lucide-react";

export default function CTFDashboard({ initialChallenges }: { initialChallenges: any[] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("ALL");
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");

  const difficulties = ["ALL", "EASY", "MEDIUM", "HARD", "EXPERT"];
  const categories = ["ALL", ...Array.from(new Set(initialChallenges.map(c => c.category)))];

  const filteredChallenges = useMemo(() => {
    return initialChallenges.filter(challenge => {
      const matchesSearch = challenge.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            challenge.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesDiff = selectedDifficulty === "ALL" || challenge.difficulty === selectedDifficulty;
      const matchesCat = selectedCategory === "ALL" || challenge.category === selectedCategory;
      
      return matchesSearch && matchesDiff && matchesCat;
    });
  }, [initialChallenges, searchQuery, selectedDifficulty, selectedCategory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Main Content Area */}
      <div className="lg:col-span-3">
        {/* Filters */}
        <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
              <Search size={18} />
            </div>
            <input
              type="text"
              placeholder="Search challenges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#050505] border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-kavach-cyan transition-colors"
            />
          </div>

          <div className="flex items-center gap-4 w-full md:w-auto">
            <div className="flex items-center gap-2">
              <Filter size={16} className="text-gray-500" />
              <select 
                value={selectedDifficulty}
                onChange={e => setSelectedDifficulty(e.target.value)}
                className="bg-[#050505] border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-kavach-cyan"
              >
                {difficulties.map(d => (
                  <option key={d} value={d}>{d === 'ALL' ? 'All Difficulties' : d}</option>
                ))}
              </select>
            </div>

            <select 
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#050505] border border-white/10 rounded-xl py-2 px-3 text-sm text-white focus:outline-none focus:border-kavach-cyan"
            >
              {categories.map(c => (
                <option key={c as string} value={c as string}>{c === 'ALL' ? 'All Categories' : c as string}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Grid */}
        {filteredChallenges.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredChallenges.map(challenge => (
              <CTFChallengeCard 
                key={challenge.id} 
                challenge={challenge} 
                // In a real app we might fetch user's submissions to mark solved
              />
            ))}
          </div>
        ) : (
          <div className="py-24 text-center border border-white/5 rounded-2xl bg-white/5">
            <h3 className="text-xl font-bold text-white mb-2">No challenges found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more challenges.</p>
          </div>
        )}
      </div>

      {/* Sidebar */}
      <div className="lg:col-span-1">
        <LeaderboardSidebar />
      </div>
    </div>
  );
}
