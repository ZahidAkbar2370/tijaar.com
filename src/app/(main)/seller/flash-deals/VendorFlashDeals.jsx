"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  Tag,
  Plus,
  Pencil,
  Trash2,
  X,
  Search,
  Image as ImageIcon,
  ChevronDown,
  Check,
} from "lucide-react";
import { sellerFlashDealsApi, sellerProductsApi, getBackendBaseUrl } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";
import { useSnackbar } from "@/context/SnackbarContext";
import { confirmDelete } from "@/lib/sweetAlert";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";

const PLACEHOLDER_IMG = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120' fill='%23e5e7eb' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";

function variantImageUrl(variant) {
  if (!variant?.image_path) return null;
  const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
  const path = variant.image_path.startsWith("http") ? variant.image_path : `${base || ""}${variant.image_path.startsWith("/") ? "" : "/"}${variant.image_path}`;
  return path;
}

function variantLabel(variant) {
  if (!variant?.attributes || typeof variant.attributes !== "object") return variant?.name || "Option";
  return Object.entries(variant.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
}

export default function VendorFlashDeals() {
  const { showSuccess, showError } = useSnackbar();
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [products, setProducts] = useState([]);
  const [productSearch, setProductSearch] = useState("");
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    product_selections: [],
    discount_type: "percentage",
    discount_value: "",
    ends_at: "",
    image: null,
    image_alt: "",
    is_active: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

  const loadDeals = useCallback(async () => {
    try {
      const res = await sellerFlashDealsApi.list();
      setDeals(res.flash_deals || []);
    } catch (e) {
      showError?.(e?.message || "Failed to load Flash Deals");
    } finally {
      setLoading(false);
    }
  }, [showError]);

  useEffect(() => {
    loadDeals();
  }, [loadDeals]);

  useEffect(() => {
    if (formOpen) {
      sellerProductsApi.list({ per_page: 200 }).then((r) => setProducts(r.products || [])).catch(() => setProducts([]));
    }
  }, [formOpen]);

  // Lock body scroll when modal is open; only the form content scrolls. Prevent scroll jump.
  useEffect(() => {
    if (formOpen && typeof document !== "undefined") {
      const scrollY = window.scrollY;
      const prevOverflow = document.body.style.overflow;
      const prevPosition = document.body.style.position;
      const prevTop = document.body.style.top;
      const prevWidth = document.body.style.width;
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.position = prevPosition;
        document.body.style.top = prevTop;
        document.body.style.width = prevWidth;
        window.scrollTo(0, scrollY);
      };
    }
  }, [formOpen]);

  const openCreate = () => {
    setEditingId(null);
    setExpandedProductId(null);
    setForm({
      name: "",
      product_selections: [],
      discount_type: "percentage",
      discount_value: "",
      ends_at: "",
      image: null,
      image_alt: "",
      is_active: true,
    });
    setImagePreview(null);
    setFormOpen(true);
  };

  const openEdit = (deal) => {
    setEditingId(deal.id);
    setExpandedProductId(null);
    const endsAt = formatEndsAtForInput(deal.ends_at);
    setForm({
      name: deal.name || "",
      product_selections: (deal.products || []).map((p) => ({
        product_id: p.id,
        variant_id: p.variant_id ?? null,
      })),
      discount_type: deal.discount_type || "percentage",
      discount_value: String(deal.discount_value ?? ""),
      ends_at: endsAt,
      image: null,
      image_alt: deal.image_alt || "",
      is_active: deal.is_active !== false,
    });
    setImagePreview(deal.image_url || null);
    setFormOpen(true);
  };

  const closeForm = () => {
    setFormOpen(false);
    setEditingId(null);
    setExpandedProductId(null);
    setImagePreview(null);
  };

  const filteredProducts = products.filter(
    (p) =>
      !productSearch.trim() ||
      (p.name || "").toLowerCase().includes(productSearch.toLowerCase()) ||
      (p.sku || "").toLowerCase().includes(productSearch.toLowerCase())
  );

  const getSelection = (productId) =>
    form.product_selections.find((s) => s.product_id === productId) ?? null;

  const isProductSelected = (productId) => getSelection(productId) != null;

  const addSimpleProduct = (productId) => {
    setForm((prev) => ({
      ...prev,
      product_selections: prev.product_selections.some((s) => s.product_id === productId)
        ? prev.product_selections.filter((s) => s.product_id !== productId)
        : [...prev.product_selections, { product_id: productId, variant_id: null }],
    }));
  };

  const selectVariant = (productId, variantId) => {
    setForm((prev) => {
      const rest = prev.product_selections.filter((s) => s.product_id !== productId);
      return {
        ...prev,
        product_selections: [...rest, { product_id: productId, variant_id: variantId }],
      };
    });
  };

  const removeSelection = (productId) => {
    setForm((prev) => ({
      ...prev,
      product_selections: prev.product_selections.filter((s) => s.product_id !== productId),
    }));
    if (expandedProductId === productId) setExpandedProductId(null);
  };

  const toggleVariantExpand = (productId) => {
    setExpandedProductId((prev) => (prev === productId ? null : productId));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, image: file }));
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleSubmit = async () => {
    if (!form.name?.trim()) {
      showError?.("Enter deal name");
      return;
    }
    if (!form.product_selections?.length) {
      showError?.("Select at least one product");
      return;
    }
    const withVariants = products.filter((p) => p.variants?.length > 0);
    for (const sel of form.product_selections) {
      const product = withVariants.find((p) => p.id === sel.product_id);
      if (product && !sel.variant_id) {
        showError?.(`Select a size/color for "${product.name}"`);
        return;
      }
    }
    const val = parseFloat(form.discount_value);
    if (isNaN(val) || val < 0 || (form.discount_type === "percentage" && val > 100)) {
      showError?.(form.discount_type === "percentage" ? "Enter a valid percentage (0–100)" : "Enter a valid discount value");
      return;
    }
    setSubmitting(true);
    try {
      const endsAtPayload = endsAtToISO(form.ends_at?.trim());
      const payload = {
        name: form.name.trim(),
        product_selections: form.product_selections.map((s) => ({
          product_id: s.product_id,
          variant_id: s.variant_id || null,
        })),
        discount_type: form.discount_type,
        discount_value: val,
        ends_at: endsAtPayload,
        image: form.image || undefined,
        image_alt: form.image_alt?.trim() || undefined,
      };
      if (editingId) {
        await sellerFlashDealsApi.update(editingId, { ...payload, is_active: form.is_active });
        showSuccess?.("Flash Deal updated");
      } else {
        await sellerFlashDealsApi.create(payload);
        showSuccess?.("Flash Deal created");
      }
      closeForm();
      loadDeals();
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Failed to save");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirmDelete({
      title: "Delete Flash Deal?",
      text: `"${name}" will be removed. This cannot be undone.`,
      confirmButtonText: "Yes, delete",
    });
    if (!confirmed) return;
    try {
      await sellerFlashDealsApi.delete(id);
      showSuccess?.("Flash Deal deleted");
      loadDeals();
    } catch (e) {
      showError?.(e?.message || "Delete failed");
    }
  };

  const formatDiscount = (d) => {
    if (d.discount_type === "percentage") return `${d.discount_value}% off`;
    return `Rs ${Number(d.discount_value).toLocaleString()} off`;
  };

  /** API returns UTC ISO string; convert to local YYYY-MM-DDTHH:mm for datetime-local input */
  const formatEndsAtForInput = (isoString) => {
    if (!isoString) return "";
    const d = new Date(isoString);
    if (Number.isNaN(d.getTime())) return "";
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
  };

  /** Local datetime string from input -> UTC ISO for API */
  const endsAtToISO = (localStr) => {
    if (!localStr?.trim()) return null;
    const d = new Date(localStr);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  };

  const formatEndsAt = (endsAt) => {
    if (!endsAt) return "No expiry";
    const d = new Date(endsAt);
    const now = new Date();
    if (d < now) return "Expired";
    return d.toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHero
            title="Flash Deals"
            description="Create deals with clubbed products and a single discount. Customers see the deal as one bundle."
            illustration="products"
            guide="Add a deal name, select products, upload a deal image, set discount and expiry."
          />
          <button
            onClick={openCreate}
            className="px-4 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-xl text-sm font-medium hover:shadow-lg flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create Flash Deal
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-12 text-center text-gray-500">Loading Flash Deals…</div>
      ) : deals.length === 0 ? (
        <div className="bg-gray-50 rounded-2xl border border-gray-200 p-12 text-center">
          <Tag className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-600 font-medium">No Flash Deals yet</p>
          <p className="text-sm text-gray-500 mt-1">Create a deal with clubbed products and a discount.</p>
          <button
            onClick={openCreate}
            className="mt-4 px-4 py-2.5 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600"
          >
            Create Flash Deal
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {deals.map((deal) => (
            <div
              key={deal.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="aspect-video bg-gray-100 relative">
                <img
                  src={deal.image_url || PLACEHOLDER_IMG}
                  alt={resolveImageAlt(deal.image_alt, deal.name || IMAGE_ALT_FALLBACKS.flashDeal)}
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                />
                <span className="absolute top-2 left-2 px-2 py-1 rounded-lg bg-rose-500 text-white text-xs font-medium">
                  {formatDiscount(deal)}
                </span>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 truncate">{deal.name}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {deal.products?.length ?? 0} product(s) · Ends {formatEndsAt(deal.ends_at)}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => openEdit(deal)}
                    className="flex-1 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(deal.id, deal.name)}
                    className="py-2 px-3 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 flex items-center gap-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit form modal — portal, from top, only form scrolls (same as variant) */}
      {formOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 pb-4 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden onClick={closeForm} />
          <div
            className="relative flex flex-col bg-white rounded-2xl w-full max-w-lg h-[calc(100vh-2rem)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">{editingId ? "Edit Flash Deal" : "Create Flash Deal"}</h2>
                <p className="text-xs text-gray-500 mt-0.5">Set name, products, discount and end date.</p>
              </div>
              <button type="button" onClick={closeForm} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-6 overscroll-contain">
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deal name *</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Summer Bundle"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Deal image</label>
                    <div className="flex items-center gap-4">
                      <div className="w-24 h-24 rounded-xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center">
                        {imagePreview ? (
                          <img src={imagePreview} alt={resolveImageAlt(form.image_alt, form.name || IMAGE_ALT_FALLBACKS.flashDeal)} className="w-full h-full object-cover" />
                        ) : (
                          <ImageIcon className="w-8 h-8 text-gray-400" />
                        )}
                      </div>
                      <input type="file" accept="image/*" onChange={handleImageChange} className="text-sm" />
                    </div>
                    <input
                      type="text"
                      value={form.image_alt}
                      onChange={(e) => setForm((p) => ({ ...p, image_alt: e.target.value }))}
                      placeholder="Deal image alt text (optional)"
                      className="mt-2 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</h4>
                  <div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                    <div className="max-h-64 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100 bg-white">
                      {filteredProducts.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">No products</p>
                      ) : (
                        filteredProducts.map((p) => {
                          const hasVariants = p.variants?.length > 0;
                          const selection = getSelection(p.id);
                          const selectedVariant = hasVariants && selection?.variant_id
                            ? p.variants.find((v) => v.id === selection.variant_id)
                            : null;
                          const displayPrice = selectedVariant ? parseFloat(selectedVariant.price) : parseFloat(p.price || 0);
                          const isExpanded = expandedProductId === p.id;

                          return (
                            <div key={p.id} className="border-b border-gray-100 last:border-b-0">
                              <div className="flex items-center gap-3 p-3 hover:bg-gray-50/80">
                                {!hasVariants ? (
                                  <label className="flex items-center gap-3 flex-1 cursor-pointer">
                                    <input
                                      type="checkbox"
                                      checked={isProductSelected(p.id)}
                                      onChange={() => addSimpleProduct(p.id)}
                                      className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                                    />
                                    <span className="font-medium text-gray-900 truncate flex-1">{p.name}</span>
                                    <span className="text-sm font-semibold text-rose-600 tabular-nums">
                                      Rs {displayPrice.toLocaleString()}
                                    </span>
                                  </label>
                                ) : (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => toggleVariantExpand(p.id)}
                                      className="flex items-center gap-2 flex-1 min-w-0 text-left"
                                    >
                                      <ChevronDown
                                        className={`w-4 h-4 flex-shrink-0 text-gray-500 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                      />
                                      <span className="font-medium text-gray-900 truncate flex-1">{p.name}</span>
                                      {selection ? (
                                        <span className="text-xs bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full font-medium shrink-0">
                                          {variantLabel(selectedVariant)} · Rs {displayPrice.toLocaleString()}
                                        </span>
                                      ) : (
                                        <span className="text-xs text-amber-600 font-medium shrink-0">Select size & color</span>
                                      )}
                                    </button>
                                    {selection && (
                                      <button
                                        type="button"
                                        onClick={() => removeSelection(p.id)}
                                        className="text-xs text-gray-500 hover:text-red-600 font-medium"
                                      >
                                        Remove
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                              {hasVariants && isExpanded && (
                                <div className="px-3 pb-3 pt-0 bg-gradient-to-b from-gray-50/50 to-white border-t border-gray-100">
                                  <p className="text-xs font-medium text-gray-500 mb-2 mt-1">Choose variant (size, color)</p>
                                  <div className="flex flex-wrap gap-2">
                                    {p.variants.map((v) => {
                                      const isSelected = selection?.variant_id === v.id;
                                      const imgUrl = variantImageUrl(v) || p.thumbnail_url;
                                      return (
                                        <button
                                          key={v.id}
                                          type="button"
                                          onClick={() => selectVariant(p.id, v.id)}
                                          className={`flex items-center gap-2 rounded-xl border-2 p-2 transition-all ${
                                            isSelected
                                              ? "border-rose-500 bg-rose-50 shadow-sm"
                                              : "border-gray-200 bg-white hover:border-rose-200 hover:bg-rose-50/50"
                                          }`}
                                        >
                                          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                                            <img
                                              src={imgUrl || PLACEHOLDER_IMG}
                                              alt={resolveImageAlt(v.image_alt || p.image_alt, variantLabel(v) || p.name || IMAGE_ALT_FALLBACKS.product)}
                                              className="w-full h-full object-cover"
                                              onError={(e) => { e.target.src = PLACEHOLDER_IMG; }}
                                            />
                                          </div>
                                          <div className="text-left min-w-0">
                                            <p className="text-xs font-medium text-gray-900 truncate">{variantLabel(v)}</p>
                                            <p className="text-xs font-semibold text-rose-600">Rs {parseFloat(v.price || 0).toLocaleString()}</p>
                                          </div>
                                          {isSelected && <Check className="w-4 h-4 text-rose-600 shrink-0" />}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                    {form.product_selections.length > 0 && (
                      <p className="mt-2 text-xs text-rose-600 font-medium">{form.product_selections.length} product(s) selected</p>
                    )}
                  </div>
                </section>
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Discount & expiry</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Discount type</label>
                      <select
                        value={form.discount_type}
                        onChange={(e) => setForm((p) => ({ ...p, discount_type: e.target.value }))}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed amount</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {form.discount_type === "percentage" ? "Discount %" : "Discount amount"}
                      </label>
                      <input
                        type="number"
                        min={0}
                        max={form.discount_type === "percentage" ? 100 : undefined}
                        step={form.discount_type === "percentage" ? 1 : 0.01}
                        value={form.discount_value}
                        onChange={(e) => setForm((p) => ({ ...p, discount_value: e.target.value }))}
                        placeholder={form.discount_type === "percentage" ? "20" : "50"}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expiry date (optional)</label>
                    <input
                      type="datetime-local"
                      value={form.ends_at}
                      onChange={(e) => setForm((p) => ({ ...p, ends_at: e.target.value }))}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500"
                    />
                  </div>
                  {editingId && (
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.is_active}
                        onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                        className="rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                      />
                      <span className="text-sm text-gray-700">Active</span>
                    </label>
                  )}
                </section>
              </div>
              <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/90">
                <button
                  type="button"
                  onClick={closeForm}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting || !form.name?.trim() || !form.product_selections?.length}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-pink-500 text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? "Saving…" : editingId ? "Update" : "Create"}
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
