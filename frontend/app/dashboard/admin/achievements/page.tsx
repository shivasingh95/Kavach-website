"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, Edit2, Trash2, Loader2, AlertTriangle, Upload, X,
  ToggleLeft, ToggleRight, Trophy, Star, ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";

// ─── Types ───────────────────────────────────────────────────────────────────

type AchievementCategory = "CTF" | "HACKATHON" | "RESEARCH" | "COMMUNITY" | "ACADEMIC" | "OTHER";
type Position = "1ST" | "2ND" | "3RD" | "PARTICIPATION";

interface Achievement {
  id: string;
  title: string;
  description?: string;
  imageUrl?: string;
  category: AchievementCategory;
  position: Position;
  eventName?: string;
  userId?: string;
  user?: { id: string; name: string; email: string };
  eventId?: string;
  achievedAt?: string;
  isPublished: boolean;
}

interface UserOption { id: string; name: string; email: string; }
interface EventOption { id: string; title: string; }

// ─── Schema ──────────────────────────────────────────────────────────────────

const achSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  category: z.enum(["CTF", "HACKATHON", "RESEARCH", "COMMUNITY", "ACADEMIC", "OTHER"] as const),
  position: z.enum(["1ST", "2ND", "3RD", "PARTICIPATION"] as const),
  eventName: z.string().optional(),
  userId: z.string().optional(),
  eventId: z.string().optional(),
  achievedAt: z.string().optional(),
  isPublished: z.boolean().default(false),
});
type AchFormValues = z.infer<typeof achSchema>;

// ─── Helpers ─────────────────────────────────────────────────────────────────

const POS_META: Record<Position, { label: string; color: string; Icon: React.ElementType }> = {
  "1ST": { label: "1st Place", color: "#f59e0b", Icon: Trophy },
  "2ND": { label: "2nd Place", color: "#94a3b8", Icon: Trophy },
  "3RD": { label: "3rd Place", color: "#b45309", Icon: Trophy },
  "PARTICIPATION": { label: "Participation", color: "#475569", Icon: Star },
};

const CAT_COLORS: Record<AchievementCategory, string> = {
  CTF: "#00f0ff", HACKATHON: "#7c3aed", RESEARCH: "#06d6a0",
  COMMUNITY: "#f59e0b", ACADEMIC: "#818cf8", OTHER: "#94a3b8",
};

function PositionBadge({ position }: { position: Position }) {
  const { label, color, Icon } = POS_META[position];
  return (
    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold"
      style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
      <Icon size={8} />{label}
    </span>
  );
}

