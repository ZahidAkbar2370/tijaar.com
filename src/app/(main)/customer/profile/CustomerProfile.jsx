"use client";

import { useState, useEffect } from "react";
import { User, Camera, Check, BadgeCheck, Phone, Smartphone, ShieldCheck } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { userApi, phoneApi, whatsappApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import ProfileSettingsShell from "@/components/customer/ProfileSettingsShell";
import VerifyNumberModal from "@/components/customer/VerifyNumberModal";
import SearchableProvinceCityFields from "@/components/forms/SearchableProvinceCityFields";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
const STORAGE_BASE = API_BASE.replace(/\/api\/v1\/?$/, "");

const fieldClass =
  "w-full px-3.5 sm:px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition";
const labelClass = "block text-sm font-medium text-gray-700 mb-1.5";

function VerifyStatusBadge({ verified }) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-full">
        <BadgeCheck className="w-3 h-3" /> Verified
      </span>
    );
  }
  return (
    <span className="text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-100 px-2 py-0.5 rounded-full">
      Not verified
    </span>
  );
}

function ContactNumberBlock({
  icon: Icon,
  title,
  hint,
  value,
  verified,
  accent = "blue",
  onVerify,
  onChange,
}) {
  const isEmerald = accent === "emerald";
  const iconWrap = isEmerald ? "bg-emerald-50 text-emerald-600" : "bg-sky-50 text-[#1790d7]";
  const btnSmall = isEmerald
    ? "bg-emerald-600 hover:bg-emerald-700 text-white"
    : "bg-[#1790d7] hover:bg-[#1277b8] text-white";
  const linkCls = isEmerald ? "text-emerald-700 hover:text-emerald-800" : "text-[#1790d7] hover:text-[#1277b8]";

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/40 p-3.5 sm:p-4">
      <div className="flex items-start gap-3">
        <span className={`flex shrink-0 w-9 h-9 items-center justify-center rounded-lg ${iconWrap}`}>
          <Icon className="w-4 h-4" strokeWidth={2} />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <VerifyStatusBadge verified={verified} />
          </div>
          <p className="text-xs text-gray-500 mt-0.5">{hint}</p>
          <p className={`mt-2 text-sm font-mono truncate ${value ? "text-gray-900" : "text-gray-400"}`}>
            {value || "Not set"}
          </p>
          <div className="mt-2.5 flex justify-end">
            {verified ? (
              <button
                type="button"
                onClick={onChange}
                className={`text-xs font-semibold hover:underline ${linkCls}`}
              >
                Change number
              </button>
            ) : (
              <button
                type="button"
                onClick={onVerify}
                className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold shadow-sm ${btnSmall}`}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Verify
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CustomerProfile({ hidePageHero = false }) {
  const { user, refresh } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [form, setForm] = useState({
    name: "",
    avatarAlt: "",
    state: "",
    city: "",
    permanent_address: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [phoneModal, setPhoneModal] = useState(null);
  const [waModal, setWaModal] = useState(null);

  useEffect(() => {
    if (!user) return;
    setForm({
      name: user.name || "",
      avatarAlt: user.avatar_alt || "",
      state: user.state || "",
      city: user.city || "",
      permanent_address: user.permanent_address || "",
    });
  }, [user]);

  const phoneVerified = !!user?.phone_verified_at;
  const waVerified = !!user?.whatsapp_verified_at;
  const avatarUrl = user?.avatar_url || (user?.avatar ? `${STORAGE_BASE}/storage/${user.avatar}` : null);

  const setField = (key, value) => setForm((p) => ({ ...p, [key]: value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    if (!form.state?.trim()) {
      showError?.("Please select a province / state.");
      return;
    }
    setSubmitting(true);
    try {
      await userApi.updateProfile({
        name: form.name,
        state: form.state?.trim() || null,
        city: form.city?.trim() || null,
        permanent_address: form.permanent_address?.trim() || null,
      });
      await refresh();
      showSuccess?.("Profile updated.");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to update profile.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fd = new FormData();
    fd.append("avatar", file);
    if (form.avatarAlt?.trim()) fd.append("avatar_alt", form.avatarAlt.trim());
    try {
      const res = await userApi.uploadAvatar(fd);
      if (res.success) await refresh();
      showSuccess?.("Avatar updated.");
    } catch (err) {
      showError?.(err?.message || "Failed to upload avatar.");
    }
  };

  return (
    <ProfileSettingsShell showHero={!hidePageHero}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 items-start">
        {/* Profile card */}
        <form
          onSubmit={handleProfileSave}
          className="lg:col-span-7 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden"
        >
          <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base sm:text-lg">
              <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-[#1790d7]/10 text-[#1790d7]">
                <User className="w-4 h-4" />
              </span>
              Profile information
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 pl-10">
              Update your photo, name, and location.
            </p>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            <div className="flex flex-col xs:flex-row sm:flex-row gap-4 sm:gap-5 items-center sm:items-start">
              <div className="relative shrink-0">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shadow-sm">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={resolveImageAlt(user?.avatar_alt || form.avatarAlt, user?.name || IMAGE_ALT_FALLBACKS.avatar)}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-10 h-10 text-gray-300" />
                  )}
                </div>
                <label className="absolute -bottom-1.5 -right-1.5 w-8 h-8 bg-[#1790d7] rounded-full flex items-center justify-center cursor-pointer hover:bg-[#1277b8] transition shadow-md border-2 border-white">
                  <Camera className="w-3.5 h-3.5 text-white" />
                  <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </label>
              </div>

              <div className="flex-1 w-full min-w-0 space-y-3.5">
                <div>
                  <label className={labelClass}>
                    Avatar alt text <span className="font-normal text-gray-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    value={form.avatarAlt}
                    onChange={(e) => setField("avatarAlt", e.target.value)}
                    placeholder="Describe your profile photo"
                    className={fieldClass}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className={labelClass}>Name</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setField("name", e.target.value)}
                      required
                      className={fieldClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      value={user?.email || ""}
                      readOnly
                      className={`${fieldClass} bg-gray-50 text-gray-600 cursor-not-allowed`}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-1 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-3">Location</p>
              <SearchableProvinceCityFields
                state={form.state}
                city={form.city}
                requiredProvince
                onChange={({ state, city }) => setForm((p) => ({ ...p, state, city }))}
              />
              <div className="mt-3.5">
                <label className={labelClass}>Permanent address</label>
                <textarea
                  value={form.permanent_address}
                  onChange={(e) => setField("permanent_address", e.target.value)}
                  rows={3}
                  placeholder="House / street, area, landmark"
                  className={`${fieldClass} resize-y min-h-[88px]`}
                />
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 py-3.5 sm:py-4 border-t border-gray-100 bg-gray-50/70 flex justify-end">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white text-sm font-semibold rounded-xl disabled:opacity-60 shadow-sm w-full sm:w-auto justify-center"
            >
              <Check className="w-4 h-4" />
              {submitting ? "Saving…" : "Save profile"}
            </button>
          </div>
        </form>

        {/* Contact verification card */}
        <aside className="lg:col-span-5 bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden lg:sticky lg:top-28">
          <div className="px-4 sm:px-5 py-4 border-b border-gray-100">
            <h2 className="font-bold text-gray-900 flex items-center gap-2 text-base">
              <span className="flex w-8 h-8 items-center justify-center rounded-lg bg-[#1790d7]/10 text-[#1790d7]">
                <ShieldCheck className="w-4 h-4" />
              </span>
              Contact verification
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 mt-1.5 pl-10">
              Verify once. Change anytime with a new OTP.
            </p>
          </div>

          <div className="p-4 sm:p-5 space-y-3">
            <ContactNumberBlock
              icon={Phone}
              title="Mobile Number"
              hint="Contact & checkout"
              value={user?.phone}
              verified={phoneVerified}
              accent="blue"
              onVerify={() => setPhoneModal("verify")}
              onChange={() => setPhoneModal("change")}
            />
            <ContactNumberBlock
              icon={Smartphone}
              title="WhatsApp Number"
              hint="Order & payment alerts"
              value={user?.whatsapp_number}
              verified={waVerified}
              accent="emerald"
              onVerify={() => setWaModal("verify")}
              onChange={() => setWaModal("change")}
            />
          </div>
        </aside>
      </div>

      <VerifyNumberModal
        open={!!phoneModal}
        onClose={() => setPhoneModal(null)}
        title="Mobile Number"
        description="We'll send a 6-digit code to this number via SMS."
        initialNumber={phoneModal === "change" ? "" : user?.phone || ""}
        mode={phoneModal === "change" ? "change" : "verify"}
        accent="blue"
        onSendOtp={async (phone) => phoneApi.sendOtp({ phone })}
        onVerifyOtp={async (otp) => {
          const res = await phoneApi.verifyOtp({ otp });
          await refresh();
          showSuccess?.("Mobile Number verified.");
          return res;
        }}
      />

      <VerifyNumberModal
        open={!!waModal}
        onClose={() => setWaModal(null)}
        title="WhatsApp Number"
        description="We'll send a 6-digit code on WhatsApp to verify this number."
        initialNumber={waModal === "change" ? "" : user?.whatsapp_number || ""}
        mode={waModal === "change" ? "change" : "verify"}
        accent="emerald"
        onSendOtp={async (whatsapp_number) => whatsappApi.sendOtp({ whatsapp_number, phone: whatsapp_number })}
        onVerifyOtp={async (otp) => {
          const res = await whatsappApi.verifyOtp({ otp });
          await refresh();
          showSuccess?.("WhatsApp Number verified.");
          return res;
        }}
      />
    </ProfileSettingsShell>
  );
}
