"use client";

import { Gem } from "lucide-react";

/** Amber diamond badge for featured promoted products. */
export default function PromotionDiamond({ className = "" }) {
  return (
    <span
      className={`absolute top-2 left-2 z-10 inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-amber-300 via-amber-400 to-amber-600 shadow-md ring-2 ring-white/90 ${className}`}
      title="Featured listing"
      aria-label="Featured listing"
    >
      <Gem className="w-4 h-4 text-white drop-shadow-sm" strokeWidth={2.25} />
    </span>
  );
}
