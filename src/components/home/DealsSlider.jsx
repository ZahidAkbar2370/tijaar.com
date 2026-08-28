"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import { getBackendBaseUrl } from "@/lib/api";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { useHomeData } from "@/context/HomeDataContext";
import { useMarket } from "@/context/MarketContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";

const PLACEHOLDER_IMG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200' fill='%23e5e7eb' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2z'/%3E%3C/svg%3E";

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

function formatEndsAt(deal) {
  if (!deal.ends_at) return null;
  const d = new Date(deal.ends_at);
  const now = new Date();
  return d < now ? "Expired" : `Ends ${d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}`;
}

export default function DealsSlider() {
  const { flash_deals: deals, loading } = useHomeData();
  const { formatPrice } = useMarket();

  if (loading) return <div className="py-6 px-4 lg:px-16 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500"><div className="w-full"><ProductCardSkeletonRow count={4} /></div></div>;
  if (!(deals?.length)) return null;

  return (
    <div className="py-8 px-4 lg:px-16 bg-gradient-to-br from-red-600 via-orange-500 to-amber-500 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex justify-between items-center mb-5">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-2 drop-shadow-sm">
              <span className="text-yellow-300">🔥</span>
              Flash Deals
            </h2>
            <p className="text-white/90 mt-1 text-sm font-medium">Limited time bundles — Grab them fast!</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <button type="button" className="deals-prev w-11 h-11 flex items-center justify-center rounded-full bg-white text-orange-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-white/80" aria-label="Previous deals">
              <ChevronLeft className="w-6 h-6 flex-shrink-0 stroke-[2.5]" />
            </button>
            <button type="button" className="deals-next w-11 h-11 flex items-center justify-center rounded-full bg-white text-orange-600 shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105 active:scale-95 border border-white/80" aria-label="Next deals">
              <ChevronRight className="w-6 h-6 flex-shrink-0 stroke-[2.5]" />
            </button>
            <Link
              href="/flash-deals"
              aria-label="View all flash deals"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-sm font-semibold bg-white/95 text-[#1790d7] border-2 border-[#1790d7] hover:bg-white shadow-md transition-colors"
            >
              View All
            </Link>
          </div>
        </div>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={20}
          slidesPerView={1}
          autoplay={{ delay: 3200, disableOnInteraction: false }}
          speed={400}
          navigation={{ prevEl: ".deals-prev", nextEl: ".deals-next" }}
          breakpoints={{
            400: { slidesPerView: 2 },
            640: { slidesPerView: 3 },
            768: { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
          className="deals-swiper product-card-swiper"
        >
          {deals.map((deal) => {
            const dealImageUrl = optimizeImageUrl(resolveImageUrl(deal.image_url) || PLACEHOLDER_IMG, {
              width: IMAGE_WIDTHS.productCard,
              quality: 78,
            });
            const productImages = (deal.products || []).map((p) =>
              optimizeImageUrl(resolveImageUrl(p.image) || PLACEHOLDER_IMG, { width: IMAGE_WIDTHS.productCard, quality: 78 })
            );
            const showProductSlider = productImages.length > 3;
            return (
              <SwiperSlide key={deal.id} className="!h-auto">
                <Link href={`/flash-deals/${deal.slug || deal.id}`} className="block h-full group/card">
                  <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 ease-out flex flex-col w-[220px] max-w-[220px] mx-auto flex-shrink-0 border border-gray-100 hover:border-rose-100">
                    <div className="aspect-[4/3] bg-gray-50 relative flex items-center justify-center p-1.5 overflow-hidden">
                      <img
                        src={dealImageUrl}
                        alt={resolveImageAlt(deal.image_alt, deal.name || IMAGE_ALT_FALLBACKS.flashDeal)}
                        className="w-full h-full object-contain rounded-xl group-hover/card:scale-[1.03] transition-transform duration-500 ease-out"
                        onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                      />
                      <span className="absolute bottom-2 left-2 px-2.5 py-1 rounded-xl bg-rose-500/95 text-white text-[10px] font-semibold shadow-md backdrop-blur-sm">
                        {formatDiscount(deal)}
                      </span>
                      {deal.ends_at && (
                        <span className={`absolute top-2 right-2 px-2.5 py-1 rounded-xl text-white text-[10px] font-medium shadow-md ${new Date(deal.ends_at) < new Date() ? "bg-gray-700/95" : "bg-amber-600/95"}`}>
                          {formatEndsAt(deal)}
                        </span>
                      )}
                    </div>
                    <div className="p-3 flex-1 flex flex-col min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate text-sm tracking-tight" style={{ fontFamily: '"Open Sans", sans-serif' }}>{deal.name}</h3>
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
                    </div>
                  </div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
}
