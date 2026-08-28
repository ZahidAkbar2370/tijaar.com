"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import useAuth from "@/hooks/useAuth";

function VerifyOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get("email") || "";
  const redirectParam = searchParams.get("redirect") || "";
  const { showSuccess, showError } = useSnackbar();
  const { completeVerification } = useAuth();
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const safeRedirect = (path) => {
    if (!path || typeof path !== "string") return null;
    // Only allow same-site relative paths
    if (!path.startsWith("/") || path.startsWith("//")) return null;
    return path;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length !== 6) {
      showError?.("Please enter the 6-digit code");
      return;
    }
    setSubmitting(true);
    try {
      const res = await authApi.verifyOtp({ email: emailParam, otp });
      completeVerification(res);
      showSuccess?.(
        res?.user?.role === "seller"
          ? "Welcome! Complete your store setup to start selling."
          : "Email verified! Welcome to Tijaar."
      );
      const next = safeRedirect(redirectParam);
      if (next) {
        router.replace(next);
        return;
      }
      const role = res?.user?.role;
      router.replace(role === "seller" ? "/seller/create-store" : "/customer/dashboard");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Invalid or expired code");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      await authApi.resendOtp(emailParam);
      showSuccess?.("A new code has been sent to your email.");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  if (!emailParam) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No email provided. Please complete registration first.</p>
          <Link href="/register" className="text-[#1790d7] font-medium hover:underline">
            Go to Register
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
      >
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#1790d7]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-[#1790d7]" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify your email</h1>
          <p className="text-gray-600">
            We sent a 6-digit code to <strong>{emailParam}</strong>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Verification code</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
              placeholder="000000"
              className="w-full px-4 py-4 text-center text-2xl font-mono tracking-[0.5em] rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
            />
          </div>
          <button
            type="submit"
            disabled={submitting || otp.length !== 6}
            className="w-full py-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {submitting ? "Verifying..." : "Verify"}
            <ArrowRight className="w-5 h-5" />
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Didn&apos;t receive the code?{" "}
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-[#1790d7] font-medium hover:underline disabled:opacity-50"
          >
            {resending ? "Sending..." : "Resend"}
          </button>
        </p>

        <p className="mt-4 text-center">
          <Link href="/login" className="text-sm text-gray-500 hover:text-[#1790d7]">
            Back to Login
          </Link>
        </p>
      </motion.div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <VerifyOtpContent />
    </Suspense>
  );
}
