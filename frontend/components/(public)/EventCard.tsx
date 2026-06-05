import Link from "next/link";
import Image from "next/image";
import { Calendar, MapPin, Video } from "lucide-react";

interface EventCardProps {
  event: {
    id: string;
    title: string;
    slug: string;
    description: string;
    date: string | Date;
    location?: string;
    isOnline?: boolean;
    imageUrl?: string;
  };
}

export default function EventCard({ event }: EventCardProps) {
  const eventDate = new Date(event.date);
  const month = eventDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const day = eventDate.getDate();

  return (
    <Link href={`/events/${event.slug}`} className="group block h-full">
      <div className="flex flex-col h-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden transition-all duration-300 hover:border-kavach-cyan/50 hover:shadow-[0_0_30px_rgba(0,240,255,0.1)] hover:-translate-y-1">
        
        {/* Cover Image */}
        <div className="relative w-full h-48 bg-zinc-900 overflow-hidden">
          {event.imageUrl ? (
            <Image 
              src={event.imageUrl}
              alt={event.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-kavach-cyan/20 to-purple-500/20" />
          )}
          
          {/* Date Badge overlay */}
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur-md border border-white/10 rounded-xl px-3 py-2 flex flex-col items-center justify-center min-w-[3rem]">
            <span className="text-xs font-bold text-kavach-cyan">{month}</span>
            <span className="text-xl font-bold text-white">{day}</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-kavach-cyan transition-colors">
            {event.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
            {event.description}
          </p>

          <div className="flex items-center text-xs text-gray-500 mt-auto">
            {event.isOnline ? (
              <div className="flex items-center gap-1.5">
                <Video size={14} className="text-green-400" />
                <span>Online Event</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <MapPin size={14} className="text-purple-400" />
                <span className="truncate max-w-[200px]">{event.location || 'TBA'}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
