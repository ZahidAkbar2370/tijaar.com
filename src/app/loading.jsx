export default function Loading() {
  // Non-blocking: a fixed fullscreen overlay can stay forever when a segment
  // bails to client rendering (e.g. next/dynamic with ssr:false in Navbar).
  return (
    <div className="flex flex-1 items-center justify-center min-h-[40vh]" aria-label="Loading">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#1790d7] border-t-transparent" />
        <p className="text-sm font-medium text-gray-600">Loading…</p>
      </div>
    </div>
  );
}
