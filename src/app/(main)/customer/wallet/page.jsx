"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHero from "@/components/customer/PageHero";
import { walletApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { Wallet, PlusCircle, History } from "lucide-react";

function WalletContent() {
  const { formatPrice } = useMarket();
  const [balance, setBalance] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    walletApi
      .balance()
      .then((res) => setBalance(res.wallet?.balance ?? res.balance ?? 0))
      .catch(() => setBalance(0))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-5">
      <PageHero
        title="My Wallet"
        description="Top up your wallet to pay for orders, listing fees, and promotion packages on Tijaar."
        illustration="wallet"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-[#1790d7] to-cyan-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex items-center gap-2 text-white/90 text-sm mb-2">
            <Wallet className="w-4 h-4" />
            Available balance
          </div>
          <p className="text-3xl font-bold">
            {loading ? "…" : formatPrice(balance ?? 0)}
          </p>
          <p className="text-sm text-white/80 mt-2">Use at checkout or for promotion packages</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col gap-3">
          <Link
            href="/customer/wallet/deposit"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-[#1790d7] text-white font-semibold hover:bg-[#147bb8]"
          >
            <PlusCircle className="w-5 h-5" />
            Add money to wallet
          </Link>
          <Link
            href="/customer/transactions?tab=wallet"
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50"
          >
            <History className="w-5 h-5" />
            Wallet & payment history
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CustomerWalletPage() {
  return (
    <ProtectedRoute>
      <WalletContent />
    </ProtectedRoute>
  );
}
