"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { promotionApi, walletApi, payoutsApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import PageHero from "@/components/customer/PageHero";
import { Star, Zap, Store, Image, Wallet, Clock, AlertCircle, ChevronRight } from "lucide-react";

const TYPE_ICONS = {
  featured_product: Star,
  hot_sale: Zap,
  featured_shop: Store,
  store_banner: Image,
};

function VendorPackagesContent() {
  const { formatPrice } = useMarket();
  const [packages, setPackages] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const parseBalance = (r) => {
      if (!r || typeof r !== "object") return null;
      const spendable = r.spendable_balance ?? r.spendableBalance;
      const raw = spendable ?? r.balance ?? r.data?.balance;
      if (raw === undefined || raw === null) return null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    };

    Promise.allSettled([
      promotionApi.packages().then((r) => r.packages || []),
      promotionApi.mySubscriptions().then((r) => r.subscriptions || []),
      walletApi.balance().then(parseBalance),
      payoutsApi.earnings().then((r) => (r?.earnings?.net != null ? Number(r.earnings.net) : null)),
    ]).then(([pkgRes, subRes, balRes, earnRes]) => {
      setPackages(pkgRes.status === "fulfilled" ? pkgRes.value : []);
      setSubscriptions(subRes.status === "fulfilled" ? subRes.value : []);
      const walletBal = balRes.status === "fulfilled" ? balRes.value : null;
      const netEarnings = earnRes.status === "fulfilled" ? earnRes.value : null;
      setBalance(walletBal != null ? walletBal : netEarnings);
    }).finally(() => setLoading(false));
  }, []);

  const activeSubscriptions = subscriptions.filter((s) => s.is_active);
  const canAfford = (price) => {
    if (balance == null || balance === undefined) return false;
    const p = Number(price);
    if (!Number.isFinite(p)) return false;
    return Number(balance) >= p - 0.005;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          <div className="h-32 bg-gray-100 rounded-xl animate-pulse" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <Link href="/seller/dashboard" className="text-amber-600 text-sm hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <PageHero
          title="Packages & Subscriptions"
          description="View your active promotions, buy packages with your wallet balance, and see how many days remain on each subscription."
          illustration="promote"
          guide="Tip: Package purchases are deducted from your wallet and appear in Transaction History. Active packages show days remaining."
        />
      </div>

      {/* Wallet balance */}
      <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-5 text-white shadow-lg">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm text-amber-100">Wallet Balance</p>
              <p className="text-2xl font-bold">{balance != null ? Number(balance).toLocaleString() : "0"} PKR</p>
            </div>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <Link
              href="/seller/wallet/deposit?return=/seller/packages"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-white/20 hover:bg-white/30 text-white transition"
            >
              Deposit Funds
            </Link>
            <Link
              href="/seller/transactions"
              className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-white"
            >
              View Transaction History <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* My subscriptions – days remaining alert */}
      {activeSubscriptions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">My Active Subscriptions</h2>
          <div className="space-y-3">
            {activeSubscriptions.map((sub) => (
              <div
                key={sub.id}
                className={`rounded-xl border-2 p-4 flex flex-wrap items-center justify-between gap-4 ${
                  sub.days_remaining <= 7
                    ? "border-amber-400 bg-amber-50"
                    : "border-emerald-200 bg-emerald-50/50"
                }`}
              >
                <div className="flex items-center gap-3">
                  {sub.days_remaining <= 7 && (
                    <AlertCircle className="w-6 h-6 text-amber-600 shrink-0" />
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">{sub.package_name}</p>
                    <p className="text-sm text-gray-600 flex items-center gap-1 mt-0.5">
                      <Clock className="w-4 h-4" />
                      Ends {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : "—"}
                    </p>
                  </div>
                </div>
                <div
                  className={`px-4 py-2 rounded-lg font-bold text-sm ${
                    sub.days_remaining <= 7
                      ? "bg-amber-500 text-white"
                      : "bg-emerald-500 text-white"
                  }`}
                >
                  {sub.days_remaining === 0
                    ? "Expires today"
                    : sub.days_remaining === 1
                    ? "1 day remaining"
                    : `${sub.days_remaining} days remaining`}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Past subscriptions (collapsed or short list) */}
      {subscriptions.filter((s) => !s.is_active).length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold text-gray-900">Past Subscriptions</h2>
          <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Package</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Ended</th>
                  <th className="text-left px-4 py-2 font-medium text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {subscriptions
                  .filter((s) => !s.is_active)
                  .slice(0, 10)
                  .map((sub) => (
                    <tr key={sub.id}>
                      <td className="px-4 py-2 text-gray-900">{sub.package_name}</td>
                      <td className="px-4 py-2 text-gray-600">
                        {sub.ends_at ? new Date(sub.ends_at).toLocaleDateString() : "—"}
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-gray-500 capitalize">{sub.status}</span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available packages */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">Available Packages</h2>
        <p className="text-sm text-gray-600">
          Buy with your wallet balance. Payment is deducted immediately and recorded in Transaction History.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {packages.map((pkg) => {
            const Icon = TYPE_ICONS[pkg.type] || Star;
            const price = Number(pkg.price || 0);
            const afford = canAfford(price);
            return (
              <div
                key={pkg.id}
                className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition flex flex-col"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                    <p className="text-sm text-gray-500">{pkg.duration_days} days</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4 flex-1">{pkg.description || "Boost visibility for your products or store."}</p>
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <span className="text-xl font-bold text-amber-600">{formatPrice(pkg.price)}</span>
                  {price === 0 ? (
                    <Link
                      href={`/seller/promote/${pkg.id}`}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition"
                    >
                      Activate free
                    </Link>
                  ) : afford ? (
                    <Link
                      href={`/seller/promote/${pkg.id}`}
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition"
                    >
                      Buy with Wallet
                    </Link>
                  ) : (
                    <Link
                      href="/seller/wallet/deposit?return=/seller/packages"
                      className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500 hover:bg-amber-600 text-white transition"
                    >
                      Deposit Funds
                    </Link>
                  )}
                </div>
                {price > 0 && !afford && balance != null && (
                  <p className="text-xs text-amber-600 mt-2">
                    Need {formatPrice(price - balance)} more. <Link href="/seller/wallet/deposit?return=/seller/packages" className="underline font-medium">Deposit funds</Link> to buy this package.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {packages.length === 0 && (
        <div className="flex flex-col lg:flex-row items-center gap-6 p-12 rounded-2xl bg-gray-50 border border-gray-200 text-center lg:text-left">
          <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-amber-100 flex items-center justify-center">
            <Zap className="w-16 h-16 text-amber-500" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">No packages available</h2>
            <p className="text-sm text-gray-600 mt-1">Promotion packages will appear here when added by admin. Check back later.</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VendorPackagesPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorPackagesContent />
    </ProtectedRoute>
  );
}
