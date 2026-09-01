"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, BadgeCheck } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useHomeData } from "@/context/HomeDataContext";
import SellerAvatar from "@/components/vendors/SellerAvatar";

export default function FeaturedShopsSection() {
  const { featured_shops: shops, loading } = useHomeData();

  if (loading || !shops?.length) return null;

  return (
    <div className="py-6 px-4 lg:px-16 bg-white border-b border-gray-100">
      <div className="flex items-center justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
        <div className="min-w-0">
          <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-gray-800">
            <span className="truncate">Featured Verified Sellers</span>
          </h2>
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button type="button" className="featured-shops-prev w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm" aria-label="Previous">
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <button type="button" className="featured-shops-next w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors shadow-sm" aria-label="Next">
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <Link href="/sellers" className="inline-flex items-center px-2.5 sm:px-5 py-1.5 sm:py-2.5 border border-[#1790d7] text-[#1790d7] rounded-full text-[11px] sm:text-sm font-semibold hover:bg-[#1790d7] hover:text-white transition-colors whitespace-nowrap">
            View All
          </Link>
        </div>
      </div>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        navigation={{ prevEl: ".featured-shops-prev", nextEl: ".featured-shops-next" }}
        breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 }, 1280: { slidesPerView: 5 } }}
      >
        {shops.map((shop) => (
          <SwiperSlide key={shop.id}>
            <Link
              href={shop.slug ? `/seller/${shop.slug}` : "/sellers"}
              className="block p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-[#1790d7]/40 hover:shadow-md transition-all text-center h-full"
            >
              <div className="relative w-16 h-16 mx-auto mb-3">
                <SellerAvatar
                  src={shop.logo}
                  alt={shop.name}
                  className="w-16 h-16 border border-gray-100"
                  iconClassName="w-8 h-8"
                />
                {shop.kyc_verified !== false && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white shadow border border-blue-100">
                    <BadgeCheck className="w-3.5 h-3.5 text-blue-500" aria-hidden />
                  </span>
                )}
              </div>
              <p className="font-semibold text-gray-900 truncate">{shop.name}</p>
              {shop.city ? <p className="text-xs text-gray-500 mt-0.5 truncate">{shop.city}</p> : null}
            </Link>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
