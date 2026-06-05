"use client";

import { motion, useInView } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Users, Flag, Calendar, Trophy } from "lucide-react";

interface StatsCounterProps {
  stats: {
    members: number;
    challenges: number;
    events: number;
    achievements: number;
  };
}

export default function StatsCounter({ stats }: StatsCounterProps) {
  return (
    <section className="py-20 border-y border-white/5 bg-black/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <StatItem icon={Users} label="Members" value={stats.members || 0} delay={0} />
          <StatItem icon={Flag} label="CTF Challenges" value={stats.challenges || 0} delay={0.1} />
          <StatItem icon={Calendar} label="Events Held" value={stats.events || 0} delay={0.2} />
          <StatItem icon={Trophy} label="Achievements" value={stats.achievements || 0} delay={0.3} />
        </div>
      </div>
    </section>
  );
}

function StatItem({ icon: Icon, label, value, delay }: { icon: any, label: string, value: number, delay: number }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (isInView) {
      let start = 0;
      const end = value;
      const duration = 2000; // 2 seconds
      const incrementTime = 20;
      const step = Math.ceil(end / (duration / incrementTime));

      const timer = setInterval(() => {
        start += step;
        if (start >= end) {
          setCount(end);
          clearInterval(timer);
        } else {
          setCount(start);
        }
      }, incrementTime);

      return () => clearInterval(timer);
    }
  }, [isInView, value]);

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.6, delay }}
      className="flex flex-col items-center justify-center p-6 rounded-2xl bg-white/5 border border-white/10"
    >
      <div className="p-4 rounded-xl bg-kavach-cyan/10 text-kavach-cyan mb-4">
        <Icon size={32} />
      </div>
      <h3 className="text-4xl font-bold text-white mb-2">{count}+</h3>
      <p className="text-sm text-gray-400 font-medium tracking-wide uppercase">{label}</p>
    </motion.div>
  );
}
