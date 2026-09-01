"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import ProductCard from "@/components/public/ProductCard";
import { PRODUCT_CARD_SWIPER_BREAKPOINTS, PRODUCT_CARD_SWIPER_DEFAULT } from "@/lib/productCardSwiper";
import { useHomeData } from "@/context/HomeDataContext";

export default function CategoryProductsSection() {
  const { featured_products_by_category: byCategory, loading } = useHomeData();

  if (loading) return null;
  if (!byCategory?.length) return null;

  return (
    <>
      {byCategory.map((item) => {
        const { category, products } = item;
        if (!category?.slug || !products?.length) return null;
        const prevClass = `cat-${category.slug}-prev`;
        const nextClass = `cat-${category.slug}-next`;
        return (
          <div
            key={category.id || category.slug}
            className="py-5 lg:py-6 px-4 lg:px-16 bg-gradient-to-b from-gray-50 to-white"
          >
            <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
              <h2 className="text-base sm:text-2xl lg:text-3xl font-bold text-gray-800 min-w-0 truncate pr-1">
                {category.name} Products
              </h2>
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <button
                  type="button"
                  className={`${prevClass} w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm sm:shadow-md`}
                  aria-label={`Previous ${category.name} products`}
                >
                  <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <button
                  type="button"
                  className={`${nextClass} w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm sm:shadow-md`}
                  aria-label={`Next ${category.name} products`}
                >
                  <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <Link
                  href={`/category/${category.slug}`}
                  aria-label={`View all ${category.name} products`}
                  className="inline-flex items-center justify-center px-2.5 sm:px-5 py-1.5 sm:py-2.5 border border-[#1790d7] sm:border-2 text-[#1790d7] rounded-full text-[11px] sm:text-sm font-semibold hover:bg-[#1790d7] hover:text-white transition-colors shadow-sm whitespace-nowrap"
                >
                  View All
                </Link>
              </div>
            </div>
            <Swiper
              modules={[Navigation]}
              {...PRODUCT_CARD_SWIPER_DEFAULT}
              navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
              breakpoints={PRODUCT_CARD_SWIPER_BREAKPOINTS}
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
      })}
    </>
  );
}
