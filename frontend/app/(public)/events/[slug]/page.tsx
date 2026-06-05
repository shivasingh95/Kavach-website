import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Calendar, MapPin, Video, Users, ArrowLeft } from 'lucide-react';
import MarkdownRenderer from '@/components/(public)/MarkdownRenderer';
import RSVPButton, { RSVPShareButtons } from './RSVPButton';

export const revalidate = 3600;

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

async function fetchEvent(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/events/${slug}`, { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.event;
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/events?limit=20&published=true`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.events.map((event: any) => ({
      slug: event.slug,
    }));
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const event = await fetchEvent(params.slug);
  if (!event) return { title: 'Event Not Found' };

  return {
    title: `${event.title} — Kavach Cybersecurity Club`,
    description: event.description,
    openGraph: {
      title: event.title,
      description: event.description,
      images: event.imageUrl ? [event.imageUrl] : [],
    },
  };
}

export default async function EventDetailPage({ params }: { params: { slug: string } }) {
  const event = await fetchEvent(params.slug);

  if (!event) {
    return (
      <main className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Event Not Found</h1>
          <p className="text-gray-400 mb-8">The event you are looking for does not exist or has been removed.</p>
          <Link href="/events" className="text-kavach-cyan hover:underline">
            ← Back to all events
          </Link>
        </div>
      </main>
    );
  }

  const startDate = new Date(event.date);
  const isPast = startDate < new Date();

  return (
    <main className="min-h-screen pb-24">
      {/* Cover Image */}
      <div className="relative w-full h-[40vh] max-h-[400px] bg-zinc-900 border-b border-white/10">
        {event.imageUrl ? (
          <Image 
            src={event.imageUrl}
            alt={event.title}
            fill
            priority
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-kavach-cyan/20 to-purple-500/20" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
      </div>

      <div className="container mx-auto px-4 -mt-32 relative z-10">
        <Link href="/events" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6">
          <ArrowLeft size={16} /> Back to events
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-8 mb-8">
              <div className="flex flex-wrap gap-2 mb-4">
                {isPast && (
                  <span className="px-3 py-1 bg-white/10 text-gray-300 rounded-full text-xs font-bold tracking-wider uppercase">
                    Past Event
                  </span>
                )}
                {event.isOnline ? (
                  <span className="px-3 py-1 bg-green-500/10 text-green-400 rounded-full text-xs font-bold tracking-wider uppercase">
                    Online
                  </span>
                ) : (
                  <span className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold tracking-wider uppercase">
                    In-Person
                  </span>
                )}
              </div>

              <h1 className="text-3xl md:text-5xl font-bold text-white mb-6">
                {event.title}
              </h1>

              <div className="flex flex-col sm:flex-row gap-6 mb-8 pb-8 border-b border-white/5">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-kavach-cyan">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {startDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                    </p>
                    <p className="text-sm text-gray-400">
                      {startDate.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      {event.endDate && ` - ${new Date(event.endDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="p-2 bg-white/5 rounded-lg text-purple-400">
                    {event.isOnline ? <Video size={20} /> : <MapPin size={20} />}
                  </div>
                  <div>
                    <p className="text-white font-medium">
                      {event.isOnline ? 'Online Meeting' : 'Location'}
                    </p>
                    <p className="text-sm text-gray-400 max-w-[200px] truncate">
                      {event.location || event.meetLink || 'TBA'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Markdown Content */}
              <div className="mt-8">
                <MarkdownRenderer content={event.content || event.description} />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-6 sticky top-24">
              <h3 className="text-xl font-bold text-white mb-4">Registration</h3>
              
              <div className="flex items-center gap-3 mb-6 p-4 bg-white/5 rounded-xl border border-white/5">
                <Users className="text-kavach-cyan" size={24} />
                <div>
                  <p className="text-2xl font-bold text-white">{event.rsvpCount || 0}</p>
                  <p className="text-xs text-gray-400 uppercase tracking-wider font-medium">Attending</p>
                </div>
              </div>

              <RSVPButton eventId={event.id} isPast={isPast} />

              <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="text-sm font-bold text-white mb-4">Share this event</h4>
                <div className="flex gap-3">
                  <RSVPShareButtons title={event.title} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}


