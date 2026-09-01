"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useMemo } from "react";
import { Heart, ShoppingCart, Store, BadgeCheck, MapPin, Zap } from "lucide-react";
import ProductPromoBadges from "@/components/promotion/ProductPromoBadges";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useMarket } from "@/context/MarketContext";
import useRequireLogin from "@/hooks/useRequireLogin";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import {
  optimizeImageUrl,
  IMAGE_WIDTHS,
  FALLBACK_PRODUCT_IMAGE,
  resolveProductImageSources,
  resolveProductImageRaw,
} from "@/lib/imageOptimize";
import { trackProductEvent } from "@/lib/productAnalytics";
import RatingStars from "@/components/ui/RatingStars";
import { PRODUCT_CARD_GRID_CLASS } from "@/lib/productCardSwiper";

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

function ProductCardImage({ product, width, className, widthAttr, heightAttr, sizes, compact }) {
  const imageKey = resolveProductImageRaw(product);
  const { primary, fallback } = useMemo(
    () =>
      resolveProductImageSources(product, {
        width: width || (compact ? 160 : IMAGE_WIDTHS.productCard),
        quality: 72,
      }),
    [imageKey, width, compact, product]
  );
  const [src, setSrc] = useState(primary);
  const [stage, setStage] = useState(0);

  useEffect(() => {
    setSrc(primary);
    setStage(0);
  }, [primary]);

  const handleError = () => {
    if (stage === 0 && fallback && fallback !== primary) {
      setStage(1);
      setSrc(fallback);
      return;
    }
    if (src !== FALLBACK_PRODUCT_IMAGE) {
      setStage(2);
      setSrc(FALLBACK_PRODUCT_IMAGE);
    }
  };

  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={src}
      alt={resolveImageAlt(product?.image_alt, product?.title || product?.name || IMAGE_ALT_FALLBACKS.product)}
      className={className}
      width={widthAttr}
      height={heightAttr}
      sizes={sizes}
      loading="lazy"
      decoding="async"
      onError={handleError}
    />
  );
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
    <div className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm animate-pulse flex flex-col h-full">
      <div className="aspect-[3/4] md:aspect-square bg-gray-200 flex-shrink-0" />
      <div className="p-2 flex flex-col flex-1">
        <div className="h-8 bg-gray-100 rounded w-full mb-1 md:hidden" />
        <div className="hidden md:flex h-[34px] mb-1 flex-col justify-end">
          <div className="h-3.5 bg-gray-200 rounded w-2/5" />
        </div>
        <div className="h-3.5 bg-gray-200 rounded w-2/5 mb-1 md:hidden" />
        <div className="hidden md:block h-[2.75rem] bg-gray-100 rounded w-full mb-1.5" />
        <div className="flex justify-between min-h-[14px] mb-2">
          <div className="h-2.5 bg-gray-100 rounded w-14" />
          <div className="h-2.5 bg-gray-100 rounded w-10" />
        </div>
        <div className="hidden md:block h-7 bg-gray-200 rounded-md mt-auto" />
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
    <div className={PRODUCT_CARD_GRID_CLASS}>
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

