"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Store, Sparkles, TrendingUp } from "lucide-react";
import { useMarket } from "@/context/MarketContext";
import { useHomeData } from "@/context/HomeDataContext";
import CategoryIcon from "@/components/common/CategoryIcon";
import { categoryApi } from "@/lib/api";
import { categoryHasImage, resolveCategoryImageSrc } from "@/lib/categoryImage";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";

export default function Hero() {
  const { formatPrice } = useMarket();
  const { sections, categories, browse_categories: browseCategories, featured_products: featuredProducts } = useHomeData();
  const [navCategories, setNavCategories] = useState([]);
  const [currentProduct, setCurrentProduct] = useState(0);

  const heroConfig = sections?.hero ?? null;
  const homeH1 = useSeoH1("home");
  const currentFeatured = featuredProducts[currentProduct % Math.max(1, featuredProducts.length)];
  const trendingTags = (categories || []).slice(0, 6).map((c) => c.name);

  useEffect(() => {
    if (!featuredProducts.length) return;
    const id = setInterval(
      () => setCurrentProduct((p) => (p + 1) % featuredProducts.length),
      4000
    );
    return () => clearInterval(id);
  }, [featuredProducts.length]);

  useEffect(() => {
    const load = () => {
      categoryApi
        .list(true)
        .then((res) => setNavCategories(res.categories || []))
        .catch(() => setNavCategories([]));
    };
    if (typeof requestIdleCallback === "function") {
      requestIdleCallback(load, { timeout: 3000 });
    } else {
      setTimeout(load, 2000);
    }
  }, []);

  const heroCategories = useMemo(() => {
    const navById = new Map((navCategories || []).map((c) => [c.id, c]));
    const navBySlug = new Map((navCategories || []).map((c) => [c.slug, c]));
    const browseById = new Map((browseCategories || []).map((c) => [c.id, c]));
    const browseBySlug = new Map((browseCategories || []).map((c) => [c.slug, c]));

    return (categories || []).slice(0, 4).map((homeCat) => {
      const imageSource =
        navById.get(homeCat.id) ||
        navBySlug.get(homeCat.slug) ||
        browseById.get(homeCat.id) ||
        browseBySlug.get(homeCat.slug) ||
        homeCat;

      return {
        ...homeCat,
        image: imageSource.image || homeCat.image,
        image_url: imageSource.image_url || homeCat.image_url,
        icon: imageSource.icon || homeCat.icon,
        products_count: homeCat.products_count ?? 0,
      };
    });
  }, [categories, navCategories, browseCategories]);

  return (
    <div className="hero-content-layer px-3 sm:px-4 lg:px-8 py-4 sm:py-6 lg:py-8">
        <div className="grid lg:grid-cols-2 gap-6 sm:gap-10 lg:gap-14 items-center">
          <div>
            {(heroConfig?.badge ?? "#1 Multi-Seller Marketplace") && (
              <span className="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-1 sm:py-2 bg-[#1790d7]/10 rounded-full text-[#1790d7] text-[11px] sm:text-sm font-medium mb-3 sm:mb-6">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4" />
                {heroConfig?.badge || "#1 Multi-Seller Marketplace"}
              </span>
            )}

            <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-2 sm:mb-4">
              {homeH1}
            </h1>

            {(heroConfig?.title || heroConfig?.title_line2) && (
              <p className="text-lg sm:text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 leading-tight mb-2 sm:mb-4">
                {heroConfig?.title || "Buy & Sell"}
                {heroConfig?.title_line2 ? (
                  <span className="block text-shine">{heroConfig.title_line2}</span>
                ) : (
                  !heroConfig?.title && <span className="block text-shine">Anything, Anywhere</span>
                )}
              </p>
            )}

            <p className="text-gray-600 text-sm sm:text-lg mb-4 sm:mb-6 max-w-lg leading-snug">
              {heroConfig?.subtitle || "The #1 multi-seller marketplace for Pakistan & UAE. Shop from verified sellers with secure payments, fast shipping, and buyer protection—or start selling and reach millions of buyers."}
            </p>

            <div className="hidden sm:flex flex-wrap gap-4 mb-6">
              {(heroConfig?.feature1_title || heroConfig?.feature2_title || heroConfig?.feature3_title || !heroConfig) && (
                <>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                      <span className="text-lg">✓</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{heroConfig?.feature1_title || "Secure Payments"}</p>
                      <p className="text-xs text-gray-500">{heroConfig?.feature1_subtitle || "JazzCash, Stripe, PayPal"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Store className="w-5 h-5 text-[#1790d7]" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{heroConfig?.feature2_title || "Verified Sellers"}</p>
                      <p className="text-xs text-gray-500">{heroConfig?.feature2_subtitle || "Trusted marketplace"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white/80 backdrop-blur-sm rounded-xl border border-gray-100 shadow-sm">
                    <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
                      <span className="text-lg">🚚</span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{heroConfig?.feature3_title || "Fast Shipping"}</p>
                      <p className="text-xs text-gray-500">{heroConfig?.feature3_subtitle || "Pakistan & UAE"}</p>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <Link
                href={heroConfig?.cta_primary_url || "/shop"}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-8 py-2 sm:py-4 text-xs sm:text-base bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-lg sm:rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-[#1790d7]/25 transition-all"
              >
                {heroConfig?.cta_primary_text || "Start Shopping"}
                <span className="text-white/90">→</span>
              </Link>
              <Link
                href={heroConfig?.cta_secondary_url || "/sellers"}
                className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-6 py-2 sm:py-4 text-xs sm:text-base bg-white border border-primary-dark sm:border-2 text-primary-dark rounded-lg sm:rounded-xl font-semibold hover:bg-primary-dark/5 transition-all"
              >
                {heroConfig?.cta_secondary_text || "Sell on Tijaar"}
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span className="flex items-center gap-1 text-gray-500 text-[11px] sm:text-sm">
                <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                Trending:
              </span>
              {trendingTags.map((tag, i) => (
                <Link
                  key={i}
                  href={`/category/${(categories || [])[i]?.slug || String(tag || "").toLowerCase().replace(/\s+/g, "-")}`}
                  className="px-2 sm:px-3 py-0.5 sm:py-1.5 bg-gray-100 hover:bg-[#1790d7]/10 hover:text-[#1790d7] rounded-full text-gray-600 text-[11px] sm:text-sm transition-colors"
                >
                  {tag}
                </Link>
              ))}
            </div>
          </div>

          <div className="space-y-2.5 sm:space-y-4">
            <div className="grid grid-cols-2 gap-2 sm:gap-4">
              {heroCategories.map((cat) => {
                const imgSrc = resolveCategoryImageSrc(cat);
                const hasImage = categoryHasImage(cat);
                return (
                <Link key={cat.id} href={`/category/${cat.slug}`}>
                  <div className="relative overflow-hidden rounded-xl sm:rounded-2xl p-2.5 sm:p-5 bg-white border border-gray-100 shadow-md sm:shadow-lg cursor-pointer group hover:border-[#1790d7]/20 hover:-translate-y-0.5 transition-all h-full">
                    <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                      {hasImage ? (
                        <img
                          src={imgSrc}
                          alt={resolveImageAlt(cat.image_alt, cat.name || IMAGE_ALT_FALLBACKS.category)}
                          className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl object-cover shrink-0 border border-gray-100"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.style.display = "none";
                            e.target.nextElementSibling?.classList.remove("hidden");
                          }}
                        />
                      ) : null}
                      <div className={hasImage ? "hidden" : "p-1.5 sm:p-3 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-lg sm:rounded-xl shrink-0"}>
                        <CategoryIcon icon={cat.icon} className="w-3.5 h-3.5 sm:w-5 sm:h-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-gray-900 font-bold text-xs sm:text-base leading-tight truncate">{cat.name}</p>
                        <span className="text-primary-dark text-[10px] sm:text-sm font-medium">
                          {cat.products_count ?? 0} products
                        </span>
                      </div>
                      <span className="hidden sm:inline ml-auto text-gray-400 group-hover:text-[#1790d7] group-hover:translate-x-1 transition-all shrink-0">
                        →
                      </span>
                    </div>
                  </div>
                </Link>
              );
              })}
            </div>

            {currentFeatured && (
              <div className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-lg sm:shadow-xl">
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-full">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
                  <span className="text-white text-[10px] sm:text-xs font-bold">FEATURED</span>
                </div>
                <div className="relative aspect-[16/9]">
                    <img
                      key={currentProduct}
                      src={optimizeImageUrl(
                        currentFeatured.image || currentFeatured.thumbnail || "/assets/sample-image.webp",
                        { width: IMAGE_WIDTHS.productFeatured }
                      )}
                      alt={resolveImageAlt(
                        currentFeatured.image_alt,
                        currentFeatured.title || currentFeatured.name || IMAGE_ALT_FALLBACKS.product
                      )}
                      className="w-full h-full object-cover transition-opacity duration-300"
                      loading="lazy"
                      decoding="async"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-5">
                      <h3 className="text-white font-bold text-sm sm:text-lg mb-0.5 sm:mb-1 line-clamp-1">
                        {currentFeatured.title || currentFeatured.name}
                      </h3>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-base sm:text-2xl font-bold text-white">
                          {formatPrice?.(currentFeatured.price ?? 0) ?? `${currentFeatured.price ?? "0.00"} PKR`}
                        </span>
                        <Link
                          href={`/product/${currentFeatured.slug || currentFeatured.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-2.5 sm:px-4 py-1.5 sm:py-2 bg-white text-gray-900 rounded-lg sm:rounded-xl font-semibold text-[11px] sm:text-sm hover:bg-gray-100 shrink-0"
                        >
                          View Product
                        </Link>
                      </div>
                    </div>
                </div>
                {featuredProducts.length > 1 && (
                  <div className="absolute bottom-2 sm:bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 sm:gap-2 z-20">
                    {featuredProducts.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setCurrentProduct(i)}
                        className={`h-1.5 sm:h-2 rounded-full transition-all ${
                          i === currentProduct ? "bg-white w-4 sm:w-6" : "bg-white/50 w-1.5 sm:w-2"
                        }`}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            <Link href="/all-categories">
              <div className="flex items-center justify-between p-2.5 sm:p-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-xl sm:rounded-2xl cursor-pointer group hover:scale-[1.01] transition-transform">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <div className="p-1.5 sm:p-2 bg-white/20 rounded-lg sm:rounded-xl shrink-0">
                    <Store className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="text-white font-semibold text-sm sm:text-base leading-tight">Explore All Categories</h4>
                    <p className="text-white/70 text-[11px] sm:text-sm">{(categories || []).length} categories</p>
                  </div>
                </div>
                <span className="text-white text-sm sm:text-base group-hover:translate-x-2 transition-transform shrink-0">→</span>
              </div>
            </Link>
          </div>
        </div>
    </div>
  );
}
