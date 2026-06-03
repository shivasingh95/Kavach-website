"use client";

import { motion } from "framer-motion";

export default function CTASection() {
  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      {/* Ambient blobs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-kavach-cyan/[0.03] rounded-full blur-[150px]" />
      <div className="absolute top-1/2 left-1/3 w-96 h-96 bg-kavach-violet/[0.04] rounded-full blur-[120px]" />

      <div className="container-section relative">
        <motion.div
          className="glass-card max-w-3xl mx-auto p-10 md:p-14 text-center glow-border"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <motion.div
            initial={{ scale: 0 }}
            whileInView={{ scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-gradient-to-br from-kavach-cyan to-kavach-violet flex items-center justify-center shadow-glow-lg"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#050816" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </motion.div>

          <h2 className="section-title mb-4">
            Ready to Join the <span className="text-gradient">Mission?</span>
          </h2>

          <p className="text-lg text-[var(--text-secondary)] leading-relaxed mb-8 max-w-lg mx-auto">
            Whether you&apos;re a beginner curious about security or an experienced hacker looking for a community — Kavach has a place for you.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <a href="/register" className="btn-primary text-base">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="8.5" cy="7" r="4" />
                <line x1="20" y1="8" x2="20" y2="14" />
                <line x1="23" y1="11" x2="17" y2="11" />
              </svg>
              Join Kavach Today
            </a>
            <a href="mailto:kavach@club.edu" className="btn-secondary text-base">
              Contact Us
            </a>
          </div>

          {/* Trust indicators */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 text-xs text-[var(--text-muted)]">
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Free to join
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              Open to all years
            </span>
            <span className="flex items-center gap-1.5">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#06d6a0" strokeWidth="2"><polyline points="20 6 9 17 4 12" /></svg>
              No experience required
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
