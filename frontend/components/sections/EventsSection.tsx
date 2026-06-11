"use client";

import { motion } from "framer-motion";

type ThemeColor = "cyan" | "violet" | "green";

const events = [
  {
    title: "Web Exploitation Workshop",
    date: "Jun 15, 2026",
    time: "6:00 PM",
    location: "CS Lab 204",
    spots: "12 / 30",
    tag: "Workshop",
    theme: "cyan" as ThemeColor,
  },
  {
    title: "CTF: Midnight Madness",
    date: "Jun 22, 2026",
    time: "10:00 PM",
    location: "Online — Discord",
    spots: "Open",
    tag: "CTF Event",
    theme: "violet" as ThemeColor,
  },
  {
    title: "Guest Lecture: Bug Bounty 101",
    date: "Jul 5, 2026",
    time: "4:00 PM",
    location: "Auditorium A",
    spots: "45 / 100",
    tag: "Lecture",
    theme: "green" as ThemeColor,
  },
];

const themeClasses = {
  cyan: {
    bg: "bg-kavach-cyan/10",
    text: "text-kavach-cyan",
    border: "border-kavach-cyan/30",
    shadow: "hover:shadow-[0_0_20px_rgba(0,240,255,0.25)]",
    dot: "bg-kavach-cyan shadow-glow",
  },
  violet: {
    bg: "bg-kavach-violet/10",
    text: "text-kavach-violet",
    border: "border-kavach-violet/30",
    shadow: "hover:shadow-[0_0_20px_rgba(124,58,237,0.25)]",
    dot: "bg-kavach-violet shadow-glow-violet",
  },
  green: {
    bg: "bg-kavach-green/10",
    text: "text-kavach-green",
    border: "border-kavach-green/30",
    shadow: "hover:shadow-[0_0_20px_rgba(6,214,160,0.25)]",
    dot: "bg-kavach-green shadow-[0_0_20px_rgba(6,214,160,0.2)]",
  },
};

export default function EventsSection() {
  return (
    <section id="events" className="relative py-24 md:py-32 overflow-hidden">
      <div className="container-section max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-4 py-1 text-xs font-semibold tracking-widest uppercase text-kavach-cyan bg-kavach-cyan/10 border border-kavach-cyan/20 rounded-full mb-4">
            Upcoming
          </span>
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4 text-white">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-kavach-cyan to-kavach-violet">Events</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Workshops, CTF nights, and guest lectures — there&apos;s always something happening.
          </p>
        </motion.div>

        {/* Events Timeline */}
        <div className="relative max-w-4xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-kavach-cyan/40 via-kavach-violet/40 to-transparent" />

          {events.map((event, i) => {
            const theme = themeClasses[event.theme];
            return (
              <motion.div
                key={event.title}
                className={`relative flex items-start mb-12 group ${
                  i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                }`}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: "easeOut" }}
              >
                {/* Dot */}
                <div className={`absolute left-6 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full z-10 mt-7 border-4 border-kavach-bg ${theme.dot} transition-transform duration-300 group-hover:scale-125`} />

                {/* Card */}
                <div className={`ml-14 md:ml-0 p-1 md:w-[45%] ${i % 2 === 0 ? "md:mr-auto" : "md:ml-auto"}`}>
                  <div className={`relative h-full bg-kavach-card/80 backdrop-blur-sm border border-white/5 rounded-2xl p-6 md:p-8 transition-all duration-300 transform group-hover:-translate-y-2 group-hover:border-white/10 ${theme.shadow}`}>
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-md uppercase tracking-widest border ${theme.bg} ${theme.text} ${theme.border}`}
                      >
                        {event.tag}
                      </span>
                    </div>

                    <h3 className="text-xl md:text-2xl font-bold mb-4 text-white group-hover:text-kavach-cyan transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-2.5 text-sm md:text-base text-gray-300">
                      <p className="flex items-center gap-3">
                        <svg className={`w-5 h-5 ${theme.text}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                        {event.date} &bull; {event.time}
                      </p>
                      <p className="flex items-center gap-3">
                        <svg className={`w-5 h-5 ${theme.text}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                        {event.location}
                      </p>
                      <p className="flex items-center gap-3">
                        <svg className={`w-5 h-5 ${theme.text}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                        {event.spots} spots
                      </p>
                    </div>

                    <div className="mt-6">
                      <button className={`w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-300 bg-white/5 hover:${theme.bg} ${theme.text} border border-white/10 hover:${theme.border} hover:scale-[1.02] active:scale-[0.98]`}>
                        RSVP Now
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* View All */}
        <motion.div
          className="text-center mt-12"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <a href="/events" className="inline-flex items-center gap-2 px-6 py-3 rounded-full font-medium text-sm text-kavach-bg bg-kavach-cyan hover:bg-white hover:shadow-glow transition-all duration-300">
            View All Events
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
