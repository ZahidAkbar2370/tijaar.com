"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { PRODUCT_CARD_SWIPER_BREAKPOINTS, PRODUCT_CARD_SWIPER_DEFAULT } from "@/lib/productCardSwiper";
import { useHomeData } from "@/context/HomeDataContext";

export default function RecentProductsSection() {
  const { recent_products: products, loading } = useHomeData();

  if (loading) {
    return (
      <div className="py-8 px-4 lg:px-16 bg-white">
        <div className="mb-6 h-9 w-56 bg-gray-100 rounded-lg animate-pulse" />
        <ProductCardSkeletonRow count={4} />
      </div>
    );
  }
  if (!products?.length) return null;

  return (
    <div className="py-8 px-4 lg:px-16 bg-white">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-800">
            <span className="truncate">Recently Added</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            className="recent-products-prev w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm sm:shadow-md"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            className="recent-products-next w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm sm:shadow-md"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <Link
            href="/shop?sort=newest"
            aria-label="View all recently added products"
            className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-5 py-1.5 sm:py-2.5 border border-[#1790d7] sm:border-2 text-[#1790d7] rounded-full text-[11px] sm:text-sm font-semibold hover:bg-[#1790d7] hover:text-white transition-colors shadow-sm whitespace-nowrap"
          >
            View All
          </Link>
        </div>
      </div>

      <Swiper
        modules={[Autoplay, Navigation]}
        {...PRODUCT_CARD_SWIPER_DEFAULT}
        autoplay={{
          delay: 2500,
          disableOnInteraction: false,
        }}
        navigation={{ prevEl: ".recent-products-prev", nextEl: ".recent-products-next" }}
        loop={products.length >= 4}
        breakpoints={PRODUCT_CARD_SWIPER_BREAKPOINTS}
        className="recent-products-swiper product-card-swiper"
      >
        {products.map((product) => (
          <SwiperSlide key={product.id} className="!h-auto">
            <div className="h-full w-full">
              <ProductCard product={product} showAddToCart />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
