"use client";

import dynamic from "next/dynamic";
import ProtectedRoute from "@/components/ProtectedRoute";

const CustomerOrders = dynamic(() => import("./CustomerOrders"), {
  ssr: false,
  loading: () => <div className="min-h-[400px] flex items-center justify-center">Loading…</div>,
});

export default function CustomerOrdersPage() {
  return (
    <ProtectedRoute>
      <CustomerOrders />
    </ProtectedRoute>
  );
}
