"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { sellerProductsApi, categoryApi, brandApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import {
  ImagePlus,
  X,
  Package,
  Video,
  FileText,
  Upload,
  Sparkles,
  AlertCircle,
  ArrowLeft,
  Truck,
  Tag,
  CheckCircle2,
  Camera,
  Send,
  Search,
} from "lucide-react";
import PageHero from "@/components/customer/PageHero";
import {
  FormSection,
  FormField,
  formInputClass,
  btnPrimary,
} from "@/components/ui/FormSection";
import {
  applyProductFormChange,
  emptyMetaTouched,
  metaTouchKeyForField,
} from "@/lib/productSeo";

const CONDITIONS = [
  { value: "new", label: "New" },
  { value: "used", label: "Used" },
  { value: "refurbished", label: "Refurbished" },
];

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

function ThumbPreview({ file, onRemove }) {
  const url = useObjectUrl(file);
  if (!url) return null;
  return (
    <div className="relative inline-block">
      <img
        src={url}
        alt="Main product"
        className="w-full aspect-square max-w-[180px] object-cover rounded-xl border border-gray-200"
      />
      <button
        type="button"
        onClick={onRemove}
        className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow"
        aria-label="Remove"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}

function GalleryPreview({ files, alts, onRemove, onAltChange }) {
  const urls = useObjectUrls(files);
  return (
    <div className="flex flex-wrap gap-2.5">
      {files.map((file, i) => (
        <div key={`${file.name}-${file.size}-${i}`} className="relative w-[72px] sm:w-24">
          <div className="relative w-full aspect-square rounded-xl overflow-hidden border border-gray-200 bg-gray-50">
            <img src={urls[i]} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
              aria-label="Remove"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
          {onAltChange && (
            <input
              type="text"
              value={alts?.[i] || ""}
              onChange={(e) => onAltChange(i, e.target.value)}
              placeholder="Alt text"
              className="mt-1 w-full px-2 py-1 rounded border border-gray-200 text-[10px]"
            />
          )}
        </div>
      ))}
    </div>
  );
}

export default function AddProductPage() {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showExtras, setShowExtras] = useState(false);
  const [showSeo, setShowSeo] = useState(false);
  const [eligibility, setEligibility] = useState({
    featured_eligible: false,
    hot_eligible: false,
    promote_url: "/seller/promote",
  });
  const [form, setForm] = useState({
    name: "",
    sku: "",
    description: "",
    short_description: "",
    category_id: "",
    brand_id: "",
    price: "",
    compare_at_price: "",
    quantity: "1",
    condition: "new",
    video_url: "",
    is_featured: false,
    is_hot: false,
    status: "published",
    product_type: "simple",
    weight_kg: "0.5",
    shipping_mode: "customer_pays",
    shipping_cost_cached: "",
    length_cm: "",
    width_cm: "",
    height_cm: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [metaTouched, setMetaTouched] = useState(emptyMetaTouched);
  const [thumbnail, setThumbnail] = useState(null);
  const [thumbnailAlt, setThumbnailAlt] = useState("");
  const [images, setImages] = useState([]);
  const [galleryAlts, setGalleryAlts] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentLabels, setDocumentLabels] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    Promise.all([
      categoryApi.list(true),
      brandApi.list(),
      sellerProductsApi.promotionEligibility().catch(() => ({
        featured_eligible: false,
        hot_eligible: false,
      })),
    ])
      .then(([catRes, brandRes, eligRes]) => {
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
        setCategories(flattenCategories(catRes.categories || []));
        setBrands(brandRes.brands || []);
        setEligibility({
          featured_eligible: !!eligRes?.featured_eligible,
          hot_eligible: !!eligRes?.hot_eligible,
          promote_url: eligRes?.promote_url || "/seller/promote",
        });
      })
      .catch(() => showError?.("Failed to load"))
      .finally(() => setLoading(false));
  }, [showError]);

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
      const sanitized = sanitizePriceInput(value);
      setForm((p) =>
        applyProductFormChange(p, metaTouched, { name, value: sanitized, type: "text", checked: false })
      );
      setErrors((p) => ({ ...p, [name]: "" }));
      return;
    }
    const touchKey = metaTouchKeyForField(name);
    let nextTouched = metaTouched;
    if (touchKey) {
      nextTouched = { ...metaTouched, [touchKey]: true };
      setMetaTouched(nextTouched);
    }
    setForm((p) => applyProductFormChange(p, nextTouched, { name, value, type, checked }));
    setErrors((p) => ({ ...p, [name]: "" }));
  };

  const handleThumbnailAdd = (e) => {
    const file = e.target.files?.[0];
    if (file) setThumbnail(file);
  };

  const handleImageAdd = (e) => {
    const files = Array.from(e.target.files || []);
    setImages((p) => [...p, ...files].slice(0, 12));
    setGalleryAlts((p) => [...p, ...files.map(() => "")].slice(0, 12));
  };

  const removeImage = (idx) => {
    setImages((p) => p.filter((_, i) => i !== idx));
    setGalleryAlts((p) => p.filter((_, i) => i !== idx));
  };

  const updateGalleryAlt = (idx, value) => {
    setGalleryAlts((p) => {
      const next = [...p];
      next[idx] = value;
      return next;
    });
  };

  const handleDocumentAdd = (e) => {
    const files = Array.from(e.target.files || []);
    setDocuments((p) => [...p, ...files].slice(0, 5));
    setDocumentLabels((p) => [...p, ...files.map((f) => f.name)].slice(0, 5));
  };

  const removeDocument = (idx) => {
    setDocuments((p) => p.filter((_, i) => i !== idx));
    setDocumentLabels((p) => p.filter((_, i) => i !== idx));
  };

  const updateDocumentLabel = (idx, label) => {
    setDocumentLabels((p) => {
      const n = [...p];
      n[idx] = label;
      return n;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    if (!form.name?.trim()) {
      setErrors((p) => ({ ...p, name: "Product name is required" }));
      return;
    }
    if (!form.category_id) {
      setErrors((p) => ({ ...p, category_id: "Select a category" }));
      return;
    }
    const isVariable = form.product_type === "variable";
    const price = isVariable ? 0 : parseFloat(form.price);
    const qty = isVariable ? 0 : parseInt(form.quantity, 10);
    if (!isVariable) {
      if (isNaN(price) || price < 0) {
        setErrors((p) => ({ ...p, price: "Valid price required" }));
        return;
      }
      if (isNaN(qty) || qty < 0) {
        setErrors((p) => ({ ...p, quantity: "Quantity must be 0 or more" }));
        return;
      }
    }
    if (form.shipping_mode === "customer_pays") {
      const ship = parseFloat(form.shipping_cost_cached);
      if (isNaN(ship) || ship < 0) {
        setErrors((p) => ({ ...p, shipping_cost_cached: "Enter shipping price in PKR" }));
        return;
      }
    }
    if ((form.is_featured && !eligibility.featured_eligible) || (form.is_hot && !eligibility.hot_eligible)) {
      showError?.("You need to purchase a promotion package to use Featured or Hot. Visit Promote page.");
      return;
    }
    setSubmitting(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku?.trim() || undefined,
        description: form.description?.trim() || null,
        short_description: form.short_description?.trim() || null,
        category_id: parseInt(form.category_id, 10),
        brand_id: form.brand_id ? parseInt(form.brand_id, 10) : null,
        price,
        compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
        quantity: qty,
        condition: form.condition || "new",
        video_url: form.video_url?.trim() || null,
        is_featured: form.is_featured,
        is_hot: form.is_hot,
        status: form.status || "published",
        product_type: form.product_type || "simple",
        weight_kg: parseFloat(form.weight_kg) || 0.5,
        shipping_mode: form.shipping_mode || "customer_pays",
        shipping_cost_cached:
          form.shipping_mode === "customer_pays"
            ? Math.max(0, parseFloat(form.shipping_cost_cached) || 0)
            : 0,
        length_cm: form.length_cm ? parseFloat(form.length_cm) : undefined,
        width_cm: form.width_cm ? parseFloat(form.width_cm) : undefined,
        height_cm: form.height_cm ? parseFloat(form.height_cm) : undefined,
        meta_title: form.meta_title?.trim() || undefined,
        meta_description: form.meta_description?.trim() || undefined,
        meta_keywords: form.meta_keywords?.trim() || undefined,
      };
      if (thumbnail) payload.thumbnail = thumbnail;
      if (thumbnailAlt?.trim()) payload.thumbnail_alt = thumbnailAlt.trim();
      if (!isVariable && images.length) {
        payload.images = images;
        payload.image_alts = galleryAlts.slice(0, images.length);
      }
      if (documents.length) {
        payload.documents = documents;
        payload.document_labels = documentLabels;
      }
      const res = await sellerProductsApi.create(payload);
      if (form.product_type === "variable") {
        showSuccess?.(
          "Product created. Add variants (e.g. Red, Black) so customers can choose an option."
        );
        if (res?.product?.id) router.push(`/seller/products/${res.product.id}/variants`);
        else router.push("/seller/products");
      } else {
        showSuccess?.(
          res?.message || (form.status === "draft" ? "Product saved as draft!" : "Product created!")
        );
        router.push("/seller/products");
      }
    } catch (err) {
      if (err?.data?.message?.includes("store first")) {
        showError?.("Create a store first before adding products.");
        router.push("/seller/create-store");
        return;
      }
      const apiErrors = err?.data?.errors || {};
      const next = {};
      Object.keys(apiErrors).forEach((k) => {
        next[k] = Array.isArray(apiErrors[k]) ? apiErrors[k][0] : apiErrors[k];
      });
      setErrors((p) => ({ ...p, ...next }));
      showError?.(err?.data?.message || err?.message || "Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="w-full px-4 py-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-64 bg-gray-100 rounded-xl" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  const isVariable = form.product_type === "variable";
  const submitLabel = submitting
    ? "Saving…"
    : form.status === "draft"
      ? "Save as Draft"
      : isVariable
        ? "Create & Add Variants"
        : "Publish Product";

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="w-full pb-24 sm:pb-6 space-y-4">
        <Link
          href="/seller/products"
          className="text-[#1790d7] text-sm hover:underline inline-flex items-center gap-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Link>

        <PageHero
          title="Add Product"
          description="Same layout as Sell an Item — details, photos, price, shipping, and promotions."
          illustration="products"
          guide="Save as Draft to finish later, or Publish to go live. Variable products continue to the Variants step."
        />

        {Object.keys(errors).some((k) => errors[k]) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            Please fix the highlighted fields below before submitting.
          </div>
        )}

        <form id="add-product-form" onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <FormSection title="Item details" subtitle="What buyers see first" icon={Package}>
                <FormField label="Title" required error={errors.name} hint="Be specific — brand, model, key details">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Product name"
                    className={formInputClass(!!errors.name)}
                    autoComplete="off"
                  />
                </FormField>

                <FormField label="SKU" hint="Optional · leave blank to auto-generate">
                  <input
                    type="text"
                    name="sku"
                    value={form.sku}
                    onChange={handleChange}
                    placeholder="e.g. PROD-001"
                    className={formInputClass(false)}
                  />
                </FormField>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField label="Category" required error={errors.category_id}>
                    <select
                      name="category_id"
                      value={form.category_id}
                      onChange={handleChange}
                      className={formInputClass(!!errors.category_id)}
                    >
                      <option value="">Select category</option>
                      {categories.map((c) => (
                        <option key={c.id} value={c.id}>
                          {"—".repeat(c.level || 0)} {c.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                  <FormField label="Brand (Optional)">
                    <select
                      name="brand_id"
                      value={form.brand_id}
                      onChange={handleChange}
                      className={formInputClass(false)}
                    >
                      <option value="">Select brand</option>
                      {brands.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <FormField label="Condition">
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
                </FormField>

                <FormField
                  label="Product type"
                  hint="Variable products need options (size, color, etc.) — you’ll add variants after saving"
                >
                  <div className="flex flex-wrap gap-2 items-center">
                    {[
                      { value: "simple", label: "Simple" },
                      { value: "variable", label: "Variable" },
                    ].map((opt) => {
                      const active = form.product_type === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setForm((p) => ({ ...p, product_type: opt.value }))}
                          className={`px-4 py-2 rounded-xl border text-sm font-semibold transition ${
                            active
                              ? "border-[#1790d7] bg-[#1790d7]/10 text-[#1277b8]"
                              : "border-gray-200 text-gray-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {isVariable && (
                    <p className="mt-2 text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                      After saving you’ll go to Variants to add each option (price & stock per option).
                    </p>
                  )}
                </FormField>

                <FormField label="Short summary" hint="Optional · shown on listing cards">
                  <input
                    type="text"
                    name="short_description"
                    value={form.short_description}
                    onChange={handleChange}
                    placeholder="One short line"
                    maxLength={160}
                    className={formInputClass(false)}
                  />
                </FormField>

                <FormField label="Description" hint="Specs, what’s included, any flaws">
                  <textarea
                    name="description"
                    value={form.description}
                    onChange={handleChange}
                    rows={5}
                    placeholder="Describe your item…"
                    className={`${formInputClass(false)} resize-y min-h-[120px]`}
                  />
                </FormField>

                <button
                  type="button"
                  onClick={() => setShowSeo((v) => !v)}
                  className="text-sm font-medium text-[#1790d7] hover:underline inline-flex items-center gap-1.5"
                >
                  <Search className="w-3.5 h-3.5" />
                  {showSeo ? "Hide SEO fields" : "+ SEO (optional)"}
                </button>
                {showSeo && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <FormField label="Meta title" error={errors.meta_title}>
                      <input
                        type="text"
                        name="meta_title"
                        value={form.meta_title || ""}
                        onChange={handleChange}
                        placeholder="Title in Google"
                        className={formInputClass(!!errors.meta_title)}
                      />
                    </FormField>
                    <FormField label="Meta description" error={errors.meta_description}>
                      <textarea
                        name="meta_description"
                        value={form.meta_description || ""}
                        onChange={handleChange}
                        rows={2}
                        placeholder="Short summary for search"
                        className={formInputClass(!!errors.meta_description)}
                      />
                    </FormField>
                    <FormField label="Meta keywords">
                      <input
                        type="text"
                        name="meta_keywords"
                        value={form.meta_keywords || ""}
                        onChange={handleChange}
                        placeholder="e.g. headphones, wireless"
                        className={formInputClass(false)}
                      />
                    </FormField>
                  </div>
                )}
              </FormSection>

              <FormSection title="Photos" subtitle="Clear photos sell faster" icon={Camera}>
                <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5">
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-2">Main photo</p>
                    {thumbnail ? (
                      <ThumbPreview file={thumbnail} onRemove={() => setThumbnail(null)} />
                    ) : (
                      <label className="flex flex-col items-center justify-center w-full max-w-[180px] aspect-square border-2 border-dashed border-[#1790d7]/35 rounded-xl cursor-pointer hover:bg-[#1790d7]/5 transition">
                        <Upload className="w-7 h-7 text-[#1790d7] mb-1" />
                        <span className="text-xs font-semibold text-gray-800">Upload</span>
                        <span className="text-[10px] text-gray-500">Recommended</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailAdd} />
                      </label>
                    )}
                    {thumbnail && (
                      <input
                        type="text"
                        value={thumbnailAlt}
                        onChange={(e) => setThumbnailAlt(e.target.value)}
                        placeholder="Alt text (optional)"
                        className="mt-2 w-full max-w-[180px] px-2.5 py-1.5 rounded-lg border border-gray-200 text-xs"
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-800">Gallery</p>
                      {!isVariable && <span className="text-xs text-gray-500">{images.length}/12</span>}
                    </div>
                    {isVariable ? (
                      <p className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl px-3 py-3">
                        Gallery images are set per variant on the next step.
                      </p>
                    ) : (
                      <>
                        <div className="flex flex-wrap gap-2.5 items-start">
                          <GalleryPreview
                            files={images}
                            alts={galleryAlts}
                            onRemove={removeImage}
                            onAltChange={updateGalleryAlt}
                          />
                          {images.length < 12 && (
                            <label className="w-[72px] sm:w-24 aspect-square rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5 transition">
                              <ImagePlus className="w-5 h-5 text-gray-400" />
                              <span className="text-[10px] text-gray-500 mt-1">Add</span>
                              <input
                                type="file"
                                accept="image/*"
                                multiple
                                className="hidden"
                                onChange={handleImageAdd}
                              />
                            </label>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 mt-2">Add angles, box, and any wear.</p>
                      </>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowExtras((v) => !v)}
                  className="text-sm font-medium text-[#1790d7] hover:underline"
                >
                  {showExtras ? "Hide optional extras" : "+ Video or documents (optional)"}
                </button>

                {showExtras && (
                  <div className="space-y-4 pt-3 border-t border-gray-100">
                    <FormField label="Video link" hint="YouTube or Vimeo">
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          name="video_url"
                          value={form.video_url}
                          onChange={handleChange}
                          placeholder="https://…"
                          className={`${formInputClass(false)} pl-10`}
                        />
                      </div>
                    </FormField>
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-1 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Documents
                      </p>
                      <p className="text-xs text-gray-500 mb-2">PDF / DOC · max 5</p>
                      <div className="space-y-2">
                        {documents.map((file, i) => (
                          <div
                            key={i}
                            className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 bg-gray-50 rounded-xl"
                          >
                            <input
                              type="text"
                              value={documentLabels[i] || ""}
                              onChange={(e) => updateDocumentLabel(i, e.target.value)}
                              placeholder="Label"
                              className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
                            />
                            <div className="flex items-center gap-2 min-w-0">
                              <span className="text-xs text-gray-500 truncate flex-1">{file.name}</span>
                              <button
                                type="button"
                                onClick={() => removeDocument(i)}
                                className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg shrink-0"
                              >
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
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx"
                            className="hidden"
                            onChange={handleDocumentAdd}
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}
              </FormSection>
            </div>

            <div className="lg:col-span-5 xl:col-span-4 space-y-4 lg:sticky lg:top-4 lg:self-start">
              <FormSection title="Price & stock" subtitle="PKR" icon={Tag}>
                {isVariable ? (
                  <p className="text-sm text-gray-500 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3">
                    For variable products, price and quantity are set per variant on the next step.
                  </p>
                ) : (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
                      <FormField label="Selling price" required error={errors.price}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                            Rs
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            name="price"
                            value={formatPriceWithCommas(form.price)}
                            onChange={handleChange}
                            placeholder="0"
                            className={`${formInputClass(!!errors.price)} pl-10`}
                          />
                        </div>
                      </FormField>
                      <FormField label="Compare at (optional)" hint="Shows discount badge">
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                            Rs
                          </span>
                          <input
                            type="text"
                            inputMode="decimal"
                            name="compare_at_price"
                            value={formatPriceWithCommas(form.compare_at_price)}
                            onChange={handleChange}
                            placeholder="Was price"
                            className={`${formInputClass(false)} pl-10`}
                          />
                        </div>
                      </FormField>
                    </div>
                    <FormField label="Quantity" required error={errors.quantity} hint="Units in stock">
                      <input
                        type="number"
                        name="quantity"
                        value={form.quantity}
                        onChange={handleChange}
                        min="0"
                        className={`${formInputClass(!!errors.quantity)} w-28`}
                      />
                    </FormField>
                  </>
                )}
              </FormSection>

              <FormSection title="Shipping" subtitle="Who pays delivery?" icon={Truck}>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    {
                      value: "customer_pays",
                      title: "Buyer pays shipping",
                      desc: "You set a fixed shipping fee at checkout.",
                    },
                    {
                      value: "free_shipping",
                      title: "You pay (free for buyer)",
                      desc: "Buyers see free shipping on this item.",
                    },
                    {
                      value: "included_in_price",
                      title: "Included in price",
                      desc: "Shipping cost is built into the product price.",
                    },
                  ].map((opt) => {
                    const active = form.shipping_mode === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setForm((p) => ({ ...p, shipping_mode: opt.value }))}
                        className={`text-left p-3.5 rounded-xl border transition ${
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
                {form.shipping_mode === "customer_pays" && (
                  <FormField label="Shipping price" required error={errors.shipping_cost_cached}>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                        Rs
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        name="shipping_cost_cached"
                        value={formatPriceWithCommas(form.shipping_cost_cached)}
                        onChange={handleChange}
                        placeholder="e.g. 250"
                        className={`${formInputClass(!!errors.shipping_cost_cached)} pl-10`}
                      />
                    </div>
                  </FormField>
                )}
              </FormSection>

              <FormSection title="Promotions" subtitle="Boost visibility" icon={Sparkles}>
                <div className="flex flex-col gap-3">
                  <label
                    className={`flex items-center gap-2 ${
                      eligibility.featured_eligible ? "cursor-pointer" : "opacity-80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="is_featured"
                      checked={form.is_featured}
                      onChange={handleChange}
                      disabled={!eligibility.featured_eligible}
                      className="rounded"
                    />
                    <span className="text-sm font-medium text-gray-800">Featured</span>
                    {!eligibility.featured_eligible && (
                      <span className="text-amber-600 text-xs flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Requires package
                      </span>
                    )}
                  </label>
                  <label
                    className={`flex items-center gap-2 ${
                      eligibility.hot_eligible ? "cursor-pointer" : "opacity-80"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="is_hot"
                      checked={form.is_hot}
                      onChange={handleChange}
                      disabled={!eligibility.hot_eligible}
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
                    <Link
                      href={eligibility.promote_url || "/seller/promote"}
                      className="text-xs font-medium text-[#1790d7] hover:underline"
                    >
                      Buy a promotion package →
                    </Link>
                  )}
                </div>
              </FormSection>

              <FormSection title="Publish" subtitle="Go live or save for later" icon={Send}>
                <div className="grid grid-cols-1 gap-2.5">
                  <label
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
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
                      <span className="text-xs text-gray-500">Live or pending approval</span>
                    </span>
                  </label>
                  <label
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                      form.status === "draft" ? "border-[#1790d7] bg-[#1790d7]/5" : "border-gray-200"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value="draft"
                      checked={form.status === "draft"}
                      onChange={handleChange}
                      className="mt-0.5 accent-[#1790d7]"
                    />
                    <span>
                      <span className="block font-semibold text-gray-900 text-sm">Save as draft</span>
                      <span className="text-xs text-gray-500">Hidden until you publish</span>
                    </span>
                  </label>
                </div>

                <div className="hidden sm:flex flex-col gap-2 pt-1">
                  <button
                    type="submit"
                    disabled={submitting}
                    className={`w-full py-3.5 text-base ${btnPrimary}`}
                  >
                    {submitLabel}
                  </button>
                  <Link
                    href="/seller/products"
                    className="w-full py-3 text-center border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition text-sm"
                  >
                    Cancel
                  </Link>
                </div>
              </FormSection>
            </div>
          </div>
        </form>

        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="flex gap-2 w-full">
            <Link
              href="/seller/products"
              className="px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm shrink-0"
            >
              Cancel
            </Link>
            <button
              type="submit"
              form="add-product-form"
              disabled={submitting}
              className="flex-1 py-3 bg-[#1790d7] text-white rounded-xl font-semibold text-sm disabled:opacity-50"
            >
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
