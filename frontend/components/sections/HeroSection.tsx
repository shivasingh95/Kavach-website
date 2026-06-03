"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useTransform } from "framer-motion";

// Dynamically import the Three.js scene — WebGL APIs are browser-only, not available in Node SSR
const Scene3D = dynamic(() => import("./Scene3D"), { ssr: false });

/* ─── Hero Section ─── */
export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  return (
    <section
      ref={sectionRef}
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* 3D Background — loaded client-side only */}
      <div className="absolute inset-0 z-0">
        <Scene3D />
      </div>

      {/* Ambient Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-kavach-cyan/5 rounded-full blur-[120px] animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-kavach-violet/8 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />

      {/* Content */}
      <motion.div className="relative z-10 container-section text-center" style={{ y, opacity }}>
        {/* Badge */}
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-kavach-cyan/20 bg-kavach-cyan/5 mb-8"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          <span className="w-2 h-2 rounded-full bg-kavach-green animate-pulse" />
          <span className="text-sm font-medium text-kavach-cyan tracking-wide">
            Season 2026 — Now Recruiting
          </span>
        </motion.div>

        {/* Headline */}
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.8 }}
        >
          <span className="block text-[var(--text-primary)]">DEFEND.</span>
          <span className="block text-gradient">LEARN.</span>
          <span className="block text-[var(--text-primary)]">HACK.</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          className="mx-auto max-w-xl text-lg sm:text-xl text-[var(--text-secondary)] leading-relaxed mb-10"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.6 }}
        >
          Kavach is the premier college cybersecurity club. Master ethical hacking,
          compete in CTF challenges, and build the skills that protect the digital world.
        </motion.p>

        {/* CTAs */}
        <motion.div
          className="flex flex-col sm:flex-row items-center justify-center gap-4"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.6 }}
        >
          <a href="#ctf" className="btn-primary text-base">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
            </svg>
            Start CTF Challenge
          </a>
          <a href="#features" className="btn-secondary text-base">
            Explore Features
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </motion.div>

        {/* Terminal Preview */}
        <motion.div
          className="mx-auto mt-16 max-w-lg"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.2, duration: 0.8 }}
        >
          <div className="glass-card p-1 rounded-xl">
            <div className="bg-[#0a0e1a] rounded-lg p-4 font-mono text-sm text-left">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-3 h-3 rounded-full bg-red-500/80" />
                <span className="w-3 h-3 rounded-full bg-yellow-500/80" />
                <span className="w-3 h-3 rounded-full bg-green-500/80" />
                <span className="ml-3 text-[var(--text-muted)] text-xs">kavach@terminal</span>
              </div>
              <TerminalText />
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 -translate-x-1/2"
        animate={{ y: [0, 10, 0] }}
        transition={{ repeat: Infinity, duration: 2 }}
      >
        <div className="w-6 h-10 rounded-full border-2 border-kavach-cyan/30 flex justify-center pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-kavach-cyan animate-pulse" />
        </div>
      </motion.div>
    </section>
  );
}

/* ─── Typewriter Terminal Effect ─── */
function TerminalText() {
  const lines = [
    { prefix: "$ ", text: "kavach --join --year 2026", color: "text-kavach-green" },
    { prefix: "→ ", text: "Initializing secure connection...", color: "text-[var(--text-muted)]" },
    { prefix: "✓ ", text: "Welcome to Kavach. You are now protected.", color: "text-kavach-cyan" },
  ];

  return (
    <div className="space-y-1.5">
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className={`${line.color}`}
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 1.5 + i * 0.5, duration: 0.4 }}
        >
          <span className="text-kavach-violet">{line.prefix}</span>
          {line.text}
        </motion.div>
      ))}
      <motion.span
        className="inline-block w-2 h-4 bg-kavach-cyan"
        animate={{ opacity: [1, 0] }}
        transition={{ repeat: Infinity, duration: 0.8 }}
        style={{ marginLeft: 2 }}
      />
    </div>
  );
}
