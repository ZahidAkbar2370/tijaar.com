"use client";

/** Hot-sale promotion label for products with an active hot package. */
export default function HotDealBadge({ className = "" }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold text-white bg-gradient-to-r from-rose-500 to-orange-500 shadow-sm ring-1 ring-white/90 whitespace-nowrap ${className}`}
      title="Hot deal"
      aria-label="Hot deal"
    >
      Hot Deal
    </span>
  );
}
