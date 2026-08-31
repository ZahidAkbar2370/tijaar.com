"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { privateListingsApi, categoryApi, brandApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import useAuth from "@/hooks/useAuth";
import {
  ImagePlus,
  X,
  Package,
  Video,
  Upload,
  CheckCircle2,
  Camera,
} from "lucide-react";
import PageHero from "@/components/customer/PageHero";
import SearchableSelect from "@/components/forms/SearchableSelect";

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

const inputClass = (hasError) =>
  `w-full px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border bg-white text-gray-900 text-sm sm:text-[15px] placeholder:text-gray-400 transition focus:outline-none focus:ring-2 focus:ring-[#1790d7]/25 focus:border-[#1790d7] ${
    hasError ? "border-red-400" : "border-gray-200 hover:border-gray-300"
  }`;

function useObjectUrl(file) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);
  useEffect(() => {
    return () => {
      if (url) URL.revokeObjectURL(url);
    };
  }, [url]);
  return url;
}

function useObjectUrls(files) {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => {
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [urls]);
  return urls;
}

function Field({ label, required, hint, error, children }) {
  return (
    <div>
      <label className="flex items-baseline gap-1 mb-1.5">
        <span className="text-sm font-medium text-gray-800">{label}</span>
        {required && <span className="text-red-500 text-xs">*</span>}
      </label>
      {hint && <p className="text-xs text-gray-500 mb-1.5">{hint}</p>}
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
}

function ThumbPreview({ file, onRemove }) {
  const url = useObjectUrl(file);
  if (!url) return null;
  return (
    <div className="relative inline-block">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={url} alt="Main product" className="w-full aspect-square max-w-[140px] object-cover rounded-xl border border-gray-200" />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
        aria-label="Remove main photo"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

function GalleryPreview({ files, onRemove }) {
  const urls = useObjectUrls(files);
  return (
    <div className="flex flex-wrap gap-2">
      {files.map((file, i) => (
        <div key={`${file.name}-${file.size}-${i}`} className="relative w-[68px] sm:w-20">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={urls[i]} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center"
              aria-label="Remove photo"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function SellItemForm() {
  const router = useRouter();
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const formTopRef = useRef(null);
  const [config, setConfig] = useState(null);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
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
  const [errors, setErrors] = useState({});
  const isPrivateSeller = !!user?.is_private_seller;

  const maxImages = Math.max(1, Math.min(12, Number(config?.max_images) || 6));
  const minImages = 1;
  const videoEnabled = !!config?.video_enabled;
  const photoCount = (thumbnail ? 1 : 0) + images.length;

  useEffect(() => {
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
        const flattenCategories = (arr) => {
          const out = [];
          (arr || []).forEach((c) => {
            out.push({ ...c, level: 0 });
            (c.children || []).forEach((ch) => {
              out.push({ ...ch, level: 1 });
              (ch.children || []).forEach((ch2) => out.push({ ...ch2, level: 2 }));
            });
          });
          return out;
        };
        setCategories(flattenCategories(categoriesRes.categories || []));
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
  }, [showError]);

  useEffect(() => {
    let cancelled = false;
    async function loadBrands() {
      if (!form.category_id) {
        setBrands([]);
        return;
      }
      try {
        const brandsRes = await brandApi.list({ category_id: form.category_id });
        if (cancelled) return;
        setBrands(brandsRes.brands || []);
        setForm((p) => {
          const ids = (brandsRes.brands || []).map((b) => String(b.id));
          if (p.brand_id && !ids.includes(String(p.brand_id))) {
            return { ...p, brand_id: "" };
          }
          return p;
        });
      } catch {
        if (!cancelled) setBrands([]);
      }
    }
    loadBrands();
    return () => {
      cancelled = true;
    };
  }, [form.category_id]);

  const categoryOptions = useMemo(
    () =>
      categories.map((c) => ({
        value: String(c.id),
        label: `${"— ".repeat(c.level || 0)}${c.name}`,
        indent: c.level || 0,
      })),
    [categories]
  );

  const brandOptions = useMemo(
    () => brands.map((b) => ({ value: String(b.id), label: b.name })),
    [brands]
  );

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
      setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
      setErrors((p) => ({ ...p, [name]: "" }));
    },
    [isPrivateSeller, sanitizePriceInput]
  );

  const handleThumbnailAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const nextCount = 1 + images.length;
    if (nextCount > maxImages) {
      showError?.(`You can upload at most ${maxImages} photos.`);
      e.target.value = "";
      return;
    }
    setThumbnail(file);
    setErrors((p) => ({ ...p, images: "" }));
    e.target.value = "";
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    const room = maxImages - (thumbnail ? 1 : 0) - images.length;
    if (room <= 0) {
      showError?.(`You can upload at most ${maxImages} photos.`);
      e.target.value = "";
      return;
    }
    setImages((p) => [...p, ...files].slice(0, images.length + room));
    setErrors((p) => ({ ...p, images: "" }));
    e.target.value = "";
  };

  const removeImage = (idx) => setImages((p) => p.filter((_, i) => i !== idx));

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    const nextErrors = {};
    if (!form.name?.trim()) nextErrors.name = "Add a title for your item";
    if (!form.category_id) nextErrors.category_id = "Pick a category";
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) nextErrors.price = "Enter a valid price";
    const qty = isPrivateSeller ? parseInt(form.quantity, 10) : 1;
    const isDraft = form.status === "draft" || overFreeLimit;
    if (isNaN(qty) || qty < 0 || (!isDraft && qty < 1)) {
      nextErrors.quantity = "Quantity must be at least 1";
    }
    if (!isPrivateSeller && qty > 1) nextErrors.quantity = "Quantity is limited to 1";
    if (photoCount < minImages) nextErrors.images = `Add at least ${minImages} photo`;
    if (photoCount > maxImages) nextErrors.images = `Maximum ${maxImages} photos`;
    if (videoEnabled && !isValidUrl(form.video_url?.trim())) nextErrors.video_url = "Enter a valid URL (https://…)";
    const shippingMode = form.shipping_mode === "free_shipping" ? "free_shipping" : "customer_pays";
    if (shippingMode === "customer_pays") {
      const shipCost = parseFloat(form.shipping_cost_cached);
      if (isNaN(shipCost) || shipCost < 0) nextErrors.shipping_cost_cached = "Enter shipping price in PKR";
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
        status: overFreeLimit || form.status === "draft" ? "draft" : "published",
        video_url: videoEnabled ? form.video_url?.trim() || null : null,
        shipping_mode: shippingMode,
        shipping_cost_cached: shippingMode === "customer_pays" ? parseFloat(form.shipping_cost_cached) : 0,
      };
      if (thumbnail) payload.thumbnail = thumbnail;
      if (images.length) payload.images = images;
      await privateListingsApi.create(payload);
      showSuccess?.(
        overFreeLimit || form.status === "draft"
          ? "Draft saved. Pay the listing fee from My Listings to go live if required."
          : "Listing created successfully!"
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

  if (loading) {
    return (
      <div className="w-full py-8 space-y-4 animate-pulse">
        <div className="h-16 bg-gray-100 rounded-2xl" />
        <div className="h-96 bg-gray-100 rounded-2xl" />
      </div>
    );
  }

  if (config && !config.enabled) {
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
  if (atHardLimit) {
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
  const freeLeft = config?.free_remaining ?? Math.max(0, (config?.free_limit ?? 0) - (config?.live_used ?? 0));
  const submitLabel = submitting
    ? "Saving…"
    : form.status === "draft" || overFreeLimit
      ? "Save draft"
      : "Publish listing";

  return (
    <div className="w-full pb-24 sm:pb-6 max-w-3xl mx-auto" ref={formTopRef}>
      <PageHero
        title="Sell an Item"
        description="One simple form — photos, details, price, and shipping."
        illustration="sell"
        guide={
          config
            ? `${freeLeft} free live slot${freeLeft === 1 ? "" : "s"} left · up to ${config.max_limit || config.limit} total listings.`
            : undefined
        }
      />

      {overFreeLimit && (
        <div className="mt-4 mb-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-900">
          No free live slots left. This saves as a <strong>draft</strong>
          {listingFee != null ? ` — pay Rs ${listingFee} from My Listings to activate` : ""}.
        </div>
      )}

      <form id="sell-item-form" onSubmit={handleSubmit} className="mt-4">
        <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden">
          <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-gray-50/60">
            <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 text-[#1790d7] flex items-center justify-center">
              <Package className="w-[18px] h-[18px]" />
            </span>
            <div>
              <h2 className="font-semibold text-gray-900 text-[15px]">Listing details</h2>
              <p className="text-xs text-gray-500">Everything buyers need in one place</p>
            </div>
          </div>

          <div className="p-4 sm:p-6 space-y-5">
            <Field label="Title" required error={errors.name} hint="Brand, model, key details">
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="e.g. Samsung Galaxy A54 128GB — Excellent condition"
                className={inputClass(!!errors.name)}
                autoComplete="off"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Category" required error={errors.category_id}>
                <SearchableSelect
                  options={categoryOptions}
                  value={form.category_id}
                  onChange={(v) => {
                    setForm((p) => ({ ...p, category_id: v, brand_id: "" }));
                    setErrors((p) => ({ ...p, category_id: "" }));
                  }}
                  placeholder="Search category…"
                  hasError={!!errors.category_id}
                />
              </Field>
              <Field
                label="Brand (optional)"
                hint={form.category_id && !brands.length ? "No brands for this category yet" : undefined}
              >
                <SearchableSelect
                  options={brandOptions}
                  value={form.brand_id}
                  onChange={(v) => setForm((p) => ({ ...p, brand_id: v }))}
                  placeholder={form.category_id ? "Search brand…" : "Select category first"}
                  disabled={!form.category_id}
                />
              </Field>
            </div>

            <Field label="Condition">
              <div className="grid grid-cols-3 gap-2">
                {CONDITIONS.map((opt) => {
                  const active = form.condition === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, condition: opt.value }))}
                      className={`py-2.5 px-2 rounded-xl border text-sm font-semibold transition ${
                        active
                          ? "border-[#1790d7] bg-[#1790d7]/10 text-[#1277b8]"
                          : "border-gray-200 text-gray-600 hover:border-gray-300"
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            <Field label="Description" hint="Specs, what’s included, any flaws">
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows={4}
                placeholder="Describe your item…"
                className={`${inputClass(false)} resize-y min-h-[100px]`}
              />
            </Field>

            <div className="border-t border-gray-100 pt-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Camera className="w-4 h-4 text-[#1790d7]" />
                  <p className="text-sm font-semibold text-gray-900">
                    Photos <span className="text-red-500">*</span>
                  </p>
                </div>
                <span className="text-xs text-gray-500">
                  {photoCount}/{maxImages} · min {minImages}
                </span>
              </div>
              {errors.images && <p className="mb-2 text-sm text-red-500">{errors.images}</p>}
              <div className="flex flex-wrap gap-3 items-start">
                {thumbnail ? (
                  <ThumbPreview file={thumbnail} onRemove={() => setThumbnail(null)} />
                ) : photoCount < maxImages ? (
                  <label className="flex flex-col items-center justify-center w-[100px] aspect-square border-2 border-dashed border-[#1790d7]/35 rounded-xl cursor-pointer hover:bg-[#1790d7]/5 transition">
                    <Upload className="w-6 h-6 text-[#1790d7] mb-1" />
                    <span className="text-[11px] font-semibold text-gray-800">Main</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailAdd} />
                  </label>
                ) : null}
                <GalleryPreview files={images} onRemove={removeImage} />
                {photoCount < maxImages && (
                  <label className="w-[68px] sm:w-20 aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
                    <ImagePlus className="w-5 h-5 text-gray-400" />
                    <span className="text-[10px] text-gray-500 mt-1">Add</span>
                    <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                  </label>
                )}
              </div>
            </div>

            {videoEnabled && (
              <Field label="Video link (optional)" error={errors.video_url} hint="YouTube or Vimeo">
                <div className="relative">
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

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100 pt-5">
              <Field label="Selling price" required error={errors.price}>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rs</span>
                  <input
                    type="text"
                    inputMode="decimal"
                    name="price"
                    value={formatPriceWithCommas(form.price)}
                    onChange={handleChange}
                    placeholder="0"
                    className={`${inputClass(!!errors.price)} pl-10`}
                  />
                </div>
              </Field>
              <Field label="Quantity" required error={errors.quantity} hint={isPrivateSeller ? "Units available" : undefined}>
                <input
                  type="number"
                  name="quantity"
                  value={isPrivateSeller ? form.quantity : "1"}
                  onChange={handleChange}
                  min="1"
                  max={isPrivateSeller ? undefined : 1}
                  disabled={!isPrivateSeller}
                  readOnly={!isPrivateSeller}
                  className={`${inputClass(!!errors.quantity)} w-28 ${!isPrivateSeller ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""}`}
                />
              </Field>
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Shipping</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                <Field label="Shipping price" required error={errors.shipping_cost_cached}>
                  <div className="relative max-w-xs">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rs</span>
                    <input
                      type="text"
                      inputMode="decimal"
                      name="shipping_cost_cached"
                      value={formatPriceWithCommas(form.shipping_cost_cached)}
                      onChange={handleChange}
                      placeholder="e.g. 250"
                      className={`${inputClass(!!errors.shipping_cost_cached)} pl-10`}
                    />
                  </div>
                </Field>
              )}
            </div>

            <div className="border-t border-gray-100 pt-5 space-y-3">
              <p className="text-sm font-semibold text-gray-900">Visibility</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {!overFreeLimit && (
                  <label
                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer ${
                      form.status === "published" ? "border-[#1790d7] bg-[#1790d7]/5" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="published"
                      checked={form.status === "published"}
                      onChange={handleChange}
                      className="mt-0.5 accent-[#1790d7]"
                    />
                    <span>
                      <span className="block font-semibold text-gray-900 text-sm">Publish</span>
                      <span className="text-xs text-gray-500">Go live now</span>
                    </span>
                  </label>
                )}
                <label
                  className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer ${
                    form.status === "draft" || overFreeLimit
                      ? "border-[#1790d7] bg-[#1790d7]/5"
                      : "border-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value="draft"
                    checked={form.status === "draft" || overFreeLimit}
                    onChange={handleChange}
                    className="mt-0.5 accent-[#1790d7]"
                  />
                  <span>
                    <span className="block font-semibold text-gray-900 text-sm">Save as draft</span>
                    <span className="text-xs text-gray-500">Activate later</span>
                  </span>
                </label>
              </div>
            </div>

            <div className="hidden sm:flex gap-3 pt-2">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 py-3.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl font-semibold shadow-sm disabled:opacity-50 transition"
              >
                {submitLabel}
              </button>
              <Link
                href="/customer/listings"
                className="px-5 py-3.5 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
              >
                Cancel
              </Link>
            </div>
          </div>
        </div>
      </form>

      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
        <div className="flex gap-2 w-full max-w-3xl mx-auto">
          <Link href="/customer/listings" className="px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm shrink-0">
            Cancel
          </Link>
          <button
            type="submit"
            form="sell-item-form"
            disabled={submitting}
            className="flex-1 py-3 bg-[#1790d7] text-white rounded-xl font-semibold text-sm disabled:opacity-50"
          >
            {submitLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
