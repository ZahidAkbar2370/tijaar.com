"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import SavedCardsPanel from "@/components/customer/SavedCardsPanel";

export default function SellerSavedCardsPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ProfileSettingsShell>
        <SavedCardsPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
