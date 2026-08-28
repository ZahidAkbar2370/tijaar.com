"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { promotionApi, privateListingsApi, walletApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { Wallet } from "lucide-react";

function PromotePurchaseContent({ packageId }) {
  const router = useRouter();
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const [pkg, setPkg] = useState(null);
  const [products, setProducts] = useState([]);
  const [walletBalance, setWalletBalance] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const parseBalance = (r) => {
      if (!r || typeof r !== "object") return null;
      const spendable = r.spendable_balance ?? r.spendableBalance;
      const raw = spendable ?? r.balance ?? r.data?.balance;
      if (raw === undefined || raw === null) return null;
      const num = Number(raw);
      return Number.isFinite(num) ? num : null;
    };

    Promise.allSettled([
      promotionApi.packages().then((r) => r.packages || []),
      privateListingsApi.list().then((r) => r.listings || r.products || []),
      walletApi.balance().then(parseBalance),
    ]).then(([pkgRes, prodsRes, balRes]) => {
      const pkgs = pkgRes.status === "fulfilled" ? pkgRes.value : [];
      const prodsList = prodsRes.status === "fulfilled" ? prodsRes.value : [];
      const bal = balRes.status === "fulfilled" ? balRes.value : null;
      const p = pkgs.find((x) => String(x.id) === String(packageId));
      setPkg(p ?? null);
      setProducts(prodsList);
      setWalletBalance(bal);
      if (prodsList.length > 0 && (p?.type === "featured_product" || p?.type === "hot_sale")) {
        setSelectedProductId(String(prodsList[0].id));
      }
    }).finally(() => setLoading(false));
  }, [packageId]);

  const handlePurchase = async () => {
    if (!pkg) return;
    if (!selectedProductId) {
      showError?.("Select a listing");
      return;
    }
    const price = Number(pkg.price || 0);
    const bal = walletBalance != null ? Number(walletBalance) : null;
    if (price > 0 && (bal == null || bal < price - 0.005)) {
      showError?.("Insufficient wallet balance.");
      return;
    }
    setSubmitting(true);
    try {
      await promotionApi.purchase({
        package_id: pkg.id,
        product_id: parseInt(selectedProductId, 10),
        payment_method: "wallet",
      });
      showSuccess?.("Package activated! Enable Featured/Hot on My Listings.");
      router.push("/customer/listings");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !pkg) {
    return (
      <div className="max-w-xl mx-auto">
        <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const price = Number(pkg.price || 0);
  const canPayWithWallet = price === 0 || (walletBalance != null && Number(walletBalance) >= price - 0.005);

  return (
    <div className="max-w-xl mx-auto">
      <Link href="/customer/promote" className="text-[#1790d7] text-sm hover:underline mb-4 inline-block">
        ← Back to packages
      </Link>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {price > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-[#1790d7]/5 border border-amber-200 flex items-center gap-2 text-sm">
            <Wallet className="w-5 h-5 text-[#1790d7]" />
            <span className="text-gray-700">
              Wallet balance: <strong>{walletBalance != null ? Number(walletBalance).toLocaleString() : "0"} PKR</strong>
            </span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h1>
        <p className="text-gray-600 mb-4">{pkg.description || ""}</p>
        <p className="text-xl font-bold text-[#1790d7] mb-6">
          {formatPrice(pkg.price)} for {pkg.duration_days} days
        </p>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Select listing</label>
          {products.length === 0 ? (
            <p className="text-sm text-[#1790d7]">Add a listing first to promote it.</p>
          ) : (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl"
            >
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {price > 0 && !canPayWithWallet ? (
          <Link
            href={`/customer/wallet?return=${encodeURIComponent(`/customer/promote/${pkg.id}`)}`}
            className="block w-full py-3 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl text-center transition"
          >
            Deposit Funds
          </Link>
        ) : (
          <button
            type="button"
            onClick={handlePurchase}
            disabled={submitting || products.length === 0}
            className="w-full py-3 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl disabled:opacity-50 transition"
          >
            {submitting ? "Processing…" : price === 0 ? "Activate free package" : "Pay with wallet"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function CustomerPromotePurchasePage() {
  const params = useParams();
  return (
    <ProtectedRoute>
      <PromotePurchaseContent packageId={params?.id} />
    </ProtectedRoute>
  );
}
