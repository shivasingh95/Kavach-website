"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

const TYPING_TEXT = "We hack. We defend. We innovate.";

export default function HeroSection() {
  const [typedText, setTypedText] = useState("");

  useEffect(() => {
    let currentText = "";
    let currentIndex = 0;
    
    const interval = setInterval(() => {
      if (currentIndex < TYPING_TEXT.length) {
        currentText += TYPING_TEXT[currentIndex];
        setTypedText(currentText);
        currentIndex++;
      } else {
        clearInterval(interval);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full min-h-screen flex items-center justify-center overflow-hidden pt-20">
      {/* Animated Background Grid */}
      <div className="absolute inset-0 z-0">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(to right, rgba(0, 240, 255, 0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(0, 240, 255, 0.05) 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            maskImage: "radial-gradient(ellipse at center, black 40%, transparent 80%)"
          }}
        />
      </div>

      <div className="container relative z-10 mx-auto px-4 flex flex-col items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl"
        >
          {/* Terminal Style Typing Text */}
          <div className="mb-6 font-mono text-xl md:text-3xl lg:text-4xl text-kavach-cyan min-h-[4rem] flex items-center justify-center">
            <span className="mr-1">&gt;_</span>
            {typedText}
            <motion.span 
              animate={{ opacity: [1, 0] }} 
              transition={{ repeat: Infinity, duration: 0.8 }}
              className="inline-block w-3 h-8 bg-kavach-cyan ml-1 align-middle"
            />
          </div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 text-white tracking-tight"
          >
            Kavach Cybersecurity Club
            <span className="block text-2xl md:text-3xl text-gray-400 mt-4 font-normal">
              Indian Institute of Information Technology
            </span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto"
          >
            Join a community of ethical hackers, security researchers, and developers pushing the boundaries of cybersecurity.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/ctf"
              className="px-8 py-4 bg-kavach-cyan text-black font-bold rounded-lg hover:bg-cyan-400 transition-all hover:shadow-[0_0_20px_rgba(0,240,255,0.4)]"
            >
              Explore CTF Challenges
            </Link>
            <Link 
              href="/join"
              className="px-8 py-4 bg-white/5 border border-white/10 text-white font-bold rounded-lg hover:bg-white/10 transition-all backdrop-blur-sm"
            >
              Join the Club
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
