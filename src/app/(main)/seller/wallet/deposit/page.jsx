"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { walletApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import PageHero from "@/components/customer/PageHero";
import WalletDepositPaymentFields from "@/components/wallet/WalletDepositPaymentFields";
import { Wallet, CreditCard, Smartphone } from "lucide-react";

const FALLBACK_GATEWAYS = [
  { value: "jazzcash", label: "JazzCash", desc: "Pay with JazzCash wallet", icon: Smartphone },
  { value: "easypaisa", label: "Easypaisa", desc: "Pay with Easypaisa wallet", icon: Smartphone },
  { value: "stripe", label: "Card (Stripe)", desc: "Credit/Debit card", icon: CreditCard },
];

const iconByValue = { jazzcash: Smartphone, easypaisa: Smartphone, stripe: CreditCard };

function VendorDepositContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get("return") || "/seller/packages";
  const { showSuccess, showError } = useSnackbar();
  const { deposit_methods, jazzcash_requires_mobile, jazzcash_requires_cnic } = useSiteSettings();
  const jazzcashRequiresMobile = !!jazzcash_requires_mobile;
  const jazzcashRequiresCnic = !!jazzcash_requires_cnic;
  const gateways = Array.isArray(deposit_methods) && deposit_methods.length > 0
    ? deposit_methods.map((g) => ({ ...g, icon: iconByValue[g.value] || CreditCard, desc: g.desc || `Pay with ${g.label}` }))
    : FALLBACK_GATEWAYS;
  const [amount, setAmount] = useState("");
  const [gateway, setGateway] = useState(gateways[0]?.value ?? "jazzcash");
  const [paymentPhone, setPaymentPhone] = useState("");
  const [paymentCnic, setPaymentCnic] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const normalizePkMobile = (raw) => {
    let digits = String(raw || "").replace(/\D/g, "");
    if (digits.startsWith("92") && digits.length >= 12) digits = "0" + digits.slice(2);
    if (digits.startsWith("3") && digits.length === 10) digits = "0" + digits;
    return digits;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const num = Number(amount);
    if (!Number.isFinite(num) || num < 100) {
      showError?.("Minimum deposit is 100 PKR");
      return;
    }
    if (num > 500000) {
      showError?.("Maximum deposit is 500,000 PKR");
      return;
    }
    const jazzPhone = normalizePkMobile(paymentPhone);
    if (gateway === "jazzcash" && jazzcashRequiresMobile && !/^03\d{9}$/.test(jazzPhone)) {
      showError?.("Enter JazzCash mobile (03XXXXXXXXX)");
      return;
    }
    const cnicDigits = String(paymentCnic || "").replace(/\D/g, "");
    if (gateway === "jazzcash" && jazzcashRequiresCnic && (cnicDigits.length < 6 || cnicDigits.length > 13)) {
      showError?.("Enter CNIC for JazzCash (last 6 digits or full CNIC)");
      return;
    }
    if (gateway === "easypaisa" && paymentPhone.trim() && !/^03\d{9}$/.test(jazzPhone)) {
      showError?.("Enter a valid Easypaisa mobile (03XXXXXXXXX) or leave blank");
      return;
    }
    setSubmitting(true);
    try {
      const phoneForGateway =
        gateway === "jazzcash" || (gateway === "easypaisa" && paymentPhone.trim())
          ? jazzPhone || undefined
          : undefined;
      const res = await walletApi.deposit(
        num,
        gateway,
        phoneForGateway,
        gateway === "jazzcash" && jazzcashRequiresCnic ? cnicDigits : undefined
      );
      if (res.checkout_url) {
        if (res.checkout_method === "POST" && res.checkout_params) {
          const form = document.createElement("form");
          form.method = "POST";
          form.action = res.checkout_url;
          Object.entries(res.checkout_params).forEach(([k, v]) => {
            const inp = document.createElement("input");
            inp.type = "hidden";
            inp.name = k;
            inp.value = v ?? "";
            form.appendChild(inp);
          });
          document.body.appendChild(form);
          form.submit();
          return;
        }
        window.location.href = res.checkout_url;
        return;
      }
      if (gateway === "jazzcash") {
        if (res.payment_ok || res.payment_status === "paid") {
          showSuccess?.(res?.message || "Deposit completed.");
          setTimeout(() => router.push("/seller/wallet/deposit/success"), 800);
          return;
        }
        if (res.payment_status === "pending") {
          showSuccess?.(res?.message || "Deposit pending JazzCash confirmation.");
          setTimeout(() => router.push(returnTo), 1200);
          return;
        }
        showError?.(res?.message || "JazzCash deposit failed");
        return;
      }
      showSuccess?.(res?.message || "Deposit initiated.");
      setTimeout(() => router.push(returnTo), 1200);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Deposit failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <Link href={returnTo} className="text-[#1790d7] text-sm hover:underline mb-4 inline-block">
          ← Back to Packages
        </Link>
        <PageHero
          title="Deposit Funds"
          description="Add funds to your wallet via JazzCash, Easypaisa, or card. Use your wallet balance to buy promotion packages."
          illustration="promote"
          guide="Minimum 100 PKR. After payment you will be redirected back here; funds will appear in your wallet and Transaction History."
        />
      </div>

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-[#1790d7]/10 flex items-center justify-center">
              <Wallet className="w-6 h-6 text-[#1790d7]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Add to Wallet</h2>
              <p className="text-sm text-gray-500">Choose amount and payment method</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount (PKR)
              </label>
              <input
                id="amount"
                type="number"
                min={100}
                max={500000}
                step={1}
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="e.g. 1000"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Min 100 PKR, max 500,000 PKR</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Payment method</label>
              <div className="space-y-2">
                {gateways.map((g) => {
                  const Icon = g.icon || CreditCard;
                  return (
                    <label
                      key={g.value}
                      className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition ${
                        gateway === g.value ? "border-[#1790d7] bg-[#1790d7]/5" : "border-gray-200 hover:border-gray-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="gateway"
                        value={g.value}
                        checked={gateway === g.value}
                        onChange={() => {
                          setGateway(g.value);
                          setPaymentPhone("");
                          setPaymentCnic("");
                        }}
                        className="text-[#1790d7]"
                      />
                      <Icon className="w-5 h-5 text-gray-500" />
                      <div>
                        <span className="font-medium text-gray-900">{g.label}</span>
                        <p className="text-xs text-gray-500">{g.desc}</p>
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            <WalletDepositPaymentFields
              gateway={gateway}
              paymentPhone={paymentPhone}
              setPaymentPhone={setPaymentPhone}
              paymentCnic={paymentCnic}
              setPaymentCnic={setPaymentCnic}
              jazzcashRequiresMobile={jazzcashRequiresMobile}
              jazzcashRequiresCnic={jazzcashRequiresCnic}
            />

            <button
              type="submit"
              disabled={submitting || !amount || Number(amount) < 100}
              className="w-full py-3 rounded-xl bg-[#1790d7] hover:bg-[#1277b8] text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {submitting ? "Redirecting to payment…" : "Proceed to payment"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function VendorDepositPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorDepositContent />
    </ProtectedRoute>
  );
}
