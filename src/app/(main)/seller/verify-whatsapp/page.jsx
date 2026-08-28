"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import WhatsappVerificationPanel from "@/components/customer/WhatsappVerificationPanel";

export default function SellerVerifyWhatsappPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <ProfileSettingsShell>
        <WhatsappVerificationPanel />
      </ProfileSettingsShell>
    </ProtectedRoute>
  );
}
