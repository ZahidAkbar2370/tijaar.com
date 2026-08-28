"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import VendorProducts from "./VendorProducts";

export default function VendorProductsPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorProducts />
    </ProtectedRoute>
  );
}
