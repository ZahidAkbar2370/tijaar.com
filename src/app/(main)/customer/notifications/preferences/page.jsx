"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import NotificationPreferencesPanel from "@/components/customer/NotificationPreferencesPanel";

export default function NotificationPreferencesPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileSettingsShell
        title="Enable Alerts"
        description="Enable or disable email, WhatsApp, and Firebase alerts for website and mobile app."
      >
        <NotificationPreferencesPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
