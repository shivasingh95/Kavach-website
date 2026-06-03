"use client";

import { motion } from "framer-motion";

const team = [
  {
    name: "Shiva Raghuwanshi",
    role: "Team Lead",
    bio: "Full-stack developer & security researcher. Building Kavach from the ground up.",
    initials: "SR",
    gradient: "from-[#00f0ff] to-[#7c3aed]",
  },
  {
    name: "Aarav Patel",
    role: "CTF Lead",
    bio: "Competitive CTF player. Specializes in web exploitation and cryptography.",
    initials: "AP",
    gradient: "from-[#7c3aed] to-[#ef4444]",
  },
  {
    name: "Priya Sharma",
    role: "Events Coordinator",
    bio: "Organizes workshops, guest lectures, and CTF competitions for the club.",
    initials: "PS",
    gradient: "from-[#06d6a0] to-[#00f0ff]",
  },
  {
    name: "Rohan Gupta",
    role: "Security Researcher",
    bio: "Bug bounty hunter and open-source contributor. Specializes in reverse engineering.",
    initials: "RG",
    gradient: "from-[#f59e0b] to-[#ef4444]",
  },
];

export default function TeamSection() {
  return (
    <section id="team" className="relative py-24 md:py-32">
      <div className="container-section">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-[#f59e0b] bg-[#f59e0b]/10 rounded-full mb-4">
            Our Team
          </span>
          <h2 className="section-title">
            Meet the <span className="text-gradient">Core Team</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            The minds behind Kavach. Passionate about security, driven by curiosity.
          </p>
        </motion.div>

        {/* Team Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {team.map((member, i) => (
            <motion.div
              key={member.name}
              className="glass-card p-6 text-center group"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
            >
              {/* Avatar */}
              <div className="relative mx-auto w-20 h-20 mb-5">
                <div className={`w-full h-full rounded-2xl bg-gradient-to-br ${member.gradient} flex items-center justify-center text-xl font-black text-white shadow-lg`}>
                  {member.initials}
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-kavach-green border-2 border-[var(--bg-card)]" />
              </div>

              <h3 className="text-base font-bold mb-1">{member.name}</h3>
              <p className="text-xs font-semibold text-kavach-cyan mb-3 tracking-wide uppercase">
                {member.role}
              </p>
              <p className="text-sm text-[var(--text-secondary)] leading-relaxed">
                {member.bio}
              </p>

              {/* Social Icons */}
              <div className="flex justify-center gap-3 mt-4">
                <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-kavach-cyan hover:border-kavach-cyan/20 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                </a>
                <a href="#" className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-[var(--text-muted)] hover:text-kavach-cyan hover:border-kavach-cyan/20 transition-all">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" /></svg>
                </a>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
