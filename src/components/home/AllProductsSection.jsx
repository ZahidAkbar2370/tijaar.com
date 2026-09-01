"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { PRODUCT_CARD_SWIPER_BREAKPOINTS, PRODUCT_CARD_SWIPER_DEFAULT } from "@/lib/productCardSwiper";
import { useHomeData } from "@/context/HomeDataContext";

export default function AllProductsSection() {
  const { all_products: products, loading } = useHomeData();

  if (loading) {
    return (
      <div className="py-8 px-4 lg:px-16 bg-white">
        <div className="mb-6 h-9 w-48 bg-gray-100 rounded-lg animate-pulse" />
        <ProductCardSkeletonRow count={4} />
      </div>
    );
  }
  if (!products?.length) return null;

  return (
    <div className="py-8 px-4 lg:px-16 bg-white border-t border-gray-100">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-800">
            <span className="truncate">All Products</span>
          </h2>
          <p className="text-gray-500 mt-0.5 sm:mt-1 text-xs sm:text-base hidden sm:block">Browse all products from our categories</p>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            className="all-products-prev w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm sm:shadow-md"
            aria-label="Previous"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button
            type="button"
            className="all-products-next w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm sm:shadow-md"
            aria-label="Next"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <Link
            href="/shop"
            aria-label="View all products"
            className="inline-flex items-center justify-center px-2.5 sm:px-5 py-1.5 sm:py-2.5 border border-[#1790d7] sm:border-2 text-[#1790d7] rounded-full text-[11px] sm:text-sm font-semibold hover:bg-[#1790d7] hover:text-white transition-colors shadow-sm whitespace-nowrap"
          >
            View All
          </Link>
        </div>
      </div>

      <Swiper
        modules={[Navigation]}
        {...PRODUCT_CARD_SWIPER_DEFAULT}
        navigation={{ prevEl: ".all-products-prev", nextEl: ".all-products-next" }}
        breakpoints={PRODUCT_CARD_SWIPER_BREAKPOINTS}
        className="all-products-swiper product-card-swiper"
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
