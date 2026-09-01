"use client";

import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { categoryHasImage, resolveCategoryImageSrc } from "@/lib/categoryImage";
import CategoryIcon from "@/components/common/CategoryIcon";
import { IMAGE_WIDTHS } from "@/lib/imageOptimize";

export default function SelectedListingCategory({
  parentCategory,
  subcategory,
  onChange,
}) {
  const display = subcategory || parentCategory;
  const hasImage = categoryHasImage(display);
  const imgSrc = resolveCategoryImageSrc(display, IMAGE_WIDTHS.categoryIcon * 2);
  const showSubLabel =
    subcategory && parentCategory && String(subcategory.id) !== String(parentCategory.id);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-4 border-b border-gray-200">
      <span className="text-sm font-semibold text-gray-900 shrink-0">Category</span>
      <div className="flex flex-1 items-center gap-3 min-w-0">
        <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-[#1790d7] to-[#4db3e8] overflow-hidden shrink-0 relative flex items-center justify-center text-white">
          {hasImage ? (
            <img
              src={imgSrc}
              alt={resolveImageAlt(display?.image_alt, display?.name || IMAGE_ALT_FALLBACKS.category)}
              className="w-full h-full object-cover"
            />
          ) : (
            <CategoryIcon icon={display?.icon} className="w-7 h-7 text-white" />
          )}
        </div>
        <div className="min-w-0">
          <p className="font-semibold text-gray-900 truncate">{parentCategory?.name || "—"}</p>
          {showSubLabel && (
            <p className="text-sm text-[#1790d7] truncate">{subcategory.name}</p>
          )}
        </div>
      </div>
      <button
        type="button"
        onClick={onChange}
        className="text-sm font-semibold text-[#1790d7] hover:text-[#1277b8] hover:underline shrink-0 self-start sm:self-center"
      >
        Change
      </button>
    </div>
  );
}
