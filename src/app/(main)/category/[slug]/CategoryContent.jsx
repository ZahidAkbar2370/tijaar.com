"use client";

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  SlidersHorizontal,
  X,
  Grid3X3,
  LayoutList,
  ChevronDown,
  ChevronUp,
  Search,
  Package,
  Star,
  Tag,
  DollarSign,
  Check,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { productApi } from "@/lib/api";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { PRODUCT_CARD_GRID_CLASS } from "@/lib/productCardSwiper";
import { useSeoH1 } from "@/hooks/useSeoH1";

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
  { value: "rating", label: "Best Rated" },
  { value: "popular", label: "Most Popular" },
];

const conditionOptions = [
  { value: "", label: "All Conditions" },
  { value: "new", label: "New" },
  { value: "refurbished", label: "Refurbished" },
  { value: "used", label: "Pre-owned" },
];

const stockOptions = [
  { value: "", label: "All Stock" },
  { value: "in_stock", label: "In Stock" },
  { value: "low_stock", label: "Low Stock" },
];

const ratingOptions = [5, 4, 3, 2, 1];

const ITEMS_PER_PAGE = 16;

// Collapsible Filter Section Component
function FilterSection({ title, icon: Icon, children, defaultOpen = true }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-4 text-left group"
      >
        <span className="flex items-center gap-2.5 font-semibold text-gray-800">
          <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#1790d7]/10 to-[#4db3e8]/10 flex items-center justify-center">
            <Icon className="w-4 h-4 text-[#1790d7]" />
          </span>
          {title}
        </span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        ) : (
          <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-gray-600" />
        )}
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Star Rating Component
function StarRating({ rating, selected, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all w-full ${
        selected
          ? "bg-amber-50 border-2 border-amber-400"
          : "bg-gray-50 border-2 border-transparent hover:border-gray-200"
      }`}
    >
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`w-4 h-4 ${
              star <= rating ? "text-amber-400 fill-amber-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-gray-700">& Up</span>
      {selected && <Check className="w-4 h-4 text-amber-500 ml-auto" />}
    </button>
  );
}

// Price Range Component
function PriceRangeSlider({ value, onChange }) {
  const [localMin, setLocalMin] = useState(value.min || "");
  const [localMax, setLocalMax] = useState(value.max || "");

  useEffect(() => {
    setLocalMin(value.min || "");
    setLocalMax(value.max || "");
  }, [value]);

  const handleApply = () => {
    onChange({ min: localMin, max: localMax });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Min Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs</span>
            <input
              type="number"
              placeholder="0"
              value={localMin}
              onChange={(e) => setLocalMin(e.target.value)}
              onBlur={handleApply}
              className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-[#1790d7] focus:outline-none transition-colors"
            />
          </div>
        </div>
        <div className="flex items-end pb-2.5 text-gray-400">—</div>
        <div className="flex-1">
          <label className="text-xs text-gray-500 mb-1 block">Max Price</label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">Rs</span>
            <input
              type="number"
              placeholder="Any"
              value={localMax}
              onChange={(e) => setLocalMax(e.target.value)}
              onBlur={handleApply}
              className="w-full pl-9 pr-3 py-2.5 border-2 border-gray-100 rounded-xl text-sm focus:border-[#1790d7] focus:outline-none transition-colors"
            />
          </div>
        </div>
      </div>
      <div className="flex gap-2">
        {[1000, 5000, 10000, 50000].map((price) => (
          <button
            key={price}
            onClick={() => {
              setLocalMax(price.toString());
              onChange({ min: localMin, max: price.toString() });
            }}
            className="flex-1 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
          >
            {price >= 1000 ? `${price / 1000}K` : price}
          </button>
        ))}
      </div>
    </div>
  );
}

// Active Filter Tag Component
function ActiveFilterTag({ label, onRemove }) {
  return (
    <motion.span
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1790d7]/10 text-[#1790d7] rounded-full text-sm font-medium"
    >
      {label}
      <button onClick={onRemove} className="hover:bg-[#1790d7]/20 rounded-full p-0.5">
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.span>
  );
}

export default function CategoryContent({ category, products: initialProducts, subcategories, activeCategory = null }) {
  const displayCategory = activeCategory || category;
  const h1 = useSeoH1(activeCategory ? "subcategory" : "category", { name: displayCategory?.name, fallback: displayCategory?.name });
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedSubcategory, setSelectedSubcategory] = useState("");
  const [selectedCondition, setSelectedCondition] = useState("");
  const [selectedStock, setSelectedStock] = useState("");
  const [selectedRating, setSelectedRating] = useState(null);
  const [sortBy, setSortBy] = useState("newest");
  
  const [products, setProducts] = useState(initialProducts || []);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalProducts, setTotalProducts] = useState(initialProducts?.length || 0);
  
  const loaderRef = useRef(null);
  const searchTimeout = useRef(null);
  const isInitialMount = useRef(true);

  const subs = subcategories || [];

  // Debounce search
  useEffect(() => {
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 400);
    return () => clearTimeout(searchTimeout.current);
  }, [searchQuery]);

  // Build API params
  const buildParams = useCallback((pageNum = 1) => {
    const params = { 
      per_page: ITEMS_PER_PAGE, 
      page: pageNum, 
      sort: sortBy,
      category_slug: selectedSubcategory || category.slug,
    };
    if (debouncedSearch) params.search = debouncedSearch;
    if (priceRange.min) params.min_price = priceRange.min;
    if (priceRange.max) params.max_price = priceRange.max;
    if (selectedCondition) params.condition = selectedCondition;
    if (selectedStock) params.availability = selectedStock;
    if (selectedRating) params.min_rating = selectedRating;
    return params;
  }, [category.slug, debouncedSearch, priceRange, selectedSubcategory, selectedCondition, selectedStock, selectedRating, sortBy]);

  // Fetch products when filters change (skip initial mount as we have initial data)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      // Check if we need more data initially
      if (initialProducts.length >= ITEMS_PER_PAGE) {
        setHasMore(true);
      } else {
        setHasMore(false);
      }
      return;
    }

    setLoading(true);
    setPage(1);
    setHasMore(true);
    
    productApi
      .list(buildParams(1))
      .then((res) => {
        setProducts(res.products || []);
        setTotalProducts(res.pagination?.total || res.products?.length || 0);
        setHasMore((res.pagination?.current_page || 1) < (res.pagination?.last_page || 1));
      })
      .catch(() => {
        setProducts([]);
        setTotalProducts(0);
      })
      .finally(() => setLoading(false));
  }, [buildParams, initialProducts.length]);

  // Infinite scroll - load more
  const loadMore = useCallback(async () => {
    if (loadingMore || !hasMore || loading) return;
    
    setLoadingMore(true);
    const nextPage = page + 1;
    
    try {
      const res = await productApi.list(buildParams(nextPage));
      const newProducts = res.products || [];
      
      if (newProducts.length > 0) {
        setProducts((prev) => [...prev, ...newProducts]);
        setPage(nextPage);
        setHasMore((res.pagination?.current_page || nextPage) < (res.pagination?.last_page || 1));
      } else {
        setHasMore(false);
      }
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [page, loadingMore, hasMore, loading, buildParams]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loading && !loadingMore) {
          loadMore();
        }
      },
      { rootMargin: "200px" }
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => observer.disconnect();
  }, [loadMore, hasMore, loading, loadingMore]);

  // Active filters
  const activeFilters = useMemo(() => {
    const filters = [];
    if (selectedSubcategory) {
      const sub = subs.find((s) => s.slug === selectedSubcategory);
      filters.push({ key: "subcategory", label: sub?.name || selectedSubcategory, onRemove: () => setSelectedSubcategory("") });
    }
    if (priceRange.min || priceRange.max) {
      const label = `Rs ${priceRange.min || "0"} - ${priceRange.max || "Any"}`;
      filters.push({ key: "price", label, onRemove: () => setPriceRange({ min: "", max: "" }) });
    }
    if (selectedCondition) {
      const cond = conditionOptions.find((c) => c.value === selectedCondition);
      filters.push({ key: "condition", label: cond?.label || selectedCondition, onRemove: () => setSelectedCondition("") });
    }
    if (selectedStock) {
      const stock = stockOptions.find((s) => s.value === selectedStock);
      filters.push({ key: "stock", label: stock?.label || selectedStock, onRemove: () => setSelectedStock("") });
    }
    if (selectedRating) {
      filters.push({ key: "rating", label: `${selectedRating}+ Stars`, onRemove: () => setSelectedRating(null) });
    }
    return filters;
  }, [selectedSubcategory, priceRange, selectedCondition, selectedStock, selectedRating, subs]);

  const clearAllFilters = () => {
    setSelectedSubcategory("");
    setPriceRange({ min: "", max: "" });
    setSelectedCondition("");
    setSelectedStock("");
    setSelectedRating(null);
    setSearchQuery("");
    setDebouncedSearch("");
  };

  // Filter Sidebar Content
  const FilterContent = ({ isMobile = false }) => (
    <div className={`${isMobile ? "" : "space-y-0"}`}>
      {/* Subcategories */}
      {subs.length > 0 && (
        <FilterSection title="Subcategories" icon={Tag}>
          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedSubcategory("")}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                !selectedSubcategory ? "bg-[#1790d7] text-white font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              All in {category.name}
              {!selectedSubcategory && <Check className="w-4 h-4" />}
            </button>
            {subs.map((sub) => (
              <button
                key={sub.slug || sub.id}
                onClick={() => setSelectedSubcategory(sub.slug)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                  selectedSubcategory === sub.slug ? "bg-[#1790d7] text-white font-medium" : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="truncate">{sub.name}</span>
                {selectedSubcategory === sub.slug && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Price Range */}
      <FilterSection title="Price Range" icon={DollarSign}>
        <PriceRangeSlider value={priceRange} onChange={setPriceRange} />
      </FilterSection>

      {/* Rating */}
      <FilterSection title="Customer Rating" icon={Star}>
        <div className="space-y-2">
          {ratingOptions.map((rating) => (
            <StarRating
              key={rating}
              rating={rating}
              selected={selectedRating === rating}
              onClick={() => setSelectedRating(selectedRating === rating ? null : rating)}
            />
          ))}
        </div>
      </FilterSection>

      {/* Condition */}
      <FilterSection title="Condition" icon={Tag} defaultOpen={false}>
        <div className="space-y-1">
          {conditionOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedCondition(opt.value)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                selectedCondition === opt.value ? "bg-[#1790d7] text-white font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
              {selectedCondition === opt.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Stock Status */}
      <FilterSection title="Availability" icon={Package} defaultOpen={false}>
        <div className="space-y-1">
          {stockOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setSelectedStock(opt.value)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all ${
                selectedStock === opt.value ? "bg-[#1790d7] text-white font-medium" : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              {opt.label}
              {selectedStock === opt.value && <Check className="w-4 h-4" />}
            </button>
          ))}
        </div>
      </FilterSection>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1790d7] flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">{category.name}</span>
          </div>
        </div>
      </div>

      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-10 lg:py-14">
        <div className="w-full mx-5">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-white/80" />
            <h1 className="text-3xl lg:text-4xl font-bold text-white text-center">
              {h1}
            </h1>
            <Sparkles className="w-6 h-6 text-white/80" />
          </div>
          {category.description && (
            <p className="text-white/80 text-lg text-center max-w-2xl mx-auto">
              {category.description}
            </p>
          )}
        </div>
      </div>

      <div className="w-full px-5 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-5 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#1790d7]" />
                    Filters
                  </h3>
                  {activeFilters.length > 0 && (
                    <button
                      onClick={clearAllFilters}
                      className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1790d7] transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Reset
                    </button>
                  )}
                </div>
              </div>
              <div className="p-4">
                <FilterContent />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {/* Toolbar */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                {/* Search */}
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder={`Search in ${category.name}...`}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent rounded-xl text-sm focus:bg-white focus:border-[#1790d7] focus:outline-none transition-all"
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  {/* Mobile Filter Button */}
                  <button
                    onClick={() => setShowFilters(true)}
                    className="lg:hidden flex items-center gap-2 px-4 py-3 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium transition-colors"
                  >
                    <SlidersHorizontal className="w-4 h-4" />
                    Filters
                    {activeFilters.length > 0 && (
                      <span className="w-5 h-5 bg-[#1790d7] text-white text-xs rounded-full flex items-center justify-center">
                        {activeFilters.length}
                      </span>
                    )}
                  </button>

                  {/* Sort */}
                  <div className="relative">
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="appearance-none px-4 py-3 pr-10 bg-gray-50 hover:bg-gray-100 rounded-xl text-sm font-medium cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 transition-all"
                    >
                      {sortOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                  </div>

                  {/* View Mode */}
                  <div className="hidden sm:flex items-center bg-gray-50 rounded-xl p-1">
                    <button
                      onClick={() => setViewMode("grid")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "grid" ? "bg-white shadow text-[#1790d7]" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <Grid3X3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode("list")}
                      className={`p-2.5 rounded-lg transition-all ${
                        viewMode === "list" ? "bg-white shadow text-[#1790d7]" : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <LayoutList className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Active Filters */}
              <AnimatePresence>
                {activeFilters.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 pt-4 mt-4 border-t border-gray-100">
                      {activeFilters.map((filter) => (
                        <ActiveFilterTag key={filter.key} label={filter.label} onRemove={filter.onRemove} />
                      ))}
                      <button
                        onClick={clearAllFilters}
                        className="text-sm text-gray-500 hover:text-[#1790d7] font-medium px-2"
                      >
                        Clear all
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Results Count */}
            <div className="flex items-center justify-between mb-4">
              <p className="text-gray-600 text-sm">
                Showing <span className="font-semibold text-gray-900">{products.length}</span>
                {totalProducts > products.length && (
                  <> of <span className="font-semibold text-gray-900">{totalProducts.toLocaleString()}</span></>
                )} products
              </p>
            </div>

            {/* Products Grid */}
            {loading ? (
              <ProductCardSkeletonRow count={16} />
            ) : products.length === 0 ? (
              <div className="bg-white rounded-2xl border border-gray-100 text-center py-20">
                <Package className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-800 mb-2">No products found</h3>
                <p className="text-gray-500 mb-6">Try adjusting your filters or search term</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <>
                <div className={viewMode === "grid"
                  ? PRODUCT_CARD_GRID_CLASS
                  : "grid grid-cols-1 gap-3 items-stretch"
                }>
                  {products.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      showAddToCart
                      layout={viewMode === "list" ? "list" : "grid"}
                    />
                  ))}
                </div>

                {/* Infinite Scroll Loader */}
                <div ref={loaderRef} className="mt-8">
                  {loadingMore && (
                    <ProductCardSkeletonRow
                      count={viewMode === "grid" ? 16 : 4}
                      layout={viewMode === "list" ? "list" : "grid"}
                    />
                  )}
                  {!hasMore && products.length > 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 text-sm">You've reached the end of the list</p>
                    </div>
                  )}
                </div>
              </>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-[9998] lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white z-[9999] lg:hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-[#1790d7]" />
                  Filters
                </h3>
                <button
                  onClick={() => setShowFilters(false)}
                  className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5 text-gray-600" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-4">
                <FilterContent isMobile />
              </div>
              <div className="p-4 border-t border-gray-100 bg-white space-y-3">
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-full py-3.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Show {products.length} Products
                </button>
                {activeFilters.length > 0 && (
                  <button
                    onClick={clearAllFilters}
                    className="w-full py-3 text-gray-600 hover:text-gray-900 font-medium"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
