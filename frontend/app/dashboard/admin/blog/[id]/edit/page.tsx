"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import {
  Save, Send, ArrowLeft, Upload, Loader2, X, ImageOff, Tag, Eye, EyeOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), { ssr: false });

// ─── Types ───────────────────────────────────────────────────────────────────

interface UserOption { id: string; name: string; email: string; role: string; }

// ─── Schema ──────────────────────────────────────────────────────────────────

const blogSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  content: z.string().min(30, "Content must be at least 30 characters"),
  excerpt: z.string().max(150, "Excerpt must be ≤ 150 characters").optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).default([]),
  coverImage: z.string().optional(),
  authorId: z.string().optional(),
  publishedAt: z.string().optional(),
  isPublished: z.boolean().default(false),
});

type BlogFormValues = z.infer<typeof blogSchema>;

const CATEGORIES = ["Technology", "Security", "CTF", "Tutorial", "News", "Event", "Research"];
const AUTO_SAVE_KEY = (id: string) => `kavach_blog_draft_${id}`;
const AUTO_SAVE_INTERVAL = 30_000;

// ─── Shared input style ───────────────────────────────────────────────────────

const inputCls =
  "w-full rounded-xl border border-white/10 bg-[#0d1224] px-3 py-2 text-sm " +
  "text-[var(--text-primary)] placeholder:text-[var(--text-muted)] " +
  "focus:outline-none focus:border-kavach-cyan/40 focus:ring-1 focus:ring-kavach-cyan/20 transition-colors";

const selectCls =
  "w-full rounded-xl border border-white/10 bg-[#0d1224] px-3 py-2 text-sm " +
  "text-[var(--text-primary)] focus:outline-none focus:border-kavach-cyan/40 " +
  "focus:ring-1 focus:ring-kavach-cyan/20 transition-colors appearance-none";

// ─── Right panel field wrapper ────────────────────────────────────────────────

function PanelField({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{label}</label>
      {hint && <p className="text-[10px] text-[var(--text-muted)]">{hint}</p>}
      {children}
      {error && <p className="text-[10px] text-red-400 flex items-center gap-1"><span className="w-1 h-1 rounded-full bg-red-400 inline-block" />{error}</p>}
    </div>
  );
}

// ─── Editor Page ──────────────────────────────────────────────────────────────

