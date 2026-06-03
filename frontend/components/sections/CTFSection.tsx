"use client";

import { motion } from "framer-motion";
import { useState } from "react";

const categories = ["All", "Web", "Crypto", "Forensics", "OSINT", "Pwning"];

const challenges = [
  { title: "SQL Injection Lab", category: "Web", difficulty: "Easy", points: 100, solves: 42, color: "#06d6a0" },
  { title: "RSA Broken Key", category: "Crypto", difficulty: "Medium", points: 250, solves: 18, color: "#f59e0b" },
  { title: "Hidden in Plain Sight", category: "Forensics", difficulty: "Hard", points: 400, solves: 7, color: "#ef4444" },
  { title: "Social Recon", category: "OSINT", difficulty: "Easy", points: 150, solves: 35, color: "#06d6a0" },
  { title: "Buffer Overflow 101", category: "Pwning", difficulty: "Expert", points: 500, solves: 3, color: "#7c3aed" },
  { title: "XSS Playground", category: "Web", difficulty: "Medium", points: 200, solves: 28, color: "#f59e0b" },
];

const leaderboard = [
  { rank: 1, name: "0xDarkKnight", points: 2450, avatar: "🥇" },
  { rank: 2, name: "CipherSage", points: 2180, avatar: "🥈" },
  { rank: 3, name: "ByteHunter", points: 1950, avatar: "🥉" },
  { rank: 4, name: "N3tW4lk3r", points: 1720, avatar: "💀" },
  { rank: 5, name: "ShellStorm", points: 1600, avatar: "⚡" },
];

const difficultyColors: Record<string, string> = {
  Easy: "#06d6a0",
  Medium: "#f59e0b",
  Hard: "#ef4444",
  Expert: "#7c3aed",
};

export default function CTFSection() {
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = activeCategory === "All"
    ? challenges
    : challenges.filter((c) => c.category === activeCategory);

  return (
    <section id="ctf" className="relative py-24 md:py-32">
      {/* Ambient */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-kavach-violet/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-kavach-cyan/5 rounded-full blur-[140px]" />

      <div className="container-section relative">
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-kavach-violet bg-kavach-violet/10 rounded-full mb-4">
            Capture The Flag
          </span>
          <h2 className="section-title">
            Prove Your <span className="text-gradient">Skills</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            Solve challenges across multiple categories. Earn points. Climb the leaderboard.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex flex-wrap justify-center gap-2 mb-10"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                activeCategory === cat
                  ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/30"
                  : "text-[var(--text-secondary)] border border-transparent hover:text-kavach-cyan hover:bg-kavach-cyan/5"
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Challenges Grid */}
          <div className="lg:col-span-2 grid sm:grid-cols-2 gap-4">
            {filtered.map((ch, i) => (
              <motion.div
                key={ch.title}
                className="glass-card p-5 group cursor-pointer"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06, duration: 0.4 }}
                whileHover={{ scale: 1.02 }}
              >
                <div className="flex items-start justify-between mb-3">
                  <span
                    className="px-2.5 py-0.5 text-xs font-semibold rounded-md"
                    style={{
                      background: `${difficultyColors[ch.difficulty]}15`,
                      color: difficultyColors[ch.difficulty],
                      border: `1px solid ${difficultyColors[ch.difficulty]}30`,
                    }}
                  >
                    {ch.difficulty}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] font-mono">{ch.category}</span>
                </div>

                <h4 className="text-base font-bold mb-2 group-hover:text-kavach-cyan transition-colors">{ch.title}</h4>

                <div className="flex items-center justify-between text-xs text-[var(--text-secondary)]">
                  <span className="font-mono font-bold text-kavach-cyan">{ch.points} pts</span>
                  <span>{ch.solves} solves</span>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Live Leaderboard */}
          <motion.div
            className="glass-card p-6 h-fit"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <div className="flex items-center gap-2 mb-5">
              <span className="w-2 h-2 rounded-full bg-kavach-green animate-pulse" />
              <h3 className="text-sm font-bold tracking-wide uppercase text-[var(--text-secondary)]">
                Live Leaderboard
              </h3>
            </div>

            <div className="space-y-3">
              {leaderboard.map((player, i) => (
                <motion.div
                  key={player.name}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/[0.02] transition-colors"
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1, duration: 0.4 }}
                >
                  <span className="text-xl">{player.avatar}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{player.name}</p>
                    <div className="w-full h-1 rounded-full bg-white/5 mt-1.5">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ background: "linear-gradient(90deg, #00f0ff, #7c3aed)" }}
                        initial={{ width: "0%" }}
                        whileInView={{ width: `${(player.points / 2450) * 100}%` }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6 + i * 0.1, duration: 0.8 }}
                      />
                    </div>
                  </div>
                  <span className="text-sm font-mono font-bold text-kavach-cyan">
                    {player.points.toLocaleString()}
                  </span>
                </motion.div>
              ))}
            </div>

            <a
              href="/ctf"
              className="mt-5 w-full btn-secondary flex justify-center text-sm"
            >
              View Full Leaderboard
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
