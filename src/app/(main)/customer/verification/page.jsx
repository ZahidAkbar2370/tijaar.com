"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ShieldCheck, CheckCircle2, Circle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHero from "@/components/customer/PageHero";

function Step({ done, title, description, href, cta }) {
  return (
    <div className={`rounded-2xl border p-5 flex gap-4 ${done ? "border-emerald-200 bg-emerald-50/40" : "border-gray-200 bg-white"}`}>
      <div className="flex-shrink-0 mt-0.5">
        {done ? <CheckCircle2 className="w-6 h-6 text-emerald-600" /> : <Circle className="w-6 h-6 text-gray-300" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900">{title}</p>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
        {!done && href && (
          <Link href={href} className="inline-flex mt-3 text-sm font-semibold text-[#1790d7] hover:underline">
            {cta || "Verify now"} →
          </Link>
        )}
      </div>
    </div>
  );
}

function VerificationContent() {
  const { user, refresh } = useAuth();
  const router = useRouter();
  const settings = useSiteSettings();
  const status = user?.private_seller_verification;

  const requirements = useMemo(() => {
    const fromUser = status?.requirements;
    return {
      email: fromUser?.email ?? !!settings.private_seller_must_verify_email,
      phone: fromUser?.phone ?? !!settings.private_seller_must_verify_phone,
      whatsapp: fromUser?.whatsapp ?? !!settings.private_seller_must_verify_whatsapp,
    };
  }, [status, settings]);

  const emailDone = !!user?.email_verified_at;
  const phoneDone = !!user?.phone_verified_at;
  const waDone = !!user?.whatsapp_verified_at;

  const allDone =
    (!requirements.email || emailDone) &&
    (!requirements.phone || phoneDone) &&
    (!requirements.whatsapp || waDone);

  useEffect(() => {
    refresh?.();
  }, [refresh]);

  useEffect(() => {
    if (allDone && user?.is_private_seller) {
      const t = setTimeout(() => router.replace("/customer/listings"), 800);
      return () => clearTimeout(t);
    }
  }, [allDone, user, router]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHero
        title="Seller verification"
        description="Complete the steps below to unlock selling tools. This keeps buyers and sellers safe on Tijaar."
        illustration="profile"
      />

      <div className="rounded-2xl border border-[#1790d7]/20 bg-[#1790d7]/5 p-4 flex gap-3">
        <ShieldCheck className="w-6 h-6 text-[#1790d7] flex-shrink-0" />
        <p className="text-sm text-gray-700">
          {allDone
            ? "You're all set. Redirecting to your listings…"
            : "Admin requires verification for private sellers. Finish each enabled step to continue."}
        </p>
      </div>

      <div className="space-y-3">
        {requirements.email && (
          <Step
            done={emailDone}
            title="Email verification"
            description="Confirm the email on your account with the one-time code we send."
            href={`/verify-otp?email=${encodeURIComponent(user?.email || "")}&redirect=${encodeURIComponent("/customer/verification")}`}
            cta="Verify email"
          />
        )}
        {requirements.phone && (
          <Step
            done={phoneDone}
            title="Phone verification"
            description="Verify your Pakistani mobile number with an SMS OTP."
            href="/customer/verify-phone"
            cta="Verify phone"
          />
        )}
        {requirements.whatsapp && (
          <Step
            done={waDone}
            title="WhatsApp verification"
            description="Confirm WhatsApp so order updates can reach you reliably."
            href="/customer/verify-whatsapp"
            cta="Verify WhatsApp"
          />
        )}
        {!requirements.email && !requirements.phone && !requirements.whatsapp && (
          <p className="text-sm text-gray-600">No verification steps are required right now. You can sell freely.</p>
        )}
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <Link href="/customer/dashboard" className="text-gray-500 hover:text-[#1790d7]">
          ← Back to dashboard
        </Link>
        {allDone && (
          <Link href="/customer/listings" className="font-semibold text-[#1790d7]">
            Go to My Listings →
          </Link>
        )}
      </div>
    </div>
  );
}

export default function CustomerVerificationPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <VerificationContent />
    </ProtectedRoute>
  );
}
