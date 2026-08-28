"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useAuth from "@/hooks/useAuth";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { completeSocialLogin } = useAuth();
  const [done, setDone] = useState(false);
  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");
    const redirectPath = searchParams.get("redirect");
    if (error) {
      router.replace(`/login?error=${encodeURIComponent(error)}`);
      return;
    }
    if (!token) {
      router.replace("/login");
      return;
    }
    if (done) return;
    setDone(true);
    completeSocialLogin(token).then((user) => {
      if (!user) {
        router.replace("/login?error=" + encodeURIComponent("Sign in could not be completed. Please try again."));
        return;
      }
      const role = user.role || "customer";
      const defaultPath = role === "seller" ? "/seller/dashboard" : "/customer/dashboard";
      const target =
        redirectPath &&
        typeof redirectPath === "string" &&
        redirectPath.startsWith("/") &&
        !redirectPath.startsWith("//")
          ? redirectPath
          : defaultPath;
      router.replace(target);
    });
  }, [searchParams, router, done, completeSocialLogin]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-pulse text-gray-500">Completing sign in...</div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><div className="animate-pulse text-gray-500">Completing sign in...</div></div>}>
      <AuthCallbackContent />
    </Suspense>
  );
}
