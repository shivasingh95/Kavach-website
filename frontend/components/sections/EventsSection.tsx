"use client";

import { motion } from "framer-motion";

const events = [
  {
    title: "Web Exploitation Workshop",
    date: "Jun 15, 2026",
    time: "6:00 PM",
    location: "CS Lab 204",
    spots: "12 / 30",
    tag: "Workshop",
    tagColor: "#00f0ff",
  },
  {
    title: "CTF: Midnight Madness",
    date: "Jun 22, 2026",
    time: "10:00 PM",
    location: "Online — Discord",
    spots: "Open",
    tag: "CTF Event",
    tagColor: "#7c3aed",
  },
  {
    title: "Guest Lecture: Bug Bounty 101",
    date: "Jul 5, 2026",
    time: "4:00 PM",
    location: "Auditorium A",
    spots: "45 / 100",
    tag: "Lecture",
    tagColor: "#06d6a0",
  },
];

export default function EventsSection() {
  return (
    <section id="events" className="relative py-24 md:py-32">
      <div className="container-section">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold tracking-widest uppercase text-kavach-green bg-kavach-green/10 rounded-full mb-4">
            Upcoming
          </span>
          <h2 className="section-title">
            Upcoming <span className="text-gradient">Events</span>
          </h2>
          <p className="section-subtitle mx-auto mt-4">
            Workshops, CTF nights, and guest lectures — there&apos;s always something happening.
          </p>
        </motion.div>

        {/* Events Timeline */}
        <div className="relative max-w-3xl mx-auto">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-kavach-cyan/30 via-kavach-violet/30 to-transparent" />

          {events.map((event, i) => (
            <motion.div
              key={event.title}
              className={`relative flex items-start mb-10 ${
                i % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
              }`}
              initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              {/* Dot */}
              <div className="absolute left-6 md:left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-kavach-cyan shadow-glow z-10 mt-7" />

              {/* Card */}
              <div className={`ml-14 md:ml-0 glass-card p-6 md:w-[45%] ${i % 2 === 0 ? "md:mr-auto md:pr-8" : "md:ml-auto md:pl-8"}`}>
                <div className="flex items-center gap-3 mb-3">
                  <span
                    className="px-2.5 py-0.5 text-[11px] font-bold rounded-md uppercase tracking-wider"
                    style={{
                      background: `${event.tagColor}15`,
                      color: event.tagColor,
                      border: `1px solid ${event.tagColor}30`,
                    }}
                  >
                    {event.tag}
                  </span>
                </div>

                <h3 className="text-lg font-bold mb-3">{event.title}</h3>

                <div className="space-y-1.5 text-sm text-[var(--text-secondary)]">
                  <p className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                    {event.date} · {event.time}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {event.location}
                  </p>
                  <p className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
                    {event.spots} spots
                  </p>
                </div>

                <button className="mt-4 btn-secondary !py-2 !px-4 !text-xs">
                  RSVP Now
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View All */}
        <motion.div
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <a href="/events" className="btn-secondary text-sm">
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
