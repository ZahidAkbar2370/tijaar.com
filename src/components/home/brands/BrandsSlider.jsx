import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import useApiQuery from "../../../hooks/useApiQuery";
import axiosInstance, { imageURL } from "../../../api/axiosInstance";
import DotsLoader from "../../common/DotsLoader";

const BrandsSlider = () => {
  const { data, isLoading, isError } = useApiQuery(
    ["brands"],
    async () => {
      const res = await axiosInstance.get("/brands");
      return res?.data || [];
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const brands = useMemo(() => {
    const list = Array.isArray(data) ? data : data?.data;
    return Array.isArray(list) ? list : [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-12 px-4 lg:px-16 bg-white border-y border-gray-100 flex items-center justify-center">
        <DotsLoader size="md" />
      </div>
    );
  }

  if (isError || !brands.length) {
    return null;
  }

  return (
    <div className="py-12 px-4 lg:px-16 bg-white border-y border-gray-100">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-8"
      >
        <p className="text-gray-500 text-sm uppercase tracking-wider font-medium">
          Trusted by Top Brands & Sellers
        </p>
      </motion.div>

      <Swiper
        modules={[Autoplay]}
        spaceBetween={40}
        slidesPerView={3}
        loop={true}
        speed={3000}
        autoplay={{
          delay: 0,
          disableOnInteraction: false,
        }}
        breakpoints={{
          640: { slidesPerView: 4 },
          768: { slidesPerView: 6 },
          1024: { slidesPerView: 8 },
          1400: { slidesPerView: 10 },
        }}
        className="brands-swiper"
      >
        {brands.map((brand) => {
          const brandImage = brand.image || brand.logo;
          const imageSrc = brandImage
            ? brandImage.startsWith("http")
              ? brandImage
              : `${imageURL}${brandImage}`
            : null;

          const brandSlug = brand.slug || brand.id || brand.name?.toLowerCase().replace(/\s+/g, "-");

          return (
            <SwiperSlide key={brand.id || brand.slug || brand.name}>
              <Link to={`/brand/${brandSlug}`}>
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="flex flex-col items-center justify-center gap-2 py-4 px-6 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
                >
                  {imageSrc ? (
                    <img
                      src={imageSrc}
                      alt={brand.name}
                      className="h-12 w-24 object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <span className="text-4xl grayscale group-hover:grayscale-0 transition-all duration-300">
                      {brand.name?.[0] || "•"}
                    </span>
                  )}
                  <span className="text-xs font-medium text-gray-400 group-hover:text-gray-700 transition-colors whitespace-nowrap">
                    {brand.name}
                  </span>
                </motion.div>
              </Link>
            </SwiperSlide>
          );
        })}
      </Swiper>
    </div>
  );
};

export default BrandsSlider;

