import { Metadata } from 'next';
import CTFDashboard from './CTFDashboard';
import { Terminal } from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'CTF Dashboard — K.A.V.A.C.H. Cybersecurity Club',
  description: 'Participate in Capture The Flag challenges to learn ethical hacking and win prizes.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchChallenges() {
  try {
    const res = await fetch(`${API_BASE}/ctf/challenges?active=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.challenges || [];
  } catch (error) {
    return [];
  }
}

export default async function CTFPage() {
  const challenges = await fetchChallenges();

  return (
    <main className="min-h-screen">
      {/* ─── Page Header — neon green/cyan cyber feel ─── */}
      <div className="pt-36 pb-20 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #040d10 0%, #050816 100%)' }}>
        {/* Decorative grid */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        {/* Center glow — green tinted */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none" style={{ background: 'radial-gradient(ellipse, rgba(6,214,160,0.12) 0%, rgba(0,240,255,0.06) 50%, transparent 70%)', filter: 'blur(40px)' }} />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="cyber-badge mx-auto mb-6 w-fit" style={{ borderColor: 'rgba(6,214,160,0.3)', background: 'rgba(6,214,160,0.07)', color: '#06d6a0' }}>
            <Terminal size={12} />
            Live Platform
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight">
            Capture <span className="text-gradient">The Flag</span>
          </h1>
          <p className="text-lg text-slate-400">
            Hack, learn, and climb the leaderboard. Our continuous CTF platform is open to all students.
          </p>
        </div>
      </div>

      <div className="section-divider-cyan" />

      {/* ─── Dashboard ─── */}
      <section className="section-dark py-16">
        <div className="container mx-auto px-4">
          <CTFDashboard initialChallenges={challenges} />
        </div>
      </section>
    </main>
  );
}
