"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { Package, Eye, Filter } from "lucide-react";
import { sellerOrdersApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import PageHero from "@/components/customer/PageHero";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "pending", label: "Pending" },
  { value: "paid", label: "Paid" },
  { value: "processing", label: "Processing" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

export default function VendorOrdersPage() {
  const { formatPrice } = useMarket();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: "",
    order_number: "",
    date_from: "",
    date_to: "",
    page: 1,
  });

  useEffect(() => {
    setLoading(true);
    const params = { page: filters.page };
    if (filters.status) params.status = filters.status;
    if (filters.order_number?.trim()) params.order_number = filters.order_number.trim();
    if (filters.date_from) params.date_from = filters.date_from;
    if (filters.date_to) params.date_to = filters.date_to;
    sellerOrdersApi
      .list(params)
      .then((res) => {
        setOrders(res.orders || []);
        setPagination(res.pagination || { current_page: 1, last_page: 1, total: 0 });
      })
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [filters.page, filters.status, filters.order_number, filters.date_from, filters.date_to]);

  const applyFilters = (e) => {
    e?.preventDefault?.();
    setFilters((f) => ({ ...f, page: 1 }));
  };

  return (
    <ProtectedRoute requiredRole="seller">
    <div className="space-y-6">
      <PageHero
        title="Orders"
        description="View and manage orders for your products. Filter by date, status, or order ID. Update status and add tracking from order detail."
        illustration="orders"
        guide="Tip: Use filters to find orders quickly. Your total shows only your items when an order has multiple sellers."
      />

      {/* Filters (Issue 11: date, status, order ID) */}
      <section aria-label="Order filters" className="bg-white rounded-xl border border-gray-200/80 shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Filter className="w-4 h-4 text-amber-600" />
            Filter orders
          </h2>
          <p className="text-xs text-gray-500 mt-0.5">Filter by status, order number, or date range. Apply to search.</p>
        </div>
        <form onSubmit={applyFilters} className="p-4 flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm min-w-[140px]"
          >
            {STATUS_OPTIONS.map((opt) => (
              <option key={opt.value || "all"} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Order ID / Number</label>
          <input
            type="text"
            value={filters.order_number}
            onChange={(e) => setFilters((f) => ({ ...f, order_number: e.target.value }))}
            placeholder="e.g. TJR..."
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm w-40"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date from</label>
          <input
            type="date"
            value={filters.date_from}
            onChange={(e) => setFilters((f) => ({ ...f, date_from: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-500 mb-1">Date to</label>
          <input
            type="date"
            value={filters.date_to}
            onChange={(e) => setFilters((f) => ({ ...f, date_to: e.target.value, page: 1 }))}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
        </div>
        <button type="submit" className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600">
          Apply
        </button>
        {(filters.status || filters.order_number || filters.date_from || filters.date_to) && (
          <button
            type="button"
            onClick={() => setFilters((f) => ({ ...f, status: "", order_number: "", date_from: "", date_to: "", page: 1 }))}
            className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
          >
            Clear filters
          </button>
        )}
        </form>
      </section>

      {!loading && orders.length > 0 && (
        <p className="text-sm text-gray-600">
          Showing {orders.length} order{orders.length !== 1 ? "s" : ""}
          {pagination.total > 0 && ` (${pagination.total} total)`}
          {(filters.status || filters.order_number || filters.date_from || filters.date_to) && " matching filters"}
        </p>
      )}

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-48 bg-gray-100 rounded" />
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6 p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center lg:text-left">
          <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-cyan-100 flex items-center justify-center">
            <Package className="w-16 h-16 text-cyan-500" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">No orders yet</h2>
            <p className="text-sm text-gray-600 mt-1">Orders for your products will appear here when customers purchase. Try adjusting filters or promote your products to increase sales.</p>
            <Link href="/seller/products" className="inline-block mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
              View Products
            </Link>
          </div>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Order</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Customer</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Your total</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {orders.map((o) => (
                    <tr key={o.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 font-mono font-medium">{o.order_number}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">
                        <span className="block font-medium text-gray-900">{o.user?.name ?? "—"}</span>
                        {o.user?.email && <span className="block text-xs text-gray-500">{o.user.email}</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-amber-600">
                          {formatPrice(Math.max(0, (o.seller_subtotal ?? 0) - (o.seller_discount_allocated ?? 0)))}
                        </div>
                        {(o.seller_discount_allocated != null && parseFloat(o.seller_discount_allocated) > 0) && (
                          <div className="text-xs text-emerald-600 mt-0.5">
                            Coupon{o.coupon_code ? ` (${o.coupon_code})` : ""}: −{formatPrice(o.seller_discount_allocated)}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium capitalize ${
                            ["completed", "delivered"].includes(o.seller_display_status ?? o.status) ? "bg-emerald-100 text-emerald-700" :
                            (o.seller_display_status ?? o.status) === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {(o.seller_display_status ?? o.status)?.replace(/_/g, " ")}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link href={`/seller/orders/${o.id}`} className="p-2 rounded-lg text-amber-600 hover:bg-amber-50 inline-flex">
                          <Eye className="w-5 h-5" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, page: Math.max(1, f.page - 1) }))}
                disabled={filters.page <= 1}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">Page {pagination.current_page} of {pagination.last_page}</span>
              <button
                type="button"
                onClick={() => setFilters((f) => ({ ...f, page: Math.min(pagination.last_page, f.page + 1) }))}
                disabled={filters.page >= pagination.last_page}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
    </ProtectedRoute>
  );
}
