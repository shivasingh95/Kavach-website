"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  ChevronDown, ChevronRight, Loader2, AlertTriangle, CheckCircle2,
  XCircle, Github, Linkedin, Search, Calendar, User as UserIcon, X,
  ChevronLeft, ChevronRightIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

// ─── Types ───────────────────────────────────────────────────────────────────

type JoinStatus = "PENDING" | "ACCEPTED" | "REJECTED";

interface JoinRequest {
  id: string;
  fullName: string;
  email: string;
  yearOfStudy?: string;
  college?: string;
  whyJoin?: string;
  experience?: string;
  skills?: string[];
  githubUrl?: string;
  linkedinUrl?: string;
  status: JoinStatus;
  createdAt: string;
  reviewNote?: string;
}

type FilterType = "PENDING" | "ACCEPTED" | "REJECTED" | "ALL";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}
function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return `${days}d ago`;
}

function StatusBadge({ status }: { status: JoinStatus }) {
  const map: Record<JoinStatus, { color: string; label: string }> = {
    PENDING: { color: "#f59e0b", label: "Pending" },
    ACCEPTED: { color: "#06d6a0", label: "Accepted" },
    REJECTED: { color: "#ef4444", label: "Rejected" },
  };
  const { color, label } = map[status];
  return (
    <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold"
      style={{ color, background: `${color}15`, border: `1px solid ${color}30` }}>{label}</span>
  );
}

// ─── Accept Confirm Dialog ────────────────────────────────────────────────────

function AcceptDialog({ req, onConfirm, onClose, isLoading }: {
  req: JoinRequest | null; onConfirm: () => void; onClose: () => void; isLoading: boolean;
}) {
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-kavach-green/10 border border-kavach-green/20 flex-shrink-0">
            <CheckCircle2 size={20} className="text-kavach-green" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Accept Application?</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">
              Accept <span className="font-semibold text-[var(--text-primary)]">{req.fullName}</span>? A Member account will be created and they'll receive a welcome email with their login link.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]">Cancel</Button>
          <Button onClick={onConfirm} disabled={isLoading}
            className="flex-1 bg-kavach-green/10 text-kavach-green border border-kavach-green/20 hover:bg-kavach-green/20 gap-2">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}Accept & Create Account
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Reject Dialog ────────────────────────────────────────────────────────────

