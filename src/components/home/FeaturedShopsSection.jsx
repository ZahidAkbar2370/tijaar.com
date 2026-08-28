"use client";

import Link from "next/link";
import Image from "next/image";
import { Store, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { useHomeData } from "@/context/HomeDataContext";

export default function FeaturedShopsSection() {
  const { featured_shops: shops, loading } = useHomeData();

  if (loading || !shops?.length) return null;

  return (
    <div className="py-6 px-4 lg:px-16 bg-white border-t border-gray-100">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Store className="w-7 h-7 text-[#1790d7]" />
            Featured Shops
          </h2>
          <p className="text-sm text-gray-500 mt-1">Private sellers with active shop promotion packages</p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="featured-shops-prev w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-[#1790d7] hover:text-white" aria-label="Previous">
            <ChevronLeft className="w-4 h-4 mx-auto" />
          </button>
          <button type="button" className="featured-shops-next w-9 h-9 rounded-full border border-gray-200 bg-white hover:bg-[#1790d7] hover:text-white" aria-label="Next">
            <ChevronRight className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={2}
        navigation={{ prevEl: ".featured-shops-prev", nextEl: ".featured-shops-next" }}
        breakpoints={{ 640: { slidesPerView: 3 }, 1024: { slidesPerView: 4 } }}
      >
        {shops.map((shop) => (
          <SwiperSlide key={shop.id}>
            <Link
              href={shop.slug ? `/seller/${shop.slug}` : "#"}
              className="block p-4 rounded-2xl border border-gray-100 bg-gray-50/50 hover:border-[#1790d7]/40 hover:shadow-md transition-all text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-xl bg-white border border-gray-100 overflow-hidden flex items-center justify-center mb-3">
                {shop.logo ? (
                  <Image src={shop.logo} alt={shop.name} width={64} height={64} className="object-contain w-full h-full" />
                ) : (
                  <Store className="w-8 h-8 text-gray-400" />
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
