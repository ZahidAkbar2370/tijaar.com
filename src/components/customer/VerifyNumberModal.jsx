"use client";

import { useEffect, useState } from "react";
import { X, Check, AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { validatePkMobile03 } from "@/lib/validators";

const RULES = [
  "Must start with 03",
  "Must be exactly 11 digits",
  "Must be unique (not registered on another account)",
];

function FeedbackBanner({ feedback }) {
  if (!feedback?.message) return null;
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    danger: "bg-red-50 border-red-200 text-red-800",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
  };
  const icons = {
    success: CheckCircle2,
    danger: AlertCircle,
    warning: AlertTriangle,
  };
  const Icon = icons[feedback.type] || AlertCircle;
  const cls = styles[feedback.type] || styles.danger;

  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm ${cls}`} role="alert">
      <Icon className="w-4.5 h-4.5 mt-0.5 shrink-0 w-4 h-4" strokeWidth={2} />
      <p className="font-medium leading-snug">{feedback.message}</p>
    </div>
  );
}

/**
 * Shared verify / change-number modal for Mobile Number or WhatsApp.
 * flow: enter number → send OTP → enter code → verified
 */
export default function VerifyNumberModal({
  open,
  onClose,
  title = "Mobile Number",
  description,
  initialNumber = "",
  mode = "verify", // verify | change
  onSendOtp,
  onVerifyOtp,
  accent = "blue", // blue | emerald
}) {
  const [number, setNumber] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [sentTo, setSentTo] = useState("");
  const [busy, setBusy] = useState(false);
  const [feedback, setFeedback] = useState(null);

  useEffect(() => {
    if (!open) return;
    const digits = String(initialNumber || "").replace(/\D/g, "").slice(0, 11);
    setNumber(digits);
    setOtp("");
    setOtpSent(false);
    setSentTo("");
    setFeedback(null);
    setBusy(false);
  }, [open, initialNumber]);

  if (!open) return null;

  const isEmerald = accent === "emerald";
  const primaryBtn = isEmerald
    ? "bg-emerald-600 hover:bg-emerald-700"
    : "bg-[#1790d7] hover:bg-[#1277b8]";
  const focusRing = isEmerald
    ? "focus:ring-emerald-500/30 focus:border-emerald-500"
    : "focus:ring-[#1790d7]/20 focus:border-[#1790d7]";

  const handleSend = async () => {
    const err = validatePkMobile03(number, { label: title });
    if (err) {
      setFeedback({ type: "warning", message: err });
      return;
    }
    const normalized = String(number).replace(/\D/g, "").slice(0, 11);
    setBusy(true);
    setFeedback(null);
    try {
      const res = await onSendOtp(normalized);
      const to = res?.phone || res?.whatsapp_number || normalized;
      setSentTo(to);
      setNumber(to);
      setOtp("");
      setOtpSent(true);
      setFeedback({
        type: "success",
        message: res?.message || `Verification code sent to ${to}`,
      });
    } catch (e) {
      setFeedback({
        type: "danger",
        message: e?.data?.message || e?.message || "Failed to send code.",
      });
    } finally {
      setBusy(false);
    }
  };

  const handleVerify = async (e) => {
    e?.preventDefault?.();
    const code = String(otp || "").replace(/\D/g, "");
    if (code.length !== 6) {
      setFeedback({ type: "warning", message: "Enter the 6-digit verification code." });
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      const res = await onVerifyOtp(code);
      setFeedback({
        type: "success",
        message: res?.message || `${title} verified successfully.`,
      });
      setTimeout(() => onClose?.(), 600);
    } catch (err) {
      setFeedback({
        type: "danger",
        message: err?.data?.message || err?.message || "Invalid or expired code.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label="Close"
        onClick={() => !busy && onClose?.()}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="verify-number-title"
        className="relative w-full sm:max-w-md rounded-t-2xl sm:rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden max-h-[92vh] flex flex-col"
      >
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3 border-b border-gray-100 shrink-0">
          <div className="min-w-0">
            <h3 id="verify-number-title" className="text-lg font-semibold text-gray-900">
              {mode === "change" ? `Change ${title}` : `Verify ${title}`}
            </h3>
            {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() => onClose?.()}
            className="p-2 rounded-lg text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50 shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-5 py-5 space-y-4 overflow-y-auto">
          <FeedbackBanner feedback={feedback} />

          {!otpSent ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">{title}</label>
                <input
                  type="text"
                  inputMode="numeric"
                  value={number}
                  maxLength={11}
                  onChange={(e) => setNumber(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="03012345678"
                  autoFocus
                  className={`w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm ${focusRing}`}
                />
                <ul className="mt-3 space-y-1.5 text-xs text-gray-600">
                  {RULES.map((rule) => (
                    <li key={rule} className="flex items-start gap-2">
                      <span className="mt-1.5 w-1 h-1 rounded-full bg-gray-400 shrink-0" />
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                disabled={busy || number.length !== 11}
                onClick={handleSend}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-60 ${primaryBtn}`}
              >
                {busy ? "Sending…" : "Send verification code"}
              </button>
            </>
          ) : (
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <p className="text-sm text-gray-600 mb-3">
                  Enter the code sent to <span className="font-mono font-semibold text-gray-900">{sentTo || number}</span>
                </p>
                <label className="block text-sm font-medium text-gray-700 mb-2">6-digit OTP</label>
                <input
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  autoFocus
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="••••••"
                  className={`w-full px-4 py-3 border border-gray-200 rounded-xl text-center text-xl tracking-[0.4em] font-semibold ${focusRing}`}
                />
              </div>
              <button
                type="submit"
                disabled={busy || String(otp).replace(/\D/g, "").length !== 6}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-xl disabled:opacity-60 ${primaryBtn}`}
              >
                <Check className="w-4 h-4" />
                {busy ? "Verifying…" : "Verify"}
              </button>
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <button
                  type="button"
                  disabled={busy}
                  onClick={handleSend}
                  className={`font-medium hover:underline disabled:opacity-60 ${isEmerald ? "text-emerald-700" : "text-[#1790d7]"}`}
                >
                  Resend code
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setFeedback(null);
                  }}
                  className="text-gray-500 hover:underline disabled:opacity-60"
                >
                  Change number
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
