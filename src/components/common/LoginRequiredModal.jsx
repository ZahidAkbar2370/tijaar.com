"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, X, Mail, Lock, Eye, EyeOff, CheckCircle2, AlertCircle } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import RecaptchaField, { resetRecaptcha } from "@/components/auth/RecaptchaField";
import { isValidEmail, postLoginPath } from "@/lib/authRedirect";

const inputBase =
  "w-full pl-10 pr-4 py-2.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 text-sm transition-shadow focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7]";

/**
 * Guest gate modal with inline login form.
 */
export default function LoginRequiredModal({
  open,
  onClose,
  title = "Login required",
  message = "Please log in to continue.",
  redirectTo = "/",
}) {
  const router = useRouter();
  const { login } = useAuth();
  const { recaptcha_enabled, recaptcha_site_key, recaptcha_on_login } = useSiteSettings();
  const showRecaptcha = !!(recaptcha_enabled && recaptcha_on_login && recaptcha_site_key);

  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", recaptcha: "", form: "" });
  const [successMessage, setSuccessMessage] = useState("");

  const safeRedirect = redirectTo && redirectTo !== "/login" ? redirectTo : "/";
  const registerHref = `/register?redirect=${encodeURIComponent(safeRedirect)}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) return;
    setEmail("");
    setPassword("");
    setRememberMe(true);
    setShowPassword(false);
    setRecaptchaToken("");
    setSubmitting(false);
    setErrors({ email: "", password: "", recaptcha: "", form: "" });
    setSuccessMessage("");
    if (showRecaptcha) resetRecaptcha();
  }, [open, showRecaptcha]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape" && !submitting) onClose?.();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose, submitting]);

  const validate = () => {
    const next = { email: "", password: "", recaptcha: "", form: "" };
    const trimmedEmail = email.trim();
    if (!trimmedEmail) next.email = "Email is required.";
    else if (!isValidEmail(trimmedEmail)) next.email = "Enter a valid email address.";
    if (!password) next.password = "Password is required.";
    if (showRecaptcha && !recaptchaToken) next.recaptcha = "Please complete the reCAPTCHA challenge.";
    setErrors(next);
    return !next.email && !next.password && !next.recaptcha;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage("");
    if (!validate()) return;

    setSubmitting(true);
    setErrors({ email: "", password: "", recaptcha: "", form: "" });

    try {
      const data = await login({
        email: email.trim(),
        password,
        remember_me: rememberMe,
        ...(showRecaptcha ? { recaptcha_token: recaptchaToken } : {}),
      });
      setSuccessMessage("Login successful. Redirecting…");
      const target = postLoginPath(data?.user, safeRedirect);
      onClose?.();
      router.push(target);
    } catch (err) {
      if (showRecaptcha) {
        setRecaptchaToken("");
        resetRecaptcha();
      }
      if (err?.data?.requires_verification && err?.data?.email) {
        onClose?.();
        router.push(
          `/verify-otp?email=${encodeURIComponent(err.data.email)}&redirect=${encodeURIComponent(safeRedirect)}`
        );
        return;
      }
      const apiErrors = err?.data?.errors || {};
      const errorCode = err?.data?.error_code;
      if (apiErrors.recaptcha_token || errorCode === "recaptcha_failed") {
        setErrors((prev) => ({
          ...prev,
          recaptcha:
            (Array.isArray(apiErrors.recaptcha_token) ? apiErrors.recaptcha_token[0] : apiErrors.recaptcha_token) ||
            err?.data?.message ||
            "reCAPTCHA verification failed.",
        }));
      } else if (apiErrors.email) {
        setErrors((prev) => ({
          ...prev,
          email: Array.isArray(apiErrors.email) ? apiErrors.email[0] : apiErrors.email,
        }));
      } else if (errorCode === "email_not_found") {
        setErrors({ email: "Email address doesn't exist", password: "", recaptcha: "", form: "" });
      } else if (errorCode === "invalid_password") {
        setErrors({ email: "", password: "Password is wrong", recaptcha: "", form: "" });
      } else if (apiErrors.password) {
        setErrors((prev) => ({
          ...prev,
          password: Array.isArray(apiErrors.password) ? apiErrors.password[0] : apiErrors.password,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          form: err?.data?.message || err?.message || "Login failed. Please try again.",
        }));
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="login-required-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/50"
        aria-label="Close"
        onClick={() => !submitting && onClose?.()}
        disabled={submitting}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl border border-gray-100 p-5 sm:p-6 max-h-[90vh] overflow-y-auto">
        <button
          type="button"
          onClick={() => !submitting && onClose?.()}
          className="absolute top-3 right-3 p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-800 transition-colors disabled:opacity-50"
          aria-label="Close dialog"
          disabled={submitting}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-3 pr-8 mb-5">
          <div className="w-11 h-11 rounded-xl bg-[#1790d7]/10 flex items-center justify-center shrink-0">
            <LogIn className="w-5 h-5 text-[#1790d7]" />
          </div>
          <div>
            <h2 id="login-required-title" className="text-lg font-bold text-gray-900">
              {title}
            </h2>
            <p className="mt-1.5 text-sm text-gray-600 leading-relaxed">{message}</p>
          </div>
        </div>

        {successMessage && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-3 text-sm text-emerald-800">
            <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{successMessage}</p>
          </div>
        )}

        {errors.form && (
          <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 px-3.5 py-3 text-sm text-red-800">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <p>{errors.form}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="modal-login-email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="modal-login-email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: "" }));
                }}
                className={`${inputBase} ${errors.email ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-gray-200"}`}
                placeholder="you@example.com"
                disabled={submitting}
              />
            </div>
            {errors.email && <p className="mt-1.5 text-xs text-red-600">{errors.email}</p>}
          </div>

          <div>
            <label htmlFor="modal-login-password" className="block text-sm font-medium text-gray-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                id="modal-login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors((prev) => ({ ...prev, password: "" }));
                }}
                className={`${inputBase} pr-10 ${errors.password ? "border-red-300 focus:border-red-400 focus:ring-red-200" : "border-gray-200"}`}
                placeholder="Your password"
                disabled={submitting}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {errors.password && <p className="mt-1.5 text-xs text-red-600">{errors.password}</p>}
          </div>

          {showRecaptcha && (
            <div>
              <RecaptchaField
                siteKey={recaptcha_site_key}
                onChange={(token) => {
                  setRecaptchaToken(token || "");
                  if (token) setErrors((prev) => ({ ...prev, recaptcha: "" }));
                }}
              />
              {errors.recaptcha && <p className="mt-1.5 text-xs text-red-600">{errors.recaptcha}</p>}
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="rounded border-gray-300 text-[#1790d7] focus:ring-[#1790d7]"
              disabled={submitting}
            />
            Remember me
          </label>

          <div className="flex flex-col-reverse sm:flex-row gap-2.5 sm:justify-end pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50"
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-sm font-semibold hover:shadow-lg hover:shadow-[#1790d7]/25 transition-all disabled:opacity-60"
            >
              <LogIn className="w-4 h-4" />
              {submitting ? "Signing in…" : "Login"}
            </button>
          </div>
        </form>

        <p className="mt-5 text-center text-sm text-gray-600">
          Don&apos;t have an account?{" "}
          <Link
            href={registerHref}
            onClick={onClose}
            className="font-semibold text-[#1790d7] hover:underline"
          >
            Register
          </Link>
        </p>
      </div>
    </div>,
    document.body
  );
}
