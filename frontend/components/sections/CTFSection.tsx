"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const categories = ["All", "Web", "Crypto", "Forensics", "OSINT", "Pwning"];

const challenges = [
  { title: "SQL Injection Lab", category: "Web", difficulty: "Easy", points: 100, solves: 42 },
  { title: "RSA Broken Key", category: "Crypto", difficulty: "Medium", points: 250, solves: 18 },
  { title: "Hidden in Plain Sight", category: "Forensics", difficulty: "Hard", points: 400, solves: 7 },
  { title: "Social Recon", category: "OSINT", difficulty: "Easy", points: 150, solves: 35 },
  { title: "Buffer Overflow 101", category: "Pwning", difficulty: "Expert", points: 500, solves: 3 },
  { title: "XSS Playground", category: "Web", difficulty: "Medium", points: 200, solves: 28 },
];

const leaderboard = [
  { rank: 1, name: "0xDarkKnight", points: 2450, avatar: "🥇" },
  { rank: 2, name: "CipherSage", points: 2180, avatar: "🥈" },
  { rank: 3, name: "ByteHunter", points: 1950, avatar: "🥉" },
  { rank: 4, name: "N3tW4lk3r", points: 1720, avatar: "💀" },
  { rank: 5, name: "ShellStorm", points: 1600, avatar: "⚡" },
];

const difficultyTheme: Record<string, { bg: string; text: string; border: string }> = {
  Easy: { bg: "bg-kavach-green/10", text: "text-kavach-green", border: "border-kavach-green/30" },
  Medium: { bg: "bg-kavach-amber/10", text: "text-kavach-amber", border: "border-kavach-amber/30" },
  Hard: { bg: "bg-kavach-red/10", text: "text-kavach-red", border: "border-kavach-red/30" },
  Expert: { bg: "bg-kavach-violet/10", text: "text-kavach-violet", border: "border-kavach-violet/30" },
};

export default function CTFSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? challenges
    : challenges.filter((c) => c.category === activeCategory);

  return (
    <section id="ctf" className="relative py-24 md:py-32 overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-kavach-violet/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-kavach-cyan/10 rounded-full blur-[140px] pointer-events-none" />

      <div className="container-section relative max-w-7xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1 text-xs font-semibold tracking-widest uppercase text-kavach-violet bg-kavach-violet/10 border border-kavach-violet/20 rounded-full mb-4">
            Capture The Flag
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Prove Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-kavach-cyan to-kavach-violet">Skills</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Solve challenges across multiple categories. Earn points. Climb the leaderboard.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-300 border ${
                activeCategory === cat
                  ? "bg-kavach-cyan/15 text-kavach-cyan border-kavach-cyan/40 shadow-glow"
                  : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10 hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Challenges Grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-5">
            {filtered.map((ch, i) => {
              const theme = difficultyTheme[ch.difficulty];
              return (
                <motion.div
                  key={ch.title}
                  className="relative group cursor-pointer"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  whileInView={{ opacity: 1, scale: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-kavach-cyan/0 to-kavach-violet/0 group-hover:from-kavach-cyan/10 group-hover:to-kavach-violet/10 rounded-2xl transition-all duration-500 blur-xl opacity-0 group-hover:opacity-100" />
                  <div className="relative h-full bg-kavach-card/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6 transition-all duration-300 group-hover:-translate-y-1 group-hover:border-white/20 group-hover:shadow-glow-violet">
                    <div className="flex items-start justify-between mb-4">
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-md border ${theme.bg} ${theme.text} ${theme.border}`}>
                        {ch.difficulty}
                      </span>
                      <span className="text-xs text-gray-400 font-mono bg-white/5 px-2 py-1 rounded-md border border-white/5">{ch.category}</span>
                    </div>

                    <h4 className="text-lg font-bold mb-4 text-white group-hover:text-kavach-cyan transition-colors">{ch.title}</h4>

                    <div className="flex items-center justify-between text-sm text-gray-400 mt-auto pt-4 border-t border-white/5">
                      <span className="font-mono font-bold text-kavach-cyan flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                        {ch.points} pts
                      </span>
                      <span className="flex items-center gap-1.5">
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                        {ch.solves}
                      </span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Live Leaderboard */}
          <motion.div
            className="h-fit bg-kavach-card/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6 shadow-xl"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavach-green opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-kavach-green"></span>
              </span>
              <h3 className="text-sm font-bold tracking-widest uppercase text-gray-300">
                Live Leaderboard
              </h3>
            </div>

            <div className="space-y-4">
              {leaderboard.map((player, i) => (
                <motion.div
                  key={player.name}
                  className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-300 border border-transparent hover:border-white/10"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-white/5 border border-white/10 group-hover:border-kavach-cyan/30 transition-colors">
                    <span className="text-sm">{player.avatar}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate group-hover:text-kavach-cyan transition-colors">{player.name}</p>
                    <div className="w-full h-1.5 rounded-full bg-white/5 mt-2 overflow-hidden">
                      <motion.div
                        className="h-full rounded-full relative"
                        style={{ background: "linear-gradient(90deg, #00f0ff, #7c3aed)" }}
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${(player.points / 2450) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                      >
                        <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                      </motion.div>
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-kavach-cyan bg-kavach-cyan/10 px-2 py-1 rounded-md">
                    {player.points.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            <a
              href="/ctf"
              className="mt-6 w-full py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:border-white/20 flex justify-center items-center gap-2"
            >
              View Full Leaderboard
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
