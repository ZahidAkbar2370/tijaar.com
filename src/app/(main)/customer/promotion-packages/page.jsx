"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHero from "@/components/customer/PageHero";
import { promotionApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { Star, Zap, Store, Image, Sparkles, History } from "lucide-react";

const TYPE_ICONS = {
  featured_product: Star,
  hot_sale: Zap,
  featured_shop: Store,
  store_banner: Image,
};

function PromotionPackagesContent() {
  const { formatPrice } = useMarket();
  const [packages, setPackages] = useState([]);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("packages");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      promotionApi.packages().then((r) => r.packages || []).catch(() => []),
      promotionApi.history(1).then((r) => r.history || []).catch(() => []),
    ]).then(([pkgs, hist]) => {
      setPackages(pkgs);
      setHistory(hist);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />;
  }

  return (
    <div className="space-y-5">
      <PageHero
        title="Promotion Packages"
        description="Boost a listing or shop. After payment, featured labels apply automatically and expire when the package duration ends."
        illustration="promote"
      />
      <div className="flex gap-2 border-b border-gray-200 pb-2">
        <button
          type="button"
          onClick={() => setTab("packages")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "packages" ? "bg-[#1790d7] text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <Sparkles className="w-4 h-4 inline mr-1" />
          Packages
        </button>
        <button
          type="button"
          onClick={() => setTab("history")}
          className={`px-4 py-2 rounded-lg text-sm font-medium ${tab === "history" ? "bg-[#1790d7] text-white" : "text-gray-600 hover:bg-gray-100"}`}
        >
          <History className="w-4 h-4 inline mr-1" />
          Purchase history
        </button>
      </div>

      {tab === "packages" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {packages.map((pkg) => {
            const Icon = TYPE_ICONS[pkg.type] || Star;
            const href = `/customer/promote/${pkg.id}`;
            return (
              <div key={pkg.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-amber-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-xs text-gray-500 mt-0.5">{pkg.duration_days} days · {pkg.type?.replace(/_/g, " ")}</p>
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{pkg.description || "Increase visibility on Tijaar."}</p>
                    <div className="flex items-center justify-between mt-4 gap-3">
                      <span className="text-lg font-bold text-[#1790d7]">{formatPrice(pkg.price)}</span>
                      <Link href={href} className="px-4 py-2 rounded-xl bg-[#1790d7] text-white text-sm font-semibold hover:bg-[#1277b8]">
                        Select package
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
          {packages.length === 0 && (
            <p className="text-gray-500 col-span-full">No packages available for your account right now.</p>
          )}
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-gray-500">
              <tr>
                <th className="px-4 py-3">Package</th>
                <th className="px-4 py-3 hidden sm:table-cell">Product / Shop</th>
                <th className="px-4 py-3">Duration</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {history.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium text-gray-900">{row.package_name}</p>
                    <p className="text-xs text-gray-500">{row.package_type_label}</p>
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell text-gray-700">
                    {row.product_name || row.store_name || "—"}
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {row.duration_days} days
                    {row.is_active ? ` · ${row.days_remaining}d left` : ""}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${row.is_active ? "bg-emerald-100 text-emerald-800" : "bg-gray-100 text-gray-600"}`}>
                      {row.is_active ? "Active" : row.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {history.length === 0 && <p className="p-6 text-gray-500 text-center">No promotion purchases yet.</p>}
        </div>
      )}
      <p className="text-xs text-gray-500">
        Pay with your{" "}
        <Link href="/customer/wallet" className="text-[#1790d7] hover:underline">
          Tijaar Wallet
        </Link>
        . Featured and hot labels are removed automatically when the package expires.
      </p>
    </div>
  );
}

export default function CustomerPromotionPackagesPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <PromotionPackagesContent />
    </ProtectedRoute>
  );
}
