"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Mail, ArrowRight, ArrowLeft, KeyRound, ShieldCheck, Inbox } from "lucide-react";
import { authApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";

const features = [
  { icon: KeyRound, text: "Secure password reset link" },
  { icon: Inbox, text: "Sent straight to your email" },
  { icon: ShieldCheck, text: "Your account stays protected" },
];

const inputBase =
  "w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 text-[15px] transition-shadow focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7]";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const { showError, showSuccess } = useSnackbar();
  const { login_logo_url, login_logo_alt } = useSiteSettings();

  const logoSrc = login_logo_url || "/images/tijaar-logo.png";
  const logoAlt = resolveImageAlt(login_logo_alt, IMAGE_ALT_FALLBACKS.loginLogo);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSent(false);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
      showSuccess?.("Password reset link sent to your email.");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to send reset link.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-[#f4f7fb]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, rgba(23,144,215,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(77,179,232,0.12), transparent 50%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-stretch px-4 py-8 sm:px-6 sm:py-10 lg:px-8 lg:py-12">
        <div className="grid w-full overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-[0_20px_50px_-24px_rgba(15,39,68,0.28)] lg:grid-cols-2">
          {/* Brand panel */}
          <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#0d6fa8] via-[#1790d7] to-[#4db3e8] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-12">
            <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-2xl" />
            <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.9) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.9) 1px, transparent 1px)",
                backgroundSize: "28px 28px",
              }}
            />

            <div className="relative z-10">
              <Link href="/" className="inline-flex items-center">
                <img
                  src={logoSrc}
                  alt={logoAlt}
                  className="h-9 w-auto brightness-0 invert"
                  onError={(e) => {
                    if (e.target.src !== "/images/tijaar-logo.png") e.target.src = "/images/tijaar-logo.png";
                  }}
                />
              </Link>
              <h1 className="mt-10 text-3xl font-bold leading-tight tracking-tight xl:text-4xl">
                Reset your password
              </h1>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-white/85">
                Enter the email linked to your Tijaar account and we&apos;ll send a secure reset link.
              </p>
            </div>

            <ul className="relative z-10 mt-12 space-y-4">
              {features.map((feature, i) => {
                const Icon = feature.icon;
                return (
                  <motion.li
                    key={feature.text}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.08, duration: 0.35 }}
                    className="flex items-center gap-3"
                  >
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <span className="text-[15px] font-medium text-white/95">{feature.text}</span>
                  </motion.li>
                );
              })}
            </ul>
          </aside>

          {/* Form panel */}
          <div className="flex items-center justify-center px-5 py-8 sm:px-8 sm:py-10 lg:px-10 xl:px-14">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[400px]"
            >
              <div className="mb-7 text-center lg:hidden">
                <Link href="/" className="inline-block">
                  <img
                    src={logoSrc}
                    alt={logoAlt}
                    className="mx-auto h-9 w-auto"
                    onError={(e) => {
                      if (e.target.src !== "/images/tijaar-logo.png") e.target.src = "/images/tijaar-logo.png";
                    }}
                  />
                </Link>
              </div>

              <header className="mb-7 text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-[#0f2744] sm:text-[1.75rem]">
                  Forgot password?
                </h2>
                <p className="mt-2 text-sm text-gray-500 sm:text-[15px]">
                  Remembered it?{" "}
                  <Link href="/login" className="font-semibold text-[#1790d7] hover:underline">
                    Sign in
                  </Link>
                </p>
              </header>

              {sent ? (
                <div className="space-y-5">
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm leading-relaxed text-emerald-800">
                    <p className="font-semibold">Check your inbox</p>
                    <p className="mt-1.5 text-emerald-700">
                      We sent a reset link to{" "}
                      <span className="font-medium break-all">{email}</span>. It may take a few minutes to arrive.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSent(false)}
                    className="w-full rounded-xl border border-gray-200 bg-white py-3.5 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50"
                  >
                    Try another email
                  </button>
                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-3.5 text-[15px] font-semibold text-white shadow-md shadow-[#1790d7]/25"
                  >
                    <ArrowLeft className="h-5 w-5" aria-hidden="true" />
                    Back to sign in
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                  <div>
                    <label htmlFor="forgot-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <Mail
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="forgot-email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        autoComplete="email"
                        className={`${inputBase} border-gray-200`}
                        required
                      />
                    </div>
                    <p className="mt-1.5 text-xs text-gray-500">
                      We&apos;ll email a link to create a new password.
                    </p>
                  </div>

                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-3.5 text-[15px] font-semibold text-white shadow-md shadow-[#1790d7]/25 transition-shadow hover:shadow-lg hover:shadow-[#1790d7]/30 disabled:opacity-60 sm:py-4"
                  >
                    {submitting ? "Sending…" : "Send reset link"}
                    {!submitting && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                  </motion.button>

                  <Link
                    href="/login"
                    className="flex w-full items-center justify-center gap-2 py-2 text-sm font-semibold text-[#1790d7] hover:underline"
                  >
                    <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                    Back to sign in
                  </Link>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
