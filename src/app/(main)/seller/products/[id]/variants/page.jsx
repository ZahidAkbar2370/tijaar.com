"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { sellerProductsApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { confirmDelete } from "@/lib/sweetAlert";
import { Layers, Plus, Pencil, Trash2, ArrowLeft, X, ImagePlus, Grid3X3 } from "lucide-react";
import PageHero from "@/components/customer/PageHero";

const emptyAttr = () => ({ key: "", value: "" });

const PRESET_COLORS = [
  { name: "Red", hex: "#ef4444" },
  { name: "Blue", hex: "#3b82f6" },
  { name: "Green", hex: "#22c55e" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Black", hex: "#171717" },
  { name: "White", hex: "#fafafa" },
  { name: "Gray", hex: "#6b7280" },
  { name: "Pink", hex: "#ec4899" },
  { name: "Purple", hex: "#a855f7" },
  { name: "Orange", hex: "#f97316" },
  { name: "Navy", hex: "#1e3a8a" },
  { name: "Brown", hex: "#78350f" },
];

const COMMON_SIZES = ["XS", "S", "M", "L", "XL", "XXL", "2XL", "3XL"];

function hexToName(hex) {
  const h = (hex || "").toLowerCase();
  const found = PRESET_COLORS.find((c) => c.hex.toLowerCase() === h);
  return found ? found.name : (hex || "");
}

export default function ProductVariantsPage() {
  const params = useParams();
  const productId = params.id;
  const { showSuccess, showError } = useSnackbar();
  const [product, setProduct] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [addMode, setAddMode] = useState("single");
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    attributePairs: [emptyAttr()],
    colorHex: "",
    colorName: "",
    sizeValue: "",
    price: "",
    compare_at_price: "",
    quantity: "0",
    image: null,
    images: [],
    existingImageUrls: [],
  });
  const [bulkForm, setBulkForm] = useState({
    colorHex: "#ef4444",
    colorName: "Red",
    sizesText: "S, M, L, XL",
    price: "",
    quantityPerVariant: "0",
  });

  const load = () => {
    Promise.all([
      sellerProductsApi.get(productId),
      sellerProductsApi.variants.list(productId),
    ])
      .then(([prodRes, varRes]) => {
        setProduct(prodRes.product);
        setVariants(varRes.variants || []);
      })
      .catch(() => {
        setProduct(null);
        setVariants([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (productId) load();
  }, [productId]);

  // Lock body scroll when modal is open; only the modal content scrolls. Prevent scroll jump.
  useEffect(() => {
    if (modalOpen && typeof document !== "undefined") {
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
  }, [modalOpen]);

  const openAdd = (mode = "single") => {
    setAddMode(mode);
    setForm({
      name: "",
      sku: "",
      attributePairs: [emptyAttr()],
      colorHex: "",
      colorName: "",
      sizeValue: "",
      price: "",
      compare_at_price: "",
      quantity: "0",
      image: null,
      images: [],
      existingImageUrls: [],
    });
    setBulkForm({
      colorHex: "#ef4444",
      colorName: "Red",
      sizesText: "S, M, L, XL",
      price: "",
      quantityPerVariant: "0",
    });
    setEditingId(null);
    setModalOpen(true);
  };

  const openEdit = (v) => {
    let raw = v.attributes;
    if (typeof raw === "string") {
      try {
        raw = JSON.parse(raw);
      } catch {
        raw = null;
      }
    }
    let attrs = {};
    if (raw && typeof raw === "object" && !Array.isArray(raw)) {
      attrs = raw;
    }
    // Normalize keys (trim + lowercase) so Color/color/ color  and Size/size/ size  from API all work
    const attrsLower = {};
    Object.entries(attrs).forEach(([k, val]) => {
      const normKey = String(k).trim().toLowerCase();
      attrsLower[normKey] = val;
    });
    let colorVal = attrsLower.color ?? "";
    let sizeVal = attrsLower.size ?? "";
    if (!colorVal && v.name && typeof v.name === "string") colorVal = v.name.trim();
    const otherPairs = Object.entries(attrs)
      .filter(([k]) => {
        const normKey = String(k).trim().toLowerCase();
        return normKey !== "color" && normKey !== "size";
      })
      .map(([key, value]) => ({ key, value: String(value) }));
    const pairs = otherPairs.length ? otherPairs : [emptyAttr()];

    const existingUrls = Array.isArray(v.image_urls) ? v.image_urls : (v.image_url ? [v.image_url] : []);

    setForm({
      name: v.name || "",
      sku: v.sku || "",
      attributePairs: pairs,
      colorHex: typeof colorVal === "string" && colorVal.startsWith("#") ? colorVal : (PRESET_COLORS.find((c) => c.name === colorVal)?.hex || "#6b7280"),
      colorName: typeof colorVal === "string" && !colorVal.startsWith("#") ? colorVal : hexToName(colorVal),
      sizeValue: sizeVal,
      price: v.price ?? "",
      compare_at_price: v.compare_at_price ?? "",
      quantity: String(v.quantity ?? 0),
      image: null,
      images: [],
      existingImageUrls: existingUrls,
    });
    setEditingId(v.id);
    setAddMode("single");
    setModalOpen(true);
  };

  const setAttributePair = (idx, field, value) => {
    setForm((p) => ({
      ...p,
      attributePairs: p.attributePairs.map((pair, i) =>
        i === idx ? { ...pair, [field]: value } : pair
      ),
    }));
  };

  const addAttributePair = () => {
    setForm((p) => ({ ...p, attributePairs: [...p.attributePairs, emptyAttr()] }));
  };

  const removeAttributePair = (idx) => {
    setForm((p) => ({
      ...p,
      attributePairs: p.attributePairs.filter((_, i) => i !== idx).length ? p.attributePairs.filter((_, i) => i !== idx) : [emptyAttr()],
    }));
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
  };

  const buildAttributesFromForm = () => {
    const attributes = {};
    const colorKey = "color";
    const sizeKey = "size";
    if (form.colorName?.trim()) {
      attributes[colorKey] = form.colorName.trim();
    } else if (form.colorHex?.trim()) {
      attributes[colorKey] = form.colorHex.trim();
    }
    if (form.sizeValue?.trim()) {
      attributes[sizeKey] = form.sizeValue.trim();
    }
    return attributes;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(form.price);
    const qty = parseInt(form.quantity, 10);
    if (isNaN(price) || price < 0) {
      showError?.("Valid price required");
      return;
    }
    if (isNaN(qty) || qty < 0) {
      showError?.("Valid quantity required");
      return;
    }
    const attributes = buildAttributesFromForm();
    const payload = {
      name: form.name || null,
      sku: form.sku || null,
      attributes: Object.keys(attributes).length ? attributes : null,
      price,
      compare_at_price: form.compare_at_price ? parseFloat(form.compare_at_price) : null,
      quantity: qty,
    };
    if (form.image) payload.image = form.image;
    if (form.images?.length) payload.images = form.images;
    try {
      if (editingId) {
        await sellerProductsApi.variants.update(productId, editingId, payload);
        showSuccess?.("Variant updated");
      } else {
        await sellerProductsApi.variants.create(productId, payload);
        showSuccess?.("Variant added");
      }
      closeModal();
      load();
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Failed");
    }
  };

  const handleBulkSubmit = async (e) => {
    e.preventDefault();
    const price = parseFloat(bulkForm.price);
    const qtyPer = parseInt(bulkForm.quantityPerVariant, 10);
    if (isNaN(price) || price < 0) {
      showError?.("Valid price required");
      return;
    }
    if (isNaN(qtyPer) || qtyPer < 0) {
      showError?.("Valid quantity per size required");
      return;
    }
    const sizes = bulkForm.sizesText
      .split(/[\s,;]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!sizes.length) {
      showError?.("Enter at least one size (e.g. S, M, L, XL)");
      return;
    }
    const colorName = bulkForm.colorName?.trim() || hexToName(bulkForm.colorHex) || bulkForm.colorHex || "Color";
    const variantsToCreate = sizes.map((size) => ({
      attributes: { color: colorName, size },
      price,
      quantity: qtyPer,
    }));
    try {
      await sellerProductsApi.variants.createBulk(productId, variantsToCreate);
      showSuccess?.(`${variantsToCreate.length} variant(s) added`);
      closeModal();
      load();
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Bulk add failed");
    }
  };

  const handleDelete = async (variantId) => {
    const confirmed = await confirmDelete({
      title: "Delete variant?",
      text: "This variant will be removed. This cannot be undone.",
      confirmButtonText: "Yes, delete",
    });
    if (!confirmed) return;
    try {
      await sellerProductsApi.variants.delete(productId, variantId);
      showSuccess?.("Variant deleted");
      load();
    } catch (e) {
      showError?.(e?.message || "Delete failed");
    }
  };

  const removeNewImage = (idx) => {
    setForm((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }));
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Product not found.</p>
          <Link href="/seller/products" className="text-[#1790d7] hover:underline mt-2 inline-block">
            ← Back to Products
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const isVariable = product.product_type === "variable" || (product.variants && product.variants.length > 0);
  if (!isVariable) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="max-w-2xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-600">This product is a simple product. Variants are only for products with options (e.g. size, color).</p>
          <Link href={`/seller/products/${productId}`} className="text-[#1790d7] hover:underline mt-4 inline-block">← Back to Product</Link>
          <Link href="/seller/products" className="block text-gray-500 hover:underline mt-2">Back to Products</Link>
        </div>
      </ProtectedRoute>
    );
  }

  const isBulk = modalOpen && !editingId && addMode === "bulk";

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
        <div>
          <Link href={`/seller/products/${productId}`} className="text-amber-600 text-sm hover:underline mb-4 inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Product
          </Link>
          <PageHero
            title={`Variations: ${product.name}`}
            description="Add one variant per option (e.g. Red shirt, Black shirt) so customers can choose and buy any option. Each variant has its own price, stock, and optional images."
            illustration="products"
          />
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <strong>Important:</strong> For variable products, customers can only buy by selecting an option. Add a variant for every option you sell—e.g. &quot;Color: Red&quot; (with price and stock for red), then &quot;Color: Black&quot;. Your main product image is used as the default; set per-variant images when adding/editing variants.
        </div>

        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="p-4 border-b flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold">Variants ({variants.length})</h3>
            <div className="flex gap-2">
              <button
                onClick={() => openAdd("bulk")}
                className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-emerald-700"
              >
                <Grid3X3 className="w-4 h-4" /> Add multiple (Color + Sizes)
              </button>
              <button
                onClick={() => openAdd("single")}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium flex items-center gap-2 hover:bg-indigo-700"
              >
                <Plus className="w-4 h-4" /> Add single variant
              </button>
            </div>
          </div>

          {variants.length === 0 ? (
            <div className="p-12 text-center">
              <Layers className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No variants yet. Add size, color, or other options.</p>
              <div className="mt-4 flex flex-wrap justify-center gap-2">
                <button onClick={() => openAdd("bulk")} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium">
                  Add multiple (Color + Sizes)
                </button>
                <button onClick={() => openAdd("single")} className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium">
                  Add single variant
                </button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Image</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Name / Attributes</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">SKU</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Price</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Compare</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500">Qty</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 w-24">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {variants.map((v) => (
                    <tr key={v.id} className="hover:bg-gray-50/50">
                      <td className="px-4 py-3">
                        {(v.image_urls && v.image_urls[0]) || v.image_url ? (
                          <img src={(v.image_urls && v.image_urls[0]) || v.image_url} alt="" className="w-12 h-12 object-cover rounded-lg border border-gray-200" />
                        ) : (
                          <button type="button" onClick={() => openEdit(v)} className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">
                            <ImagePlus className="w-3.5 h-3.5" />
                            Add image
                          </button>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {(() => {
                          const attrs = v.attributes;
                          const isObj = attrs && typeof attrs === "object" && !Array.isArray(attrs) && Object.keys(attrs).length > 0;
                          const parts = isObj
                            ? Object.entries(attrs).map(([k, val]) => `${String(k).charAt(0).toUpperCase() + String(k).slice(1)}: ${val}`)
                            : [];
                          if (parts.length) return parts.join(", ");
                          if (v.name) return `Color: ${v.name}`;
                          return "—";
                        })()}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">{v.sku || "—"}</td>
                      <td className="px-4 py-3 font-medium">{parseFloat(v.price || 0).toLocaleString()}</td>
                      <td className="px-4 py-3 text-sm text-gray-500">{v.compare_at_price ? parseFloat(v.compare_at_price).toLocaleString() : "—"}</td>
                      <td className="px-4 py-3 text-sm">{v.quantity ?? 0}</td>
                      <td className="px-4 py-3">
                        <div className="flex gap-1">
                          <button onClick={() => openEdit(v)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="Edit">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDelete(v.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modals: rendered in portal above site header (z-[100]), fixed to viewport so scroll doesn't affect position */}
        {modalOpen && typeof document !== "undefined" && createPortal(
          <>
        {isBulk && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 pb-4 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden onClick={closeModal} />
            <div className="relative flex flex-col bg-white rounded-2xl w-full max-w-md h-[calc(100vh-2rem)] shadow-2xl overflow-hidden">
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                <h3 className="font-semibold text-lg text-gray-900">Add multiple variants</h3>
                <button type="button" onClick={closeModal} className="p-2 rounded-xl text-gray-500 hover:bg-white hover:text-gray-700 transition-colors" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleBulkSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-5 overscroll-contain">
                  <p className="text-sm text-gray-500">One color, all sizes (e.g. Red in S, M, L, XL).</p>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={bulkForm.colorHex}
                          onChange={(e) => setBulkForm((p) => ({ ...p, colorHex: e.target.value }))}
                          className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer shadow-inner"
                        />
                        <input
                          type="text"
                          value={bulkForm.colorName}
                          onChange={(e) => setBulkForm((p) => ({ ...p, colorName: e.target.value }))}
                          placeholder="Color name (e.g. Red)"
                          className="flex-1 min-w-[100px] px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-shadow"
                        />
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setBulkForm((p) => ({ ...p, colorHex: c.hex, colorName: c.name }))}
                            className="w-7 h-7 rounded-full border-2 border-gray-200 hover:border-emerald-500 hover:scale-110 transition-all"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Sizes (comma-separated)</label>
                    <input
                      type="text"
                      value={bulkForm.sizesText}
                      onChange={(e) => setBulkForm((p) => ({ ...p, sizesText: e.target.value }))}
                      placeholder="S, M, L, XL"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-xs text-gray-500 mt-1.5">Quick: {COMMON_SIZES.join(", ")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        value={bulkForm.price}
                        onChange={(e) => setBulkForm((p) => ({ ...p, price: e.target.value }))}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Quantity per size *</label>
                      <input
                        type="number"
                        value={bulkForm.quantityPerVariant}
                        onChange={(e) => setBulkForm((p) => ({ ...p, quantityPerVariant: e.target.value }))}
                        min="0"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/90">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition-colors shadow-sm">
                    Add all variants
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {!isBulk && (
          <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 pb-4 px-4 overflow-hidden">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden onClick={closeModal} />
            <div className="relative flex flex-col bg-white rounded-2xl w-full max-w-lg h-[calc(100vh-2rem)] shadow-2xl overflow-hidden">
              <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                <div>
                  <h3 className="font-semibold text-lg text-gray-900">{editingId ? "Edit Variant" : "Add Variant"}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">Set options, price, stock and images for this variant.</p>
                </div>
                <button type="button" onClick={closeModal} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Close">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
                <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-6 overscroll-contain">
                  <section className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Options</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Color</label>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="color"
                        value={form.colorHex || "#6b7280"}
                        onChange={(e) => setForm((p) => ({ ...p, colorHex: e.target.value }))}
                        className="w-10 h-10 rounded-xl border-2 border-gray-200 cursor-pointer shadow-inner"
                      />
                      <input
                        type="text"
                        value={form.colorName}
                        onChange={(e) => setForm((p) => ({ ...p, colorName: e.target.value }))}
                        placeholder="e.g. Red"
                        className="flex-1 min-w-[80px] px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                      <div className="flex flex-wrap gap-1.5">
                        {PRESET_COLORS.slice(0, 8).map((c) => (
                          <button
                            key={c.hex}
                            type="button"
                            onClick={() => setForm((p) => ({ ...p, colorHex: c.hex, colorName: c.name }))}
                            className="w-7 h-7 rounded-full border-2 border-gray-200 hover:border-indigo-500 hover:scale-110 transition-all"
                            style={{ backgroundColor: c.hex }}
                            title={c.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Size</label>
                    <input
                      type="text"
                      value={form.sizeValue}
                      onChange={(e) => setForm((p) => ({ ...p, sizeValue: e.target.value }))}
                      placeholder="e.g. M, L, XL"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Media</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Variant images</label>
                    <p className="text-xs text-gray-500 mb-2">Upload one or more images for this variant.</p>
                    <div className="flex flex-wrap gap-2 mb-2">
                      {form.existingImageUrls.map((url, idx) => (
                        <div key={`ex-${idx}`} className="relative">
                          <img src={url} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                          <span className="text-xs text-gray-500 block mt-0.5">Current</span>
                        </div>
                      ))}
                      {form.images.map((file, idx) => (
                        <div key={`new-${idx}`} className="relative">
                          <img src={URL.createObjectURL(file)} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-200" />
                          <button
                            type="button"
                            onClick={() => removeNewImage(idx)}
                            className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                    <label className="inline-flex items-center gap-2 px-4 py-2.5 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 text-sm text-gray-600 transition-colors">
                      <ImagePlus className="w-5 h-5" />
                      {form.existingImageUrls.length || form.images.length ? "Add more images" : "Add image(s)"}
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setForm((p) => ({ ...p, images: [...p.images, ...files] }));
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Details</h4>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Name (optional)</label>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                      placeholder="e.g. Red / Large"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">SKU</label>
                    <input
                      type="text"
                      value={form.sku}
                      onChange={(e) => setForm((p) => ({ ...p, sku: e.target.value }))}
                      placeholder="Optional"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  </section>
                  <section className="space-y-4">
                    <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Pricing & stock</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price *</label>
                      <input
                        type="number"
                        value={form.price}
                        onChange={(e) => setForm((p) => ({ ...p, price: e.target.value }))}
                        step="0.01"
                        min="0"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Compare at Price</label>
                      <input
                        type="number"
                        value={form.compare_at_price}
                        onChange={(e) => setForm((p) => ({ ...p, compare_at_price: e.target.value }))}
                        step="0.01"
                        min="0"
                        placeholder="Optional"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Quantity *</label>
                    <input
                      type="number"
                      value={form.quantity}
                      onChange={(e) => setForm((p) => ({ ...p, quantity: e.target.value }))}
                      min="0"
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                    />
                  </div>
                  </section>
                </div>
                <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/90">
                  <button type="button" onClick={closeModal} className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-100 transition-colors">
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 transition-colors shadow-sm">
                    {editingId ? "Save" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
          </>,
          document.body
        )}
      </div>
    </ProtectedRoute>
  );
}
