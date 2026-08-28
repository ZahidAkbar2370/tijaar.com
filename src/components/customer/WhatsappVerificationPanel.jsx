"use client";

import { useState, useEffect } from "react";
import { Smartphone, Check } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { userApi, whatsappApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { normalizePhonePk, validatePhone } from "@/lib/validators";

export default function WhatsappVerificationPanel() {
  const { user, refresh } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [waNumberEditing, setWaNumberEditing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [wachatEnabled, setWachatEnabled] = useState(false);
  const [waVerified, setWaVerified] = useState(false);
  const [waOtpSent, setWaOtpSent] = useState(false);
  const [waOtpPhone, setWaOtpPhone] = useState("");
  const [waOtp, setWaOtp] = useState("");
  const [waBusy, setWaBusy] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    setWhatsappNumber(user.whatsapp_number || "");
    setWaVerified(!!user.whatsapp_verified_at);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    setLoading(true);
    whatsappApi
      .status()
      .then((waRes) => {
        if (cancelled) return;
        setWachatEnabled(!!waRes.wachat_enabled);
        setWaVerified(!!waRes.whatsapp_verified);
        if (waRes.whatsapp_number) setWhatsappNumber(waRes.whatsapp_number);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const waNumberLocked = waVerified && !waNumberEditing;

  const handleSaveNumber = async (e) => {
    e.preventDefault();
    const waErr = validatePhone(whatsappNumber, { required: false });
    if (waErr) {
      showError?.(waErr.replace("Phone", "WhatsApp number").replace("phone", "WhatsApp number"));
      return;
    }
    const waNormalized = whatsappNumber?.trim() ? normalizePhonePk(whatsappNumber) : "";
    const previousWa = user?.whatsapp_number?.trim() ? normalizePhonePk(user.whatsapp_number) : "";
    const waChanged = (waNormalized || "") !== (previousWa || "");
    setSubmitting(true);
    try {
      const res = await userApi.updateProfile({ whatsapp_number: waNormalized || null });
      await refresh();
      if (waChanged) {
        setWaNumberEditing(false);
        setWaOtpSent(false);
        setWaOtp("");
        setWaOtpPhone("");
      }
      if (res?.user) {
        setWhatsappNumber(res.user.whatsapp_number || "");
        setWaVerified(!!res.user.whatsapp_verified_at);
      } else if (waChanged) {
        setWaVerified(false);
      }
      showSuccess?.("WhatsApp number updated.");
    } catch (err) {
      showError?.(err?.message || "Failed to update WhatsApp number.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendWaOtp = async () => {
    const phoneErr = validatePhone(whatsappNumber);
    if (phoneErr) {
      showError?.(phoneErr.replace("Phone", "WhatsApp number").replace("phone", "WhatsApp number") || "Enter a valid WhatsApp number.");
      return;
    }
    const phone = normalizePhonePk(whatsappNumber);
    setWaBusy(true);
    try {
      await userApi.updateProfile({ whatsapp_number: phone });
      const res = await whatsappApi.sendOtp({ whatsapp_number: phone, phone });
      const sentTo = res.whatsapp_number || res.phone || phone;
      setWhatsappNumber(sentTo);
      setWaOtpPhone(sentTo);
      setWaOtp("");
      setWaOtpSent(true);
      showSuccess?.(res?.message || "OTP sent to WhatsApp.");
      refresh().catch(() => {});
    } catch (err) {
      setWaOtpSent(false);
      showError?.(err?.data?.message || err?.message || "Failed to send WhatsApp OTP.");
    } finally {
      setWaBusy(false);
    }
  };

  const handleVerifyWaOtp = async (e) => {
    e?.preventDefault?.();
    const code = String(waOtp || "").replace(/\D/g, "");
    if (code.length !== 6) {
      showError?.("Enter the 6-digit code from WhatsApp.");
      return;
    }
    setWaBusy(true);
    try {
      const res = await whatsappApi.verifyOtp({ otp: code });
      setWaVerified(true);
      setWaNumberEditing(false);
      setWaOtpSent(false);
      setWaOtp("");
      setWaOtpPhone("");
      await refresh();
      showSuccess?.(res?.message || "WhatsApp verified.");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Invalid or expired code.");
    } finally {
      setWaBusy(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200/80">
        <h2 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          WhatsApp number
        </h2>
        <form onSubmit={handleSaveNumber} className="space-y-4">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="block text-sm font-medium text-gray-700">
                WhatsApp number <span className="font-normal text-gray-400">(optional)</span>
              </label>
              {waVerified && !waNumberEditing && (
                <button
                  type="button"
                  onClick={() => setWaNumberEditing(true)}
                  className="text-sm font-medium text-[#1790d7] hover:underline"
                >
                  Change WhatsApp number
                </button>
              )}
              {waNumberEditing && (
                <button
                  type="button"
                  onClick={() => {
                    setWaNumberEditing(false);
                    setWhatsappNumber(user?.whatsapp_number || "");
                  }}
                  className="text-sm text-gray-500 hover:underline"
                >
                  Cancel
                </button>
              )}
            </div>
            <input
              type="text"
              value={whatsappNumber}
              readOnly={waNumberLocked}
              onChange={(e) => setWhatsappNumber(e.target.value.replace(/[^\d+\s]/g, ""))}
              placeholder="923001234567"
              className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] ${
                waNumberLocked ? "bg-gray-50 text-gray-700 cursor-not-allowed" : ""
              }`}
            />
            <p className="text-xs text-gray-500 mt-1">
              {waNumberLocked
                ? "Verified WhatsApp number is locked. Use Change WhatsApp number to update."
                : "Used for WhatsApp OTPs and alerts. Pakistani mobile only (923… / 03…)."}
            </p>
          </div>
          <button
            type="submit"
            disabled={submitting || waNumberLocked}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl disabled:opacity-60"
          >
            <Check className="w-4 h-4" /> Save number
          </button>
        </form>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100">
        <h2 className="font-bold text-gray-900 mb-1 flex items-center gap-2">
          <Smartphone className="w-5 h-5 text-emerald-600" />
          WhatsApp verification
        </h2>
        <p className="text-sm text-gray-500 mb-4">
          Verify your WhatsApp number to receive order and payment updates on WhatsApp.
        </p>

        <div className="flex flex-wrap items-center gap-2 mb-4">
          {waVerified ? (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-100 text-emerald-800">
              <Check className="w-3.5 h-3.5" /> Verified
              {whatsappNumber ? ` · ${whatsappNumber}` : ""}
            </span>
          ) : (
            <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">
              Not verified
            </span>
          )}
        </div>

        {!wachatEnabled && !waVerified && (
          <p className="text-sm text-gray-600">WhatsApp verification is not available right now. You can still save your number above.</p>
        )}

        {wachatEnabled && !waVerified && !waOtpSent && (
          <div className="rounded-xl border border-gray-200 bg-gray-50/80 p-4 space-y-3">
            <p className="text-sm text-gray-700">
              We will send a 6-digit code to{" "}
              <span className="font-semibold font-mono">
                {whatsappNumber?.trim() || "your WhatsApp number"}
              </span>{" "}
              on WhatsApp. Save your WhatsApp number first if you changed it.
            </p>
            <button
              type="button"
              disabled={waBusy || !whatsappNumber?.trim()}
              onClick={handleSendWaOtp}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
            >
              {waBusy ? "Sending…" : "Send OTP on WhatsApp"}
            </button>
          </div>
        )}

        {wachatEnabled && !waVerified && waOtpSent && (
          <form
            onSubmit={handleVerifyWaOtp}
            className="rounded-xl border border-emerald-200 bg-emerald-50/50 p-4 space-y-4"
          >
            <div>
              <p className="text-sm font-semibold text-gray-900">Enter verification code</p>
              <p className="text-xs text-gray-600 mt-1">
                Code sent to{" "}
                <span className="font-mono font-medium">{waOtpPhone || whatsappNumber}</span> via WhatsApp.
              </p>
            </div>
            <div>
              <label htmlFor="wa-otp-code" className="block text-sm font-medium text-gray-700 mb-2">
                6-digit OTP
              </label>
              <input
                id="wa-otp-code"
                type="text"
                name="otp"
                inputMode="numeric"
                autoComplete="one-time-code"
                autoFocus
                maxLength={6}
                value={waOtp}
                onChange={(e) => setWaOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                placeholder="••••••"
                className="w-full max-w-xs px-4 py-3 border border-gray-200 rounded-xl text-center text-xl tracking-[0.4em] font-semibold focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={waBusy || String(waOtp).replace(/\D/g, "").length !== 6}
                className="inline-flex items-center justify-center px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl disabled:opacity-60"
              >
                {waBusy ? "Verifying…" : "Verify OTP"}
              </button>
              <button
                type="button"
                disabled={waBusy}
                onClick={handleSendWaOtp}
                className="text-sm font-medium text-emerald-700 hover:underline disabled:opacity-60"
              >
                Resend code
              </button>
              <button
                type="button"
                disabled={waBusy}
                onClick={() => {
                  setWaOtpSent(false);
                  setWaOtp("");
                  setWaOtpPhone("");
                }}
                className="text-sm text-gray-500 hover:underline disabled:opacity-60"
              >
                Change number
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
