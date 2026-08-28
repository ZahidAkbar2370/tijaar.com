"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Package, Plus, Pencil, Trash2, ShoppingBag, DollarSign, BarChart3, Eye, Wallet, CreditCard, X, Sparkles, AlertCircle } from "lucide-react";
import { privateListingsApi, payoutsApi, promotionApi, getBackendBaseUrl } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import PageHero from "@/components/customer/PageHero";
import { confirmDelete } from "@/lib/sweetAlert";
import { normalizePhonePk } from "@/lib/validators";
import useAuth from "@/hooks/useAuth";

/** Build full image URL like seller product images: upload/... → base/upload/... ; else → base/storage/... */
function getMediaImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  const p = path.trim();
  if (p.startsWith("http")) return p;
  const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
  if (p.startsWith("upload/")) return `${base}/${p}`;
  return `${base}/storage/${p}`;
}

function handleGatewayRedirect(res) {
  if (res?.checkout_url) {
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
      return true;
    }
    window.location.href = res.checkout_url;
    return true;
  }
  return false;
}

const LISTING_FEE_METHODS = new Set(["wallet", "stripe", "jazzcash", "easypaisa"]);

const STATUS_FILTERS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
  { value: "sold", label: "Sold" },
  { value: "expired", label: "Expired" },
  { value: "removed", label: "Removed" },
];

function listingDisplayStatus(listing) {
  return listing.display_status || listing.status || "draft";
}

function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "published") return "bg-emerald-100 text-emerald-700";
  if (s === "sold") return "bg-sky-100 text-sky-800";
  if (s === "expired") return "bg-amber-100 text-amber-800";
  if (s === "removed") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}

