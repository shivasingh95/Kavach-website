// frontend/components/shared/Skeletons.tsx
import { Skeleton } from "@/components/ui/skeleton";

// ─── CTF Challenge Card Skeleton ─────────────────────────────────────────────
export function CTFChallengeSkeleton() {
  return (
    <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex justify-between items-start">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
        <Skeleton className="h-5 w-12 rounded" />
      </div>
      <Skeleton className="h-6 w-3/4 rounded" />
      <div className="space-y-2 flex-1">
        <Skeleton className="h-4 w-full rounded" />
        <Skeleton className="h-4 w-5/6 rounded" />
        <Skeleton className="h-4 w-2/3 rounded" />
      </div>
      <div className="flex justify-between items-center pt-4 border-t border-white/5 mt-auto">
        <Skeleton className="h-4 w-16 rounded" />
        <Skeleton className="h-9 w-24 rounded-lg" />
      </div>
    </div>
  );
}

// ─── Event Card Skeleton ──────────────────────────────────────────────────────
export function EventCardSkeleton() {
  return (
    <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-5 w-3/4 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-full rounded" />
          <Skeleton className="h-4 w-4/5 rounded" />
        </div>
        <div className="flex justify-between items-center pt-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-4 w-20 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Leaderboard Row Skeleton ─────────────────────────────────────────────────
export function LeaderboardRowSkeleton() {
  return (
    <div className="flex items-center gap-4 p-4">
      <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
      <Skeleton className="h-9 w-9 rounded-full flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-32 rounded" />
        <Skeleton className="h-3 w-20 rounded" />
      </div>
      <Skeleton className="h-5 w-16 rounded" />
    </div>
  );
}

// ─── Stat Card Skeleton ───────────────────────────────────────────────────────
export function StatCardSkeleton() {
  return (
    <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl p-6 space-y-3">
      <div className="flex justify-between items-start">
        <Skeleton className="h-4 w-24 rounded" />
        <Skeleton className="h-8 w-8 rounded-xl" />
      </div>
      <Skeleton className="h-9 w-20 rounded" />
      <Skeleton className="h-3 w-28 rounded" />
    </div>
  );
}

// ─── Dashboard Overview Skeleton ──────────────────────────────────────────────
export function DashboardOverviewSkeleton() {
  return (
    <div className="space-y-8">
      {/* Stat cards row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>
      {/* Two section placeholders */}
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-5 w-32 rounded" />
          {Array.from({ length: 4 }).map((_, i) => (
            <LeaderboardRowSkeleton key={i} />
          ))}
        </div>
        <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl p-6 space-y-4">
          <Skeleton className="h-5 w-32 rounded" />
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-2 py-3 border-b border-white/5 last:border-0">
              <Skeleton className="h-4 w-full rounded" />
              <Skeleton className="h-3 w-2/3 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Blog Card Skeleton ───────────────────────────────────────────────────────
export function BlogCardSkeleton() {
  return (
    <div className="bg-[#0a0f1c]/60 border border-white/5 rounded-2xl overflow-hidden">
      <Skeleton className="h-44 w-full rounded-none" />
      <div className="p-5 space-y-3">
        <Skeleton className="h-4 w-16 rounded-full" />
        <Skeleton className="h-5 w-5/6 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-3 w-full rounded" />
          <Skeleton className="h-3 w-4/5 rounded" />
          <Skeleton className="h-3 w-3/4 rounded" />
        </div>
        <div className="flex gap-3 items-center pt-1">
          <Skeleton className="h-3 w-20 rounded" />
          <Skeleton className="h-3 w-16 rounded" />
        </div>
      </div>
    </div>
  );
}

// ─── Profile Skeleton ─────────────────────────────────────────────────────────
export function ProfileSkeleton() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div className="flex items-center gap-5">
        <Skeleton className="h-20 w-20 rounded-2xl flex-shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-40 rounded" />
          <Skeleton className="h-4 w-28 rounded" />
        </div>
      </div>
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-3 w-20 rounded" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
