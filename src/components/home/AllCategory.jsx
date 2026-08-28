"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import CategoryIcon from "@/components/common/CategoryIcon";
import { useHomeData } from "@/context/HomeDataContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { categoryHasImage, resolveCategoryImageSrc } from "@/lib/categoryImage";
import { IMAGE_WIDTHS } from "@/lib/imageOptimize";

export default function AllCategory() {
  const { browse_categories: categories, loading } = useHomeData();

  if (loading || !(categories?.length)) return null;

  return (
    <div className="py-6 px-4 lg:px-16 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="text-center mb-4"
      >
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Browse Categories</h2>
        <p className="text-gray-500">Explore our wide range of product categories</p>
      </motion.div>

      <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3 lg:gap-4 w-full">
        {categories.map((cat, i) => {
          const hasImage = categoryHasImage(cat);
          const imgSrc = resolveCategoryImageSrc(cat, IMAGE_WIDTHS.categoryIcon * 2);
          return (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.03 }}
            >
              <Link href={`/category/${cat.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl border border-gray-100 flex flex-col items-center text-center"
                >
                  <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center mb-3 text-white overflow-hidden shrink-0 relative">
                    {hasImage ? (
                      <img
                        src={imgSrc}
                        alt={resolveImageAlt(cat.image_alt, cat.name || IMAGE_ALT_FALLBACKS.category)}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; const next = e.target.nextElementSibling; if (next) next.style.display = "flex"; }}
                      />
                    ) : null}
                    <div className="absolute inset-0 w-full h-full flex items-center justify-center text-white/90" style={{ display: hasImage ? "none" : "flex" }}>
                      <CategoryIcon icon={cat.icon} className="w-10 h-10 lg:w-12 lg:h-12 text-white" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{cat.name}</h3>
                </motion.div>
              </Link>
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-10">
        <Link
          href="/all-categories"
          className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg"
        >
          View All Categories
          <span>→</span>
        </Link>
      </div>
    </div>
  );
}
