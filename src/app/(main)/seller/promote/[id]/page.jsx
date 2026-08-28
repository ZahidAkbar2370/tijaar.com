"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { promotionApi, sellerProductsApi, walletApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { Wallet } from "lucide-react";

function PromotePurchaseContent({ packageId }) {
  const router = useRouter();
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const [pkg, setPkg] = useState(null);
  const [products, setProducts] = useState([]);
  const [store, setStore] = useState(null);
  const [walletBalance, setWalletBalance] = useState(null);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState("");
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
      sellerProductsApi.list().then((r) => r.products || []),
      sellerProductsApi.store().then((r) => r.store),
      walletApi.balance().then(parseBalance),
    ]).then(([pkgRes, prodsRes, storeRes, balRes]) => {
      const pkgs = pkgRes.status === "fulfilled" ? pkgRes.value : [];
      const prodsList = prodsRes.status === "fulfilled" ? prodsRes.value : [];
      const storeData = storeRes.status === "fulfilled" ? storeRes.value : null;
      const bal = balRes.status === "fulfilled" ? balRes.value : null;
      const p = pkgs.find((x) => String(x.id) === String(packageId));
      setPkg(p ?? null);
      setProducts(prodsList);
      setStore(storeData || prodsList[0]?.store);
      setWalletBalance(bal);
      if (prodsList.length > 0 && (p?.type === "featured_product" || p?.type === "hot_sale")) {
        setSelectedProductId(String(prodsList[0].id));
      }
      if (storeData && (p?.type === "featured_shop" || p?.type === "store_banner")) {
        setSelectedStoreId(String(storeData.id));
      }
    }).finally(() => setLoading(false));
  }, [packageId]);


  const handlePurchase = async () => {
    if (!pkg) return;
    const isProduct = pkg.type === "featured_product" || pkg.type === "hot_sale";
    if (isProduct && !selectedProductId) {
      showError?.("Select a product");
      return;
    }
    if (!isProduct && !selectedStoreId && store) {
      setSelectedStoreId(String(store.id));
    }
    const price = Number(pkg.price || 0);
    const bal = walletBalance != null ? Number(walletBalance) : null;
    if (price > 0 && (bal == null || bal < price - 0.005)) {
      showError?.("Insufficient wallet balance. Add funds from your sales or payouts.");
      return;
    }
    setSubmitting(true);
    try {
      await promotionApi.purchase({
        package_id: pkg.id,
        product_id: isProduct ? parseInt(selectedProductId, 10) : undefined,
        store_id: !isProduct ? parseInt(selectedStoreId || store?.id, 10) : undefined,
        payment_method: "wallet",
      });
      showSuccess?.("Package activated! It will appear in Transaction History.");
      router.push("/seller/packages");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !pkg) {
    return (
      <div className="max-w-xl mx-auto px-4 py-12">
        <div className="animate-pulse h-48 bg-gray-100 rounded-xl" />
      </div>
    );
  }

  const isProduct = pkg.type === "featured_product" || pkg.type === "hot_sale";

  const price = Number(pkg.price || 0);
  const canPayWithWallet = price === 0 || (walletBalance != null && Number(walletBalance) >= price - 0.005);

  return (
    <div className="max-w-xl mx-auto px-4 py-12">
      <Link href="/seller/packages" className="text-[#1790d7] text-sm hover:underline mb-4 inline-block">
        ← Back to Packages
      </Link>
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        {price > 0 && (
          <div className="mb-4 p-3 rounded-xl bg-[#1790d7]/5 border border-amber-200 flex items-center gap-2 text-sm">
            <Wallet className="w-5 h-5 text-[#1790d7]" />
            <span className="text-gray-700">Wallet balance: <strong>{walletBalance != null ? Number(walletBalance).toLocaleString() : "0"} PKR</strong></span>
          </div>
        )}
        <h1 className="text-2xl font-bold text-gray-900 mb-2">{pkg.name}</h1>
        <p className="text-gray-600 mb-4">{pkg.description || ""}</p>
        <p className="text-xl font-bold text-[#1790d7] mb-6">{formatPrice(pkg.price)} for {pkg.duration_days} days</p>

        {isProduct && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Select Product</label>
            {products.length === 0 ? (
              <p className="text-sm text-[#1790d7]">Add products first to promote them.</p>
            ) : (
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>
        )}

        {!isProduct && (
          <div className="mb-6">
            {store ? (
              <p className="text-sm text-gray-600">Store: {store.name}</p>
            ) : (
              <p className="text-sm text-[#1790d7]">Set up your store first.</p>
            )}
          </div>
        )}

        {price > 0 && !canPayWithWallet ? (
          <>
            <Link
              href={`/seller/wallet/deposit?return=${encodeURIComponent(`/seller/promote/${pkg.id}`)}`}
              className="block w-full py-3 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl text-center transition"
            >
              Deposit Funds
            </Link>
            <p className="text-sm text-[#1790d7] mt-2 text-center">Add funds via payment gateway to buy this package. Or use earnings from sales.</p>
          </>
        ) : (
          <button
            onClick={handlePurchase}
            disabled={submitting || (isProduct && !selectedProductId) || (!isProduct && !store)}
            className="w-full py-3 bg-[#1790d7] hover:bg-[#1277b8] text-white font-semibold rounded-xl disabled:opacity-50"
          >
            {submitting ? "Activating..." : price > 0 ? "Pay with Wallet" : "Activate (Free)"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function PromotePurchasePage() {
  const params = useParams();
  return (
    <ProtectedRoute requiredRole="seller">
      <PromotePurchaseContent packageId={params?.id} />
    </ProtectedRoute>
  );
}
