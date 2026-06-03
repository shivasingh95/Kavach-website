"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/sections/HeroSection";
import StatsSection from "../components/sections/StatsSection";
import FeaturesSection from "../components/sections/FeaturesSection";
import CTFSection from "../components/sections/CTFSection";
import EventsSection from "../components/sections/EventsSection";
import TeamSection from "../components/sections/TeamSection";
import CTASection from "../components/sections/CTASection";
import Footer from "../components/layout/Footer";

export default function Home() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoading ? 0 : 1 }}
        transition={{ duration: 0.8 }}
      >
        <Navbar />
        <main>
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <CTFSection />
          <EventsSection />
          <TeamSection />
          <CTASection />
        </main>
        <Footer />
      </motion.div>
    </>
  );
}

/* ─── Loading Screen ─── */
function LoadingScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      style={{ background: "#050816" }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.6 }}
    >
      <div className="text-center">
        {/* Shield Icon Animation */}
        <motion.div
          className="mx-auto mb-6 relative"
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
            <motion.path
              d="M40 8L12 22V42C12 58 24 72 40 76C56 72 68 58 68 42V22L40 8Z"
              stroke="url(#shield-gradient)"
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
            />
            <motion.path
              d="M30 42L37 49L52 34"
              stroke="#00f0ff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.8, delay: 1 }}
            />
            <defs>
              <linearGradient id="shield-gradient" x1="12" y1="8" x2="68" y2="76">
                <stop stopColor="#00f0ff" />
                <stop offset="1" stopColor="#7c3aed" />
              </linearGradient>
            </defs>
          </svg>
        </motion.div>

        {/* Brand Name */}
        <motion.h1
          className="text-2xl font-bold tracking-[0.3em] uppercase"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <span className="text-gradient">KAVACH</span>
        </motion.h1>

        {/* Loading bar */}
        <motion.div
          className="mt-6 mx-auto h-[2px] rounded-full overflow-hidden"
          style={{ width: 200, background: "rgba(0,240,255,0.1)" }}
        >
          <motion.div
            className="h-full rounded-full"
            style={{ background: "linear-gradient(90deg, #00f0ff, #7c3aed)" }}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: 1.8, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
