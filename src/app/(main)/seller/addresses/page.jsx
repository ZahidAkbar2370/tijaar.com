"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import AddressesPanel from "@/components/customer/AddressesPanel";

export default function SellerAddressesPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ProfileSettingsShell>
        <AddressesPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
