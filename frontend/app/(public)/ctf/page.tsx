import { Metadata } from 'next';
import CTFDashboard from './CTFDashboard';

export const revalidate = 60; // Refresh more often for CTF (1 minute)

export const metadata: Metadata = {
  title: 'CTF Dashboard — Kavach Cybersecurity Club',
  description: 'Participate in Capture The Flag challenges to learn ethical hacking and win prizes.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

async function fetchChallenges() {
  try {
    const res = await fetch(`${API_BASE}/ctf/challenges?active=true`, { next: { revalidate: 60 } });
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
    <main className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Capture The Flag
          </h1>
          <p className="text-lg text-gray-400">
            Hack, learn, and climb the leaderboard. Our continuous CTF platform is open to all students.
          </p>
        </div>

        <CTFDashboard initialChallenges={challenges} />
      </div>
    </main>
  );
}
