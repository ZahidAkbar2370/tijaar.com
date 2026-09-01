"use client";

import { CreditCard, Wallet, X } from "lucide-react";

export default function ListingPayModal({
  payListing,
  formatPrice,
  paymentOptions,
  payMethod,
  setPayMethod,
  payPhone,
  setPayPhone,
  payCnic,
  setPayCnic,
  payErrors,
  setPayErrors,
  paySubmitting,
  onClose,
  onPay,
}) {
  if (!payListing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="listing-pay-title">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden="true" />
      <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3 p-5 border-b border-gray-100">
          <div>
            <h2 id="listing-pay-title" className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#1790d7]" />
              Pay to activate
            </h2>
            <p className="text-sm text-gray-500 mt-1 line-clamp-1">{payListing.name}</p>
            <p className="text-sm font-semibold text-[#1790d7] mt-1">
              Listing fee{payListing.fee != null ? `: ${formatPrice(payListing.fee)}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={paySubmitting}
            className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          <p className="text-sm text-gray-600">Choose an enabled payment method, then pay to publish your listing.</p>

          {payErrors.form && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{payErrors.form}</div>
          )}
          {payErrors.payment_method && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-700">{payErrors.payment_method}</div>
          )}

          {paymentOptions.length === 0 ? (
            <p className="text-sm text-red-600">No payment methods are enabled. Contact support.</p>
          ) : (
            <div className="space-y-2">
              {paymentOptions.map((opt) => (
                <label
                  key={opt.value}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                    payMethod === opt.value
                      ? "border-[#1790d7] bg-[#1790d7]/5"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <input
                    type="radio"
                    name="listing-pay-method"
                    value={opt.value}
                    checked={payMethod === opt.value}
                    onChange={() => {
                      setPayMethod(opt.value);
                      setPayErrors((e) => ({ ...e, payment_method: undefined, form: undefined }));
                    }}
                    className="text-[#1790d7]"
                  />
                  {opt.value === "wallet" ? (
                    <Wallet className="w-5 h-5 text-slate-500 shrink-0" />
                  ) : (
                    <CreditCard className="w-5 h-5 text-slate-500 shrink-0" />
                  )}
                  <div className="min-w-0">
                    <span className="text-sm font-medium text-gray-900">{opt.label}</span>
                    {opt.desc ? <p className="text-xs text-gray-500">{opt.desc}</p> : null}
                  </div>
                </label>
              ))}
            </div>
          )}

          {payMethod === "jazzcash" && (
            <div className="grid gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">JazzCash mobile *</label>
                <input
                  type="tel"
                  value={payPhone}
                  onChange={(e) => {
                    setPayPhone(e.target.value);
                    setPayErrors((err) => ({ ...err, payment_phone: undefined }));
                  }}
                  placeholder="03XXXXXXXXX"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-white ${
                    payErrors.payment_phone ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {payErrors.payment_phone && (
                  <p className="text-xs text-red-600 mt-1">{payErrors.payment_phone}</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CNIC (last 6 or full) *</label>
                <input
                  type="text"
                  value={payCnic}
                  onChange={(e) => {
                    setPayCnic(e.target.value.replace(/\D/g, "").slice(0, 13));
                    setPayErrors((err) => ({ ...err, payment_cnic: undefined }));
                  }}
                  placeholder="Last 6 digits"
                  className={`w-full px-3 py-2.5 rounded-xl border text-sm bg-white ${
                    payErrors.payment_cnic ? "border-red-400" : "border-gray-200"
                  }`}
                />
                {payErrors.payment_cnic && (
                  <p className="text-xs text-red-600 mt-1">{payErrors.payment_cnic}</p>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={paySubmitting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onPay}
              disabled={paySubmitting || paymentOptions.length === 0}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#1790d7] text-white rounded-xl text-sm font-semibold hover:bg-[#1277b8] disabled:opacity-50"
            >
              <CreditCard className="w-4 h-4" />
              {paySubmitting ? "Opening payment…" : "Pay now"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
