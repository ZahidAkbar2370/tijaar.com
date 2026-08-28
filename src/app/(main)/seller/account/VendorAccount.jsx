"use client";

import { useState } from "react";
import { Lock, Eye, EyeOff, Check, X } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { userApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";

export default function VendorAccount() {
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
      setForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (err) {
      setError(err?.data?.message || err?.message || "Failed to update password.");
      showError?.(err?.data?.message || err?.message || "Failed to update password.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProfileSettingsShell>
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Lock className="w-5 h-5 text-[#1790d7]" />
          Change Password
        </h2>
        <p className="text-gray-500 text-sm mb-6">
          Welcome{user?.name ? `, ${user.name}` : ""}. Update your password — you will stay logged in.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5 max-w-xl">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showCurrent ? "text" : "password"}
                name="current_password"
                value={form.current_password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                className="w-full pl-12 pr-12 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                placeholder="Min 8 characters"
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400"
              >
                {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type={showNew ? "text" : "password"}
                name="password_confirmation"
                value={form.password_confirmation}
                onChange={handleChange}
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                placeholder="Confirm new password"
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl transition disabled:opacity-60"
            >
              {submitting ? "Updating..." : "Update Password"}
              <Check className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => {
                setForm({ current_password: "", password: "", password_confirmation: "" });
                setError("");
              }}
              className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 rounded-xl font-medium text-gray-600 hover:bg-gray-50"
            >
              Clear
              <X className="w-4 h-4" />
            </button>
          </div>
        </form>

        <p className="mt-6 text-sm text-gray-500">
          Forgot your password?{" "}
          <a href="/forgot-password" className="text-[#1790d7] font-semibold hover:underline">
            Request reset link
          </a>
        </p>
      </div>
    </ProfileSettingsShell>
  );
}
