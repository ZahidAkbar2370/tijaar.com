"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight,
  Store,
  BadgeCheck,
  ShieldCheck,
  Package,
  Search,
  Grid3X3,
  List,
  Clock,
  MessageCircle,
  MapPin,
} from "lucide-react";
import { storesApi } from "@/lib/api";
import { useSeoH1 } from "@/hooks/useSeoH1";
import SellerAvatar from "@/components/vendors/SellerAvatar";
import RatingStars from "@/components/ui/RatingStars";

export default function VendorsContent() {
  const sellersH1 = useSeoH1("sellers");
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

      <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-12 lg:py-16">
        <div className="w-full px-4 lg:px-8">
          <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4 text-center">{sellersH1}</h1>
          <p className="text-white/80 text-lg text-center max-w-2xl mx-auto">
            Shop from trusted sellers with excellent ratings. Every seller is verified so you can buy with
            confidence. Want to sell? Join as a seller and reach millions of buyers.
          </p>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8">
          <div className="relative flex-1 lg:max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex flex-col sm:flex-row flex-wrap gap-3">
            <div className="relative min-w-[160px]">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
              <select
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2.5 bg-white border border-gray-200 rounded-xl text-sm appearance-none"
                aria-label="Filter by city"
              >
                <option value="">All cities</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm"
            >
              <option value="rating">Highest Rated</option>
              <option value="products">Most Products</option>
              <option value="sales">Most Sales</option>
            </select>
            <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-lg ${viewMode === "grid" ? "bg-[#1790d7] text-white" : "text-gray-500"}`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-lg ${viewMode === "list" ? "bg-[#1790d7] text-white" : "text-gray-500"}`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-pulse">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                <div className="h-36 bg-gray-200" />
                <div className="p-6 space-y-3">
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((vendor) => (
              <Link key={vendor.id} href={`/seller/${vendor.slug}`}>
                <motion.div
                  whileHover={{ y: -5 }}
                  className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 h-full"
                >
                  <div className="h-36 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] relative">
                    {vendor.banner && (
                      <img src={vendor.banner} alt="" className="w-full h-full object-cover" />
                    )}
                    {vendor.kyc_verified && (
                      <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-1 bg-white/90 backdrop-blur-sm rounded-full shadow">
                        <BadgeCheck className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-600">Verified</span>
                      </div>
                    )}
                    {vendor.kyc_verified && (
                      <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 bg-emerald-500 rounded-full shadow">
                        <ShieldCheck className="w-3.5 h-3.5 text-white" />
                        <span className="text-xs font-semibold text-white">KYC</span>
                      </div>
                    )}
                    <div className="absolute -bottom-8 left-4 border-4 border-white shadow-lg rounded-xl overflow-hidden">
                      <SellerAvatar
                        src={vendor.logo}
                        alt={vendor.storeName || vendor.name}
                        className="w-16 h-16"
                        iconClassName="w-8 h-8"
                      />
                    </div>
                  </div>
                  <div className="p-6 pt-10">
                    <p className="text-xs text-gray-500 mb-1">
                      {vendor.reviews || 0} {(vendor.reviews || 0) === 1 ? "review" : "reviews"}
                    </p>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1">
                      {vendor.storeName || vendor.name}
                    </h3>
                    <div className="flex items-center gap-3 mb-3">
                      <RatingStars rating={vendor.rating} size="sm" showValue valueClassName="text-sm font-semibold text-gray-700" />
                      {vendor.city && (
                        <span className="flex items-center gap-1 text-gray-500 text-sm">
                          <MapPin className="w-3.5 h-3.5" />
                          {vendor.city}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2 mb-4">{vendor.description}</p>
                    <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
                      <div>
                        <div className="flex items-center justify-center gap-1 text-gray-600">
                          <Package className="w-4 h-4" />
                          <span className="font-bold">{vendor.products ?? vendor.products_count ?? 0}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Products</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-green-600">
                          <Clock className="w-4 h-4" />
                          <span className="font-bold">{vendor.on_time_delivery ?? "—"}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">On-Time</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-center gap-1 text-blue-600">
                          <MessageCircle className="w-4 h-4" />
                          <span className="font-bold">{vendor.response_rate ?? "—"}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-0.5">Response</p>
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
                  whileHover={{ x: 5 }}
                  className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-gray-100 flex gap-6"
                >
                  <SellerAvatar
                    src={vendor.logo}
                    alt={vendor.storeName || vendor.name}
                    className="w-20 h-20 shrink-0"
                    iconClassName="w-10 h-10"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-gray-500 mb-0.5">
                      {vendor.reviews || 0} {(vendor.reviews || 0) === 1 ? "review" : "reviews"}
                    </p>
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-bold text-xl">{vendor.storeName || vendor.name}</h3>
                      {vendor.kyc_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-100 rounded-full">
                          <BadgeCheck className="w-4 h-4 text-blue-500" />
                          <span className="text-xs font-medium text-blue-600">Verified</span>
                        </span>
                      )}
                      {vendor.kyc_verified && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 rounded-full">
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">KYC</span>
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-3 line-clamp-1">{vendor.description}</p>
                    <div className="flex flex-wrap gap-4 text-sm">
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
