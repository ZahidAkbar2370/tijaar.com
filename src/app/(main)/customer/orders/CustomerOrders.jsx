"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { orderApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import PageHero from "@/components/customer/PageHero";
import { Package, Eye, SlidersHorizontal } from "lucide-react";
import { TableSkeleton } from "@/components/common/PageSkeleton";

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "processing", label: "Processing" },
  { value: "approved", label: "Approved" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "completed", label: "Completed" },
  { value: "cancellation_requested", label: "Cancel requested" },
  { value: "cancelled", label: "Cancelled" },
  { value: "refunded", label: "Refunded" },
];

const SORT_OPTIONS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "status", label: "By status" },
];

function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (["completed", "delivered"].includes(s)) return "bg-emerald-100 text-emerald-800";
  if (s === "shipped" || s === "approved") return "bg-sky-100 text-sky-800";
  if (s === "cancelled") return "bg-red-100 text-red-700";
  if (s === "refunded") return "bg-slate-100 text-slate-700";
  if (s === "cancellation_requested") return "bg-orange-100 text-orange-800";
  return "bg-amber-100 text-amber-800";
}

function paymentStatusTone(status) {
  const s = String(status || "").toLowerCase();
  if (["paid", "partial_paid"].includes(s)) return "bg-emerald-100 text-emerald-800";
  if (s === "failed") return "bg-red-100 text-red-700";
  if (s === "refunded") return "bg-slate-100 text-slate-700";
  return "bg-amber-100 text-amber-800";
}

function formatLabel(value) {
  if (!value) return "—";
  return String(value).replace(/_/g, " ");
}

function paidByLabel(method) {
  const key = String(method || "").toLowerCase().trim();
  if (!key) return "—";
  return (
    {
      cod: "COD",
      wallet: "Wallet",
      jazzcash: "JazzCash",
      jazzcash_partial: "JazzCash (partial)",
      easypaisa: "Easypaisa",
      stripe: "Card (Stripe)",
      paypal: "PayPal",
    }[key] || formatLabel(key)
  );
}

function formatOrderDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

function MetaCell({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400 mb-1">{label}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}

export default function CustomerOrders() {
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("newest");
  const { formatPrice } = useMarket();

  useEffect(() => {
    setPage(1);
  }, [status, sort]);

  useEffect(() => {
    setLoading(true);
    const params = { sort };
    if (status && status !== "all") params.status = status;

    orderApi
      .list(page, params)
      .then((res) => {
        setOrders(res.orders || []);
        setPagination(res.pagination || { current_page: 1, last_page: 1, total: 0 });
      })
      .catch(() => {
        setOrders([]);
        setPagination({ current_page: 1, last_page: 1, total: 0 });
      })
      .finally(() => setLoading(false));
  }, [page, status, sort]);

  const orderStatus = (o) => o.complete_order_status || o.status;

  return (
    <div className="space-y-6">
      <PageHero
        title="My Orders"
        description="Orders you purchased from sellers. Track delivery, cancel when allowed, or open an order for full details."
        illustration="orders"
        guide="Filter by status or sort the list. Sales from your own listings are under Seller → Selling Orders."
      />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scrollbar-thin">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setStatus(f.value)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                status === f.value
                  ? "bg-[#1790d7] text-white shadow-sm"
                  : "bg-white border border-gray-200 text-gray-600 hover:border-[#1790d7]/40 hover:text-[#1790d7]"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <label className="inline-flex items-center gap-2 text-sm text-gray-600 shrink-0">
          <SlidersHorizontal className="w-4 h-4 text-gray-400" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/30"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {!loading && pagination.total > 0 && (
        <p className="text-sm text-gray-500">
          {pagination.total} purchase{pagination.total !== 1 ? "s" : ""}
          {status !== "all" ? ` · ${STATUS_FILTERS.find((f) => f.value === status)?.label}` : ""}
        </p>
      )}

      {loading ? (
        <TableSkeleton rows={5} />
      ) : orders.length === 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6 p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center lg:text-left">
          <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-gray-200/60 flex items-center justify-center">
            <Package className="w-14 h-14 text-gray-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">
              {status === "all" ? "No purchases yet" : "No orders with this status"}
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              {status === "all"
                ? "Orders you place with sellers will show up here."
                : "Try another status filter, or browse the shop for something new."}
            </p>
            <Link
              href="/shop"
              className="inline-block mt-4 px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm font-medium hover:bg-[#1277b8] transition-colors"
            >
              Browse Shop
            </Link>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden md:block bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            <table className="w-full">
              <thead className="bg-gray-50/80 border-b border-gray-100">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Order
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Order status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Payment status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Paid by
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Date of order
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Price
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {orders.map((o) => {
                  const statusVal = orderStatus(o);
                  return (
                    <tr key={o.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-4">
                        <p className="font-semibold text-gray-900">{o.order_number}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusTone(statusVal)}`}
                        >
                          {formatLabel(statusVal)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${paymentStatusTone(o.payment_status)}`}
                        >
                          {formatLabel(o.payment_status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {paidByLabel(o.payment_method)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700 whitespace-nowrap">
                        {formatOrderDate(o.created_at)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="text-sm font-semibold text-[#1790d7] tabular-nums">
                          {formatPrice(o.total || 0)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <Link
                          href={`/customer/orders/${o.id}`}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1790d7] text-white text-sm font-medium hover:bg-[#1277b8] transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          View Detail
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {orders.map((o) => {
              const statusVal = orderStatus(o);
              return (
                <div
                  key={o.id}
                  className="rounded-2xl border border-gray-200/80 bg-white p-4 shadow-sm space-y-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">Order</p>
                      <p className="font-semibold text-gray-900 mt-0.5">{o.order_number}</p>
                    </div>
                    <span className="text-base font-semibold text-[#1790d7] tabular-nums shrink-0">
                      {formatPrice(o.total || 0)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <MetaCell label="Order status">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusTone(statusVal)}`}
                      >
                        {formatLabel(statusVal)}
                      </span>
                    </MetaCell>
                    <MetaCell label="Payment status">
                      <span
                        className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${paymentStatusTone(o.payment_status)}`}
                      >
                        {formatLabel(o.payment_status)}
                      </span>
                    </MetaCell>
                    <MetaCell label="Paid by">
                      <span className="font-medium">{paidByLabel(o.payment_method)}</span>
                    </MetaCell>
                    <MetaCell label="Date of order">
                      <span className="font-medium">{formatOrderDate(o.created_at)}</span>
                    </MetaCell>
                  </div>

                  <Link
                    href={`/customer/orders/${o.id}`}
                    className="flex w-full items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1790d7] text-white text-sm font-semibold hover:bg-[#1277b8] transition-colors"
                  >
                    <Eye className="w-4 h-4" />
                    View Detail
                  </Link>
                </div>
              );
            })}
          </div>

          {pagination.last_page > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600">
                Page {pagination.current_page} of {pagination.last_page}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                disabled={page >= pagination.last_page}
                className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium disabled:opacity-50 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
