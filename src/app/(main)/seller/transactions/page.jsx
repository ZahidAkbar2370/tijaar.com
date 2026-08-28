"use client";

import { useState, useEffect, useCallback } from "react";
import {
  History,
  Download,
  Filter,
  ChevronDown,
  Settings2,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Package,
} from "lucide-react";
import { walletApi, payoutsApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";
import { useSnackbar } from "@/context/SnackbarContext";
import * as XLSX from "xlsx";
import ProtectedRoute from "@/components/ProtectedRoute";

const ALL_COLUMNS = [
  { key: "id", label: "ID", default: false },
  { key: "type", label: "Type", default: true },
  { key: "amount", label: "Amount", default: true },
  { key: "status", label: "Status", default: true },
  { key: "payment_method", label: "Payment Method", default: true },
  { key: "balance_after", label: "Balance After", default: true },
  { key: "description", label: "Description", default: true },
  { key: "reference_type", label: "Reference Type", default: false },
  { key: "created_at", label: "Date", default: true },
];

const statusBadge = (status) => {
  const s = String(status || "success").toLowerCase();
  if (s === "pending") return { label: "Pending", className: "bg-amber-100 text-amber-800" };
  if (s === "failed") return { label: "Failed", className: "bg-red-100 text-red-700" };
  return { label: "Success", className: "bg-emerald-100 text-emerald-700" };
};

const TABS = { wallet: "wallet", earnings: "earnings" };

export default function VendorTransactionsPage() {
  const { showSuccess, showError } = useSnackbar();
  const [activeTab, setActiveTab] = useState(TABS.wallet);
  const [transactions, setTransactions] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [colOpen, setColOpen] = useState(false);
  const [visibleCols, setVisibleCols] = useState(() =>
    ALL_COLUMNS.filter((c) => c.default).map((c) => c.key)
  );
  const [filters, setFilters] = useState({
    type: "",
    status: "",
    date_from: "",
    date_to: "",
  });

  const load = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === TABS.wallet) {
        const [balRes, txnRes] = await Promise.all([
          walletApi.balance(),
          walletApi.transactions({
            ...(filters.type && { type: filters.type }),
            ...(filters.status && { status: filters.status }),
            ...(filters.date_from && { date_from: filters.date_from }),
            ...(filters.date_to && { date_to: filters.date_to }),
            per_page: 100,
          }),
        ]);
        setBalance(balRes.balance);
        setTransactions(txnRes.transactions || []);
        setEarnings(null);
      } else {
        const earnRes = await payoutsApi.earnings();
        setEarnings(earnRes.earnings || null);
        setTransactions([]);
        setBalance(null);
      }
    } catch {
      setTransactions([]);
      setEarnings(null);
    } finally {
      setLoading(false);
    }
  }, [filters, activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const toggleCol = (key) => {
    setVisibleCols((p) =>
      p.includes(key) ? p.filter((k) => k !== key) : [...p, key]
    );
  };

  const handleExport = async () => {
    try {
      const res = await walletApi.export({
        ...(filters.type && { type: filters.type }),
        ...(filters.status && { status: filters.status }),
        ...(filters.date_from && { date_from: filters.date_from }),
        ...(filters.date_to && { date_to: filters.date_to }),
      });
      const rows = res.rows || [];
      const cols = res.columns || [];
      const ws = XLSX.utils.json_to_sheet(rows, { header: cols });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Transactions");
      XLSX.writeFile(wb, "transactions.xlsx");
      showSuccess?.("Exported to Excel");
    } catch (e) {
      showError?.(e?.message || "Export failed");
    }
  };

  const isCredit = (type, amount) => {
    const t = String(type || "").toLowerCase();
    if (["credit", "refund", "deposit", "earnings_credit", "payout_refund"].includes(t)) return true;
    if (t === "order_payment" && parseFloat(amount || 0) > 0) return true;
    return parseFloat(amount || 0) > 0;
  };
  const typeLabel = (type) => {
    const t = String(type || "").toLowerCase();
    if (t === "package_purchase") return "Package subscription";
    if (t === "order_payment") return "Order payment";
    if (t === "earnings_credit") return "Earnings to wallet";
    if (t === "deposit") return "Wallet deposit";
    if (t === "listing_fee") return "Listing fee";
    if (t === "order_reject_penalty") return "Order reject penalty";
    if (t === "refund") return "Refund";
    if (t === "deposit") return "Wallet deposit";
    if (t === "payout_refund") return "Payout rejected – returned";
    if (t === "payout") return "Payout requested";
    return type;
  };

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHero
            title="Transaction History"
            description="View your wallet transactions and earnings from sales. Filter, export, and track your income."
            illustration="earnings"
            guide="Tip: Use filters to find specific transactions. Export to Excel for accounting or tax records."
          />
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveTab(TABS.wallet)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                activeTab === TABS.wallet ? "bg-amber-500 text-white" : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <History className="w-4 h-4" /> Wallet
            </button>
            <button
              onClick={() => setActiveTab(TABS.earnings)}
              className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 ${
                activeTab === TABS.earnings ? "bg-amber-500 text-white" : "border border-gray-200 hover:bg-gray-50"
              }`}
            >
              <DollarSign className="w-4 h-4" /> Earnings
            </button>
            <button onClick={() => setFiltersOpen((p) => !p)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <Filter className="w-4 h-4" /> Filters <ChevronDown className={`w-4 h-4 ${filtersOpen ? "rotate-180" : ""}`} />
            </button>
            <button onClick={() => setColOpen((p) => !p)} className="px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2">
              <Settings2 className="w-4 h-4" /> Columns
            </button>
            <button onClick={handleExport} className="px-4 py-2.5 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-medium hover:bg-emerald-50 flex items-center gap-2">
              <Download className="w-4 h-4" /> Export
            </button>
          </div>
        </div>

        {activeTab === TABS.wallet && filtersOpen && (
          <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
              <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                <option value="">All</option>
                <option value="credit">Credit</option>
                <option value="debit">Debit</option>
                <option value="refund">Refund</option>
                <option value="order_payment">Order Payment</option>
                <option value="package_purchase">Package subscription</option>
                <option value="deposit">Wallet deposit</option>
                <option value="listing_fee">Listing fee</option>
                <option value="order_reject_penalty">Order reject penalty</option>
                <option value="refund">Refund</option>
                <option value="deposit">Wallet deposit</option>
                <option value="payout">Payout</option>
                <option value="payout_refund">Payout rejected (returned)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select value={filters.status} onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                <option value="">All</option>
                <option value="success">Success</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input type="date" value={filters.date_from} onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input type="date" value={filters.date_to} onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value }))} className="px-3 py-2 rounded-lg border border-gray-200 text-sm" />
            </div>
          </div>
        )}

        {activeTab === TABS.wallet && colOpen && (
          <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2">
            {ALL_COLUMNS.map((c) => (
              <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border cursor-pointer text-sm">
                <input type="checkbox" checked={visibleCols.includes(c.key)} onChange={() => toggleCol(c.key)} className="rounded" />
                {c.label}
              </label>
            ))}
          </div>
        )}

        {activeTab === TABS.wallet && balance != null && (
          <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl p-4 text-white">
            <p className="text-sm opacity-90">Current Balance</p>
            <p className="text-2xl font-bold">{Number(balance).toLocaleString()} PKR</p>
          </div>
        )}

        {activeTab === TABS.earnings && earnings && (
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            {earnings.gross_subtotal != null && Number(earnings.gross_subtotal) > 0 && (
              <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
                <p className="text-xs font-medium text-gray-600">Gross Sales</p>
                <p className="text-lg font-bold text-gray-700">{Number(earnings.gross_subtotal || 0).toLocaleString()} PKR</p>
              </div>
            )}
            {(earnings.discount_total != null && Number(earnings.discount_total) > 0) && (
              <div className="bg-emerald-50 rounded-xl p-4 border border-emerald-100">
                <p className="text-xs font-medium text-emerald-600">Coupon Discount</p>
                <p className="text-lg font-bold text-emerald-700">−{Number(earnings.discount_total || 0).toLocaleString()} PKR</p>
              </div>
            )}
            <div className="bg-cyan-50 rounded-xl p-4 border border-cyan-100">
              <p className="text-xs font-medium text-cyan-600">After Discount</p>
              <p className="text-lg font-bold text-cyan-700">{Number(earnings.total || 0).toLocaleString()} PKR</p>
            </div>
            <div className="bg-amber-50 rounded-xl p-4 border border-amber-100">
              <p className="text-xs font-medium text-amber-600">Commission</p>
              <p className="text-lg font-bold text-amber-700">−{Number(earnings.commission || 0).toLocaleString()} PKR</p>
            </div>
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
              <p className="text-xs font-medium text-blue-600">Net Earnings</p>
              <p className="text-lg font-bold text-blue-700">{Number(earnings.net || 0).toLocaleString()} PKR</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-medium text-gray-600">Already Paid</p>
              <p className="text-lg font-bold text-gray-700">{Number(earnings.already_paid || 0).toLocaleString()} PKR</p>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin w-10 h-10 border-2 border-amber-500 border-t-transparent rounded-full mx-auto" />
            </div>
          ) : activeTab === TABS.earnings ? (
            !earnings ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No earnings data.</p>
              </div>
            ) : (earnings.items || []).length === 0 ? (
              <div className="p-12 text-center">
                <DollarSign className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No sales yet. Earnings appear here when orders are paid, shipped, or delivered.</p>
                <p className="text-sm text-gray-400 mt-2">Request a payout from the Earnings & Payouts page when you reach the minimum threshold.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Order</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Qty × Price</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Subtotal</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Discount</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Commission</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Net</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(earnings.items || []).map((i) => (
                      <tr key={i.order_item_id} className="hover:bg-gray-50/50">
                        <td className="px-4 py-3 text-sm text-gray-600">#{i.order_id}</td>
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">{i.product_name}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{i.quantity} × {Number(i.price).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{Number(i.subtotal).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-emerald-600">{(i.discount_allocated != null && Number(i.discount_allocated) > 0) ? `−${Number(i.discount_allocated).toLocaleString()}` : "—"}</td>
                        <td className="px-4 py-3 text-sm text-amber-600">−{Number(i.commission_amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm font-medium text-emerald-600">+{Number(i.net_amount).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          ) : transactions.length === 0 ? (
            <div className="p-12 text-center">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No wallet transactions yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    {visibleCols.includes("id") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">ID</th>}
                    {visibleCols.includes("type") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Type</th>}
                    {visibleCols.includes("amount") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Amount</th>}
                    {visibleCols.includes("status") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Status</th>}
                    {visibleCols.includes("payment_method") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Payment Method</th>}
                    {visibleCols.includes("balance_after") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Balance</th>}
                    {visibleCols.includes("description") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Description</th>}
                    {visibleCols.includes("reference_type") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Reference</th>}
                    {visibleCols.includes("created_at") && <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Date</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {transactions.map((t) => {
                    const badge = statusBadge(t.status);
                    return (
                    <tr key={t.id} className="hover:bg-gray-50/50">
                      {visibleCols.includes("id") && <td className="px-4 py-3 text-sm text-gray-500">{t.id}</td>}
                      {visibleCols.includes("type") && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium ${isCredit(t.type, t.amount) ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"}`}>
                            {isCredit(t.type, t.amount) ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                            {typeLabel(t.type)}
                          </span>
                        </td>
                      )}
                      {visibleCols.includes("amount") && (
                        <td className={`px-4 py-3 font-medium ${isCredit(t.type, t.amount) ? "text-emerald-600" : "text-red-600"}`}>
                          {isCredit(t.type, t.amount) ? "+" : "-"} {Math.abs(parseFloat(t.amount || 0)).toLocaleString()}
                        </td>
                      )}
                      {visibleCols.includes("status") && (
                        <td className="px-4 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${badge.className}`}>
                            {badge.label}
                          </span>
                        </td>
                      )}
                      {visibleCols.includes("payment_method") && (
                        <td className="px-4 py-3 text-sm text-gray-700">{t.payment_method || "—"}</td>
                      )}
                      {visibleCols.includes("balance_after") && <td className="px-4 py-3 text-sm">{t.balance_after != null ? Number(t.balance_after).toLocaleString() : "—"}</td>}
                      {visibleCols.includes("description") && <td className="px-4 py-3 text-sm text-gray-600">{t.description || "—"}</td>}
                      {visibleCols.includes("reference_type") && <td className="px-4 py-3 text-sm text-gray-500">{t.reference_type || "—"}</td>}
                      {visibleCols.includes("created_at") && <td className="px-4 py-3 text-sm text-gray-500">{t.created_at ? new Date(t.created_at).toLocaleString() : "—"}</td>}
                    </tr>
                  );})}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}
