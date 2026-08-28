"use client";

import Link from "next/link";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import { useEffect } from "react";
import { getBackendBaseUrl } from "@/lib/api";
import { useHomeData } from "@/context/HomeDataContext";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";
import { loadSwiperStyles } from "@/components/common/SwiperCssLoader";

export default function BrandsSlider() {
  useEffect(() => {
    loadSwiperStyles();
  }, []);
  const { featured_brands: brands, loading } = useHomeData();

  if (loading || !(brands?.length)) return null;

  const baseUrl = getBackendBaseUrl();
  const getBrandImageSrc = (brand) => {
    if (brand.logo_url) return brand.logo_url;
    if (!brand.logo) return null;
    const path = String(brand.logo).trim();
    if (path.startsWith("http")) return path;
    if (path.startsWith("upload/")) return `${baseUrl}/${path}`;
    return `${baseUrl}/storage/${path}`;
  };

  return (
    <div className="py-5 px-4 lg:px-16 bg-white border-y border-gray-100">
      <p className="text-center mb-4 text-gray-600 text-sm uppercase tracking-wider font-medium">
        Trusted by Top Brands & Sellers
      </p>
      <Swiper
        modules={[Autoplay]}
        spaceBetween={40}
        slidesPerView={3}
        loop
        speed={3000}
        autoplay={{ delay: 0, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 4 },
          768: { slidesPerView: 6 },
          1024: { slidesPerView: 8 },
          1400: { slidesPerView: 10 },
        }}
        className="brands-swiper"
      >
        {brands.map((brand) => {
          const imageSrc = getBrandImageSrc(brand);
          return (
          <SwiperSlide key={brand.id}>
            <Link href={`/brand/${brand.slug}`}>
              <div className="flex flex-col items-center justify-center gap-2 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group">
                {imageSrc ? (
                  <img
                    src={optimizeImageUrl(imageSrc, { width: IMAGE_WIDTHS.brandLogo, quality: 85 })}
                    alt=""
                    className="h-12 w-24 object-contain grayscale group-hover:grayscale-0 transition-all"
                    loading="lazy"
                    decoding="async"
                  />
                ) : (
                  <span className="text-4xl grayscale group-hover:grayscale-0">
                    {brand.name?.[0] || "•"}
                  </span>
                )}
                <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 whitespace-nowrap">
                  {brand.name}
                </span>
              </div>
            </Link>
          </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
}
