"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  User,
  Phone,
  Store,
  BadgeCheck,
  Building2,
  ArrowRight,
} from "lucide-react";
import { authApi, setToken } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { isValidEmail, normalizePhonePk } from "@/lib/validators";
import RecaptchaField, { resetRecaptcha } from "@/components/auth/RecaptchaField";
import useAuth from "@/hooks/useAuth";
import LocationFields from "@/components/forms/LocationFields";
import KycDocumentFields, {
  appendKycToFormData,
  validateKycDocumentFields,
} from "@/components/forms/KycDocumentFields";

const inputBase =
  "w-full pl-11 pr-4 py-3 rounded-xl border bg-white text-gray-900 placeholder:text-gray-400 text-[15px] focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7]";

const sectionTitle = "text-sm font-semibold text-gray-900 uppercase tracking-wide mb-3";

export default function SellerRegisterPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const { login_logo_url, login_logo_alt, recaptcha_enabled, recaptcha_site_key, recaptcha_on_register } =
    useSiteSettings();
  const showRecaptcha = !!(recaptcha_enabled && recaptcha_on_register && recaptcha_site_key);

  const [step, setStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [idFrontFile, setIdFrontFile] = useState(null);
  const [idBackFile, setIdBackFile] = useState(null);
  const [logoFile, setLogoFile] = useState(null);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
    store_name: "",
    store_description: "",
    store_address: "",
    store_city: "",
    store_state: "",
    store_country: "Pakistan",
    store_phone: "",
    store_email: "",
    tax_id: "",
    bank_account_holder: "",
    bank_account_number: "",
    bank_name: "",
    bank_swift_code: "",
    document_type: "govt_id",
    cnic: "",
    licence_number: "",
    agreeToTerms: false,
  });

  const setField = (name, value) => {
    setForm((p) => ({ ...p, [name]: value }));
    setErrors((e) => ({ ...e, [name]: "" }));
  };

  const resolvePhone = (raw) => {
    const t = String(raw || "").trim();
    if (!t) return null;
    return normalizePhonePk(t) || normalizePhonePk(`+92${t}`) || normalizePhonePk(`92${t}`);
  };

  const validateStep = (n) => {
    const e = {};
    if (n === 1) {
      if (!form.name.trim()) e.name = "Full name is required";
      if (!form.email.trim()) e.email = "Email is required";
      else if (!isValidEmail(form.email)) e.email = "Enter a valid email";
      if (!resolvePhone(form.phone)) e.phone = "Enter a valid Pakistani mobile (03XXXXXXXXX)";
      if (!form.password || form.password.length < 8) e.password = "Password must be at least 8 characters";
      if (form.password !== form.password_confirmation) e.password_confirmation = "Passwords do not match";
    }
    if (n === 2) {
      if (!form.store_name.trim()) e.store_name = "Store name is required";
    }
    if (n === 3) {
      Object.assign(e, validateKycDocumentFields(form, idFrontFile, idBackFile));
      if (!form.agreeToTerms) e.agreeToTerms = "You must agree to the terms";
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const next = () => {
    if (!validateStep(step)) return;
    setStep((s) => Math.min(3, s + 1));
  };

  const handleSubmit = async (ev) => {
    ev.preventDefault();
    if (!validateStep(3)) return;
    if (showRecaptcha && !recaptchaToken) {
      setErrors((p) => ({ ...p, recaptcha: "Please complete the reCAPTCHA challenge." }));
      return;
    }
    setSubmitting(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === "agreeToTerms" || k === "document_type" || k === "cnic" || k === "licence_number") return;
        if (k === "phone") {
          fd.append("phone", resolvePhone(form.phone) || form.phone);
          return;
        }
        if (v != null && v !== "") fd.append(k, String(v));
      });
      appendKycToFormData(fd, form, idFrontFile, idBackFile);
      if (logoFile) fd.append("logo", logoFile);
      if (recaptchaToken) fd.append("recaptcha_token", recaptchaToken);

      const res = await authApi.registerSeller(fd);
      if (res.requires_verification) {
        showSuccess?.(res.message || "Account created. Verify your email.");
        router.push(`/verify-otp?email=${encodeURIComponent(res.email || form.email)}&redirect=${encodeURIComponent("/seller/dashboard")}`);
        return;
      }
      if (res.token) {
        setToken(res.token);
        await refresh?.();
      }
      showSuccess?.(res.message || "Seller application submitted. Awaiting admin approval.");
      router.push("/seller/dashboard");
    } catch (err) {
      const apiErrors = err?.data?.errors || {};
      const flat = {};
      Object.entries(apiErrors).forEach(([k, v]) => {
        flat[k] = Array.isArray(v) ? v[0] : String(v);
      });
      if (Object.keys(flat).length) setErrors(flat);
      showError?.(err?.data?.message || err?.message || "Registration failed");
      resetRecaptcha?.();
      setRecaptchaToken("");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-[70vh] bg-gradient-to-b from-slate-50 to-white py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          {login_logo_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={login_logo_url} alt={login_logo_alt || "Tijaar"} className="h-12 mx-auto mb-4 object-contain" />
          )}
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Become a seller</h1>
          <p className="text-gray-600 mt-2 text-sm sm:text-base">
            Create your store account. Admin will approve your seller profile and KYC before you go live.
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Looking to sell a few items as a customer?{" "}
            <Link href="/register" className="text-[#1790d7] hover:underline">
              Register as customer
            </Link>
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                  step >= n ? "bg-[#1790d7] text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                {n}
              </div>
              {n < 3 && <div className={`w-10 h-0.5 ${step > n ? "bg-[#1790d7]" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          {step === 1 && (
            <div className="space-y-4">
              <p className={sectionTitle}><User className="inline w-4 h-4 mr-1" /> Account</p>
              {[
                ["name", "Full name", User],
                ["email", "Email", Mail],
                ["phone", "Mobile (03XXXXXXXXX)", Phone],
              ].map(([name, label, Icon]) => (
                <div key={name}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      name={name}
                      type={name === "email" ? "email" : "text"}
                      value={form[name]}
                      onChange={(e) => setField(name, e.target.value)}
                      className={`${inputBase} ${errors[name] ? "border-red-400" : "border-gray-200"}`}
                      autoComplete={name === "email" ? "email" : "on"}
                    />
                  </div>
                  {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
                </div>
              ))}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password}
                    onChange={(e) => setField("password", e.target.value)}
                    className={`${inputBase} pr-12 ${errors.password ? "border-red-400" : "border-gray-200"}`}
                    autoComplete="new-password"
                  />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400" onClick={() => setShowPassword((v) => !v)}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirm password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={form.password_confirmation}
                    onChange={(e) => setField("password_confirmation", e.target.value)}
                    className={`${inputBase} ${errors.password_confirmation ? "border-red-400" : "border-gray-200"}`}
                    autoComplete="new-password"
                  />
                </div>
                {errors.password_confirmation && <p className="text-xs text-red-600 mt-1">{errors.password_confirmation}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <p className={sectionTitle}><Store className="inline w-4 h-4 mr-1" /> Store</p>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store name</label>
                <div className="relative">
                  <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input value={form.store_name} onChange={(e) => setField("store_name", e.target.value)} className={`${inputBase} ${errors.store_name ? "border-red-400" : "border-gray-200"}`} />
                </div>
                {errors.store_name && <p className="text-xs text-red-600 mt-1">{errors.store_name}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea value={form.store_description} onChange={(e) => setField("store_description", e.target.value)} rows={3} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25" />
              </div>
              <LocationFields
                country={form.store_country}
                state={form.store_state}
                city={form.store_city}
                lockCountry
                defaultCountry="Pakistan"
                onChange={({ country, state, city }) =>
                  setForm((p) => ({
                    ...p,
                    store_country: country || "Pakistan",
                    store_state: state,
                    store_city: city,
                  }))
                }
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                <input value={form.store_address} onChange={(e) => setField("store_address", e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Store logo (optional)</label>
                <input type="file" accept="image/*" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} className="text-sm" />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <p className={sectionTitle}><BadgeCheck className="inline w-4 h-4 mr-1" /> KYC &amp; payouts</p>
              <KycDocumentFields
                form={form}
                setField={setField}
                errors={errors}
                setErrors={setErrors}
                idFrontFile={idFrontFile}
                setIdFrontFile={setIdFrontFile}
                idBackFile={idBackFile}
                setIdBackFile={setIdBackFile}
                showTaxId
              />
              <label className="flex items-start gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.agreeToTerms} onChange={(e) => setField("agreeToTerms", e.target.checked)} className="mt-1" />
                <span>
                  I agree to the{" "}
                  <Link href="/page/terms" className="text-[#1790d7] hover:underline">
                    seller terms
                  </Link>{" "}
                  and confirm my information is accurate.
                </span>
              </label>
              {errors.agreeToTerms && <p className="text-xs text-red-600">{errors.agreeToTerms}</p>}
              {showRecaptcha && (
                <div>
                  <RecaptchaField siteKey={recaptcha_site_key} onChange={setRecaptchaToken} />
                  {errors.recaptcha && <p className="text-xs text-red-600 mt-1">{errors.recaptcha}</p>}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-gray-100">
            {step > 1 ? (
              <button type="button" onClick={() => setStep((s) => s - 1)} className="px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-xl">
                Back
              </button>
            ) : (
              <Link href="/login" className="text-sm text-gray-500 hover:text-[#1790d7]">
                Already have an account? Sign in
              </Link>
            )}
            {step < 3 ? (
              <button type="button" onClick={next} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1790d7] text-white text-sm font-semibold rounded-xl hover:bg-[#147bb8]">
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button type="submit" disabled={submitting} className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1790d7] text-white text-sm font-semibold rounded-xl hover:bg-[#147bb8] disabled:opacity-60">
                {submitting ? "Submitting…" : "Submit application"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
