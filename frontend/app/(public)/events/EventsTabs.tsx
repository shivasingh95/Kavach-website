"use client";

import { useState, useEffect } from "react";
import EventCard from "@/components/(public)/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Calendar, Clock, Archive } from "lucide-react";

export default function EventsTabs({ initialEvents }: { initialEvents: any[] }) {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);

  const now = new Date();
  const upcomingEvents = initialEvents.filter((e) => new Date(e.date) >= now);
  const pastEvents = initialEvents.filter((e) => new Date(e.date) < now);

  if (!mounted) return null;

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <div className="flex justify-center mb-12">
        <TabsList className="bg-white/[0.04] border border-white/10 p-1.5 rounded-2xl gap-1">
          <TabsTrigger 
            value="upcoming" 
            className="flex items-center gap-2 data-[state=active]:bg-kavach-cyan data-[state=active]:text-black data-[state=active]:shadow-[0_0_16px_rgba(0,240,255,0.3)] px-6 py-2.5 rounded-xl font-semibold transition-all"
          >
            <Clock size={14} />
            Upcoming
            {upcomingEvents.length > 0 && (
              <span className="ml-1 px-1.5 py-0.5 rounded-md bg-black/20 text-xs font-bold">
                {upcomingEvents.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="past" 
            className="flex items-center gap-2 data-[state=active]:bg-kavach-cyan data-[state=active]:text-black data-[state=active]:shadow-[0_0_16px_rgba(0,240,255,0.3)] px-6 py-2.5 rounded-xl font-semibold transition-all"
          >
            <Archive size={14} />
            Past
          </TabsTrigger>
          <TabsTrigger 
            value="all" 
            className="flex items-center gap-2 data-[state=active]:bg-kavach-cyan data-[state=active]:text-black data-[state=active]:shadow-[0_0_16px_rgba(0,240,255,0.3)] px-6 py-2.5 rounded-xl font-semibold transition-all"
          >
            <Calendar size={14} />
            All
          </TabsTrigger>
        </TabsList>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <TabsContent value="upcoming">
          <EventGrid events={upcomingEvents} emptyIcon="🗓️" emptyTitle="No upcoming events" emptyDesc="We are planning our next event — follow our socials to stay updated!" />
        </TabsContent>
        
        <TabsContent value="past">
          <EventGrid events={pastEvents} emptyIcon="📦" emptyTitle="No past events yet" emptyDesc="Check back after our first event!" />
        </TabsContent>
        
        <TabsContent value="all">
          <EventGrid events={initialEvents} emptyIcon="📅" emptyTitle="No events found" emptyDesc="Events will appear here once they are published." />
        </TabsContent>
      </motion.div>
    </Tabs>
  );
}

function EventGrid({ events, emptyIcon, emptyTitle, emptyDesc }: { events: any[], emptyIcon: string, emptyTitle: string, emptyDesc: string }) {
  if (events.length === 0) {
    return (
      <div className="cyber-empty-state py-28 text-center">
        <div className="text-6xl mb-5">{emptyIcon}</div>
        <h3 className="text-2xl font-black text-white mb-3">{emptyTitle}</h3>
        <p className="text-slate-400 max-w-xs mx-auto">{emptyDesc}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
