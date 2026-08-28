"use client";

import { useState, useEffect } from "react";
import { Phone, Check } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { userApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { normalizePhonePk, validatePhone } from "@/lib/validators";

export default function PhoneVerificationPanel() {
  const { user, refresh } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [phone, setPhone] = useState("");
  const [editing, setEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) return;
    setPhone(user.phone || "");
  }, [user]);

  const verified = !!user?.phone_verified_at;
  const locked = verified && !editing;

  const handleSave = async (e) => {
    e.preventDefault();
    const phoneErr = validatePhone(phone, { required: false });
    if (phoneErr) {
      showError?.(phoneErr);
      return;
    }
    const normalized = phone?.trim() ? normalizePhonePk(phone) : "";
    setSubmitting(true);
    try {
      const res = await userApi.updateProfile({ phone: normalized || null });
      await refresh();
      setEditing(false);
      if (res?.user) setPhone(res.user.phone || "");
      showSuccess?.("Mobile number updated.");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to update mobile number.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80">
      <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
        <Phone className="w-5 h-5 text-[#1790d7]" />
        Mobile phone verification
      </h2>
      <p className="text-sm text-gray-500 mb-4">
        Add your Pakistani mobile number. Used for contact and checkout.
      </p>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {verified ? (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800">
            <Check className="w-3.5 h-3.5" /> Verified
            {phone ? ` · ${phone}` : ""}
          </span>
        ) : (
          <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">
            Not verified
          </span>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <label className="block text-sm font-medium text-gray-700">
              Mobile number <span className="font-normal text-gray-400">(optional)</span>
            </label>
            {verified && !editing && (
              <button
                type="button"
                onClick={() => setEditing(true)}
                className="text-sm font-medium text-[#1790d7] hover:underline"
              >
                Change number
              </button>
            )}
            {editing && (
              <button
                type="button"
                onClick={() => {
                  setEditing(false);
                  setPhone(user?.phone || "");
                }}
                className="text-sm text-gray-500 hover:underline"
              >
                Cancel
              </button>
            )}
          </div>
          <input
            type="text"
            value={phone}
            readOnly={locked}
            onChange={(e) => setPhone(e.target.value.replace(/[^\d+\s]/g, ""))}
            placeholder="923001234567"
            className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] ${
              locked ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""
            }`}
          />
          <p className="text-xs text-gray-500 mt-1">Pakistani mobile only (923… / 03…). Stored as 03XXXXXXXXX.</p>
        </div>
        <button
          type="submit"
          disabled={submitting || locked}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl disabled:opacity-60"
        >
          <Check className="w-4 h-4" /> Save number
        </button>
      </form>
    </div>
  );
}
