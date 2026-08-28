"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  Store,
  MapPin,
  FileText,
  ChevronRight,
  ChevronLeft,
  Upload,
  Sparkles,
} from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHero from "@/components/customer/PageHero";
import { sellerStoreApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import useAuth from "@/hooks/useAuth";

const STEPS = [
  { id: 1, title: "Store Info", icon: Store },
  { id: 2, title: "Contact & Location", icon: MapPin },
  { id: 3, title: "Policies", icon: FileText },
];

export default function CreateStorePage() {
  const router = useRouter();
  const { refresh, user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [step, setStep] = useState(1);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    sellerStoreApi.get().then((res) => {
      if (res.has_store) router.replace("/seller/dashboard");
      setChecking(false);
    }).catch(() => setChecking(false));
  }, [router]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    logo: null,
    banner: null,
    address: "",
    zip_code: "",
    shipping_policy: "",
    return_policy: "",
    logo_alt: "",
    banner_alt: "",
  });

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const canProceed = () => {
    if (step === 1) return form.name?.trim();
    if (step === 2) return true;
    return true;
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
    else handleSubmit();
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      showError?.("Store name is required");
      return;
    }
    setSubmitting(true);
    try {
      await sellerStoreApi.create(form);
      showSuccess?.("Store created! Add your first product.");
      await refresh?.();
      router.replace("/seller/products/add");
    } catch (err) {
      const data = err?.data;
      const msg = data?.message || err?.message || "Failed to create store";
      const errors = data?.errors;
      if (errors && typeof errors === "object") {
        const firstError = Object.values(errors).flat()[0];
        showError?.(firstError || msg);
      } else {
        showError?.(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="min-h-[400px] flex items-center justify-center">
          <div className="animate-spin w-10 h-10 border-2 border-[#1790d7] border-t-transparent rounded-full" />
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <div>
          <Link href="/seller/dashboard" className="text-amber-600 text-sm hover:underline flex items-center gap-1 mb-4">
            ← Back to Dashboard
          </Link>
          <PageHero
            title="Create Your Store"
            description="Follow the steps below to set up your store on Tijaar. Add store info, contact & location, and policies. Your store will be visible to buyers once complete."
            illustration="store"
            guide="Tip: Fill all required fields in each section. You can add products after your store is approved."
          />
        </div>

        <div className="flex items-center gap-2 mb-10">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const active = step === s.id;
            const done = step > s.id;
            return (
              <div key={s.id} className="flex items-center">
                <div
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition ${
                    active ? "bg-[#1790d7] text-white shadow-lg shadow-[#1790d7]/25" : done ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-500"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {s.title}
                </div>
                {i < STEPS.length - 1 && <ChevronRight className="w-5 h-5 text-gray-300 mx-1" />}
              </div>
            );
          })}
        </div>

        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 mb-8"
        >
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div key="1" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Name *</label>
                  <div className="relative">
                    <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => update("name", e.target.value)}
                      placeholder="e.g. My Awesome Shop"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                    placeholder="Tell customers about your store..."
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Logo</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">{form.logo ? form.logo.name : "Click to upload"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => update("logo", e.target.files[0])} />
                    </label>
                    <input
                      type="text"
                      value={form.logo_alt}
                      onChange={(e) => update("logo_alt", e.target.value)}
                      placeholder="Logo alt text (optional)"
                      className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#1790d7]/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Banner</label>
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
                      <Upload className="w-8 h-8 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">{form.banner ? form.banner.name : "Click to upload"}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => update("banner", e.target.files[0])} />
                    </label>
                    <input
                      type="text"
                      value={form.banner_alt}
                      onChange={(e) => update("banner_alt", e.target.value)}
                      placeholder="Banner alt text (optional)"
                      className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-[#1790d7]/20"
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div key="2" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div className="rounded-xl border border-gray-100 bg-gray-50/70 p-4 text-sm text-gray-600">
                  <p className="font-semibold text-gray-800 mb-2">From your profile (used on the store)</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1">
                    <p>Email: {user?.email || "—"}</p>
                    <p>Phone: {user?.phone || "—"}</p>
                    <p>Province: {user?.state || "—"}</p>
                    <p>City: {user?.city || "—"}</p>
                  </div>
                  <Link href="/seller/profile" className="inline-block mt-3 text-sm font-medium text-[#1790d7] hover:underline">
                    Update in profile
                  </Link>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store address</label>
                  <div className="relative">
                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={form.address}
                      onChange={(e) => update("address", e.target.value)}
                      placeholder="Street address"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Zip / Postal code</label>
                  <input
                    type="text"
                    value={form.zip_code}
                    onChange={(e) => update("zip_code", e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20"
                  />
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div key="3" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Shipping Policy</label>
                  <textarea
                    value={form.shipping_policy}
                    onChange={(e) => update("shipping_policy", e.target.value)}
                    placeholder="Describe your shipping methods, timeframes, and costs..."
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Return Policy</label>
                  <textarea
                    value={form.return_policy}
                    onChange={(e) => update("return_policy", e.target.value)}
                    placeholder="Describe your return and refund policy..."
                    rows={4}
                    className="w-full px-4 py-3.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => setStep((s) => Math.max(1, s - 1))}
            disabled={step === 1}
            className="px-6 py-3 rounded-xl border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Back
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={!canProceed() || submitting}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white font-medium hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? "Creating..." : step === 3 ? "Create Store" : "Continue"}
            {step < 3 && <ChevronRight className="w-4 h-4" />}
            {step === 3 && !submitting && <Sparkles className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </ProtectedRoute>
  );
}