function MyListingsContent() {
  const { user } = useAuth();
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const { payment_methods: sitePaymentMethods } = useSiteSettings();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [listings, setListings] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");
  const [orders, setOrders] = useState([]);
  const [earnings, setEarnings] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [activatingId, setActivatingId] = useState(null);
  const [payListing, setPayListing] = useState(null);
  const [payMethod, setPayMethod] = useState("wallet");
  const [payPhone, setPayPhone] = useState("");
  const [payCnic, setPayCnic] = useState("");
  const [payErrors, setPayErrors] = useState({});
  const [paySubmitting, setPaySubmitting] = useState(false);
  const [eligibility, setEligibility] = useState({
    featured_eligible: false,
    hot_eligible: false,
    promote_url: "/customer/promote",
  });
  const [promoSavingId, setPromoSavingId] = useState(null);

  const filteredListings = useMemo(() => {
    if (statusFilter === "all") return listings;
    return listings.filter((l) => listingDisplayStatus(l) === statusFilter);
  }, [listings, statusFilter]);

  const paymentOptions = useMemo(() => {
    const fromConfig = Array.isArray(config?.payment_methods) ? config.payment_methods : [];
    if (fromConfig.length > 0) return fromConfig;

    const fromSite = (Array.isArray(sitePaymentMethods) ? sitePaymentMethods : [])
      .filter((m) => LISTING_FEE_METHODS.has(m.value));
    const hasWallet = fromSite.some((m) => m.value === "wallet");
    return [
      ...(hasWallet ? [] : [{ value: "wallet", label: "Wallet", desc: "Pay from wallet balance" }]),
      ...fromSite,
    ];
  }, [config, sitePaymentMethods]);

  useEffect(() => {
    if (!paymentOptions.some((o) => o.value === payMethod) && paymentOptions[0]?.value) {
      setPayMethod(paymentOptions[0].value);
    }
  }, [paymentOptions, payMethod]);

  useEffect(() => {
    if (user?.phone && !payPhone) setPayPhone(user.phone);
  }, [user, payPhone]);

  useEffect(() => {
    load();
  }, []);

  // After JazzCash / Stripe / Easypaisa return (?paid=1 / ?paid=0)
  useEffect(() => {
    const paid = searchParams?.get("paid");
    if (paid == null) return;
    load().then(() => {
      if (paid === "1") {
        showSuccess?.("Payment submitted. Your listing will activate once payment is confirmed.");
      } else if (paid === "0") {
        showError?.("Payment was cancelled. You can try Pay now again.");
      }
      router.replace("/customer/listings", { scroll: false });
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const load = () => {
    setLoading(true);
    return Promise.all([
      privateListingsApi.list(),
      privateListingsApi.orders().catch(() => ({ orders: [], pagination: { total: 0 } })),
      payoutsApi.earnings().catch(() => ({ net: 0, total: 0 })),
      privateListingsApi.config().catch(() => ({ config: null })),
      promotionApi.eligibility().catch(() => ({ featured_eligible: false, hot_eligible: false })),
    ])
      .then(([listRes, ordersRes, earnRes, configRes, eligRes]) => {
        setListings(listRes.listings || listRes.products || []);
        setOrders(ordersRes.orders || []);
        setEarnings(earnRes);
        setConfig(configRes.config || null);
        setEligibility({
          featured_eligible: !!eligRes.featured_eligible,
          hot_eligible: !!eligRes.hot_eligible,
          promote_url: eligRes.promote_url || "/customer/promote",
        });
      })
      .catch(() => {
        setListings([]);
        setOrders([]);
      })
      .finally(() => setLoading(false));
  };

  const togglePromotion = async (listing, field, nextValue) => {
    if (listing.locked_after_sale) {
      showError?.("This listing is locked after a sale.");
      return;
    }
    if (nextValue) {
      if (field === "is_featured" && !eligibility.featured_eligible) {
        showError?.("Purchase a Featured package first.");
        return;
      }
      if (field === "is_hot" && !eligibility.hot_eligible) {
        showError?.("Purchase a Hot package first.");
        return;
      }
    }
    setPromoSavingId(listing.id);
    const prev = { is_featured: !!listing.is_featured, is_hot: !!listing.is_hot };
    setListings((rows) =>
      rows.map((r) => (r.id === listing.id ? { ...r, [field]: nextValue } : r))
    );
    try {
      await privateListingsApi.update(listing.id, {
        [field]: nextValue,
        is_featured: field === "is_featured" ? nextValue : prev.is_featured,
        is_hot: field === "is_hot" ? nextValue : prev.is_hot,
      });
      showSuccess?.(nextValue ? `${field === "is_featured" ? "Featured" : "Hot"} enabled` : "Promotion removed");
    } catch (err) {
      setListings((rows) =>
        rows.map((r) => (r.id === listing.id ? { ...r, ...prev } : r))
      );
      showError?.(err?.data?.message || err?.message || "Could not update promotion");
    } finally {
      setPromoSavingId(null);
    }
  };

  const handleDelete = async (id) => {
    const confirmed = await confirmDelete({
      title: "Hide listing?",
      text: "It will be hidden from the shop. You can recover it anytime. Past orders keep product details.",
      confirmButtonText: "Yes, hide",
    });
    if (!confirmed) return;
    setDeletingId(id);
    try {
      await privateListingsApi.delete(id);
      showSuccess?.("Listing hidden. Recover it anytime from Removed.");
      setListings((prev) =>
        prev.map((l) =>
          l.id === id
            ? { ...l, status: "removed", display_status: "removed", is_removed: true, deleted_at: new Date().toISOString() }
            : l
        )
      );
    } catch (err) {
      showError?.(err?.message || "Failed to remove");
    } finally {
      setDeletingId(null);
    }
  };

  const handleRestore = async (id) => {
    setDeletingId(id);
    try {
      const res = await privateListingsApi.restore(id);
      showSuccess?.(res?.message || "Listing recovered.");
      load();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to recover");
    } finally {
      setDeletingId(null);
    }
  };

  const listingFee = config?.listing_fee;

  const openPayModal = (listing, feeOverride) => {
    setPayErrors({});
    setPayListing({
      id: listing.id,
      name: listing.name,
      fee: feeOverride ?? listingFee,
    });
  };

  const closePayModal = () => {
    if (paySubmitting) return;
    setPayListing(null);
    setPayErrors({});
  };

  /** Try free activate; if fee required, open payment popup. */
  const handlePayNowToActivate = async (listing) => {
    setActivatingId(listing.id);
    setPayErrors({});
    try {
      const res = await privateListingsApi.activate(listing.id);
      showSuccess?.(res?.message || "Listing activated.");
      load();
    } catch (err) {
      if (err?.data?.listing_fee_required) {
        openPayModal(listing, err?.data?.listing_fee ?? listingFee);
      } else {
        showError?.(err?.data?.message || err?.message || "Failed to activate");
      }
    } finally {
      setActivatingId(null);
    }
  };

  const validatePayForm = () => {
    const errors = {};
    if (!payMethod) {
      errors.payment_method = "Select a payment method.";
    }
    if (paymentOptions.length === 0) {
      errors.payment_method = "No payment methods are enabled. Contact support.";
    }
    if (payMethod === "jazzcash") {
      const phone = normalizePhonePk(payPhone);
      if (!phone) {
        errors.payment_phone = "Enter JazzCash mobile as 03XXXXXXXXX.";
      }
      const cnicDigits = String(payCnic || "").replace(/\D/g, "");
      if (cnicDigits.length < 6) {
        errors.payment_cnic = "Enter CNIC (last 6 digits or full CNIC).";
      }
    }
    setPayErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async () => {
    if (!payListing?.id) return;
    if (!validatePayForm()) return;

    setPaySubmitting(true);
    setActivatingId(payListing.id);
    try {
      const payload = { payment_method: payMethod };
      if (payMethod === "jazzcash") {
        payload.payment_phone = normalizePhonePk(payPhone) || payPhone.trim();
        payload.payment_cnic = payCnic.trim();
      } else if (payPhone?.trim()) {
        payload.payment_phone = normalizePhonePk(payPhone) || payPhone.trim();
      }

      const res = await privateListingsApi.payActivate(payListing.id, payload);
      if (handleGatewayRedirect(res)) return;
      if (res?.payment_ok || res?.product) {
        showSuccess?.(res?.message || "Listing activated.");
        setPayListing(null);
        load();
        return;
      }
      if (res?.payment_status === "pending") {
        showSuccess?.(res?.message || "Payment pending. Confirm in JazzCash app, then try again.");
        setPayListing(null);
        load();
        return;
      }
      setPayErrors({ form: res?.message || "Complete payment to activate." });
      showError?.(res?.message || "Complete payment to activate.");
    } catch (err) {
      const msg = err?.data?.message || err?.message || "Payment failed";
      setPayErrors({ form: msg });
      showError?.(msg);
    } finally {
      setPaySubmitting(false);
      setActivatingId(null);
    }
  };

  const getImageUrl = (listing) => {
    const media = listing.media || listing.product_media || [];
    const first = media[0];
    if (first?.image_url) return first.image_url.startsWith("http") ? first.image_url : getMediaImageUrl(first.image_url);
    if (first?.path) return getMediaImageUrl(first.path);
    if (listing.thumbnail_path) return getMediaImageUrl(listing.thumbnail_path);
    if (listing.image_url) return listing.image_url.startsWith("http") ? listing.image_url : getMediaImageUrl(listing.image_url);
    return "/assets/sample-image.webp";
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <PageHero
          title="My Listings"
          description="Manage your private seller listings. Add, edit, delete products. Track orders and earnings from items you sell without a store."
          illustration="products"
          guide="Tip: Review impressions, clicks, wishlist and shares in the table. Pay to activate drafts, then edit or delete as needed."
        />
        <Link
          href="/customer/sell"
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl text-sm font-semibold shadow-sm transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Listing
        </Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <span className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
              <Package className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Listings</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2 tabular-nums">{listings.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-[#1790d7]">
            <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 flex items-center justify-center">
              <ShoppingBag className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Orders</span>
          </div>
          <p className="text-xl font-bold text-gray-900 mt-2 tabular-nums">{orders.length}</p>
        </div>
        <div className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm">
          <div className="flex items-center gap-2 text-emerald-600">
            <span className="w-9 h-9 rounded-lg bg-emerald-100 flex items-center justify-center">
              <DollarSign className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Earnings</span>
          </div>
          <p className="text-xl font-bold text-emerald-600 mt-2 tabular-nums">{formatPrice(earnings?.net ?? 0)}</p>
        </div>
        <Link
          href="/customer/earnings"
          className="p-4 rounded-2xl border border-gray-200/80 bg-white shadow-sm hover:border-[#1790d7]/40 hover:shadow-md transition-all flex flex-col justify-center"
        >
          <div className="flex items-center gap-2 text-[#1790d7]">
            <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 flex items-center justify-center">
              <BarChart3 className="w-[18px] h-[18px]" />
            </span>
            <span className="text-sm font-medium">Payouts</span>
          </div>
          <p className="text-sm font-semibold text-[#1790d7] mt-2">View details →</p>
        </Link>
      </div>

      <div>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Your Products</h2>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5">
            {STATUS_FILTERS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => setStatusFilter(f.value)}
                className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-[#1790d7] text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-[#1790d7]/40"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        {listings.length === 0 ? (
          <div className="flex flex-col items-center gap-4 p-12 rounded-2xl bg-gray-50 border border-gray-200/60 text-center">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center">
              <Package className="w-10 h-10 text-slate-400" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">No listings yet</p>
              <p className="text-sm text-gray-600 mt-1">Add your first item to start selling.</p>
              <Link href="/customer/sell" className="inline-block mt-4 px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl text-sm font-semibold shadow-sm">
                Add Listing
              </Link>
            </div>
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center text-sm text-gray-600">
            No listings with this status.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200/80 overflow-hidden shadow-sm">
            {/* Mobile cards */}
            <div className="md:hidden divide-y divide-gray-100">
              {filteredListings.map((listing) => {
                const isLocked = !!listing.locked_after_sale;
                const dStatus = listingDisplayStatus(listing);
                const isRemoved = dStatus === "removed" || !!listing.is_removed;
                return (
                  <div key={listing.id} className={`p-4 space-y-3 ${isRemoved ? "opacity-75" : ""}`}>
                    <div className="flex gap-3">
                      <Link href={`/product/${listing.slug}`} target="_blank" rel="noopener noreferrer" className="shrink-0">
                        <img src={getImageUrl(listing)} alt={listing.name} className="w-16 h-16 rounded-xl object-cover border border-gray-100" />
                      </Link>
                      <div className="min-w-0 flex-1">
                        <Link href={`/product/${listing.slug}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-gray-900 hover:text-[#1790d7] line-clamp-2 text-sm">
                          {listing.name}
                        </Link>
                        <p className="text-sm font-bold text-[#1790d7] mt-0.5">{formatPrice(listing.price)}</p>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${statusBadgeClass(dStatus)}`}>
                            {dStatus}
                          </span>
                          {listing.is_featured && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">Featured</span>}
                          {listing.is_hot && <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-rose-100 text-rose-800">Hot</span>}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-4 gap-2 text-center text-[11px] text-gray-600 bg-gray-50 rounded-xl p-2">
                      <div><p className="font-semibold text-gray-900 tabular-nums">{Number(listing.impressions_count ?? 0).toLocaleString()}</p>Impr.</div>
                      <div><p className="font-semibold text-gray-900 tabular-nums">{Number(listing.clicks_count ?? 0).toLocaleString()}</p>Clicks</div>
                      <div><p className="font-semibold text-gray-900 tabular-nums">{Number(listing.wishlist_count ?? 0).toLocaleString()}</p>Wish</div>
                      <div><p className="font-semibold text-gray-900 tabular-nums">{Number(listing.shares_count ?? 0).toLocaleString()}</p>Shares</div>
                    </div>
                    {!isRemoved && (
                    <div className="flex flex-wrap gap-2">
                      {!isLocked && (listing.status === "draft" || listing.status === "unpublished") && (
                        <button type="button" onClick={() => handlePayNowToActivate(listing)} disabled={activatingId === listing.id} className="px-3 py-2 bg-[#1790d7] text-white rounded-lg text-xs font-semibold disabled:opacity-50">
                          {activatingId === listing.id ? "…" : "Pay to Activate"}
                        </button>
                      )}
                      <Link href={`/product/${listing.slug}`} target="_blank" rel="noopener noreferrer" className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium">View</Link>
                      {!isLocked && (
                        <>
                          <Link href={`/customer/listings/${listing.id}/edit`} className="px-3 py-2 border border-gray-200 rounded-lg text-xs font-medium">Edit</Link>
                          <button type="button" onClick={() => handleDelete(listing.id)} disabled={deletingId === listing.id} className="px-3 py-2 border border-red-200 text-red-600 rounded-lg text-xs font-medium">Remove</button>
                        </>
                      )}
                    </div>
                    )}
                    {isRemoved && (
                      <button
                        type="button"
                        onClick={() => handleRestore(listing.id)}
                        disabled={deletingId === listing.id}
                        className="px-3 py-2 border border-[#1790d7]/40 text-[#1790d7] rounded-lg text-xs font-medium disabled:opacity-50"
                      >
                        Recover listing
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Desktop table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-14">Thumb</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase min-w-[140px]">
                      <span className="inline-flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Promotions
                      </span>
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase" title="Times shown">Impr.</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Clicks</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Wish</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase">Shares</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-48">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredListings.map((listing) => {
                    const isLocked = !!listing.locked_after_sale;
                    const dStatus = listingDisplayStatus(listing);
                    const isRemoved = dStatus === "removed" || !!listing.is_removed;
                    return (
                      <tr key={listing.id} className={`hover:bg-gray-50/50 ${isRemoved ? "opacity-75" : ""}`}>
                        <td className="px-4 py-3">
                          <Link href={`/product/${listing.slug}`} target="_blank" rel="noopener noreferrer">
                            <img
                              src={getImageUrl(listing)}
                              alt={listing.name}
                              className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                            />
                          </Link>
                        </td>
                        <td className="px-4 py-3">
                          <Link
                            href={`/product/${listing.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-gray-900 hover:text-[#1790d7] line-clamp-2"
                          >
                            {listing.name}
                          </Link>
                          {listing.category?.name && (
                            <p className="text-xs text-gray-500 mt-0.5">{listing.category.name}</p>
                          )}
                          {isLocked && (
                            <span className="inline-flex mt-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-700">
                              Sold — locked
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm font-medium text-[#1790d7] whitespace-nowrap">
                          {formatPrice(listing.price)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{listing.quantity ?? 0}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass(dStatus)}`}
                          >
                            {dStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          {isRemoved ? (
                            <span className="text-xs text-gray-400">—</span>
                          ) : (
                          <div className="flex flex-col gap-1.5">
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!listing.is_featured}
                                disabled={isLocked || promoSavingId === listing.id || (!eligibility.featured_eligible && !listing.is_featured)}
                                onChange={(e) => togglePromotion(listing, "is_featured", e.target.checked)}
                                className="rounded"
                              />
                              Featured
                              {!eligibility.featured_eligible && !listing.is_featured && (
                                <AlertCircle className="w-3 h-3 text-amber-500" title="Requires package" />
                              )}
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!listing.is_hot}
                                disabled={isLocked || promoSavingId === listing.id || (!eligibility.hot_eligible && !listing.is_hot)}
                                onChange={(e) => togglePromotion(listing, "is_hot", e.target.checked)}
                                className="rounded"
                              />
                              Hot
                              {!eligibility.hot_eligible && !listing.is_hot && (
                                <AlertCircle className="w-3 h-3 text-amber-500" title="Requires package" />
                              )}
                            </label>
                            {(!eligibility.featured_eligible || !eligibility.hot_eligible) && (
                              <Link href={eligibility.promote_url || "/customer/promote"} className="text-[10px] font-medium text-[#1790d7] hover:underline">
                                Get package
                              </Link>
                            )}
                          </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(listing.impressions_count ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(listing.clicks_count ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(listing.wishlist_count ?? listing.wishlists_count ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(listing.shares_count ?? 0).toLocaleString()}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {!isRemoved && !isLocked && (listing.status === "draft" || listing.status === "unpublished") && (
                              <button
                                type="button"
                                onClick={() => handlePayNowToActivate(listing)}
                                disabled={activatingId === listing.id}
                                className="inline-flex items-center gap-1 px-2 py-1.5 bg-[#1790d7] text-white rounded-lg text-xs font-medium hover:bg-[#1277b8] disabled:opacity-50"
                                title="Pay to Activate"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                {activatingId === listing.id ? "…" : "Pay"}
                              </button>
                            )}
                            <Link
                              href={`/product/${listing.slug}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            {!isRemoved && !isLocked && (
                              <>
                                <Link
                                  href={`/customer/listings/${listing.id}/edit`}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                                  title="Edit"
                                >
                                  <Pencil className="w-4 h-4" />
                                </Link>
                                <button
                                  type="button"
                                  onClick={() => handleDelete(listing.id)}
                                  disabled={deletingId === listing.id}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg disabled:opacity-50"
                                  title="Remove"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                          {isRemoved && (
                            <div className="mt-1 space-y-1">
                              <p className="text-[10px] text-gray-500 max-w-[140px]">
                                Hidden from shop · recover anytime
                              </p>
                              <button
                                type="button"
                                onClick={() => handleRestore(listing.id)}
                                disabled={deletingId === listing.id}
                                className="px-2 py-1 text-xs font-medium text-[#1790d7] border border-[#1790d7]/30 rounded-lg hover:bg-[#1790d7]/5 disabled:opacity-50"
                              >
                                Recover
                              </button>
                            </div>
                          )}
                          {!isRemoved && isLocked && (
                            <p className="text-[10px] text-gray-500 mt-1 max-w-[140px]">
                              Sold — become a private seller to manage.
                            </p>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {payListing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="listing-pay-title">
          <div className="absolute inset-0 bg-black/50" onClick={closePayModal} aria-hidden="true" />
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
                onClick={closePayModal}
                disabled={paySubmitting}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 disabled:opacity-50"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              <p className="text-sm text-gray-600">Choose an enabled payment method, then pay (same as order payment).</p>

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
                  onClick={closePayModal}
                  disabled={paySubmitting}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handlePayNow}
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
      )}

      {orders.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Orders for Your Products</h2>
          <div className="space-y-2">
            {orders.slice(0, 5).map((o) => (
              <Link
                key={o.id}
                href={`/customer/listings/orders/${o.id}`}
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-gray-200/80 bg-white hover:border-[#1790d7]/30 hover:shadow-md transition-all"
              >
                <div>
                  <p className="font-medium text-gray-900">{o.order_number}</p>
                  <p className="text-sm text-gray-500">{new Date(o.created_at).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[#1790d7]">
                    {formatPrice(Math.max(0, (o.seller_subtotal ?? 0) - (o.seller_discount_allocated ?? 0)))}
                  </p>
                  {(o.seller_discount_allocated != null && parseFloat(o.seller_discount_allocated) > 0) && (
                    <p className="text-xs text-emerald-600 mt-0.5">
                      {o.coupon_code ? `Coupon (${o.coupon_code}): −${formatPrice(o.seller_discount_allocated)}` : `Discount: −${formatPrice(o.seller_discount_allocated)}`}
                    </p>
                  )}
                  <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                    ["completed", "delivered"].includes(o.seller_display_status ?? o.status) ? "bg-emerald-100 text-emerald-700" :
                    (o.seller_display_status ?? o.status) === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                  }`}>
                    {(o.seller_display_status ?? o.status)?.replace(/_/g, " ")}
                  </span>
                </div>
              </Link>
            ))}
          </div>
          {orders.length > 5 && (
            <Link href="/customer/listings/orders" className="block mt-3 text-sm font-medium text-[#1790d7] hover:underline">
              View all orders →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

export default function MyListingsPage() {
  return (
    <Suspense fallback={
      <div className="space-y-6">
        <div className="h-28 bg-gray-100 rounded-2xl animate-pulse" />
        <div className="grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <MyListingsContent />
    </Suspense>
  );
}
