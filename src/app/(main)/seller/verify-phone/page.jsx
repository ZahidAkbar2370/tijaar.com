"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import PhoneVerificationPanel from "@/components/customer/PhoneVerificationPanel";

export default function SellerVerifyPhonePage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ProfileSettingsShell>
        <PhoneVerificationPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
