"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  User,
  Phone,
  TrendingUp,
  Globe,
  Shield,
} from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { authApi } from "@/lib/api";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { isValidEmail, normalizePhonePk } from "@/lib/validators";
import RecaptchaField, { resetRecaptcha } from "@/components/auth/RecaptchaField";

const features = [
  { icon: TrendingUp, text: "Buy & sell across Pakistan" },
  { icon: Globe, text: "List items free, grow when ready" },
  { icon: Shield, text: "Secure & verified transactions" },
];

const PK_COUNTRY_CODE = "+92";

function readQueryParam(key) {
  if (typeof window === "undefined") return null;
  try {
    return new URLSearchParams(window.location.search).get(key);
  } catch {
    return null;
  }
}

const inputBase =
  "w-full pl-11 pr-4 py-3 sm:py-3.5 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 text-[15px] transition-shadow focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7]";

export default function RegisterForm() {
  const { register } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const { login_logo_url, login_logo_alt, recaptcha_enabled, recaptcha_site_key, recaptcha_on_register } =
    useSiteSettings();
  const showRecaptcha = !!(recaptcha_enabled && recaptcha_on_register && recaptcha_site_key);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue =
      type === "checkbox" ? checked : name === "phone" ? value.replace(/[^\d\s]/g, "") : value;
    setForm((p) => ({ ...p, [name]: nextValue }));
    setErrors((prev) => {
      const next = { ...prev, [name]: "" };
      if (name === "password" || name === "confirmPassword") next.password = next.confirmPassword = "";
      return next;
    });
  };

  /** Accept 923… / 03… / 3… and store as 03XXXXXXXXX */
  const resolveRegisterPhone = (raw) => {
    const t = String(raw || "").trim();
    if (!t) return undefined;
    return (
      normalizePhonePk(t) ||
      normalizePhonePk(`${PK_COUNTRY_CODE}${t}`) ||
      normalizePhonePk(`92${t}`)
    );
  };

  const validateForm = () => {
    const newErrors = {};
    if (!form.fullName?.trim()) newErrors.fullName = "Full name is required";
    if (!form.email?.trim()) newErrors.email = "Email is required";
    else if (!isValidEmail(form.email)) newErrors.email = "Enter a valid email address";
    if (form.phone?.trim() && !resolveRegisterPhone(form.phone)) {
      newErrors.phone = "Enter a valid Pakistani mobile (923XXXXXXXXX)";
    }
    if (!form.password) newErrors.password = "Password is required";
    else if (form.password.length < 8) newErrors.password = "Password must be at least 8 characters";
    if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    if (!form.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      setErrors((prev) => ({ ...prev, confirmPassword: "Passwords do not match" }));
      return;
    }
    if (!validateForm()) return;
    if (showRecaptcha && !recaptchaToken) {
      setErrors((prev) => ({ ...prev, recaptcha: "Please complete the reCAPTCHA challenge." }));
      return;
    }
    setSubmitting(true);
    try {
      const fullPhone = form.phone?.trim() ? resolveRegisterPhone(form.phone) : undefined;
      const payload = {
        name: form.fullName,
        email: form.email,
        phone: fullPhone,
        role: "customer",
        password: form.password,
        password_confirmation: form.confirmPassword,
        ...(showRecaptcha ? { recaptcha_token: recaptchaToken } : {}),
      };
      const data = await register(payload);
      if (data?.requires_verification) {
        showSuccess?.("Check your email for the verification code.");
        router.replace(`/verify-otp?email=${encodeURIComponent(data.email || form.email)}`);
        return;
      }
      showSuccess?.("Account created successfully! Welcome to Tijaar.");
      router.replace("/customer/dashboard");
    } catch (err) {
      if (showRecaptcha) {
        setRecaptchaToken("");
        resetRecaptcha();
      }
      const apiErrors = err?.data?.errors || {};
      const newErrors = {};
      if (apiErrors.name) newErrors.fullName = Array.isArray(apiErrors.name) ? apiErrors.name[0] : apiErrors.name;
      if (apiErrors.email) newErrors.email = Array.isArray(apiErrors.email) ? apiErrors.email[0] : apiErrors.email;
      if (apiErrors.phone) newErrors.phone = Array.isArray(apiErrors.phone) ? apiErrors.phone[0] : apiErrors.phone;
      if (apiErrors.password)
        newErrors.password = Array.isArray(apiErrors.password) ? apiErrors.password[0] : apiErrors.password;
      if (apiErrors.recaptcha_token || err?.data?.error_code === "recaptcha_failed") {
        newErrors.recaptcha = Array.isArray(apiErrors.recaptcha_token)
          ? apiErrors.recaptcha_token[0]
          : apiErrors.recaptcha_token || err?.data?.message || "reCAPTCHA verification failed.";
      }
      if (Object.keys(newErrors).length > 0) setErrors((prev) => ({ ...prev, ...newErrors }));
      else showError?.(err?.data?.message || err?.message || "Registration failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignUp = async () => {
    setGoogleLoading(true);
    try {
      const redirectPath = readQueryParam("redirect") || undefined;
      const res = await authApi.socialRedirectUrl("google", redirectPath);
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      showError?.("Could not get Google sign-in URL");
    } catch (err) {
      showError?.(err?.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const logoSrc = login_logo_url || "/images/tijaar-logo.png";
  const logoAlt = resolveImageAlt(login_logo_alt, IMAGE_ALT_FALLBACKS.loginLogo);

  return (
    <div className="relative min-h-[calc(100vh-8rem)] overflow-hidden bg-[#f4f7fb]">
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 0% 0%, rgba(23,144,215,0.14), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 100%, rgba(77,179,232,0.12), transparent 50%)",
        }}
      />

      <div className="relative mx-auto flex min-h-[calc(100vh-8rem)] w-full max-w-6xl items-stretch px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
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
                Join Tijaar today
              </h1>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-white/85">
                Create a free customer account to buy and sell. Unlock more selling tools anytime from your Profile.
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
          <div className="flex items-start justify-center overflow-y-auto px-5 py-7 sm:px-8 sm:py-9 lg:max-h-[calc(100vh-6rem)] lg:px-10 xl:px-12">
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-[440px]"
            >
              <div className="mb-6 text-center lg:hidden">
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

              <header className="mb-6 text-center lg:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-[#0f2744] sm:text-[1.75rem]">
                  Create account
                </h2>
                <p className="mt-2 text-sm text-gray-500 sm:text-[15px]">
                  Already have an account?{" "}
                  <Link href="/login" className="font-semibold text-[#1790d7] hover:underline">
                    Sign in
                  </Link>
                </p>
              </header>

              <button
                type="button"
                onClick={handleGoogleSignUp}
                disabled={googleLoading || submitting}
                className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white py-3 text-[15px] font-medium text-gray-700 transition-colors hover:bg-gray-50 disabled:opacity-70 sm:py-3.5"
              >
                <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                {googleLoading ? "Redirecting…" : "Continue with Google"}
              </button>

              <div className="relative my-5">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-3 text-gray-400">or email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" noValidate>
                <div>
                  <label htmlFor="reg-name" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Full name
                  </label>
                  <div className="relative">
                    <User
                      className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="reg-name"
                      type="text"
                      name="fullName"
                      value={form.fullName}
                      onChange={handleChange}
                      placeholder="Your full name"
                      autoComplete="name"
                      className={`${inputBase} ${errors.fullName ? "border-red-400" : "border-gray-200"}`}
                      required
                      aria-invalid={!!errors.fullName}
                    />
                  </div>
                  {errors.fullName && <p className="mt-1.5 text-sm text-red-500">{errors.fullName}</p>}
                </div>

                <div>
                  <label htmlFor="reg-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                      aria-hidden="true"
                    />
                    <input
                      id="reg-email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`${inputBase} ${errors.email ? "border-red-400" : "border-gray-200"}`}
                      required
                      aria-invalid={!!errors.email}
                    />
                  </div>
                  {errors.email && <p className="mt-1.5 text-sm text-red-500">{errors.email}</p>}
                </div>

                <div>
                  <label htmlFor="reg-phone" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Phone <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <div className="flex gap-2">
                    <div
                      className="flex w-[5.75rem] shrink-0 items-center justify-center gap-1.5 rounded-xl border border-gray-200 bg-gray-50 px-2 py-3 sm:w-28 sm:gap-2 sm:px-3 sm:py-3.5"
                      title="Pakistan"
                      aria-label="Pakistan country code +92"
                    >
                      <span className="text-base leading-none sm:text-lg" aria-hidden="true">
                        🇵🇰
                      </span>
                      <span className="text-sm font-medium text-gray-700">{PK_COUNTRY_CODE}</span>
                    </div>
                    <div className="relative min-w-0 flex-1">
                      <Phone
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-phone"
                        type="tel"
                        name="phone"
                        inputMode="numeric"
                        pattern="[0-9\s]*"
                        value={form.phone}
                        onChange={handleChange}
                        onKeyDown={(e) => {
                          const allowed = [
                            "Backspace",
                            "Delete",
                            "Tab",
                            "ArrowLeft",
                            "ArrowRight",
                            "Home",
                            "End",
                          ];
                          if (allowed.includes(e.key) || e.ctrlKey || e.metaKey) return;
                          if (!/[\d\s]/.test(e.key)) e.preventDefault();
                        }}
                        placeholder="3001234567"
                        autoComplete="tel-national"
                        className={`${inputBase} ${errors.phone ? "border-red-400" : "border-gray-200"}`}
                        aria-invalid={!!errors.phone}
                      />
                    </div>
                  </div>
                  {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="reg-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-password"
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Min. 8 characters"
                        autoComplete="new-password"
                        minLength={8}
                        className={`${inputBase} pr-11 ${errors.password ? "border-red-400" : "border-gray-200"}`}
                        required
                        aria-invalid={!!errors.password}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                      >
                        {showPassword ? (
                          <EyeOff className="h-[18px] w-[18px]" />
                        ) : (
                          <Eye className="h-[18px] w-[18px]" />
                        )}
                      </button>
                    </div>
                    {errors.password && <p className="mt-1.5 text-sm text-red-500">{errors.password}</p>}
                  </div>

                  <div>
                    <label htmlFor="reg-confirm" className="mb-1.5 block text-sm font-medium text-gray-700">
                      Confirm
                    </label>
                    <div className="relative">
                      <Lock
                        className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400"
                        aria-hidden="true"
                      />
                      <input
                        id="reg-confirm"
                        type={showConfirm ? "text" : "password"}
                        name="confirmPassword"
                        value={form.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repeat password"
                        autoComplete="new-password"
                        className={`${inputBase} pr-11 ${errors.confirmPassword ? "border-red-400" : "border-gray-200"}`}
                        required
                        aria-invalid={!!errors.confirmPassword}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600"
                        aria-label={showConfirm ? "Hide confirm password" : "Show confirm password"}
                      >
                        {showConfirm ? (
                          <EyeOff className="h-[18px] w-[18px]" />
                        ) : (
                          <Eye className="h-[18px] w-[18px]" />
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                <div className="pt-0.5">
                  <label className="flex cursor-pointer items-start gap-2.5 text-sm leading-snug text-gray-600">
                    <input
                      type="checkbox"
                      name="agreeToTerms"
                      checked={form.agreeToTerms}
                      onChange={handleChange}
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-[#1790d7] focus:ring-[#1790d7] ${
                        errors.agreeToTerms ? "ring-2 ring-red-400" : ""
                      }`}
                      required
                    />
                    <span>
                      I agree to the{" "}
                      <Link
                        href="/terms"
                        className="font-medium text-[#1790d7] hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Terms &amp; Conditions
                      </Link>{" "}
                      and{" "}
                      <Link
                        href="/privacy"
                        className="font-medium text-[#1790d7] hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Privacy Policy
                      </Link>
                    </span>
                  </label>
                  {errors.agreeToTerms && (
                    <p className="mt-1.5 text-sm text-red-500">{errors.agreeToTerms}</p>
                  )}
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
                    {errors.recaptcha && (
                      <p className="mt-1.5 text-sm text-red-500">{errors.recaptcha}</p>
                    )}
                  </div>
                )}

                <motion.button
                  type="submit"
                  disabled={submitting || googleLoading}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-3.5 text-[15px] font-semibold text-white shadow-md shadow-[#1790d7]/25 transition-shadow hover:shadow-lg hover:shadow-[#1790d7]/30 disabled:opacity-60 sm:py-4"
                >
                  {submitting ? "Creating account…" : "Create account"}
                  {!submitting && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                </motion.button>
                <p className="text-center text-sm text-gray-500 pt-2">
                  Want a storefront?{" "}
                  <Link href="/seller/register" className="font-semibold text-[#1790d7] hover:underline">
                    Register as a seller
                  </Link>
                </p>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
