import { Metadata } from 'next';
import BlogList from './BlogList';
import { BookOpen } from 'lucide-react';

export const revalidate = 0;

export const metadata: Metadata = {
  title: 'Blog & Research — K.A.V.A.C.H. Cybersecurity Club',
  description: 'Read the latest writeups, tutorials, and security research from K.A.V.A.C.H. members.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchAllBlogs() {
  try {
    const res = await fetch(`${API_BASE}/blog?limit=100&published=true`, { cache: 'no-store' });
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.posts || [];
  } catch (error) {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await fetchAllBlogs();

  return (
    <main className="min-h-screen">
      {/* ─── Page Header ─── */}
      <div className="page-header-gradient pt-36 pb-20 relative">
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]" style={{ backgroundImage: 'linear-gradient(rgba(0,240,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,240,255,1) 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        <div className="ambient-cyan w-[500px] h-[300px] top-0 left-1/2 -translate-x-1/2 opacity-40" />
        <div className="ambient-violet w-[300px] h-[200px] bottom-0 right-0 opacity-30" />

        <div className="container mx-auto px-4 relative z-10 text-center max-w-3xl">
          <span className="cyber-badge mx-auto mb-6 w-fit">
            <BookOpen size={12} />
            Knowledge Base
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-white mb-5 leading-tight">
            Insights &amp; <span className="text-gradient">Research</span>
          </h1>
          <p className="text-lg text-slate-400">
            Writeups, tutorials, and security research published by the K.A.V.A.C.H. team.
          </p>
        </div>
      </div>

      <div className="section-divider-cyan" />

      {/* ─── Content ─── */}
      <section className="section-dark py-16">
        <div className="container mx-auto px-4">
          <BlogList initialPosts={posts} />
        </div>
      </section>
    </main>
  );
}
