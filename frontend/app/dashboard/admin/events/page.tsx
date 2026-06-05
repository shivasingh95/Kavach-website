"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Calendar,
  MapPin,
  Globe,
  Edit2,
  Trash2,
  Users,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  ImageOff,
  ToggleLeft,
  ToggleRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { EventForm, EventData } from "@/components/admin/EventForm";

// ─── Types ───────────────────────────────────────────────────────────────────

type StatusFilter = "all" | "published" | "draft";

interface ConfirmDialog {
  open: boolean;
  eventId: string | null;
  eventTitle: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── Skeleton row ────────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr className="border-b border-white/[0.04] animate-pulse">
      <td className="px-4 py-3">
        <div className="w-10 h-10 rounded-lg bg-white/5" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3.5 w-40 bg-white/5 rounded mb-1.5" />
        <div className="h-2.5 w-24 bg-white/5 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-28 bg-white/5 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-16 rounded-full bg-white/5" />
      </td>
      <td className="px-4 py-3">
        <div className="h-3 w-10 bg-white/5 rounded" />
      </td>
      <td className="px-4 py-3">
        <div className="h-5 w-20 rounded-full bg-white/5" />
      </td>
      <td className="px-4 py-3">
        <div className="flex gap-2">
          <div className="h-7 w-7 rounded-lg bg-white/5" />
          <div className="h-7 w-7 rounded-lg bg-white/5" />
          <div className="h-7 w-7 rounded-lg bg-white/5" />
        </div>
      </td>
    </tr>
  );
}

// ─── Delete Confirm Dialog ────────────────────────────────────────────────────

function DeleteConfirmDialog({
  dialog,
  onConfirm,
  onCancel,
  isDeleting,
}: {
  dialog: ConfirmDialog;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}) {
  if (!dialog.open) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onCancel}
      />
      {/* Dialog */}
      <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-[#0d1224] p-6 shadow-2xl">
        <div className="flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-full bg-red-500/10 border border-red-500/20">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--text-primary)]">
              Delete Event?
            </h3>
            <p className="text-sm text-[var(--text-secondary)] mt-1">
              <span className="font-medium text-[var(--text-primary)]">
                "{dialog.eventTitle}"
              </span>{" "}
              will be permanently removed. This action cannot be undone.
            </p>
          </div>
          <div className="flex gap-3 w-full">
            <Button
              variant="ghost"
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 border border-white/10 hover:bg-white/5"
            >
              Cancel
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isDeleting}
              className="flex-1 bg-red-500/10 text-red-400 border border-red-500/20 
                hover:bg-red-500/20 hover:border-red-500/40 transition-all gap-2"
            >
              {isDeleting ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                <Trash2 size={14} />
              )}
              Delete
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 8;

