"use client";

import { ArrowLeft } from "lucide-react";
import CategoryPickerGrid from "./CategoryPickerGrid";

export default function SellCategoryPicker({
  parentCategory,
  browseItems,
  pickerLoading,
  onSelectBrowseItem,
  onBack,
}) {
  const isRootBrowse = !parentCategory;

  const heading = isRootBrowse ? "Choose a Category for Your Item" : parentCategory?.name || "Subcategories";
  const sub = isRootBrowse ? null : "Choose a subcategory";

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
      <div className="p-4 sm:p-6 lg:p-8">
        {parentCategory && (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-600 hover:text-[#1790d7] mb-4 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}

        <div className="text-left mb-5">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-0.5">{heading}</h2>
          {sub && <p className="text-gray-500 text-sm">{sub}</p>}
        </div>

        {pickerLoading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3 lg:gap-4 animate-pulse">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-40 sm:h-44 bg-gray-100 rounded-2xl" />
            ))}
          </div>
        ) : (
          <CategoryPickerGrid items={browseItems} onSelect={onSelectBrowseItem} />
        )}
      </div>
    </div>
  );
}
