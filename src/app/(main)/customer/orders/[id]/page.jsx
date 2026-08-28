"use client";

import { Suspense } from "react";
import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import OrderDetail from "./OrderDetail";

export default function OrderDetailPage() {
  const params = useParams();
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="w-full py-8 animate-pulse h-64 bg-gray-100 rounded-xl" />}>
        <OrderDetail orderId={params?.id} />
      </Suspense>
    </ProtectedRoute>
  );
}
