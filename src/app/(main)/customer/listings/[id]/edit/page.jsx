"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { privateListingsApi, categoryApi, brandApi, promotionApi, getBackendBaseUrl } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import useAuth from "@/hooks/useAuth";
import {
  ImagePlus,
  X,
  Package,
  Video,
  FileText,
  Upload,
  Truck,
  Tag,
  CheckCircle2,
  Camera,
  Send,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import PageHero from "@/components/customer/PageHero";

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

function Section({ title, subtitle, icon: Icon, children, className = "" }) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm ${className}`}>
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100">
        {Icon && (
          <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 text-[#1790d7] flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-[15px] sm:text-base leading-tight">{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </section>
  );
}

function Field({ label, required, hint, error, children, className = "" }) {
  return (
    <div className={className}>
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
      <img src={url} alt="Main product" className="w-full aspect-square max-w-[180px] object-cover rounded-xl border border-gray-200" />
      <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow" aria-label="Remove main photo">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function GalleryPreview({ files, onRemove }) {
  const urls = useObjectUrls(files);
  return (
    <div className="flex flex-wrap gap-2.5">
      {files.map((file, i) => (
        <div key={`${file.name}-${file.size}-${i}`} className="relative w-[72px] sm:w-24">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={urls[i]} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => onRemove(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center" aria-label="Remove photo">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function getMediaImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  const p = path.trim();
  if (p.startsWith("http")) return p;
  const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
  if (p.startsWith("upload/")) return `${base}/${p}`;
  return `${base}/storage/${p}`;
}

export default function EditListingPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [eligibility, setEligibility] = useState({ featured_eligible: false, hot_eligible: false, promote_url: "/customer/promote" });
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
    video_url: "",
    shipping_mode: "customer_pays",
    shipping_cost_cached: "",
    is_featured: false,
    is_hot: false,
  });
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingThumb, setExistingThumb] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [documentLabels, setDocumentLabels] = useState([]);
  const [errors, setErrors] = useState({});
  const isPrivateSeller = !!user?.is_private_seller;

  useEffect(() => {
    if (!id) return;
    async function load() {
      try {
        const [listRes, categoriesRes, brandsRes, eligRes] = await Promise.all([
          privateListingsApi.list(),
          categoryApi.list(true),
          brandApi.list(),
          promotionApi.eligibility().catch(() => ({ featured_eligible: false, hot_eligible: false })),
        ]);
        const listings = listRes.listings || listRes.products || [];
        const listing = listings.find((l) => l.id === parseInt(id, 10));
        if (!listing) {
          showError?.("Listing not found");
          router.push("/customer/listings");
          return;
        }
        setForm({
          name: listing.name || "",
          description: listing.description || "",
          short_description: listing.short_description || "",
          category_id: String(listing.category_id || ""),
          brand_id: listing.brand_id ? String(listing.brand_id) : "",
          price: String(listing.price || ""),
          compare_at_price: listing.compare_at_price ? String(listing.compare_at_price) : "",
          quantity: String(listing.quantity || 1),
          condition: listing.condition || "new",
          video_url: listing.video_url || "",
          shipping_mode: listing.shipping_mode === "free_shipping" ? "free_shipping" : "customer_pays",
          shipping_cost_cached: listing.shipping_cost_cached != null ? String(listing.shipping_cost_cached) : "",
          is_featured: !!listing.is_featured,
          is_hot: !!listing.is_hot,
        });
        setExistingImages(listing.media || listing.product_media || []);
        setExistingThumb(listing.thumbnail_path || listing.thumbnail_url || null);
        if (listing.video_url || (listing.documents && listing.documents.length)) setShowExtras(true);
        setEligibility({
          featured_eligible: !!eligRes.featured_eligible,
          hot_eligible: !!eligRes.hot_eligible,
          promote_url: eligRes.promote_url || "/customer/promote",
        });
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
        setBrands(brandsRes.brands || []);
      } catch (err) {
        showError?.(err?.message || "Failed to load");
        router.push("/customer/listings");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id, router, showError]);

  const formatPriceWithCommas = (val) => {
    if (val == null || val === "") return "";
    const s = String(val).replace(/,/g, "");
    const parts = s.split(".");
    const int = (parts[0] || "0").replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const dec = parts[1] != null ? "." + parts[1].replace(/\D/g, "").slice(0, 2) : "";
    return int + dec;
  };
  const sanitizePriceInput = (value) => {
    let v = String(value).replace(/,/g, "").replace(/[^\d.]/g, "");
    const parts = v.split(".");
    if (parts.length > 1) v = parts[0] + "." + parts.slice(1).join("").slice(0, 2);
    return v;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name === "price" || name === "compare_at_price" || name === "shipping_cost_cached") {
      setForm((p) => ({ ...p, [name]: sanitizePriceInput(value) }));
      setErrors((p) => ({ ...p, [name]: "" }));
      return;
    }
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleThumbnailAdd = (e) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(file);
  };
  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((p) => [...p, ...files].slice(0, 12));
  };
  const removeImage = (idx) => setImages((p) => p.filter((_, i) => i !== idx));
  const handleDocumentAdd = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setDocuments((p) => [...p, file].slice(0, 5));
    setDocumentLabels((p) => [...p, ""].slice(0, 5));
  };
  const removeDocument = (idx) => {
    setDocuments((p) => p.filter((_, i) => i !== idx));
    setDocumentLabels((p) => p.filter((_, i) => i !== idx));
  };
  const updateDocumentLabel = (idx, value) => {
    setDocumentLabels((p) => p.map((l, i) => (i === idx ? value : l)));
  };

  const isValidUrl = (s) => {
    if (!s) return true;
    try {
      const u = new URL(s);
      return u.protocol === "http:" || u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.name.trim()) {
      setErrors((p) => ({ ...p, name: "Title is required" }));
      return;
    }
    if (!form.category_id) {
      setErrors((p) => ({ ...p, category_id: "Category is required" }));
      return;
    }
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setErrors((p) => ({ ...p, price: "Enter a valid price" }));
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setErrors((p) => ({ ...p, quantity: "Quantity must be 0 or more" }));
      return;
    }
    if (!isValidUrl(form.video_url?.trim())) {
      setErrors((p) => ({ ...p, video_url: "Enter a valid URL (https://…)" }));
      return;
    }
    const shippingMode = form.shipping_mode === "free_shipping" ? "free_shipping" : "customer_pays";
    if (shippingMode === "customer_pays") {
      const shipCost = parseFloat(form.shipping_cost_cached);
      if (isNaN(shipCost) || shipCost < 0) {
        setErrors((p) => ({ ...p, shipping_cost_cached: "Enter shipping price in PKR" }));
        return;
      }
    }
    if ((form.is_featured && !eligibility.featured_eligible) || (form.is_hot && !eligibility.hot_eligible)) {
      showError?.("Purchase a promotion package to use Featured/Hot.");
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
        is_featured: !!form.is_featured,
        is_hot: !!form.is_hot,
      };
      if (thumbnail) payload.thumbnail = thumbnail;
      if (images.length) payload.images = images;
      if (documents.length) {
        payload.documents = documents;
        payload.document_labels = documentLabels;
      }
      await privateListingsApi.update(id, payload);
      showSuccess?.("Listing updated.");
      router.push("/customer/listings");
    } catch (err) {
      const apiErrors = err?.data?.errors || {};
      const next = {};
      Object.keys(apiErrors).forEach((k) => {
        next[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : apiErrors[k];
      });
      setErrors((p) => ({ ...p, ...next }));
      showError?.(err?.data?.message || err?.message || "Failed to update");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;
  }

  const existingThumbUrl = existingThumb
    ? String(existingThumb).startsWith("http")
      ? existingThumb
      : getMediaImageUrl(existingThumb)
    : null;

  return (
    <div className="space-y-5 pb-24 sm:pb-8">
      <PageHero
        title="Edit Listing"
        description="Update your item with the same details as Sell an Item — photos, price, shipping, and promotions."
        illustration="products"
      />

      <form id="edit-listing-form" onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <Section title="Item details" subtitle="What are you selling?" icon={Package}>
              <Field label="Title" required error={errors.name}>
                <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="What are you selling?" className={inputClass(!!errors.name)} />
              </Field>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Field label="Category" required error={errors.category_id}>
                  <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass(!!errors.category_id)}>
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {"—".repeat(c.level || 0)} {c.name}
                      </option>
                    ))}
                  </select>
                </Field>
                <Field label="Brand (Optional)">
                  <select name="brand_id" value={form.brand_id} onChange={handleChange} className={inputClass(false)}>
                    <option value="">Select brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
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
                          active ? "border-[#1790d7] bg-[#1790d7]/10 text-[#1277b8]" : "border-gray-200 text-gray-600 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    );
                  })}
                </div>
              </Field>

              <Field label="Short summary" hint="Optional · shown on listing cards">
                <input type="text" name="short_description" value={form.short_description} onChange={handleChange} placeholder="One short line" maxLength={160} className={inputClass(false)} />
              </Field>

              <Field label="Description" hint="Specs, what’s included, any flaws">
                <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe your item…" className={`${inputClass(false)} resize-y min-h-[120px]`} />
              </Field>
            </Section>

            <Section title="Photos" subtitle="Clear photos sell faster" icon={Camera}>
              <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5">
                <div>
                  <p className="text-sm font-medium text-gray-800 mb-2">Main photo</p>
                  {thumbnail ? (
                    <ThumbPreview file={thumbnail} onRemove={() => setThumbnail(null)} />
                  ) : existingThumbUrl ? (
                    <div className="relative inline-block">
                      <img src={existingThumbUrl} alt="" className="w-full aspect-square max-w-[180px] object-cover rounded-xl border border-gray-200" />
                      <label className="mt-2 inline-flex text-xs font-medium text-[#1790d7] hover:underline cursor-pointer">
                        Replace
                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailAdd} />
                      </label>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full max-w-[180px] aspect-square border-2 border-dashed border-[#1790d7]/35 rounded-xl cursor-pointer hover:bg-[#1790d7]/5 transition">
                      <Upload className="w-7 h-7 text-[#1790d7] mb-1" />
                      <span className="text-xs font-semibold text-gray-800">Upload</span>
                      <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailAdd} />
                    </label>
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm font-medium text-gray-800">Gallery</p>
                    <span className="text-xs text-gray-500">{images.length}/12</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5 items-start">
                    {existingImages.map((m) => (
                      <div key={m.id} className="relative w-[72px] sm:w-24 aspect-square rounded-xl overflow-hidden border border-gray-200">
                        <img src={m.image_url || getMediaImageUrl(m.path)} alt="" className="w-full h-full object-cover" />
                        <span className="absolute bottom-1 left-1 text-[9px] bg-black/60 text-white px-1 rounded">Current</span>
                      </div>
                    ))}
                    <GalleryPreview files={images} onRemove={removeImage} />
                    {images.length < 12 && (
                      <label className="w-[72px] sm:w-24 aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
                        <ImagePlus className="w-5 h-5 text-gray-400" />
                        <span className="text-[10px] text-gray-500 mt-1">Add</span>
                        <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageAdd} />
                      </label>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-2">New gallery uploads replace the current gallery.</p>
                </div>
              </div>

              <button type="button" onClick={() => setShowExtras((v) => !v)} className="text-sm font-medium text-[#1790d7] hover:underline">
                {showExtras ? "Hide optional extras" : "+ Video or documents (optional)"}
              </button>

              {showExtras && (
                <div className="space-y-4 pt-3 border-t border-gray-100">
                  <Field label="Video link" error={errors.video_url} hint="YouTube or Vimeo">
                    <div className="relative">
                      <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input type="url" name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://…" className={`${inputClass(!!errors.video_url)} pl-10`} />
                    </div>
                  </Field>
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-1 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-500" />
                      Documents
                    </p>
                    <p className="text-xs text-gray-500 mb-2">PDF / DOC · max 5</p>
                    <div className="space-y-2">
                      {documents.map((file, i) => (
                        <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-50 rounded-xl">
                          <input type="text" value={documentLabels[i] || ""} onChange={(e) => updateDocumentLabel(i, e.target.value)} placeholder="Label" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white" />
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs text-gray-500 truncate flex-1">{file.name}</span>
                            <button type="button" onClick={() => removeDocument(i)} className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                    {documents.length < 5 && (
                      <label className="mt-2 inline-flex items-center gap-2 px-4 py-2 border border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#1790d7] text-sm font-medium text-gray-700">
                        <Upload className="w-4 h-4" />
                        Add document
                        <input type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={handleDocumentAdd} />
                      </label>
                    )}
                  </div>
                </div>
              )}
            </Section>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4 lg:self-start">
            <Section title="Price & stock" subtitle="PKR" icon={Tag}>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                <Field label="Selling price" required error={errors.price}>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rs</span>
                    <input type="text" inputMode="decimal" name="price" value={formatPriceWithCommas(form.price)} onChange={handleChange} placeholder="0" className={`${inputClass(!!errors.price)} pl-10`} />
                  </div>
                </Field>
                <Field label="Compare at (optional)" hint="Shows discount badge">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rs</span>
                    <input type="text" inputMode="decimal" name="compare_at_price" value={formatPriceWithCommas(form.compare_at_price)} onChange={handleChange} placeholder="Was price" className={`${inputClass(false)} pl-10`} />
                  </div>
                </Field>
              </div>
              <Field label="Quantity" required error={errors.quantity} hint={isPrivateSeller ? "Units available" : "1 per listing"}>
                <input
                  type="number"
                  name="quantity"
                  value={form.quantity}
                  onChange={handleChange}
                  min="0"
                  max={isPrivateSeller ? undefined : 1}
                  readOnly={!isPrivateSeller}
                  className={`${inputClass(!!errors.quantity)} w-28 ${!isPrivateSeller ? "bg-gray-50" : ""}`}
                />
              </Field>
            </Section>

            <Section title="Shipping" subtitle="Who pays delivery?" icon={Truck}>
              <div className="grid grid-cols-1 gap-2.5">
                {[
                  { value: "customer_pays", title: "Buyer pays shipping", desc: "You set a fixed shipping fee at checkout." },
                  { value: "free_shipping", title: "You pay (free for buyer)", desc: "Buyers see free shipping on this item." },
                ].map((opt) => {
                  const active = form.shipping_mode === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm((p) => ({ ...p, shipping_mode: opt.value }))}
                      className={`text-left p-3.5 rounded-xl border transition ${active ? "border-[#1790d7] bg-[#1790d7]/5" : "border-gray-200 hover:border-gray-300"}`}
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
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">Rs</span>
                    <input type="text" inputMode="decimal" name="shipping_cost_cached" value={formatPriceWithCommas(form.shipping_cost_cached)} onChange={handleChange} placeholder="e.g. 250" className={`${inputClass(!!errors.shipping_cost_cached)} pl-10`} />
                  </div>
                </Field>
              )}
            </Section>

            <Section title="Promotions" subtitle="Boost visibility" icon={Sparkles}>
              <div className="flex flex-col gap-3">
                <label className={`flex items-center gap-2 ${eligibility.featured_eligible ? "cursor-pointer" : "opacity-80"}`}>
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={form.is_featured}
                    onChange={handleChange}
                    disabled={!eligibility.featured_eligible && !form.is_featured}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-800">Featured</span>
                  {!eligibility.featured_eligible && (
                    <span className="text-amber-600 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Requires package
                    </span>
                  )}
                </label>
                <label className={`flex items-center gap-2 ${eligibility.hot_eligible ? "cursor-pointer" : "opacity-80"}`}>
                  <input
                    type="checkbox"
                    name="is_hot"
                    checked={form.is_hot}
                    onChange={handleChange}
                    disabled={!eligibility.hot_eligible && !form.is_hot}
                    className="rounded"
                  />
                  <span className="text-sm font-medium text-gray-800">Hot</span>
                  {!eligibility.hot_eligible && (
                    <span className="text-amber-600 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> Requires package
                    </span>
                  )}
                </label>
                {(!eligibility.featured_eligible || !eligibility.hot_eligible) && (
                  <Link href={eligibility.promote_url || "/customer/promote"} className="text-xs font-medium text-[#1790d7] hover:underline">
                    Buy a promotion package →
                  </Link>
                )}
              </div>
            </Section>

            <Section title="Save" subtitle="Apply your changes" icon={Send}>
              <div className="hidden sm:flex flex-col gap-2">
                <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl font-semibold shadow-sm disabled:opacity-50 transition">
                  {submitting ? "Saving…" : "Save Changes"}
                </button>
                <Link href="/customer/listings" className="w-full py-3 text-center border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition text-sm">
                  Cancel
                </Link>
              </div>
            </Section>
          </div>
        </div>
      </form>

      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
        <div className="flex gap-2 w-full">
          <Link href="/customer/listings" className="px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm shrink-0">
            Cancel
          </Link>
          <button type="submit" form="edit-listing-form" disabled={submitting} className="flex-1 py-3 bg-[#1790d7] text-white rounded-xl font-semibold text-sm disabled:opacity-50">
            {submitting ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
