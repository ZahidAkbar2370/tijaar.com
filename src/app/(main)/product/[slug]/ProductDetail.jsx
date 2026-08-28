"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useSeoH1 } from "@/hooks/useSeoH1";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Home,
  ChevronRight,
  Star,
  Heart,
  Truck,
  ShieldCheck,
  Minus,
  Plus,
  MessageSquare,
  Check,
  Store,
  BadgeCheck,
  FileText,
  RotateCcw,
  Play,
  FileDown,
  CheckCircle2,
  ExternalLink,
  Share2,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import ProductReviews from "@/components/reviews/ProductReviews";
import ProductPromoBadges from "@/components/promotion/ProductPromoBadges";
import ProductCard from "@/components/public/ProductCard";
import { productApi } from "@/lib/api";
import { useWishlist } from "@/context/WishlistContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useMarket } from "@/context/MarketContext";
import useAuth from "@/hooks/useAuth";
import { resolveMediaUrl, resolveMediaUrls } from "@/lib/media";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { trackProductEvent } from "@/lib/productAnalytics";

/** Returns embed URL for YouTube/Vimeo, or null if not embeddable */
function getVideoEmbedUrl(url) {
  if (!url || typeof url !== "string") return null;
  const u = url.trim();
  const ytMatch = u.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/);
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`;
  const vimeoMatch = u.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  return null;
}

function getProductShippingCopy(product) {
  const mode = product?.shipping_mode || "customer_pays";
  const shipCost = product?.shipping_cost_cached != null ? Number(product.shipping_cost_cached) : null;

  if (mode === "free_shipping") {
    return {
      primary: "Shipping Paid by Seller (Free shipping)",
      priceLine: "Free shipping",
    };
  }
  if (mode === "customer_pays" && shipCost != null && !Number.isNaN(shipCost)) {
    return {
      primary: `Shipping Paid by Customer — Rs ${Number(shipCost).toLocaleString()}`,
      priceLine: `Shipping: Rs ${Number(shipCost).toLocaleString()}`,
    };
  }
  if (mode === "customer_pays") {
    return {
      primary: "Shipping Paid by Customer",
      priceLine: null,
    };
  }
  return {
    primary: "Shipping at checkout",
    priceLine: null,
  };
}

function BulletList({ text }) {
  if (!text || !String(text).trim()) return null;
  const parts = String(text)
    .split(/\n|\.(?=\s)|(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length <= 1) return <p className="text-gray-700">{text}</p>;
  return (
    <ul className="list-disc pl-5 space-y-1.5 text-gray-700">
      {parts.map((line, i) => (
        <li key={i}>{line}</li>
      ))}
    </ul>
  );
}

export default function ProductDetail({ product }) {
  const router = useRouter();
  const { formatPrice } = useMarket();
  const formatPkr = (price) => formatPrice(price, "PK");
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState("about");
  const [magnifier, setMagnifier] = useState({ show: false, x: 0, y: 0, w: 0, h: 0 });
  const [promotedAds, setPromotedAds] = useState([]);

  useEffect(() => {
    if (!product?.id) return;
    productApi
      .promotedAds({ exclude_id: product.id, limit: 4 })
      .then((res) => setPromotedAds(res.products || []))
      .catch(() => setPromotedAds([]));
  }, [product?.id]);
  const imageContainerRef = useRef(null);
  const { addToCart, clearCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess, showError } = useSnackbar();
  const { user } = useAuth();
  const isWishlisted = isInWishlist(product?.id);
  const isOwnListing = !!(
    product?.seller_id &&
    user?.id &&
    String(product.seller_id) === String(user.id)
  );

  useEffect(() => {
    if (product?.id) trackProductEvent(product.id, "click");
  }, [product?.id]);

  const images = useMemo(() => {
    if (!product) return [];
    const list =
      product.images && product.images.length > 0
        ? resolveMediaUrls(product.images)
        : product.image
          ? [resolveMediaUrl(product.image)]
          : [];
    return list.length ? list : ["/assets/sample-image.webp"];
  }, [product]);

  const title = product?.title || product?.name || "";
  const productH1 = useSeoH1("product", { name: title, fallback: title });
  const productImageAlt = resolveImageAlt(product?.image_alt, title || IMAGE_ALT_FALLBACKS.product);
  const shippingCopy = getProductShippingCopy(product);
  const availableQty = Number(product?.available_quantity ?? product?.quantity ?? 0);
  const inStock = product?.stock_status
    ? product.stock_status !== "out_of_stock"
    : product?.track_inventory === false || availableQty > 0;
  const savings =
    product?.originalPrice && product?.price && product.originalPrice > product.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null;
  const sellerCard = product?.seller_card || null;
  const isCustomerListing =
    product?.seller_type === "private" ||
    (product?.vendor && String(product.vendor).trim().toLowerCase() === "customer") ||
    (sellerCard?.vendor && String(sellerCard.vendor).trim().toLowerCase() === "customer");
  const hasFlashDeal = product?.flash_deal_discount_value != null && product?.flash_deal_discount_value > 0;
  const flashDealLabel = hasFlashDeal
    ? (product?.flash_deal_discount_type === "percentage"
        ? `${product.flash_deal_discount_value}% off`
        : `${formatPkr(product.flash_deal_discount_value)} off`)
    : null;
  const badges = useMemo(() => {
    const b = [];
    if (product?.is_new_arrival) b.push({ id: "new", label: "New Arrival", className: "bg-violet-500 text-white" });
    if (product?.is_featured) b.push({ id: "featured", label: "Featured", className: "bg-amber-500 text-white" });
    if (product?.is_hot) b.push({ id: "hot", label: "Hot Deal", className: "bg-rose-500 text-white" });
    if (hasFlashDeal) b.push({ id: "flash", label: "Flash Deal", className: "bg-[#1790d7] text-white" });
    return b;
  }, [product?.is_new_arrival, product?.is_featured, product?.is_hot, hasFlashDeal]);

  const variants = useMemo(() => {
    const v = product?.variants;
    if (Array.isArray(v)) return v;
    if (v && typeof v === "object" && !Array.isArray(v)) return [];
    return [];
  }, [product?.variants]);
  const variantOptionsFromApi = product?.variant_options && typeof product.variant_options === "object" ? product.variant_options : {};
  const hasVariants = variants.length > 0 || Object.keys(variantOptionsFromApi).length > 0;
  const variationOptions = useMemo(() => {
    if (variants.length > 0) {
      const opts = {};
      variants.forEach((v) => {
        const attrs = v.attributes != null && typeof v.attributes === "object" ? v.attributes : {};
        Object.entries(attrs).forEach(([key, val]) => {
          const k = key.charAt(0).toUpperCase() + key.slice(1);
          if (!opts[k]) opts[k] = new Set();
          opts[k].add(String(val));
        });
      });
      return Object.fromEntries(Object.entries(opts).map(([k, s]) => [k, Array.from(s)]));
    }
    if (Object.keys(variantOptionsFromApi).length > 0) {
      return Object.fromEntries(
        Object.entries(variantOptionsFromApi).map(([k, v]) => [k.charAt(0).toUpperCase() + k.slice(1), Array.isArray(v) ? v : [v]])
      );
    }
    return {};
  }, [variants, variantOptionsFromApi]);

  const initialSelectedAttributes = useMemo(() => {
    if (!variants.length) return {};
    const first = variants[0];
    const attrs = first?.attributes != null && typeof first.attributes === "object" ? first.attributes : {};
    return Object.fromEntries(Object.entries(attrs).map(([k, v]) => [k, String(v)]));
  }, [variants]);

  const [selectedAttributes, setSelectedAttributes] = useState({});
  useEffect(() => {
    setSelectedAttributes(initialSelectedAttributes);
  }, [product?.id, initialSelectedAttributes]);

  const selectedVariant = useMemo(() => {
    if (!hasVariants || Object.keys(selectedAttributes).length === 0) return null;
    return variants.find((v) => {
      const attrs = v.attributes != null && typeof v.attributes === "object" ? v.attributes : {};
      return Object.entries(selectedAttributes).every(([k, val]) => String(attrs[k]) === String(val));
    }) || null;
  }, [variants, selectedAttributes, hasVariants]);

  // When a variant has multiple images, show all of them when that variant is selected
  const imagesForDisplay = selectedVariant?.image_urls && Array.isArray(selectedVariant.image_urls) && selectedVariant.image_urls.length
    ? [
        ...selectedVariant.image_urls,
        ...images.filter((src) => !selectedVariant.image_urls.includes(src)),
      ]
    : (selectedVariant?.image_url
        ? [selectedVariant.image_url, ...images.filter((src) => src !== selectedVariant.image_url)]
        : images);
  const mainImage = (imagesForDisplay[selectedImageIndex] || images[0]);

  useEffect(() => {
    if (selectedVariant?.image_url) setSelectedImageIndex(0);
  }, [selectedVariant?.id, selectedVariant?.image_url]);

  const displayPrice = selectedVariant ? selectedVariant.price : (product?.price ?? 0);
  const displayComparePrice = selectedVariant ? selectedVariant.compare_at_price : product?.originalPrice;
  const variantInStock = selectedVariant ? Number(selectedVariant.quantity ?? 0) > 0 : inStock;
  const variantQuantity = selectedVariant ? Number(selectedVariant.quantity ?? 0) : availableQty;

  const variantPayload = selectedVariant
    ? { variant_id: selectedVariant.id, ...(selectedVariant.attributes || {}) }
    : {};

  const canAddToCart = !isOwnListing && (hasVariants
    ? (selectedVariant && variantInStock && variantQuantity >= 1)
    : (inStock && availableQty >= 1));

  const productForCart = useMemo(() => {
    if (!product) return product;
    const stockQty = hasVariants
      ? (selectedVariant ? Number(selectedVariant.quantity ?? 0) : 0)
      : availableQty;
    return {
      ...product,
      price: displayPrice,
      variant_price: displayPrice,
      image: mainImage,
      variant_image: mainImage,
      available_quantity: stockQty,
      quantity: stockQty,
      stock_status: stockQty > 0 ? "in_stock" : "out_of_stock",
    };
  }, [product, displayPrice, mainImage, hasVariants, selectedVariant, availableQty]);

  const handleAddToCart = async () => {
    if (!product || !canAddToCart) {
      showError?.(
        hasVariants && !selectedVariant
          ? "Please select product options first."
          : "This product is out of stock."
      );
      return;
    }
    try {
      await addToCart(productForCart, quantity, variantPayload, { setQuantity: true });
      showSuccess?.("Added to cart");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to add to cart");
    }
  };

  const handleBuyNow = async () => {
    if (!product || !canAddToCart) {
      showError?.(
        hasVariants && !selectedVariant
          ? "Please select product options first."
          : "This product is out of stock."
      );
      return;
    }
    try {
      // Task 17: Buy It Now — checkout for this product only
      await clearCart();
      await addToCart(productForCart, quantity, variantPayload, { setQuantity: true });
      router.push("/checkout");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to buy now");
    }
  };

  const handleShare = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    let shared = false;
    try {
      if (navigator.share) {
        await navigator.share({ title: title || "Tijaar", url });
        shared = true;
      } else {
        await navigator.clipboard.writeText(url);
        showSuccess?.("Link copied");
        shared = true;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        showSuccess?.("Link copied");
        shared = true;
      } catch {
        showError?.("Could not share link");
      }
    }
    if (shared && product?.id) trackProductEvent(product.id, "share");
  };

  const handleWishlist = () => {
    if (!product) return;
    if (isWishlisted) {
      removeFromWishlist(product.id);
      showSuccess("Removed from wishlist");
    } else {
      addToWishlist(product);
      showSuccess("Added to wishlist!");
    }
  };

  if (!product) return null;

  const stockQtyShown = hasVariants && selectedVariant ? variantQuantity : availableQty;
  const showInStock =
    (hasVariants ? variantInStock : inStock) &&
    (hasVariants ? (selectedVariant ? variantQuantity >= 1 : false) : availableQty >= 1);
  const maxBuyQty = canAddToCart
    ? hasVariants && selectedVariant
      ? variantQuantity
      : availableQty
    : 1;
  const discountPct =
    displayComparePrice && displayComparePrice > displayPrice
      ? Math.round((1 - displayPrice / displayComparePrice) * 100)
      : null;
  const thumbList = (imagesForDisplay || images).slice(0, 8);
  const showThumbs = thumbList.length > 1 || !!selectedVariant?.image_url;
  const ctaLabel = isOwnListing
    ? "Your listing"
    : hasVariants && !selectedVariant
      ? "Select options"
      : canAddToCart
        ? "Add to Cart"
        : "Out of Stock";

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-slate-50 to-white pb-28 lg:pb-16">
      {/* Breadcrumb */}
      <div className="border-b border-slate-200/80 bg-white/90 backdrop-blur-sm sticky top-0 z-30">
        <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-2.5 sm:py-3">
          <nav className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 flex-wrap" aria-label="Breadcrumb">
            <Link href="/" className="hover:text-[#1790d7] inline-flex items-center gap-1 transition-colors">
              <Home className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <Link href="/shop" className="hover:text-[#1790d7] transition-colors">
              Shop
            </Link>
            {product.category && (
              <>
                <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
                <Link
                  href={`/category/${product.categorySlug}`}
                  className="hover:text-[#1790d7] truncate max-w-[120px] sm:max-w-[180px] transition-colors"
                >
                  {product.category}
                </Link>
              </>
            )}
            <ChevronRight className="w-3 h-3 text-slate-300 shrink-0" />
            <span className="text-slate-900 font-medium truncate max-w-[140px] sm:max-w-[240px]" title={title}>
              {title}
            </span>
          </nav>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-5 sm:py-8">
        {/* Main: Gallery + Buy box */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:gap-0">
            {/* Gallery */}
            <div className="lg:col-span-6 xl:col-span-7 p-4 sm:p-6 lg:p-8 lg:border-r border-slate-100">
              <div className="flex flex-col md:flex-row gap-3 md:gap-4">
                {showThumbs && (
                  <div className="hidden md:flex flex-col gap-2 w-[72px] shrink-0 max-h-[560px] overflow-y-auto">
                    {thumbList.map((src, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setSelectedImageIndex(i)}
                        aria-label={`View image ${i + 1}`}
                        className={`w-[68px] h-[68px] rounded-xl border-2 overflow-hidden shrink-0 transition-all ${
                          selectedImageIndex === i
                            ? "border-[#1790d7] ring-2 ring-[#1790d7]/20"
                            : "border-slate-200 hover:border-slate-300"
                        }`}
                      >
                        <img
                          src={src}
                          alt={resolveImageAlt(product?.image_alts?.[i], productImageAlt)}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}

                <div
                  ref={imageContainerRef}
                  className="relative flex-1 min-w-0 aspect-square md:aspect-auto md:min-h-[420px] lg:min-h-[520px] xl:min-h-[560px] bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-center overflow-hidden group"
                  onMouseMove={(e) => {
                    if (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches) return;
                    const el = imageContainerRef.current;
                    if (!el) return;
                    const rect = el.getBoundingClientRect();
                    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
                    const y = Math.max(0, Math.min(e.clientY - rect.top, rect.height));
                    setMagnifier({ show: true, x, y, w: rect.width, h: rect.height });
                  }}
                  onMouseLeave={() => setMagnifier((p) => ({ ...p, show: false }))}
                >
                  <img
                    src={imagesForDisplay[selectedImageIndex] || mainImage}
                    alt={productImageAlt}
                    className="w-full h-full object-contain p-3 sm:p-4"
                    draggable={false}
                  />
                  <ProductPromoBadges
                    isFeatured={!!product.is_featured}
                    isHot={!!product.is_hot}
                    className="top-3 left-3"
                  />
                  {!showInStock && !(hasVariants && !selectedVariant) && (
                    <div className="absolute inset-0 bg-slate-900/45 flex items-center justify-center pointer-events-none">
                      <span className="px-4 py-2 rounded-xl bg-white text-slate-900 text-sm font-bold shadow-lg">
                        Out of Stock
                      </span>
                    </div>
                  )}
                  {magnifier.show && magnifier.w > 0 && (
                    <div
                      className="absolute pointer-events-none rounded-full border-2 border-white shadow-xl bg-no-repeat hidden md:block"
                      style={{
                        left: Math.max(0, Math.min(magnifier.x - 60, magnifier.w - 120)),
                        top: Math.max(0, Math.min(magnifier.y - 60, magnifier.h - 120)),
                        width: 120,
                        height: 120,
                        backgroundImage: `url(${imagesForDisplay[selectedImageIndex] || mainImage})`,
                        backgroundSize: `${magnifier.w * 2}px ${magnifier.h * 2}px`,
                        backgroundPosition: `${-magnifier.x * 2 + 60}px ${-magnifier.y * 2 + 60}px`,
                      }}
                      aria-hidden
                    />
                  )}
                </div>
              </div>

              {showThumbs && (
                <div className="flex md:hidden gap-2 mt-3 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
                  {thumbList.map((src, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedImageIndex(i)}
                      aria-label={`View image ${i + 1}`}
                      className={`w-16 h-16 rounded-xl border-2 shrink-0 overflow-hidden transition-all ${
                        selectedImageIndex === i
                          ? "border-[#1790d7] ring-2 ring-[#1790d7]/20"
                          : "border-slate-200"
                      }`}
                    >
                      <img
                        src={src}
                        alt={resolveImageAlt(product?.image_alts?.[i], productImageAlt)}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Buy box */}
            <div className="lg:col-span-6 xl:col-span-5 p-4 sm:p-6 lg:p-8 flex flex-col">
              {badges.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {badges.map((b) => (
                    <span
                      key={b.id}
                      className={`text-[11px] sm:text-xs font-semibold px-2.5 py-1 rounded-lg ${b.className}`}
                    >
                      {b.label}
                    </span>
                  ))}
                </div>
              )}

              <h1 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold text-slate-900 leading-snug tracking-tight mb-3">
                {productH1}
              </h1>

              <div className="flex items-center gap-2 mb-4 flex-wrap">
                <div className="flex items-center gap-0.5" aria-label={`Rated ${Number(product.rating) || 0} out of 5`}>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const avg = Number(product.rating) || 0;
                    const filled = i <= Math.round(avg);
                    return (
                      <Star
                        key={i}
                        className={`w-4 h-4 ${filled ? "text-amber-400 fill-amber-400" : "text-slate-200"}`}
                      />
                    );
                  })}
                </div>
                <a
                  href="#reviews"
                  onClick={() => setActiveTab("reviews")}
                  className="text-sm text-[#1790d7] hover:text-[#1277b8] hover:underline font-medium transition-colors"
                >
                  {Number(product.reviews) || 0} ratings
                </a>
              </div>

              <div className="mb-4 pb-4 border-b border-slate-100">
                <div className="flex items-baseline gap-2.5 flex-wrap">
                  <span className="text-3xl sm:text-[2rem] font-bold text-[#1790d7] tracking-tight">
                    {formatPkr(displayPrice)}
                  </span>
                  {discountPct != null && (
                    <>
                      <span className="text-base text-slate-400 line-through">{formatPkr(displayComparePrice)}</span>
                      <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {discountPct}% off
                      </span>
                    </>
                  )}
                </div>
                {shippingCopy.priceLine && (
                  <p className="text-sm text-slate-600 mt-2">{shippingCopy.priceLine}</p>
                )}
                {product.short_description && (
                  <p className="text-sm text-slate-600 mt-3 leading-relaxed line-clamp-3">
                    {product.short_description}
                  </p>
                )}
              </div>

              {hasVariants && Object.keys(variationOptions).length > 0 && (
                <div className="mb-5 space-y-4">
                  {Object.entries(variationOptions).map(([attrName, values]) => (
                    <div key={attrName}>
                      <p className="text-sm font-semibold text-slate-800 mb-2">{attrName}</p>
                      <div className="flex flex-wrap gap-2">
                        {values.map((val) => {
                          const isSelected = selectedAttributes[attrName.toLowerCase()] === val;
                          const isColor = attrName.toLowerCase() === "color";
                          return (
                            <button
                              key={val}
                              type="button"
                              onClick={() =>
                                setSelectedAttributes((prev) => {
                                  const key = attrName.toLowerCase();
                                  if (prev[key] === val) {
                                    const next = { ...prev };
                                    delete next[key];
                                    return next;
                                  }
                                  return { ...prev, [key]: val };
                                })
                              }
                              className={`inline-flex items-center justify-center min-h-11 min-w-[2.75rem] px-3.5 py-2 rounded-xl border-2 text-sm font-medium transition-all ${
                                isSelected
                                  ? "border-[#1790d7] bg-[#1790d7]/10 text-[#1790d7]"
                                  : "border-slate-200 text-slate-700 hover:border-slate-300"
                              } ${isColor ? "capitalize" : ""}`}
                            >
                              {isColor ? (
                                <span className="flex items-center gap-1.5">
                                  <span
                                    className="w-4 h-4 rounded-full border border-slate-300 shrink-0"
                                    style={{
                                      backgroundColor:
                                        {
                                          Red: "#dc2626",
                                          Blue: "#2563eb",
                                          Green: "#16a34a",
                                          Black: "#171717",
                                          White: "#f5f5f5",
                                          Navy: "#1e3a5f",
                                        }[val] || val,
                                    }}
                                  />
                                  {val}
                                </span>
                              ) : (
                                val
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {selectedVariant && (
                    <p className="text-xs text-slate-500">
                      Selected:{" "}
                      {selectedVariant.name ||
                        Object.entries(selectedVariant.attributes || {})
                          .map(([, v]) => v)
                          .join(" / ")}
                      {selectedVariant.sku && ` · SKU: ${selectedVariant.sku}`}
                    </p>
                  )}
                  {hasVariants && !selectedVariant && Object.keys(selectedAttributes).length > 0 && (
                    <p className="text-xs text-amber-600 font-medium">Please select a valid combination.</p>
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm mb-5">
                {showInStock ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-600 font-semibold">
                    <Check className="w-4 h-4" />
                    In Stock
                    <span className="font-normal text-slate-500">({stockQtyShown} available)</span>
                  </span>
                ) : (
                  <span className="text-red-600 font-semibold">
                    {hasVariants && !selectedVariant ? "Select options" : "Out of Stock"}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 text-slate-600">
                  <Truck className="w-4 h-4 text-[#1790d7] shrink-0" />
                  <span className="leading-snug">{shippingCopy.primary}</span>
                </span>
              </div>

              <div className="flex items-center gap-3 mb-5">
                <span className="text-sm font-semibold text-slate-700">Quantity</span>
                <div className="inline-flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="px-4 py-2.5 border-x border-slate-200 font-semibold min-w-[3rem] text-center bg-slate-50/60">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.min(maxBuyQty, q + 1))}
                    disabled={!canAddToCart || quantity >= maxBuyQty}
                    className="px-3.5 py-2.5 hover:bg-slate-50 text-slate-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {isOwnListing && (
                <div className="mb-5 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-medium leading-relaxed">
                  This is your listing. You cannot purchase your own products—disputes, returns, and refunds
                  require a buyer account.
                </div>
              )}

              <div className="flex flex-col gap-3 mb-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={handleAddToCart}
                    disabled={!canAddToCart}
                    className="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] hover:opacity-95 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm shadow-[#1790d7]/20"
                  >
                    {ctaLabel}
                  </button>
                  <button
                    type="button"
                    onClick={handleBuyNow}
                    disabled={!canAddToCart}
                    className="w-full py-3.5 px-5 rounded-xl border-2 border-[#1790d7] text-[#1790d7] hover:bg-[#1790d7]/5 font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Buy It Now
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleWishlist}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:border-[#1790d7]/40 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
                    title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-red-500 text-red-500" : "text-slate-500"}`} />
                    Wishlist
                  </button>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-slate-200 hover:border-[#1790d7]/40 hover:bg-slate-50 transition-all text-sm font-medium text-slate-700"
                    title="Share"
                  >
                    <Share2 className="w-5 h-5 text-slate-500" />
                    Share
                  </button>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 pb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
                {product.brand && (
                  <span className="text-slate-600">
                    <span className="text-slate-400 font-medium">Brand:</span>{" "}
                    {product.brand_slug ? (
                      <Link href={`/brand/${product.brand_slug}`} className="text-[#1790d7] hover:underline font-medium">
                        {product.brand}
                      </Link>
                    ) : (
                      product.brand
                    )}
                  </span>
                )}
                {product.category && (
                  <span className="text-slate-600">
                    <span className="text-slate-400 font-medium">Category:</span>{" "}
                    <Link
                      href={`/category/${product.categorySlug}`}
                      className="text-[#1790d7] hover:underline font-medium"
                    >
                      {product.category}
                    </Link>
                  </span>
                )}
                {product.tags && product.tags.length > 0 && (
                  <span className="text-slate-600 flex items-center gap-1.5 flex-wrap">
                    <span className="text-slate-400 font-medium">Tags:</span>
                    {product.tags.map((t) => (
                      <span
                        key={t.id || t}
                        className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-700 text-xs font-medium"
                      >
                        {typeof t === "object" ? t.name : t}
                      </span>
                    ))}
                  </span>
                )}
              </div>

              {sellerCard ? (
                <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-5 shadow-sm">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                    Sold by
                  </p>
                  <div className="flex items-start gap-3.5">
                    <Link
                      href={`/seller/${sellerCard.vendor_slug}`}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 shrink-0 ring-1 ring-slate-100 hover:ring-[#1790d7]/40 transition"
                    >
                      {sellerCard.vendor_logo ? (
                        <img
                          src={sellerCard.vendor_logo}
                          alt={resolveImageAlt(
                            sellerCard.vendor_logo_alt,
                            sellerCard.vendor || IMAGE_ALT_FALLBACKS.storeLogo
                          )}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1790d7] to-[#4db3e8]">
                          <Store className="w-7 h-7 text-white" />
                        </div>
                      )}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Link
                          href={`/seller/${sellerCard.vendor_slug}`}
                          className="font-bold text-slate-900 hover:text-[#1790d7] transition-colors truncate text-base"
                        >
                          {sellerCard.vendor}
                        </Link>
                        {sellerCard.kyc_verified && (
                          <span
                            className="inline-flex items-center text-[#1790d7] shrink-0"
                            title="Verified seller"
                            aria-label="Verified seller"
                          >
                            <BadgeCheck className="w-[18px] h-[18px]" />
                          </span>
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-2 mt-3">
                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2 text-center">
                          <p className="text-sm font-bold text-slate-900 tabular-nums leading-none">
                            {sellerCard.total_products ?? 0}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">Products</p>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2 text-center">
                          <p className="text-sm font-bold text-slate-900 tabular-nums leading-none inline-flex items-center justify-center gap-0.5">
                            {sellerCard.store_rating != null ? (
                              <>
                                <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                                {sellerCard.store_rating}
                              </>
                            ) : (
                              "—"
                            )}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">
                            {sellerCard.store_reviews_count
                              ? `${sellerCard.store_reviews_count} reviews`
                              : "Rating"}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 border border-slate-100 px-2 py-2 text-center">
                          <p className="text-sm font-bold text-slate-900 tabular-nums leading-none inline-flex items-center justify-center gap-0.5">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            {Number(sellerCard.completed_orders ?? 0).toLocaleString("en-PK")}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-1 font-medium">Orders</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3.5">
                        {sellerCard.vendor_slug && (
                          <Link
                            href={`/seller/${sellerCard.vendor_slug}`}
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-[#1790d7] text-[#1790d7] text-sm font-semibold hover:bg-[#1790d7]/5 transition-colors"
                          >
                            <Store className="w-4 h-4" />
                            View store
                          </Link>
                        )}
                        {product.seller_id && !isOwnListing ? (
                          <a
                            href={`/customer/messages?product_id=${product.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1790d7] text-white text-sm font-semibold hover:bg-[#1277b8] transition-colors"
                          >
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </a>
                        ) : (
                          <span className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed">
                            <MessageSquare className="w-4 h-4" />
                            Message
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                (product.vendor || product.seller_id) && (
                  <div className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5 mb-5 shadow-sm">
                    <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400 mb-3">
                      Sold by
                    </p>
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center shrink-0">
                        <Store className="w-6 h-6 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {product.vendor_slug ? (
                          <Link
                            href={`/seller/${product.vendor_slug}`}
                            className="font-bold text-slate-900 hover:text-[#1790d7] transition-colors"
                          >
                            {product.vendor}
                          </Link>
                        ) : (
                          <p className="font-bold text-slate-900">{product.vendor || "Seller"}</p>
                        )}
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3.5">
                      {product.vendor_slug && (
                        <Link
                          href={`/seller/${product.vendor_slug}`}
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border-2 border-[#1790d7] text-[#1790d7] text-sm font-semibold hover:bg-[#1790d7]/5 transition-colors"
                        >
                          <Store className="w-4 h-4" />
                          View store
                        </Link>
                      )}
                      {product.seller_id && !isOwnListing ? (
                        <a
                          href={`/customer/messages?product_id=${product.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl bg-[#1790d7] text-white text-sm font-semibold hover:bg-[#1277b8] transition-colors"
                        >
                          <MessageSquare className="w-4 h-4" />
                          Message
                        </a>
                      ) : null}
                    </div>
                  </div>
                )
              )}

              <div className="border-t border-slate-100 pt-5 space-y-3 text-sm mt-auto">
                <p className="flex items-center gap-2 text-slate-600 font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#1790d7] shrink-0" /> Buyer Protection
                </p>
                {sellerCard?.shipping_policy && (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="flex items-center gap-2 text-slate-700 font-medium mb-1">
                      <FileText className="w-4 h-4 text-[#1790d7]" /> Shipping policy
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {sellerCard.shipping_policy}
                    </p>
                  </div>
                )}
                {sellerCard?.return_policy && (
                  <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                    <p className="flex items-center gap-2 text-slate-700 font-medium mb-1">
                      <RotateCcw className="w-4 h-4 text-[#1790d7]" /> Return policy
                    </p>
                    <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">
                      {sellerCard.return_policy}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Video & Documents */}
        {(product.video_url || product.documents?.length > 0) && (
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
            <div className="p-5 sm:p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-5 flex items-center gap-2">
                <Play className="w-5 h-5 text-[#1790d7]" />
                Video &amp; Resources
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
                {product.video_url && (
                  <div className="lg:col-span-2">
                    <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-900 shadow-md">
                      {getVideoEmbedUrl(product.video_url) ? (
                        <div className="aspect-video w-full">
                          <iframe
                            src={getVideoEmbedUrl(product.video_url)}
                            title="Product video"
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          />
                        </div>
                      ) : (
                        <a
                          href={product.video_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="aspect-video w-full flex flex-col items-center justify-center gap-3 text-white hover:bg-slate-800 transition-colors p-6"
                        >
                          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                            <Play className="w-8 h-8 ml-1" fill="currentColor" />
                          </div>
                          <span className="font-medium">Watch video</span>
                          <span className="text-sm text-white/80 flex items-center gap-1">
                            Opens in new tab <ExternalLink className="w-4 h-4" />
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                )}
                {product.documents?.length > 0 && (
                  <div className={product.video_url ? "" : "lg:col-span-3"}>
                    <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
                      {product.documents
                        .filter((d) => d.url)
                        .map((doc) => (
                          <a
                            key={doc.id}
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group flex items-center gap-4 min-w-0 p-4 rounded-xl border border-slate-200 hover:border-[#1790d7]/40 hover:bg-[#1790d7]/5 transition-all bg-white"
                          >
                            <div className="w-12 h-12 rounded-xl bg-[#1790d7]/10 flex items-center justify-center shrink-0 group-hover:bg-[#1790d7]/20 transition-colors">
                              <FileDown className="w-6 h-6 text-[#1790d7]" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-900 truncate group-hover:text-[#1790d7] transition-colors">
                                {doc.label || "Document"}
                              </p>
                              <p className="text-xs text-slate-500 flex items-center gap-1">
                                View / Download <ExternalLink className="w-3 h-3" />
                              </p>
                            </div>
                          </a>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden mb-6">
          <div className="border-b border-slate-100 overflow-x-auto">
            <div className="flex gap-1 p-2 min-w-max sm:min-w-0">
              {[
                { id: "about", label: "About this item" },
                { id: "details", label: "Product details" },
                { id: "reviews", label: "Customer reviews" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl text-sm font-semibold whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? "bg-[#1790d7]/10 text-[#1790d7]"
                      : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="p-5 sm:p-6 md:p-8">
            {activeTab === "about" && (
              <div className="prose prose-slate max-w-none">
                {product.short_description && (
                  <div className="mb-8">
                    <h3 className="text-base font-bold text-slate-900 mb-3">Highlights</h3>
                    <BulletList text={product.short_description} />
                  </div>
                )}
                {product.description && (
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-3">Description</h3>
                    <div className="text-slate-700 whitespace-pre-line leading-relaxed">{product.description}</div>
                  </div>
                )}
                {!product.short_description && !product.description && (
                  <p className="text-slate-500">No description available.</p>
                )}
              </div>
            )}

            {activeTab === "details" && (
              <div className="text-sm">
                <table className="w-full">
                  <tbody className="divide-y divide-slate-100">
                    {product.brand && (
                      <tr>
                        <td className="py-3.5 text-slate-500 font-medium w-32 sm:w-40 align-top">Brand</td>
                        <td className="py-3.5 text-slate-900">{product.brand}</td>
                      </tr>
                    )}
                    {product.condition && (
                      <tr>
                        <td className="py-3.5 text-slate-500 font-medium align-top">Condition</td>
                        <td className="py-3.5 text-slate-900 capitalize">{product.condition}</td>
                      </tr>
                    )}
                    {product.sku && (
                      <tr>
                        <td className="py-3.5 text-slate-500 font-medium align-top">SKU</td>
                        <td className="py-3.5 text-slate-900">{product.sku}</td>
                      </tr>
                    )}
                    {product.category && (
                      <tr>
                        <td className="py-3.5 text-slate-500 font-medium align-top">Category</td>
                        <td className="py-3.5 text-slate-900">
                          <Link
                            href={`/category/${product.categorySlug}`}
                            className="text-[#1790d7] hover:underline font-medium"
                          >
                            {product.category}
                          </Link>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}

            {activeTab === "reviews" && (
              <div id="reviews">
                <ProductReviews
                  productId={product.id}
                  productSellerId={product.seller_id}
                  productSellerType={product.seller_type}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {promotedAds.length > 0 && (
        <section className="mt-10 border-t border-slate-200 pt-8">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Promoted for you</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {promotedAds.map((p) => (
              <ProductCard key={p.id} product={p} compact />
            ))}
          </div>
        </section>
      )}

      {/* Mobile sticky CTA */}
      {!isOwnListing && (
        <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-slate-200 bg-white/95 backdrop-blur-md shadow-[0_-8px_30px_rgba(15,23,42,0.08)] pb-[env(safe-area-inset-bottom)]">
          <div className="px-4 py-3 flex items-center gap-3">
            <div className="min-w-0 shrink">
              <p className="text-lg font-bold text-[#1790d7] leading-none truncate">{formatPkr(displayPrice)}</p>
              {showInStock ? (
                <p className="text-[11px] text-emerald-600 font-medium mt-1">In stock</p>
              ) : (
                <p className="text-[11px] text-red-600 font-medium mt-1">
                  {hasVariants && !selectedVariant ? "Select options" : "Out of Stock"}
                </p>
              )}
            </div>
            <div className="flex-1 grid grid-cols-2 gap-2 min-w-0">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
                className="py-3 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {canAddToCart ? "Add to Cart" : hasVariants && !selectedVariant ? "Options" : "Sold out"}
              </button>
              <button
                type="button"
                onClick={handleBuyNow}
                disabled={!canAddToCart}
                className="py-3 rounded-xl border-2 border-[#1790d7] text-[#1790d7] text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Buy now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
