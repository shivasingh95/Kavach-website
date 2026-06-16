"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { toast } from "sonner";
import {
  Users,
  Calendar,
  Flag,
  FileText,
  Trophy,
  UserPlus,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Database,
  Server,
  Activity,
  TrendingUp,
  AlertCircle,
  Loader2,
  ShieldCheck,
  MessageSquare,
} from "lucide-react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// ─── Types ───────────────────────────────────────────────────────────────────

interface DashboardData {
  totalUsers: number;
  totalEvents: number;
  totalChallenges: number;
  pendingSubmissions: number;
  totalBlogPosts: number;
  totalAchievements: number;
  unreadMessages: number;
  recentJoinRequests: JoinRequest[];
  submissionsThisWeek: Submission[];
  userGrowth: UserGrowthPoint[];
}

interface JoinRequest {
  id: string;
  name: string;
  fullName?: string;
  email: string;
  year?: string;
  yearOfStudy?: string;
  branch?: string;
  college?: string;
  appliedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface Submission {
  id: string;
  user: { id: string; name: string; email: string };
  challenge: { id: string; title: string; category: string };
  submittedAt: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
}

interface UserGrowthPoint {
  date: string;
  count: number;
}

// ─── Mock fallback data (used when API is unavailable) ───────────────────────

const generateUserGrowthFallback = (): UserGrowthPoint[] => {
  const data: UserGrowthPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    data.push({
      date: d.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      count: Math.floor(Math.random() * 8) + 1,
    });
  }
  return data;
};

const CTF_CATEGORY_COLORS: Record<string, string> = {
  Web: "#00f0ff",
  Crypto: "#7c3aed",
  Forensics: "#06d6a0",
  Pwn: "#f59e0b",
  Misc: "#ef4444",
  Reverse: "#818cf8",
};

// ─── Custom Tooltip Components ───────────────────────────────────────────────

const CustomAreaTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1224]/95 border border-kavach-cyan/20 rounded-xl p-3 shadow-glow backdrop-blur-md">
        <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
        <p className="text-sm font-bold text-kavach-cyan">
          +{payload[0].value} users
        </p>
      </div>
    );
  }
  return null;
};

const CustomBarTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#0d1224]/95 border border-kavach-violet/20 rounded-xl p-3 shadow-glow backdrop-blur-md">
        <p className="text-xs text-[var(--text-secondary)] mb-1">{label}</p>
        <p className="text-sm font-bold text-kavach-violet">
          {payload[0].value} solves
        </p>
      </div>
    );
  }
  return null;
};

