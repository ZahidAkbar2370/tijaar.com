"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { categoryApi, searchApi } from "@/lib/api";

export default function AdvancedSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [categorySlug, setCategorySlug] = useState("");
  const [categoryName, setCategoryName] = useState("All Categories");
  const [categories, setCategories] = useState([]);
  const [suggestions, setSuggestions] = useState({ products: [], categories: [] });
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDeptDropdown, setShowDeptDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deptDropdownRect, setDeptDropdownRect] = useState(null);
  const debounceRef = useRef(null);
  const containerRef = useRef(null);
  const deptButtonRef = useRef(null);

  useEffect(() => {
    categoryApi.list(true).then((r) => setCategories(r.categories || [])).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (showDeptDropdown && deptButtonRef.current) {
      const rect = deptButtonRef.current.getBoundingClientRect();
      setDeptDropdownRect({ top: rect.bottom + 4, left: rect.left, width: rect.width });
    } else {
      setDeptDropdownRect(null);
    }
  }, [showDeptDropdown]);

  useEffect(() => {
    if (query.length < 1) {
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
    }, 250);
    return () => clearTimeout(debounceRef.current);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setShowDropdown(false);
      if (showDeptDropdown && deptButtonRef.current && !deptButtonRef.current.contains(e.target)) {
        const portalEl = document.getElementById("dept-dropdown-portal");
        if (portalEl && !portalEl.contains(e.target)) setShowDeptDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showDeptDropdown]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (query.trim()) {
      const params = new URLSearchParams({ q: query.trim() });
      if (categorySlug) params.set("category", categorySlug);
      router.push(`/search?${params}`);
    }
    setShowDropdown(false);
  };

  const hasSuggestions = suggestions.products.length > 0 || suggestions.categories.length > 0;
  const selectCategory = (c) => {
    if (!c) {
      setCategorySlug("");
      setCategoryName("All Categories");
    } else {
      setCategorySlug(c.slug);
      setCategoryName(c.name);
    }
    setShowDeptDropdown(false);
  };

  return (
    <div ref={containerRef} className="flex-1 min-w-[280px] max-w-none mx-4 hidden md:flex">
      <form onSubmit={handleSubmit} className="flex w-full rounded-xl overflow-visible border-2 border-gray-200 bg-white shadow-sm hover:shadow-md hover:border-gray-300 transition-all focus-within:ring-2 focus-within:ring-[#1790d7]/40 focus-within:border-[#1790d7] focus-within:shadow-lg">
        {/* All Categories - Custom Premium Dropdown */}
        <div className="relative flex-shrink-0 rounded-l-xl overflow-hidden">
          <button
            ref={deptButtonRef}
            type="button"
            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setShowDeptDropdown((v) => !v); }}
            className="flex items-center justify-between gap-2 pl-4 pr-10 py-3 min-w-[160px] bg-gradient-to-b from-gray-50 to-gray-100/80 border-r-2 border-gray-200 text-sm font-semibold text-gray-700 hover:from-gray-100 hover:to-gray-100 transition-colors"
          >
            <span className="truncate">{categoryName}</span>
            <ChevronDown className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${showDeptDropdown ? "rotate-180" : ""}`} />
          </button>

          {showDeptDropdown && deptDropdownRect && typeof document !== "undefined" && createPortal(
            <div
              id="dept-dropdown-portal"
              className="fixed w-64 bg-white rounded-xl shadow-2xl border-2 border-gray-100 py-2 z-[9999] max-h-80 overflow-y-auto"
              style={{ top: deptDropdownRect.top, left: deptDropdownRect.left }}
            >
              <button
                type="button"
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); selectCategory(null); }}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-[#1790d7]/5 ${!categorySlug ? "bg-[#1790d7]/10 text-[#1790d7]" : "text-gray-700"}`}
              >
                <span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" />
                All Categories
              </button>
              {categories.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); selectCategory(c); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm font-medium transition-colors hover:bg-[#1790d7]/5 ${categorySlug === c.slug ? "bg-[#1790d7]/10 text-[#1790d7]" : "text-gray-700"}`}
                >
                  <span className="w-2 h-2 rounded-full bg-[#1790d7]/60 shrink-0" />
                  {c.name}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>

        {/* Search Input + Autocomplete */}
        <div className="flex-1 relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => query.length >= 1 && setShowDropdown(true)}
            placeholder="Search for products..."
            className="w-full pl-4 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none text-sm"
          />
          {showDropdown && query.length >= 1 && (
            <div className="absolute left-0 right-0 top-full mt-0 bg-white rounded-b-xl shadow-2xl border-2 border-t-0 border-gray-200 py-2 z-[100] max-h-[420px] overflow-y-auto">
              {loading ? (
                <div className="px-4 py-10 flex items-center justify-center gap-2 text-gray-500">
                  <div className="w-6 h-6 border-2 border-[#1790d7] border-t-transparent rounded-full animate-spin" />
                  <span className="text-sm font-medium">Searching products...</span>
                </div>
              ) : !hasSuggestions ? (
                <div className="px-4 py-10 text-center text-gray-500 text-sm">No results for &quot;{query}&quot;</div>
              ) : (
                <>
                  {/* Products First - Autocomplete */}
                  {suggestions.products.length > 0 && (
                    <div className="px-2 py-2">
                      <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Products</p>
                      {suggestions.products.slice(0, 6).map((p) => (
                        <Link
                          key={p.id}
                          href={`/product/${p.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-[#1790d7]/5 transition-colors group"
                        >
                          <img src={p.image || "/assets/sample-image.webp"} alt="" className="w-14 h-14 object-cover rounded-lg border border-gray-100" />
                          <div className="flex-1 min-w-0">
                            <span className="block text-sm font-medium text-gray-800 group-hover:text-[#1790d7] line-clamp-2">{p.name}</span>
                            <span className="text-xs text-gray-500">{Number(p.price || 0).toLocaleString()} PKR</span>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400 rotate-[-90deg] opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                        </Link>
                      ))}
                    </div>
                  )}
                  {suggestions.categories.length > 0 && (
                    <div className="px-2 py-2 border-t border-gray-100">
                      <p className="px-3 py-1.5 text-xs font-bold text-gray-400 uppercase tracking-wider">Categories</p>
                      {suggestions.categories.map((c) => (
                        <Link
                          key={c.id}
                          href={`/category/${c.slug}`}
                          onClick={() => setShowDropdown(false)}
                          className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[#1790d7]/5 transition-colors text-sm font-medium text-gray-700 hover:text-[#1790d7]"
                        >
                          <span className="text-[#1790d7]">{c.name}</span>
                        </Link>
                      ))}
                    </div>
                  )}
                  <Link
                    href={`/search?${new URLSearchParams({ q: query, ...(categorySlug && { category: categorySlug }) })}`}
                    onClick={() => setShowDropdown(false)}
                    className="block mx-2 mt-2 py-3 px-4 text-center text-[#1790d7] text-sm font-bold hover:bg-[#1790d7]/5 rounded-xl border-t border-gray-100 transition-colors"
                  >
                    View all results for &quot;{query}&quot;
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
        <button
          type="submit"
          aria-label="Search"
          className="px-6 py-3 rounded-r-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white hover:shadow-lg hover:shadow-[#1790d7]/30 transition-all flex items-center justify-center"
        >
          <Search className="w-5 h-5" aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
