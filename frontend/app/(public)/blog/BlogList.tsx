"use client";

import { useState, useMemo, useEffect } from "react";
import { Search } from "lucide-react";
import BlogCard from "@/components/(public)/BlogCard";

const CATEGORIES = ["All", "Research", "Tutorial", "Writeup", "News"];
const POSTS_PER_PAGE = 12;

export default function BlogList({ initialPosts }: { initialPosts: any[] }) {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const filteredPosts = useMemo(() => {
    return initialPosts.filter((post) => {
      // Category filter (Assuming tags contain the category or there's a category field)
      // Since backend model uses `tags`, we'll check if the activeCategory is in tags, or if 'All' is selected.
      const matchesCategory = activeCategory === "All" || 
        post.tags?.some((t: string) => t.toLowerCase() === activeCategory.toLowerCase());
      
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        post.title.toLowerCase().includes(query) || 
        post.excerpt?.toLowerCase().includes(query) ||
        post.tags?.some((t: string) => t.toLowerCase().includes(query));

      return matchesCategory && matchesSearch;
    });
  }, [initialPosts, activeCategory, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / POSTS_PER_PAGE));
  
  const paginatedPosts = useMemo(() => {
    const start = (currentPage - 1) * POSTS_PER_PAGE;
    return filteredPosts.slice(start, start + POSTS_PER_PAGE);
  }, [filteredPosts, currentPage]);

  // Reset to page 1 on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [activeCategory, searchQuery]);

  return (
    <div>
      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-12">
        {/* Categories */}
        <div className="flex flex-wrap justify-center gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                activeCategory === cat
                  ? "bg-kavach-cyan text-black shadow-[0_0_16px_rgba(0,240,255,0.35)]"
                  : "bg-white/[0.05] border border-white/10 text-slate-400 hover:text-white hover:border-kavach-cyan/30 hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search size={16} />
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full gradient-border-card py-2.5 pl-10 pr-4 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-kavach-cyan/50 transition-all"
            style={{ background: 'rgba(13,18,36,0.8)', border: '1px solid rgba(0,240,255,0.12)', borderRadius: '12px' }}
          />
        </div>
      </div>

      {/* Grid */}
      {paginatedPosts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {paginatedPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <div className="cyber-empty-state py-28 text-center mb-12">
          <div className="text-6xl mb-5">🔍</div>
          <h3 className="text-2xl font-black text-white mb-3">No posts found</h3>
          <p className="text-slate-400 max-w-xs mx-auto">Try adjusting your search or selecting a different category.</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(p => p - 1)}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Previous
          </button>
          <span className="text-gray-500 px-4">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(p => p + 1)}
            className="px-4 py-2 rounded-lg bg-white/5 text-gray-300 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/10 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
