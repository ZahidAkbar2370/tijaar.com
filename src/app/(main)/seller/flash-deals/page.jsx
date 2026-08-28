"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";

const VendorFlashDeals = dynamic(() => import("./VendorFlashDeals"), {
  ssr: false,
  loading: () => <div className="min-h-[400px] flex items-center justify-center">Loading…</div>,
});

export default function SellerFlashDealsPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorFlashDeals />
    </ProtectedRoute>
  );
}
