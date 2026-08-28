"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import BecomeSellerApplication from "@/components/customer/BecomeSellerApplication";

export default function BecomeSellerPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileSettingsShell>
        <BecomeSellerApplication />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
