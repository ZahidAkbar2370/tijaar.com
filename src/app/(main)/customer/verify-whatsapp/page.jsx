"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import WhatsappVerificationPanel from "@/components/customer/WhatsappVerificationPanel";

export default function CustomerVerifyWhatsappPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileSettingsShell>
        <WhatsappVerificationPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
