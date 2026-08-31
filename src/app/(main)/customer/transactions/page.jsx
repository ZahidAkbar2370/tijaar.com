"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  History,
  Download,
  Filter,
  ChevronDown,
  ArrowUpRight,
  ArrowDownLeft,
  ShoppingBag,
} from "lucide-react";
import { walletApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";
import { useSnackbar } from "@/context/SnackbarContext";
import { useMarket } from "@/context/MarketContext";
import * as XLSX from "xlsx";
import ProtectedRoute from "@/components/ProtectedRoute";
import { walletTransactionTitle, isWalletCredit } from "@/lib/walletTransactionLabels";

const PER_PAGE = 10;

const STATUS_CHIPS = [
  { value: "", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "success", label: "Success" },
  { value: "failed", label: "Failed" },
];

const PAID_THROUGH_OPTIONS = [
  { value: "", label: "All methods" },
  { value: "Wallet", label: "Wallet" },
  { value: "JazzCash", label: "JazzCash" },
  { value: "Easypaisa", label: "Easypaisa" },
  { value: "Stripe", label: "Stripe" },
  { value: "PayPal", label: "PayPal" },
];

const TYPE_OPTIONS = [
  { value: "", label: "All types" },
  { value: "order_payment", label: "Order Payment" },
  { value: "deposit", label: "Payment Added to Wallet" },
  { value: "refund", label: "Order Refunded" },
  { value: "listing_fee", label: "Payment for Listing Fee" },
  { value: "package_purchase", label: "Payment for Product Promotion" },
  { value: "order_reject_penalty", label: "Order Reject Penalty" },
];

const typeLabel = (t) => walletTransactionTitle(t.type, t.amount);
const isCredit = (type, amount) => isWalletCredit(type, amount);

const statusBadge = (status) => {
  const s = String(status || "success").toLowerCase();
  if (s === "pending") return { label: "Pending", className: "bg-amber-100 text-amber-800 border border-amber-200" };
  if (s === "failed") return { label: "Failed", className: "bg-red-100 text-red-700 border border-red-200" };
  return { label: "Success", className: "bg-emerald-100 text-emerald-800 border border-emerald-200" };
};

const pillClass =
  "inline-flex items-center px-2.5 py-1 text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200 rounded-[10px]";

export default function CustomerTransactionsPage() {
  const { showSuccess, showError } = useSnackbar();
  const { formatPrice } = useMarket();
  const [transactions, setTransactions] = useState([]);
  const [balance, setBalance] = useState(null);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    payment_method: "",
    date_from: "",
    date_to: "",
  });

  useEffect(() => {
    setPage(1);
  }, [filters.type, filters.status, filters.payment_method, filters.date_from, filters.date_to]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [balRes, txnRes] = await Promise.all([
        walletApi.balance(),
        walletApi.transactions({
          page: String(page),
          per_page: String(PER_PAGE),
          sort: "status",
          ...(filters.type && { type: filters.type }),
          ...(filters.status && { status: filters.status }),
          ...(filters.payment_method && { payment_method: filters.payment_method }),
          ...(filters.date_from && { date_from: filters.date_from }),
          ...(filters.date_to && { date_to: filters.date_to }),
        }),
      ]);
      setBalance(balRes.balance);
      setTransactions(txnRes.transactions || []);
      setPagination(
        txnRes.pagination || { current_page: page, last_page: 1, total: (txnRes.transactions || []).length }
      );
    } catch {
      setTransactions([]);
      setPagination({ current_page: 1, last_page: 1, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [filters, page]);

  useEffect(() => {
    load();
  }, [load]);

  const handleExport = async () => {
    try {
      const res = await walletApi.export({
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.payment_method && { payment_method: filters.payment_method }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });
      const rows = res.rows || [];
      const cols = res.columns || [];
      const ws = XLSX.utils.json_to_sheet(rows, { header: cols });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Buyer payments");
      XLSX.writeFile(wb, "wallet-transactions.xlsx");
      showSuccess?.("Exported to Excel");
    } catch (e) {
      showError?.(e?.message || "Export failed");
    }
  };

  return (
    <ProtectedRoute requiredRole="customer">
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <PageHero
            title="Transactions"
            description="Your wallet history: order payments, deposits, refunds, and fees. Records are permanent and cannot be deleted."
            illustration="earnings"
            guide="Filter by type, status, or payment method. 10 transactions per page."
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((p) => !p)}
              className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Filter className="w-4 h-4" />
              More filters
              <ChevronDown className={`w-4 h-4 ${filtersOpen ? "rotate-180" : ""}`} />
            </button>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2.5 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {balance != null && (
          <div className="rounded-2xl border border-amber-200 bg-gradient-to-br from-amber-500 to-amber-600 p-5 text-white shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/90">Wallet balance</p>
            <p className="text-2xl font-bold mt-1">{formatPrice(balance)}</p>
          </div>
        )}

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {STATUS_CHIPS.map((chip) => (
              <button
                key={chip.value || "all"}
                type="button"
                onClick={() => setFilters((p) => ({ ...p, status: chip.value }))}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  filters.status === chip.value
                    ? "bg-[#1790d7] text-white shadow-sm"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#1790d7]/40"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 shrink-0">
            <span className="whitespace-nowrap">Type</span>
            <select
              value={filters.type}
              onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/30"
            >
              {TYPE_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-600 shrink-0">
            <span className="whitespace-nowrap">Paid through</span>
            <select
              value={filters.payment_method}
              onChange={(e) => setFilters((p) => ({ ...p, payment_method: e.target.value }))}
              className="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/30"
            >
              {PAID_THROUGH_OPTIONS.map((o) => (
                <option key={o.value || "all"} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {filtersOpen && (
          <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              />
            </div>
          </div>
        )}

        {!loading && pagination.total > 0 && (
          <p className="text-sm text-gray-500">
            {pagination.total} transaction{pagination.total !== 1 ? "s" : ""}
            {filters.type ? ` · ${TYPE_OPTIONS.find((c) => c.value === filters.type)?.label}` : ""}
            {filters.payment_method ? ` · ${filters.payment_method}` : ""}
          </p>
        )}

        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-10 h-10 border-2 border-[#1790d7] border-t-transparent rounded-full mx-auto" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="font-medium text-gray-800">
                {filters.type || filters.status || filters.payment_method || filters.date_from || filters.date_to
                  ? "No transactions match these filters"
                  : "No wallet transactions yet"}
              </p>
              <p className="text-sm text-gray-500 mt-1 max-w-sm mx-auto">
                Order payments, wallet deposits, and order refunds appear here automatically.
              </p>
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 mt-5 px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm font-medium hover:bg-[#1277b8]"
              >
                <ShoppingBag className="w-4 h-4" />
                Browse Shop
              </Link>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {transactions.map((t) => {
                const badge = statusBadge(t.status);
                const rawAmount = parseFloat(t.amount || 0);
                const amount = Math.abs(rawAmount);
                const credit = isCredit(t.type, rawAmount);
                const dateLabel = t.created_at
                  ? new Date(t.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })
                  : "—";

                return (
                  <li key={t.id} className="px-4 sm:px-5 py-4 hover:bg-gray-50/60">
                    <div className="flex flex-col sm:flex-row sm:items-start gap-3 sm:gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] ${credit ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"}`}>
                        {credit ? (
                          <ArrowDownLeft className="w-5 h-5" />
                        ) : (
                          <ArrowUpRight className="w-5 h-5" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900">
                              {t.title || typeLabel(t)}
                              {t.order_number ? (
                                <span className="text-gray-500 font-normal"> · #{t.order_number}</span>
                              ) : null}
                            </p>
                            {t.description && t.description !== (t.title || typeLabel(t)) ? (
                              <p className="text-sm text-gray-500 mt-0.5 line-clamp-2">{t.description}</p>
                            ) : null}
                            <div className="mt-2 flex flex-wrap items-center gap-2">
                              <span className={pillClass}>
                                <span className="text-gray-500 mr-1">Type</span>
                                {t.title || typeLabel(t)}
                              </span>
                              <span className={pillClass}>
                                <span className="text-gray-500 mr-1">Date</span>
                                {dateLabel}
                              </span>
                              <span className={pillClass}>
                                <span className="text-gray-500 mr-1">Paid through</span>
                                {t.payment_method || "—"}
                              </span>
                              <span
                                className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-[10px] ${badge.className}`}
                              >
                                <span className="opacity-70 mr-1">Payment status</span>
                                {badge.label}
                              </span>
                            </div>
                          </div>
                          <p className={`text-base font-semibold tabular-nums sm:text-right shrink-0 ${credit ? "text-emerald-600" : "text-red-600"}`}>
                            {credit ? "+ " : "− "}{formatPrice(amount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {!loading && pagination.last_page > 1 && (
          <div className="flex items-center justify-center gap-2">
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
      </div>
    </ProtectedRoute>
  );
}
