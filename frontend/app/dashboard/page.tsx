"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import {
  Zap, Flag, Calendar, Trophy, Shield, Activity, Clock, ChevronRight,
  Star, Bell, CheckCircle2, Loader2, TrendingUp,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface ProgressSummary {
  totalPoints: number;
  ctfPoints: number;
  memberScore: number;
  daysCompleted: number;
  eventsAttended: number;
  ctfRank?: number;
  totalMembers?: number;
  activityLog?: ActivityEntry[];
}

interface CTFChallenge {
  id: string;
  title: string;
  category: string;
  difficulty: string;
  points: number;
}

interface Event {
  id: string;
  title: string;
  startDate: string;
  location?: string;
  isOnline?: boolean;
  userRsvp?: boolean;
}

interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: "LOW" | "NORMAL" | "HIGH" | "URGENT";
  isPinned?: boolean;
  createdAt: string;
  author?: { name: string };
}

interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  createdAt: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function formatEventDate(iso: string) {
  const d = new Date(iso);
  return { day: d.getDate(), month: d.toLocaleString("en", { month: "short" }), time: d.toLocaleTimeString("en", { hour: "2-digit", minute: "2-digit" }) };
}

const DIFF_COLORS: Record<string, string> = {
  EASY: "#06d6a0", MEDIUM: "#f59e0b", HARD: "#ef4444", EXPERT: "#7c3aed",
};
const ACT_ICONS: Record<string, React.ElementType> = {
  CTF_SOLVE: Trophy, EVENT_ATTEND: Calendar, DAY_COMPLETE: CheckCircle2, LOGIN: Shield,
};
const PRIORITY_COLORS: Record<string, string> = {
  LOW: "#64748b", NORMAL: "#3b82f6", HIGH: "#f59e0b", URGENT: "#ef4444",
};

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function StatSkeleton() {
  return <div className="h-28 rounded-2xl bg-white/[0.04] border border-white/5 animate-pulse" />;
}
function CardSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0a0f1c]/60 p-5 space-y-3 animate-pulse">
      <div className="h-3 w-24 bg-white/5 rounded" />
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="h-10 bg-white/5 rounded-xl" />)}
    </div>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, Icon, color, delay = 0 }: {
  label: string; value: string | number; sub?: string;
  Icon: React.ElementType; color: string; delay?: number;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay }}
      className="relative rounded-2xl border border-white/5 bg-[#0a0f1c]/60 backdrop-blur-xl p-5 overflow-hidden group hover:border-white/10 transition-colors">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl"
        style={{ background: `radial-gradient(circle at top left, ${color}08 0%, transparent 70%)` }} />
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color }}>{label}</p>
          <p className="text-3xl font-black text-[var(--text-primary)] tracking-tight leading-none">{value}</p>
          {sub && <p className="text-[11px] text-[var(--text-secondary)] mt-1.5">{sub}</p>}
        </div>
        <div className="p-2.5 rounded-xl flex-shrink-0" style={{ background: `${color}12`, border: `1px solid ${color}20` }}>
          <Icon size={18} style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [challenges, setChallenges] = useState<CTFChallenge[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    setIsLoading(true);
    try {
      const [progressRes, challengesRes, eventsRes, announcementsRes] = await Promise.allSettled([
        api.get("/progress/me"),
        api.get("/ctf/challenges?active=true&unsolved=true&limit=3"),
        api.get("/events?limit=2"),
        api.get("/announcements?pinned=true&limit=1"),
      ]);
      if (progressRes.status === "fulfilled") {
        const d = progressRes.value.data?.data ?? progressRes.value.data;
        setProgress(d?.summary ?? d);
      }
      if (challengesRes.status === "fulfilled") {
        const d = challengesRes.value.data?.data ?? challengesRes.value.data;
        setChallenges(d?.challenges ?? []);
      }
      if (eventsRes.status === "fulfilled") {
        const d = eventsRes.value.data?.data ?? eventsRes.value.data;
        setEvents(d?.events ?? []);
      }
      if (announcementsRes.status === "fulfilled") {
        const d = announcementsRes.value.data?.data ?? announcementsRes.value.data;
        const arr = d?.announcements ?? [];
        if (arr.length > 0) setAnnouncement(arr[0]);
      }
    } finally { setIsLoading(false); }
  }, []);

  useEffect(() => { if (!authLoading && user) fetchAll(); }, [authLoading, user, fetchAll]);

  const firstName = user?.name?.split(" ")[0] ?? "Operative";
  const activity: ActivityEntry[] = progress?.activityLog?.slice(0, 5) ?? [];

  // Role badge
  const roleBg = user?.role === "ADMIN" ? "#ef4444" : user?.role === "MEMBER" ? "#00f0ff" : "#475569";

  return (
    <div className="space-y-8 relative">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute -top-20 -left-20 w-72 h-72 bg-kavach-cyan/5 blur-[100px] rounded-full" />
      <div className="pointer-events-none absolute -bottom-20 right-0 w-72 h-72 bg-[#7c3aed]/5 blur-[100px] rounded-full" />

      {/* ── 1. Welcome Header ─────────────────────────────────────────────── */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">
            Welcome back,{" "}
            <span className="[background:var(--gradient-accent)] [-webkit-background-clip:text] [-webkit-text-fill-color:transparent]">{firstName}</span>
            {" "}👋
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border"
              style={{ color: roleBg, background: `${roleBg}12`, borderColor: `${roleBg}30` }}>
              <Shield size={10} />{user?.role ?? "MEMBER"}
            </span>
            {user?.createdAt && (
              <span className="text-[11px] text-[var(--text-secondary)] flex items-center gap-1">
                <Clock size={11} />Member since {new Date(user.createdAt).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
              </span>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-wider">Member Score</p>
          <p className="text-2xl font-black text-kavach-cyan">{progress?.memberScore?.toLocaleString() ?? (isLoading ? "—" : "0")}</p>
        </div>
      </motion.div>

      {/* ── 2. Stats Cards ────────────────────────────────────────────────── */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatSkeleton key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard label="Total Points" value={(progress?.totalPoints ?? 0).toLocaleString()} Icon={Zap} color="#00f0ff" delay={0.05} />
          <StatCard label="CTF Rank"
            value={progress?.ctfRank ? `#${progress.ctfRank}` : "—"}
            sub={progress?.totalMembers ? `of ${progress.totalMembers} members` : undefined}
            Icon={Trophy} color="#f59e0b" delay={0.1} />
          <StatCard label="100 Days"
            value={`${progress?.daysCompleted ?? 0}/100`}
            sub={`${Math.round(((progress?.daysCompleted ?? 0) / 100) * 100)}% complete`}
            Icon={Star} color="#7c3aed" delay={0.15} />
          <StatCard label="Member Score" value={(progress?.memberScore ?? 0).toLocaleString()} Icon={TrendingUp} color="#06d6a0" delay={0.2} />
        </div>
      )}

      {/* ── 3+4. CTF + Events ─────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Active CTF Challenges */}
        {isLoading ? <CardSkeleton /> : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="rounded-2xl border border-white/5 bg-[#0a0f1c]/60 backdrop-blur-xl p-5 overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-kavach-cyan/10 border border-kavach-cyan/20"><Flag size={13} className="text-kavach-cyan" /></div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Active CTF Challenges</h2>
              </div>
              <Link href="/dashboard/ctf" className="text-[11px] text-kavach-cyan hover:text-kavach-cyan/80 flex items-center gap-0.5 transition-colors">
                All <ChevronRight size={12} />
              </Link>
            </div>
            {challenges.length === 0 ? (
              <div className="py-8 text-center">
                <Flag size={28} className="mx-auto opacity-15 mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">All caught up! No unsolved challenges.</p>
                <Link href="/dashboard/ctf"><button className="mt-3 text-xs text-kavach-cyan hover:underline">Browse all challenges →</button></Link>
              </div>
            ) : (
              <div className="space-y-2">
                {challenges.map(ch => (
                  <Link key={ch.id} href={`/dashboard/ctf/${ch.id}`}>
                    <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                        style={{ color: DIFF_COLORS[ch.difficulty] ?? "#94a3b8", background: `${DIFF_COLORS[ch.difficulty] ?? "#94a3b8"}15`, border: `1px solid ${DIFF_COLORS[ch.difficulty] ?? "#94a3b8"}25` }}>
                        {ch.difficulty}
                      </span>
                      <p className="flex-1 text-xs font-semibold text-[var(--text-primary)] group-hover:text-kavach-cyan transition-colors truncate">{ch.title}</p>
                      <span className="text-[11px] font-bold text-kavach-cyan flex-shrink-0">+{ch.points}</span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Upcoming Events */}
        {isLoading ? <CardSkeleton rows={2} /> : (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="rounded-2xl border border-white/5 bg-[#0a0f1c]/60 backdrop-blur-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-[#7c3aed]/10 border border-[#7c3aed]/20"><Calendar size={13} className="text-[#7c3aed]" /></div>
                <h2 className="text-sm font-bold text-[var(--text-primary)]">Recent Events</h2>
              </div>
              <Link href="/dashboard/events" className="text-[11px] text-kavach-cyan hover:text-kavach-cyan/80 flex items-center gap-0.5 transition-colors">
                All <ChevronRight size={12} />
              </Link>
            </div>
            {events.length === 0 ? (
              <div className="py-8 text-center">
                <Calendar size={28} className="mx-auto opacity-15 mb-2" />
                <p className="text-sm text-[var(--text-secondary)]">No recent events found.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {events.map(ev => {
                  const { day, month, time } = formatEventDate(ev.startDate);
                  return (
                    <Link key={ev.id} href="/dashboard/events">
                      <div className="flex items-center gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 hover:bg-white/[0.02] transition-all group">
                        <div className="w-10 h-10 rounded-xl flex-shrink-0 flex flex-col items-center justify-center bg-[#7c3aed]/10 border border-[#7c3aed]/20">
                          <span className="text-xs font-black text-[#7c3aed] leading-none">{day}</span>
                          <span className="text-[9px] text-[#7c3aed]/70 font-semibold">{month}</span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-[var(--text-primary)] group-hover:text-kavach-cyan transition-colors truncate">{ev.title}</p>
                          <p className="text-[10px] text-[var(--text-secondary)] mt-0.5">{time} · {ev.isOnline ? "Online" : ev.location ?? "TBD"}</p>
                        </div>
                        {ev.userRsvp && <span className="text-[9px] font-bold text-kavach-green border border-kavach-green/20 bg-kavach-green/10 px-1.5 py-0.5 rounded flex-shrink-0">RSVP'd</span>}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </div>

      {/* ── 5. Latest Announcement ────────────────────────────────────────── */}
      {!isLoading && announcement && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
          className="rounded-2xl border overflow-hidden"
          style={{ borderColor: `${PRIORITY_COLORS[announcement.priority]}30`, background: `${PRIORITY_COLORS[announcement.priority]}06` }}>
          <div className="flex items-start gap-4 p-5">
            <div className="p-2 rounded-xl flex-shrink-0" style={{ background: `${PRIORITY_COLORS[announcement.priority]}15`, border: `1px solid ${PRIORITY_COLORS[announcement.priority]}30` }}>
              <Bell size={16} style={{ color: PRIORITY_COLORS[announcement.priority] }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-bold text-[var(--text-primary)]">{announcement.title}</h3>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase"
                  style={{ color: PRIORITY_COLORS[announcement.priority], background: `${PRIORITY_COLORS[announcement.priority]}15`, border: `1px solid ${PRIORITY_COLORS[announcement.priority]}30` }}>
                  {announcement.priority === "URGENT" ? "🚨 " : ""}{announcement.priority}
                </span>
                {announcement.isPinned && <span className="text-[9px] font-bold text-kavach-cyan border border-kavach-cyan/20 bg-kavach-cyan/10 px-1.5 py-0.5 rounded">📌 Pinned</span>}
              </div>
              <p className="text-xs text-[var(--text-secondary)] mt-1 line-clamp-2 leading-relaxed">{announcement.body}</p>
              <p className="text-[10px] text-[var(--text-muted)] mt-2">{announcement.author?.name} · {timeAgo(announcement.createdAt)}</p>
            </div>
            <Link href="/dashboard/announcements" className="flex-shrink-0">
              <button className="text-[11px] text-kavach-cyan hover:underline whitespace-nowrap">View all →</button>
            </Link>
          </div>
        </motion.div>
      )}

      {/* ── 6. Activity Feed ──────────────────────────────────────────────── */}
      {isLoading ? <CardSkeleton rows={5} /> : activity.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="rounded-2xl border border-white/5 bg-[#0a0f1c]/60 backdrop-blur-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-kavach-green/10 border border-kavach-green/20"><Activity size={13} className="text-kavach-green" /></div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">Recent Activity</h2>
            </div>
            <Link href="/dashboard/progress" className="text-[11px] text-kavach-cyan hover:text-kavach-cyan/80 flex items-center gap-0.5 transition-colors">Full log <ChevronRight size={12} /></Link>
          </div>
          <div className="relative pl-5 space-y-3">
            <div className="absolute left-2 top-0 bottom-0 w-px bg-white/[0.06]" />
            {activity.map((a, idx) => {
              const Icon = ACT_ICONS[a.type] ?? Activity;
              return (
                <div key={a.id} className="relative flex items-start gap-3">
                  <div className="absolute -left-3.5 top-0.5 p-0.5 rounded-full bg-[#050816] border border-white/10">
                    <Icon size={9} className="text-kavach-cyan" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-[var(--text-primary)] leading-snug">{a.description}</p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-0.5">{timeAgo(a.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
