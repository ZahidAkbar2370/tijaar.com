"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import PhoneVerificationPanel from "@/components/customer/PhoneVerificationPanel";

export default function CustomerVerifyPhonePage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProfileSettingsShell>
        <PhoneVerificationPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
