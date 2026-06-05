import { Metadata } from 'next';
import EventsTabs from './EventsTabs';

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Events — Kavach Cybersecurity Club',
  description: 'Join our workshops, hackathons, and guest lectures to level up your cybersecurity skills.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events?published=true`, { next: { revalidate: 1800 } });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.events;
  } catch (error) {
    return [];
  }
}

export default async function EventsPage() {
  const events = await fetchEvents();

  return (
    <main className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Events & Workshops
          </h1>
          <p className="text-lg text-gray-400">
            Level up your skills with our regular CTFs, guest lectures, and hands-on workshops.
          </p>
        </div>

        {/* Client-side Tabs */}
        <EventsTabs initialEvents={events} />
      </div>
    </main>
  );
}
