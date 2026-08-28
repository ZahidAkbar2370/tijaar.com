export default function MainLoading() {
  return (
    <div className="flex flex-1 items-center justify-center min-h-[50vh]" aria-label="Loading">
      <div className="flex flex-col items-center gap-4">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-[#1790d7] border-t-transparent" />
        <p className="text-sm font-medium text-gray-600">Loading…</p>
      </div>
    </div>
  );
}