function CategoryBadge({ category }: { category: AchievementCategory }) {
  const color = CAT_COLORS[category] ?? "#94a3b8";
  return (
    <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold"
      style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
      {category}
    </span>
  );
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

// ─── Shared input styles ──────────────────────────────────────────────────────

const inputCls = "w-full rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-kavach-cyan/40 focus:ring-1 focus:ring-kavach-cyan/20 transition-colors";
const selectCls = "w-full rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-sm text-[var(--text-primary)] focus:outline-none focus:border-kavach-cyan/40 focus:ring-1 focus:ring-kavach-cyan/20 transition-colors appearance-none";

function PanelField({ label, error, required, hint, children }: { label: string; error?: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {hint && <p className="text-[10px] text-[var(--text-muted)]">{hint}</p>}
      {children}
      {error && <p className="text-[10px] text-red-400 flex items-center gap-1"><span className="w-1 h-1 bg-red-400 rounded-full inline-block" />{error}</p>}
    </div>
  );
}

// ─── Achievement Form ─────────────────────────────────────────────────────────

function AchievementForm({
  achievement, users, events, onSuccess, onCancel,
}: { achievement?: Achievement | null; users: UserOption[]; events: EventOption[]; onSuccess: () => void; onCancel: () => void }) {
  const isEditing = !!achievement;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(achievement?.imageUrl ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<AchFormValues>({
    resolver: zodResolver(achSchema),
    defaultValues: {
      title: achievement?.title ?? "",
      description: achievement?.description ?? "",
      imageUrl: achievement?.imageUrl ?? "",
      category: (achievement?.category as AchievementCategory) ?? "CTF",
      position: (achievement?.position as Position) ?? "PARTICIPATION",
      eventName: achievement?.eventName ?? "",
      userId: achievement?.userId ?? achievement?.user?.id ?? "",
      eventId: achievement?.eventId ?? "",
      achievedAt: achievement?.achievedAt ? new Date(achievement.achievedAt).toISOString().slice(0, 10) : "",
      isPublished: achievement?.isPublished ?? false,
    },
  });

  const isPublished = watch("isPublished");
  const imageUrl = watch("imageUrl");
  useEffect(() => { setPreviewUrl(imageUrl ?? ""); }, [imageUrl]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error("Image must be < 5MB"); return; }
    setIsUploading(true);
    try {
      const fd = new FormData(); fd.append("image", file);
      const res = await api.post("/upload/image", fd, { headers: { "Content-Type": "multipart/form-data" } });
      const url: string = res.data?.data?.url ?? res.data?.url ?? "";
      if (!url) throw new Error("No URL");
      setValue("imageUrl", url, { shouldValidate: true });
      toast.success("Image uploaded ✓");
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Upload failed"); }
    finally { setIsUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  const onSubmit = async (data: AchFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = { ...data, achievedAt: data.achievedAt || undefined, eventId: data.eventId || undefined, userId: data.userId || undefined, description: data.description?.trim() || undefined, imageUrl: data.imageUrl?.trim() || undefined, eventName: data.eventName?.trim() || undefined };
      if (isEditing) { await api.patch(`/achievements/${achievement!.id}`, payload); toast.success("Achievement updated ✓"); }
      else { await api.post("/achievements", payload); toast.success("Achievement created ✓"); }
      onSuccess();
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Save failed"); }
    finally { setIsSubmitting(false); }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <PanelField label="Title" required error={errors.title?.message}>
        <input {...register("title")} placeholder="e.g. First Place at HackOn 2024" className={inputCls} />
      </PanelField>

      <PanelField label="Description" error={errors.description?.message}>
        <textarea {...register("description")} rows={3} placeholder="Brief description of the achievement..." className={`${inputCls} resize-none`} />
      </PanelField>

      <div className="grid grid-cols-2 gap-3">
        <PanelField label="Category" required>
          <select {...register("category")} className={selectCls}>
            <option value="CTF">CTF</option>
            <option value="HACKATHON">Hackathon</option>
            <option value="RESEARCH">Research</option>
            <option value="COMMUNITY">Community</option>
            <option value="ACADEMIC">Academic</option>
            <option value="OTHER">Other</option>
          </select>
        </PanelField>
        <PanelField label="Position" required>
          <select {...register("position")} className={selectCls}>
            <option value="1ST">1st Place</option>
            <option value="2ND">2nd Place</option>
            <option value="3RD">3rd Place</option>
            <option value="PARTICIPATION">Participation</option>
          </select>
        </PanelField>
      </div>

      <PanelField label="Event Name" hint="Name of the competition or event">
        <input {...register("eventName")} placeholder="e.g. National CTF Championship 2024" className={inputCls} />
      </PanelField>

      <PanelField label="Member">
        <select {...register("userId")} className={selectCls}>
          <option value="">Select member...</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name} — {u.email}</option>)}
        </select>
      </PanelField>

      <PanelField label="Linked Event (optional)">
        <select {...register("eventId")} className={selectCls}>
          <option value="">None</option>
          {events.map(e => <option key={e.id} value={e.id}>{e.title}</option>)}
        </select>
      </PanelField>

      <PanelField label="Achievement Date">
        <input {...register("achievedAt")} type="date" className={inputCls} />
      </PanelField>

      <PanelField label="Image / Certificate">
        <div className="flex gap-2">
          <input {...register("imageUrl")} type="url" placeholder="https://..." className={`${inputCls} flex-1`} />
          <Button type="button" variant="outline" size="icon" disabled={isUploading} onClick={() => fileRef.current?.click()}
            className="flex-shrink-0 border-white/10 bg-[#080d1a] hover:bg-white/5 text-[var(--text-secondary)] size-9">
            {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
          </Button>
        </div>
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        {previewUrl && (
          <div className="mt-2 relative rounded-xl overflow-hidden border border-white/10">
            <img src={previewUrl} alt="Preview" className="w-full h-24 object-cover" onError={() => setPreviewUrl("")} />
            <button type="button" onClick={() => { setValue("imageUrl", ""); setPreviewUrl(""); }}
              className="absolute top-2 right-2 p-1 rounded bg-black/60 text-white/70 hover:text-red-400 transition-colors"><X size={11} /></button>
          </div>
        )}
      </PanelField>

      {/* Publish */}
      <div className={`flex items-start gap-3 rounded-xl border p-3 transition-colors ${isPublished ? "border-kavach-green/30 bg-kavach-green/5" : "border-white/10 bg-[#0d1224]"}`}>
        <Checkbox id="ach-published" checked={isPublished} onCheckedChange={c => setValue("isPublished", !!c)} className="mt-0.5 border-white/20" />
        <label htmlFor="ach-published" className="text-xs font-semibold text-[var(--text-primary)] cursor-pointer">
          {isPublished ? "✓ Published — visible publicly" : "Draft — hidden from public"}
        </label>
      </div>

      <div className="flex gap-3 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isSubmitting}
          className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]">Cancel</Button>
        <Button type="submit" disabled={isSubmitting || isUploading}
          className="flex-1 bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2 disabled:opacity-50">
          {isSubmitting ? <><Loader2 size={14} className="animate-spin" />{isEditing ? "Saving..." : "Creating..."}</> : <>{isEditing ? "Save Changes" : "Add Achievement"}</>}
        </Button>
      </div>
    </form>
  );
}

// ─── Achievement Card ─────────────────────────────────────────────────────────

function AchievementCard({ ach, onEdit, onDelete, onToggle, togglingId }: {
  ach: Achievement; onEdit: (a: Achievement) => void; onDelete: (a: Achievement) => void;
  onToggle: (a: Achievement) => void; togglingId: string | null;
}) {
  const posColor = POS_META[ach.position]?.color ?? "#94a3b8";
  const catColor = CAT_COLORS[ach.category] ?? "#94a3b8";
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d1224] overflow-hidden group hover:border-white/20 transition-all break-inside-avoid mb-4">
      {ach.imageUrl ? (
        <div className="relative h-36 overflow-hidden">
          <img src={ach.imageUrl} alt={ach.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" onError={e => (e.currentTarget.parentElement!.innerHTML = `<div class="w-full h-full bg-white/5 flex items-center justify-center"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#475569" stroke-width="2"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg></div>`)} />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0d1224] to-transparent" />
          <div className="absolute top-2 right-2 flex gap-1">
            <PositionBadge position={ach.position} />
          </div>
        </div>
      ) : (
        <div className="h-20 bg-gradient-to-br from-white/[0.03] to-transparent flex items-center justify-center border-b border-white/10" style={{ background: `linear-gradient(135deg, ${posColor}08, ${catColor}05)` }}>
          <Trophy size={28} style={{ color: posColor, opacity: 0.4 }} />
        </div>
      )}

      <div className="p-4 space-y-2.5">
        <div className="flex items-start gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[var(--text-primary)] leading-snug">{ach.title}</h3>
            {ach.user && <p className="text-[11px] text-kavach-cyan mt-0.5">{ach.user.name}</p>}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          <CategoryBadge category={ach.category} />
          {!ach.imageUrl && <PositionBadge position={ach.position} />}
        </div>

        {ach.eventName && <p className="text-[10px] text-[var(--text-secondary)] truncate">🏆 {ach.eventName}</p>}
        {ach.achievedAt && <p className="text-[10px] text-[var(--text-muted)]">{formatDate(ach.achievedAt)}</p>}
        {ach.description && <p className="text-[11px] text-[var(--text-secondary)] line-clamp-2 leading-relaxed">{ach.description}</p>}

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1 border-t border-white/[0.06]">
          <button disabled={togglingId === ach.id} onClick={() => onToggle(ach)}
            className={`flex-1 flex items-center justify-center gap-1 py-1 rounded-lg text-[10px] font-semibold border transition-all disabled:opacity-40 ${ach.isPublished ? "bg-kavach-green/10 text-kavach-green border-kavach-green/20 hover:bg-kavach-green/20" : "bg-white/5 text-[var(--text-secondary)] border-white/10 hover:bg-white/10"}`}>
            {togglingId === ach.id ? <Loader2 size={10} className="animate-spin" /> : ach.isPublished ? <><ToggleRight size={11} />Published</> : <><ToggleLeft size={11} />Draft</>}
          </button>
          <button onClick={() => onEdit(ach)} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-kavach-cyan hover:border-kavach-cyan/20 hover:bg-kavach-cyan/5 transition-all"><Edit2 size={12} /></button>
          <button onClick={() => onDelete(ach)} className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"><Trash2 size={12} /></button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────────────

function DeleteDialog({ ach, onConfirm, onClose, isDeleting }: {
  ach: Achievement | null; onConfirm: () => void; onClose: () => void; isDeleting: boolean;
}) {
  if (!ach) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0"><AlertTriangle size={20} className="text-red-400" /></div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Delete Achievement?</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">"<span className="font-semibold text-[var(--text-primary)]">{ach.title}</span>" will be permanently removed.</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting} className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]">Cancel</Button>
          <Button onClick={onConfirm} disabled={isDeleting} className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-2">
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

type AchFilter = "all" | "published" | "draft" | AchievementCategory;

export default function AdminAchievementsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [users, setUsers] = useState<UserOption[]>([]);
  const [events, setEvents] = useState<EventOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<AchFilter>("all");
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingAch, setEditingAch] = useState<Achievement | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) { toast.error("Admin access required"); router.replace("/dashboard"); }
  }, [authLoading, isAdmin, router]);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [achRes, usersRes, eventsRes] = await Promise.all([
        api.get("/achievements"),
        api.get("/users?role=MEMBER,ADMIN").catch(() => ({ data: { data: { users: [] } } })),
        api.get("/events").catch(() => ({ data: { data: { events: [] } } })),
      ]);
      setAchievements(achRes.data?.data?.achievements ?? achRes.data?.achievements ?? []);
      setUsers(usersRes.data?.data?.users ?? []);
      setEvents(eventsRes.data?.data?.events ?? []);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to load achievements"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  const filtered = (() => {
    if (filter === "all") return achievements;
    if (filter === "published") return achievements.filter(a => a.isPublished);
    if (filter === "draft") return achievements.filter(a => !a.isPublished);
    return achievements.filter(a => a.category === filter);
  })();

  const handleToggle = async (ach: Achievement) => {
    setTogglingId(ach.id);
    try {
      await api.patch(`/achievements/${ach.id}`, { isPublished: !ach.isPublished });
      setAchievements(prev => prev.map(a => a.id === ach.id ? { ...a, isPublished: !a.isPublished } : a));
      toast.success(ach.isPublished ? "Moved to draft" : "Published ✓");
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to update"); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/achievements/${deleteTarget.id}`);
      toast.success("Achievement deleted");
      setAchievements(prev => prev.filter(a => a.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Delete failed"); }
    finally { setIsDeleting(false); }
  };

  const categories: AchievementCategory[] = ["CTF", "HACKATHON", "RESEARCH", "COMMUNITY", "ACADEMIC", "OTHER"];
  const pubCount = achievements.filter(a => a.isPublished).length;
  const draftCount = achievements.filter(a => !a.isPublished).length;

  if (authLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={28} /></div>;
  if (!isAdmin) return null;

  return (
    <>
      <DeleteDialog ach={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} isDeleting={isDeleting} />

      {/* Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-[520px] bg-[#080d1a] border-l border-white/10 flex flex-col gap-0 p-0 overflow-y-auto">
          <SheetHeader className="sticky top-0 z-10 bg-[#080d1a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20"><Trophy size={16} className="text-kavach-cyan" /></div>
              <div>
                <SheetTitle className="text-sm font-bold text-[var(--text-primary)]">{editingAch ? "Edit Achievement" : "Add Achievement"}</SheetTitle>
                <SheetDescription className="text-xs text-[var(--text-secondary)]">{editingAch ? `Editing: ${editingAch.title}` : "Record a member's achievement"}</SheetDescription>
              </div>
            </div>
          </SheetHeader>
          <div className="px-6 py-5">
            <AchievementForm
              key={editingAch?.id ?? "new"}
              achievement={editingAch}
              users={users}
              events={events}
              onSuccess={() => { setIsSheetOpen(false); setEditingAch(null); fetchAll(); }}
              onCancel={() => { setIsSheetOpen(false); setEditingAch(null); }}
            />
          </div>
        </SheetContent>
      </Sheet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] [background:var(--gradient-accent)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">Achievements</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20">{achievements.length}</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Showcase member awards, competition wins, and recognitions.</p>
            <div className="flex items-center gap-4 mt-2">
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-kavach-green inline-block" />{pubCount} published</span>
              <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] inline-block" />{draftCount} drafts</span>
            </div>
          </div>
          <Button onClick={() => { setEditingAch(null); setIsSheetOpen(true); }}
            className="bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2 flex-shrink-0">
            <Plus size={16} />Add Achievement
          </Button>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1 bg-[#0d1224] border border-white/10 rounded-xl p-1 w-fit flex-wrap">
          {[
            { value: "all", label: `All (${achievements.length})` },
            { value: "published", label: `Published (${pubCount})` },
            { value: "draft", label: `Drafts (${draftCount})` },
            ...categories.map(c => ({ value: c, label: c })),
          ].map(({ value, label }) => (
            <button key={value} onClick={() => setFilter(value as AchFilter)}
              className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filter === value ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"}`}>
              {label}
            </button>
          ))}
        </div>

        {/* Masonry grid */}
        {isLoading ? (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl border border-white/10 bg-[#0d1224] overflow-hidden animate-pulse mb-4 break-inside-avoid">
                <div className="h-28 bg-white/5" />
                <div className="p-4 space-y-2"><div className="h-3 w-3/4 bg-white/5 rounded" /><div className="h-2.5 w-1/2 bg-white/5 rounded" /><div className="h-2 w-1/3 bg-white/5 rounded" /></div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Trophy size={48} className="opacity-15 mb-4" />
            <p className="text-sm text-[var(--text-secondary)] font-medium">No achievements found</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">
              {filter !== "all" ? "Try selecting a different filter" : "Click \"Add Achievement\" to get started"}
            </p>
          </div>
        ) : (
          <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
            {filtered.map(ach => (
              <AchievementCard key={ach.id} ach={ach}
                onEdit={a => { setEditingAch(a); setIsSheetOpen(true); }}
                onDelete={a => setDeleteTarget(a)}
                onToggle={handleToggle}
                togglingId={togglingId}
              />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
