import { Metadata } from 'next';
import BlogList from './BlogList';

export const revalidate = 1800; // 30 minutes

export const metadata: Metadata = {
  title: 'Blog & Research — Kavach Cybersecurity Club',
  description: 'Read the latest writeups, tutorials, and security research from Kavach members.',
};

const API_BASE = process.env.NEXT_PUBLIC_API_URL + '/api/v1';

async function fetchAllBlogs() {
  try {
    // Fetch a large limit to allow client-side filtering and pagination easily
    const res = await fetch(`${API_BASE}/blog?limit=100&published=true`, { next: { revalidate: 1800 } });
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
    <main className="min-h-screen pt-32 pb-24">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Insights & Research
          </h1>
          <p className="text-lg text-gray-400">
            Writeups, tutorials, and security research published by the Kavach team.
          </p>
        </div>

        <BlogList initialPosts={posts} />
      </div>
    </main>
  );
}
