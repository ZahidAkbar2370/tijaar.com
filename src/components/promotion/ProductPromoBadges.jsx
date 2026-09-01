"use client";

import PromotionDiamond from "@/components/promotion/PromotionDiamond";
import HotDealBadge from "@/components/promotion/HotDealBadge";

/** Boosted label, Hot Deal label, and optional discount — stacked top-left on product imagery. */
export default function ProductPromoBadges({
  isFeatured = false,
  isHot = false,
  discountLabel = null,
  discountClassName = "px-1.5 py-0.5 bg-red-600 text-white rounded text-[9px] font-bold shadow-sm",
  className = "absolute top-1.5 left-1.5 z-10",
}) {
  if (!isFeatured && !isHot && !discountLabel) return null;

  return (
    <div className={`${className} flex flex-col items-start gap-1 pointer-events-none`}>
      {isFeatured && (
        <PromotionDiamond className="!relative !top-auto !left-auto shrink-0" />
      )}
      {isHot && <HotDealBadge />}
      {discountLabel ? (
        <span className={discountClassName}>{discountLabel}</span>
      ) : null}
    </div>
  );
}
