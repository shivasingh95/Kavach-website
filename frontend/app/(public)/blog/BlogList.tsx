"use client";

import { useState, useMemo } from "react";
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
  useMemo(() => setCurrentPage(1), [activeCategory, searchQuery]);

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
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeCategory === cat 
                  ? "bg-kavach-cyan text-black" 
                  : "bg-white/5 text-gray-400 hover:text-white hover:bg-white/10"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500">
            <Search size={18} />
          </div>
          <input
            type="text"
            placeholder="Search articles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-kavach-cyan transition-colors"
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
        <div className="py-24 text-center border border-white/5 rounded-2xl bg-white/5 mb-12">
          <h3 className="text-xl font-bold text-white mb-2">No posts found</h3>
          <p className="text-gray-400">Try adjusting your search or category filter.</p>
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
