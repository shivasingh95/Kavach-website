"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  Tabs, TabsList, TabsTrigger, TabsContent,
} from "@/components/ui/tabs";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Trophy, Medal, Star, CheckCircle2, Calendar, Flag, Activity,
  Loader2, Download, Shield, ChevronUp, ChevronDown,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

type Role = "ADMIN" | "MEMBER" | "PUBLIC";
type SortField = "memberScore" | "ctfPoints" | "daysCompleted" | "eventsAttended";

interface MemberProgress {
  userId: string;
  user: { id: string; name: string; email: string; role: Role; avatar?: string; createdAt: string; lastLoginAt?: string };
  memberScore: number;
  ctfPoints: number;
  daysCompleted: number;
  eventsAttended: number;
  lastActive?: string;
}

interface UserDetail {
  user: { id: string; name: string; email: string; role: Role; createdAt: string; avatar?: string };
  memberScore: number;
  ctfPoints: number;
  daysCompleted: number;
  eventsAttended: number;
  solvedChallenges?: { id: string; title: string; points: number; difficulty: string; solvedAt: string }[];
  days?: { day: number; completed: boolean; submittedAt?: string }[];
  events?: { id: string; eventId: string; eventTitle: string; status: string; attended: boolean; certificateUrl?: string }[];
  activityLog?: { id: string; type: string; description: string; createdAt: string }[];
  lastActive?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso?: string) {
  if (!iso) return "—";
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const DIFF_COLORS: Record<string, string> = { EASY: "#06d6a0", MEDIUM: "#f59e0b", HARD: "#ef4444", EXPERT: "#7c3aed" };

function Avatar({ name, avatar, color = "#00f0ff" }: { name: string; avatar?: string; color?: string }) {
  const [fail, setFail] = useState(false);
  const initials = name?.split(" ").map(w => w[0]).slice(0, 2).join("").toUpperCase() ?? "?";
  return (
    <div className="w-9 h-9 rounded-full border overflow-hidden flex items-center justify-center flex-shrink-0"
      style={{ background: `${color}15`, borderColor: `${color}30` }}>
      {avatar && !fail ? <img src={avatar} alt={name} className="w-full h-full object-cover" onError={() => setFail(true)} />
        : <span className="text-xs font-bold" style={{ color }}>{initials}</span>}
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1) return <div className="w-7 h-7 rounded-full bg-yellow-400/10 border border-yellow-400/30 flex items-center justify-center"><Trophy size={14} className="text-yellow-400" /></div>;
  if (rank === 2) return <div className="w-7 h-7 rounded-full bg-slate-300/10 border border-slate-300/30 flex items-center justify-center"><Medal size={14} className="text-slate-300" /></div>;
  if (rank === 3) return <div className="w-7 h-7 rounded-full bg-amber-600/10 border border-amber-600/30 flex items-center justify-center"><Medal size={14} className="text-amber-600" /></div>;
  return <div className="w-7 h-7 rounded-full bg-white/[0.03] border border-white/10 flex items-center justify-center"><span className="text-[11px] font-bold text-[var(--text-muted)]">{rank}</span></div>;
}

// ─────────────────────────────────────────────────────────────────────────────
// USER PROGRESS SHEET
// ─────────────────────────────────────────────────────────────────────────────

export function UserProgressSheet({ userId, onClose }: { userId: string | null; onClose: () => void }) {
  const [detail, setDetail] = useState<UserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [markingEvent, setMarkingEvent] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) return;
    setDetail(null);
    setIsLoading(true);
    api.get(`/progress/users/${userId}`).then(res => {
      setDetail(res.data?.data ?? res.data ?? null);
    }).catch(() => toast.error("Failed to load user progress"))
      .finally(() => setIsLoading(false));
  }, [userId]);

  const handleMarkAttended = async (eventId: string) => {
    if (!userId) return;
    setMarkingEvent(eventId);
    try {
      await api.post(`/progress/events/${eventId}/attend`, { userId });
      toast.success("Marked as attended ✓");
      setDetail(prev => prev ? {
        ...prev,
        events: prev.events?.map(e => e.eventId === eventId ? { ...e, attended: true } : e),
      } : prev);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to mark attendance"); }
    finally { setMarkingEvent(null); }
  };

  const user = detail?.user;
  const open = !!userId;

  return (
    <Sheet open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <SheetContent className="w-full sm:max-w-[600px] bg-[#080d1a] border-l border-white/10 flex flex-col gap-0 p-0 overflow-y-auto">
        {/* Header */}
        <SheetHeader className="sticky top-0 z-10 bg-[#080d1a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
          {isLoading || !user ? (
            <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" /><div className="space-y-1.5"><div className="h-3 w-28 bg-white/5 rounded animate-pulse" /><div className="h-2.5 w-36 bg-white/5 rounded animate-pulse" /></div></div>
          ) : (
            <div className="flex items-center gap-3">
              <Avatar name={user.name} avatar={user.avatar} />
              <div>
                <SheetTitle className="text-sm font-bold text-[var(--text-primary)]">{user.name}</SheetTitle>
                <SheetDescription className="text-xs text-[var(--text-secondary)]">{user.email} • Joined {formatDate(user.createdAt)}</SheetDescription>
              </div>
              <div className="ml-auto text-right">
                <p className="text-lg font-black text-kavach-cyan">{detail?.memberScore ?? 0}</p>
                <p className="text-[10px] text-[var(--text-secondary)]">Member Score</p>
              </div>
            </div>
          )}
        </SheetHeader>

        {isLoading && (
          <div className="flex h-48 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={24} /></div>
        )}

        {!isLoading && detail && (
          <div className="flex-1 px-6 py-4">
            {/* Score summary */}
            <div className="grid grid-cols-4 gap-2 mb-5">
              {[
                { label: "Member Score", value: detail.memberScore, color: "#00f0ff" },
                { label: "CTF Points", value: detail.ctfPoints, color: "#7c3aed" },
                { label: "Days", value: `${detail.daysCompleted}/100`, color: "#06d6a0" },
                { label: "Events", value: detail.eventsAttended, color: "#f59e0b" },
              ].map(s => (
                <div key={s.label} className="rounded-xl bg-white/[0.03] border border-white/[0.06] p-3 text-center">
                  <p className="text-base font-black" style={{ color: s.color }}>{s.value}</p>
                  <p className="text-[9px] text-[var(--text-secondary)] mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Tabs */}
            <Tabs defaultValue="ctf" className="w-full">
              <TabsList className="bg-[#0d1224] border border-white/10 w-fit mb-4 h-auto p-1">
                {[["ctf", <Flag size={12} key="f" />, "CTF"], ["days", <Star size={12} key="s" />, "100 Days"], ["events", <Calendar size={12} key="c" />, "Events"], ["activity", <Activity size={12} key="a" />, "Activity"]].map(([v, icon, label]) => (
                  <TabsTrigger key={v as string} value={v as string}
                    className="px-3 py-1.5 text-[11px] font-semibold rounded-lg gap-1.5 data-active:bg-kavach-cyan/15 data-active:text-kavach-cyan data-active:border data-active:border-kavach-cyan/25">
                    {icon as React.ReactNode}{label as string}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* CTF Tab */}
              <TabsContent value="ctf">
                {!detail.solvedChallenges?.length ? (
                  <p className="text-sm text-center text-[var(--text-secondary)] py-8">No challenges solved yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {detail.solvedChallenges.map(c => (
                      <div key={c.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
                        <div className="w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: `${DIFF_COLORS[c.difficulty] ?? "#94a3b8"}15` }}>
                          <Flag size={11} style={{ color: DIFF_COLORS[c.difficulty] ?? "#94a3b8" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{c.title}</p>
                          <p className="text-[10px] text-[var(--text-secondary)]">{timeAgo(c.solvedAt)}</p>
                        </div>
                        <span className="text-xs font-bold text-kavach-cyan">+{c.points}</span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ color: DIFF_COLORS[c.difficulty] ?? "#94a3b8", background: `${DIFF_COLORS[c.difficulty] ?? "#94a3b8"}15` }}>{c.difficulty}</span>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* 100 Days Tab — 10×10 heatmap */}
              <TabsContent value="days">
                <div className="space-y-3">
                  <p className="text-xs text-[var(--text-secondary)]">{detail.daysCompleted ?? 0}/100 days completed</p>
                  <div className="grid grid-cols-10 gap-1.5">
                    {Array.from({ length: 100 }).map((_, i) => {
                      const d = detail.days?.find(x => x.day === i + 1);
                      return (
                        <div key={i} title={`Day ${i + 1}${d?.completed ? ` — ${formatDate(d.submittedAt)}` : ""}`}
                          className={`w-full aspect-square rounded-sm border transition-colors ${d?.completed ? "bg-kavach-green/30 border-kavach-green/40" : "bg-white/[0.04] border-white/[0.06]"}`} />
                      );
                    })}
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-[var(--text-secondary)]">
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-kavach-green/30 border border-kavach-green/40 inline-block" />Completed</span>
                    <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-sm bg-white/[0.04] border border-white/[0.06] inline-block" />Not done</span>
                  </div>
                </div>
              </TabsContent>

              {/* Events Tab */}
              <TabsContent value="events">
                {!detail.events?.length ? (
                  <p className="text-sm text-center text-[var(--text-secondary)] py-8">No event RSVPs yet.</p>
                ) : (
                  <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                    {detail.events.map(e => (
                      <div key={e.id} className="flex items-center gap-3 rounded-lg bg-white/[0.02] border border-white/[0.05] p-3">
                        <Calendar size={13} className="text-kavach-cyan flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] truncate">{e.eventTitle}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`text-[9px] font-semibold ${e.attended ? "text-kavach-green" : "text-amber-400"}`}>{e.attended ? "✓ Attended" : "RSVP'd"}</span>
                            {e.certificateUrl && <a href={e.certificateUrl} target="_blank" rel="noreferrer" className="text-[9px] text-kavach-cyan hover:underline">Certificate ↗</a>}
                          </div>
                        </div>
                        {!e.attended && (
                          <Button size="sm" disabled={markingEvent === e.eventId} onClick={() => handleMarkAttended(e.eventId)}
                            className="text-[10px] bg-kavach-green/10 text-kavach-green border border-kavach-green/20 hover:bg-kavach-green/20 gap-1 h-7 px-2.5">
                            {markingEvent === e.eventId ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}Mark Attended
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              {/* Activity Tab */}
              <TabsContent value="activity">
                {!detail.activityLog?.length ? (
                  <p className="text-sm text-center text-[var(--text-secondary)] py-8">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-1.5 max-h-96 overflow-y-auto pr-1">
                    {detail.activityLog.map(a => (
                      <div key={a.id} className="flex items-start gap-2.5 rounded-lg bg-white/[0.02] border border-white/[0.05] p-2.5">
                        <Activity size={11} className="text-kavach-cyan flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-[11px] text-[var(--text-primary)] leading-snug">{a.description}</p>
                          <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{timeAgo(a.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS PAGE
// ─────────────────────────────────────────────────────────────────────────────

export default function AdminProgressPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const [members, setMembers] = useState<MemberProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("memberScore");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) return;
    api.get("/progress/leaderboard").then(res => {
      const data = res.data?.data?.leaderboard ?? res.data?.data ?? res.data?.leaderboard ?? [];
      setMembers(data);
    }).catch(() => toast.error("Failed to load progress data"))
      .finally(() => setIsLoading(false));
  }, [isAdmin, authLoading]);

  const sorted = useMemo(() => {
    return [...members].sort((a, b) => {
      const av = a[sortField] ?? 0, bv = b[sortField] ?? 0;
      return sortDir === "desc" ? bv - av : av - bv;
    });
  }, [members, sortField, sortDir]);

  const toggleSort = (f: SortField) => {
    if (sortField === f) setSortDir(d => d === "desc" ? "asc" : "desc");
    else { setSortField(f); setSortDir("desc"); }
  };

  const stats = useMemo(() => ({
    total: members.length,
    avgScore: members.length ? Math.round(members.reduce((a, m) => a + (m.memberScore ?? 0), 0) / members.length) : 0,
    avgDays: members.length ? Math.round(members.reduce((a, m) => a + (m.daysCompleted ?? 0), 0) / members.length) : 0,
    totalCtf: members.reduce((a, m) => a + (m.ctfPoints ?? 0), 0),
  }), [members]);

  // CSV Export
  const handleExport = () => {
    const header = ["Name", "Email", "MemberScore", "CTFPoints", "DaysCompleted", "EventsAttended", "LastActive"];
    const rows = sorted.map(m => [
      m.user.name, m.user.email, m.memberScore, m.ctfPoints, m.daysCompleted, m.eventsAttended, m.lastActive ?? "",
    ]);
    const csv = [header, ...rows].map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `kavach-member-progress-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
    toast.success("CSV exported ✓");
  };

  const SortBtn = ({ field, label }: { field: SortField; label: string }) => (
    <button onClick={() => toggleSort(field)}
      className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${sortField === field ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 border border-transparent"}`}>
      {label}
      {sortField === field && (sortDir === "desc" ? <ChevronDown size={10} /> : <ChevronUp size={10} />)}
    </button>
  );

  if (authLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={28} /></div>;

  return (
    <>
      <UserProgressSheet userId={selectedUserId} onClose={() => setSelectedUserId(null)} />

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-[var(--text-primary)] [background:var(--gradient-accent)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">Member Progress</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20">{members.length} members</span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">Track CTF progress, 100 Days challenge completion, and event attendance.</p>
          </div>
          <Button onClick={handleExport} variant="ghost" className="border border-white/10 hover:bg-white/5 text-[var(--text-secondary)] gap-2 text-xs">
            <Download size={13} />Export CSV
          </Button>
        </div>

        {/* Club stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Total Members", value: stats.total, color: "#00f0ff" },
            { label: "Avg Member Score", value: stats.avgScore, color: "#7c3aed" },
            { label: "Avg Days Done", value: `${stats.avgDays}/100`, color: "#06d6a0" },
            { label: "Total CTF Points", value: stats.totalCtf.toLocaleString(), color: "#f59e0b" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0d1224] p-4">
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Sort controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] text-[var(--text-secondary)]">Sort by:</span>
          <SortBtn field="memberScore" label="Member Score" />
          <SortBtn field="ctfPoints" label="CTF Points" />
          <SortBtn field="daysCompleted" label="Days" />
          <SortBtn field="eventsAttended" label="Events" />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.015]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] w-10">Rank</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Member</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Role</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Score</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">CTF</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">100 Days</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Events</th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">Last Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="animate-pulse border-b border-white/[0.04]">
                    {Array.from({ length: 8 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded w-16" /></td>)}
                  </tr>
                )) : sorted.length === 0 ? (
                  <tr><td colSpan={8} className="py-16 text-center text-[var(--text-secondary)]">
                    <Trophy size={36} className="mx-auto opacity-15 mb-3" />
                    <p className="text-sm">No members found.</p>
                  </td></tr>
                ) : sorted.map((m, idx) => {
                  const rank = idx + 1;
                  const pct = Math.min(100, ((m.daysCompleted ?? 0) / 100) * 100);
                  const roleColor = m.user.role === "ADMIN" ? "#ef4444" : "#00f0ff";
                  return (
                    <tr key={m.userId} onClick={() => setSelectedUserId(m.userId)}
                      className={`group cursor-pointer transition-colors ${rank <= 3 ? "bg-yellow-500/[0.015] hover:bg-yellow-500/[0.03]" : "hover:bg-white/[0.02]"}`}>
                      <td className="px-4 py-3"><RankBadge rank={rank} /></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <Avatar name={m.user.name} avatar={m.user.avatar} color={roleColor} />
                          <div>
                            <p className="text-xs font-semibold text-[var(--text-primary)]">{m.user.name}</p>
                            <p className="text-[10px] text-[var(--text-secondary)]">{m.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold"
                          style={{ color: roleColor, background: `${roleColor}15`, border: `1px solid ${roleColor}30` }}>
                          <Shield size={9} />{m.user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm font-black text-kavach-cyan">{m.memberScore ?? 0}</td>
                      <td className="px-4 py-3 text-xs font-semibold text-[var(--text-primary)]">{m.ctfPoints ?? 0}</td>
                      <td className="px-4 py-3 min-w-[120px]">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
                            <div className="h-full rounded-full bg-kavach-green transition-all" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[10px] text-[var(--text-secondary)] flex-shrink-0">{m.daysCompleted ?? 0}/100</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-[var(--text-secondary)]">{m.eventsAttended ?? 0}</td>
                      <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">{timeAgo(m.lastActive)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!isLoading && sorted.length > 0 && (
            <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01]">
              <p className="text-xs text-[var(--text-secondary)]">{sorted.length} member{sorted.length !== 1 ? "s" : ""}</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
