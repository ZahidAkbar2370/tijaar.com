"use client";

import Link from "next/link";
import { Store, UserPlus } from "lucide-react";
import useAuth from "@/hooks/useAuth";

export default function BecomeSellerApplication() {
  const { user } = useAuth();

  if (user?.is_private_seller) {
    return (
      <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-start gap-3">
        <Store className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
        <div>
          <p className="font-semibold text-emerald-800">You are a Private Seller</p>
          <p className="text-sm text-emerald-700 mt-1">
            Manage listings from My Listings. Multi-quantity selling and earnings are unlocked.
          </p>
          <Link href="/customer/listings" className="inline-block mt-3 text-sm font-semibold text-[#1790d7] hover:underline">
            Go to My Listings →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h2 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
        <Store className="w-5 h-5 text-[#1790d7]" />
        Private Seller accounts
      </h2>
      <p className="text-sm text-gray-600 leading-relaxed">
        Customer accounts cannot be upgraded to Private Seller from the dashboard. To sell with multi-quantity
        listings and full seller tools, create a Private Seller account on the registration page.
      </p>
      <p className="text-sm text-gray-600 mt-3 leading-relaxed">
        As a customer you can still list a single item at a time from{" "}
        <Link href="/customer/sell" className="font-semibold text-[#1790d7] hover:underline">
          Sell an Item
        </Link>
        .
      </p>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 rounded-xl bg-[#1790d7] hover:bg-[#1277b8] text-white text-sm font-semibold shadow-sm"
      >
        <UserPlus className="w-4 h-4" />
        Go to registration
      </Link>
    </div>
  );
}
