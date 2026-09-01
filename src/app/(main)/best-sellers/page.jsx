"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Home, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { productApi } from "@/lib/api";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { PRODUCT_CARD_GRID_CLASS } from "@/lib/productCardSwiper";
import { useSeoH1 } from "@/hooks/useSeoH1";

const PER_PAGE = 24;

export default function BestSellersPage() {
  const bestSellersH1 = useSeoH1("best_sellers");
  const [products, setProducts] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    productApi
      .list({ verified_sellers: 1, page, per_page: PER_PAGE })
      .then((res) => {
        setProducts(res.products ?? []);
        setPagination(res.pagination ?? { current_page: 1, last_page: 1, total: 0 });
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [page]);

  const { current_page, last_page, total } = pagination;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-white border-b border-gray-100">
        <div className="w-full px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link href="/" className="hover:text-[#1790d7] flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">Best Sellers</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-10 lg:py-14">
        <div className="w-full px-5">
          <div className="flex items-center justify-center gap-3 mb-3">
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
            <h1 className="text-3xl lg:text-4xl font-bold text-white text-center">
              {bestSellersH1}
            </h1>
            <Star className="w-6 h-6 text-amber-300 fill-amber-300" />
          </div>
          <p className="text-white/90 text-lg text-center max-w-2xl mx-auto">
            Top-rated products from verified sellers only
          </p>
        </div>
      </div>

      <div className="w-full px-5 py-8">
        {loading ? (
          <ProductCardSkeletonRow count={8} />
        ) : products.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800">No verified seller products yet</h2>
            <p className="text-gray-500 mt-2">Check back later or browse the main shop.</p>
            <Link
              href="/shop"
              className="inline-block mt-6 px-6 py-3 bg-[#1790d7] text-white rounded-xl font-medium hover:bg-[#147abb] transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        ) : (
          <>
            <div className={PRODUCT_CARD_GRID_CLASS}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} showAddToCart />
              ))}
            </div>

            {last_page > 1 && (
              <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={current_page <= 1}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Previous
                </button>
                <span className="text-sm text-gray-600 px-2">
                  Page {current_page} of {last_page} ({total} products)
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(last_page, p + 1))}
                  disabled={current_page >= last_page}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-[#1790d7] bg-[#1790d7] text-white hover:bg-[#147abb] disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm transition-colors"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
