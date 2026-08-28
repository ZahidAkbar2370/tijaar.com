"use client";

import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import { useHomeData } from "@/context/HomeDataContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";

export default function Testimonials() {
  const { testimonials, loading } = useHomeData();

  if (loading || !(testimonials?.length)) return null;

  return (
    <div className="py-12 lg:py-16 px-4 lg:px-16 bg-gradient-to-b from-white to-gray-50 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="flex flex-col md:flex-row md:justify-between md:items-end mb-8"
      >
        <div className="text-center md:text-left mb-4 md:mb-0">
          <span className="inline-block px-4 py-2 bg-amber-100 text-amber-700 rounded-full text-sm font-semibold mb-2">
            Testimonials
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">What Our Users Say</h2>
          <p className="text-gray-500 text-lg max-w-2xl">
            Join thousands of satisfied buyers and sellers who trust our platform
          </p>
        </div>
        <div className="flex justify-center md:justify-end gap-3">
          <button type="button" className="testimonial-prev w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white transition shadow-sm" aria-label="Previous">
            ←
          </button>
          <button type="button" className="testimonial-next w-11 h-11 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-[#1790d7] hover:text-white transition shadow-sm" aria-label="Next">
            →
          </button>
        </div>
      </motion.div>

      <div className="w-full">
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          navigation={{ prevEl: ".testimonial-prev", nextEl: ".testimonial-next" }}
          autoplay={{ delay: 5000 }}
          breakpoints={{ 640: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
          className="testimonial-swiper"
        >
          {testimonials.map((t, i) => (
            <SwiperSlide key={t.id}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl border border-gray-100 h-full"
              >
                <div className="flex justify-between items-start mb-4">
                  <Quote className="w-10 h-10 text-[#4db3e8]/20 shrink-0" />
                  {t.rating != null && (
                    <div className="flex gap-0.5">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-4 h-4 ${j < t.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}`} />
                      ))}
                    </div>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed mb-6 line-clamp-4">&ldquo;{t.content}&rdquo;</p>
                <div className="flex items-center gap-4 pt-4 border-t border-gray-100">
                  {t.avatar ? (
                    <img src={t.avatar} alt={resolveImageAlt(t.avatar_alt, t.name || IMAGE_ALT_FALLBACKS.testimonial)} className="w-12 h-12 rounded-full object-cover ring-2 ring-[#4db3e8]/20 shrink-0" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1790d7]/10 flex items-center justify-center text-[#1790d7] font-semibold shrink-0">
                      {t.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <h4 className="font-semibold text-gray-800">{t.name}</h4>
                    <p className="text-sm text-gray-500">
                      {[t.role, t.company].filter(Boolean).join(" · ")}
                    </p>
                  </div>
                </div>
              </motion.div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </div>
  );
}
