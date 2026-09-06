"use client";

import { motion } from "framer-motion";

const features = [
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: "CTF Competitions",
    desc: "Compete in Capture The Flag challenges across Web, Crypto, Forensics, OSINT, Reverse Engineering & Pwning categories.",
    accent: "#00f0ff",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
        <line x1="8" y1="21" x2="16" y2="21" />
        <line x1="12" y1="17" x2="12" y2="21" />
      </svg>
    ),
    title: "Hands-On Workshops",
    desc: "Learn real-world penetration testing, vulnerability analysis, and secure coding through expert-led live sessions.",
    accent: "#7c3aed",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
    title: "Lab Environments",
    desc: "Practice attacks and defenses in isolated sandbox environments. Break things safely — learn by doing.",
    accent: "#06d6a0",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="8" r="5" />
        <path d="M20 21a8 8 0 1 0-16 0" />
      </svg>
    ),
    title: "Member Portal",
    desc: "Track your progress, manage submissions, earn achievements, and climb the leaderboard with your personal dashboard.",
    accent: "#f59e0b",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
      </svg>
    ),
    title: "Real-Time Leaderboard",
    desc: "Watch rankings shift live with Server-Sent Events. First-blood notifications and per-category standings update instantly.",
    accent: "#ef4444",
  },
  {
    icon: (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00f0ff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: "Tech Blog",
    desc: "Publish writeups, walkthroughs, and research. Supports MDX, syntax highlighting, table of contents and reactions.",
    accent: "#00f0ff",
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" className="relative py-24 md:py-32">
      <div className="container-section">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-kavach-cyan bg-kavach-cyan/10 rounded-full mb-4">
            Platform
          </span>
          <h2 className="section-title">
            Everything You Need to{" "}
            <span className="text-gradient">Level Up</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            From CTF competitions to knowledge sharing — K.A.V.A.C.H. provides a complete ecosystem for aspiring cybersecurity professionals.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, i) => (
            <motion.div
              key={feat.title}
              className="glass-card p-7 group relative overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.08, duration: 0.5 }}
            >
              {/* Hover glow */}
              <div
                className="absolute -top-20 -right-20 w-40 h-40 rounded-full blur-[80px] opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                style={{ background: feat.accent }}
              />

              <div
                className="relative z-10 w-12 h-12 rounded-xl flex items-center justify-center mb-5"
                style={{ background: `${feat.accent}10`, border: `1px solid ${feat.accent}20` }}
              >
                {feat.icon}
              </div>

              <h3 className="relative z-10 text-lg font-bold mb-3 text-[var(--text-primary)] group-hover:text-white transition-colors">
                {feat.title}
              </h3>
              <p className="relative z-10 text-sm text-[var(--text-secondary)] leading-relaxed">
                {feat.desc}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
