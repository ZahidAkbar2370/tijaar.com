"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { privateListingsApi, categoryApi, brandApi } from "@/lib/api";
import { getListingImageUrl } from "@/lib/listingMedia";
import { useSnackbar } from "@/context/SnackbarContext";
import useAuth from "@/hooks/useAuth";
import {
  Video,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";
import SellCategoryPicker from "@/components/sell/SellCategoryPicker";
import SelectedListingCategory from "@/components/sell/SelectedListingCategory";
import SellPhotoUploadGrid from "@/components/sell/SellPhotoUploadGrid";
import SellFormHelpSidebar from "@/components/sell/SellFormHelpSidebar";
import SearchableSelect from "@/components/forms/SearchableSelect";

const CONDITIONS = [
  { value: "new", label: "New", desc: "Unused, in original state" },
  { value: "used", label: "Used", desc: "Previously owned item" },
  { value: "refurbished", label: "Refurbished", desc: "Restored to working order" },
];

const TITLE_MAX = 70;
const DESC_MAX = 4096;

function findCategoryPath(tree, targetId, path = []) {
  for (const node of tree || []) {
    const next = [...path, node];
    if (String(node.id) === String(targetId)) return next;
    if (node.children?.length) {
      const found = findCategoryPath(node.children, targetId, next);
      if (found) return found;
    }
  }
  return null;
}

function resolveListingCoverUrl(listing) {
  if (listing?.thumbnail_path) return getListingImageUrl(listing.thumbnail_path);
  if (listing?.thumbnail_url) {
    return String(listing.thumbnail_url).startsWith("http")
      ? listing.thumbnail_url
      : getListingImageUrl(listing.thumbnail_url);
  }
  return null;
}

function resolveListingGalleryUrls(listing) {
  const media = listing?.media || listing?.product_media || [];
  return media
    .map((m) => {
      if (m?.image_url) {
        return String(m.image_url).startsWith("http") ? m.image_url : getListingImageUrl(m.image_url);
      }
      if (m?.path) return getListingImageUrl(m.path);
      return null;
    })
    .filter(Boolean);
}

const inputClass = (hasError) =>
  `w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border bg-white text-gray-900 text-sm sm:text-[15px] placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7] ${
    hasError ? "border-red-400" : "border-gray-200 hover:border-gray-300"
  }`;

function PricePrefixInput({ name, value, onChange, placeholder = "Enter Price", hasError, disabled, readOnly }) {
  return (
    <div
      className={`flex rounded-xl border overflow-hidden bg-white transition ${
        hasError
          ? "border-[#c17b59] ring-1 ring-[#c17b59]/15"
          : "border-gray-200 hover:border-gray-300 focus-within:border-[#1790d7] focus-within:ring-2 focus-within:ring-[#1790d7]/20"
      } ${disabled ? "opacity-60" : ""}`}
    >
      <span className="inline-flex items-center px-3.5 sm:px-4 text-sm font-semibold text-slate-600 border-r border-gray-200 bg-white shrink-0 select-none">
        Rs
      </span>
      <input
        type="text"
        inputMode="decimal"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        className="flex-1 min-w-0 px-3.5 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-[15px] bg-white text-gray-900 placeholder:text-slate-400 focus:outline-none disabled:bg-gray-50 disabled:cursor-not-allowed"
      />
    </div>
  );
}

function Field({ label, required, hint, error, children, footer }) {
  return (
    <div>
      <label className="flex items-baseline gap-1 mb-1.5">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
      {footer}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default function SellItemForm({ listingId: listingIdProp } = {}) {
  const router = useRouter();
  const listingId = listingIdProp ? String(listingIdProp) : null;
  const isEditMode = !!listingId;
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const formTopRef = useRef(null);
  const [config, setConfig] = useState(null);
  const [categoryTree, setCategoryTree] = useState([]);
  const [brands, setBrands] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [categoryPath, setCategoryPath] = useState([]);
  const [pickerLoading, setPickerLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    short_description: "",
    category_id: "",
    brand_id: "",
    price: "",
    compare_at_price: "",
    quantity: "1",
    condition: "new",
    status: "published",
    video_url: "",
    shipping_mode: "customer_pays",
    shipping_cost_cached: "",
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [existingCoverUrl, setExistingCoverUrl] = useState(null);
  const [existingGalleryUrls, setExistingGalleryUrls] = useState([]);
  const [listingPromo, setListingPromo] = useState({ is_featured: false, is_hot: false });
  const [errors, setErrors] = useState({});
  const isPrivateSeller = !!user?.is_private_seller;

  const maxImages = Math.max(1, Math.min(12, Number(config?.max_images) || 6));
  const minImages = 1;
  const videoEnabled = !!config?.video_enabled;

  const photoCount =
    (thumbnail ? 1 : 0) +
    images.length +
    (!thumbnail && existingCoverUrl ? 1 : 0) +
    (images.length === 0 ? existingGalleryUrls.length : 0);

  useEffect(() => {
    if (!isEditMode || !listingId) return;
    let cancelled = false;
    async function loadListing() {
      setLoading(true);
      try {
        const [listRes, configRes, categoriesRes] = await Promise.all([
          privateListingsApi.list(),
          privateListingsApi.config(),
          categoryApi.list(true),
        ]);
        if (cancelled) return;
        const listings = listRes.listings || listRes.products || [];
        const listing = listings.find((l) => String(l.id) === String(listingId));
        if (!listing) {
          showError?.("Listing not found");
          router.replace("/customer/listings");
          return;
        }
        const cfg = configRes.config;
        const tree = categoriesRes.categories || [];
        setConfig(cfg);
        setCategoryTree(tree);
        const path = findCategoryPath(tree, listing.category_id) || [];
        setCategoryPath(path);
        if (listing.category_id) {
          try {
            const brandsRes = await brandApi.list({ category_id: listing.category_id });
            if (!cancelled) setBrands(brandsRes.brands || []);
          } catch {
            if (!cancelled) setBrands([]);
          }
        }
        setForm({
          name: listing.name || "",
          description: listing.description || "",
          short_description: listing.short_description || "",
          category_id: String(listing.category_id || ""),
          brand_id: listing.brand_id ? String(listing.brand_id) : "",
          price: String(listing.price ?? ""),
          compare_at_price: listing.compare_at_price != null ? String(listing.compare_at_price) : "",
          quantity: String(listing.quantity ?? 1),
          condition: listing.condition || "new",
          status: listing.status || "draft",
          video_url: listing.video_url || "",
          shipping_mode: listing.shipping_mode === "free_shipping" ? "free_shipping" : "customer_pays",
          shipping_cost_cached:
            listing.shipping_cost_cached != null ? String(listing.shipping_cost_cached) : "",
        });
        setListingPromo({
          is_featured: !!listing.is_featured,
          is_hot: !!listing.is_hot,
        });
        const gallery = resolveListingGalleryUrls(listing);
        let cover = resolveListingCoverUrl(listing);
        if (!cover && gallery.length) {
          cover = gallery[0];
          setExistingCoverUrl(cover);
          setExistingGalleryUrls(gallery.slice(1));
        } else {
          setExistingCoverUrl(cover);
          setExistingGalleryUrls(gallery.filter((url) => url !== cover));
        }
        setShowForm(true);
      } catch (err) {
        if (!cancelled) {
          showError?.(err?.message || "Failed to load listing");
          router.replace("/customer/listings");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadListing();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, listingId, router, showError]);

  useEffect(() => {
    if (isEditMode) return;
    let cancelled = false;
    async function load() {
      try {
        const [configRes, categoriesRes] = await Promise.all([
          privateListingsApi.config(),
          categoryApi.list(true),
        ]);
        if (cancelled) return;
        const cfg = configRes.config;
        setConfig(cfg);
        if (cfg?.plan_required || cfg?.free_remaining === 0 || cfg?.remaining === 0) {
          setForm((p) => ({ ...p, status: "draft" }));
        }
        setCategoryTree(categoriesRes.categories || []);
        setBrands([]);
      } catch (err) {
        if (!cancelled) showError?.(err?.message || "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [showError, isEditMode]);

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: String(b.id), label: b.name })),
    [brands]
  );

  const browseItems = useMemo(() => {
    if (!categoryPath.length) return categoryTree;
    const last = categoryPath[categoryPath.length - 1];
    return last?.children || [];
  }, [categoryTree, categoryPath]);

  const summaryParent = useMemo(() => {
    if (categoryPath.length >= 2) return categoryPath[categoryPath.length - 2];
    return categoryPath[0] || null;
  }, [categoryPath]);

  const summarySubcategory = useMemo(() => {
    if (categoryPath.length >= 2) return categoryPath[categoryPath.length - 1];
    return null;
  }, [categoryPath]);

  const proceedAfterLeaf = useCallback(async (path) => {
    const leaf = path[path.length - 1];
    if (!leaf) return;
    setForm((p) => ({ ...p, category_id: String(leaf.id), brand_id: "" }));
    setPickerLoading(true);
    try {
      const brandsRes = await brandApi.list({ category_id: leaf.id });
      setBrands(brandsRes.brands || []);
    } catch {
      setBrands([]);
    } finally {
      setPickerLoading(false);
      setShowForm(true);
    }
  }, []);

  const handleSelectBrowseItem = useCallback(
    (item) => {
      const children = item.children || [];
      if (children.length > 0) {
        setCategoryPath((prev) => [...prev, item]);
        return;
      }
      const path = categoryPath.length ? [...categoryPath, item] : [item];
      setCategoryPath(path);
      proceedAfterLeaf(path);
    },
    [categoryPath, proceedAfterLeaf]
  );

  const handleChangeCategory = useCallback(() => {
    setShowForm(false);
    setCategoryPath([]);
    setBrands([]);
    setForm((p) => ({ ...p, category_id: "", brand_id: "" }));
    setErrors((p) => ({ ...p, category_id: "" }));
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const handlePickerBack = useCallback(() => {
    if (categoryPath.length > 0) {
      setCategoryPath((prev) => prev.slice(0, -1));
    }
  }, [categoryPath.length]);

  const formatPriceWithCommas = useCallback((val) => {
    if (val == null || val === "") return "";
    const s = String(val).replace(/,/g, "");
    const parts = s.split(".");
    const int = (parts[0] || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const dec = parts[1] != null ? "." + parts[1].replace(/\D/g, "").slice(0, 2) : "";
    return int + dec;
  }, []);

  const sanitizePriceInput = useCallback((value) => {
    let v = String(value).replace(/,/g, "").replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length > 1) v = parts[0] + "." + parts.slice(1).join("").slice(0, 2);
    return v;
  }, []);

  const handleChange = useCallback(
    (e) => {
      const { name, value, type, checked } = e.target;
      if (name === "price" || name === "compare_at_price" || name === "shipping_cost_cached") {
        setForm((p) => ({ ...p, [name]: sanitizePriceInput(value) }));
        setErrors((p) => ({ ...p, [name]: "" }));
        return;
      }
      if (name === "quantity" && !isPrivateSeller) {
        setForm((p) => ({ ...p, quantity: "1" }));
        return;
      }
      if (name === "name") {
        setForm((p) => ({ ...p, name: value.slice(0, TITLE_MAX) }));
        setErrors((p) => ({ ...p, name: "" }));
        return;
      }
      if (name === "description") {
        setForm((p) => ({ ...p, description: value.slice(0, DESC_MAX) }));
        setErrors((p) => ({ ...p, description: "" }));
        return;
      }
      setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
      setErrors((p) => ({ ...p, [name]: "" }));
    },
    [isPrivateSeller, sanitizePriceInput]
  );

  const handleThumbnailAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nextCount = photoCount - (existingCoverUrl && !thumbnail ? 1 : 0) + 1;
    if (nextCount > maxImages) {
      showError?.(`You can upload at most ${maxImages} photos.`);
      e.target.value = "";
      return;
    }
    setThumbnail(file);
    setExistingCoverUrl(null);
    setErrors((p) => ({ ...p, images: "" }));
    e.target.value = "";
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const room = maxImages - (thumbnail ? 1 : 0) - (!thumbnail && existingCoverUrl ? 1 : 0) - images.length - (images.length === 0 ? existingGalleryUrls.length : 0);
    if (room <= 0) {
      showError?.(`You can upload at most ${maxImages} photos.`);
      e.target.value = "";
      return;
    }
    if (isEditMode && existingGalleryUrls.length) {
      setExistingGalleryUrls([]);
    }
    setImages((p) => [...p, ...files].slice(0, images.length + room));
    setErrors((p) => ({ ...p, images: "" }));
    e.target.value = "";
  };

  const removeImage = (idx) => setImages((p) => p.filter((_, i) => i !== idx));

  const handleClearExistingCover = () => setExistingCoverUrl(null);

  const handleRemoveExistingGallery = (idx) => {
    setExistingGalleryUrls((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValidUrl = (v) => {
    if (!v) return true;
    try {
      new URL(v);
      return true;
    } catch {
      return false;
    }
  };

  const overFreeLimit = !!(config?.plan_required || (config?.free_remaining ?? config?.remaining) === 0);

  const validateForm = useCallback(() => {
    const nextErrors = {};
    const price = parseFloat(form.price);
    if (!form.name?.trim()) nextErrors.name = "Add a title for your item";
    if (!form.description?.trim()) nextErrors.description = "Add a description for your item";
    if (!form.category_id) nextErrors.category_id = "Pick a category";
    if (!form.price?.trim()) nextErrors.price = "This field is required";
    else if (isNaN(price) || price < 0) nextErrors.price = "Enter a valid price";
    const qty = isPrivateSeller ? parseInt(form.quantity, 10) : 1;
    if (isNaN(qty) || qty < 0) nextErrors.quantity = "Enter a valid quantity";
    if (!isPrivateSeller && qty > 1) nextErrors.quantity = "Quantity is limited to 1";
    if (photoCount < minImages) nextErrors.images = `Add at least ${minImages} photo`;
    if (photoCount > maxImages) nextErrors.images = `Maximum ${maxImages} photos`;
    if (videoEnabled && !isValidUrl(form.video_url?.trim())) nextErrors.video_url = "Enter a valid URL (https://…)";
    const shippingMode = form.shipping_mode === "free_shipping" ? "free_shipping" : "customer_pays";
    if (shippingMode === "customer_pays") {
      const shipCost = parseFloat(form.shipping_cost_cached);
      if (isNaN(shipCost) || shipCost < 0) nextErrors.shipping_cost_cached = "Enter shipping price in PKR";
    }
    return { nextErrors, price, qty, shippingMode };
  }, [
    form,
    isPrivateSeller,
    photoCount,
    minImages,
    maxImages,
    videoEnabled,
    existingCoverUrl,
    existingGalleryUrls,
  ]);

  const handleSaveEdit = async (e) => {
    e?.preventDefault();
    const { nextErrors, price, qty, shippingMode } = validateForm();
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      showError?.(Object.values(nextErrors)[0]);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        short_description: form.short_description?.trim() || null,
        category_id: parseInt(form.category_id, 10),
        brand_id: form.brand_id ? parseInt(form.brand_id, 10) : null,
        price,
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        quantity: qty,
        condition: form.condition || "new",
        video_url: form.video_url?.trim() || null,
        shipping_mode: shippingMode,
        shipping_cost_cached: shippingMode === "customer_pays" ? parseFloat(form.shipping_cost_cached) : 0,
        is_featured: listingPromo.is_featured,
        is_hot: listingPromo.is_hot,
      };
      if (thumbnail) payload.thumbnail = thumbnail;
      if (images.length) payload.images = images;
      await privateListingsApi.update(listingId, payload);
      showSuccess?.("Listing updated.");
      router.replace(`/customer/listings/${listingId}`);
    } catch (err) {
      const apiErrors = err?.data?.errors || {};
      const next = {};
      Object.keys(apiErrors).forEach((k) => {
        next[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : apiErrors[k];
      });
      setErrors((p) => ({ ...p, ...next }));
      showError?.(err?.data?.message || err?.message || "Failed to update listing");
    } finally {
      setSubmitting(false);
    }
  };

  const submitWithStatus = async (targetStatus) => {
    const { nextErrors, price, qty, shippingMode } = validateForm();
    const publishing = targetStatus === "published";
    if (publishing) {
      const publishQty = isPrivateSeller ? parseInt(form.quantity, 10) : 1;
      if (isNaN(publishQty) || publishQty < 1) {
        nextErrors.quantity = "Quantity must be at least 1";
      }
    }
    if (publishing && overFreeLimit) {
      showError?.("No free listing slots available. Save as Draft and activate from My Listings.");
      return;
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) {
      formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      showError?.(Object.values(nextErrors)[0]);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description?.trim() || null,
        short_description: form.short_description?.trim() || null,
        category_id: parseInt(form.category_id, 10),
        brand_id: form.brand_id ? parseInt(form.brand_id, 10) : null,
        price,
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        quantity: qty,
        condition: form.condition || "new",
        status: targetStatus === "published" ? "published" : "draft",
        video_url: videoEnabled ? form.video_url?.trim() || null : null,
        shipping_mode: shippingMode,
        shipping_cost_cached: shippingMode === "customer_pays" ? parseFloat(form.shipping_cost_cached) : 0,
      };
      if (thumbnail) payload.thumbnail = thumbnail;
      if (images.length) payload.images = images;
      const res = await privateListingsApi.create(payload);
      const productId = res?.product?.id;
      const needsListingFee =
        targetStatus === "draft" &&
        overFreeLimit &&
        productId &&
        (res?.listing_fee_required || listingFee != null);

      if (needsListingFee) {
        showSuccess?.(res?.message || "Draft saved. Complete payment to activate your listing.");
        const fee = res?.listing_fee ?? listingFee;
        const feeQuery = fee != null ? `&fee=${encodeURIComponent(String(fee))}` : "";
        router.replace(`/customer/listings/${productId}?pay=1${feeQuery}`);
        return;
      }

      showSuccess?.(
        targetStatus === "draft"
          ? "Listing saved as draft."
          : "Listing published successfully!"
      );
      router.replace("/customer/listings");
    } catch (err) {
      const apiErrors = err?.data?.errors || {};
      const next = {};
      Object.keys(apiErrors).forEach((k) => {
        next[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : apiErrors[k];
      });
      setErrors((p) => ({ ...p, ...next }));
      showError?.(err?.data?.message || err?.message || "Failed to create listing");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDraft = (e) => {
    e?.preventDefault();
    submitWithStatus("draft");
  };

  const handlePostActive = (e) => {
    e?.preventDefault();
    submitWithStatus("published");
  };

  const handleDiscard = () => {
    if (!window.confirm("Are you Sure to Discard these Changes?")) return;
    setShowForm(false);
    setCategoryPath([]);
    setBrands([]);
    setThumbnail(null);
    setImages([]);
    setErrors({});
    setForm({
      name: "",
      description: "",
      short_description: "",
      category_id: "",
      brand_id: "",
      price: "",
      compare_at_price: "",
      quantity: "1",
      condition: "new",
      status: overFreeLimit ? "draft" : "published",
      video_url: "",
      shipping_mode: "customer_pays",
      shipping_cost_cached: "",
    });
    router.replace("/customer/sell");
    formTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const formActions = isEditMode ? (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <Link
        href={`/customer/listings/${listingId}`}
        className="px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
      >
        Cancel
      </Link>
      <button
        type="button"
        onClick={handleSaveEdit}
        disabled={submitting}
        className="px-4 py-2.5 sm:py-3 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl font-semibold shadow-sm transition text-sm disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save Changes"}
      </button>
    </div>
  ) : (
    <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
      <button
        type="button"
        onClick={handleDiscard}
        disabled={submitting}
        className="px-4 py-2.5 sm:py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition text-sm disabled:opacity-50"
      >
        Discard
      </button>
      <button
        type="button"
        onClick={handleSaveDraft}
        disabled={submitting}
        className="px-4 py-2.5 sm:py-3 border border-[#1790d7] text-[#1790d7] rounded-xl font-semibold hover:bg-[#1790d7]/5 transition text-sm disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Save as Draft"}
      </button>
      <button
        type="button"
        onClick={handlePostActive}
        disabled={submitting || overFreeLimit}
        className="px-4 py-2.5 sm:py-3 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl font-semibold shadow-sm transition text-sm disabled:opacity-50"
      >
        {submitting ? "Saving…" : "Post as Active"}
      </button>
    </div>
  );

  if (loading) {
    return (
      <div className="w-full py-8 space-y-4 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-2xl" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (!isEditMode && config && !config.enabled) {
    return (
      <div className="w-full max-w-lg mx-auto py-12">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
          <p className="text-amber-900 font-semibold">Selling is temporarily unavailable</p>
          <p className="text-sm text-amber-800 mt-2">Customer listings are currently disabled.</p>
          <Link href="/customer/dashboard" className="inline-block mt-4 text-[#1790d7] font-semibold text-sm hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const atHardLimit = config && config.used >= (config.max_limit || config.limit);
  if (!isEditMode && atHardLimit) {
    return (
      <div className="w-full max-w-lg mx-auto py-12">
        <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center shadow-sm">
          <p className="text-gray-900 font-semibold">Listing limit reached</p>
          <p className="text-sm text-gray-600 mt-2">You have used all {config.max_limit || config.limit} listing slots.</p>
          <Link href="/customer/listings" className="inline-block mt-4 text-[#1790d7] font-semibold hover:underline">
            My Listings
          </Link>
        </div>
      </div>
    );
  }

  const listingFee = config?.listing_fee;

  return (
    <div className="w-full pb-24 sm:pb-6" ref={formTopRef}>
      <div className="mb-6 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0 text-left">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            {isEditMode ? "Edit your Listing" : "Complete your Listing"}
          </h1>
          <p className="text-sm text-gray-600 mt-1 leading-relaxed">
            {showForm || isEditMode
              ? "Photos, Details, Price, and Shipping."
              : "Start by choosing where your item belongs."}
          </p>
        </div>
        {isEditMode && listingId && (
          <Link
            href={`/customer/listings/${listingId}`}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-gray-400 text-gray-600 text-sm font-semibold bg-transparent hover:bg-gray-50 transition-colors shrink-0 self-start sm:self-center"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            Back to Product Detail
          </Link>
        )}
      </div>

      {overFreeLimit && showForm && !isEditMode && (
        <div
          className="mt-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 p-4 sm:p-5"
          role="alert"
        >
          <h3 className="text-sm sm:text-base font-semibold text-amber-950 mb-2">
            No Free Listings Available
          </h3>
          <div className="space-y-2 text-sm text-amber-900 leading-relaxed">
            <p>
              You&apos;ve reached your free listing limit. Your listing has been saved as a{" "}
              <strong className="font-semibold text-amber-950">draft</strong> and will not be published until activated.
            </p>
            <p>
              To make your listing live, please pay{" "}
              {listingFee != null ? (
                <strong className="font-semibold text-amber-950">
                  Rs. {Number(listingFee).toLocaleString("en-PK", { maximumFractionDigits: 0 })}
                </strong>
              ) : (
                "the listing fee"
              )}{" "}
              from{" "}
              <Link
                href="/customer/listings"
                className="font-semibold text-amber-950 underline underline-offset-2 hover:text-amber-800"
              >
                My Listings
              </Link>
              .
            </p>
          </div>
        </div>
      )}

      {!showForm && !isEditMode ? (
        <div className="mt-4">
          <SellCategoryPicker
            parentCategory={categoryPath[categoryPath.length - 1] || null}
            browseItems={browseItems}
            pickerLoading={pickerLoading}
            onSelectBrowseItem={handleSelectBrowseItem}
            onBack={handlePickerBack}
          />
        </div>
      ) : (
      <form id="sell-item-form" onSubmit={(e) => e.preventDefault()} className="mt-4">
        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_300px] gap-5 xl:gap-6 items-start">
          <div className="rounded-2xl border border-gray-200/80 bg-white shadow-sm overflow-hidden">
          <div className="p-4 sm:p-6 lg:p-8 space-y-5">
            <SelectedListingCategory
              parentCategory={summaryParent}
              subcategory={summarySubcategory}
              onChange={handleChangeCategory}
            />

            <Field label="Upload images" required error={errors.images}>
              <SellPhotoUploadGrid
                maxImages={maxImages}
                thumbnail={thumbnail}
                images={images}
                existingCoverUrl={existingCoverUrl}
                existingGalleryUrls={existingGalleryUrls}
                onThumbnailAdd={handleThumbnailAdd}
                onImageAdd={handleImageAdd}
                onRemoveThumbnail={() => setThumbnail(null)}
                onRemoveImage={removeImage}
                onClearExistingCover={handleClearExistingCover}
                onRemoveExistingGallery={handleRemoveExistingGallery}
                error={errors.images}
              />
            </Field>

            <Field
              label="Ad title"
              required
              error={errors.name}
              footer={
                <div className="flex items-start justify-between gap-3 mt-1.5">
                  <p className="text-xs text-gray-500">
                    Mention the key features of your item (e.g. brand, model, age, type)
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {form.name.length}/{TITLE_MAX}
                  </span>
                </div>
              }
            >
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                maxLength={TITLE_MAX}
                placeholder="e.g. Samsung Galaxy A54 128GB"
                className={inputClass(!!errors.name)}
                autoComplete="off"
              />
            </Field>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <Field label="Brand">
                {brands.length > 0 ? (
                  <>
                    <SearchableSelect
                      options={brandOptions}
                      value={form.brand_id}
                      onChange={(v) => {
                        setForm((p) => ({ ...p, brand_id: v }));
                        setErrors((p) => ({ ...p, brand_id: "" }));
                      }}
                      placeholder="Select brand"
                      hasError={!!errors.brand_id}
                    />
                    <button
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, brand_id: "" }))}
                      className="mt-2 text-sm font-medium text-gray-500 hover:text-[#1790d7]"
                    >
                      Skip brand
                    </button>
                  </>
                ) : (
                  <input
                    type="text"
                    disabled
                    value="No brands for this category"
                    className={`${inputClass(false)} bg-gray-100 text-gray-500 cursor-not-allowed`}
                  />
                )}
              </Field>

              <Field label="Selling Price" required>
                <PricePrefixInput
                  name="price"
                  value={formatPriceWithCommas(form.price)}
                  onChange={handleChange}
                  placeholder="Enter Price"
                  hasError={!!errors.price}
                />
                {errors.price && (
                  <p className="mt-1.5 text-sm text-[#c17b59]">{errors.price}</p>
                )}
              </Field>

              <Field label="Quantity" required error={errors.quantity}>
                <input
                  type="number"
                  name="quantity"
                  value={isPrivateSeller ? form.quantity : "1"}
                  onChange={handleChange}
                  min="1"
                  max={isPrivateSeller ? undefined : 1}
                  disabled={!isPrivateSeller}
                  readOnly={!isPrivateSeller}
                  className={`${inputClass(!!errors.quantity)} ${!isPrivateSeller ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                />
              </Field>
            </div>

            <Field
              label="Description"
              required
              error={errors.description}
              footer={
                <div className="flex items-start justify-between gap-3 mt-1.5">
                  <p className="text-xs text-gray-500">
                    Include condition, features and reason for selling
                  </p>
                  <span className="text-xs text-gray-400 shrink-0">
                    {form.description.length}/{DESC_MAX}
                  </span>
                </div>
              }
            >
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                maxLength={DESC_MAX}
                rows={6}
                placeholder="Describe the item you're selling"
                className={`${inputClass(!!errors.description)} resize-y min-h-[140px]`}
              />
            </Field>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-start">
              <Field label="Condition">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {CONDITIONS.map((opt) => {
                    const active = form.condition === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, condition: opt.value }))}
                        className={`text-left p-3 rounded-xl border transition ${
                          active
                            ? "border-[#1790d7] bg-[#1790d7]/5"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <span className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                          {active && <CheckCircle2 className="w-4 h-4 text-[#1790d7] shrink-0" />}
                          {opt.label}
                        </span>
                        <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </Field>

              <div className="min-w-0">
                <Field label="Shipping">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2 gap-2.5">
                    {[
                      { value: "customer_pays", title: "Buyer pays shipping", desc: "Set a fixed fee" },
                      { value: "free_shipping", title: "Free shipping", desc: "You cover delivery" },
                    ].map((opt) => {
                      const active = form.shipping_mode === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, shipping_mode: opt.value }))}
                          className={`text-left p-3 rounded-xl border transition ${
                            active ? "border-[#1790d7] bg-[#1790d7]/5" : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <span className="flex items-center gap-2 font-semibold text-gray-900 text-sm">
                            {active && <CheckCircle2 className="w-4 h-4 text-[#1790d7] shrink-0" />}
                            {opt.title}
                          </span>
                          <span className="block text-xs text-gray-500 mt-0.5">{opt.desc}</span>
                        </button>
                      );
                    })}
                  </div>
                  {form.shipping_mode !== "free_shipping" && (
                    <div className="mt-3">
                      <Field label="Shipping price" required>
                        <PricePrefixInput
                          name="shipping_cost_cached"
                          value={formatPriceWithCommas(form.shipping_cost_cached)}
                          onChange={handleChange}
                          placeholder="Enter Price"
                          hasError={!!errors.shipping_cost_cached}
                        />
                        {errors.shipping_cost_cached && (
                          <p className="mt-1.5 text-sm text-[#c17b59]">{errors.shipping_cost_cached}</p>
                        )}
                      </Field>
                    </div>
                  )}
                </Field>
              </div>
            </div>

            {videoEnabled && (
              <Field label="Video link (optional)" error={errors.video_url} hint="YouTube or Vimeo">
                <div className="relative max-w-xl">
                  <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="url"
                    name="video_url"
                    value={form.video_url}
                    onChange={handleChange}
                    placeholder="https://…"
                    className={`${inputClass(!!errors.video_url)} pl-10`}
                  />
                </div>
              </Field>
            )}

            <div className="hidden sm:block pt-2 border-t border-gray-100">
              {formActions}
            </div>
          </div>
          </div>

          <SellFormHelpSidebar />
        </div>
      </form>
      )}

      {showForm && (
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
        {formActions}
      </div>
      )}
    </div>
  );
}
