"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { api } from "@/lib/api";
import { Calendar as CalendarIcon, MapPin, Users, AlertTriangle } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";

interface AppEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  date: string;
  location?: string;
  capacity?: number;
  rsvpCount: number;
}

export default function EventsPage() {
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rsvping, setRsvping] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchEvents = async () => {
    try {
      const res = await api.get("/events");
      setEvents(res.data.data.events);
    } catch (err: any) {
      setError("Failed to load events. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleRSVP = async (eventId: string) => {
    setRsvping(eventId);
    try {
      await api.post(`/events/${eventId}/rsvp`);
      await fetchEvents(); // Refresh to update count
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to RSVP");
    } finally {
      setRsvping(null);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto pb-12 relative z-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold mb-3 flex items-center gap-3">
            <CalendarIcon className="text-[#7c3aed]" size={32} />
            Club <span className="text-gradient">Events</span>
          </h1>
          <p className="text-[var(--text-secondary)]">
            Discover and RSVP to upcoming workshops, meetups, and competitions.
          </p>
        </div>
      </div>

      {error && (
        <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-3">
          <AlertTriangle size={20} />
          <p>{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <div className="w-8 h-8 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : events.length === 0 && !error ? (
        <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/10">
          <CalendarIcon size={48} className="mx-auto mb-4 text-white/20" />
          <h3 className="text-xl font-semibold mb-2">No Upcoming Events</h3>
          <p className="text-[var(--text-secondary)]">
            Check back later for new events.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {events.map((event, index) => {
            const eventDate = new Date(event.date);
            const isPast = eventDate < new Date();
            const isFull = event.capacity && event.rsvpCount >= event.capacity;

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className={`bg-[#0a0f1c]/60 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-300 flex flex-col md:flex-row gap-6 ${
                  isPast ? "border-white/5 opacity-60" : "border-white/10 hover:border-[#7c3aed]/30"
                }`}
              >
                {/* Date Block */}
                <div className="flex-shrink-0 bg-white/5 rounded-xl p-4 flex flex-col items-center justify-center min-w-[100px] border border-white/5">
                  <span className="text-sm font-bold text-[#7c3aed] uppercase tracking-wider">
                    {eventDate.toLocaleString('default', { month: 'short' })}
                  </span>
                  <span className="text-3xl font-black text-white">
                    {eventDate.getDate()}
                  </span>
                  <span className="text-xs text-[var(--text-secondary)] font-medium mt-1">
                    {eventDate.toLocaleString('default', { weekday: 'short' })}
                  </span>
                </div>

                {/* Content Block */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold truncate text-white">{event.title}</h3>
                    {isPast && (
                      <span className="px-2 py-0.5 text-[10px] uppercase font-bold bg-white/10 rounded text-white/60">Past</span>
                    )}
                  </div>
                  
                  <p className="text-[var(--text-secondary)] text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-[var(--text-secondary)]">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon size={14} className="text-[#7c3aed]/70" />
                      {eventDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    {event.location && (
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} className="text-[#7c3aed]/70" />
                        {event.location}
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users size={14} className="text-[#7c3aed]/70" />
                      {event.rsvpCount} {event.capacity ? `/ ${event.capacity}` : ''} Attending
                    </div>
                  </div>
                </div>

                {/* Actions Block */}
                <div className="flex items-center justify-end md:justify-center mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-white/5 md:border-l md:pl-6">
                  <button
                    onClick={() => handleRSVP(event.id)}
                    disabled={isPast || isFull || rsvping === event.id}
                    className="btn-primary w-full md:w-auto min-w-[120px] py-2.5 disabled:opacity-50"
                  >
                    {rsvping === event.id ? (
                      <span className="flex items-center justify-center">
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      </span>
                    ) : isPast ? (
                      "Ended"
                    ) : isFull ? (
                      "Full"
                    ) : (
                      "RSVP Now"
                    )}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
