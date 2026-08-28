"use client";

import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import useAuth from "@/hooks/useAuth";
import { getToken } from "@/lib/api";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { DashboardPageSkeleton } from "@/components/common/PageSkeleton";

function isEmailVerified(user) {
  return !!(user?.email_verified_at);
}

const SELLING_PATH_PREFIXES = [
  "/customer/sell",
  "/customer/listings",
  "/customer/become-seller",
];

function isSellingPath(pathname) {
  return SELLING_PATH_PREFIXES.some((p) => pathname === p || pathname?.startsWith(p + "/"));
}

export default function ProtectedRoute({ children, requiredRole = null }) {
  const { isAuthenticated, loading, user, refresh } = useAuth();
  const { email_verification_required: emailVerificationRequired } = useSiteSettings();
  const router = useRouter();
  const pathname = usePathname();
  const [restoringSession, setRestoringSession] = useState(false);

  useEffect(() => {
    if (loading || restoringSession) return;
    if (!isAuthenticated) {
      if (getToken()) {
        setRestoringSession(true);
        refresh()
          .then((restoredUser) => {
            if (!restoredUser) router.replace("/login");
          })
          .finally(() => setRestoringSession(false));
        return;
      }
      router.replace("/login");
      return;
    }

    if (emailVerificationRequired && user && !isEmailVerified(user)) {
      const email = encodeURIComponent(user.email || "");
      const redirect = encodeURIComponent(pathname || "/customer/dashboard");
      router.replace(`/verify-otp?email=${email}&redirect=${redirect}`);
      return;
    }

    if (requiredRole && user?.role !== requiredRole) {
      if (user?.role === "seller") router.replace("/seller/dashboard");
      else router.replace("/customer/dashboard");
      return;
    }

    // Private seller post-login verification gate (admin toggles)
    const ps = user?.private_seller_verification;
    if (
      user?.is_private_seller &&
      ps?.required &&
      !ps?.complete &&
      isSellingPath(pathname) &&
      pathname !== "/customer/verification"
    ) {
      router.replace("/customer/verification");
    }
  }, [
    isAuthenticated,
    loading,
    restoringSession,
    user,
    requiredRole,
    router,
    refresh,
    emailVerificationRequired,
    pathname,
  ]);

  if (loading || restoringSession) return <DashboardPageSkeleton />;
  if (!isAuthenticated) return null;
  if (emailVerificationRequired && user && !isEmailVerified(user)) return null;
  if (requiredRole && user?.role !== requiredRole) return null;

  const ps = user?.private_seller_verification;
  if (
    user?.is_private_seller &&
    ps?.required &&
    !ps?.complete &&
    isSellingPath(pathname) &&
    pathname !== "/customer/verification"
  ) {
    return null;
  }

  return children;
}
