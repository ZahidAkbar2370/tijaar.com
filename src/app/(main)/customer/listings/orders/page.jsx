"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { privateListingsApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import PageHero from "@/components/customer/PageHero";

export default function ListingsOrdersPage() {
  const { formatPrice } = useMarket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    privateListingsApi.orders()
      .then((r) => setOrders(r.orders || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      <PageHero
        title="Selling Orders"
        description="Orders buyers placed on your listings. Approve, add courier tracking, update status, and handle disputes."
        illustration="orders"
        guide="Open an order to manage fulfillment as the seller."
      />

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 rounded-2xl bg-gray-50 border border-gray-200/60 text-center">
          <p className="text-gray-600">No orders for your listings yet.</p>
          <Link href="/customer/listings" className="inline-block mt-4 text-[#1790d7] font-medium hover:underline">
            Back to My Listings
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {orders.map((o) => (
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
      )}
    </div>
  );
}
