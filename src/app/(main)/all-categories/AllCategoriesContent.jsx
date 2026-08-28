"use client";

import { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { categoryApi } from "@/lib/api";
import { Home, ChevronRight, Search, Grid3X3, List } from "lucide-react";
import CategoryIcon from "@/components/common/CategoryIcon";
import { useSeoH1 } from "@/hooks/useSeoH1";

export default function AllCategoriesContent() {
  const allCategoriesH1 = useSeoH1("all_categories");
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    categoryApi.list(true).then((r) => setCategories(r.categories || [])).catch(() => setCategories([])).finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories.filter((c) => (c.name || "").toLowerCase().includes(q));
  }, [categories, searchQuery]);

  if (loading) {
    return (
      <div className="py-10 lg:py-16 px-4 lg:px-16 bg-gray-50 min-h-screen">
        <div className="w-full animate-pulse">
          <div className="h-10 bg-gray-200 rounded w-1/3 mb-6" />
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 h-40" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16 px-4 lg:px-16 bg-gray-50 min-h-screen">
      <div className="w-full">
<div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">{allCategoriesH1}</h1>
              <p className="text-gray-500 mt-1">
                Browse {filtered.length} categories. Find electronics, fashion, home, sports, and more from verified sellers on Tijaar.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
                />
              </div>
              <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#1790d7] text-white" : "text-gray-500"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#1790d7] text-white" : "text-gray-500"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center text-gray-500 py-16">No categories found</p>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {filtered.map((cat, i) => {
              const hasImage = !!(cat.image_url && String(cat.image_url).trim());
              return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/category/${cat.slug}`}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-xl border border-gray-100"
                  >
                    <div className="w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center mb-4 text-white overflow-hidden relative">
                      {hasImage ? (
                        <img src={cat.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextElementSibling?.classList.remove("hidden"); }} />
                      ) : null}
                      <span className={hasImage ? "hidden absolute inset-0 w-full h-full flex items-center justify-center" : "absolute inset-0 w-full h-full flex items-center justify-center"}>
                        <CategoryIcon icon={cat.icon} className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                      </span>
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-1">{cat.name}</h3>
                    <p className="text-xs text-gray-500 mb-3">
                      {cat.subcategories_count} subcategories
                    </p>
                    <p className="text-xs text-[#1790d7] font-medium">
                      {cat.products_count}+ products
                    </p>
                  </motion.div>
                </Link>
              </motion.div>
            );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((cat, i) => {
              const hasImage = !!(cat.image_url && String(cat.image_url).trim());
              return (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                <Link href={`/category/${cat.slug}`}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg border border-gray-100 flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center text-white shrink-0 overflow-hidden relative">
                      {hasImage ? (
                        <img src={cat.image_url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextElementSibling?.classList.remove("hidden"); }} />
                      ) : null}
                      <span className={hasImage ? "hidden absolute inset-0 w-full h-full flex items-center justify-center" : "absolute inset-0 w-full h-full flex items-center justify-center"}>
                        <CategoryIcon icon={cat.icon} className="w-6 h-6 text-white" />
                      </span>
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">{cat.name}</h3>
                      <p className="text-sm text-gray-500">
                        {(cat.children?.length ?? cat.subcategories_count ?? 0)} subcategories
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-[#1790d7]">
                        {(cat.products_count ?? 0)}+ products
                      </p>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
