"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Tag, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { flashDealsApi, getBackendBaseUrl } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { useSeoH1 } from "@/hooks/useSeoH1";
const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='240' fill='%23e5e7eb' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";

function resolveImageUrl(url) {
  if (!url || typeof url !== "string") return null;
  if (url.startsWith("http")) return url;
  const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
  return base ? `${base}${url.startsWith("/") ? "" : "/"}${url}` : url;
}

function formatDiscount(deal) {
  if (deal.discount_type === "percentage") return `${deal.discount_value}% off`;
  return `Rs ${Number(deal.discount_value).toLocaleString()} off`;
}

function formatEndsAt(endsAt) {
  if (!endsAt) return null;
  const d = new Date(endsAt);
  const now = new Date();
  return d < now ? "Expired" : `Ends ${d.toLocaleDateString(undefined, { dateStyle: "medium" })}`;
}

export default function FlashDealsPage() {
  const flashDealsH1 = useSeoH1("flash_deals");
  const { formatPrice } = useMarket();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    flashDealsApi
      .list()
      .then((res) => setDeals(res.flash_deals || []))
      .catch(() => setDeals([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50/50">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 flex items-center gap-3 tracking-tight">
            <span className="p-2.5 rounded-2xl bg-gradient-to-br from-rose-100 to-rose-50 text-rose-600 shadow-sm">
              <Tag className="w-7 h-7" />
            </span>
            {flashDealsH1}
          </h1>
          <p className="mt-3 text-gray-600 text-base max-w-xl">
            Limited-time bundles with clubbed products and extra discount. Grab them before they expire.
          </p>
        </div>

        {loading ? (
          <div className="grid gap-4 justify-center" style={{ gridTemplateColumns: "repeat(auto-fill, 220px)" }}>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white overflow-hidden animate-pulse w-[220px] max-w-[220px] justify-self-center shadow-md">
                <div className="aspect-[4/3] bg-gray-100" />
                <div className="p-3 space-y-2.5">
                  <div className="h-3.5 bg-gray-200 rounded w-3/4" />
                  <div className="h-16 bg-gray-100 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : deals.length === 0 ? (
          <div className="rounded-2xl border border-gray-200 bg-white p-16 text-center">
            <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">No Flash Deals right now</h2>
            <p className="text-gray-500 mt-2">Check back later for new deals.</p>
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-amber-500 text-white font-medium hover:bg-amber-600"
            >
              Browse Shop
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 justify-center" style={{ gridTemplateColumns: "repeat(auto-fill, 220px)" }}>
            {deals.map((deal) => {
              const expired = deal.ends_at && new Date(deal.ends_at) < new Date();
              const dealImageUrl = resolveImageUrl(deal.image_url) || PLACEHOLDER_IMG;
              const productImages = (deal.products || []).map((p) => resolveImageUrl(p.image) || PLACEHOLDER_IMG);
              const showProductSlider = productImages.length > 3;
              return (
                <Link
                  key={deal.id}
                  href={`/flash-deals/${deal.slug || deal.id}`}
                  className="group block bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1.5 hover:border-rose-100 transition-all duration-500 ease-out h-full w-[220px] max-w-[220px] justify-self-center"
                >
                  <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center p-1.5 overflow-hidden">
                    <img
                      src={dealImageUrl}
                      alt={resolveImageAlt(deal.image_alt, deal.name || IMAGE_ALT_FALLBACKS.flashDeal)}
                      className="w-full h-full object-contain rounded-xl group-hover:scale-[1.03] transition-transform duration-500 ease-out"
                      onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                    />
                    <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-rose-500/95 text-white text-[10px] font-semibold shadow-md backdrop-blur-sm">
                      {formatDiscount(deal)}
                    </span>
                    {deal.ends_at && (
                      <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-xl text-white text-[10px] font-medium shadow-md ${expired ? "bg-gray-800/95" : "bg-amber-600/95"}`}>
                        {expired ? "Expired" : formatEndsAt(deal.ends_at)}
                      </span>
                    )}
                  </div>
                  <div className="p-3">
                    <h2 className="font-semibold text-gray-900 group-hover:text-rose-600 transition-colors truncate text-sm tracking-tight" style={{ fontFamily: '"Open Sans", sans-serif' }}>
                      {deal.name}
                    </h2>
                    {(deal.deal_price != null || deal.total_original_price != null) && (
                      <div className="mt-1.5 flex items-center gap-2 flex-wrap">
                        {deal.deal_price != null && deal.deal_price > 0 && (
                          <span className="font-bold text-orange-600 text-sm">
                            {formatPrice ? formatPrice(deal.deal_price) : `Rs ${Number(deal.deal_price).toLocaleString()}`}
                          </span>
                        )}
                        {deal.total_original_price != null && deal.total_original_price > 0 && deal.deal_price != null && deal.total_original_price > deal.deal_price && (
                          <span className="text-xs text-gray-500 line-through">
                            {formatPrice ? formatPrice(deal.total_original_price) : `Rs ${Number(deal.total_original_price).toLocaleString()}`}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="mt-2.5 rounded-xl border border-gray-100 overflow-hidden bg-gradient-to-b from-gray-50 to-white min-h-[64px] flex items-center p-1.5 flash-deal-product-strip" onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}>
                      {showProductSlider ? (
                        <Swiper
                          modules={[Autoplay]}
                          slidesPerView={3}
                          slidesPerGroup={1}
                          spaceBetween={6}
                          loop={productImages.length > 3}
                          autoplay={{ delay: 2800, disableOnInteraction: false }}
                          speed={500}
                          className="flash-deal-product-photos w-full !overflow-hidden"
                        >
                          {productImages.map((url, i) => (
                            <SwiperSlide key={i} className="!flex items-center justify-center">
                              <div className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-gray-200/80 bg-white shadow-sm hover:shadow-md hover:scale-105 hover:border-rose-200 transition-all duration-300">
                                <img src={url} alt={resolveImageAlt(deal.products?.[i]?.image_alt, deal.products?.[i]?.title || deal.products?.[i]?.name || IMAGE_ALT_FALLBACKS.product)} className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
                              </div>
                            </SwiperSlide>
                          ))}
                        </Swiper>
                      ) : (
                        <div className="flex items-center justify-center gap-1.5 w-full">
                          {(productImages.length ? productImages : [PLACEHOLDER_IMG]).slice(0, 3).map((url, i) => (
                            <div key={i} className="w-12 h-12 shrink-0 rounded-lg overflow-hidden border border-gray-200/80 bg-white shadow-sm">
                              <img src={url} alt={resolveImageAlt(deal.products?.[i]?.image_alt, deal.products?.[i]?.title || deal.products?.[i]?.name || IMAGE_ALT_FALLBACKS.product)} className="w-full h-full object-cover" onError={(e) => { e.target.src = PLACEHOLDER_IMG; }} />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {deal.store && <p className="text-[10px] text-gray-400 mt-1.5">by {deal.store.name}</p>}
                    <span className="inline-flex items-center gap-1 mt-2.5 text-rose-600 font-semibold text-xs group-hover:text-rose-700 group-hover:gap-2 transition-all duration-300">
                      View deal
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
