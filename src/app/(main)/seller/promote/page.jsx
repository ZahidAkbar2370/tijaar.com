"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { promotionApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { Star, Zap, Store, Image, ArrowLeft } from "lucide-react";
import PageHero from "@/components/customer/PageHero";
import { FormSection, btnPrimary } from "@/components/ui/FormSection";

const TYPE_ICONS = {
  featured_product: Star,
  hot_sale: Zap,
  featured_shop: Store,
  store_banner: Image,
};

function VendorPromoteContent() {
  const { formatPrice } = useMarket();
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    promotionApi
      .packages()
      .then((res) => setPackages(res.packages || []))
      .catch(() => setPackages([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-gray-200 rounded w-1/3" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-40 bg-gray-100 rounded-xl" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Link href="/seller/dashboard" className="text-[#1790d7] text-sm hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="w-4 h-4" /> Back to Dashboard
      </Link>
      <PageHero
        title="Promote Your Products & Store"
        description="Boost visibility with featured placements. Choose packages to highlight products, run hot sales, or feature your store."
        illustration="promote"
        guide="Tip: After purchase, enable Featured/Hot on My Products. Badges appear on product cards and search."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {packages.map((pkg) => {
          const Icon = TYPE_ICONS[pkg.type] || Star;
          return (
            <FormSection key={pkg.id} title={pkg.name} subtitle={`${pkg.duration_days} days`} icon={Icon}>
              <p className="text-sm text-gray-600">{pkg.description || "Increase reach for your products or store."}</p>
              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-xl font-bold text-[#1790d7]">{formatPrice(pkg.price)}</span>
                <Link href={`/seller/promote/${pkg.id}`} className={btnPrimary}>
                  Promote
                </Link>
              </div>
            </FormSection>
          );
        })}
      </div>

      {packages.length === 0 && (
        <div className="p-10 rounded-2xl bg-white border border-gray-200/80 text-center shadow-sm">
          <span className="w-14 h-14 mx-auto rounded-xl bg-[#1790d7]/10 text-[#1790d7] flex items-center justify-center mb-3">
            <Star className="w-7 h-7" />
          </span>
          <h2 className="font-semibold text-gray-900">No promotion packages available</h2>
          <p className="text-sm text-gray-600 mt-1">Check back later or contact support.</p>
        </div>
      )}
    </div>
  );
}

export default function VendorPromotePage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorPromoteContent />
    </ProtectedRoute>
  );
}
