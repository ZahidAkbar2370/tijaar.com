"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import ActiveSessions from "@/components/customer/ActiveSessions";

export default function CustomerSessionsPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileSettingsShell>
        <ActiveSessions />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
