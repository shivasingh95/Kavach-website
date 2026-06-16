"use client";

import {
  useCallback, useEffect, useMemo, useRef, useState,
} from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Shield, ShieldCheck, User as UserIcon, Search, Loader2, AlertTriangle,
  Trash2, ChevronLeft, ChevronRight, Activity, Clock, Calendar,
  ToggleLeft, ToggleRight, X, Eye, Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "ADMIN" | "MEMBER" | "PUBLIC";

interface UserRecord {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  isActive?: boolean;
  createdAt: string;
  lastLoginAt?: string;
}

interface UserProgress {
  memberScore?: number;
  ctfPoints?: number;
  daysCompleted?: number;
  eventsAttended?: number;
  recentActivity?: { id: string; type: string; description: string; createdAt: string }[];
}

type RoleFilter = "all" | "ADMIN" | "MEMBER" | "PUBLIC";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const roleMeta: Record<Role, { color: string; label: string; Icon: React.ElementType }> = {
  ADMIN: { color: "#ef4444", label: "Admin", Icon: ShieldCheck },
  MEMBER: { color: "#00f0ff", label: "Member", Icon: Shield },
  PUBLIC: { color: "#475569", label: "Public", Icon: UserIcon },
};

function RoleBadge({ role }: { role: Role }) {
  const { color, label, Icon } = roleMeta[role] ?? roleMeta.PUBLIC;
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
      style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>
      <Icon size={9} />{label}
    </span>
  );
}

function Avatar({ user }: { user: UserRecord }) {
  const [imgFailed, setImgFailed] = useState(false);
  const initials = user.name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  const color = roleMeta[user.role]?.color ?? "#475569";
  return (
    <div className="w-8 h-8 rounded-full border overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15`, borderColor: `${color}30` }}>
      {user.avatar && !imgFailed
        ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" onError={() => setImgFailed(true)} />
        : <span className="text-xs font-bold" style={{ color }}>{initials}</span>}
    </div>
  );
}

function formatDate(iso?: string): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function timeAgo(iso?: string): string {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-white/[0.04] animate-pulse">
      <td className="px-4 py-3"><div className="flex items-center gap-2"><div className="w-8 h-8 rounded-full bg-white/5" /><div><div className="h-3 w-28 bg-white/5 rounded mb-1" /><div className="h-2.5 w-36 bg-white/5 rounded" /></div></div></td>
      {Array.from({ length: 5 }).map((_, i) => <td key={i} className="px-4 py-3"><div className="h-3 w-16 bg-white/5 rounded" /></td>)}
    </tr>
  );
}

// ─── Delete Confirm (type username) ──────────────────────────────────────────

function DeleteConfirm({ user, onConfirm, onClose, isDeleting }: {
  user: UserRecord | null; onConfirm: () => void; onClose: () => void; isDeleting: boolean;
}) {
  const [typed, setTyped] = useState("");
  useEffect(() => { setTyped(""); }, [user]);
  if (!user) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0"><AlertTriangle size={20} className="text-red-400" /></div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Delete User Account</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">This will permanently delete <span className="font-semibold text-[var(--text-primary)]">{user.name}</span>'s account and all their data.</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] text-[var(--text-secondary)]">Type <span className="font-mono text-kavach-cyan">{user.name}</span> to confirm:</label>
          <input value={typed} onChange={e => setTyped(e.target.value)} placeholder={user.name}
            className="w-full rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-500/40 transition-colors" />
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isDeleting} className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]">Cancel</Button>
          <Button onClick={onConfirm} disabled={isDeleting || typed !== user.name}
            className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-2 disabled:opacity-40">
            {isDeleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Role Change Confirm ──────────────────────────────────────────────────────

function RoleChangeConfirm({ user, newRole, onConfirm, onClose, isChanging }: {
  user: UserRecord | null; newRole: Role | null; onConfirm: () => void; onClose: () => void; isChanging: boolean;
}) {
  if (!user || !newRole) return null;
  const isPromotion = newRole === "ADMIN";
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className={`p-2.5 rounded-full border flex-shrink-0 ${isPromotion ? "bg-red-500/10 border-red-500/20" : "bg-kavach-cyan/10 border-kavach-cyan/20"}`}>
            <ShieldCheck size={20} className={isPromotion ? "text-red-400" : "text-kavach-cyan"} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">{isPromotion ? "⚠️ Promote to Admin?" : `Change role to ${newRole}`}</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              {isPromotion ? `This will give ${user.name} full admin access to the Kavach platform.` : `${user.name} will be set to ${newRole}.`}
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isChanging} className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]">Cancel</Button>
          <Button onClick={onConfirm} disabled={isChanging}
            className={`flex-1 gap-2 ${isPromotion ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20" : "bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90"}`}>
            {isChanging ? <Loader2 size={14} className="animate-spin" /> : null}Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── User Detail Sheet ────────────────────────────────────────────────────────

