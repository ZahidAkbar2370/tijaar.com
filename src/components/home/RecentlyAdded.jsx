"use client";

import { useState, useEffect, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { productApi } from "@/lib/api";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";

export default function RecentlyAdded() {
  const [recent, setRecent] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "100px" });

  useEffect(() => {
    if (!inView) return;
    setLoading(true);
    productApi.list({ per_page: 8, sort: "newest" }).then((r) => setRecent(r.products || [])).catch(() => setRecent([])).finally(() => setLoading(false));
  }, [inView]);

  return (
    <div ref={ref} className="py-6 px-4 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex justify-between items-center mb-4"
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 flex items-center gap-2">
            <span className="text-[#4db3e8]">✨</span>
            Recently Added
          </h2>
          <p className="text-gray-500 mt-2">Fresh listings just posted</p>
        </div>
        <div className="flex gap-3">
          <button type="button" className="recent-prev w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white transition-colors" aria-label="Previous">
            <span className="text-lg">←</span>
          </button>
          <button type="button" className="recent-next w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white transition-colors" aria-label="Next">
            <span className="text-lg">→</span>
          </button>
        </div>
      </motion.div>

      {inView && loading && <ProductCardSkeletonRow count={6} />}
      {inView && !loading && recent?.length > 0 && (
      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        navigation={{ prevEl: ".recent-prev", nextEl: ".recent-next" }}
        autoplay={{ delay: 3500 }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
        }}
        className="recent-swiper product-card-swiper"
      >
        {recent.map((item) => (
            <SwiperSlide key={item.id} className="!h-auto">
              <div className="h-full w-full">
                <ProductCard product={item} showAddToCart compact />
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
      )}
    </div>
  );
}
