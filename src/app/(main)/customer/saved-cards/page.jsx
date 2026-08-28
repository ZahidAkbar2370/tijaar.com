"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import SavedCardsPanel from "@/components/customer/SavedCardsPanel";

export default function CustomerSavedCardsPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileSettingsShell>
        <SavedCardsPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
