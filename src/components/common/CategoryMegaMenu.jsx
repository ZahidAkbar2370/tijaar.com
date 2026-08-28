"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight, X } from "lucide-react";
import { categoryApi, productApi } from "@/lib/api";
import CategoryIcon from "@/components/common/CategoryIcon";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";


export default function CategoryMegaMenu() {
  const [categories, setCategories] = useState([]);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const [activeCategory, setActiveCategory] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [mobileActiveCategory, setMobileActiveCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const timeoutRef = useRef(null);
  const scrollRef = useRef(null);

  const scrollCategories = (direction) => {
    scrollRef.current?.scrollBy({ left: direction * 220, behavior: "smooth" });
  };

  useEffect(() => {
    setLoading(true);
    categoryApi
      .list(true)
      .then((r) => setCategories(r.categories || []))
      .catch(() => setCategories([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!activeCategory) {
      setCategoryProducts([]);
      return;
    }
    const catData = categories.find((c) => c.name === activeCategory || c.slug === activeCategory);
    if (!catData?.slug) return;
    productApi.list({ category_slug: catData.slug, per_page: 6 }).then((r) => setCategoryProducts(r.products || [])).catch(() => setCategoryProducts([]));
  }, [activeCategory, categories]);

  const getCategoryData = (nameOrSlug) =>
    categories.find(
      (c) => c.name === nameOrSlug || c.slug === nameOrSlug || c.id === nameOrSlug
    );

  const getSubs = (catData) => catData?.children || [];

  const handleCategoryClick = (cat) => {
    const name = typeof cat === "object" ? cat.name : cat;
    if (typeof window !== "undefined" && window.innerWidth < 1024) {
      setMobileActiveCategory(mobileActiveCategory === name ? null : name);
      return;
    }
    if (activeCategory === name) {
      setIsMenuOpen(!isMenuOpen);
    } else {
      setActiveCategory(name);
      setIsMenuOpen(true);
    }
  };

  const menuRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        if (typeof window !== "undefined" && window.innerWidth >= 1024) {
          setIsMenuOpen(false);
          setActiveCategory(null);
        }
        setMobileActiveCategory(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  if (loading && categories.length === 0) {
    return (
      <div className="relative bg-white border-b border-gray-100 shadow-sm" aria-hidden>
        <div className="w-full px-2 sm:px-4 min-h-[52px] flex items-center gap-3 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-4 w-20 sm:w-24 bg-gray-100 rounded shrink-0 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }


  return (
    <div ref={menuRef} className="relative bg-white border-b border-gray-100 shadow-sm">
      <div className="w-full px-2 sm:px-4">
        <div className="relative flex items-center">
          <button
            type="button"
            className="category-prev p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            onClick={() => scrollCategories(-1)}
            aria-label="Previous categories"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>

          <div ref={scrollRef} className="category-scroll flex flex-1 min-w-0">
            {categories.map((cat) => {
              const isActive =
                activeCategory === cat.name || mobileActiveCategory === cat.name;
              const hasImage = !!(cat.image_url && String(cat.image_url).trim());
              return (
                <div key={cat.id} className="shrink-0">
                  <div
                    onClick={() => handleCategoryClick(cat)}
                    className={`flex items-center gap-2 sm:gap-2.5 px-2.5 sm:px-4 py-2.5 sm:py-3 cursor-pointer transition-all duration-200 border-b-2 ${
                      isActive
                        ? "border-[#1790d7] bg-[#1790d7]/5"
                        : "border-transparent hover:bg-gray-50"
                    }`}
                  >
                    {hasImage ? (
                      <img
                        src={optimizeImageUrl(cat.image_url, { width: IMAGE_WIDTHS.categoryNav })}
                        alt={resolveImageAlt(cat.image_alt, cat.name || IMAGE_ALT_FALLBACKS.category)}
                        className="w-5 h-5 rounded object-cover shrink-0"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextElementSibling?.classList.remove("hidden"); }}
                      />
                    ) : null}
                    <span className={hasImage ? "hidden w-5 h-5 shrink-0" : "w-5 h-5 shrink-0 flex items-center justify-center"}>
                      <CategoryIcon icon={cat.icon} className="w-5 h-5 text-gray-700 shrink-0" />
                    </span>
                    <span
                      className={`text-xs sm:text-sm font-medium whitespace-nowrap ${
                        isActive ? "text-[#1790d7]" : "text-gray-700"
                      }`}
                    >
                      {cat.name}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="category-next p-1.5 sm:p-2 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            onClick={() => scrollCategories(1)}
            aria-label="Next categories"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {isMenuOpen && activeCategory && (
          <div className="hidden lg:block absolute left-0 right-0 top-full z-50 bg-white shadow-2xl border-t border-gray-100 menu-panel-enter">
            <div className="w-full p-4">
              {(() => {
                const catData = getCategoryData(activeCategory);
                if (!catData) return null;
                const slug = catData.slug || catData.id;
                const subs = getSubs(catData);
                const featured = categoryProducts;
                const hasImage = !!(catData.image_url && String(catData.image_url).trim());
                return (
                  <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-3">
                      <div className="p-3 rounded-xl bg-gradient-to-br from-[#1790d7] to-[#4db3e8] mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          {hasImage ? (
                            <img src={optimizeImageUrl(catData.image_url, { width: IMAGE_WIDTHS.categoryIcon })} alt={resolveImageAlt(catData.image_alt, catData.name || IMAGE_ALT_FALLBACKS.category)} className="w-12 h-12 rounded-lg object-cover shrink-0 border border-white/30" loading="lazy" decoding="async" onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextElementSibling?.classList.remove("hidden"); }} />
                          ) : null}
                          <span className={hasImage ? "hidden w-12 h-12 shrink-0 flex items-center justify-center" : "w-12 h-12 shrink-0 flex items-center justify-center"}>
                            <CategoryIcon icon={catData?.icon} className="w-8 h-8 text-white shrink-0" />
                          </span>
                          <h3 className="text-lg font-bold text-white">{catData.name}</h3>
                        </div>
                        <p className="text-white/80 text-xs">
                          {subs.length} subcategories • {featured.length}+ products
                        </p>
                      </div>
                      <Link href={`/category/${slug}`}>
                        <button className="w-full py-2 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-lg font-semibold hover:shadow-lg flex items-center justify-center gap-2 text-sm">
                          View All {catData.name}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </Link>
                    </div>

                    <div className="col-span-4">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Subcategories
                      </h4>
                      <div className="grid grid-cols-2 gap-2">
                        {subs.slice(0, 8).map((s) => (
                          <Link key={s.slug} href={`/category/${slug}/${s.slug}`}>
                            <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg hover:bg-gray-50">
                              <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-[#1790d7] to-[#4db3e8]" />
                              <span className="text-gray-700 text-xs">{s.name}</span>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div className="col-span-5">
                      <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                        Featured Products
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {featured.slice(0, 6).map((p) => (
                          <Link key={p.id} href={`/product/${p.slug}`} target="_blank" rel="noopener noreferrer">
                            <div className="flex gap-2 p-2 rounded-lg hover:bg-gray-50">
                              <img
                                src={p.image || "/assets/sample-image.webp"}
                                alt={resolveImageAlt(p.image_alt, p.title || p.name || IMAGE_ALT_FALLBACKS.product)}
                                className="w-12 h-12 object-cover rounded"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-semibold truncate">{p.title || p.name}</p>
                                <p className="text-[#1790d7] font-bold text-sm">
                                  {p.price != null ? `${Number(p.price).toLocaleString()} PKR` : ""}
                                </p>
                              </div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

      {mobileActiveCategory && (
          <div className="lg:hidden bg-gray-50 border-t border-gray-100 overflow-hidden menu-panel-enter">
            <div className="p-4">
              {(() => {
                const catData = getCategoryData(mobileActiveCategory);
                if (!catData) return null;
                const slug = catData.slug;
                const subs = getSubs(catData);
                const hasImage = !!(catData.image_url && String(catData.image_url).trim());
                return (
                  <>
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-3 min-w-0">
                        {hasImage ? (
                          <img src={optimizeImageUrl(catData.image_url, { width: IMAGE_WIDTHS.categoryIcon })} alt={resolveImageAlt(catData.image_alt, catData.name || IMAGE_ALT_FALLBACKS.category)} className="w-12 h-12 rounded-lg object-cover shrink-0" loading="lazy" decoding="async" onError={(e) => { e.target.onerror = null; e.target.style.display = "none"; e.target.nextElementSibling?.classList.remove("hidden"); }} />
                        ) : null}
                        <span className={hasImage ? "hidden w-12 h-12 shrink-0 flex items-center justify-center" : "w-12 h-12 shrink-0 flex items-center justify-center"}>
                          <CategoryIcon icon={catData?.icon} className="w-10 h-10 text-[#1790d7] shrink-0" />
                        </span>
                        <h3 className="font-bold text-gray-900 truncate">{catData.name}</h3>
                      </div>
                      <button
                        onClick={() => setMobileActiveCategory(null)}
                        className="p-2 hover:bg-gray-200 rounded-lg shrink-0"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mb-4">
                      {subs.map((s) => (
                        <Link
                          key={s.slug || s.id}
                          href={`/category/${slug}/${s.slug || s.id}`}
                          onClick={() => setMobileActiveCategory(null)}
                        >
                          <div className="flex items-center gap-2 px-3 py-2.5 bg-white rounded-lg">
                            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-[#1790d7] to-[#4db3e8]" />
                            <span className="text-gray-700 text-sm">{s.name}</span>
                          </div>
                        </Link>
                      ))}
                    </div>
                    <Link
                      href={`/category/${slug}`}
                      onClick={() => setMobileActiveCategory(null)}
                    >
                      <button className="w-full py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold">
                        View All {catData.name}
                      </button>
                    </Link>
                  </>
                );
              })()}
            </div>
          </div>
        )}
    </div>
  );
}
