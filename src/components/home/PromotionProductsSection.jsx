"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { useHomeData } from "@/context/HomeDataContext";

export default function PromotionProductsSection({
  dataKey,
  title,
  subtitle,
  viewAllHref = "/shop",
  icon: Icon = null,
}) {
  const { [dataKey]: products, loading } = useHomeData();

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
            {Icon ? <Icon className="w-5 h-5 sm:w-8 sm:h-8 text-amber-500 shrink-0" /> : null}
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
        spaceBetween={24}
        slidesPerView={1}
        autoplay={{ delay: 4500 }}
        navigation={{ prevEl: `.${navPrev}`, nextEl: `.${navNext}` }}
        breakpoints={{
          480: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
        }}
        className="product-card-swiper"
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
