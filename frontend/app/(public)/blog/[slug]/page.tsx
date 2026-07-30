import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, Calendar } from 'lucide-react';
import MarkdownRenderer from '@/components/(public)/MarkdownRenderer';
import ReadingProgressBar from './ReadingProgressBar';

export const revalidate = 0;

const API_BASE = process.env.NEXT_PUBLIC_API_URL;

async function fetchPost(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/blog/${slug}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data.post;
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const res = await fetch(`${API_BASE}/blog?limit=30&published=true`);
    if (!res.ok) return [];
    const json = await res.json();
    return json.data.posts.map((post: any) => ({
      slug: post.slug,
    }));
  } catch (error) {
    return [];
  }
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = await fetchPost(params.slug);
  if (!post) return { title: 'Post Not Found' };

  return {
    title: `${post.title} — K.A.V.A.C.H. Blog`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.coverImage ? [post.coverImage] : [],
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.authorName],
    },
  };
}

export default async function BlogDetailPage({ params }: { params: { slug: string } }) {
  const post = await fetchPost(params.slug);

  if (!post) {
    return (
      <main className="min-h-screen pt-32 pb-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Post Not Found</h1>
          <p className="text-gray-400 mb-8">The article you are looking for does not exist or has been removed.</p>
          <Link href="/blog" className="text-purple-400 hover:underline">
            ← Back to all posts
          </Link>
        </div>
      </main>
    );
  }

  const publishDate = post.publishedAt 
    ? new Date(post.publishedAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'Draft';

  return (
    <>
      <ReadingProgressBar />
      <main className="min-h-screen pt-32 pb-24">
        <div className="container mx-auto px-4 max-w-4xl">
          <Link href="/blog" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8">
            <ArrowLeft size={16} /> Back to posts
          </Link>

          {/* Header */}
          <header className="mb-12">
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags?.map((tag: string, idx: number) => (
                <span key={idx} className="px-3 py-1 bg-purple-500/10 text-purple-400 rounded-full text-xs font-bold tracking-wider uppercase border border-purple-500/20">
                  {tag}
                </span>
              ))}
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-8 leading-tight">
              {post.title}
            </h1>

            <div className="flex items-center gap-6 text-gray-400 border-y border-white/5 py-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white/70 font-bold border border-white/10">
                  {post.authorName?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <p className="text-white font-medium">{post.authorName || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">Author</p>
                </div>
              </div>
              
              <div className="h-10 w-px bg-white/10" />
              
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar size={14} /> <span>{publishDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock size={14} /> <span>{post.readTime || 5} min read</span>
                </div>
              </div>
            </div>
          </header>

          {/* Cover Image */}
          {post.coverImage && (
            <div className="relative w-full h-[400px] mb-16 rounded-3xl overflow-hidden border border-white/10">
              <Image 
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                className="object-cover"
              />
            </div>
          )}

          {/* Content */}
          <article className="bg-[#0a0a0a] rounded-3xl border border-white/5 p-6 md:p-12 mb-16">
            <MarkdownRenderer content={post.content} />
          </article>
        </div>
      </main>
    </>
  );
}
