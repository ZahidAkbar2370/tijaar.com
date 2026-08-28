"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import { productApi } from "@/lib/api";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";

export default function TopCategoryProducts({ categoryName, categorySlug }) {
  const slug = categorySlug || categoryName?.toLowerCase().replace(/\s+/g, "-");
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "100px" });

  useEffect(() => {
    if (!slug || !inView) return;
    setLoading(true);
    productApi.list({ category_slug: slug, per_page: 8 }).then((r) => setCategoryProducts(r.products || [])).catch(() => setCategoryProducts([])).finally(() => setLoading(false));
  }, [slug, inView]);

  const prevClass = `cat-${slug}-prev`;
  const nextClass = `cat-${slug}-next`;

  return (
    <div ref={ref} className="py-5 lg:py-6 px-4 lg:px-16">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">
          {categoryName} Products
        </h2>
        <div className="flex gap-3">
          <button
            type="button"
            className={`${prevClass} w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white transition-colors`}
            aria-label="Previous"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            className={`${nextClass} w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white transition-colors`}
            aria-label="Next"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
          <Link
            href={`/category/${slug}`}
            className="hidden sm:flex items-center gap-2 text-[#1790d7] font-medium"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {inView && loading && <ProductCardSkeletonRow count={4} />}
      {inView && !loading && categoryProducts.length > 0 && (
      <Swiper
        modules={[Navigation]}
        spaceBetween={16}
        slidesPerView={1}
        navigation={{ prevEl: `.${prevClass}`, nextEl: `.${nextClass}` }}
        breakpoints={{
          480: { slidesPerView: 1 },
          640: { slidesPerView: 2 },
          768: { slidesPerView: 3 },
          1024: { slidesPerView: 4 },
          1280: { slidesPerView: 4 },
        }}
        className="product-swiper product-card-swiper"
      >
        {categoryProducts.slice(0, 8).map((product) => (
            <SwiperSlide key={product.id} className="!h-auto">
              <div className="h-full w-full">
                <ProductCard product={product} showAddToCart />
              </div>
            </SwiperSlide>
          ))}
      </Swiper>
      )}
    </div>
  );
}
