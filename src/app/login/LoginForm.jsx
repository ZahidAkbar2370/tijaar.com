"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, ShieldCheck, ShoppingBag, Store } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { authApi } from "@/lib/api";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import RecaptchaField, { resetRecaptcha } from "@/components/auth/RecaptchaField";

const features = [
  { icon: ShieldCheck, text: "Secure checkout & trusted sellers" },
  { icon: ShoppingBag, text: "Shop from sellers across Pakistan" },
  { icon: Store, text: "List items and manage orders easily" },
];

import { postLoginPath, safeRedirectPath } from "@/lib/authRedirect";

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

export default function LoginForm() {
  const { login, user, loading } = useAuth();
  const { showError } = useSnackbar();
  const { login_logo_url, login_logo_alt, recaptcha_enabled, recaptcha_site_key, recaptcha_on_login } =
    useSiteSettings();
  const router = useRouter();

  const showRecaptcha = !!(recaptcha_enabled && recaptcha_on_login && recaptcha_site_key);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "", recaptcha: "" });
  const [googleLoading, setGoogleLoading] = useState(false);

  useEffect(() => {
    const error = readQueryParam("error");
    if (error) showError(decodeURIComponent(error));
  }, [showError]);

  useEffect(() => {
    if (loading || !user) return;
    router.replace(postLoginPath(user, safeRedirectPath(readQueryParam("redirect"))));
  }, [user, loading, router]);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      const redirectPath = readQueryParam("redirect") || undefined;
      const res = await authApi.socialRedirectUrl("google", redirectPath);
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      showError?.("Could not get Google login URL");
    } catch (err) {
      showError?.(err?.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({ email: "", password: "", recaptcha: "" });
    if (showRecaptcha && !recaptchaToken) {
      setErrors((prev) => ({ ...prev, recaptcha: "Please complete the reCAPTCHA challenge." }));
      return;
    }
    setSubmitting(true);
    try {
      const data = await login({
        email,
        password,
        remember_me: rememberMe,
        ...(showRecaptcha ? { recaptcha_token: recaptchaToken } : {}),
      });
      router.push(postLoginPath(data?.user, safeRedirectPath(readQueryParam("redirect"))));
    } catch (err) {
      if (showRecaptcha) {
        setRecaptchaToken("");
        resetRecaptcha();
      }
      if (err?.data?.requires_verification && err?.data?.email) {
        showError?.(err?.data?.message || "Please verify your email first");
        router.replace(`/verify-otp?email=${encodeURIComponent(err.data.email)}`);
        return;
      }
      const apiErrors = err?.data?.errors || {};
      const errorCode = err?.data?.error_code;
      if (apiErrors.recaptcha_token || errorCode === "recaptcha_failed") {
        setErrors((prev) => ({
          ...prev,
          recaptcha: Array.isArray(apiErrors.recaptcha_token)
            ? apiErrors.recaptcha_token[0]
            : apiErrors.recaptcha_token || err?.data?.message || "reCAPTCHA verification failed.",
        }));
      } else if (apiErrors.email) {
        setErrors((prev) => ({ ...prev, email: Array.isArray(apiErrors.email) ? apiErrors.email[0] : apiErrors.email }));
      } else if (errorCode === "email_not_found") {
        setErrors({ email: "Email address doesn't exist", password: "", recaptcha: "" });
      } else if (errorCode === "invalid_password") {
        setErrors({ email: "", password: "Password is wrong", recaptcha: "" });
      } else if (apiErrors.password) {
        setErrors((prev) => ({ ...prev, password: Array.isArray(apiErrors.password) ? apiErrors.password[0] : apiErrors.password }));
      } else {
        showError?.(err?.data?.message || err?.message || "Login failed. Please try again.");
      }
    } finally {
      setSubmitting(false);
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
                Welcome back to Tijaar
              </h1>
              <p className="mt-3 max-w-sm text-base leading-relaxed text-white/85">
                Sign in to shop, sell, and manage your marketplace account in one place.
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
                  Sign in
                </h2>
                <p className="mt-2 text-sm text-gray-500 sm:text-[15px]">
                  New to Tijaar?{" "}
                  <Link href="/register" className="font-semibold text-[#1790d7] hover:underline">
                    Create an account
                  </Link>
                </p>
              </header>

              <button
                type="button"
                onClick={handleGoogleLogin}
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

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                  <div className="w-full border-t border-gray-200" />
                </div>
                <div className="relative flex justify-center text-xs uppercase tracking-wide">
                  <span className="bg-white px-3 text-gray-400">or email</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5" noValidate>
                <div>
                  <label htmlFor="login-email" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="login-email"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setErrors((prev) => ({ ...prev, email: "" }));
                      }}
                      placeholder="you@example.com"
                      autoComplete="email"
                      className={`${inputBase} ${errors.email ? "border-red-400" : "border-gray-200"}`}
                      required
                      aria-invalid={!!errors.email}
                      aria-describedby={errors.email ? "login-email-error" : undefined}
                    />
                  </div>
                  {errors.email && (
                    <p id="login-email-error" className="mt-1.5 text-sm text-red-500">
                      {errors.email}
                    </p>
                  )}
                </div>

                <div>
                  <label htmlFor="login-password" className="mb-1.5 block text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-400" aria-hidden="true" />
                    <input
                      id="login-password"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setErrors((prev) => ({ ...prev, password: "" }));
                      }}
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      className={`${inputBase} pr-11 ${errors.password ? "border-red-400" : "border-gray-200"}`}
                      required
                      aria-invalid={!!errors.password}
                      aria-describedby={errors.password ? "login-password-error" : undefined}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-gray-400 hover:text-gray-600"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p id="login-password-error" className="mt-1.5 text-sm text-red-500">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="flex items-center justify-between gap-3 pt-0.5">
                  <label htmlFor="remember-me" className="flex cursor-pointer select-none items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      id="remember-me"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-[#1790d7] focus:ring-[#1790d7]"
                    />
                    Remember me
                  </label>
                  <Link
                    href="/forgot-password"
                    className="shrink-0 text-sm font-semibold text-[#1790d7] hover:underline"
                  >
                    Forgot password?
                  </Link>
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
                  {submitting ? "Signing in…" : "Sign in"}
                  {!submitting && <ArrowRight className="h-5 w-5" aria-hidden="true" />}
                </motion.button>
              </form>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
