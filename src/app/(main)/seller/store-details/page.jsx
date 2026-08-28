"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import VendorStoreForm from "@/app/(main)/seller/profile/VendorStoreForm";

export default function SellerStoreDetailsPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ProfileSettingsShell>
        <VendorStoreForm />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
