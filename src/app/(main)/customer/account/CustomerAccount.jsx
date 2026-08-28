"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { userApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";

const fieldClass =
  "w-full pl-11 pr-11 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition";

export default function CustomerAccount() {
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setError("");
  };

  const clearForm = () => {
    setForm({ current_password: "", password: "", password_confirmation: "" });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.current_password || !form.password || !form.password_confirmation) {
      setError("All fields are required.");
      return;
    }
    if (form.password.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setError("New passwords do not match.");
      return;
    }
    setSubmitting(true);
    try {
      await userApi.changePassword({
        current_password: form.current_password,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });
      showSuccess?.("Password updated successfully.");
      clearForm();
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Failed to update password.";
      setError(msg);
      showError?.(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileSettingsShell
      title="Change Password"
      description="Update your account password. You will stay logged in on this device."
    >
      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden max-w-xl mx-auto">
        <div className="px-5 sm:px-6 py-4 border-b border-gray-100">
          <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
            <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-[#1790d7]/10 text-[#1790d7]">
              <Lock className="w-4 h-4" />
            </span>
            Change Password
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1.5 pl-10">
            Welcome{user?.name ? `, ${user.name}` : ""}. Choose a strong password you don&apos;t use elsewhere.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-800" role="alert">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showCurrent ? "text" : "password"}
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Enter current password"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                aria-label={showCurrent ? "Hide password" : "Show password"}
              >
                {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className={fieldClass}
                placeholder="Min 8 characters"
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600"
                aria-label={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm new password</label>
            <div className="relative">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full pl-11 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition"
                placeholder="Confirm new password"
                autoComplete="new-password"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={clearForm}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50"
            >
              <X className="w-3.5 h-3.5" />
              Clear
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-lg disabled:opacity-60 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              {submitting ? "Updating…" : "Update"}
            </button>
          </div>
        </form>

        <div className="px-5 sm:px-6 py-3 border-t border-gray-100 bg-gray-50/60">
          <p className="text-xs text-gray-500">
            Forgot your password?{" "}
            <a href="/forgot-password" className="text-[#1790d7] font-semibold hover:underline">
              Request reset link
            </a>
          </p>
        </div>
      </div>
    </ProfileSettingsShell>
  );
}
