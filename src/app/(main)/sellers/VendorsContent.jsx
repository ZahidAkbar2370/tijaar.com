"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight,
  Store,
  BadgeCheck,
  Package,
  Search,
  Grid3X3,
  List,
  ChevronDown,
  Clock,
  MessageCircle,
  MapPin,
  ArrowRight,
} from "lucide-react";
import { storesApi } from "@/lib/api";
import SellerAvatar from "@/components/vendors/SellerAvatar";
import RatingStars from "@/components/ui/RatingStars";
import SearchableSelect from "@/components/forms/SearchableSelect";

const sortOptions = [
  { value: "rating", label: "Highest Rated" },
  { value: "products", label: "Most Products" },
  { value: "sales", label: "Most Sales" },
];

const selectClass =
  "w-full appearance-none pl-4 pr-10 py-2.5 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-sm font-medium text-gray-800 cursor-pointer focus:outline-none focus:border-[#1790d7] focus:ring-2 focus:ring-[#1790d7]/15 transition-all";

const SELLER_GRID_CLASS =
  "grid grid-cols-1 min-[400px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4 lg:gap-5";

export default function VendorsContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [cityFilter, setCityFilter] = useState("");
  const [cities, setCities] = useState([]);
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("rating");
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => {
      setLoading(true);
      const params = {};
      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (cityFilter) params.city = cityFilter;
      storesApi
        .list(params)
        .then((res) => {
          setVendors(res.vendors || []);
          if (Array.isArray(res.cities)) setCities(res.cities);
        })
        .catch(() => setVendors([]))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery, cityFilter]);

  const list = vendors || [];
  const filtered = [...list].sort((a, b) => {
    if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
    if (sortBy === "products") return (b.products ?? b.products_count ?? 0) - (a.products ?? a.products_count ?? 0);
    return (b.totalSales || 0) - (a.totalSales || 0);
  });

  const cityOptions = useMemo(
    () => cities.map((city) => ({ value: city, label: city })),
    [cities]
  );

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1790d7] flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">Sellers</span>
          </div>
        </div>
      </div>

      <div className="w-full px-4 sm:px-6 lg:px-8 py-5 sm:py-8">
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-gray-100 p-3 sm:p-4 lg:p-5 mb-4 sm:mb-6 lg:mb-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-gray-100">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Verified Sellers</h1>
            <Link
              href="/seller/register"
              className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-sm font-semibold hover:shadow-lg hover:opacity-95 transition-all shrink-0"
            >
              <Store className="w-4 h-4 shrink-0" />
              <span className="truncate">Register Your Store</span>
              <ArrowRight className="w-4 h-4 shrink-0 hidden sm:block" />
            </Link>
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center pt-4">
            <div className="relative w-full lg:flex-1 lg:max-w-sm min-w-0">
              <Search className="absolute left-3.5 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              <input
                type="search"
                placeholder="Search sellers…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 sm:pl-12 pr-3 sm:pr-4 py-2.5 bg-gray-50/50 border border-gray-200 rounded-xl text-sm text-gray-900 placeholder:text-gray-400 focus:bg-white focus:border-[#1790d7] focus:ring-2 focus:ring-[#1790d7]/15 focus:outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:flex-wrap sm:items-center gap-2 sm:gap-3 lg:shrink-0 lg:ml-auto">
              <div className="col-span-1 min-w-0">
                <SearchableSelect
                  options={cityOptions}
                  value={cityFilter}
                  onChange={setCityFilter}
                  placeholder="All cities"
                  emptyLabel="No cities found"
                  className="w-full"
                />
              </div>

              <div className="relative col-span-1 min-w-0">
                <label htmlFor="sellers-sort" className="sr-only">
                  Sort sellers
                </label>
                <select
                  id="sellers-sort"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className={selectClass}
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
              </div>

              <div
                className="col-span-2 sm:col-span-1 flex items-center justify-end sm:justify-start rounded-xl border border-gray-200 bg-gray-50 p-1 shrink-0"
                role="group"
                aria-label="Seller view"
              >
                <button
                  type="button"
                  onClick={() => setViewMode("grid")}
                  aria-pressed={viewMode === "grid"}
                  aria-label="Grid view"
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "grid"
                      ? "bg-white shadow-sm text-[#1790d7]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode("list")}
                  aria-pressed={viewMode === "list"}
                  aria-label="List view"
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === "list"
                      ? "bg-white shadow-sm text-[#1790d7]"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-gray-500 mt-4 pt-4 border-t border-gray-100">
            {loading ? (
              "Loading sellers…"
            ) : (
              <>
                Showing <span className="font-semibold text-gray-800">{filtered.length}</span>{" "}
                {filtered.length === 1 ? "seller" : "sellers"}
                {cityFilter ? (
                  <>
                    {" "}
                    in <span className="font-semibold text-gray-800">{cityFilter}</span>
                  </>
                ) : null}
              </>
            )}
          </p>
        </div>

        {loading ? (
          <div className={`${SELLER_GRID_CLASS} animate-pulse`}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-24 sm:h-28 lg:h-32 bg-gray-200" />
                <div className="p-3 sm:p-4 lg:p-5 space-y-2 sm:space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-1/3" />
                  <div className="h-6 bg-gray-200 rounded w-2/3" />
                  <div className="h-4 bg-gray-100 rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No vendors found</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className={SELLER_GRID_CLASS}>
            {filtered.map((vendor) => (
              <Link key={vendor.id} href={`/seller/${vendor.slug}`}>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="bg-white rounded-xl sm:rounded-2xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 h-full flex flex-col"
                >
                  <div className="h-24 sm:h-28 lg:h-32 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] relative shrink-0">
                    {vendor.banner && (
                      <img src={vendor.banner} alt="" className="w-full h-full object-cover" />
                    )}
                    {vendor.kyc_verified && (
                      <div className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 flex items-center gap-0.5 px-1.5 py-0.5 sm:px-2 sm:py-1 bg-white/90 backdrop-blur-sm rounded-full shadow">
                        <BadgeCheck className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" />
                        <span className="text-[10px] sm:text-xs font-semibold text-blue-600 hidden min-[400px]:inline">Verified</span>
                      </div>
                    )}
                    <div className="absolute -bottom-5 sm:-bottom-6 lg:-bottom-7 left-3 sm:left-4 border-2 sm:border-[3px] border-white shadow-md rounded-lg sm:rounded-xl overflow-hidden">
                      <SellerAvatar
                        src={vendor.logo}
                        alt={vendor.storeName || vendor.name}
                        className="w-11 h-11 sm:w-14 sm:h-14 lg:w-16 lg:h-16"
                        iconClassName="w-5 h-5 sm:w-7 sm:h-7 lg:w-8 lg:h-8"
                      />
                    </div>
                  </div>
                  <div className="p-3 sm:p-4 lg:p-5 pt-7 sm:pt-8 lg:pt-9 flex-1 flex flex-col min-w-0">
                    <p className="text-[10px] sm:text-xs text-gray-500 mb-0.5">
                      {vendor.reviews || 0} {(vendor.reviews || 0) === 1 ? "review" : "reviews"}
                    </p>
                    <h3 className="font-bold text-gray-900 text-sm sm:text-base lg:text-lg mb-1.5 sm:mb-2 line-clamp-1">
                      {vendor.storeName || vendor.name}
                    </h3>
                    <div className="flex flex-col min-[400px]:flex-row min-[400px]:items-center gap-1 min-[400px]:gap-2 mb-2 sm:mb-3 min-w-0">
                      <RatingStars
                        rating={vendor.rating}
                        size="sm"
                        showValue
                        valueClassName="text-xs sm:text-sm font-semibold text-gray-700"
                      />
                      {vendor.city && (
                        <span className="flex items-center gap-0.5 text-gray-500 text-xs sm:text-sm truncate">
                          <MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
                          <span className="truncate">{vendor.city}</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 line-clamp-2 mb-3 sm:mb-4 flex-1 hidden sm:block">
                      {vendor.description}
                    </p>
                    <div className="grid grid-cols-3 gap-1 sm:gap-2 text-center border-t border-gray-100 pt-2.5 sm:pt-3 lg:pt-4 mt-auto">
                      <div>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-gray-600">
                          <Package className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
                          <span className="font-bold text-xs sm:text-sm">{vendor.products ?? vendor.products_count ?? 0}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Products</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-green-600">
                          <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
                          <span className="font-bold text-xs sm:text-sm truncate max-w-full">{vendor.on_time_delivery ?? "—"}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">On-Time</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-0.5 sm:gap-1 text-blue-600">
                          <MessageCircle className="w-3 h-3 sm:w-3.5 sm:h-3.5 lg:w-4 lg:h-4 shrink-0" />
                          <span className="font-bold text-xs sm:text-sm truncate max-w-full">{vendor.response_rate ?? "—"}</span>
                        </div>
                        <p className="text-[10px] sm:text-xs text-gray-500 mt-0.5">Response</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((vendor) => (
              <Link key={vendor.id} href={`/seller/${vendor.slug}`}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className="bg-white rounded-xl p-4 sm:p-5 lg:p-6 shadow-sm hover:shadow-lg border border-gray-100 flex flex-col sm:flex-row gap-4 sm:gap-6"
                >
                  <SellerAvatar
                    src={vendor.logo}
                    alt={vendor.storeName || vendor.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 mx-auto sm:mx-0"
                    iconClassName="w-8 h-8 sm:w-10 sm:h-10"
                  />
                  <div className="flex-1 min-w-0 text-center sm:text-left">
                    <p className="text-xs text-gray-500 mb-0.5">
                      {vendor.reviews || 0} {(vendor.reviews || 0) === 1 ? "review" : "reviews"}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-lg sm:text-xl line-clamp-1">{vendor.storeName || vendor.name}</h3>
                      {vendor.kyc_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 rounded-full shrink-0">
                          <BadgeCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600">Verified</span>
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2 sm:line-clamp-1">{vendor.description}</p>
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-2 text-xs sm:text-sm">
                      <RatingStars rating={vendor.rating} size="sm" showValue valueClassName="text-sm font-semibold text-gray-700" />
                      {vendor.city && (
                        <span className="flex items-center gap-1 text-gray-600">
                          <MapPin className="w-4 h-4" />
                          {vendor.city}
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-gray-600">
                        <Package className="w-4 h-4" />
                        {vendor.products ?? vendor.products_count ?? 0} products
                      </span>
                      <span className="flex items-center gap-1 text-green-600">
                        <Clock className="w-4 h-4" />
                        {vendor.on_time_delivery ?? "—"} On-Time
                      </span>
                      <span className="flex items-center gap-1 text-blue-600">
                        <MessageCircle className="w-4 h-4" />
                        {vendor.response_rate ?? "—"} Response
                      </span>
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
