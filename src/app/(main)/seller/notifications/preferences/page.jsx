"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import NotificationPreferencesPanel from "@/components/customer/NotificationPreferencesPanel";

export default function SellerNotificationPreferencesPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ProfileSettingsShell>
        <NotificationPreferencesPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
