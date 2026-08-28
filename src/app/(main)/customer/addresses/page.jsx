"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import AddressesPanel from "@/components/customer/AddressesPanel";

export default function CustomerAddressesPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileSettingsShell>
        <AddressesPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
