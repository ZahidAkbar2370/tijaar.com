"use client";

import { Star } from "lucide-react";

const SIZE_CLASS = {
  xs: "w-3 h-3",
  sm: "w-3.5 h-3.5",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

/**
 * Always renders 5 stars. Yellow fill only for stars up to the rating;
 * remaining stars stay gray (unfilled).
 */
export default function RatingStars({
  rating = 0,
  size = "sm",
  showValue = false,
  valueClassName = "text-[10px] font-semibold text-gray-600",
  className = "",
}) {
  const value = Number(rating);
  const numeric = !Number.isNaN(value) && value > 0 ? value : 0;
  const filled = Math.min(5, Math.round(numeric));
  const starSize = SIZE_CLASS[size] || SIZE_CLASS.sm;

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      title={numeric > 0 ? `${numeric.toFixed(1)} out of 5` : "No ratings yet"}
      aria-label={numeric > 0 ? `Rating ${numeric.toFixed(1)} out of 5` : "No ratings yet"}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${starSize} ${
            i < filled ? "text-amber-400 fill-amber-400" : "text-gray-300 fill-none"
          }`}
          aria-hidden="true"
        />
      ))}
      {showValue && (
        <span className={`ml-0.5 ${valueClassName}`}>
          {numeric > 0 ? numeric.toFixed(1) : "—"}
        </span>
      )}
    </span>
  );
}
