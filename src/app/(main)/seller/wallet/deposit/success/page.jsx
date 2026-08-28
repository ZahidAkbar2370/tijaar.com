"use client";

import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHero from "@/components/customer/PageHero";
import { CheckCircle, Wallet, Package } from "lucide-react";

function VendorDepositSuccessContent() {
  return (
    <div className="space-y-8">
      <PageHero
        title="Deposit successful"
        description="Your funds have been added to your wallet. You can now buy promotion packages or use the balance later."
        illustration="promote"
      />

      <div className="max-w-md mx-auto text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-6">
          <CheckCircle className="w-10 h-10" />
        </div>
        <p className="text-gray-600 mb-8">
          The amount will appear in your wallet and in Transaction History. If you don&apos;t see it immediately, refresh the page or check again in a few moments.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/seller/packages"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-medium transition"
          >
            <Package className="w-5 h-5" />
            Buy a package
          </Link>
          <Link
            href="/seller/transactions"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium transition"
          >
            <Wallet className="w-5 h-5" />
            View Transaction History
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VendorDepositSuccessPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorDepositSuccessContent />
    </ProtectedRoute>
  );
}
