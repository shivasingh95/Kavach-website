import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";

interface BlogCardProps {
  post: {
    id: string;
    title: string;
    slug: string;
    excerpt: string;
    coverImage?: string;
    authorName?: string;
    readTime?: number;
    tags?: string[];
    publishedAt?: string | Date;
  };
}

export default function BlogCard({ post }: BlogCardProps) {
  const publishDate = post.publishedAt ? new Date(post.publishedAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : 'Draft';

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <div className="flex flex-col h-full rounded-2xl bg-[#0a0a0a] border border-white/5 overflow-hidden transition-all duration-300 hover:border-purple-500/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.1)] hover:-translate-y-1">
        
        {/* Cover Image */}
        <div className="relative w-full h-48 bg-zinc-900 overflow-hidden">
          {post.coverImage ? (
            <Image 
              src={post.coverImage}
              alt={post.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-kavach-cyan/20" />
          )}
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col flex-grow">
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags?.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2.5 py-1 text-[10px] font-bold tracking-wider text-purple-300 bg-purple-500/10 rounded-full uppercase">
                {tag}
              </span>
            ))}
          </div>

          <h3 className="text-xl font-bold text-white mb-3 line-clamp-2 group-hover:text-purple-400 transition-colors">
            {post.title}
          </h3>
          
          <p className="text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">
            {post.excerpt}
          </p>

          <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-4 border-t border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center text-white/70">
                {post.authorName?.[0]?.toUpperCase() || '?'}
              </div>
              <span>{post.authorName || 'Anonymous'}</span>
            </div>
            
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1"><Clock size={12} /> {post.readTime || 5} min read</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
