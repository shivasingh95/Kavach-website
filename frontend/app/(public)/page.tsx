import { Metadata } from 'next';
import Link from 'next/link';
import HeroSection from '@/components/(public)/HeroSection';
import StatsCounter from '@/components/(public)/StatsCounter';
import EventCard from '@/components/(public)/EventCard';
import BlogCard from '@/components/(public)/BlogCard';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'K.A.V.A.C.H. — Cybersecurity Club | Defend. Learn. Hack.',
  description: 'Join K.A.V.A.C.H., the premier cybersecurity club for ethical hackers, security researchers, and developers.',
  openGraph: {
    title: 'K.A.V.A.C.H. — Cybersecurity Club',
    description: 'We hack. We defend. We innovate.',
    type: 'website',
  },
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchStats() {
  try {
    const res = await fetch(`${API_BASE}/analytics/public`, { cache: 'no-store' });
    if (!res.ok) return { members: 0, challenges: 0, events: 0, achievements: 0 };
    const json = await res.json();
    return json.data;
  } catch (error) {
    return { members: 0, challenges: 0, events: 0, achievements: 0 };
  }
}

async function fetchFeaturedEvents() {
  try {
    const res = await fetch(`${API_BASE}/events?limit=3&upcoming=true&published=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.events;
  } catch (error) {
    return [];
  }
}

async function fetchLeaderboard() {
  try {
    const res = await fetch(`${API_BASE}/ctf/leaderboard?limit=5`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.leaderboard;
  } catch (error) {
    return [];
  }
}

async function fetchLatestBlogs() {
  try {
    const res = await fetch(`${API_BASE}/blog?limit=3&published=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.posts;
  } catch (error) {
    return [];
  }
}

export default async function HomePage() {
  const [stats, events, leaderboard, blogs] = await Promise.all([
    fetchStats(),
    fetchFeaturedEvents(),
    fetchLeaderboard(),
    fetchLatestBlogs()
  ]);

  return (
    <main className="min-h-screen">
      {/* 1. HERO SECTION */}
      <HeroSection />

      {/* 2. STATS BAR */}
      <StatsCounter stats={stats} />

      {/* ─── Divider ─── */}
      <div className="section-divider-cyan" />

      {/* 3. FEATURED EVENTS */}
      <section className="section-cyan-glow py-28 relative overflow-hidden">
        <div className="ambient-cyan w-[500px] h-[400px] top-[-100px] left-[-100px] opacity-60" />
        <div className="ambient-violet w-[300px] h-[300px] bottom-0 right-0 opacity-40" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14">
            <div>
              <span className="cyber-badge mb-4 inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-kavach-cyan animate-pulse" />
                Schedule
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                Upcoming <span className="text-gradient">Events</span>
              </h2>
              <p className="text-slate-400 max-w-xl">Join our workshops, hackathons, and guest lectures to level up your skills.</p>
            </div>
            <Link href="/events" className="text-kavach-cyan hover:text-cyan-300 font-semibold mt-6 md:mt-0 flex items-center gap-2 group text-sm tracking-wide">
              View all events
              <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="cyber-empty-state py-20 text-center">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-white mb-2">No upcoming events</h3>
              <p className="text-slate-400">Check back soon — events are being planned!</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="section-divider-violet" />

      {/* 4. LEADERBOARD PREVIEW */}
      <section className="section-violet-glow py-28 relative overflow-hidden">
        <div className="ambient-violet w-[500px] h-[400px] top-[-80px] right-[-80px] opacity-70" />
        <div className="ambient-cyan w-[200px] h-[200px] bottom-0 left-20 opacity-30" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14">
            <div>
              <span className="cyber-badge mb-4 inline-flex" style={{ borderColor: 'rgba(167,139,250,0.3)', background: 'rgba(124,58,237,0.08)', color: '#a78bfa' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                Leaderboard
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                Top <span className="text-neon-violet">Hackers</span>
              </h2>
              <p className="text-slate-400 max-w-xl">The best of the best on our CTF platform.</p>
            </div>
            <Link href="/ctf" className="text-purple-400 hover:text-purple-300 font-semibold mt-6 md:mt-0 flex items-center gap-2 group text-sm tracking-wide">
              View full leaderboard
              <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </Link>
          </div>

          <div className="gradient-border-card overflow-hidden" style={{ borderColor: 'rgba(124,58,237,0.2)' }}>
            <div className="bg-white/[0.02] px-6 py-3 border-b border-white/5 flex items-center gap-2">
              <span className="text-yellow-400 text-lg">🏆</span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest">Current Season Rankings</span>
            </div>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-slate-500 text-xs uppercase tracking-widest">
                  <th className="px-6 py-4 font-medium">Rank</th>
                  <th className="px-6 py-4 font-medium">Hacker</th>
                  <th className="px-6 py-4 font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {leaderboard.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/[0.03] transition-colors group">
                    <td className="px-6 py-4">
                      <span className={`font-black text-lg ${
                        user.rank === 1 ? 'text-yellow-400' :
                        user.rank === 2 ? 'text-slate-300' :
                        user.rank === 3 ? 'text-amber-600' : 'text-slate-600'
                      }`}>
                        {user.rank === 1 ? '🥇' : user.rank === 2 ? '🥈' : user.rank === 3 ? '🥉' : `#${user.rank}`}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-kavach-cyan/20 to-kavach-violet/20 border border-white/10 flex items-center justify-center text-xs font-black text-kavach-cyan">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-semibold text-white group-hover:text-kavach-cyan transition-colors">{user.name}</span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono font-bold text-kavach-cyan text-sm">
                      {user.totalPoints.toLocaleString()} pts
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-16 text-center">
                      <div className="text-4xl mb-3">🎯</div>
                      <p className="text-slate-500 font-medium">No rankings yet — be the first to solve a challenge!</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="section-divider-cyan" />

      {/* 5. LATEST BLOG */}
      <section className="section-cyan-glow py-28 relative overflow-hidden">
        <div className="ambient-cyan w-[400px] h-[400px] top-0 right-0 opacity-50" />
        <div className="ambient-violet w-[250px] h-[250px] bottom-0 left-0 opacity-35" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-end mb-14">
            <div>
              <span className="cyber-badge mb-4 inline-flex">
                <span className="w-1.5 h-1.5 rounded-full bg-kavach-cyan animate-pulse" />
                Research &amp; Writeups
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-white mb-3 leading-tight">
                Latest <span className="text-gradient">Insights</span>
              </h2>
              <p className="text-slate-400 max-w-xl">Writeups, tutorials, and security research from our members.</p>
            </div>
            <Link href="/blog" className="text-kavach-cyan hover:text-cyan-300 font-semibold mt-6 md:mt-0 flex items-center gap-2 group text-sm tracking-wide">
              Read all posts
              <span className="transition-transform group-hover:translate-x-1.5">→</span>
            </Link>
          </div>

          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((post: any) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="cyber-empty-state py-20 text-center">
              <div className="text-5xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-white mb-2">No blog posts yet</h3>
              <p className="text-slate-400">Our members are writing up their research — stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* ─── Divider ─── */}
      <div className="section-divider-violet" />

      {/* 6. JOIN CTA */}
      <section className="py-36 relative overflow-hidden" style={{ background: 'linear-gradient(180deg, #0d0a1e 0%, #050816 100%)' }}>
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-[700px] h-[400px] rounded-full opacity-30" style={{ background: 'radial-gradient(ellipse, rgba(0,240,255,0.2) 0%, rgba(124,58,237,0.1) 50%, transparent 70%)', filter: 'blur(60px)' }} />
        </div>
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <div className="cyber-badge mx-auto mb-8 w-fit">
            <span className="w-1.5 h-1.5 rounded-full bg-kavach-cyan animate-pulse" />
            Season 2026 Open
          </div>
          <h2 className="text-5xl md:text-7xl font-black text-white mb-6 leading-tight">
            Ready to join<br /><span className="text-gradient">the ranks?</span>
          </h2>
          <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto">
            Whether you are a complete beginner or a seasoned pro, there is a place for you in K.A.V.A.C.H.
          </p>
          <Link href="/join" className="btn-primary text-lg px-12 py-5 rounded-2xl">
            Apply to Join →
          </Link>
        </div>
      </section>
    </main>
  );
}
