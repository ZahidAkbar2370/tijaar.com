"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, SlidersHorizontal } from "lucide-react";
import { productApi } from "@/lib/api";
import ProductCard, { ProductCardSkeletonRow } from "@/components/public/ProductCard";
import { useSeoH1 } from "@/hooks/useSeoH1";

function SearchResultsContent() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") || "";
  const searchH1 = useSeoH1(q ? "search" : "search_empty", { query: q, fallback: q ? `Search results for "${q}"` : "Search" });
  const categorySlug = searchParams.get("category") || "";
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    min_price: "",
    max_price: "",
    category_id: "",
    sort: "relevance",
  });

  useEffect(() => {
    if (!q) {
      setProducts([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const params = { search: q, per_page: 48 };
    if (filters.min_price) params.min_price = filters.min_price;
    if (filters.max_price) params.max_price = filters.max_price;
    if (filters.category_id) params.category_id = filters.category_id;
    if (categorySlug) params.category_slug = categorySlug;
    params.sort = filters.sort;

    productApi
      .list(params)
      .then((r) => setProducts(r.products || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, categorySlug, filters]);

  return (
    <div className="w-full px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">
        {searchH1}
      </h1>
      {!q && (
        <p className="text-gray-500 mb-6 max-w-xl">
          Search for products by name or keyword. Use the search bar in the header or enter a query in the URL (e.g. ?q=shoes). You can also browse by category or shop all products.
        </p>
      )}

      {q && (
        <div className="flex flex-wrap gap-4 mb-6">
          <select
            value={filters.sort}
            onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}
            className="px-4 py-2 border border-gray-200 rounded-xl text-sm"
          >
            <option value="relevance">Best match</option>
            <option value="newest">Newest</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="popular">Popular</option>
            <option value="rating">Rating</option>
          </select>
          <input
            type="number"
            placeholder="Min price"
            value={filters.min_price}
            onChange={(e) => setFilters((p) => ({ ...p, min_price: e.target.value }))}
            className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
          <input
            type="number"
            placeholder="Max price"
            value={filters.max_price}
            onChange={(e) => setFilters((p) => ({ ...p, max_price: e.target.value }))}
            className="w-28 px-3 py-2 border border-gray-200 rounded-xl text-sm"
          />
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg font-medium">{q ? `No products found for "${q}"` : "Enter a search term above"}</p>
          <p className="text-gray-400 text-sm mt-2 max-w-md mx-auto">
            {q ? "Try different keywords or browse categories." : "Use the search bar in the header or add ?q=your-query to the URL."}
          </p>
          <Link href="/shop" className="mt-6 inline-block px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg">
            Browse all products
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 items-stretch">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} showAddToCart />
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-[400px] flex items-center justify-center">Loading...</div>}>
      <SearchResultsContent />
    </Suspense>
  );
}
