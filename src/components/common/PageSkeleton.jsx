"use client";

/**
 * Premium skeleton components with shimmer. Use for consistent loading states
 * across seller/customer dashboards and listing pages.
 */

function SkeletonBar({ className = "", height = "h-4" }) {
  return (
    <div
      className={`skeleton-shimmer rounded-xl ${height} ${className}`}
      aria-hidden="true"
    />
  );
}

/** In-page dashboard content skeleton (title + stat cards + blocks). Use when stats/data are loading inside seller/customer dashboard. */
export function DashboardContentSkeleton() {
  return (
    <div className="space-y-6 w-full">
      <div>
        <div className="skeleton-shimmer h-7 w-48 rounded-xl mb-2" />
        <div className="skeleton-shimmer h-4 w-72 max-w-full rounded-xl" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="rounded-2xl border border-gray-100 bg-white/80 p-6 h-32 skeleton-shimmer" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-gray-100 bg-white/80 p-6 h-64 skeleton-shimmer" />
        <div className="rounded-2xl border border-gray-100 bg-white/80 p-6 h-64 skeleton-shimmer" />
      </div>
    </div>
  );
}

/** Full-page dashboard-style skeleton (title + stats + table). Use in ProtectedRoute so there is a single loading phase. */
export function DashboardPageSkeleton() {
  return (
    <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <SkeletonBar className="h-8 w-48 mb-2" />
        <SkeletonBar className="h-4 w-72 max-w-full" />
      </div>
      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white/80 p-5 shadow-sm"
          >
            <SkeletonBar className="h-3 w-20 mb-3" />
            <SkeletonBar className="h-7 w-24" />
          </div>
        ))}
      </div>
      {/* Table */}
      <div className="rounded-2xl border border-gray-100 bg-white/80 shadow-sm overflow-hidden">
        <div className="h-12 skeleton-shimmer" />
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="h-14 border-t border-gray-100 flex gap-4 px-5 items-center"
          >
            <SkeletonBar className="h-9 w-9 rounded-lg shrink-0" />
            <SkeletonBar className="h-4 flex-1 max-w-[40%]" />
            <SkeletonBar className="h-4 w-20" />
            <SkeletonBar className="h-4 w-16" />
          </div>
        ))}
      </div>
    </div>
  );
}

export function PageSkeleton() {
  return (
    <div className="w-full px-4 py-8 max-w-7xl mx-auto">
      <div className="mb-6">
        <SkeletonBar className="h-8 w-1/3 mb-2" />
        <SkeletonBar className="h-4 w-2/3" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm"
          >
            <div className="h-48 skeleton-shimmer" />
            <div className="p-4 space-y-3">
              <SkeletonBar className="h-6 w-6 rounded-full" />
              <SkeletonBar className="h-4 w-full" />
              <SkeletonBar className="h-3 w-1/3" />
              <SkeletonBar className="h-3 w-1/2" />
              <div className="flex justify-between pt-3 border-t border-gray-100">
                <SkeletonBar className="h-6 w-20" />
                <SkeletonBar className="h-10 w-10 rounded-xl" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 8 }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white overflow-hidden shadow-sm">
      <div className="h-12 skeleton-shimmer" />
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-14 border-t border-gray-100 flex gap-4 px-5 items-center"
        >
          <SkeletonBar className="h-8 w-8 rounded-lg shrink-0" />
          <SkeletonBar className="flex-1 h-4 max-w-[35%]" />
          <SkeletonBar className="h-4 w-20" />
          <SkeletonBar className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
      <SkeletonBar className="h-6 w-1/2 mb-4" />
      <SkeletonBar className="h-4 w-full mb-2" />
      <SkeletonBar className="h-4 w-3/4 mb-2" />
      <SkeletonBar className="h-4 w-1/2" />
    </div>
  );
}

export function FormSkeleton() {
  return (
    <div className="max-w-xl space-y-5">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i}>
          <SkeletonBar className="h-4 w-24 mb-2" />
          <SkeletonBar className="h-12 w-full rounded-xl" />
        </div>
      ))}
      <SkeletonBar className="h-12 w-32 rounded-xl mt-6" />
    </div>
  );
}