export default function ProductCard({ product, showAddToCart = true, showBuyNow = true, compact = false, layout = "grid", hideStoreInfo = false, shopMobileCompact = false, trackImpression = true }) {
  const router = useRouter();
  const { formatPrice } = useMarket();
  const { addToCart, clearCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useSnackbar();
  const requireLogin = useRequireLogin();
  const cardRef = useRef(null);
  const isWishlisted = isInWishlist(product.id);
  const storeUrl = product.vendor_slug ? `/seller/${product.vendor_slug}` : null;

  useEffect(() => {
    if (!trackImpression) return;
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
  }, [product?.id, trackImpression]);

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
  const productRating = product.rating ?? product.store_rating ?? null;
  const totalSold = Number(product.total_sold ?? product.sold ?? 0) || 0;

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
    if (
      !requireLogin({
        redirectTo: "/checkout",
        title: "Login to checkout",
        message: "Please log in to buy this item.",
      })
    ) {
      return;
    }
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
          <ProductCardImage
            product={product}
            width={280}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            widthAttr={140}
            heightAttr={148}
            sizes="140px"
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
              <div className={`flex items-center gap-1.5 min-w-0 flex-1 ${shopMobileCompact ? "hidden sm:flex" : ""}`}>
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
                  aria-label={outOfStock ? "Out of stock" : "Add to cart"}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-lg text-[11px] font-semibold disabled:opacity-40"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {outOfStock ? "Out of Stock" : "Add"}
                  </span>
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

  const vendorLabel = product.vendor && product.vendor !== "—" ? product.vendor : null;
  const titleLine = vendorLabel
    ? `${product.title || product.name} — ${vendorLabel}`
    : product.title || product.name;
  const mobileTitle = product.title || product.name;
  const showBuyNowButton = showAddToCart && showBuyNow;

  const categoryChip =
    product.category && categoryUrl ? (
      <Link
        href={categoryUrl}
        onClick={(e) => e.stopPropagation()}
        className="inline-block max-w-full truncate text-[10px] font-medium text-[#1790d7] hover:underline"
      >
        {product.category}
      </Link>
    ) : product.category ? (
      <span className="inline-block max-w-full truncate text-[10px] font-medium text-gray-500">{product.category}</span>
    ) : null;

  const addToCartLabel = outOfStock ? "Out of Stock" : hasVariants ? "Select options" : "Add to cart";
  const addToCartBtnClass =
    "w-full inline-flex items-center justify-center gap-1 py-1.5 rounded-md bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-[10px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all";
  const buyNowBtnClass =
    "w-full inline-flex items-center justify-center py-1.5 rounded-md border border-[#1790d7] text-[#1790d7] bg-white text-[10px] font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-all hover:bg-[#1790d7]/5";

  return (
    <div ref={cardRef} className="bg-white rounded-md overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200 group relative flex flex-col h-full w-full">
      <div className="relative flex-shrink-0">
        <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block relative">
          <div className="relative overflow-hidden bg-gray-50 aspect-[3/4] md:aspect-square">
            <ProductCardImage
              product={product}
              compact={compact}
              width={compact ? 160 : IMAGE_WIDTHS.productCard}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
              widthAttr={180}
              heightAttr={240}
              sizes="(max-width: 768px) 42vw, (max-width: 1280px) 20vw, 16vw"
            />
            <ProductPromoBadges isFeatured={showFeatured} isHot={showHotDeal} discountLabel={discountLabel} />
            {outOfStock && (
              <div className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-gray-900/85 text-white rounded text-[9px] font-bold shadow-sm z-10">
                Out of Stock
              </div>
            )}
          </div>
        </Link>
        <button
          type="button"
          onClick={toggleWishlist}
          aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
          className={`absolute top-1.5 right-1.5 z-20 flex items-center justify-center w-7 h-7 md:w-auto md:h-auto md:p-1 rounded-full shadow-md transition-all ${
            isWishlisted
              ? "bg-red-500 text-white"
              : "bg-white text-gray-500 hover:text-red-500"
          }`}
        >
          <Heart className={`w-3.5 h-3.5 md:w-3 md:h-3 ${isWishlisted ? "fill-current" : ""}`} aria-hidden="true" />
        </button>
      </div>

      <div className="px-2 py-2 flex flex-col flex-1 min-h-[148px] md:min-h-[148px]">
        {/* Mobile: title, category, price */}
        <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="block min-w-0 shrink-0 md:hidden">
          <h3 className="text-[11px] text-gray-800 leading-snug line-clamp-2 min-h-[2.5rem]">
            {mobileTitle}
          </h3>
        </Link>
        {categoryChip && <div className="md:hidden mt-0.5 min-w-0 shrink-0">{categoryChip}</div>}
        <div className="md:hidden shrink-0 mt-1 mb-0.5">
          {showCompare && (
            <p className="text-[10px] text-gray-400 line-through leading-none mb-0.5">{originalPriceStr}</p>
          )}
          <p className="text-xs font-bold text-[#1e3a5f] leading-tight">{priceStr}</p>
        </div>

        {/* Desktop: price then title */}
        <div className="hidden md:flex mb-1 h-[34px] flex-col justify-end shrink-0">
          <p
            className={`text-[10px] leading-none mb-0.5 line-through ${
              showCompare ? "text-gray-400" : "invisible select-none"
            }`}
            aria-hidden={!showCompare}
          >
            {showCompare ? originalPriceStr : "\u00A0"}
          </p>
          <p className="text-sm font-bold text-[#1e3a5f] leading-tight">{priceStr}</p>
        </div>

        <Link href={`/product/${product.slug}`} target="_blank" rel="noopener noreferrer" onClick={trackClick} className="hidden md:block min-w-0 shrink-0">
          <h3 className="text-[11px] text-gray-600 leading-snug line-clamp-2 min-h-[2.75rem] group-hover:text-[#1790d7] transition-colors">
            {titleLine}
          </h3>
        </Link>
        {categoryChip && <div className="hidden md:block mt-0.5 min-w-0 shrink-0">{categoryChip}</div>}

        <div className="flex items-center justify-between gap-1 mt-1.5 min-h-[14px] shrink-0">
          <RatingStars rating={productRating} size="xs" />
          <span className="text-[10px] text-gray-500 shrink-0">{totalSold.toLocaleString()} sold</span>
        </div>

        {showAddToCart && (
          <>
            <div className="md:hidden mt-auto pt-2 shrink-0">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                aria-label={outOfStock ? "Out of stock" : hasVariants ? "Select options" : "Add to cart"}
                className={addToCartBtnClass}
              >
                <ShoppingCart className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{addToCartLabel}</span>
              </button>
            </div>
            <div
              className={`hidden md:grid mt-auto pt-2 shrink-0 ${showBuyNowButton ? "grid-cols-2 gap-1" : "grid-cols-1"}`}
            >
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={outOfStock}
                aria-label={outOfStock ? "Out of stock" : hasVariants ? "Select options" : "Add to cart"}
                className={addToCartBtnClass}
              >
                <ShoppingCart className="w-3 h-3 shrink-0" aria-hidden="true" />
                <span className="truncate">{addToCartLabel}</span>
              </button>
              {showBuyNowButton && (
                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={outOfStock}
                  aria-label={outOfStock ? "Out of stock" : "Buy it now"}
                  className={buyNowBtnClass}
                >
                  Buy now
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
