"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Package, Plus, ShoppingBag, DollarSign, BarChart3, Eye, Sparkles, AlertCircle } from "lucide-react";
import { privateListingsApi, payoutsApi, promotionApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import {
  getListingThumbnail,
  listingDisplayStatus,
  statusBadgeClass,
} from "@/lib/listingMedia";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "expired", label: "Expired" },
  { value: "removed", label: "Removed" },
];

function MyListingsContent() {
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState(null);
  const [eligibility, setEligibility] = useState({
    featured_eligible: false,
    hot_eligible: false,
    promote_url: "/customer/promote",
  });
  const [promoSavingId, setPromoSavingId] = useState(null);

  const filteredListings = useMemo(() => {
    if (statusFilter === "all") return listings;
    return listings.filter((l) => listingDisplayStatus(l) === statusFilter);
  }, [listings, statusFilter]);

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const paid = searchParams?.get("paid");
    if (paid == null) return;
    load().then(() => {
      if (paid === "1") {
        showSuccess?.("Payment submitted. Your listing will activate once payment is confirmed.");
      } else if (paid === "0") {
        showError?.("Payment was cancelled. You can try Pay to Activate again from the listing.");
      }
      router.replace("/customer/listings", { scroll: false });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    const payIdRaw = searchParams?.get("pay");
    if (!payIdRaw) return;
    const payId = parseInt(payIdRaw, 10);
    if (!Number.isFinite(payId) || payId <= 0) {
      router.replace("/customer/listings", { scroll: false });
      return;
    }
    const feeParam = searchParams?.get("fee");
    const feeQuery = feeParam != null && feeParam !== "" ? `&fee=${encodeURIComponent(feeParam)}` : "";
    router.replace(`/customer/listings/${payId}?pay=1${feeQuery}`, { scroll: false });
  }, [searchParams, router]);

  const load = () => {
    setLoading(true);
    return Promise.all([
      privateListingsApi.list(),
      privateListingsApi.orders().catch(() => ({ orders: [], pagination: { total: 0 } })),
      payoutsApi.earnings().catch(() => ({ net: 0, total: 0 })),
      privateListingsApi.config().catch(() => ({ config: null })),
      promotionApi.eligibility().catch(() => ({ featured_eligible: false, hot_eligible: false })),
    ])
      .then(([listRes, ordersRes, earnRes, _configRes, eligRes]) => {
        setListings(listRes.listings || listRes.products || []);
        setOrders(ordersRes.orders || []);
        setEarnings(earnRes);
        setEligibility({
          featured_eligible: !!eligRes.featured_eligible,
          hot_eligible: !!eligRes.hot_eligible,
          promote_url: eligRes.promote_url || "/customer/promote",
        });
      })
      .catch(() => {
        setListings([]);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  const togglePromotion = async (listing, field, nextValue) => {
    if (listing.locked_after_sale) {
      showError?.("This listing is locked after a sale.");
      return;
    }
    if (nextValue) {
      if (field === "is_featured" && !eligibility.featured_eligible) {
        showError?.("Purchase a Featured package first.");
        return;
      }
      if (field === "is_hot" && !eligibility.hot_eligible) {
        showError?.("Purchase a Hot package first.");
        return;
      }
    }
    setPromoSavingId(listing.id);
    const prev = { is_featured: !!listing.is_featured, is_hot: !!listing.is_hot };
    setListings((rows) =>
      rows.map((r) => (r.id === listing.id ? { ...r, [field]: nextValue } : r))
    );
    try {
      await privateListingsApi.update(listing.id, {
        [field]: nextValue,
        is_featured: field === "is_featured" ? nextValue : prev.is_featured,
        is_hot: field === "is_hot" ? nextValue : prev.is_hot,
      });
      showSuccess?.(nextValue ? `${field === "is_featured" ? "Featured" : "Hot"} enabled` : "Promotion removed");
    } catch (err) {
      setListings((rows) =>
        rows.map((r) => (r.id === listing.id ? { ...r, ...prev } : r))
      );
      showError?.(err?.data?.message || err?.message || "Could not update promotion");
    } finally {
      setPromoSavingId(null);
    }
  };

  const handleRestore = async (id) => {
    setRestoringId(id);
    try {
      const res = await privateListingsApi.restore(id);
      showSuccess?.(res?.message || "Listing recovered.");
      load();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to recover");
    } finally {
      setRestoringId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Link
          href="/customer/sell"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Listing
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Listings</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2 tabular-nums">{listings.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-[#1790d7]">
            <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 flex items-center justify-center">
              <ShoppingBag className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Orders</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2 tabular-nums">{orders.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Earnings</span>
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2 tabular-nums">{formatPrice(earnings?.net ?? 0)}</p>
        </div>
        <Link
          href="/customer/earnings"
          className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm hover:border-[#1790d7]/40 hover:shadow-md transition-all flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 text-[#1790d7]">
            <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 flex items-center justify-center">
              <BarChart3 className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Payouts</span>
          </div>
          <p className="text-sm font-semibold text-[#1790d7] mt-2">View details →</p>
        </Link>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Listing</h2>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-[#1790d7] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#1790d7]/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {listings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl bg-gray-50 border border-gray-200/60 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">No listings yet</p>
              <p className="text-sm text-gray-600 mt-1">Add your first item to start selling.</p>
              <Link href="/customer/sell" className="inline-block mt-4 px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl text-sm font-semibold shadow-sm">
                Add Listing
              </Link>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center text-sm text-gray-600">
            No listings with this status.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="md:hidden divide-y divide-gray-100">
              {filteredListings.map((listing) => {
                const isLocked = !!listing.locked_after_sale;
                const dStatus = listingDisplayStatus(listing);
                const isRemoved = dStatus === "removed" || !!listing.is_removed;
                return (
                  <div key={listing.id} className={`p-4 space-y-3 ${isRemoved ? "opacity-75" : ""}`}>
                    <div className="flex gap-3">
                      <Link href={`/customer/listings/${listing.id}`} className="shrink-0">
                        <img src={getListingThumbnail(listing)} alt={listing.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/customer/listings/${listing.id}`} className="font-semibold text-gray-900 hover:text-[#1790d7] line-clamp-2 text-sm">
                          {listing.name}
                        </Link>
                        <p className="text-sm font-bold text-[#1790d7] mt-0.5">{formatPrice(listing.price)}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusBadgeClass(dStatus)}`}>
                            {dStatus}
                          </span>
                          {listing.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">Featured</span>}
                          {listing.is_hot && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800">Hot</span>}
                        </div>
                      </div>
                      <Link
                        href={`/customer/listings/${listing.id}`}
                        className="shrink-0 inline-flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg self-start"
                        title="View listing"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </Link>
                    </div>
                    {isRemoved && (
                      <button
                        type="button"
                        onClick={() => handleRestore(listing.id)}
                        disabled={restoringId === listing.id}
                        className="px-3 py-2 border border-[#1790d7]/40 text-[#1790d7] rounded-lg text-xs font-medium disabled:opacity-50"
                      >
                        Recover listing
                      </button>
                    )}
                    {!isRemoved && isLocked && (
                      <p className="text-xs text-gray-500">Sold — locked</p>
                    )}
                  </div>
                );
              })}
            </div>

            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-14">Thumb</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase min-w-[140px]">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Promotions
                      </span>
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-20">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredListings.map((listing) => {
                    const isLocked = !!listing.locked_after_sale;
                    const dStatus = listingDisplayStatus(listing);
                    const isRemoved = dStatus === "removed" || !!listing.is_removed;
                    return (
                      <tr key={listing.id} className={`hover:bg-gray-50/50 ${isRemoved ? "opacity-75" : ""}`}>
                        <td className="px-4 py-3">
                          <Link href={`/customer/listings/${listing.id}`}>
                            <img
                              src={getListingThumbnail(listing)}
                              alt={listing.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                            />
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/customer/listings/${listing.id}`}
                            className="font-semibold text-gray-900 hover:text-[#1790d7] line-clamp-2"
                          >
                            {listing.name}
                          </Link>
                          {listing.category?.name && (
                            <p className="text-xs text-gray-500 mt-0.5">{listing.category.name}</p>
                          )}
                          {isLocked && (
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                              Sold — locked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#1790d7] whitespace-nowrap">
                          {formatPrice(listing.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{listing.quantity ?? 0}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass(dStatus)}`}
                          >
                            {dStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isRemoved ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                          <div className="flex flex-col gap-1.5">
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!listing.is_featured}
                                disabled={isLocked || promoSavingId === listing.id || (!eligibility.featured_eligible && !listing.is_featured)}
                                onChange={(e) => togglePromotion(listing, "is_featured", e.target.checked)}
                                className="rounded"
                              />
                              Featured
                              {!eligibility.featured_eligible && !listing.is_featured && (
                                <AlertCircle className="w-3 h-3 text-amber-500" title="Requires package" />
                              )}
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!listing.is_hot}
                                disabled={isLocked || promoSavingId === listing.id || (!eligibility.hot_eligible && !listing.is_hot)}
                                onChange={(e) => togglePromotion(listing, "is_hot", e.target.checked)}
                                className="rounded"
                              />
                              Hot
                              {!eligibility.hot_eligible && !listing.is_hot && (
                                <AlertCircle className="w-3 h-3 text-amber-500" title="Requires package" />
                              )}
                            </label>
                            {(!eligibility.featured_eligible || !eligibility.hot_eligible) && (
                              <Link href={eligibility.promote_url || "/customer/promote"} className="text-[10px] font-medium text-[#1790d7] hover:underline">
                                Get package
                              </Link>
                            )}
                          </div>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/customer/listings/${listing.id}`}
                            className="inline-flex items-center gap-1.5 px-2 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg"
                            title="View listing"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </Link>
                          {isRemoved && (
                            <div className="mt-1 space-y-1">
                              <p className="text-[10px] text-gray-500 max-w-[140px]">
                                Hidden from shop · recover anytime
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRestore(listing.id)}
                                disabled={restoringId === listing.id}
                                className="px-2 py-1 text-xs font-medium text-[#1790d7] border border-[#1790d7]/30 rounded-lg hover:bg-[#1790d7]/5 disabled:opacity-50"
                              >
                                Recover
                              </button>
                            </div>
                          )}
                          {!isRemoved && isLocked && (
                            <p className="text-[10px] text-gray-500 mt-1 max-w-[140px]">
                              Sold — become a private seller to manage.
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {orders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Orders for Your Products</h2>
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href={`/customer/listings/orders/${o.id}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/30 hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{o.order_number}</p>
                  <p className="text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1790d7]">
                    {formatPrice(Math.max(0, (o.seller_subtotal ?? 0) - (o.seller_discount_allocated ?? 0)))}
                  </p>
                  {(o.seller_discount_allocated != null && parseFloat(o.seller_discount_allocated) > 0) && (
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {o.coupon_code ? `Coupon (${o.coupon_code}): −${formatPrice(o.seller_discount_allocated)}` : `Discount: −${formatPrice(o.seller_discount_allocated)}`}
                    </p>
                  )}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    ["completed", "delivered"].includes(o.seller_display_status ?? o.status) ? "bg-emerald-100 text-emerald-700" :
                    (o.seller_display_status ?? o.status) === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {(o.seller_display_status ?? o.status)?.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {orders.length > 5 && (
            <Link href="/customer/listings/orders" className="block mt-3 text-sm font-medium text-[#1790d7] hover:underline">
              View all orders →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <MyListingsContent />
    </Suspense>
  );
}
