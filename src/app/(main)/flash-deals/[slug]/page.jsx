"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Tag,
  ChevronLeft,
  ShoppingCart,
  Clock,
  Store,
  Sparkles,
  Check,
  Loader2,
} from "lucide-react";
import { flashDealsApi, getBackendBaseUrl } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuthContext } from "@/context/AuthProvider";
import { useSnackbar } from "@/context/SnackbarContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { useSeoH1 } from "@/hooks/useSeoH1";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='%23d1d5db' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";

function resolveImageUrl(url) {
  if (!url) return null;
  if (typeof url === "string" && url.startsWith("http")) return url;
  const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
  return base ? `${base}${url.startsWith("/") ? "" : "/"}${url}` : url;
}

export default function FlashDealDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug;
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adding, setAdding] = useState(false);
  const { user } = useAuthContext();
  const { addDealToCart, setIsCartOpen } = useCart();
  const { showSuccess, showError } = useSnackbar();
  const flashDealH1 = useSeoH1("flash_deal", { title: deal?.name, fallback: deal?.name || "Flash Deal" });

  useEffect(() => {
    if (!slug) return;
    flashDealsApi
      .get(slug)
      .then((res) => setDeal(res.flash_deal || null))
      .catch(() => setDeal(null))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleGrabDeal = async () => {
    if (!user) {
      showError?.("Please log in to add this deal to your cart.");
      router.push("/login?redirect=" + encodeURIComponent("/flash-deals/" + slug));
      return;
    }
    if (!deal?.id || !deal.products?.length) return;
    setAdding(true);
    try {
      await addDealToCart(deal.id);
      showSuccess?.("Deal added to cart! Discount applied.");
      setIsCartOpen?.(true);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Could not add deal to cart.");
    } finally {
      setAdding(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 text-[#1790d7] animate-spin" />
          <span className="text-gray-500">Loading deal…</span>
        </div>
      </div>
    );
  }

  if (!deal) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Deal not found</h2>
          <Link href="/flash-deals" className="text-[#1790d7] hover:underline font-medium">
            Back to Flash Deals
          </Link>
        </div>
      </div>
    );
  }

  const expired = deal.ends_at && new Date(deal.ends_at) < new Date();
  const products = Array.isArray(deal.products) ? deal.products : [];
  const totalOriginal = products.reduce((s, p) => s + Number(p.price || 0), 0);
  const discountAmount =
    deal.discount_type === "percentage"
      ? totalOriginal * (Number(deal.discount_value) / 100)
      : Math.min(Number(deal.discount_value), totalOriginal);
  const totalDiscounted = Math.max(0, totalOriginal - discountAmount);
  const discountLabel =
    deal.discount_type === "percentage"
      ? `${deal.discount_value}% off`
      : `Rs ${Number(deal.discount_value).toLocaleString()} off`;

  const dealImageUrl = resolveImageUrl(deal.image_url) || PLACEHOLDER_IMG;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      {/* Back link */}
      <div className="border-b border-gray-200 bg-white">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/flash-deals"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-[#1790d7] text-sm font-medium transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            All Flash Deals
          </Link>
        </div>
      </div>

      {/* Hero: premium deal image */}
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="relative rounded-2xl overflow-hidden shadow-xl border border-gray-200 bg-white max-w-5xl mx-auto">
          <div className="aspect-[21/9] min-h-[220px] max-h-[380px] w-full bg-gray-100 relative overflow-hidden">
            <img
              src={dealImageUrl}
              alt={resolveImageAlt(deal.image_alt, deal.name || IMAGE_ALT_FALLBACKS.flashDeal)}
              className="absolute inset-0 w-full h-full object-cover object-center"
              onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
            />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-5xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-4">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1790d7] text-white text-xs font-semibold mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Flash Deal
                </div>
                <h1 className="text-2xl md:text-4xl font-bold text-white drop-shadow-md">
                  {flashDealH1}
                </h1>
                {deal.store && (
                  <p className="mt-1 text-white/90 flex items-center gap-2 text-sm">
                    <Store className="w-4 h-4" />
                    by{" "}
                    <Link
                      href={`/seller/${deal.store.slug}`}
                      className="text-white font-medium hover:underline"
                    >
                      {deal.store.name}
                    </Link>
                  </p>
                )}
              </div>
              <div className="flex flex-col items-start md:items-end gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-500 text-white font-bold text-lg shadow-lg">
                  <Tag className="w-5 h-5" />
                  {discountLabel}
                </span>
                {deal.ends_at && !expired && (
                  <span className="flex items-center gap-2 text-white/90 text-sm">
                    <Clock className="w-4 h-4" />
                    Ends {new Date(deal.ends_at).toLocaleDateString(undefined, { dateStyle: "medium" })}
                  </span>
                )}
                {expired && (
                  <span className="px-3 py-1.5 rounded-lg bg-gray-700 text-white text-sm font-medium">
                    Expired
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {/* Products in deal - left on desktop */}
          <div className="lg:col-span-2 order-1 lg:order-1">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Check className="w-5 h-5 text-[#1790d7]" />
              What&apos;s included
            </h2>
            {products.length === 0 ? (
              <p className="text-gray-500 py-8">No products in this deal right now.</p>
            ) : (
              <div className="grid sm:grid-cols-2 gap-4">
                {products.map((p) => {
                  const productImageUrl = resolveImageUrl(p.image) || PLACEHOLDER_IMG;
                  return (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group flex gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-[#1790d7]/40 hover:shadow-md transition-all"
                    >
                      <div className="w-24 h-24 rounded-xl bg-gray-100 overflow-hidden shrink-0">
                        <img
                          src={productImageUrl}
                          alt={resolveImageAlt(p.image_alt, p.name || IMAGE_ALT_FALLBACKS.product)}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-900 group-hover:text-[#1790d7] truncate transition-colors">
                          {p.name}
                        </p>
                        <p className="text-[#1790d7] font-semibold mt-1">
                          Rs {Number(p.price).toLocaleString()}
                        </p>
                        <span className="inline-block mt-2 text-gray-500 text-sm group-hover:text-[#1790d7] transition-colors">
                          View product →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Pricing card + CTA - right on desktop */}
          <div className="lg:col-span-1 order-2 lg:order-2">
            <div className="sticky top-24 rounded-2xl border border-gray-200 bg-white p-6 shadow-lg">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4">
                Price breakdown
              </h3>
              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Total if bought separately ({products.length} items)</span>
                  <span className="font-medium">Rs {totalOriginal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-rose-600">
                  <span>Deal discount ({discountLabel})</span>
                  <span className="font-medium">− Rs {discountAmount.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                  <span className="font-semibold text-gray-900">Deal price</span>
                  <span className="text-2xl font-bold text-[#1790d7]">Rs {totalDiscounted.toLocaleString()}</span>
                </div>
                {discountAmount > 0 && (
                  <p className="text-rose-600 font-medium text-sm">
                    You save Rs {discountAmount.toLocaleString()}
                  </p>
                )}
              </div>
              <p className="text-gray-500 text-sm mb-6">
                Add the entire deal to cart. Discount is applied to the total; you can proceed to checkout as usual.
              </p>
              <button
                onClick={handleGrabDeal}
                disabled={adding || expired}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] hover:from-[#1277b8] hover:to-[#3a9fd6] disabled:from-gray-300 disabled:to-gray-400 text-white font-bold text-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-3"
              >
                {adding ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Adding…
                  </>
                ) : expired ? (
                  "Deal expired"
                ) : (
                  <>
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </>
                )}
              </button>
              {!user && !expired && (
                <p className="mt-3 text-center text-gray-500 text-sm">
                  Log in to add this deal to your cart
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
