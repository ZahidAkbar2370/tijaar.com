"use client";

import { Search } from "lucide-react";

export default function ProductSeoFields({ form, onMetaChange, errors = {} }) {
  return (
    <section>
      <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <Search className="w-5 h-5 text-violet-500" />
        SEO (Search engines)
      </h3>
      <p className="text-xs text-gray-500 mb-4">
        Filled automatically from product name and short description. You can edit any field.
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta title</label>
          <input
            type="text"
            name="meta_title"
            value={form.meta_title || ""}
            onChange={onMetaChange}
            placeholder="Title in Google & browser tab"
            className={`w-full px-4 py-3 rounded-xl border ${errors.meta_title ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]`}
          />
          {errors.meta_title && <p className="mt-1 text-sm text-red-500">{errors.meta_title}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta description</label>
          <textarea
            name="meta_description"
            value={form.meta_description || ""}
            onChange={onMetaChange}
            rows={3}
            placeholder="Short summary for search results (max 160 chars recommended)"
            className={`w-full px-4 py-3 rounded-xl border ${errors.meta_description ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]`}
          />
          {errors.meta_description && <p className="mt-1 text-sm text-red-500">{errors.meta_description}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Meta keywords</label>
          <input
            type="text"
            name="meta_keywords"
            value={form.meta_keywords || ""}
            onChange={onMetaChange}
            placeholder="e.g. headphones, wireless, bluetooth"
            className={`w-full px-4 py-3 rounded-xl border ${errors.meta_keywords ? "border-red-500" : "border-gray-200"} focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]`}
          />
          {errors.meta_keywords && <p className="mt-1 text-sm text-red-500">{errors.meta_keywords}</p>}
        </div>
      </div>
    </section>
  );
}
