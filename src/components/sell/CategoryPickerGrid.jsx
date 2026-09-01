"use client";

import CategoryIcon from "@/components/common/CategoryIcon";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { categoryHasImage, resolveCategoryImageSrc } from "@/lib/categoryImage";
import { IMAGE_WIDTHS } from "@/lib/imageOptimize";

function ItemCard({ item, imageSrc, hasImage, icon, alt, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full bg-white rounded-2xl p-5 sm:p-6 shadow-sm hover:shadow-xl border border-gray-100 flex flex-col items-center text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/30"
    >
      <div className="w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center mb-3 text-white overflow-hidden shrink-0 relative">
        {hasImage ? (
          <img
            src={imageSrc}
            alt={alt}
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(e) => {
              e.target.onerror = null;
              e.target.style.display = "none";
              const next = e.target.nextElementSibling;
              if (next) next.style.display = "flex";
            }}
          />
        ) : null}
        <div
          className="absolute inset-0 w-full h-full flex items-center justify-center text-white/90"
          style={{ display: hasImage ? "none" : "flex" }}
        >
          <CategoryIcon icon={icon} className="w-12 h-12 sm:w-14 sm:h-14 text-white" />
        </div>
      </div>
      <h3 className="font-semibold text-gray-900 text-sm sm:text-base line-clamp-2">{item.name}</h3>
    </button>
  );
}

export default function CategoryPickerGrid({ items, onSelect, variant = "category" }) {
  if (!items?.length) {
    return (
      <p className="text-center text-sm text-gray-500 py-8">Nothing available here yet.</p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4">
      {items.map((item) => {
        if (variant === "brand") {
          const initial = (item.name || "?").charAt(0).toUpperCase();
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item)}
              className="w-full bg-white rounded-2xl p-4 shadow-sm hover:shadow-xl border border-gray-100 flex flex-col items-center text-center transition hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/30"
            >
              <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-xl bg-gray-100 flex items-center justify-center mb-3 text-[#1790d7] text-2xl font-bold shrink-0">
                {initial}
              </div>
              <h3 className="font-semibold text-gray-900 text-sm line-clamp-2">{item.name}</h3>
            </button>
          );
        }

        const hasImage = categoryHasImage(item);
        const imgSrc = resolveCategoryImageSrc(item, IMAGE_WIDTHS.categoryIcon * 2);
        return (
          <ItemCard
            key={item.id}
            item={item}
            imageSrc={imgSrc}
            hasImage={hasImage}
            icon={item.icon}
            alt={resolveImageAlt(item.image_alt, item.name || IMAGE_ALT_FALLBACKS.category)}
            onClick={() => onSelect(item)}
          />
        );
      })}
    </div>
  );
}
