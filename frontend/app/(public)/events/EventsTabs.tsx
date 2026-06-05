"use client";

import { useState } from "react";
import EventCard from "@/components/(public)/EventCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function EventsTabs({ initialEvents }: { initialEvents: any[] }) {
  const [mounted, setMounted] = useState(false);
  
  // To avoid hydration mismatch on dates, we just render after mount
  useState(() => {
    setMounted(true);
  });

  const now = new Date();
  const upcomingEvents = initialEvents.filter((e) => new Date(e.date) >= now);
  const pastEvents = initialEvents.filter((e) => new Date(e.date) < now);

  if (!mounted) return null;

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <div className="flex justify-center mb-12">
        <TabsList className="bg-white/5 border border-white/10 p-1">
          <TabsTrigger value="upcoming" className="data-[state=active]:bg-kavach-cyan data-[state=active]:text-black px-8">
            Upcoming
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-kavach-cyan data-[state=active]:text-black px-8">
            Past
          </TabsTrigger>
          <TabsTrigger value="all" className="data-[state=active]:bg-kavach-cyan data-[state=active]:text-black px-8">
            All
          </TabsTrigger>
        </TabsList>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
        <TabsContent value="upcoming">
          <EventGrid events={upcomingEvents} />
        </TabsContent>
        
        <TabsContent value="past">
          <EventGrid events={pastEvents} />
        </TabsContent>
        
        <TabsContent value="all">
          <EventGrid events={initialEvents} />
        </TabsContent>
      </motion.div>
    </Tabs>
  );
}

function EventGrid({ events }: { events: any[] }) {
  if (events.length === 0) {
    return (
      <div className="py-24 text-center border border-white/5 rounded-2xl bg-white/5">
        <h3 className="text-xl font-bold text-white mb-2">No events found</h3>
        <p className="text-gray-400">Check back later for new events!</p>
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
