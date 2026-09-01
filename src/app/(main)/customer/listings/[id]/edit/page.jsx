"use client";

import { useParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import SellItemForm from "@/app/(main)/customer/sell/SellItemForm";

export default function EditListingPage() {
  const params = useParams();

  return (
    <ProtectedRoute requiredRole="customer">
      <SellItemForm listingId={params?.id} />
    </ProtectedRoute>
  );
}
