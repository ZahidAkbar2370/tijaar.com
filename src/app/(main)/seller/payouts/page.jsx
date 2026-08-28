"use client";

import { useState, useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { payoutsApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { DollarSign, TrendingUp, Percent, Wallet, History } from "lucide-react";
import PageHero from "@/components/customer/PageHero";

function VendorPayoutsContent() {
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const [earnings, setEarnings] = useState(null);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [amountInput, setAmountInput] = useState("");

  const load = () => {
    setLoading(true);
    Promise.all([payoutsApi.earnings(), payoutsApi.history()])
      .then(([earnRes, histRes]) => {
        setEarnings(earnRes.earnings);
        setPayouts(histRes.payouts || []);
      })
      .catch(() => {
        setEarnings(null);
        setPayouts([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => load(), []);

  const handleRequest = () => {
    const amount = amountInput.trim() === "" ? null : parseFloat(amountInput);
    if (amount != null && (amount < min || amount > net)) return;
    setRequesting(true);
    payoutsApi
      .request("bank", amount)
      .then(() => {
        showSuccess?.("Payout request submitted!");
        setAmountInput("");
        load();
      })
      .catch((err) => showError?.(err?.message || "Failed to request payout"))
      .finally(() => setRequesting(false));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-6">
          <div className="h-10 bg-gray-200 rounded w-1/3" />
          <div className="grid grid-cols-3 gap-4">
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-24 bg-gray-100 rounded-xl" />
            <div className="h-24 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  const net = earnings?.net ?? 0;
  const min = earnings?.min_threshold ?? 1000;
  const amountNum = amountInput.trim() === "" ? null : parseFloat(amountInput);
  const amountValid = amountNum == null ? true : (!Number.isNaN(amountNum) && amountNum >= min && amountNum <= net);
  const canRequest = net >= min && (earnings?.items?.length ?? 0) > 0 && amountValid;

  return (
    <div className="space-y-6">
      <PageHero
        title="Earnings & Payouts"
        description="Track sales, commissions, and net earnings. Request payouts once you reach the minimum threshold. Payouts are processed to your registered bank account."
        illustration="payouts"
        guide="Tip: Earnings update when orders are paid. Request payout when balance meets the minimum; ensure bank details are set in Profile."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">{(earnings?.discount_total != null && Number(earnings.discount_total) > 0) ? "Sales (after coupon)" : "Total Sales"}</span>
          </div>
          <p className="text-2xl font-bold text-gray-900">{formatPrice(earnings?.total ?? 0)}</p>
        </div>
        {(earnings?.discount_total != null && Number(earnings.discount_total) > 0) && (
          <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Percent className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-sm font-medium text-gray-500">Coupon Discount</span>
            </div>
            <p className="text-2xl font-bold text-emerald-600">− {formatPrice(earnings.discount_total)}</p>
          </div>
        )}
        <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
              <Percent className="w-5 h-5 text-red-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Commission</span>
          </div>
          <p className="text-2xl font-bold text-red-600">− {formatPrice(earnings?.commission ?? 0)}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-gray-200/80 shadow-sm">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
              <Wallet className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-sm font-medium text-gray-500">Net Available</span>
          </div>
          <p className="text-2xl font-bold text-emerald-600">{formatPrice(net)}</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm mb-8">
        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <DollarSign className="w-5 h-5" />
          Request Payout
        </h2>
        <p className="text-sm text-gray-600 mb-3">
          Enter the amount you want to withdraw. Min: {formatPrice(min)} — Max: {formatPrice(net)}. Remaining balance stays in your wallet.
        </p>
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <input
            type="number"
            min={min}
            max={net}
            step="0.01"
            value={amountInput}
            onChange={(e) => setAmountInput(e.target.value)}
            placeholder={`Up to ${formatPrice(net)}`}
            className="w-full max-w-[200px] px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          <button
            type="button"
            onClick={() => setAmountInput(String(net))}
            className="text-sm text-amber-600 hover:text-amber-700 font-medium"
          >
            Request full balance
          </button>
        </div>
        {amountInput.trim() !== "" && !amountValid && (
          <p className="text-sm text-red-600 mb-2">
            Amount must be between {formatPrice(min)} and {formatPrice(net)}.
          </p>
        )}
        <button
          onClick={handleRequest}
          disabled={!canRequest || requesting}
          className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {requesting ? "Submitting..." : "Request Payout"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm">
        <h2 className="px-6 py-4 font-semibold text-gray-900 flex items-center gap-2">
          <History className="w-5 h-5" />
          Payout History
        </h2>
        {payouts.length === 0 ? (
          <div className="p-12 text-center text-gray-500">No payouts yet</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {payouts.map((p) => (
              <div key={p.id} className="px-6 py-4 flex justify-between items-center">
                <div>
                  <p className="font-mono font-medium">{p.payout_number}</p>
                  <p className="text-sm text-gray-500">{new Date(p.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatPrice(p.amount)}</p>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      p.status === "paid" ? "bg-emerald-100 text-emerald-700" :
                      p.status === "rejected" ? "bg-red-100 text-red-700" :
                      p.status === "approved" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default function VendorPayoutsPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorPayoutsContent />
    </ProtectedRoute>
  );
}
