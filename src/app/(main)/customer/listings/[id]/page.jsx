"use client";

import { useState, useEffect, useMemo, Suspense } from "react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  Pencil,
  Trash2,
  CreditCard,
  Sparkles,
  ExternalLink,
  Package,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import { privateListingsApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import useAuth from "@/hooks/useAuth";
import { confirmDelete } from "@/lib/sweetAlert";
import { normalizePhonePk } from "@/lib/validators";
import ListingPayModal from "@/components/customer/ListingPayModal";
import {
  getListingGallery,
  getListingThumbnail,
  listingDisplayStatus,
  statusBadgeClass,
} from "@/lib/listingMedia";

const LISTING_FEE_METHODS = new Set(["wallet", "stripe", "jazzcash", "easypaisa"]);

const CONDITION_LABELS = {
  new: "New",
  used: "Used",
  refurbished: "Refurbished",
};

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

function DetailRow({ label, value }) {
  if (value == null || value === "") return null;
  return (
    <div>
      <dt className="text-xs font-medium text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-sm text-gray-900 mt-0.5">{value}</dd>
    </div>
  );
}

function ListingDetailContent() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const { payment_methods: sitePaymentMethods } = useSiteSettings();
  const listingId = parseInt(params?.id, 10);

  const [listing, setListing] = useState(null);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [activating, setActivating] = useState(false);
  const [payListing, setPayListing] = useState(null);
  const [payMethod, setPayMethod] = useState("wallet");
  const [payPhone, setPayPhone] = useState("");
  const [payCnic, setPayCnic] = useState("");
  const [payErrors, setPayErrors] = useState({});
  const [paySubmitting, setPaySubmitting] = useState(false);

  const paymentOptions = useMemo(() => {
    const fromConfig = Array.isArray(config?.payment_methods) ? config.payment_methods : [];
    if (fromConfig.length > 0) return fromConfig;
    const fromSite = (Array.isArray(sitePaymentMethods) ? sitePaymentMethods : []).filter((m) =>
      LISTING_FEE_METHODS.has(m.value)
    );
    const hasWallet = fromSite.some((m) => m.value === "wallet");
    return [
      ...(hasWallet ? [] : [{ value: "wallet", label: "Wallet", desc: "Pay from wallet balance" }]),
      ...fromSite,
    ];
  }, [config, sitePaymentMethods]);

  const listingFee = config?.listing_fee;
  const dStatus = listing ? listingDisplayStatus(listing) : "draft";
  const isRemoved = dStatus === "removed" || !!listing?.is_removed;
  const isLocked = !!listing?.locked_after_sale;
  const isDraft = listing?.status === "draft" || listing?.status === "unpublished";
  const gallery = listing ? getListingGallery(listing) : [];
  const canPay = !isRemoved && !isLocked && isDraft;

  const loadListing = async () => {
    setLoading(true);
    try {
      const [listRes, configRes] = await Promise.all([
        privateListingsApi.list(),
        privateListingsApi.config().catch(() => ({ config: null })),
      ]);
      const found = (listRes.listings || listRes.products || []).find((l) => Number(l.id) === listingId);
      if (!found) {
        showError?.("Listing not found");
        router.replace("/customer/listings");
        return;
      }
      setListing(found);
      setConfig(configRes.config || null);
    } catch (err) {
      showError?.(err?.message || "Failed to load listing");
      router.replace("/customer/listings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!listingId) return;
    loadListing();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [listingId]);

  useEffect(() => {
    if (user?.phone && !payPhone) setPayPhone(user.phone);
  }, [user, payPhone]);

  useEffect(() => {
    if (!paymentOptions.some((o) => o.value === payMethod) && paymentOptions[0]?.value) {
      setPayMethod(paymentOptions[0].value);
    }
  }, [paymentOptions, payMethod]);

  useEffect(() => {
    if (!listing || loading) return;
    if (searchParams?.get("pay") !== "1") return;
    const feeParam = searchParams?.get("fee");
    const parsedFee = feeParam != null && feeParam !== "" ? Number(feeParam) : NaN;
    const fee = Number.isFinite(parsedFee) ? parsedFee : (config?.listing_fee ?? listingFee ?? null);
    setPayErrors({});
    setPayListing({ id: listing.id, name: listing.name, fee });
    router.replace(`/customer/listings/${listing.id}`, { scroll: false });
  }, [listing, loading, searchParams, config, listingFee, router]);

  const openPayModal = () => {
    if (!listing) return;
    setPayErrors({});
    setPayListing({ id: listing.id, name: listing.name, fee: listingFee });
  };

  const closePayModal = () => {
    if (paySubmitting) return;
    setPayListing(null);
    setPayErrors({});
  };

  const handlePayNowToActivate = async () => {
    if (!listing) return;
    setActivating(true);
    setPayErrors({});
    try {
      const res = await privateListingsApi.activate(listing.id);
      showSuccess?.(res?.message || "Listing activated.");
      await loadListing();
    } catch (err) {
      if (err?.data?.listing_fee_required) {
        openPayModal();
        setPayListing({
          id: listing.id,
          name: listing.name,
          fee: err?.data?.listing_fee ?? listingFee,
        });
      } else {
        showError?.(err?.data?.message || err?.message || "Failed to activate");
      }
    } finally {
      setActivating(false);
    }
  };

  const validatePayForm = () => {
    const errors = {};
    if (!payMethod) errors.payment_method = "Select a payment method.";
    if (paymentOptions.length === 0) errors.payment_method = "No payment methods are enabled. Contact support.";
    if (payMethod === "jazzcash") {
      const phone = normalizePhonePk(payPhone);
      if (!phone) errors.payment_phone = "Enter JazzCash mobile as 03XXXXXXXXX.";
      const cnicDigits = String(payCnic || "").replace(/\D/g, "");
      if (cnicDigits.length < 6) errors.payment_cnic = "Enter CNIC (last 6 digits or full CNIC).";
    }
    setPayErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePayNow = async () => {
    if (!payListing?.id) return;
    if (!validatePayForm()) return;
    setPaySubmitting(true);
    setActivating(true);
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
        await loadListing();
        return;
      }
      if (res?.payment_status === "pending") {
        showSuccess?.(res?.message || "Payment pending. Confirm in your app, then try again.");
        setPayListing(null);
        await loadListing();
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
      setActivating(false);
    }
  };

  const handleDelete = async () => {
    if (!listing) return;
    const confirmed = await confirmDelete({
      title: "Hide listing?",
      text: "It will be hidden from the shop. You can recover it anytime from Removed.",
      confirmButtonText: "Yes, hide",
    });
    if (!confirmed) return;
    setDeleting(true);
    try {
      await privateListingsApi.delete(listing.id);
      showSuccess?.("Listing hidden.");
      router.replace("/customer/listings");
    } catch (err) {
      showError?.(err?.message || "Failed to remove");
    } finally {
      setDeleting(false);
    }
  };

  const shippingLabel =
    listing?.shipping_mode === "free_shipping"
      ? "Free shipping"
      : listing?.shipping_cost_cached != null
        ? `Buyer pays — ${formatPrice(listing.shipping_cost_cached)}`
        : "Buyer pays shipping";

  if (loading) {
    return (
      <div className="py-12 animate-pulse space-y-4">
        <div className="h-8 bg-gray-100 rounded w-48" />
        <div className="h-80 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!listing) return null;

  const btnOutline =
    "inline-flex items-center justify-center gap-1.5 px-2.5 py-2 lg:px-3.5 lg:py-2 rounded-lg lg:rounded-xl border text-xs lg:text-sm font-semibold bg-transparent transition-colors disabled:opacity-50 whitespace-nowrap w-full lg:w-auto";
  const btnPrimary = `${btnOutline} border-[#1790d7] text-[#1790d7] hover:bg-[#1790d7]/10`;
  const btnSuccess = `${btnOutline} border-emerald-600 text-emerald-600 hover:bg-emerald-50`;
  const btnDanger = `${btnOutline} border-red-600 text-red-600 hover:bg-red-50`;
  const btnSecondary = `${btnOutline} border-gray-400 text-gray-600 hover:bg-gray-50`;
  const btnPromo = `${btnOutline} border-amber-500 text-amber-700 hover:bg-amber-50`;

  const actionButtons = (
    <div className="grid grid-cols-2 gap-2 w-full lg:flex lg:flex-row lg:flex-nowrap lg:items-center lg:justify-end lg:gap-2 lg:w-auto lg:shrink-0 lg:overflow-x-auto">
      {!isRemoved && canPay && (
        <button
          type="button"
          onClick={handlePayNowToActivate}
          disabled={activating}
          className={`${btnSuccess} col-span-2 lg:col-span-1`}
        >
          <CreditCard className="w-4 h-4" />
          {activating ? "Processing…" : "Pay to Activate"}
        </button>
      )}
      {!isRemoved && (
        <Link href="/customer/promote" className={`${btnPromo} col-span-2 lg:col-span-1`}>
          <Sparkles className="w-4 h-4" />
          Purchase Promotion
        </Link>
      )}
      {!isRemoved && !isLocked && (
        <Link href={`/customer/listings/${listing.id}/edit`} className={btnPrimary}>
          <Pencil className="w-4 h-4" />
          Edit
        </Link>
      )}
      {!isRemoved && !isLocked && (
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className={btnDanger}
        >
          <Trash2 className="w-4 h-4" />
          {deleting ? "Removing…" : "Remove"}
        </button>
      )}
      {listing.slug && dStatus === "published" && !isRemoved && (
        <Link
          href={`/product/${listing.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btnSecondary} col-span-2 lg:col-span-1`}
        >
          <ExternalLink className="w-4 h-4" />
          View public page
        </Link>
      )}
      <Link href="/customer/listings" className={`${btnSecondary} col-span-2 lg:col-span-1`}>
        <ArrowLeft className="w-4 h-4 shrink-0" />
        Back to Listing
      </Link>
    </div>
  );

  const galleryImages = gallery.length ? gallery : [getListingThumbnail(listing)];

  return (
    <div className="space-y-5 pb-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${statusBadgeClass(dStatus)}`}>
              {dStatus}
            </span>
            {listing.is_featured && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">Boosted</span>
            )}
            {listing.is_hot && (
              <span className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium bg-rose-100 text-rose-800">Hot Deal</span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{listing.name}</h1>
          {listing.category?.name && (
            <p className="text-sm text-gray-500 mt-1">{listing.category.name}</p>
          )}
          {isLocked && (
            <p className="text-xs text-gray-500 mt-2">This listing is locked after a sale.</p>
          )}
        </div>
        {actionButtons}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="relative group">
            {galleryImages.length > 1 && (
              <>
                <button
                  type="button"
                  className={`listing-gallery-${listing.id}-prev absolute left-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 border border-gray-200 text-gray-700 shadow-sm hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors`}
                  aria-label="Previous image"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className={`listing-gallery-${listing.id}-next absolute right-2 top-1/2 -translate-y-1/2 z-10 w-9 h-9 flex items-center justify-center rounded-full bg-white/95 border border-gray-200 text-gray-700 shadow-sm hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-colors`}
                  aria-label="Next image"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </>
            )}
            <Swiper
              modules={[Autoplay, Navigation, Pagination]}
              slidesPerView={1}
              spaceBetween={0}
              loop={galleryImages.length > 1}
              autoplay={
                galleryImages.length > 1
                  ? { delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }
                  : false
              }
              pagination={galleryImages.length > 1 ? { clickable: true } : false}
              navigation={
                galleryImages.length > 1
                  ? {
                      prevEl: `.listing-gallery-${listing.id}-prev`,
                      nextEl: `.listing-gallery-${listing.id}-next`,
                    }
                  : false
              }
              className="listing-gallery-swiper w-full aspect-[4/3] bg-gray-50"
            >
              {galleryImages.map((url, i) => (
                <SwiperSlide key={`${url}-${i}`}>
                  <img
                    src={url}
                    alt={i === 0 ? listing.name : `${listing.name} ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        </div>

        <div className="space-y-5 min-w-0">
          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
            <p className="text-2xl font-bold text-[#1790d7]">{formatPrice(listing.price)}</p>
            {listing.compare_at_price != null && Number(listing.compare_at_price) > Number(listing.price) && (
              <p className="text-sm text-gray-400 line-through mt-0.5">{formatPrice(listing.compare_at_price)}</p>
            )}
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-5">
              <DetailRow label="Quantity" value={String(listing.quantity ?? 0)} />
              <DetailRow label="Condition" value={CONDITION_LABELS[listing.condition] || listing.condition} />
              <DetailRow label="Brand" value={listing.brand?.name || "—"} />
              <DetailRow label="Shipping" value={shippingLabel} />
              <DetailRow label="SKU" value={listing.sku} />
            </dl>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
            <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#1790d7]" />
              Performance
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              {[
                { label: "Impressions", value: listing.impressions_count ?? 0 },
                { label: "Clicks", value: listing.clicks_count ?? 0 },
                { label: "Wishlist", value: listing.wishlist_count ?? listing.wishlists_count ?? 0 },
                { label: "Shares", value: listing.shares_count ?? 0 },
              ].map((stat) => (
                <div key={stat.label} className="rounded-xl bg-gray-50 px-3 py-2.5">
                  <p className="text-lg font-bold text-gray-900 tabular-nums">{Number(stat.value).toLocaleString()}</p>
                  <p className="text-[11px] text-gray-500">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {listing.description && (
        <div className="w-full bg-white rounded-2xl border border-gray-200/80 shadow-sm p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
            <Package className="w-4 h-4 text-[#1790d7]" />
            Description
          </h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{listing.description}</p>
        </div>
      )}

      <ListingPayModal
        payListing={payListing}
        formatPrice={formatPrice}
        paymentOptions={paymentOptions}
        payMethod={payMethod}
        setPayMethod={setPayMethod}
        payPhone={payPhone}
        setPayPhone={setPayPhone}
        payCnic={payCnic}
        setPayCnic={setPayCnic}
        payErrors={payErrors}
        setPayErrors={setPayErrors}
        paySubmitting={paySubmitting}
        onClose={closePayModal}
        onPay={handlePayNow}
      />
    </div>
  );
}

export default function CustomerListingDetailPage() {
  return (
    <Suspense fallback={<div className="py-12 text-center text-gray-500">Loading…</div>}>
      <ListingDetailContent />
    </Suspense>
  );
}
