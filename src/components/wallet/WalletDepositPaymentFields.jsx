"use client";

/**
 * Fields / notes for the selected wallet deposit gateway.
 * Shown under the payment method list (customer + seller deposit pages).
 */
export default function WalletDepositPaymentFields({
  gateway,
  paymentPhone,
  setPaymentPhone,
  paymentCnic,
  setPaymentCnic,
  jazzcashRequiresMobile = true,
  jazzcashRequiresCnic = true,
}) {
  const inputClass =
    "w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7]";

  if (gateway === "jazzcash") {
    const showMobile = jazzcashRequiresMobile !== false;
    const showCnic = jazzcashRequiresCnic !== false;
    return (
      <div className="space-y-4 p-4 rounded-xl border border-[#1790d7]/25 bg-[#1790d7]/5">
        <p className="text-sm font-medium text-gray-900">JazzCash payment details</p>
        {showMobile && (
          <div>
            <label htmlFor="deposit_payment_phone" className="block text-sm font-medium text-gray-700 mb-1">
              JazzCash mobile number <span className="text-red-500">*</span>
            </label>
            <input
              id="deposit_payment_phone"
              type="tel"
              value={paymentPhone}
              onChange={(e) => setPaymentPhone(e.target.value)}
              placeholder="03XXXXXXXXX"
              className={inputClass}
              required
              autoComplete="tel"
            />
            <p className="text-xs text-gray-500 mt-1">Account registered with JazzCash (03XXXXXXXXX)</p>
          </div>
        )}
        {showCnic && (
          <div>
            <label htmlFor="deposit_payment_cnic" className="block text-sm font-medium text-gray-700 mb-1">
              CNIC <span className="text-red-500">*</span>
            </label>
            <input
              id="deposit_payment_cnic"
              type="text"
              inputMode="numeric"
              value={paymentCnic}
              onChange={(e) => setPaymentCnic(e.target.value.replace(/\D/g, "").slice(0, 13))}
              placeholder="Last 6 digits or full CNIC"
              className={inputClass}
              required
            />
          </div>
        )}
        {!showMobile && !showCnic && (
          <p className="text-sm text-gray-600">
            You will complete payment on the JazzCash secure page after clicking Proceed.
          </p>
        )}
      </div>
    );
  }

  if (gateway === "easypaisa") {
    return (
      <div className="space-y-3 p-4 rounded-xl border border-emerald-200 bg-emerald-50/60">
        <p className="text-sm font-medium text-gray-900">Easypaisa payment</p>
        <p className="text-sm text-gray-600">
          After you click Proceed, you will be redirected to Easypaisa to confirm this wallet top-up.
        </p>
        <div>
          <label htmlFor="deposit_easypaisa_phone" className="block text-sm font-medium text-gray-700 mb-1">
            Easypaisa mobile (optional)
          </label>
          <input
            id="deposit_easypaisa_phone"
            type="tel"
            value={paymentPhone}
            onChange={(e) => setPaymentPhone(e.target.value)}
            placeholder="03XXXXXXXXX"
            className={inputClass}
            autoComplete="tel"
          />
          <p className="text-xs text-gray-500 mt-1">Leave blank to use the phone on your Tijaar account</p>
        </div>
      </div>
    );
  }

  if (gateway === "stripe") {
    return (
      <div className="p-4 rounded-xl border border-violet-200 bg-violet-50/50">
        <p className="text-sm font-medium text-gray-900 mb-1">Card payment (Stripe)</p>
        <p className="text-sm text-gray-600">
          You will enter your card details on Stripe’s secure checkout after clicking Proceed. No card data is stored on Tijaar.
        </p>
      </div>
    );
  }

  return null;
}