export default function BlogEditorPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const postId = params?.id as string | undefined; // undefined for /new via Next.js nested route
  const isNew = !postId || postId === "new";

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [previewCover, setPreviewCover] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  const { register, handleSubmit, control, watch, setValue, reset, getValues, formState: { errors } } = useForm<BlogFormValues>({
    resolver: zodResolver(blogSchema),
    defaultValues: {
      title: "", content: "", excerpt: "", category: "", tags: [],
      coverImage: "", authorId: "", publishedAt: "", isPublished: false,
    },
  });

  const watchedTitle = watch("title");
  const watchedContent = watch("content");
  const watchedTags = watch("tags");
  const watchedExcerpt = watch("excerpt");
  const watchedCover = watch("coverImage");
  const watchedPublished = watch("isPublished");

  // Sync cover preview
  useEffect(() => { setPreviewCover(watchedCover ?? ""); }, [watchedCover]);

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && !isAdmin) { toast.error("Admin access required"); router.replace("/dashboard"); }
  }, [authLoading, isAdmin, router]);

  // ── Fetch users for author select ──
  useEffect(() => {
    api.get("/users?role=MEMBER,ADMIN").then(res => {
      setUsers(res.data?.data?.users ?? res.data?.users ?? []);
    }).catch(() => {});
  }, []);

  // ── Fetch existing post for edit ──
  useEffect(() => {
    if (isNew) {
      // Try restore from localStorage
      try {
        const saved = localStorage.getItem(AUTO_SAVE_KEY("new"));
        if (saved) {
          const parsed = JSON.parse(saved) as Partial<BlogFormValues>;
          reset({ ...getValues(), ...parsed });
          toast.info("Draft restored from local backup");
        }
      } catch {}
      return;
    }
    setIsLoading(true);
    api.get(`/blog/${postId}`).then(res => {
      const post = res.data?.data?.post ?? res.data?.post ?? res.data;
      reset({
        title: post.title ?? "",
        content: post.content ?? "",
        excerpt: post.excerpt ?? "",
        category: post.category ?? "",
        tags: post.tags ?? [],
        coverImage: post.coverImage ?? "",
        authorId: post.author?.id ?? post.authorId ?? "",
        publishedAt: post.publishedAt ? new Date(post.publishedAt).toISOString().slice(0, 10) : "",
        isPublished: post.isPublished ?? false,
      });
      setPreviewCover(post.coverImage ?? "");
    }).catch(() => { toast.error("Failed to load post"); router.replace("/dashboard/admin/blog"); })
      .finally(() => setIsLoading(false));
  }, [isNew, postId, reset, getValues, router]);

  // ── Auto-save every 30s to localStorage ──
  useEffect(() => {
    autoSaveTimerRef.current = setInterval(() => {
      try {
        const vals = getValues();
        if (vals.title || vals.content) {
          localStorage.setItem(AUTO_SAVE_KEY(postId ?? "new"), JSON.stringify(vals));
        }
      } catch {}
    }, AUTO_SAVE_INTERVAL);
    return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
  }, [getValues, postId]);

  // ── Cover image upload ──
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be < 5MB"); return; }
    if (!file.type.startsWith("image/")) { toast.error("File must be an image"); return; }
    setIsUploading(true);
    try {
      const fd = new FormData(); fd.append("image", file);
      const res = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const url: string = res.data?.data?.url ?? res.data?.url ?? "";
      if (!url) throw new Error("No URL");
      setValue("coverImage", url, { shouldValidate: true });
      setPreviewCover(url);
      toast.success("Cover uploaded ✓");
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Upload failed"); }
    finally { setIsUploading(false); if (fileInputRef.current) fileInputRef.current.value = ""; }
  };

  // ── Tag helpers ──
  const addTag = (val: string) => {
    const tag = val.trim().toLowerCase().replace(/\s+/g, "-");
    if (!tag || watchedTags.includes(tag)) { setTagInput(""); return; }
    setValue("tags", [...watchedTags, tag]);
    setTagInput("");
  };
  const removeTag = (tag: string) => setValue("tags", watchedTags.filter(t => t !== tag));

  // ── Save / Publish ──
  const save = async (publish?: boolean) => {
    const values = getValues();
    const validationErrors = [];
    if (!values.title || values.title.trim().length < 3) validationErrors.push("Title too short");
    if (!values.content || values.content.trim().length < 30) validationErrors.push("Content too short");
    if (validationErrors.length) { toast.error(validationErrors[0]); return; }

    if (publish !== undefined) setIsPublishing(true); else setIsSaving(true);
    try {
      const payload = {
        ...values,
        isPublished: publish !== undefined ? publish : values.isPublished,
        publishedAt: (publish || values.isPublished) ? (values.publishedAt || new Date().toISOString()) : undefined,
        tags: values.tags ?? [],
        excerpt: values.excerpt?.trim() || undefined,
        coverImage: values.coverImage?.trim() || undefined,
        authorId: values.authorId || undefined,
        category: values.category || undefined,
      };
      if (isNew) {
        const res = await api.post("/blog", payload);
        const newId = res.data?.data?.post?.id ?? res.data?.post?.id;
        toast.success(publish ? "Post published ✓" : "Draft saved ✓");
        localStorage.removeItem(AUTO_SAVE_KEY("new"));
        router.replace(newId ? `/dashboard/admin/blog/${newId}/edit` : "/dashboard/admin/blog");
      } else {
        await api.patch(`/blog/${postId}`, payload);
        if (publish !== undefined) setValue("isPublished", publish);
        toast.success(publish ? "Post published ✓" : publish === false ? "Post unpublished" : "Changes saved ✓");
        localStorage.removeItem(AUTO_SAVE_KEY(postId!));
      }
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Save failed"); }
    finally { setIsSaving(false); setIsPublishing(false); }
  };

  if (authLoading || isLoading) {
    return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={28} /></div>;
  }
  if (!isAdmin) return null;

  return (
    <div className="flex flex-col h-full min-h-screen bg-[var(--bg-primary)]">
      {/* ── Top Bar ───────────────────────────────────────────────────────── */}
      <div className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b border-white/10 bg-[#080d1a]/95 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/admin/blog">
            <button className="p-1.5 rounded-lg border border-white/10 hover:bg-white/5 text-[var(--text-secondary)] transition-colors"><ArrowLeft size={15} /></button>
          </Link>
          <span className="text-sm font-semibold text-[var(--text-primary)]">{isNew ? "New Post" : "Editing Post"}</span>
          {(watchedTitle || watchedContent) && (
            <span className="text-[10px] text-kavach-cyan/70 border border-kavach-cyan/20 bg-kavach-cyan/5 px-2 py-0.5 rounded-full">
              Auto-saves every 30s
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" disabled={isSaving || isPublishing} onClick={() => save()}
            className="border border-white/10 hover:bg-white/5 text-[var(--text-secondary)] gap-2 text-xs">
            {isSaving ? <Loader2 size={13} className="animate-spin" /> : <Save size={13} />}
            Save Draft
          </Button>
          <Button size="sm" disabled={isSaving || isPublishing} onClick={() => save(true)}
            className="bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2 text-xs">
            {isPublishing ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
            Publish
          </Button>
        </div>
      </div>

      {/* ── Body ─────────────────────────────────────────────────────────── */}
      <div className="flex flex-1 gap-0 overflow-hidden">
        {/* LEFT — editor (2/3) */}
        <div className="flex-1 overflow-y-auto px-8 py-6 flex flex-col gap-5">
          {/* Title */}
          <textarea
            {...register("title")}
            id="post-title"
            placeholder="Post title..."
            rows={2}
            className="w-full bg-transparent text-3xl font-black text-[var(--text-primary)] placeholder:text-[var(--text-muted)] 
              resize-none focus:outline-none leading-tight border-b border-white/10 pb-4"
            style={{ fontFamily: "inherit" }}
          />
          {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}

          {/* MD Editor */}
          <div
            data-color-mode="dark"
            className="flex-1 rounded-2xl overflow-hidden border border-white/10
              [&_.w-md-editor]:bg-[#080d1a] [&_.w-md-editor]:min-h-[calc(100vh-260px)]
              [&_.w-md-editor-toolbar]:bg-[#0d1224] [&_.w-md-editor-toolbar]:border-b [&_.w-md-editor-toolbar]:border-white/10
              [&_.w-md-editor-preview]:bg-[#080d1a] [&_.w-md-editor-preview]:text-[var(--text-primary)]
              [&_.wmde-markdown]:text-[var(--text-primary)] [&_.wmde-markdown]:text-sm"
          >
            <Controller
              name="content"
              control={control}
              render={({ field }) => (
                <MDEditor
                  value={field.value}
                  onChange={val => field.onChange(val ?? "")}
                  height="calc(100vh - 240px)"
                  preview="live"
                  visibleDragbar={false}
                />
              )}
            />
          </div>
          {errors.content && <p className="text-xs text-red-400">{errors.content.message}</p>}
        </div>

        {/* RIGHT — settings panel (1/3) */}
        <div className="w-80 xl:w-96 flex-shrink-0 border-l border-white/10 overflow-y-auto bg-[#080d1a] px-5 py-6 flex flex-col gap-5">

          {/* Excerpt */}
          <PanelField label="Excerpt" hint="Max 150 chars — shown in post cards" error={errors.excerpt?.message}>
            <textarea {...register("excerpt")} rows={3} placeholder="Brief summary..." maxLength={150}
              className={`${inputCls} resize-none`} />
            <p className="text-[10px] text-right text-[var(--text-muted)]">{(watchedExcerpt ?? "").length}/150</p>
          </PanelField>

          {/* Category */}
          <PanelField label="Category">
            <select {...register("category")} className={selectCls}>
              <option value="">No category</option>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </PanelField>

          {/* Tags */}
          <PanelField label="Tags" hint="Press Enter to add">
            <div className={`${inputCls} min-h-[42px] flex flex-wrap gap-1.5 cursor-text`}
              onClick={() => document.getElementById("tag-input")?.focus()}>
              {watchedTags.map(tag => (
                <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20 text-[10px] font-semibold">
                  <Tag size={9} />{tag}
                  <button type="button" onClick={e => { e.stopPropagation(); removeTag(tag); }} className="hover:text-red-400 transition-colors"><X size={9} /></button>
                </span>
              ))}
              <input id="tag-input" value={tagInput} onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addTag(tagInput); } if (e.key === "," || e.key === " ") { e.preventDefault(); addTag(tagInput); } }}
                placeholder={watchedTags.length === 0 ? "Add tags..." : ""}
                className="flex-1 min-w-[60px] bg-transparent text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none" />
            </div>
          </PanelField>

          {/* Cover Image */}
          <PanelField label="Cover Image">
            <div className="flex gap-2">
              <input {...register("coverImage")} type="url" placeholder="https://..." className={`${inputCls} flex-1`} />
              <Button type="button" variant="outline" size="icon" disabled={isUploading} onClick={() => fileInputRef.current?.click()}
                className="flex-shrink-0 border-white/10 bg-[#080d1a] hover:bg-white/5 text-[var(--text-secondary)] hover:text-[var(--text-primary)] size-9">
                {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
              </Button>
            </div>
            <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
            {previewCover && (
              <div className="mt-2 rounded-xl overflow-hidden border border-white/10 relative group">
                <img src={previewCover} alt="Cover" className="w-full h-28 object-cover" onError={() => setPreviewCover("")} />
                <button type="button" onClick={() => { setValue("coverImage", ""); setPreviewCover(""); }}
                  className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white/70 hover:text-red-400 transition-colors"><X size={12} /></button>
              </div>
            )}
          </PanelField>

          {/* Author */}
          <PanelField label="Author">
            <select {...register("authorId")} className={selectCls}>
              <option value="">Select author...</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.role})</option>)}
            </select>
          </PanelField>

          {/* Published At */}
          <PanelField label="Published Date" hint="Leave blank to use current time when publishing">
            <input {...register("publishedAt")} type="date" className={inputCls} />
          </PanelField>

          {/* Publish Toggle */}
          <div className={`flex items-start gap-3 rounded-xl border p-4 transition-colors ${watchedPublished ? "border-kavach-green/30 bg-kavach-green/5" : "border-white/10 bg-[#0d1224]"}`}>
            <Checkbox id="isPublished" checked={watchedPublished} onCheckedChange={c => setValue("isPublished", !!c)}
              className="mt-0.5 border-white/20" />
            <div>
              <label htmlFor="isPublished" className="text-sm font-semibold text-[var(--text-primary)] cursor-pointer">
                {watchedPublished ? "✓ Published" : "Draft"}
              </label>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
                {watchedPublished ? "Visible to all readers." : "Only admins can see this."}
              </p>
            </div>
          </div>

          {/* Save Actions (bottom of panel) */}
          <div className="flex flex-col gap-2 pt-2 border-t border-white/10 mt-auto">
            <Button onClick={() => save()} disabled={isSaving || isPublishing}
              className="w-full border border-white/10 bg-white/5 hover:bg-white/10 text-[var(--text-primary)] font-semibold gap-2">
              {isSaving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}Save Draft
            </Button>
            <Button onClick={() => save(true)} disabled={isSaving || isPublishing}
              className="w-full bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2">
              {isPublishing ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}Publish Now
            </Button>
            {!isNew && watchedPublished && (
              <button type="button" onClick={() => save(false)} disabled={isSaving || isPublishing}
                className="text-[11px] text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-center transition-colors">
                Unpublish / Move to draft
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
