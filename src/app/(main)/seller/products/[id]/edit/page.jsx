"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { sellerProductsApi, categoryApi, brandApi, promotionApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
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
  Layers,
  Search,
} from "lucide-react";
import PageHero from "@/components/customer/PageHero";
import {
  applyProductFormChange,
  emptyMetaTouched,
  initialMetaTouched,
  initialProductMeta,
  metaTouchKeyForField,
} from "@/lib/productSeo";

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
      <button type="button" onClick={onRemove} className="absolute -top-2 -right-2 w-8 h-8 bg-red-500 text-white rounded-full flex items-center justify-center shadow" aria-label="Remove">
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
            <button type="button" onClick={() => onRemove(i)} className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center" aria-label="Remove">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
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
  const [product, setProduct] = useState(null);
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
    product_type: "simple",
    status: "published",
    weight_kg: "0.5",
    shipping_mode: "customer_pays",
    shipping_cost_cached: "",
    meta_title: "",
    meta_description: "",
    meta_keywords: "",
  });
  const [metaTouched, setMetaTouched] = useState(emptyMetaTouched);
  const [thumbnail, setThumbnail] = useState(null);
  const [images, setImages] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [documentLabels, setDocumentLabels] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!id) return;
    Promise.all([
      categoryApi.list(true),
      brandApi.list(),
      promotionApi.eligibility().catch(() =>
        sellerProductsApi.promotionEligibility().catch(() => ({ featured_eligible: false, hot_eligible: false }))
      ),
      sellerProductsApi.get(id),
    ])
      .then(([catRes, brandRes, eligRes, prodRes]) => {
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
          featured_eligible: !!eligRes.featured_eligible,
          hot_eligible: !!eligRes.hot_eligible,
          promote_url: eligRes.promote_url || "/seller/promote",
        });
        const p = prodRes.product;
        setProduct(p);
        if (p) {
          const meta = initialProductMeta(p);
          setForm({
            name: p.name || "",
            sku: p.sku || "",
            description: p.description || "",
            short_description: p.short_description || "",
            category_id: String(p.category_id || ""),
            brand_id: p.brand_id ? String(p.brand_id) : "",
            price: p.price != null ? String(p.price) : "",
            compare_at_price: p.compare_at_price != null ? String(p.compare_at_price) : "",
            quantity: String(p.quantity ?? 1),
            condition: p.condition || "new",
            video_url: p.video_url || "",
            is_featured: !!p.is_featured,
            is_hot: !!p.is_hot,
            product_type: p.product_type || (p.variants?.length ? "variable" : "simple"),
            status: p.status === "draft" || p.status === "unpublished" ? "draft" : "published",
            weight_kg: String(p.weight_kg ?? 0.5),
            shipping_mode:
              p.shipping_mode === "free_shipping" || p.shipping_mode === "included_in_price"
                ? p.shipping_mode
                : "customer_pays",
            shipping_cost_cached: p.shipping_cost_cached != null ? String(p.shipping_cost_cached) : "",
            ...meta,
          });
          setMetaTouched(initialMetaTouched(p));
          if (p.video_url || p.documents?.length) setShowExtras(true);
          if (p.meta_title || p.meta_description || p.meta_keywords) setShowSeo(true);
        }
      })
      .catch(() => showError?.("Failed to load"))
      .finally(() => setLoading(false));
  }, [id, showError]);

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
      setForm((p) => applyProductFormChange(p, metaTouched, { name, value: sanitized, type: "text", checked: false }));
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
  };
  const removeImage = (idx) => setImages((p) => p.filter((_, i) => i !== idx));
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
    const price = parseFloat(form.price);
    if (isNaN(price) || price < 0) {
      setErrors((p) => ({ ...p, price: "Valid price required" }));
      return;
    }
    const qty = parseInt(form.quantity, 10);
    if (isNaN(qty) || qty < 0) {
      setErrors((p) => ({ ...p, quantity: "Quantity must be 0 or more" }));
      return;
    }
    if (form.shipping_mode === "customer_pays") {
      const ship = parseFloat(form.shipping_cost_cached);
      if (isNaN(ship) || ship < 0) {
        setErrors((p) => ({ ...p, shipping_cost_cached: "Enter shipping price in PKR" }));
        return;
      }
    }
    if ((form.is_featured && !eligibility.featured_eligible) || (form.is_hot && !eligibility.hot_eligible)) {
      showError?.("Purchase a promotion package to use Featured/Hot. Visit Promote page.");
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
        product_type: form.product_type || "simple",
        status: form.status || "published",
        weight_kg: parseFloat(form.weight_kg) || 0.5,
        shipping_mode: form.shipping_mode || "customer_pays",
        shipping_cost_cached:
          form.shipping_mode === "customer_pays" ? Math.max(0, parseFloat(form.shipping_cost_cached) || 0) : 0,
        meta_title: form.meta_title?.trim() || undefined,
        meta_description: form.meta_description?.trim() || undefined,
        meta_keywords: form.meta_keywords?.trim() || undefined,
      };
      if (thumbnail) payload.thumbnail = thumbnail;
      if (images.length) payload.images = images;
      if (documents.length) {
        payload.documents = documents;
        payload.document_labels = documentLabels;
      }
      await sellerProductsApi.update(id, payload);
      showSuccess?.(form.status === "draft" ? "Product saved as draft." : "Product updated.");
      router.push("/seller/products");
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

  if (loading || !product) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />
      </ProtectedRoute>
    );
  }

  const existingMedia = (product.media || []).filter((m) => m.type === "image" || !m.type);
  const submitLabel = submitting ? "Saving…" : form.status === "draft" ? "Save as Draft" : "Save & Publish";

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="w-full pb-24 sm:pb-6 space-y-4">
        <Link href={`/seller/products/${id}`} className="text-amber-600 text-sm hover:underline inline-flex items-center gap-1">
          <ArrowLeft className="w-4 h-4" /> Back to Product
        </Link>

        <PageHero
          title="Edit Product"
          description="Same layout as Sell an Item — update details, photos, price, shipping, and promotions."
          illustration="products"
        />

        {Object.keys(errors).some((k) => errors[k]) && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            Please fix the highlighted fields below before submitting.
          </div>
        )}

        <form id="edit-product-form" onSubmit={handleSubmit} className="w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 w-full items-start">
            <div className="lg:col-span-7 xl:col-span-8 space-y-4">
              <Section title="Item details" subtitle="What buyers see first" icon={Package}>
                <Field label="Title" required error={errors.name} hint="Be specific — brand, model, key details">
                  <input type="text" name="name" value={form.name} onChange={handleChange} placeholder="Product name" className={inputClass(!!errors.name)} autoComplete="off" />
                </Field>

                <Field label="SKU" hint="Stock keeping code">
                  <input type="text" name="sku" value={form.sku} onChange={handleChange} placeholder="e.g. PROD-001" className={inputClass(false)} />
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

                <Field label="Product type" hint="Variable products need options (size, color, etc.)">
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
                            active ? "border-[#1790d7] bg-[#1790d7]/10 text-[#1277b8]" : "border-gray-200 text-gray-600"
                          }`}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                    {form.product_type === "variable" && (
                      <Link
                        href={`/seller/products/${id}/variants`}
                        className="inline-flex items-center gap-1.5 px-3 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
                      >
                        <Layers className="w-3.5 h-3.5" />
                        Manage Variants ({(product.variants || []).length})
                      </Link>
                    )}
                  </div>
                </Field>

                <Field label="Short summary" hint="Optional · shown on listing cards">
                  <input type="text" name="short_description" value={form.short_description} onChange={handleChange} placeholder="One short line" maxLength={160} className={inputClass(false)} />
                </Field>

                <Field label="Description" hint="Specs, what’s included, any flaws">
                  <textarea name="description" value={form.description} onChange={handleChange} rows={5} placeholder="Describe your item…" className={`${inputClass(false)} resize-y min-h-[120px]`} />
                </Field>

                <button type="button" onClick={() => setShowSeo((v) => !v)} className="text-sm font-medium text-[#1790d7] hover:underline inline-flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5" />
                  {showSeo ? "Hide SEO fields" : "+ SEO (optional)"}
                </button>
                {showSeo && (
                  <div className="space-y-3 pt-2 border-t border-gray-100">
                    <Field label="Meta title">
                      <input type="text" name="meta_title" value={form.meta_title || ""} onChange={handleChange} placeholder="Title in Google" className={inputClass(!!errors.meta_title)} />
                    </Field>
                    <Field label="Meta description">
                      <textarea name="meta_description" value={form.meta_description || ""} onChange={handleChange} rows={2} placeholder="Short summary for search" className={inputClass(!!errors.meta_description)} />
                    </Field>
                    <Field label="Meta keywords">
                      <input type="text" name="meta_keywords" value={form.meta_keywords || ""} onChange={handleChange} placeholder="e.g. headphones, wireless" className={inputClass(false)} />
                    </Field>
                  </div>
                )}
              </Section>

              <Section title="Photos" subtitle="Clear photos sell faster" icon={Camera}>
                <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] gap-5">
                  <div>
                    <p className="text-sm font-medium text-gray-800 mb-2">Main photo</p>
                    {thumbnail ? (
                      <ThumbPreview file={thumbnail} onRemove={() => setThumbnail(null)} />
                    ) : product.thumbnail_url ? (
                      <div className="relative inline-block">
                        <img src={product.thumbnail_url} alt="" className="w-full aspect-square max-w-[180px] object-cover rounded-xl border border-gray-200" />
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
                      {!images.length &&
                        existingMedia.map((m) => (
                          <div key={m.id} className="relative w-[72px] sm:w-24 aspect-square rounded-xl overflow-hidden border border-gray-200">
                            <img src={m.image_url || resolveMediaUrl(m.path)} alt="" className="w-full h-full object-cover" />
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
                    <p className="text-xs text-gray-500 mt-2">Uploading new gallery images replaces the current gallery.</p>
                  </div>
                </div>

                <button type="button" onClick={() => setShowExtras((v) => !v)} className="text-sm font-medium text-[#1790d7] hover:underline">
                  {showExtras ? "Hide optional extras" : "+ Video or documents (optional)"}
                </button>

                {showExtras && (
                  <div className="space-y-4 pt-3 border-t border-gray-100">
                    <Field label="Video link" hint="YouTube or Vimeo">
                      <div className="relative">
                        <Video className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input type="url" name="video_url" value={form.video_url} onChange={handleChange} placeholder="https://…" className={`${inputClass(false)} pl-10`} />
                      </div>
                    </Field>
                    <div>
                      <p className="text-sm font-medium text-gray-800 mb-1 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-gray-500" />
                        Documents
                      </p>
                      <p className="text-xs text-gray-500 mb-2">PDF / DOC · max 5</p>
                      {product.documents?.map((d) => (
                        <p key={d.id} className="text-xs text-gray-500 mb-1">
                          {d.label || d.original_name} (existing)
                        </p>
                      ))}
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
                <Field label="Quantity" required error={errors.quantity} hint={form.product_type === "variable" ? "Managed per variant when variable" : "Units in stock"}>
                  <input
                    type="number"
                    name="quantity"
                    value={form.quantity}
                    onChange={handleChange}
                    min="0"
                    disabled={form.product_type === "variable"}
                    className={`${inputClass(!!errors.quantity)} w-28 ${form.product_type === "variable" ? "bg-gray-50" : ""}`}
                  />
                </Field>
              </Section>

              <Section title="Shipping" subtitle="Who pays delivery?" icon={Truck}>
                <div className="grid grid-cols-1 gap-2.5">
                  {[
                    { value: "customer_pays", title: "Buyer pays shipping", desc: "You set a fixed shipping fee at checkout." },
                    { value: "free_shipping", title: "You pay (free for buyer)", desc: "Buyers see free shipping on this item." },
                    { value: "included_in_price", title: "Included in price", desc: "Shipping cost is built into the product price." },
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
                {form.shipping_mode === "customer_pays" && (
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
                  <label className={`flex items-center gap-2 ${eligibility.featured_eligible || form.is_featured ? "cursor-pointer" : "opacity-80"}`}>
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
                  <label className={`flex items-center gap-2 ${eligibility.hot_eligible || form.is_hot ? "cursor-pointer" : "opacity-80"}`}>
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
                    <Link href={eligibility.promote_url || "/seller/promote"} className="text-xs font-medium text-[#1790d7] hover:underline">
                      Buy a promotion package →
                    </Link>
                  )}
                </div>
              </Section>

              <Section title="Publish" subtitle="Go live or save for later" icon={Send}>
                <div className="grid grid-cols-1 gap-2.5">
                  <label
                    className={`flex items-start gap-3 p-3.5 border rounded-xl cursor-pointer transition ${
                      form.status === "published" ? "border-[#1790d7] bg-[#1790d7]/5" : "border-gray-200"
                    }`}
                  >
                    <input type="radio" name="status" value="published" checked={form.status === "published"} onChange={handleChange} className="mt-0.5 accent-[#1790d7]" />
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
                    <input type="radio" name="status" value="draft" checked={form.status === "draft"} onChange={handleChange} className="mt-0.5 accent-[#1790d7]" />
                    <span>
                      <span className="block font-semibold text-gray-900 text-sm">Save as draft</span>
                      <span className="text-xs text-gray-500">Hidden until you publish</span>
                    </span>
                  </label>
                </div>

                <div className="hidden sm:flex flex-col gap-2 pt-1">
                  <button type="submit" disabled={submitting} className="w-full py-3.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl font-semibold shadow-sm disabled:opacity-50 transition">
                    {submitLabel}
                  </button>
                  <Link href={`/seller/products/${id}`} className="w-full py-3 text-center border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition text-sm">
                    Cancel
                  </Link>
                </div>
              </Section>
            </div>
          </div>
        </form>

        <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur px-4 py-3">
          <div className="flex gap-2 w-full">
            <Link href={`/seller/products/${id}`} className="px-4 py-3 border border-gray-200 rounded-xl text-gray-700 font-medium text-sm shrink-0">
              Cancel
            </Link>
            <button type="submit" form="edit-product-form" disabled={submitting} className="flex-1 py-3 bg-[#1790d7] text-white rounded-xl font-semibold text-sm disabled:opacity-50">
              {submitLabel}
            </button>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
