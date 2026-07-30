import { Metadata } from 'next';
import Link from 'next/link';
import HeroSection from '@/components/(public)/HeroSection';
import StatsCounter from '@/components/(public)/StatsCounter';
import EventCard from '@/components/(public)/EventCard';
import BlogCard from '@/components/(public)/BlogCard';

export const revalidate = 0; // Disable caching to show admin updates immediately

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

      {/* 3. FEATURED EVENTS */}
      <section className="py-24 bg-[#050505]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Upcoming Events</h2>
              <p className="text-gray-400 max-w-xl text-lg">Join our workshops, hackathons, and guest lectures to level up your skills.</p>
            </div>
            <Link href="/events" className="text-kavach-cyan hover:text-cyan-400 font-semibold mt-4 md:mt-0 flex items-center gap-2 group">
              View all events 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          
          {events.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event: any) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-white/5 rounded-2xl bg-white/5">
              <p className="text-gray-400">No upcoming events at the moment. Stay tuned!</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. LEADERBOARD PREVIEW */}
      <section className="py-24 bg-black border-y border-white/5">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Top Hackers</h2>
              <p className="text-gray-400 max-w-xl text-lg">The best of the best on our CTF platform.</p>
            </div>
            <Link href="/ctf" className="text-purple-400 hover:text-purple-300 font-semibold mt-4 md:mt-0 flex items-center gap-2 group">
              View full leaderboard 
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>

          <div className="bg-[#0a0a0a] border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/5 text-gray-400 text-sm uppercase tracking-wider">
                  <th className="p-4 font-medium">Rank</th>
                  <th className="p-4 font-medium">Hacker</th>
                  <th className="p-4 font-medium text-right">Points</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {leaderboard.map((user: any) => (
                  <tr key={user.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <span className={`font-bold text-lg ${user.rank === 1 ? 'text-yellow-400' : user.rank === 2 ? 'text-gray-300' : user.rank === 3 ? 'text-amber-600' : 'text-gray-500'}`}>
                        #{user.rank}
                      </span>
                    </td>
                    <td className="p-4 flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-zinc-800 flex items-center justify-center text-xs font-bold text-white/50">
                        {user.name.substring(0, 2).toUpperCase()}
                      </div>
                      <span className="font-medium text-white">{user.name}</span>
                    </td>
                    <td className="p-4 text-right font-mono font-bold text-kavach-cyan">
                      {user.totalPoints}
                    </td>
                  </tr>
                ))}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">No data available yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 5. LATEST BLOG */}
      <section className="py-24 bg-[#050505]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Latest Insights</h2>
              <p className="text-gray-400 max-w-xl text-lg">Writeups, tutorials, and security research from our members.</p>
            </div>
            <Link href="/blog" className="text-kavach-cyan hover:text-cyan-400 font-semibold mt-4 md:mt-0 flex items-center gap-2 group">
              Read all posts
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
          
          {blogs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogs.map((post: any) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          ) : (
            <div className="py-12 text-center border border-white/5 rounded-2xl bg-white/5">
              <p className="text-gray-400">No blog posts available yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* 6. JOIN CTA */}
      <section className="py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-kavach-cyan/5 to-purple-500/10 z-0" />
        <div className="container relative z-10 mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl md:text-6xl font-bold text-white mb-6">Ready to join the ranks?</h2>
          <p className="text-xl text-gray-400 mb-10">
            Whether you are a complete beginner or a seasoned pro, there is a place for you in K.A.V.A.C.H. Learn, build, and defend with us.
          </p>
          <Link 
            href="/join"
            className="inline-block px-10 py-5 bg-white text-black font-bold rounded-xl hover:bg-gray-200 transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)]"
          >
            Apply to Join
          </Link>
        </div>
      </section>
    </main>
  );
}
