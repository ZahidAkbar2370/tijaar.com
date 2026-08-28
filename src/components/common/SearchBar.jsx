"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { searchApi } from "@/lib/api";

export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (query.length < 2) {
      setSuggestions({ products: [], categories: [] });
      setShowDropdown(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setLoading(true);
      searchApi
        .suggest(query)
        .then((r) => {
          setSuggestions({ products: r.products || [], categories: r.categories || [] });
          setShowDropdown(true);
        })
        .catch(() => setSuggestions({ products: [], categories: [] }))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    setShowDropdown(false);
  };

  const hasSuggestions = suggestions.products.length > 0 || suggestions.categories.length > 0;

  return (
    <div ref={containerRef} className="relative hidden md:block w-64 lg:w-80">
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && hasSuggestions && setShowDropdown(true)}
          placeholder="Search products..."
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
        />
      </form>
      {showDropdown && query.length >= 2 && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
          {loading ? (
            <div className="px-4 py-6 text-center text-gray-400 text-sm">Searching...</div>
          ) : !hasSuggestions ? (
            <div className="px-4 py-6 text-center text-gray-500 text-sm">No results</div>
          ) : (
            <>
              {suggestions.categories.length > 0 && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Categories</p>
                  {suggestions.categories.map((c) => (
                    <Link
                      key={c.id}
                      href={`/category/${c.slug}`}
                      onClick={() => setShowDropdown(false)}
                      className="block px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      {c.name}
                    </Link>
                  ))}
                </div>
              )}
              {suggestions.products.length > 0 && (
                <div className="px-3 py-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Products</p>
                  {suggestions.products.map((p) => (
                    <Link
                      key={p.id}
                      href={`/product/${p.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => setShowDropdown(false)}
                      className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-lg text-sm"
                    >
                      <img src={p.image || "/assets/sample-image.webp"} alt="" className="w-10 h-10 object-cover rounded" />
                      <span className="flex-1 truncate">{p.name}</span>
                      <span className="font-medium text-[#1790d7]">${p.price}</span>
                    </Link>
                  ))}
                </div>
              )}
              <Link
                href={`/search?q=${encodeURIComponent(query)}`}
                onClick={() => setShowDropdown(false)}
                className="block px-4 py-2 text-center text-[#1790d7] text-sm font-medium hover:bg-gray-50"
              >
                View all results →
              </Link>
            </>
          )}
        </div>
      )}
    </div>
  );
}
