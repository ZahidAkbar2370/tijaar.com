"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  BadgeCheck,
  ShieldCheck,
  Package,
  Clock,
  MessageCircle,
  MapPin,
  Calendar,
  Share2,
  Check,
  Star,
  Phone,
  Smartphone,
} from "lucide-react";
import StoreReviews from "@/components/reviews/StoreReviews";
import ProductCard from "@/components/public/ProductCard";
import { PRODUCT_CARD_GRID_CLASS } from "@/lib/productCardSwiper";
import SellerAvatar from "@/components/vendors/SellerAvatar";
import RatingStars from "@/components/ui/RatingStars";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { useSeoH1 } from "@/hooks/useSeoH1";

export default function VendorDetail({ vendor, products }) {
  const storeH1 = useSeoH1("seller_store", { name: vendor?.storeName, fallback: vendor?.storeName });
  const [mainSection, setMainSection] = useState("products");
  const [categoryTab, setCategoryTab] = useState("all");
  const [copied, setCopied] = useState(false);

  const productCount = vendor?.products ?? vendor?.products_count ?? products?.length ?? 0;
  const reviewCount = vendor?.reviews ?? 0;

  const productsByCategory = useMemo(() => {
    const grouped = {};
    (products || []).forEach((p) => {
      const catName = p.category || p.category_name || "Other";
      const catSlug = p.categorySlug || p.category_slug || "other";
      if (!grouped[catSlug]) {
        grouped[catSlug] = { name: catName, slug: catSlug, products: [] };
      }
      grouped[catSlug].products.push(p);
    });
    return grouped;
  }, [products]);

  const categoryTabs = useMemo(() => {
    const tabs = [{ slug: "all", name: "All Products", count: products?.length || 0 }];
    Object.values(productsByCategory).forEach((cat) => {
      tabs.push({ slug: cat.slug, name: cat.name, count: cat.products.length });
    });
    return tabs;
  }, [productsByCategory, products]);

  const displayProducts = useMemo(() => {
    if (categoryTab === "all") return products || [];
    return productsByCategory[categoryTab]?.products || [];
  }, [categoryTab, products, productsByCategory]);

  const coverImage = vendor.banner || vendor.cover_image;

  const handleShareProfile = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    try {
      if (navigator.share) {
        await navigator.share({
          title: vendor.storeName || vendor.name || "Seller on Tijaar",
          url,
        });
        return;
      }
    } catch (err) {
      if (err?.name === "AbortError") return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="relative h-48 md:h-64 lg:h-80 bg-gradient-to-r from-[#1790d7] to-[#4db3e8]">
        {coverImage && (
          <img
            src={coverImage}
            alt={resolveImageAlt(
              vendor.banner_alt || vendor.cover_image_alt,
              vendor.storeName || IMAGE_ALT_FALLBACKS.storeBanner
            )}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      <div className="w-full px-4 lg:px-8">
        <div className="relative -mt-16 md:-mt-20 mb-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="shrink-0 -mt-16 md:-mt-20 border-4 border-white shadow-lg rounded-2xl overflow-hidden">
                <SellerAvatar
                  src={vendor.logo}
                  alt={resolveImageAlt(vendor.logo_alt, vendor.storeName || IMAGE_ALT_FALLBACKS.storeLogo)}
                  className="w-24 h-24 md:w-32 md:h-32"
                  iconClassName="w-12 h-12 md:w-16 md:h-16"
                  rounded="rounded-2xl"
                />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{storeH1}</h1>
                  {vendor.kyc_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-100 rounded-full">
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                      <span className="text-xs font-semibold text-blue-600">Verified Seller</span>
                    </span>
                  )}
                  {vendor.kyc_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 rounded-full">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="text-xs font-semibold text-emerald-600">KYC Verified</span>
                    </span>
                  )}
                  {vendor.phone_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-100 rounded-full">
                      <Phone className="w-4 h-4 text-sky-600" />
                      <span className="text-xs font-semibold text-sky-700">Phone Verified</span>
                    </span>
                  )}
                  {vendor.whatsapp_verified && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 rounded-full">
                      <Smartphone className="w-4 h-4 text-green-600" />
                      <span className="text-xs font-semibold text-green-700">WhatsApp Verified</span>
                    </span>
                  )}
                </div>

                {vendor.description && (
                  <p className="text-gray-600 mb-4 max-w-2xl">{vendor.description}</p>
                )}

                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-1.5">
                    <RatingStars rating={vendor.rating} size="lg" showValue valueClassName="font-bold text-gray-900" />
                    <span className="text-gray-500">({vendor.reviews || 0} reviews)</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-600">
                    <Package className="w-4 h-4" />
                    <span className="font-semibold">{vendor.products ?? vendor.products_count ?? 0}</span>
                    <span>Products</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-green-600">
                    <Clock className="w-4 h-4" />
                    <span className="font-semibold">{vendor.on_time_delivery ?? "98%"}</span>
                    <span>On-Time</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-blue-600">
                    <MessageCircle className="w-4 h-4" />
                    <span className="font-semibold">{vendor.response_rate ?? "95%"}</span>
                    <span>Response</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-500">
                  {(vendor.city || vendor.country) && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {[vendor.city, vendor.country].filter(Boolean).join(", ")}
                    </span>
                  )}
                  {vendor.created_at && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Member since{" "}
                      {new Date(vendor.created_at).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-2 shrink-0">
                <button
                  type="button"
                  onClick={handleShareProfile}
                  className="flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] rounded-xl text-sm font-medium text-white transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
                  {copied ? "Link copied" : "Share profile"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {(vendor.shipping_policy || vendor.return_policy) && (
        <div className="w-full px-4 lg:px-8 mb-8">
          <div className="grid md:grid-cols-2 gap-4">
            {vendor.shipping_policy && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Shipping Policy</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{vendor.shipping_policy}</p>
              </div>
            )}
            {vendor.return_policy && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <h3 className="font-semibold text-gray-900 mb-2">Return Policy</h3>
                <p className="text-gray-600 text-sm whitespace-pre-wrap">{vendor.return_policy}</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="w-full px-4 lg:px-8 pb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="inline-flex w-full sm:w-auto rounded-xl bg-gray-100 p-1 border border-gray-200/80">
            <button
              type="button"
              onClick={() => setMainSection("products")}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mainSection === "products"
                  ? "bg-white text-[#1790d7] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Package className="w-4 h-4" />
              Products
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  mainSection === "products" ? "bg-[#1790d7]/10 text-[#1790d7]" : "bg-gray-200 text-gray-600"
                }`}
              >
                {productCount}
              </span>
            </button>
            <button
              type="button"
              onClick={() => setMainSection("reviews")}
              className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
                mainSection === "reviews"
                  ? "bg-white text-[#1790d7] shadow-sm"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <Star className="w-4 h-4" />
              Reviews
              <span
                className={`px-1.5 py-0.5 rounded-full text-[11px] font-bold ${
                  mainSection === "reviews" ? "bg-[#1790d7]/10 text-[#1790d7]" : "bg-gray-200 text-gray-600"
                }`}
              >
                {reviewCount}
              </span>
            </button>
          </div>
        </div>

        {mainSection === "reviews" ? (
          vendor.id ? (
            <StoreReviews storeId={vendor.id} />
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center text-gray-500 text-sm">
              Reviews are not available for this store.
            </div>
          )
        ) : (
          <>
            {categoryTabs.length > 2 && (
              <div className="mb-6 flex flex-wrap gap-2">
                {categoryTabs.map((tab) => (
                  <button
                    key={tab.slug}
                    type="button"
                    onClick={() => setCategoryTab(tab.slug)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                      categoryTab === tab.slug
                        ? "bg-[#1790d7] text-white shadow-lg"
                        : "bg-white text-gray-600 border border-gray-200 hover:border-[#1790d7] hover:text-[#1790d7]"
                    }`}
                  >
                    {tab.name}
                    <span
                      className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                        categoryTab === tab.slug ? "bg-white/20" : "bg-gray-100"
                      }`}
                    >
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {displayProducts.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No products found</p>
              </div>
            ) : (
              <div className={PRODUCT_CARD_GRID_CLASS}>
                {displayProducts.map((p) => (
                  <ProductCard key={p.id} product={p} showAddToCart showBuyNow={false} hideStoreInfo />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
