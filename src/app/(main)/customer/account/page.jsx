"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import CustomerAccount from "./CustomerAccount";

export default function CustomerAccountPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <CustomerAccount />
    </ProtectedRoute>
  );
}
