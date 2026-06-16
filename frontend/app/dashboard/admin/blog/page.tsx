"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import {
  Plus, Search, Edit2, Trash2, Eye, ToggleLeft, ToggleRight,
  Loader2, AlertTriangle, ImageOff, ChevronLeft, ChevronRight,
  FileText, TrendingUp, Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  slug?: string;
  excerpt?: string;
  category?: string;
  coverImage?: string;
  author?: { id: string; name: string; email: string };
  isPublished: boolean;
  views?: number;
  publishedAt?: string;
  createdAt: string;
}

type SortField = "createdAt" | "views" | "title";
type SortDir = "asc" | "desc";

const CATEGORIES = ["Technology", "Security", "CTF", "Tutorial", "News", "Event", "Research"];
const PAGE_SIZE = 10;

// ─── Shared Styles ────────────────────────────────────────────────────────────
const inputCls =
  "rounded-xl border border-white/10 bg-[#0d1224] px-3 py-2 text-sm " +
  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)] " +
  "focus:outline-none focus:border-kavach-cyan/30 transition-colors";

// ─── Delete Dialog ────────────────────────────────────────────────────────────
function DeleteDialog({
  post, onConfirm, onClose, isDeleting,
}: { post: BlogPost | null; onConfirm: () => void; onClose: () => void; isDeleting: boolean }) {
  if (!post) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={22} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">Delete Post?</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              "<span className="font-semibold text-[var(--text-primary)]">{post.title}</span>" will be permanently deleted.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button variant="ghost" onClick={onClose} disabled={isDeleting}
              className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]">Cancel</Button>
            <Button onClick={onConfirm} disabled={isDeleting}
              className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-2">
              {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton Row ─────────────────────────────────────────────────────────────
function SkeletonRow() {
  return (
    <tr className="border-b border-white/[0.04] animate-pulse">
      <td className="px-4 py-3"><div className="w-12 h-9 rounded-lg bg-white/5" /></td>
      <td className="px-4 py-3"><div className="h-3 w-44 bg-white/5 rounded mb-1.5" /><div className="h-2.5 w-24 bg-white/5 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-white/5 rounded" /></td>
      <td className="px-4 py-3"><div className="h-5 w-20 rounded-full bg-white/5" /></td>
      <td className="px-4 py-3"><div className="h-5 w-16 rounded-full bg-white/5" /></td>
      <td className="px-4 py-3"><div className="h-3 w-12 bg-white/5 rounded" /></td>
      <td className="px-4 py-3"><div className="h-3 w-20 bg-white/5 rounded" /></td>
      <td className="px-4 py-3"><div className="flex gap-2"><div className="h-7 w-7 rounded-lg bg-white/5" /><div className="h-7 w-7 rounded-lg bg-white/5" /><div className="h-7 w-7 rounded-lg bg-white/5" /></div></td>
    </tr>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function AdminBlogPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<BlogPost | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) { toast.error("Admin access required."); router.replace("/dashboard"); }
  }, [authLoading, isAdmin, router]);

  const fetchPosts = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/blog");
      setPosts(res.data?.data?.posts ?? res.data?.posts ?? []);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to load blog posts");
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);
  useEffect(() => { setPage(1); }, [search, categoryFilter, sortField, sortDir]);

  const filtered = useMemo(() => {
    let data = [...posts];
    if (search.trim()) { const q = search.toLowerCase(); data = data.filter(p => p.title.toLowerCase().includes(q) || p.excerpt?.toLowerCase().includes(q)); }
    if (categoryFilter !== "all") data = data.filter(p => p.category === categoryFilter);
    data.sort((a, b) => {
      let av: any = sortField === "views" ? (a.views ?? 0) : sortField === "title" ? a.title : a.createdAt;
      let bv: any = sortField === "views" ? (b.views ?? 0) : sortField === "title" ? b.title : b.createdAt;
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
    return data;
  }, [posts, search, categoryFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) setSortDir(d => d === "asc" ? "desc" : "asc");
    else { setSortField(field); setSortDir("desc"); }
  };

  const handleTogglePublish = async (post: BlogPost) => {
    setTogglingId(post.id);
    try {
      await api.patch(`/blog/${post.id}`, { isPublished: !post.isPublished });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, isPublished: !p.isPublished } : p));
      toast.success(post.isPublished ? `"${post.title}" moved to drafts` : `"${post.title}" published ✓`);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to update"); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/blog/${deleteTarget.id}`);
      toast.success("Post deleted");
      setPosts(prev => prev.filter(p => p.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Delete failed"); }
    finally { setIsDeleting(false); }
  };

  const publishedCount = posts.filter(p => p.isPublished).length;
  const draftCount = posts.filter(p => !p.isPublished).length;
  const totalViews = posts.reduce((acc, p) => acc + (p.views ?? 0), 0);

  if (authLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={28} /></div>;
  if (!isAdmin) return null;

  return (
    <>
      <DeleteDialog post={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} isDeleting={isDeleting} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] [background:var(--gradient-accent)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">Blog</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20">{posts.length}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Create and manage blog posts for the Kavach platform.</p>
            <div className="flex items-center gap-4 mt-2.5">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><span className="w-1.5 h-1.5 rounded-full bg-kavach-green inline-block" />{publishedCount} published</span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] inline-block" />{draftCount} drafts</span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]"><Eye size={11} />{totalViews.toLocaleString()} total views</span>
            </div>
          </div>
          <Link href="/dashboard/admin/blog/new">
            <Button className="bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2 flex-shrink-0">
              <Plus size={16} />New Post
            </Button>
          </Link>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input type="text" id="blog-search" placeholder="Search posts..." value={search} onChange={e => setSearch(e.target.value)}
              className={`${inputCls} pl-8 w-full`} />
          </div>
          {/* Category */}
          <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}
            className={`${inputCls} appearance-none`}>
            <option value="all">All Categories</option>
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
          {/* Sort */}
          <div className="flex items-center gap-1 bg-[#0d1224] border border-white/10 rounded-xl p-1">
            {([["createdAt", "Date"], ["views", "Views"], ["title", "Title"]] as [SortField, string][]).map(([f, label]) => (
              <button key={f} onClick={() => toggleSort(f)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1 ${sortField === f ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"}`}>
                {f === "views" ? <TrendingUp size={10} /> : f === "createdAt" ? <Clock size={10} /> : null}
                {label} {sortField === f && (sortDir === "desc" ? "↓" : "↑")}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.015]">
                  {["Cover", "Title", "Author", "Category", "Status", "Views", "Date", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />) :
                  paginated.length === 0 ? (
                    <tr><td colSpan={8} className="py-20 text-center text-[var(--text-secondary)]">
                      <FileText size={40} className="mx-auto opacity-15 mb-3" />
                      <p className="text-sm font-medium">{search || categoryFilter !== "all" ? "No posts match your filters" : "No blog posts yet"}</p>
                      {!search && categoryFilter === "all" && (
                        <Link href="/dashboard/admin/blog/new"><Button size="sm" className="mt-4 bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20 hover:bg-kavach-cyan/20 text-xs gap-1.5"><Plus size={12} />Write first post</Button></Link>
                      )}
                    </td></tr>
                  ) : paginated.map(post => (
                    <tr key={post.id} className="group hover:bg-white/[0.02] transition-colors">
                      {/* Cover */}
                      <td className="px-4 py-3">
                        <div className="w-12 h-9 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex items-center justify-center flex-shrink-0">
                          {post.coverImage
                            ? <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" onError={e => (e.currentTarget.style.display = "none")} />
                            : <ImageOff size={13} className="text-[var(--text-muted)]" />}
                        </div>
                      </td>
                      {/* Title */}
                      <td className="px-4 py-3 max-w-[200px]">
                        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{post.title}</p>
                        {post.slug && <p className="text-[10px] text-[var(--text-muted)] font-mono truncate mt-0.5">/{post.slug}</p>}
                      </td>
                      {/* Author */}
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)] whitespace-nowrap">{post.author?.name ?? "—"}</td>
                      {/* Category */}
                      <td className="px-4 py-3">
                        {post.category
                          ? <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-kavach-violet/10 text-kavach-violet border border-kavach-violet/20">{post.category}</span>
                          : <span className="text-[11px] text-[var(--text-muted)]">—</span>}
                      </td>
                      {/* Status Toggle */}
                      <td className="px-4 py-3">
                        <button disabled={togglingId === post.id} onClick={() => handleTogglePublish(post)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all cursor-pointer disabled:opacity-40 ${post.isPublished ? "bg-kavach-green/10 text-kavach-green border-kavach-green/20 hover:bg-kavach-green/20" : "bg-white/5 text-[var(--text-secondary)] border-white/10 hover:bg-white/10"}`}>
                          {togglingId === post.id ? <Loader2 size={10} className="animate-spin" /> : post.isPublished ? <><ToggleRight size={12} />Published</> : <><ToggleLeft size={12} />Draft</>}
                        </button>
                      </td>
                      {/* Views */}
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{(post.views ?? 0).toLocaleString()}</td>
                      {/* Date */}
                      <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)] whitespace-nowrap">
                        {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }) : new Date(post.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      </td>
                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          <Link href={`/dashboard/admin/blog/${post.id}/edit`}>
                            <button id={`edit-post-${post.id}`} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-kavach-cyan hover:border-kavach-cyan/20 hover:bg-kavach-cyan/5 transition-all"><Edit2 size={13} /></button>
                          </Link>
                          <button id={`delete-post-${post.id}`} onClick={() => setDeleteTarget(post)}
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-white/[0.01]">
              <p className="text-xs text-[var(--text-secondary)]">
                Showing <span className="text-[var(--text-primary)] font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="text-[var(--text-primary)] font-medium">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage(p => Math.max(1, p - 1))} className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={14} /></Button>
                <span className="text-xs text-[var(--text-secondary)] min-w-[60px] text-center">Page {page} / {totalPages}</span>
                <Button variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage(p => Math.min(totalPages, p + 1))} className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