function RejectDialog({ req, onConfirm, onClose, isLoading }: {
  req: JoinRequest | null; onConfirm: (note: string) => void; onClose: () => void; isLoading: boolean;
}) {
  const [note, setNote] = useState("");
  useEffect(() => { setNote(""); }, [req]);
  if (!req) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0">
            <XCircle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[var(--text-primary)]">Reject Application</h3>
            <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">A rejection email will be sent to <span className="font-semibold text-[var(--text-primary)]">{req.fullName}</span>.</p>
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[11px] text-[var(--text-secondary)]">Rejection note (optional — included in email):</label>
          <textarea value={note} onChange={e => setNote(e.target.value)} rows={3} placeholder="e.g. We'll consider again in the next recruitment cycle..."
            className="w-full rounded-xl border border-white/10 bg-[#080d1a] px-3 py-2 text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-red-500/30 resize-none transition-colors" />
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="flex-1 border border-white/10 hover:bg-white/5 text-[var(--text-secondary)]">Cancel</Button>
          <Button onClick={() => onConfirm(note)} disabled={isLoading}
            className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-2">
            {isLoading ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}Reject
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Expandable Row ───────────────────────────────────────────────────────────

function JoinRequestRow({
  req, isSelected, onSelect, onAccept, onReject, processingId,
}: {
  req: JoinRequest; isSelected: boolean; onSelect: (id: string) => void;
  onAccept: (req: JoinRequest) => void; onReject: (req: JoinRequest) => void;
  processingId: string | null;
}) {
  const [expanded, setExpanded] = useState(false);
  const isProcessing = processingId === req.id;

  return (
    <>
      <tr className={`border-b border-white/[0.04] transition-colors ${expanded ? "bg-white/[0.025]" : "hover:bg-white/[0.02]"}`}>
        {/* Checkbox */}
        <td className="px-4 py-3 w-8" onClick={e => e.stopPropagation()}>
          <Checkbox checked={isSelected} onCheckedChange={() => onSelect(req.id)}
            className="border-white/20 data-[state=checked]:border-kavach-cyan data-[state=checked]:bg-kavach-cyan" />
        </td>
        {/* Expand */}
        <td className="px-2 py-3 w-6">
          <button onClick={() => setExpanded(v => !v)} className="p-1 rounded hover:bg-white/10 text-[var(--text-muted)] transition-colors">
            {expanded ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
          </button>
        </td>
        {/* Name + email */}
        <td className="px-4 py-3">
          <p className="text-xs font-semibold text-[var(--text-primary)]">{req.fullName}</p>
          <p className="text-[10px] text-[var(--text-secondary)]">{req.email}</p>
        </td>
        {/* Year + College */}
        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)]">
          {[req.yearOfStudy, req.college].filter(Boolean).join(" • ") || "—"}
        </td>
        {/* Applied */}
        <td className="px-4 py-3 text-[11px] text-[var(--text-secondary)] whitespace-nowrap">{timeAgo(req.createdAt)}</td>
        {/* Status */}
        <td className="px-4 py-3"><StatusBadge status={req.status} /></td>
        {/* Actions */}
        <td className="px-4 py-3">
          {req.status === "PENDING" ? (
            <div className="flex items-center gap-1.5">
              <button disabled={isProcessing} onClick={() => onAccept(req)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-kavach-green/20 bg-kavach-green/10 text-kavach-green hover:bg-kavach-green/20 text-[10px] font-semibold transition-all disabled:opacity-40">
                {isProcessing ? <Loader2 size={10} className="animate-spin" /> : <CheckCircle2 size={10} />}Accept
              </button>
              <button disabled={isProcessing} onClick={() => onReject(req)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 text-[10px] font-semibold transition-all disabled:opacity-40">
                <XCircle size={10} />Reject
              </button>
            </div>
          ) : (
            <span className="text-[11px] text-[var(--text-muted)]">{req.status === "ACCEPTED" ? "✓ Accepted" : "✕ Rejected"}</span>
          )}
        </td>
      </tr>

      {/* Expanded details */}
      {expanded && (
        <tr>
          <td colSpan={7} className="px-4 pb-4 bg-white/[0.025] border-b border-white/[0.04]">
            <div className="ml-10 rounded-xl border border-white/10 bg-[#080d1a] p-5 space-y-4">
              {req.whyJoin && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Why they want to join</p>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{req.whyJoin}</p>
                </div>
              )}
              {req.experience && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Experience</p>
                  <p className="text-xs text-[var(--text-primary)] leading-relaxed">{req.experience}</p>
                </div>
              )}
              {req.skills && req.skills.length > 0 && (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1.5">Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {req.skills.map(s => (
                      <span key={s} className="px-2 py-0.5 rounded-md bg-kavach-violet/10 text-kavach-violet border border-kavach-violet/20 text-[10px] font-medium">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              {(req.githubUrl || req.linkedinUrl) && (
                <div className="flex items-center gap-4">
                  {req.githubUrl && <a href={req.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-kavach-cyan hover:underline"><Github size={13} />GitHub</a>}
                  {req.linkedinUrl && <a href={req.linkedinUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs text-kavach-cyan hover:underline"><Linkedin size={13} />LinkedIn</a>}
                </div>
              )}
              {req.reviewNote && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-3">
                  <p className="text-[10px] font-semibold text-amber-400 mb-1">Review Note</p>
                  <p className="text-xs text-[var(--text-primary)]">{req.reviewNote}</p>
                </div>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

export default function AdminJoinRequestsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("PENDING");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const [acceptTarget, setAcceptTarget] = useState<JoinRequest | null>(null);
  const [rejectTarget, setRejectTarget] = useState<JoinRequest | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [bulkRejecting, setBulkRejecting] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAdmin) { toast.error("Admin access required"); router.replace("/dashboard"); }
  }, [authLoading, isAdmin, router]);

  const fetchRequests = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/join");
      // res.data.data is the array of requests directly
      setRequests(Array.isArray(res.data?.data) ? res.data.data : []);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to load requests"); }
    finally { setIsLoading(false); }
  }, []);

  useEffect(() => { fetchRequests(); }, [fetchRequests]);
  useEffect(() => { setPage(1); setSelectedIds(new Set()); }, [filter, search]);

  const filtered = useMemo(() => {
    let data = filter === "ALL" ? requests : requests.filter(r => r.status === filter);
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(r => r.fullName?.toLowerCase().includes(q) || r.email?.toLowerCase().includes(q) || r.college?.toLowerCase().includes(q));
    }
    return data;
  }, [requests, filter, search]);

  const paginated = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));

  const counts = useMemo(() => {
    const now = new Date(); const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
    return {
      pending: requests.filter(r => r.status === "PENDING").length,
      acceptedMonth: requests.filter(r => r.status === "ACCEPTED" && new Date(r.createdAt).getTime() >= monthStart).length,
      rejectedMonth: requests.filter(r => r.status === "REJECTED" && new Date(r.createdAt).getTime() >= monthStart).length,
    };
  }, [requests]);

  const handleAccept = async (req: JoinRequest) => {
    setProcessingId(req.id);
    try {
      await api.patch(`/join/${req.id}`, { status: "ACCEPTED" });
      toast.success(`${req.fullName} accepted! Member account created.`);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "ACCEPTED" } : r));
      setAcceptTarget(null);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to accept"); }
    finally { setProcessingId(null); }
  };

  const handleReject = async (req: JoinRequest, note: string) => {
    setProcessingId(req.id);
    try {
      await api.patch(`/join/${req.id}`, { status: "REJECTED", reviewNote: note || undefined });
      toast.success(`${req.fullName}'s application rejected`);
      setRequests(prev => prev.map(r => r.id === req.id ? { ...r, status: "REJECTED", reviewNote: note } : r));
      setRejectTarget(null);
    } catch (err: any) { toast.error(err.response?.data?.message ?? "Failed to reject"); }
    finally { setProcessingId(null); }
  };

  const handleBulkReject = async () => {
    if (selectedIds.size === 0) return;
    setBulkRejecting(true);
    let succeeded = 0;
    for (const id of Array.from(selectedIds)) {
      try {
        await api.patch(`/join/${id}`, { status: "REJECTED" });
        succeeded++;
      } catch {}
    }
    toast.success(`${succeeded} request${succeeded !== 1 ? "s" : ""} rejected`);
    setRequests(prev => prev.map(r => selectedIds.has(r.id) ? { ...r, status: "REJECTED" } : r));
    setSelectedIds(new Set());
    setBulkRejecting(false);
  };

  const toggleSelect = (id: string) => setSelectedIds(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const selectAllOnPage = () => {
    const pendingOnPage = paginated.filter(r => r.status === "PENDING").map(r => r.id);
    setSelectedIds(prev => { const n = new Set(prev); pendingOnPage.forEach(id => n.add(id)); return n; });
  };

  const filterTabs: { value: FilterType; label: string }[] = [
    { value: "PENDING", label: `Pending (${counts.pending})` },
    { value: "ACCEPTED", label: `Accepted (${counts.acceptedMonth} this month)` },
    { value: "REJECTED", label: `Rejected (${counts.rejectedMonth} this month)` },
    { value: "ALL", label: `All (${requests.length})` },
  ];

  if (authLoading) return <div className="flex h-64 items-center justify-center"><Loader2 className="animate-spin text-kavach-cyan" size={28} /></div>;
  if (!isAdmin) return null;

  return (
    <>
      <AcceptDialog req={acceptTarget} onConfirm={() => acceptTarget && handleAccept(acceptTarget)} onClose={() => setAcceptTarget(null)} isLoading={processingId === acceptTarget?.id} />
      <RejectDialog req={rejectTarget} onConfirm={(note) => rejectTarget && handleReject(rejectTarget, note)} onClose={() => setRejectTarget(null)} isLoading={processingId === rejectTarget?.id} />

      <div className="space-y-6">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight text-gradient">Join Requests</h1>
            {counts.pending > 0 && <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">{counts.pending} pending</span>}
          </div>
          <p className="text-sm text-[var(--text-secondary)] mt-0.5">Review membership applications and manage club recruitment.</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Pending", value: counts.pending, color: "#f59e0b" },
            { label: "Accepted (this month)", value: counts.acceptedMonth, color: "#06d6a0" },
            { label: "Rejected (this month)", value: counts.rejectedMonth, color: "#ef4444" },
          ].map(s => (
            <div key={s.label} className="rounded-xl border border-white/10 bg-[#0d1224] p-4">
              <p className="text-xl font-black" style={{ color: s.color }}>{s.value}</p>
              <p className="text-[11px] text-[var(--text-secondary)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Filters + bulk actions */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1 bg-[#0d1224] border border-white/10 rounded-xl p-1 flex-wrap">
            {filterTabs.map(t => (
              <button key={t.value} id={`jr-filter-${t.value.toLowerCase()}`} onClick={() => setFilter(t.value)}
                className={`px-3 py-1.5 rounded-lg text-[11px] font-semibold transition-all ${filter === t.value ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/20" : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"}`}>
                {t.label}
              </button>
            ))}
          </div>
          <div className="relative flex-1 max-w-xs">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input placeholder="Search by name, email, branch..." value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-[#0d1224] text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-kavach-cyan/30 transition-colors" />
          </div>
          {selectedIds.size > 0 && (
            <Button onClick={handleBulkReject} disabled={bulkRejecting}
              className="bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 gap-2 text-xs">
              {bulkRejecting ? <Loader2 size={12} className="animate-spin" /> : <XCircle size={12} />}
              Reject Selected ({selectedIds.size})
            </Button>
          )}
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.015]">
                  <th className="px-4 py-3 w-8">
                    <button onClick={selectAllOnPage} className="text-[10px] text-[var(--text-muted)] hover:text-kavach-cyan transition-colors">All</button>
                  </th>
                  <th className="px-2 py-3 w-6" />
                  {["Applicant", "Year & Branch", "Applied", "Status", "Actions"].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i} className="animate-pulse border-b border-white/[0.04]">
                      {Array.from({ length: 7 }).map((_, j) => <td key={j} className="px-4 py-3"><div className="h-3 bg-white/5 rounded w-20" /></td>)}
                    </tr>
                  ))
                ) : paginated.length === 0 ? (
                  <tr><td colSpan={7} className="py-16 text-center text-[var(--text-secondary)]">
                    <UserIcon size={36} className="mx-auto opacity-15 mb-3" />
                    <p className="text-sm">{search ? "No requests match your search" : `No ${filter.toLowerCase()} requests.`}</p>
                  </td></tr>
                ) : paginated.map(req => (
                  <JoinRequestRow key={req.id} req={req} isSelected={selectedIds.has(req.id)} onSelect={toggleSelect}
                    onAccept={r => setAcceptTarget(r)} onReject={r => setRejectTarget(r)} processingId={processingId} />
                ))}
              </tbody>
            </table>
          </div>
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-white/[0.01]">
              <p className="text-xs text-[var(--text-secondary)]">
                Showing <span className="text-[var(--text-primary)] font-medium">{(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)}</span> of <span className="text-[var(--text-primary)] font-medium">{filtered.length}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" disabled={page === 1} onClick={() => setPage(p => p - 1)} className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronLeft size={14} /></Button>
                <span className="text-xs text-[var(--text-secondary)] min-w-[60px] text-center">Page {page} / {totalPages}</span>
                <Button variant="ghost" size="icon" disabled={page === totalPages} onClick={() => setPage(p => p + 1)} className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"><ChevronRightIcon size={14} /></Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