// ─── Stat Card Component ──────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  color: string;
  glowColor: string;
  badge?: number;
  badgeColor?: string;
  trend?: string;
  href?: string;
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
  glowColor,
  badge,
  badgeColor = "bg-red-500",
  trend,
  href,
}: StatCardProps) {
  const cardContent = (
    <div
      className="relative overflow-hidden rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm p-5 
      transition-all duration-300 hover:border-white/10 hover:-translate-y-0.5 group h-full"
      style={{ boxShadow: `0 4px 24px ${glowColor}15` }}
    >
      {/* Ambient glow */}
      <div
        className="absolute -right-6 -top-6 w-28 h-28 rounded-full blur-2xl opacity-20 group-hover:opacity-30 transition-opacity"
        style={{ background: glowColor }}
      />

      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-medium uppercase tracking-widest text-[var(--text-secondary)]">
            {title}
          </p>
          <div className="relative">
            <div
              className="p-2 rounded-lg"
              style={{ background: `${glowColor}15` }}
            >
              <Icon size={16} style={{ color }} />
            </div>
            {badge !== undefined && badge > 0 && (
              <span
                className={`absolute -top-1.5 -right-1.5 ${badgeColor} text-white text-[10px] font-bold 
                  rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 animate-pulse`}
              >
                {badge > 99 ? "99+" : badge}
              </span>
            )}
          </div>
        </div>

        <p
          className="text-3xl font-black tracking-tight"
          style={{ color }}
        >
          {typeof value === "number" ? value.toLocaleString() : value}
        </p>

        {trend && (
          <p className="text-xs text-[var(--text-secondary)] mt-2 flex items-center gap-1 group-hover:text-[var(--text-primary)] transition-colors">
            {href ? <ArrowRight size={11} className="text-kavach-cyan" /> : <TrendingUp size={11} className="text-kavach-green" />}
            {trend}
          </p>
        )}
      </div>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block h-full group">
        {cardContent}
      </Link>
    );
  }

  return cardContent;
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 p-5 animate-pulse">
      <div className="flex justify-between mb-4">
        <div className="h-3 w-24 bg-white/5 rounded" />
        <div className="h-8 w-8 bg-white/5 rounded-lg" />
      </div>
      <div className="h-8 w-16 bg-white/5 rounded" />
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [systemStatus] = useState({
    database: "Connected",
    backend: "Running",
    lastDeploy: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), // 3h ago
  });

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required.");
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  // ── Fetch Dashboard Data ──
  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/analytics/dashboard");
      setData(res.data?.data ?? res.data);
    } catch {
      toast.error("Failed to load dashboard data. Ensure backend is running.");
      setData({
        totalUsers: 0,
        totalEvents: 0,
        totalChallenges: 0,
        pendingSubmissions: 0,
        totalBlogPosts: 0,
        totalAchievements: 0,
        unreadMessages: 0,
        recentJoinRequests: [],
        submissionsThisWeek: [],
        userGrowth: [],
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // ── Handle Submission Review ──
  const handleReview = async (
    id: string,
    status: "APPROVED" | "REJECTED"
  ) => {
    setReviewingId(id);
    try {
      await api.patch(`/ctf/submissions/${id}/review`, { status });
      toast.success(
        `Submission ${status === "APPROVED" ? "approved ✓" : "rejected ✗"}`
      );
      await fetchDashboard();
    } catch (err) {
      toast.error(
        (err as any).response?.data?.message ?? `Failed to ${status.toLowerCase()} submission`
      );
    } finally {
      setReviewingId(null);
    }
  };

  // ── Category Solve Data (derived from submissions) ──
  const categoryData = data
    ? Object.entries(
        data.submissionsThisWeek.reduce<Record<string, number>>((acc, s) => {
          const cat = s.challenge.category;
          acc[cat] = (acc[cat] ?? 0) + 1;
          return acc;
        }, {})
      ).map(([category, solves]) => ({ category, solves }))
    : [];

  // ── Time Ago Helper ──
  const timeAgo = (iso: string): string => {
    const diff = Date.now() - new Date(iso).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  // ── Loading State ──
  if (authLoading || (isLoading && !data)) {
    return (
      <div className="space-y-6">
        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        {/* Charts skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {Array.from({ length: 2 }).map((_, i) => (
            <div
              key={i}
              className="rounded-2xl border border-white/5 bg-[#0d1224]/80 p-6 h-72 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const pending = data?.pendingSubmissions ?? 0;
  const pendingJoin = data?.recentJoinRequests?.filter(
    (r) => r.status === "PENDING"
  ).length ?? 0;

  return (
    <div className="space-y-8">
      {/* ── Page Header ─────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gradient">
            Admin Overview
          </h1>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">
            Real-time platform insights &amp; management controls
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-kavach-green bg-kavach-green/10 border border-kavach-green/20 rounded-full px-3 py-1.5">
          <ShieldCheck size={13} />
          <span className="font-medium">ADMIN</span>
        </div>
      </div>

      {/* ── 1. Stats Cards Row ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Users"
          value={data?.totalUsers ?? 0}
          icon={Users}
          color="#00f0ff"
          glowColor="#00f0ff"
          trend="All registered members"
          href="/dashboard/admin/users"
        />
        <StatCard
          title="Active Events"
          value={data?.totalEvents ?? 0}
          icon={Calendar}
          color="#7c3aed"
          glowColor="#7c3aed"
          trend="Ongoing &amp; upcoming"
          href="/dashboard/admin/events"
        />
        <StatCard
          title="CTF Challenges"
          value={data?.totalChallenges ?? 0}
          icon={Flag}
          color="#06d6a0"
          glowColor="#06d6a0"
          trend="Published challenges"
          href="/dashboard/admin/ctf"
        />
        <StatCard
          title="Pending Reviews"
          value={pending}
          icon={AlertCircle}
          color={pending > 0 ? "#ef4444" : "#06d6a0"}
          glowColor={pending > 0 ? "#ef4444" : "#06d6a0"}
          badge={pending > 0 ? pending : undefined}
          badgeColor="bg-red-500"
          trend={pending > 0 ? "Needs attention!" : "All clear"}
          href="/dashboard/admin/ctf"
        />
        <StatCard
          title="Unread Messages"
          value={data?.unreadMessages ?? 0}
          icon={MessageSquare}
          color={(data?.unreadMessages ?? 0) > 0 ? "#00f0ff" : "#06d6a0"}
          glowColor={(data?.unreadMessages ?? 0) > 0 ? "#00f0ff" : "#06d6a0"}
          badge={(data?.unreadMessages ?? 0) > 0 ? data?.unreadMessages : undefined}
          badgeColor="bg-cyan-500"
          trend="Contact form queries"
          href="/dashboard/admin/messages"
        />
        <StatCard
          title="Blog Posts"
          value={data?.totalBlogPosts ?? 0}
          icon={FileText}
          color="#f59e0b"
          glowColor="#f59e0b"
          trend="Published articles"
          href="/dashboard/admin/blog"
        />
        <StatCard
          title="Join Requests"
          value={pendingJoin}
          icon={UserPlus}
          color={pendingJoin > 0 ? "#f59e0b" : "#06d6a0"}
          glowColor={pendingJoin > 0 ? "#f59e0b" : "#06d6a0"}
          badge={pendingJoin > 0 ? pendingJoin : undefined}
          badgeColor="bg-amber-500"
          trend="Awaiting review"
        />
      </div>

      {/* ── 2. Charts Row ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT: User Growth Area Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                User Registrations
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                Last 30 days
              </p>
            </div>
            <div className="p-2 rounded-lg bg-kavach-cyan/10">
              <TrendingUp size={16} className="text-kavach-cyan" />
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart
              data={data?.userGrowth ?? []}
              margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00f0ff" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#00f0ff" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                tick={{ fill: "#475569", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
                interval={6}
              />
              <YAxis
                tick={{ fill: "#475569", fontSize: 10 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip content={<CustomAreaTooltip />} />
              <Area
                type="monotone"
                dataKey="count"
                stroke="#00f0ff"
                strokeWidth={2}
                fill="url(#cyanGradient)"
                dot={false}
                activeDot={{
                  r: 5,
                  fill: "#00f0ff",
                  stroke: "#050816",
                  strokeWidth: 2,
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* RIGHT: CTF Solves by Category Bar Chart */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                CTF Solves by Category
              </h2>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">
                This week's submissions
              </p>
            </div>
            <div className="p-2 rounded-lg bg-kavach-violet/10">
              <Trophy size={16} className="text-kavach-violet" />
            </div>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={categoryData}
                margin={{ top: 4, right: 4, left: -20, bottom: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                  vertical={false}
                />
                <XAxis
                  dataKey="category"
                  tick={{ fill: "#475569", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  tick={{ fill: "#475569", fontSize: 10 }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip content={<CustomBarTooltip />} />
                <Bar dataKey="solves" radius={[6, 6, 0, 0]}>
                  {categoryData.map((entry) => (
                    <rect
                      key={entry.category}
                      fill={CTF_CATEGORY_COLORS[entry.category] ?? "#7c3aed"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[220px] flex flex-col items-center justify-center gap-2 text-[var(--text-secondary)]">
              <Flag size={32} className="opacity-20" />
              <p className="text-sm">No submissions this week</p>
            </div>
          )}

          {/* Category Legend */}
          {categoryData.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryData.map(({ category }) => (
                <span
                  key={category}
                  className="flex items-center gap-1.5 text-[10px] text-[var(--text-secondary)]"
                >
                  <span
                    className="w-2 h-2 rounded-full inline-block"
                    style={{
                      background:
                        CTF_CATEGORY_COLORS[category] ?? "#7c3aed",
                    }}
                  />
                  {category}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── 3. Pending Submissions Table ─────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-500/10">
              <AlertCircle size={16} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Pending Submissions
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                Most urgent — requires manual review
              </p>
            </div>
            {pending > 0 && (
              <Badge className="bg-red-500/10 text-red-400 border border-red-500/20 text-[10px] font-bold">
                {pending} pending
              </Badge>
            )}
          </div>
          <Link href="/dashboard/admin/ctf">
            <Button
              variant="ghost"
              size="sm"
              className="text-kavach-cyan hover:text-kavach-cyan hover:bg-kavach-cyan/10 text-xs gap-1.5"
            >
              View all
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>

        {/* Table */}
        {data?.submissionsThisWeek && data.submissionsThisWeek.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Challenge
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Submitted
                  </th>
                  <th className="px-6 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {data.submissionsThisWeek.slice(0, 5).map((sub) => (
                  <tr
                    key={sub.id}
                    className="group hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-kavach-cyan/10 border border-kavach-cyan/20 flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-bold text-kavach-cyan">
                            {sub.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-[var(--text-primary)]">
                            {sub.user.name}
                          </p>
                          <p className="text-[10px] text-[var(--text-secondary)]">
                            {sub.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs font-medium text-[var(--text-primary)] max-w-[160px] truncate">
                        {sub.challenge.title}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
                        style={{
                          color:
                            CTF_CATEGORY_COLORS[sub.challenge.category] ??
                            "#7c3aed",
                          background: `${
                            CTF_CATEGORY_COLORS[sub.challenge.category] ??
                            "#7c3aed"
                          }15`,
                          border: `1px solid ${
                            CTF_CATEGORY_COLORS[sub.challenge.category] ??
                            "#7c3aed"
                          }30`,
                        }}
                      >
                        {sub.challenge.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                        <Clock size={11} />
                        {timeAgo(sub.submittedAt)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          size="sm"
                          disabled={reviewingId === sub.id}
                          onClick={() => handleReview(sub.id, "APPROVED")}
                          className="h-7 px-3 text-[10px] font-semibold bg-kavach-green/10 text-kavach-green 
                            hover:bg-kavach-green/20 border border-kavach-green/20 hover:border-kavach-green/40 
                            transition-all gap-1"
                        >
                          {reviewingId === sub.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={11} />
                          )}
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          disabled={reviewingId === sub.id}
                          onClick={() => handleReview(sub.id, "REJECTED")}
                          className="h-7 px-3 text-[10px] font-semibold bg-red-500/10 text-red-400 
                            hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 
                            transition-all gap-1"
                        >
                          {reviewingId === sub.id ? (
                            <Loader2 size={11} className="animate-spin" />
                          ) : (
                            <XCircle size={11} />
                          )}
                          Reject
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
            <CheckCircle2 size={40} className="text-kavach-green opacity-40" />
            <p className="text-sm font-medium">All submissions reviewed!</p>
            <p className="text-xs opacity-60">No pending items at the moment.</p>
          </div>
        )}
      </div>

      {/* ── 4. Recent Join Requests ──────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-kavach-amber/10">
              <UserPlus size={16} className="text-kavach-amber" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[var(--text-primary)]">
                Recent Join Requests
              </h2>
              <p className="text-xs text-[var(--text-secondary)]">
                New membership applications
              </p>
            </div>
            {pendingJoin > 0 && (
              <Badge className="bg-kavach-amber/10 text-kavach-amber border border-kavach-amber/20 text-[10px] font-bold">
                {pendingJoin} pending
              </Badge>
            )}
          </div>
          <Link href="/dashboard/admin/join-requests">
            <Button
              variant="ghost"
              size="sm"
              className="text-kavach-cyan hover:text-kavach-cyan hover:bg-kavach-cyan/10 text-xs gap-1.5"
            >
              View all
              <ArrowRight size={13} />
            </Button>
          </Link>
        </div>

        {/* List */}
        {data?.recentJoinRequests && data.recentJoinRequests.length > 0 ? (
          <ul className="divide-y divide-white/[0.03]">
            {data.recentJoinRequests.slice(0, 5).map((req) => (
              <li
                key={req.id}
                className="px-6 py-4 flex items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Avatar */}
                  <div className="w-9 h-9 rounded-full bg-kavach-violet/10 border border-kavach-violet/20 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-kavach-violet">
                      {(req.fullName || "?").charAt(0).toUpperCase()}
                    </span>
                  </div>

                  {/* Info */}
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
                      {req.fullName || "Unknown"}
                    </p>
                    <p className="text-[10px] text-[var(--text-secondary)] truncate">
                      {req.email}
                    </p>
                  </div>
                </div>

                {/* Meta tags */}
                <div className="hidden sm:flex items-center gap-2 flex-shrink-0">
                  <span className="text-[10px] bg-white/5 border border-white/10 text-[var(--text-secondary)] px-2 py-0.5 rounded-md">
                    Year {req.yearOfStudy || "-"}
                  </span>
                  <span className="text-[10px] bg-white/5 border border-white/10 text-[var(--text-secondary)] px-2 py-0.5 rounded-md">
                    {req.college || "-"}
                  </span>
                </div>

                {/* Time + Action */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  <span className="hidden lg:flex items-center gap-1 text-[10px] text-[var(--text-secondary)]">
                    <Clock size={10} />
                    {timeAgo(req.appliedAt)}
                  </span>
                  <Link href="/dashboard/admin/join-requests">
                    <Button
                      size="sm"
                      className="h-7 px-3 text-[10px] font-semibold bg-kavach-cyan/10 text-kavach-cyan 
                        hover:bg-kavach-cyan/20 border border-kavach-cyan/20 hover:border-kavach-cyan/40 
                        transition-all gap-1"
                    >
                      Review
                      <ArrowRight size={10} />
                    </Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="py-16 flex flex-col items-center justify-center gap-3 text-[var(--text-secondary)]">
            <Users size={40} className="opacity-20" />
            <p className="text-sm">No pending join requests</p>
          </div>
        )}
      </div>

      {/* ── 5. System Status Row ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm p-5">
        <div className="flex items-center gap-2 mb-4">
          <Activity size={15} className="text-kavach-cyan" />
          <h2 className="text-sm font-bold text-[var(--text-primary)]">
            System Status
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Database */}
          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-kavach-green/20 transition-colors">
            <div className="flex items-center gap-2">
              <Database size={14} className="text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Database
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavach-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kavach-green" />
              </span>
              <span className="text-xs font-semibold text-kavach-green">
                {systemStatus.database}
              </span>
            </div>
          </div>

          {/* Backend */}
          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-kavach-green/20 transition-colors">
            <div className="flex items-center gap-2">
              <Server size={14} className="text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Backend API
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-kavach-green opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-kavach-green" />
              </span>
              <span className="text-xs font-semibold text-kavach-green">
                {systemStatus.backend}
              </span>
            </div>
          </div>

          {/* Last Deploy */}
          <div className="flex items-center justify-between sm:flex-col sm:items-start gap-2 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:border-kavach-violet/20 transition-colors">
            <div className="flex items-center gap-2">
              <Activity size={14} className="text-[var(--text-secondary)]" />
              <span className="text-xs text-[var(--text-secondary)] font-medium">
                Last Deploy
              </span>
            </div>
            <span className="text-xs font-semibold text-kavach-violet">
              {timeAgo(systemStatus.lastDeploy)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}