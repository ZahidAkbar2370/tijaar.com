"use client";

/** Amber label for featured / boosted promoted products. */
export default function PromotionDiamond({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-gradient-to-r from-amber-400 to-amber-600 shadow-sm ring-1 ring-white/90 whitespace-nowrap ${className}`}
      title="Boosted listing"
      aria-label="Boosted listing"
    >
      Boosted
    </span>
  );
}
