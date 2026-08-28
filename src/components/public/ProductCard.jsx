"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { Heart, ShoppingCart, Store, BadgeCheck, MapPin, Zap } from "lucide-react";
import ProductPromoBadges from "@/components/promotion/ProductPromoBadges";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useMarket } from "@/context/MarketContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";
import { trackProductEvent } from "@/lib/productAnalytics";
import RatingStars from "@/components/ui/RatingStars";

function shortShippingLabel(mode, cost) {
  switch (mode) {
    case "free_shipping":
    case "included_in_price":
      return "Free Home Delivery";
    case "customer_pays": {
      const n = cost != null && cost !== "" ? Number(cost) : null;
      if (n != null && !Number.isNaN(n) && n > 0) {
        return `Delivery Charges: Rs ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
      }
      return "Delivery Charges: —";
    }
    default:
      return null;
  }
}

function isFreeShippingMode(mode) {
  return mode === "free_shipping" || mode === "included_in_price";
}

function ProductCardSkeleton({ layout = "grid" }) {
  if (layout === "list") {
    return (
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse flex flex-row h-[132px] sm:h-[140px] w-full">
        <div className="w-[112px] sm:w-[132px] shrink-0 bg-gray-200" />
        <div className="p-3 flex-1 space-y-2">
          <div className="h-3 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-1/4" />
          <div className="flex justify-between items-center pt-2 mt-auto">
            <div className="h-5 bg-gray-200 rounded w-16" />
            <div className="h-9 w-9 bg-gray-200 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }
  return (
    <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 animate-pulse flex flex-col h-full">
      <div className="aspect-[16/10] bg-gray-200 flex-shrink-0" />
      <div className="p-3 space-y-2.5 flex-1 flex flex-col">
        <div className="flex justify-between gap-2">
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="h-4 bg-gray-200 rounded w-14" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-1/3" />
        <div className="h-16 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-2 gap-2 mt-auto">
          <div className="h-9 bg-gray-200 rounded-xl" />
          <div className="h-9 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function ProductCardSkeletonRow({ count = 8, layout = "grid" }) {
  if (layout === "list") {
    return (
      <div className="grid grid-cols-1 gap-3 items-stretch">
        {Array.from({ length: count }).map((_, i) => (
          <ProductCardSkeleton key={i} layout="list" />
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 items-stretch">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProductCard({ product, showAddToCart = true, showBuyNow = true, compact = false, layout = "grid", hideStoreInfo = false }) {
  const router = useRouter();
  const { formatPrice } = useMarket();
  const { addToCart, clearCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useSnackbar();
  const cardRef = useRef(null);
  const isWishlisted = isInWishlist(product.id);
  const imageSrc = optimizeImageUrl(product.image || "/assets/sample-image.webp", {
    width: layout === "list" ? 280 : IMAGE_WIDTHS.productCard,
    quality: 72,
  });
  const storeUrl = product.vendor_slug ? `/seller/${product.vendor_slug}` : null;

  useEffect(() => {
    const el = cardRef.current;
    if (!el || !product?.id) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting && e.intersectionRatio >= 0.4)) {
          trackProductEvent(product.id, "impression");
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [product?.id]);

  const trackClick = () => trackProductEvent(product.id, "click");

  const categoryUrl = product.categorySlug ? `/category/${product.categorySlug}` : null;
  const priceStr = formatPrice?.(product.price) ?? `Rs ${Number(product.price || 0).toLocaleString()}`;
  const originalPriceStr = product.originalPrice
    ? (formatPrice?.(product.originalPrice) ?? `Rs ${Number(product.originalPrice).toLocaleString()}`)
    : null;
  const showCompare =
    product.originalPrice != null &&
    Number(product.originalPrice) > 0 &&
    Number(product.price) < Number(product.originalPrice);

  const availableQty = Number(product.available_quantity ?? product.quantity ?? 0);
  const outOfStock = product.stock_status
    ? product.stock_status === "out_of_stock"
    : product.track_inventory !== false && availableQty <= 0;

  const city = product.vendor_city || product.city || product.store_city || null;
  const shippingLabel = shortShippingLabel(product.shipping_mode, product.shipping_cost_cached);
  const storeRating = product.store_rating ?? product.rating ?? null;

  const colorHex = {
    red: "#ef4444",
    navy: "#1e3a5f",
    white: "#f8fafc",
    black: "#1f2937",
    blue: "#3b82f6",
    green: "#22c55e",
    yellow: "#eab308",
    gray: "#6b7280",
    grey: "#6b7280",
    pink: "#ec4899",
    orange: "#f97316",
    purple: "#a855f7",
    brown: "#92400e",
    beige: "#d4b896",
  };
  const getColorHex = (name) => colorHex[String(name).toLowerCase().trim()] || null;

  const variantOptions = product.variant_options || {};
  const hasVariants = Object.keys(variantOptions).length > 0;

  const showFeatured = !!product.is_featured;
  const showHotDeal = !!product.is_hot;
  const discountLabel =
    showCompare && product.originalPrice
      ? `${Math.round((1 - product.price / product.originalPrice) * 100)}% OFF`
      : null;

  const toggleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    isWishlisted ? removeFromWishlist(product.id) : addToWishlist(product);
    showSuccess(isWishlisted ? "Removed from wishlist" : "Added to wishlist");
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      showError?.("This product is out of stock.");
      return;
    }
    if (hasVariants) {
      window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await addToCart(product);
      showSuccess?.("Added to cart");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) {
      showError?.("This product is out of stock.");
      return;
    }
    if (hasVariants) {
      window.open(`/product/${product.slug}`, "_blank", "noopener,noreferrer");
      return;
    }
    try {
      await clearCart();
      await addToCart(product);
      router.push("/checkout");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to buy now");
    }
  };

  const StoreLogo = ({ size = "sm" }) => {
    const box = size === "md" ? "w-8 h-8 sm:w-9 sm:h-9" : "w-5 h-5";
    const icon = size === "md" ? "w-3.5 h-3.5" : "w-2.5 h-2.5";
    if (product.vendor_logo) {
      return (
        <img
          src={optimizeImageUrl(product.vendor_logo, { width: IMAGE_WIDTHS.vendorLogo })}
          alt={resolveImageAlt(product.vendor_logo_alt, product.vendor || IMAGE_ALT_FALLBACKS.storeLogo)}
          className={`${box} rounded-full object-cover ring-1 ring-gray-200 shrink-0 bg-white`}
          loading="lazy"
          decoding="async"
        />
      );
    }
    return (
      <div className={`${box} rounded-full bg-[#1790d7] flex items-center justify-center shrink-0`}>
        <Store className={`${icon} text-white`} aria-hidden="true" />
      </div>
    );
  };

  if (layout === "list") {
    const rawDesc = product.short_description || product.shortDescription || product.description || "";
    const cleanDesc = String(rawDesc)
      .replace(/<[^>]*>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&lt;/gi, "<")
      .replace(/&gt;/gi, ">")
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, " ")
      .trim();

    return (
      <div ref={cardRef} className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 group relative flex flex-row min-h-[132px] sm:min-h-[148px] w-full">
        <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="relative block w-[112px] sm:w-[140px] shrink-0 bg-gray-50 overflow-hidden self-stretch">
          <img
            src={imageSrc}
            alt={resolveImageAlt(product.image_alt, product.title || product.name || IMAGE_ALT_FALLBACKS.product)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            width={140}
            height={148}
            sizes="140px"
            loading="lazy"
            decoding="async"
          />
          <ProductPromoBadges
            isFeatured={showFeatured}
            isHot={showHotDeal}
            discountLabel={discountLabel}
            discountClassName="px-1.5 py-0.5 bg-red-600 text-white rounded-md text-[10px] font-bold"
          />
          {outOfStock && (
            <div className="absolute bottom-2 left-2 px-1.5 py-0.5 bg-gray-900/85 text-white rounded-md text-[10px] font-bold z-10">
              Out of Stock
            </div>
          )}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2 right-2 p-1.5 rounded-full shadow-md backdrop-blur-sm transition-all z-20 ${
              isWishlisted
                ? "bg-red-500 text-white"
                : "bg-white/95 text-gray-500 hover:text-red-500 hover:bg-white"
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? "fill-current" : ""}`} aria-hidden="true" />
          </button>
        </Link>

        <div className="px-3 py-2.5 sm:px-4 sm:py-3 flex flex-col flex-1 min-w-0 min-h-0 gap-1">
          <div className="flex items-start justify-between gap-2 min-w-0">
            <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block min-w-0 flex-1">
              <h3 className="text-[13px] sm:text-sm font-semibold text-[#0f2744] leading-snug line-clamp-2 group-hover:text-[#1790d7] transition-colors">
                {product.title || product.name}
              </h3>
            </Link>
            <div className="shrink-0 text-right">
              {showCompare && (
                <p className="text-[10px] text-gray-400 line-through leading-tight">{originalPriceStr}</p>
              )}
              <p className="text-sm sm:text-base font-bold text-[#1790d7] leading-tight">{priceStr}</p>
            </div>
          </div>
          {product.category &&
            (categoryUrl ? (
              <Link href={categoryUrl} className="text-xs text-[#1790d7] hover:underline truncate w-fit">
                {product.category}
              </Link>
            ) : (
              <span className="text-xs text-[#1790d7] truncate">{product.category}</span>
            ))}
          {cleanDesc ? (
            <p className="text-xs text-gray-500 leading-snug line-clamp-2">{cleanDesc}</p>
          ) : null}
          <div className="flex items-center gap-2 mt-auto pt-1">
            {(product.vendor || storeUrl) && !hideStoreInfo && (
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <StoreLogo />
                <span className="text-[11px] text-gray-500 truncate">{product.vendor}</span>
                {city && <span className="text-[10px] text-gray-400 truncate hidden sm:inline">· {city}</span>}
              </div>
            )}
            {showAddToCart && (
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={outOfStock}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-lg text-[11px] font-semibold disabled:opacity-40"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  {outOfStock ? "Out of Stock" : "Add"}
                </button>
                {showBuyNow && (
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={outOfStock}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 border border-[#1790d7] text-[#1790d7] rounded-lg text-[11px] font-semibold disabled:opacity-40"
                  >
                    Buy
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div ref={cardRef} className="bg-white rounded-2xl overflow-hidden border border-gray-200/90 shadow-sm hover:shadow-md hover:border-[#1790d7]/30 transition-all duration-200 group relative flex flex-col h-full w-full">
      {/* 1. Image + wishlist */}
      <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block flex-shrink-0 relative">
        <div className={`relative overflow-hidden bg-gray-50 ${compact ? "aspect-[4/3]" : "aspect-[16/10]"}`}>
          <img
            src={imageSrc}
            alt={resolveImageAlt(product.image_alt, product.title || product.name || IMAGE_ALT_FALLBACKS.product)}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            width={280}
            height={175}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 280px"
            loading="lazy"
            decoding="async"
          />
          <ProductPromoBadges isFeatured={showFeatured} isHot={showHotDeal} discountLabel={discountLabel} />
          {outOfStock && (
            <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-gray-900/85 text-white rounded-md text-[10px] font-bold shadow-sm z-10">
              Out of Stock
            </div>
          )}
          <button
            type="button"
            onClick={toggleWishlist}
            aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
            className={`absolute top-2 right-2 p-2 rounded-full shadow-md backdrop-blur-sm transition-all z-20 ${
              isWishlisted
                ? "bg-red-500 text-white scale-105"
                : "bg-white/95 text-gray-500 hover:text-red-500 hover:bg-white hover:scale-105"
            }`}
          >
            <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} aria-hidden="true" />
          </button>
        </div>
      </Link>

      <div className="px-3 pt-2.5 pb-3 flex flex-col flex-1 min-h-0 gap-2">
        {/* 2. Title left · Price right */}
        <div className="flex items-start justify-between gap-2 min-w-0">
          <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block min-w-0 flex-1">
            <h3 className="text-[13px] sm:text-sm font-semibold text-[#0f2744] leading-snug line-clamp-2 group-hover:text-[#1790d7] transition-colors">
              {product.title || product.name}
            </h3>
          </Link>
          <div className="shrink-0 text-right pt-0.5">
            {showCompare && (
              <p className="text-[10px] text-gray-400 line-through leading-none mb-0.5">{originalPriceStr}</p>
            )}
            <p className="text-sm sm:text-[15px] font-bold text-[#1790d7] leading-none whitespace-nowrap">{priceStr}</p>
          </div>
        </div>

        {/* 3. Category left · Shipping right */}
        {(product.category || shippingLabel) && (
          <div className="flex items-start justify-between gap-2 min-w-0 -mt-1">
            <div className="min-w-0 flex-1">
              {product.category &&
                (categoryUrl ? (
                  <Link
                    href={categoryUrl}
                    className="text-[11px] font-medium text-[#1790d7] hover:underline truncate block w-fit max-w-full"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {product.category}
                  </Link>
                ) : (
                  <span className="text-[11px] font-medium text-[#1790d7] truncate block">{product.category}</span>
                ))}
            </div>
            {shippingLabel && (
              <p
                className={`shrink-0 text-right text-[10px] sm:text-[11px] font-semibold leading-snug max-w-[55%] ${
                  isFreeShippingMode(product.shipping_mode) ? "text-emerald-600" : "text-sky-700"
                }`}
              >
                {shippingLabel}
              </p>
            )}
          </div>
        )}
        {hasVariants && (
          <div className="flex flex-wrap items-center gap-1">
            {Object.entries(variantOptions).map(([key, values]) => {
              const isColor = key.toLowerCase() === "color" || key.toLowerCase() === "colour";
              const list = Array.isArray(values) ? values : [values];
              return (
                <div key={key} className="flex items-center gap-1 flex-wrap">
                  {isColor
                    ? list.slice(0, 5).map((val) => (
                        <span
                          key={val}
                          className="inline-block w-3 h-3 rounded-full border border-gray-200 shrink-0"
                          style={{ backgroundColor: getColorHex(val) || "#e5e7eb" }}
                          title={val}
                        />
                      ))
                    : list.slice(0, 2).map((val) => (
                        <span key={val} className="px-1.5 py-0.5 rounded bg-gray-100 text-gray-600 text-[10px] font-medium">
                          {val}
                        </span>
                      ))}
                </div>
              );
            })}
          </div>
        )}

        {/* 4. Store inner card */}
        {!hideStoreInfo && (product.vendor || product.vendor_logo || storeUrl) && (
          <div className="rounded-xl border border-gray-100 bg-gradient-to-br from-gray-50 to-white p-2 sm:p-2.5">
            <div className="flex items-center gap-2 min-w-0">
              <StoreLogo size="md" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1 min-w-0">
                  <p className="text-[12px] sm:text-[13px] font-semibold text-[#0f2744] truncate">
                    {product.vendor || "Store"}
                  </p>
                  {product.verified && (
                    <BadgeCheck
                      className="w-3.5 h-3.5 text-[#1790d7] shrink-0"
                      title="KYC verified"
                      aria-label="KYC verified"
                    />
                  )}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-0.5">
                  <RatingStars rating={storeRating} size="xs" showValue />
                  {city && (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-gray-500 truncate">
                      <MapPin className="w-3 h-3 shrink-0 text-gray-400" aria-hidden="true" />
                      {city}
                    </span>
                  )}
                </div>
              </div>
              {storeUrl ? (
                <Link
                  href={storeUrl}
                  onClick={(e) => e.stopPropagation()}
                  className="shrink-0 rounded-lg border border-[#1790d7]/30 bg-white px-2 py-1.5 text-[10px] sm:text-[11px] font-semibold text-[#1790d7] hover:bg-[#1790d7] hover:text-white transition-colors whitespace-nowrap"
                >
                  View store
                </Link>
              ) : null}
            </div>
          </div>
        )}

        {/* 5. Add to cart (+ optional Buy it now) */}
        {showAddToCart && (
          <div className={`mt-auto grid gap-1.5 sm:gap-2 ${showBuyNow ? "grid-cols-2" : "grid-cols-1"}`}>
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={outOfStock}
              aria-label={outOfStock ? "Out of stock" : hasVariants ? "Select options" : "Add to cart"}
              className="inline-flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-[11px] sm:text-[12px] font-semibold shadow-sm shadow-[#1790d7]/20 hover:opacity-95 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ShoppingCart className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
              <span className="truncate">{outOfStock ? "Out of Stock" : "Add to cart"}</span>
            </button>
            {showBuyNow && (
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={outOfStock}
                aria-label={outOfStock ? "Out of stock" : "Buy it now"}
                className="inline-flex items-center justify-center gap-1 sm:gap-1.5 py-2 sm:py-2.5 rounded-xl border-2 border-[#1790d7] text-[#1790d7] bg-white text-[11px] sm:text-[12px] font-semibold hover:bg-[#1790d7]/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                <Zap className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                <span className="truncate">Buy now</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
