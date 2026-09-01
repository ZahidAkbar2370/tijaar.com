"use client";

import Link from "next/link";
import { useCallback, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { PRODUCT_CARD_SWIPER_BREAKPOINTS, PRODUCT_CARD_SWIPER_DEFAULT } from "@/lib/productCardSwiper";
import { useHomeData } from "@/context/HomeDataContext";
import { trackProductEvent } from "@/lib/productAnalytics";

function trackProductsImpression(products, indices = []) {
  if (!products?.length || !indices.length) return;
  indices.forEach((idx) => {
    const product = products[idx];
    if (product?.id) trackProductEvent(product.id, "impression");
  });
}

function visibleSlideIndices(swiper) {
  if (!swiper) return [];
  const spv = Math.max(1, Math.round(Number(swiper.params?.slidesPerView) || 1));
  const indices = [];
  for (let i = 0; i < spv; i += 1) {
    const idx = swiper.activeIndex + i;
    if (idx >= 0 && idx < swiper.slides.length) indices.push(idx);
  }
  return indices;
}

export default function PromotionProductsSection({
  dataKey,
  title,
  subtitle,
  viewAllHref = "/shop",
}) {
  const { [dataKey]: products, loading } = useHomeData();
  const swiperRef = useRef(null);

  const trackVisible = useCallback(
    (swiper) => {
      trackProductsImpression(products, visibleSlideIndices(swiper));
    },
    [products]
  );

  if (loading) {
    return (
      <div className="py-6 px-4 lg:px-16 bg-white">
        <ProductCardSkeletonRow count={4} />
      </div>
    );
  }
  if (!products?.length) return null;

  const navPrev = `${dataKey}-prev`;
  const navNext = `${dataKey}-next`;

  return (
    <div className="py-6 px-4 lg:px-16 bg-gradient-to-b from-white to-gray-50/80">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-1.5 sm:gap-2">
            <span className="truncate">{title}</span>
          </h2>
          {subtitle ? (
            <p className="text-gray-500 mt-0.5 sm:mt-2 text-xs sm:text-base hidden sm:block">{subtitle}</p>
          ) : null}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button type="button" className={`${navPrev} w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm`} aria-label="Previous">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button type="button" className={`${navNext} w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm`} aria-label="Next">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <Link href={viewAllHref} className="inline-flex items-center px-2.5 sm:px-5 py-1.5 sm:py-2.5 border border-[#1790d7] text-[#1790d7] rounded-full text-[11px] sm:text-sm font-semibold hover:bg-[#1790d7] hover:text-white transition-colors whitespace-nowrap">
            View All
          </Link>
        </div>
      </div>
      <Swiper
        modules={[Autoplay, Navigation]}
        {...PRODUCT_CARD_SWIPER_DEFAULT}
        autoplay={{ delay: 4500 }}
        navigation={{ prevEl: `.${navPrev}`, nextEl: `.${navNext}` }}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
          trackVisible(swiper);
        }}
        onSlideChangeTransitionEnd={(swiper) => trackVisible(swiper)}
        breakpoints={PRODUCT_CARD_SWIPER_BREAKPOINTS}
        className="product-card-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
            <div className="h-full w-full">
              <ProductCard product={product} showAddToCart trackImpression={false} />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
