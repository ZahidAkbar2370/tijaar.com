"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import ActiveSessions from "@/components/customer/ActiveSessions";

export default function SellerSessionsPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ProfileSettingsShell>
        <ActiveSessions />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
