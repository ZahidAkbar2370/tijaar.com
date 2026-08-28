"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import SellItemForm from "./SellItemForm";

export default function SellItemPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <SellItemForm />
    </ProtectedRoute>
  );
}