export default function AdminEventsPage() {
  const { isAdmin, isLoading: authLoading } = useAuth();
  const router = useRouter();

  // ── State ──
  const [events, setEvents] = useState<EventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [currentPage, setCurrentPage] = useState(1);

  // Sheet state
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventData | null>(null);

  // Delete confirm
  const [confirmDialog, setConfirmDialog] = useState<ConfirmDialog>({
    open: false,
    eventId: null,
    eventTitle: "",
  });
  const [isDeleting, setIsDeleting] = useState(false);

  // Toggling publish state
  const [togglingId, setTogglingId] = useState<string | null>(null);

  // ── Auth guard ──
  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required.");
      router.replace("/dashboard");
    }
  }, [authLoading, isAdmin, router]);

  // ── Fetch Events ──
  const fetchEvents = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get("/events");
      const data: EventData[] =
        res.data?.data?.events ?? res.data?.events ?? [];
      setEvents(data);
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to load events");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Client-side filter + pagination ──
  const filtered = useMemo(() => {
    let result = events;

    // Status filter
    if (statusFilter === "published") result = result.filter((e) => e.isPublished);
    if (statusFilter === "draft") result = result.filter((e) => !e.isPublished);

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.title.toLowerCase().includes(q) ||
          e.description?.toLowerCase().includes(q) ||
          e.location?.toLowerCase().includes(q)
      );
    }

    return result;
  }, [events, statusFilter, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, statusFilter]);

  // ── Open Sheet ──
  const openCreateSheet = () => {
    setEditingEvent(null);
    setIsSheetOpen(true);
  };

  const openEditSheet = (event: EventData) => {
    setEditingEvent(event);
    setIsSheetOpen(true);
  };

  const handleSheetSuccess = () => {
    setIsSheetOpen(false);
    setEditingEvent(null);
    fetchEvents();
  };

  const handleSheetCancel = () => {
    setIsSheetOpen(false);
    setEditingEvent(null);
  };

  // ── Inline Publish Toggle ──
  const handleTogglePublish = async (event: EventData) => {
    setTogglingId(event.id);
    try {
      await api.patch(`/events/${event.id}`, {
        isPublished: !event.isPublished,
      });
      toast.success(
        event.isPublished
          ? `"${event.title}" moved to drafts`
          : `"${event.title}" published ✓`
      );
      // Optimistic update
      setEvents((prev) =>
        prev.map((e) =>
          e.id === event.id ? { ...e, isPublished: !e.isPublished } : e
        )
      );
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ?? "Failed to update publish status"
      );
    } finally {
      setTogglingId(null);
    }
  };

  // ── Delete ──
  const initiateDelete = (event: EventData) => {
    setConfirmDialog({ open: true, eventId: event.id, eventTitle: event.title });
  };

  const handleDeleteConfirm = async () => {
    if (!confirmDialog.eventId) return;
    setIsDeleting(true);
    try {
      await api.delete(`/events/${confirmDialog.eventId}`);
      toast.success("Event deleted");
      setEvents((prev) => prev.filter((e) => e.id !== confirmDialog.eventId));
      setConfirmDialog({ open: false, eventId: null, eventTitle: "" });
    } catch (err: any) {
      toast.error(err.response?.data?.message ?? "Failed to delete event");
    } finally {
      setIsDeleting(false);
    }
  };

  // ── Stats ──
  const publishedCount = events.filter((e) => e.isPublished).length;
  const draftCount = events.filter((e) => !e.isPublished).length;

  if (authLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="animate-spin text-kavach-cyan" size={28} />
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <>
      {/* ── Delete Confirm Overlay ────────────────────────────────────────── */}
      <DeleteConfirmDialog
        dialog={confirmDialog}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setConfirmDialog({ open: false, eventId: null, eventTitle: "" })
        }
        isDeleting={isDeleting}
      />

      {/* ── Sheet (Create / Edit) ─────────────────────────────────────────── */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent
          className="w-full sm:max-w-[580px] overflow-y-auto bg-[#080d1a] border-l border-white/10 
            flex flex-col gap-0 p-0"
        >
          {/* Sheet Header */}
          <SheetHeader className="sticky top-0 z-10 bg-[#080d1a]/95 backdrop-blur-md border-b border-white/10 px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-kavach-cyan/10 border border-kavach-cyan/20">
                <Calendar size={16} className="text-kavach-cyan" />
              </div>
              <div>
                <SheetTitle className="text-base font-bold text-[var(--text-primary)]">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </SheetTitle>
                <SheetDescription className="text-xs text-[var(--text-secondary)] mt-0.5">
                  {editingEvent
                    ? `Editing: ${editingEvent.title}`
                    : "Fill in the details to publish or draft a new event"}
                </SheetDescription>
              </div>
            </div>
          </SheetHeader>

          {/* Sheet Body */}
          <div className="flex-1 px-6 py-5 overflow-y-auto">
            <EventForm
              event={editingEvent}
              onSuccess={handleSheetSuccess}
              onCancel={handleSheetCancel}
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <div className="space-y-6">
        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-black tracking-tight text-gradient">
                Events
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20">
                {events.length}
              </span>
            </div>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5">
              Create, schedule, and manage Kavach club events.
            </p>

            {/* Mini stat row */}
            <div className="flex items-center gap-4 mt-3">
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-kavach-green inline-block" />
                {publishedCount} published
              </span>
              <span className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[var(--text-muted)] inline-block" />
                {draftCount} drafts
              </span>
            </div>
          </div>

          <Button
            onClick={openCreateSheet}
            className="bg-kavach-cyan text-black font-bold hover:bg-kavach-cyan/90 gap-2 flex-shrink-0"
          >
            <Plus size={16} />
            New Event
          </Button>
        </div>

        {/* ── Filters Row ──────────────────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]"
            />
            <input
              type="text"
              id="event-search"
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 rounded-xl border border-white/10 bg-[#0d1224] 
                text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)]
                focus:outline-none focus:border-kavach-cyan/30 focus:ring-1 focus:ring-kavach-cyan/10 transition-colors"
            />
          </div>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1 bg-[#0d1224] border border-white/10 rounded-xl p-1">
            {(["all", "published", "draft"] as StatusFilter[]).map((f) => (
              <button
                key={f}
                id={`filter-${f}`}
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all ${
                  statusFilter === f
                    ? "bg-kavach-cyan/15 text-kavach-cyan border border-kavach-cyan/20"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5"
                }`}
              >
                {f === "all" ? `All (${events.length})` : null}
                {f === "published" ? `Published (${publishedCount})` : null}
                {f === "draft" ? `Drafts (${draftCount})` : null}
              </button>
            ))}
          </div>
        </div>

        {/* ── Table ────────────────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-white/5 bg-[#0d1224]/80 backdrop-blur-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.015]">
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)] w-[60px]">
                    Image
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Title
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Venue
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    RSVPs
                  </th>
                  <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Status
                  </th>
                  <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-widest text-[var(--text-secondary)]">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.03]">
                {isLoading ? (
                  Array.from({ length: PAGE_SIZE }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))
                ) : paginated.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-20 text-center text-[var(--text-secondary)]"
                    >
                      <div className="flex flex-col items-center gap-3">
                        <Calendar size={40} className="opacity-15" />
                        <p className="text-sm font-medium">No events found</p>
                        {searchQuery || statusFilter !== "all" ? (
                          <p className="text-xs opacity-60">
                            Try adjusting your search or filters
                          </p>
                        ) : (
                          <Button
                            onClick={openCreateSheet}
                            size="sm"
                            className="mt-2 bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20 
                              hover:bg-kavach-cyan/20 text-xs gap-1.5"
                          >
                            <Plus size={13} />
                            Create your first event
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : (
                  paginated.map((event) => (
                    <tr
                      key={event.id}
                      className="group hover:bg-white/[0.02] transition-colors"
                    >
                      {/* Thumbnail */}
                      <td className="px-4 py-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden border border-white/10 bg-white/5 flex-shrink-0 flex items-center justify-center">
                          {event.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={event.imageUrl}
                              alt={event.title}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display =
                                  "none";
                              }}
                            />
                          ) : (
                            <ImageOff
                              size={14}
                              className="text-[var(--text-muted)]"
                            />
                          )}
                        </div>
                      </td>

                      {/* Title + slug */}
                      <td className="px-4 py-3 max-w-[220px]">
                        <p className="font-semibold text-[var(--text-primary)] text-xs truncate">
                          {event.title}
                        </p>
                        {event.slug && (
                          <p className="text-[10px] text-[var(--text-muted)] font-mono truncate mt-0.5">
                            /{event.slug}
                          </p>
                        )}
                      </td>

                      {/* Date */}
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)]">
                          <Clock size={11} className="flex-shrink-0" />
                          {formatDate(event.date)}
                        </div>
                      </td>

                      {/* Venue */}
                      <td className="px-4 py-3">
                        {event.isOnline ? (
                          <Badge className="bg-kavach-cyan/10 text-kavach-cyan border border-kavach-cyan/20 text-[10px] gap-1 font-semibold">
                            <Globe size={10} />
                            Online
                          </Badge>
                        ) : (
                          <span className="flex items-center gap-1 text-[11px] text-[var(--text-secondary)] max-w-[120px] truncate">
                            <MapPin size={10} className="flex-shrink-0" />
                            {event.location || "—"}
                          </span>
                        )}
                      </td>

                      {/* RSVPs */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1 text-xs text-[var(--text-secondary)]">
                          <Users size={11} />
                          {event.rsvpCount ?? 0}
                        </div>
                      </td>

                      {/* Status Toggle */}
                      <td className="px-4 py-3">
                        <button
                          id={`toggle-publish-${event.id}`}
                          disabled={togglingId === event.id}
                          onClick={() => handleTogglePublish(event)}
                          title={
                            event.isPublished
                              ? "Click to unpublish"
                              : "Click to publish"
                          }
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[10px] font-semibold
                            transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
                              event.isPublished
                                ? "bg-kavach-green/10 text-kavach-green border-kavach-green/20 hover:bg-kavach-green/20"
                                : "bg-white/5 text-[var(--text-secondary)] border-white/10 hover:bg-white/10"
                            }`}
                        >
                          {togglingId === event.id ? (
                            <Loader2 size={10} className="animate-spin" />
                          ) : event.isPublished ? (
                            <>
                              <ToggleRight size={12} />
                              Published
                            </>
                          ) : (
                            <>
                              <ToggleLeft size={12} />
                              Draft
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                          {/* Quick publish/unpublish icon */}
                          <button
                            id={`quick-status-${event.id}`}
                            onClick={() => handleTogglePublish(event)}
                            disabled={togglingId === event.id}
                            title={
                              event.isPublished ? "Unpublish" : "Publish"
                            }
                            className={`p-1.5 rounded-lg border transition-all disabled:opacity-40 ${
                              event.isPublished
                                ? "border-kavach-green/20 bg-kavach-green/5 text-kavach-green hover:bg-kavach-green/15"
                                : "border-white/10 bg-white/5 text-[var(--text-secondary)] hover:bg-white/10"
                            }`}
                          >
                            {event.isPublished ? (
                              <CheckCircle2 size={13} />
                            ) : (
                              <XCircle size={13} />
                            )}
                          </button>

                          {/* Edit */}
                          <button
                            id={`edit-event-${event.id}`}
                            onClick={() => openEditSheet(event)}
                            title="Edit event"
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] 
                              hover:text-kavach-cyan hover:border-kavach-cyan/20 hover:bg-kavach-cyan/5 transition-all"
                          >
                            <Edit2 size={13} />
                          </button>

                          {/* Delete */}
                          <button
                            id={`delete-event-${event.id}`}
                            onClick={() => initiateDelete(event)}
                            title="Delete event"
                            className="p-1.5 rounded-lg border border-white/10 bg-white/5 text-[var(--text-secondary)] 
                              hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/5 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* ── Pagination ──────────────────────────────────────────────────── */}
          {!isLoading && filtered.length > PAGE_SIZE && (
            <div className="flex items-center justify-between px-6 py-3 border-t border-white/5 bg-white/[0.01]">
              <p className="text-xs text-[var(--text-secondary)]">
                Showing{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {(currentPage - 1) * PAGE_SIZE + 1}–
                  {Math.min(currentPage * PAGE_SIZE, filtered.length)}
                </span>{" "}
                of{" "}
                <span className="text-[var(--text-primary)] font-medium">
                  {filtered.length}
                </span>{" "}
                events
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"
                >
                  <ChevronLeft size={14} />
                </Button>
                <span className="text-xs text-[var(--text-secondary)] min-w-[60px] text-center">
                  Page {currentPage} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  className="size-7 border border-white/10 hover:bg-white/5 disabled:opacity-30"
                >
                  <ChevronRight size={14} />
                </Button>
              </div>
            </div>
          )}

          {/* ── Footer summary ─────────────────────────────────────────────── */}
          {!isLoading && filtered.length > 0 && filtered.length <= PAGE_SIZE && (
            <div className="px-6 py-3 border-t border-white/5 bg-white/[0.01]">
              <p className="text-xs text-[var(--text-secondary)]">
                {filtered.length} event{filtered.length !== 1 ? "s" : ""}{" "}
                {statusFilter !== "all"
                  ? `(${statusFilter})`
                  : "total"}
              </p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
