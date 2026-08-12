import { Metadata } from 'next';
import EventsTabs from './EventsTabs';
import { Calendar } from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Events — K.A.V.A.C.H. Cybersecurity Club',
  description: 'Join our workshops, hackathons, and guest lectures to level up your cybersecurity skills.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchEvents() {
  try {
    const res = await fetch(`${API_BASE}/events?published=true`, { cache: 'no-store' });
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
    <main className="min-h-screen">
      {/* ─── Page Header ─── */}
      <div className="page-header-gradient pt-36 pb-20 relative">
        {/* Decorative grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="ambient-cyan w-[500px] h-[300px] top-0 left-1/2 -translate-x-1/2 opacity-40" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="cyber-badge mx-auto mb-6 w-fit">
            <Calendar size={12} />
            Community Events
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight">
            Events &amp; <span className="text-gradient">Workshops</span>
          </h1>
          <p className="text-lg text-slate-400">
            Level up your skills with our regular CTFs, guest lectures, and hands-on workshops.
          </p>
        </div>
      </div>

      <div className="section-divider-cyan" />

      {/* ─── Content ─── */}
      <section className="section-dark py-16">
        <div className="container mx-auto px-4">
          <EventsTabs initialEvents={events} />
        </div>
      </section>
    </main>
  );
}