function UserDetailSheet({ user, onClose }: { user: UserRecord | null; onClose: () => void }) {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loadingProgress, setLoadingProgress] = useState(false);

  useEffect(() => {
    if (!user) return;
    setProgress(null);
    setLoadingProgress(true);
    api.get(`/progress/users/${user.id}`).then(res => {
      setProgress(res.data?.data ?? res.data ?? null);
    }).catch(() => {}).finally(() => setLoadingProgress(false));
  }, [user]);

  return (
    <Sheet open={!!user} onOpenChange={open => { if (!open) onClose(); }}>
      <SheetContent className="w-full sm:max-w-[480px] bg-[#080d1a] border-l border-white/10 flex flex-col gap-0 p-0 overflow-y-auto">
        <SheetHeader className="sticky top-0 z-10 bg-[#080d1a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            {user && <Avatar user={user} />}
            <div>
              <SheetTitle className="text-sm font-bold text-[var(--text-primary)]">{user?.name}</SheetTitle>
              <SheetDescription className="text-xs text-[var(--text-secondary)] mt-0.5">{user?.email}</SheetDescription>
            </div>
          </div>
        </SheetHeader>

        {user && (
          <div className="px-6 py-5 flex flex-col gap-5">
            {/* Profile Info */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Profile</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  ["Role", <RoleBadge key="role" role={user.role} />],
                  ["Status", <span key="status" className={`text-[11px] font-semibold ${user.isActive !== false ? "text-kavach-green" : "text-red-400"}`}>{user.isActive !== false ? "Active" : "Inactive"}</span>],
                  ["Joined", formatDate(user.createdAt)],
                  ["Last Login", timeAgo(user.lastLoginAt)],
                ].map(([label, val], i) => (
                  <div key={i} className="rounded-xl bg-white/[0.03] border border-white/10 p-3">
                    <p className="text-[10px] text-[var(--text-secondary)] mb-1">{label as string}</p>
                    <div className="text-xs font-semibold text-[var(--text-primary)]">{val}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Progress */}
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Progress Summary</p>
              {loadingProgress ? (
                <div className="flex items-center gap-2 text-xs text-[var(--text-muted)]"><Loader2 size={13} className="animate-spin" />Loading progress...</div>
              ) : progress ? (
                <div className="grid grid-cols-2 gap-3">
                  {[
                    ["Member Score", progress.memberScore ?? 0],
                    ["CTF Points", progress.ctfPoints ?? 0],
                    ["100 Days", `${progress.daysCompleted ?? 0}/100`],
                    ["Events", progress.eventsAttended ?? 0],
                  ].map(([label, val]) => (
                    <div key={label as string} className="rounded-xl bg-white/[0.03] border border-white/10 p-3 text-center">
                      <p className="text-lg font-black text-kavach-cyan">{val}</p>
                      <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{label as string}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-secondary)]">No progress data available.</p>
              )}
            </div>

            {/* Recent Activity */}
            {progress?.recentActivity && progress.recentActivity.length > 0 && (
              <div className="space-y-2">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)]">Recent Activity</p>
                <div className="space-y-1.5 max-h-52 overflow-y-auto">
                  {progress.recentActivity.map(act => (
                    <div key={act.id} className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] border border-white/[0.06] p-2.5">
                      <Activity size={11} className="text-kavach-cyan flex-shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] text-[var(--text-primary)] leading-snug truncate">{act.description}</p>
                        <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{timeAgo(act.createdAt)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 20;

export default function AdminUsersPage() {
  const { isAdmin, isLoading: authLoading, user: currentUser } = useAuth();
  const router = useRouter();

  const [users, setUsers] = useState<UserRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const searchTimer = useRef<NodeJS.Timeout | null>(null);

  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [roleChangeTarget, setRoleChangeTarget] = useState<{ user: UserRecord; newRole: Role } | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) { toast.error("Admin access required."); router.replace("/dashboard"); }
  }, [authLoading, isAdmin, router]);

  // Debounce search
  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 300);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  useEffect(() => { setPage(1); }, [roleFilter]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (debouncedSearch.trim()) params.set("search", debouncedSearch.trim());
      if (roleFilter !== "all") params.set("role", roleFilter);
      const res = await api.get(`/users?${params}`);
      const data = res.data?.data ?? res.data;
      setUsers(data?.users ?? []);
      setTotal(data?.total ?? 0);
    } catch (err) { toast.error((err as any).response?.data?.message ?? "Failed to load users"); }
    finally { setIsLoading(false); }
  }, [page, debouncedSearch, roleFilter]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Stats
  const stats = useMemo(() => ({
    total,
    admins: users.filter(u => u.role === "ADMIN").length,
    members: users.filter(u => u.role === "MEMBER").length,
    active: users.filter(u => u.isActive !== false).length,
  }), [users, total]);

  const handleRoleChange = (user: UserRecord, newRole: Role) => {
    if (user.id === currentUser?.id) { toast.error("You cannot change your own role here."); return; }
    setRoleChangeTarget({ user, newRole });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeTarget) return;
    setIsChangingRole(true);
    try {
      await api.patch(`/users/${roleChangeTarget.user.id}/role`, { role: roleChangeTarget.newRole });
      toast.success(`${roleChangeTarget.user.name} → ${roleChangeTarget.newRole}`);
      setUsers(prev => prev.map(u => u.id === roleChangeTarget.user.id ? { ...u, role: roleChangeTarget.newRole } : u));
      setRoleChangeTarget(null);
    } catch (err) { toast.error((err as any).response?.data?.message ?? "Role change failed"); }
    finally { setIsChangingRole(false); }
  };

  const handleToggleActive = async (user: UserRecord) => {
    setTogglingId(user.id);
    try {
      await api.patch(`/users/${user.id}/toggle-active`);
      const next = !user.isActive;
      toast.success(`${user.name} ${next ? "activated" : "deactivated"}`);
      if (!next) toast.warning(`${user.name} can no longer log in.`, { duration: 4000 });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: next } : u));
    } catch (err) { toast.error((err as any).response?.data?.message ?? "Toggle failed"); }
    finally { setTogglingId(null); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/users/${deleteTarget.id}`);
      toast.success(`${deleteTarget.name} deleted`);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setTotal(t => t - 1);
      setDeleteTarget(null);
    } catch (err) { toast.error((err as any).response?.data?.message ?? "Delete failed"); }
    finally { setIsDeleting(false); }
  };

  if (authLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={28} /></div>;
  if (!isAdmin) return null;

  return (
    <>
      <DeleteConfirm user={deleteTarget} onConfirm={handleDelete} onClose={() => setDeleteTarget(null)} isDeleting={isDeleting} />
      <RoleChangeConfirm user={roleChangeTarget?.user ?? null} newRole={roleChangeTarget?.newRole ?? null}
        onConfirm={confirmRoleChange} onClose={() => setRoleChangeTarget(null)} isChanging={isChangingRole} />
      <UserDetailSheet user={selectedUser} onClose={() => setSelectedUser(null)} />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
<h1 className="text-2xl font-black tracking-tight text-kavach-cyan">
  Users
</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20">{total}</span>
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Manage member roles, active status, and accounts.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Users", value: total, color: "#00f0ff" },
            { label: "Members", value: stats.members, color: "#06d6a0" },
            { label: "Admins", value: stats.admins, color: "#ef4444" },
            { label: "Active", value: stats.active, color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0d1224] p-4">
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input type="text" id="user-search" placeholder="Search name or email..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-[#0d1224] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-kavach-cyan/30 transition-colors" />
          </div>
          <div className="flex items-center gap-1 bg-[#0d1224] border border-white/10 rounded-xl p-1">
            {(["all", "ADMIN", "MEMBER", "PUBLIC"] as RoleFilter[]).map(f => (
              <button key={f} onClick={() => setRoleFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold capitalize transition-all ${roleFilter === f ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"}`}>
                {f === "all" ? "All" : f}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.015]">
                  {["User", "Role", "Active", "Joined", "Last Login", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />) :
                  users.length === 0 ? (
                    <tr><td colSpan={6} className="py-16 text-center text-[var(--text-secondary)]">
                      <UserIcon size={36} className="mx-auto opacity-15 mb-3" />
                      <p className="text-sm">No users found{search ? " matching your search" : ""}.</p>
                    </td></tr>
                  ) : users.map(user => {
                    const isSelf = currentUser?.id === user.id;
                    return (
                      <tr key={user.id} className="group hover:bg-white/[0.02] transition-colors cursor-pointer"
                        onClick={() => setSelectedUser(user)}>
                        {/* User */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <Avatar user={user} />
                            <div>
                              <p className="text-xs font-semibold text-[var(--text-primary)]">{user.name} {isSelf && <span className="text-[9px] text-kavach-cyan">(you)</span>}</p>
                              <p className="text-[10px] text-[var(--text-secondary)]">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        {/* Role select */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <select value={user.role} disabled={isSelf}
                            onChange={e => handleRoleChange(user, e.target.value as Role)}
                            className={`rounded-lg border px-2 py-1 text-[11px] font-semibold bg-transparent cursor-pointer transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${user.role === "ADMIN" ? "border-red-500/30 text-red-400 bg-red-500/5" : user.role === "MEMBER" ? "border-kavach-cyan/30 text-kavach-cyan bg-kavach-cyan/5" : "border-white/10 text-[var(--text-secondary)]"}`}>
                            <option value="PUBLIC">PUBLIC</option>
                            <option value="MEMBER">MEMBER</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        {/* Active toggle */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <button disabled={togglingId === user.id || isSelf} onClick={() => handleToggleActive(user)}
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold transition-all disabled:opacity-40 ${user.isActive !== false ? "bg-kavach-green/10 text-kavach-green border-kavach-green/20 hover:bg-kavach-green/20" : "bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20"}`}>
                            {togglingId === user.id ? <Loader2 size={10} className="animate-spin" /> : user.isActive !== false ? <><ToggleRight size={11} />Active</> : <><ToggleLeft size={11} />Inactive</>}
                          </button>
                        </td>
                        {/* Joined */}
                        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)] whitespace-nowrap">{formatDate(user.createdAt)}</td>
                        {/* Last login */}
                        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)] whitespace-nowrap">{timeAgo(user.lastLoginAt)}</td>
                        {/* Actions */}
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button id={`view-user-${user.id}`} onClick={() => setSelectedUser(user)}
                              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-kavach-cyan hover:border-kavach-cyan/20 hover:bg-kavach-cyan/5 transition-all"><Eye size={13} /></button>
                            <button id={`delete-user-${user.id}`} disabled={isSelf} onClick={() => setDeleteTarget(user)}
                              className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all disabled:opacity-30"><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          {!isLoading && total > PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-white/[0.01]">
              <p className="text-xs text-[var(--text-secondary)]">
                Showing <span className="text-[var(--text-primary)] font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, total)}</span> of <span className="text-[var(--text-primary)] font-medium">{total}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={14} /></Button>
                <span className="text-xs text-[var(--text-secondary)] min-w-[60px] text-center">Page {page} / {totalPages}</span>
                <Button variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronRight size={14} /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}