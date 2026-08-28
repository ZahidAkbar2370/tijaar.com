"use client";

import { useState, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Package,
  Plus,
  Download,
  Upload,
  Settings2,
  Filter,
  Eye,
  Pencil,
  Trash2,
  Layers,
  X,
  ChevronDown,
  Copy,
  CheckCircle,
  Zap,
  Sparkles,
  Search,
  AlertCircle,
} from "lucide-react";
import { sellerProductsApi, categoryApi, getBackendBaseUrl, promotionApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import PageHero from "@/components/customer/PageHero";
import { useSnackbar } from "@/context/SnackbarContext";
import { confirmDelete, confirmAction } from "@/lib/sweetAlert";
import * as XLSX from "xlsx";

// Inline placeholder when no image (avoids 404 on /placeholder-product.png)
const PLACEHOLDER_SVG =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='48' height='48' fill='%23d1d5db' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";

function getProductThumbnailUrl(p) {
  const firstMedia = p.media?.[0];
  let url =
    p.thumbnail_url ||
    firstMedia?.image_url ||
    (firstMedia?.path ? resolveMediaUrl(firstMedia.path) : null);
  if (!url) return PLACEHOLDER_SVG;
  if (!url.startsWith("http")) {
    const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
    url = `${base}${url.startsWith("/") ? "" : "/"}${url}`;
  }
  return url;
}

const ALL_COLUMNS = [
  { key: "thumb", label: "Thumbnail", db: "thumbnail", default: true },
  { key: "name", label: "Product Name", db: "name", default: true },
  { key: "sku", label: "SKU", db: "sku", default: true },
  { key: "brand", label: "Brand", db: "brand_id", default: false },
  { key: "price", label: "Price", db: "price", default: true },
  { key: "compare_price", label: "Compare Price", db: "compare_at_price", default: false },
  { key: "quantity", label: "Qty", db: "quantity", default: true },
  { key: "impressions", label: "Impressions", db: "impressions_count", default: true },
  { key: "clicks", label: "Clicks", db: "clicks_count", default: true },
  { key: "wishlist", label: "Wishlist", db: null, default: true },
  { key: "shares", label: "Shares", db: "shares_count", default: true },
  { key: "type", label: "Type", db: null, default: false },
  { key: "condition", label: "Condition", db: "condition", default: false },
  { key: "status", label: "Status", db: "status", default: true },
  { key: "promotions", label: "Promotions", db: null, default: true },
  { key: "created", label: "Created", db: "created_at", default: false },
  { key: "variants", label: "Variants", db: null, default: true },
  { key: "actions", label: "Actions", db: null, default: true },
];

export default function VendorProducts() {
  const router = useRouter();
  const { showSuccess, showError } = useSnackbar();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
  const [visibleCols, setVisibleCols] = useState(() =>
    ALL_COLUMNS.filter((c) => c.default).map((c) => c.key)
  );
  const [colSelectorOpen, setColSelectorOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [filters, setFilters] = useState({
    category_id: "",
    status: "",
    date_from: "",
    date_to: "",
    top_seller: false,
    is_featured: false,
    is_hot: false,
  });
  // Applied filters (used for API) – only update when user clicks Apply
  const [appliedFilters, setAppliedFilters] = useState({
    category_id: "",
    status: "",
    date_from: "",
    date_to: "",
    top_seller: false,
    is_featured: false,
    is_hot: false,
  });
  const [importFile, setImportFile] = useState(null);
  const [importRows, setImportRows] = useState([]);
  const [importHeaders, setImportHeaders] = useState([]);
  const [importMapping, setImportMapping] = useState({});
  const [importing, setImporting] = useState(false);
  const [newArrivalOpen, setNewArrivalOpen] = useState(false);
  const [drawerProducts, setDrawerProducts] = useState([]);
  const [drawerSearch, setDrawerSearch] = useState("");
  const [newArrivalSelectedIds, setNewArrivalSelectedIds] = useState([]);
  const [submittingNewArrival, setSubmittingNewArrival] = useState(false);
  const [eligibility, setEligibility] = useState({
    featured_eligible: false,
    hot_eligible: false,
    promote_url: "/seller/promote",
  });
  const [promoSavingId, setPromoSavingId] = useState(null);

  const loadProducts = useCallback(async (pageNum = 1) => {
    const params = { page: pageNum, per_page: 15 };
    if (appliedFilters.category_id) params.category_id = appliedFilters.category_id;
    if (appliedFilters.status) params.status = appliedFilters.status;
    if (appliedFilters.date_from) params.date_from = appliedFilters.date_from;
    if (appliedFilters.date_to) params.date_to = appliedFilters.date_to;
    if (appliedFilters.top_seller) params.top_seller = "1";
    if (appliedFilters.is_featured) params.is_featured = "1";
    if (appliedFilters.is_hot) params.is_hot = "1";
    try {
      const [res, eligRes] = await Promise.all([
        sellerProductsApi.list(params),
        promotionApi.eligibility().catch(() => ({ featured_eligible: false, hot_eligible: false })),
      ]);
      setProducts(res.products || []);
      setPagination(res.pagination || { current_page: 1, last_page: 1, per_page: 15, total: 0 });
      setEligibility({
        featured_eligible: !!eligRes.featured_eligible,
        hot_eligible: !!eligRes.hot_eligible,
        promote_url: eligRes.promote_url || "/seller/promote",
      });
    } catch {
      setProducts([]);
      setPagination({ current_page: 1, last_page: 1, per_page: 15, total: 0 });
    } finally {
      setLoading(false);
    }
  }, [appliedFilters]);

  const togglePromotion = async (product, field, nextValue) => {
    if (nextValue) {
      if (field === "is_featured" && !eligibility.featured_eligible) {
        showError?.("Purchase a Featured package first. Visit Promote.");
        return;
      }
      if (field === "is_hot" && !eligibility.hot_eligible) {
        showError?.("Purchase a Hot package first. Visit Promote.");
        return;
      }
    }
    setPromoSavingId(product.id);
    const prev = { is_featured: !!product.is_featured, is_hot: !!product.is_hot };
    setProducts((rows) => rows.map((r) => (r.id === product.id ? { ...r, [field]: nextValue } : r)));
    try {
      await sellerProductsApi.update(product.id, {
        is_featured: field === "is_featured" ? nextValue : prev.is_featured,
        is_hot: field === "is_hot" ? nextValue : prev.is_hot,
      });
      showSuccess?.(nextValue ? `${field === "is_featured" ? "Featured" : "Hot"} enabled` : "Promotion removed");
    } catch (err) {
      setProducts((rows) => rows.map((r) => (r.id === product.id ? { ...r, ...prev } : r)));
      showError?.(err?.data?.message || err?.message || "Could not update promotion");
    } finally {
      setPromoSavingId(null);
    }
  };

  const handleApplyFilters = () => {
    setAppliedFilters({ ...filters });
    setPage(1);
    setLoading(true);
  };

  const handleClearFilters = () => {
    const empty = {
      category_id: "",
      status: "",
      date_from: "",
      date_to: "",
      top_seller: false,
      is_featured: false,
      is_hot: false,
    };
    setFilters(empty);
    setAppliedFilters(empty);
    setPage(1);
    setLoading(true);
  };

  useEffect(() => {
    setLoading(true);
    loadProducts(page);
  }, [loadProducts, page]);

  useEffect(() => {
    categoryApi.list(true).then((r) => {
      const flat = [];
      (r.categories || []).forEach((c) => {
        flat.push(c);
        (c.children || []).forEach((ch) => {
          flat.push(ch);
          (ch.children || []).forEach((ch2) => flat.push(ch2));
        });
      });
      setCategories(flat);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (newArrivalOpen) {
      sellerProductsApi.list({ per_page: 200 }).then((r) => setDrawerProducts(r.products || [])).catch(() => setDrawerProducts([]));
    } else {
      setDrawerProducts([]);
      setDrawerSearch("");
      setNewArrivalSelectedIds([]);
    }
  }, [newArrivalOpen]);

  useEffect(() => {
    if (newArrivalOpen && typeof document !== "undefined") {
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
  }, [newArrivalOpen]);

  const filteredDrawerProducts = drawerProducts.filter(
    (p) => !drawerSearch.trim() || (p.name || "").toLowerCase().includes(drawerSearch.toLowerCase()) || (p.sku || "").toLowerCase().includes(drawerSearch.toLowerCase())
  );

  const toggleNewArrivalProduct = (id) => {
    setNewArrivalSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleSubmitNewArrival = async () => {
    if (!newArrivalSelectedIds.length) {
      showError?.("Select at least one product");
      return;
    }
    setSubmittingNewArrival(true);
    try {
      await sellerProductsApi.addNewArrivals({ product_ids: newArrivalSelectedIds });
      showSuccess?.("Products marked as New Arrival");
      setNewArrivalOpen(false);
      loadProducts(page);
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Failed to add New Arrival");
    } finally {
      setSubmittingNewArrival(false);
    }
  };

  const toggleCol = (key) => {
    setVisibleCols((p) =>
      p.includes(key) ? p.filter((k) => k !== key) : [...p, key]
    );
  };

  const handleExport = async () => {
    try {
      const params = {};
      if (appliedFilters.category_id) params.category_id = appliedFilters.category_id;
      if (appliedFilters.status) params.status = appliedFilters.status;
      if (appliedFilters.date_from) params.date_from = appliedFilters.date_from;
      if (appliedFilters.date_to) params.date_to = appliedFilters.date_to;
      const res = await sellerProductsApi.export(params);
      const rows = res.rows || [];
      const cols = res.columns || [];
      const ws = XLSX.utils.json_to_sheet(rows, { header: cols });
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Products");
      XLSX.writeFile(wb, "products-export.xlsx");
      showSuccess?.("Exported to Excel");
    } catch (e) {
      showError?.(e?.message || "Export failed");
    }
  };

  const handleImportFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = new Uint8Array(ev.target.result);
        const wb = XLSX.read(data, { type: "array" });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const headers = json[0] || [];
        const rows = json.slice(1).filter((r) => r.some((c) => c != null && String(c).trim()));
        setImportHeaders(headers);
        setImportRows(rows.map((r) => {
          const obj = {};
          headers.forEach((h, i) => {
            obj[String(h)] = r[i] != null ? String(r[i]).trim() : "";
          });
          return obj;
        }));
        const mapping = {};
        ["name", "sku", "category", "price", "quantity", "description", "short_description", "compare_at_price", "condition", "thumbnail_url", "image_urls", "variants"].forEach((db) => {
          const idx = headers.findIndex((h) =>
            String(h || "").toLowerCase().includes(db.replace("_", " ")) ||
            String(h || "").toLowerCase() === db
          );
          if (idx >= 0) mapping[db] = String(headers[idx]);
        });
        setImportMapping(mapping);
      } catch (err) {
        showError?.("Invalid Excel file");
        setImportRows([]);
        setImportHeaders([]);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleImportSubmit = async () => {
    if (!importRows.length) {
      showError?.("No data to import");
      return;
    }
    setImporting(true);
    try {
      const res = await sellerProductsApi.import(importRows, importMapping);
      showSuccess?.(res.message || "Import complete");
      setImportOpen(false);
      setImportFile(null);
      setImportRows([]);
      loadProducts();
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const handleDelete = async (id, name) => {
    const confirmed = await confirmDelete({
      title: "Hide product?",
      text: `"${name}" will be hidden from the shop. You can recover it anytime. Past orders keep product details.`,
      confirmButtonText: "Yes, hide",
    });
    if (!confirmed) return;
    try {
      await sellerProductsApi.delete(id);
      showSuccess?.("Product hidden. Recover it anytime from your product list.");
      loadProducts();
    } catch (e) {
      showError?.(e?.message || "Delete failed");
    }
  };

  const handleRestore = async (id, name) => {
    const confirmed = await confirmAction({
      title: "Recover product?",
      text: `"${name}" will be restored as a draft so you can publish again.`,
      confirmButtonText: "Yes, recover",
    });
    if (!confirmed) return;
    try {
      const res = await sellerProductsApi.restore(id);
      showSuccess?.(res?.message || "Product recovered as draft");
      loadProducts();
    } catch (e) {
      showError?.(e?.message || "Recover failed");
    }
  };

  const handleDuplicate = async (id, name) => {
    const confirmed = await confirmAction({
      title: "Duplicate product?",
      text: `A copy of "${name}" will be created as a draft.`,
      confirmButtonText: "Yes, duplicate",
    });
    if (!confirmed) return;
    try {
      const res = await sellerProductsApi.duplicate(id);
      showSuccess?.(res.message || "Product duplicated as draft");
      loadProducts();
    } catch (e) {
      showError?.(e?.message || "Duplicate failed");
    }
  };

  const handlePublish = async (id, name) => {
    const confirmed = await confirmAction({
      title: "Publish product?",
      text: `"${name}" will be visible to customers.`,
      confirmButtonText: "Yes, publish",
    });
    if (!confirmed) return;
    try {
      const res = await sellerProductsApi.publish(id);
      showSuccess?.(res.message || "Product published");
      loadProducts();
    } catch (e) {
      showError?.(e?.message || "Publish failed");
    }
  };

  const DB_FIELDS = ["name", "sku", "category", "price", "quantity", "description", "short_description", "compare_at_price", "condition", "thumbnail_url", "image_urls", "variants"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <PageHero
            title="My Products"
            description="Manage products, variations, export/import, and promotions. Use filters and column selector for a custom view."
            illustration="products"
            guide="Tip: Use filters and column selector above the table. Click a product to view, edit, duplicate, or add variations."
          />
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setFiltersOpen((p) => !p)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-[#1790d7]/30 flex items-center gap-2"
            >
              <Filter className="w-4 h-4 text-gray-500" />
              Filters
              <ChevronDown className={`w-4 h-4 transition ${filtersOpen ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={() => setColSelectorOpen((p) => !p)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 hover:border-[#1790d7]/30 flex items-center gap-2"
            >
              <Settings2 className="w-4 h-4 text-gray-500" />
              Columns
              <ChevronDown className={`w-4 h-4 transition ${colSelectorOpen ? "rotate-180" : ""}`} />
            </button>
            <button
              onClick={handleExport}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-gray-500" />
              Export
            </button>
            <button
              onClick={() => setImportOpen(true)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-gray-500" />
              Import
            </button>
            <Link
              href="/seller/flash-deals"
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 hover:border-[#1790d7]/40 hover:text-[#1790d7] flex items-center gap-2"
            >
              <Zap className="w-4 h-4" />
              Flash Deals
            </Link>
            <button
              onClick={() => setNewArrivalOpen(true)}
              className="px-3.5 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-800 hover:border-[#1790d7]/40 hover:text-[#1790d7] flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              New Arrival
            </button>
            <Link
              href="/seller/products/add"
              className="px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl text-sm font-semibold shadow-sm flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Product
            </Link>
          </div>
        </div>

        {/* Filters */}
        {filtersOpen && (
          <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Category</label>
              <select
                value={filters.category_id}
                onChange={(e) => setFilters((p) => ({ ...p, category_id: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters((p) => ({ ...p, status: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
              >
                <option value="">All</option>
                <option value="draft">Draft</option>
                <option value="pending">Pending</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">From Date</label>
              <input
                type="date"
                value={filters.date_from}
                onChange={(e) => setFilters((p) => ({ ...p, date_from: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">To Date</label>
              <input
                type="date"
                value={filters.date_to}
                onChange={(e) => setFilters((p) => ({ ...p, date_to: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.top_seller}
                onChange={(e) => setFilters((p) => ({ ...p, top_seller: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Top Seller</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_featured}
                onChange={(e) => setFilters((p) => ({ ...p, is_featured: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.is_hot}
                onChange={(e) => setFilters((p) => ({ ...p, is_hot: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm">Hot</span>
            </label>
            <button
              type="button"
              onClick={handleApplyFilters}
              className="px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-medium"
            >
              Apply
            </button>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2.5 border border-gray-200 hover:bg-gray-100 rounded-xl text-sm font-medium"
            >
              Clear
            </button>
          </div>
        )}

        {/* Column selector */}
        {colSelectorOpen && (
          <div className="bg-gray-50 rounded-xl p-4 flex flex-wrap gap-2">
            {ALL_COLUMNS.filter((c) => c.key !== "actions").map((c) => (
              <label key={c.key} className="flex items-center gap-2 px-3 py-1.5 bg-white rounded-lg border border-gray-200 cursor-pointer text-sm">
                <input
                  type="checkbox"
                  checked={visibleCols.includes(c.key)}
                  onChange={() => toggleCol(c.key)}
                  className="rounded"
                />
                {c.label}
              </label>
            ))}
          </div>
        )}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl p-12 border border-gray-100 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mx-auto" />
            <div className="h-32 bg-gray-100 rounded" />
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm">
          {products.length === 0 ? (
            <div className="flex flex-col lg:flex-row items-center gap-6 p-12 text-center lg:text-left">
              <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-[#1790d7]/10 flex items-center justify-center">
                <Package className="w-16 h-16 text-[#1790d7]" />
              </div>
              <div>
                <h2 className="font-semibold text-gray-900">No products yet</h2>
                <p className="text-sm text-gray-600 mt-1">Add your first product or import from Excel.</p>
                <div className="flex gap-2 mt-4">
                  <Link href="/seller/products/add" className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#1790d7] hover:bg-[#1277b8] text-white rounded-xl text-sm font-semibold shadow-sm">
                    Add Product
                  </Link>
                  <button onClick={() => setImportOpen(true)} className="inline-flex items-center gap-2 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50">
                    Import from Excel
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    {visibleCols.includes("thumb") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-16">Thumb</th>
                    )}
                    {visibleCols.includes("name") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Product</th>
                    )}
                    {visibleCols.includes("sku") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">SKU</th>
                    )}
                    {visibleCols.includes("brand") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Brand</th>
                    )}
                    {visibleCols.includes("price") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Price</th>
                    )}
                    {visibleCols.includes("compare_price") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Compare</th>
                    )}
                    {visibleCols.includes("quantity") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Qty</th>
                    )}
                    {visibleCols.includes("impressions") && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase" title="Times shown in browse/search">Impr.</th>
                    )}
                    {visibleCols.includes("clicks") && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase" title="Product page opens">Clicks</th>
                    )}
                    {visibleCols.includes("wishlist") && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase" title="Wishlist adds">Wish</th>
                    )}
                    {visibleCols.includes("shares") && (
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-500 uppercase" title="Shares">Shares</th>
                    )}
                    {visibleCols.includes("type") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Type</th>
                    )}
                    {visibleCols.includes("condition") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Condition</th>
                    )}
                    {visibleCols.includes("status") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    )}
                    {visibleCols.includes("promotions") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase min-w-[130px]">
                        <span className="inline-flex items-center gap-1">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Promo
                        </span>
                      </th>
                    )}
                    {visibleCols.includes("created") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Created</th>
                    )}
                    {visibleCols.includes("variants") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Variants</th>
                    )}
                    {visibleCols.includes("actions") && (
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-48">Actions</th>
                    )}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      {visibleCols.includes("thumb") && (
                        <td className="px-4 py-3">
                          <img
                            src={getProductThumbnailUrl(p)}
                            alt=""
                            className="w-12 h-12 rounded-lg object-cover border border-gray-100"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = PLACEHOLDER_SVG;
                            }}
                          />
                        </td>
                      )}
                      {visibleCols.includes("name") && (
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-900">{p.name}</p>
                          {p.category?.name && (
                            <p className="text-sm text-gray-500 italic mt-0.5">{p.category.name}</p>
                          )}
                        </td>
                      )}
                      {visibleCols.includes("sku") && (
                        <td className="px-4 py-3 text-sm text-gray-500">{p.sku || "—"}</td>
                      )}
                      {visibleCols.includes("brand") && (
                        <td className="px-4 py-3 text-sm text-gray-600">{p.brand?.name ?? "—"}</td>
                      )}
                      {visibleCols.includes("price") && (
                        <td className="px-4 py-3 text-sm font-medium">{parseFloat(p.price || 0).toLocaleString()}</td>
                      )}
                      {visibleCols.includes("compare_price") && (
                        <td className="px-4 py-3 text-sm text-gray-500">{p.compare_at_price ? parseFloat(p.compare_at_price).toLocaleString() : "—"}</td>
                      )}
                      {visibleCols.includes("quantity") && (
                        <td className="px-4 py-3 text-sm">{p.quantity ?? 0}</td>
                      )}
                      {visibleCols.includes("impressions") && (
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(p.impressions_count ?? 0).toLocaleString()}
                        </td>
                      )}
                      {visibleCols.includes("clicks") && (
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(p.clicks_count ?? 0).toLocaleString()}
                        </td>
                      )}
                      {visibleCols.includes("wishlist") && (
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(p.wishlist_count ?? p.wishlists_count ?? 0).toLocaleString()}
                        </td>
                      )}
                      {visibleCols.includes("shares") && (
                        <td className="px-4 py-3 text-sm text-right tabular-nums text-gray-700">
                          {Number(p.shares_count ?? 0).toLocaleString()}
                        </td>
                      )}
                      {visibleCols.includes("type") && (
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {p.flash_deal_discount_value != null && Number(p.flash_deal_discount_value) > 0 && (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-[#1790d7]/10 text-[#1790d7]">Flash Deal</span>
                            )}
                            {p.is_new_arrival && (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-violet-100 text-violet-700">New Arrival</span>
                            )}
                            {p.is_featured && (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-700">Featured</span>
                            )}
                            {p.is_hot && (
                              <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-rose-100 text-rose-700">Hot</span>
                            )}
                            {(!p.flash_deal_discount_value || Number(p.flash_deal_discount_value) <= 0) && !p.is_new_arrival && !p.is_featured && !p.is_hot && (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleCols.includes("condition") && (
                        <td className="px-4 py-3 text-sm capitalize">{p.condition ?? "—"}</td>
                      )}
                      {visibleCols.includes("status") && (
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              p.status === "published" ? "bg-emerald-100 text-emerald-700" :
                              p.status === "pending" ? "bg-amber-100 text-amber-700" :
                              "bg-gray-100 text-gray-600"
                            }`}
                          >
                            {p.status}
                          </span>
                        </td>
                      )}
                      {visibleCols.includes("promotions") && (
                        <td className="px-4 py-3">
                          <div className="flex flex-col gap-1.5">
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!p.is_featured}
                                disabled={promoSavingId === p.id || (!eligibility.featured_eligible && !p.is_featured)}
                                onChange={(e) => togglePromotion(p, "is_featured", e.target.checked)}
                                className="rounded"
                              />
                              Featured
                              {!eligibility.featured_eligible && !p.is_featured && (
                                <AlertCircle className="w-3 h-3 text-amber-500" />
                              )}
                            </label>
                            <label className="inline-flex items-center gap-1.5 text-xs text-gray-700">
                              <input
                                type="checkbox"
                                checked={!!p.is_hot}
                                disabled={promoSavingId === p.id || (!eligibility.hot_eligible && !p.is_hot)}
                                onChange={(e) => togglePromotion(p, "is_hot", e.target.checked)}
                                className="rounded"
                              />
                              Hot
                              {!eligibility.hot_eligible && !p.is_hot && (
                                <AlertCircle className="w-3 h-3 text-amber-500" />
                              )}
                            </label>
                            {(!eligibility.featured_eligible || !eligibility.hot_eligible) && (
                              <Link href={eligibility.promote_url || "/seller/promote"} className="text-[10px] font-medium text-[#1790d7] hover:underline">
                                Get package
                              </Link>
                            )}
                          </div>
                        </td>
                      )}
                      {visibleCols.includes("created") && (
                        <td className="px-4 py-3 text-sm text-gray-500">
                          {p.created_at ? new Date(p.created_at).toLocaleDateString() : "—"}
                        </td>
                      )}
                      {visibleCols.includes("variants") && (
                        <td className="px-4 py-3">
                          {(p.product_type === "variable" || (p.variants && p.variants.length > 0)) ? (
                            <Link
                              href={`/seller/products/${p.id}/variants`}
                              className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100"
                            >
                              <Layers className="w-3.5 h-3.5" />
                              Variations
                            </Link>
                          ) : (
                            <span className="text-xs text-gray-400">—</span>
                          )}
                        </td>
                      )}
                      {visibleCols.includes("actions") && (
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {p.is_removed || p.deleted_at ? (
                              <button
                                onClick={() => handleRestore(p.id, p.name)}
                                className="px-2.5 py-1.5 text-xs font-medium text-[#1790d7] border border-[#1790d7]/30 rounded-lg hover:bg-[#1790d7]/5"
                                title="Recover"
                              >
                                Recover
                              </button>
                            ) : (
                              <>
                            <Link
                              href={`/seller/products/${p.id}`}
                              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                              title="View"
                            >
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link
                              href={`/seller/products/${p.id}/edit`}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                              title="Edit"
                            >
                              <Pencil className="w-4 h-4" />
                            </Link>
                            <button
                              onClick={() => handleDuplicate(p.id, p.name)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg"
                              title="Duplicate"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                            {(p.status === "draft" || p.status === "pending") && (
                              <button
                                onClick={() => handlePublish(p.id, p.name)}
                                className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Publish"
                              >
                                <CheckCircle className="w-4 h-4" />
                              </button>
                            )}
                            <button
                              onClick={() => handleDelete(p.id, p.name)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                              title="Hide from shop"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                              </>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && pagination.last_page > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-100 mt-4">
              <p className="text-sm text-gray-600">
                Showing {(pagination.current_page - 1) * pagination.per_page + 1}–{Math.min(pagination.current_page * pagination.per_page, pagination.total)} of {pagination.total} products
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={pagination.current_page <= 1}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <span className="px-3 py-2 text-sm text-gray-600">
                  Page {pagination.current_page} of {pagination.last_page}
                </span>
                <button
                  onClick={() => setPage((p) => Math.min(pagination.last_page, p + 1))}
                  disabled={pagination.current_page >= pagination.last_page}
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Import modal */}
      {importOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="font-semibold text-lg">Import Products from Excel</h2>
              <button onClick={() => { setImportOpen(false); setImportFile(null); setImportRows([]); }} className="p-2 hover:bg-gray-100 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload file (drag or click)</label>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-[#1790d7] hover:bg-[#1790d7]/5">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">{importFile ? importFile.name : "Drop Excel file or click to browse"}</span>
                  <input type="file" accept=".xlsx,.xls,.csv" className="hidden" onChange={handleImportFile} />
                </label>
              </div>
              {importRows.length > 0 && (
                <>
                  <p className="text-sm text-gray-600">{importRows.length} row(s) found. Map columns:</p>
                  <div className="space-y-2 max-h-48 overflow-auto">
                    {DB_FIELDS.map((db) => (
                      <div key={db} className="flex items-center gap-2">
                        <span className="text-sm font-medium w-36">{db}</span>
                        <select
                          value={importMapping[db] || ""}
                          onChange={(e) => setImportMapping((p) => ({ ...p, [db]: e.target.value }))}
                          className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        >
                          <option value="">— Skip —</option>
                          {importHeaders.map((h) => (
                            <option key={h} value={String(h)}>{String(h)}</option>
                          ))}
                        </select>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-amber-600">Name and at least one of Category/Price are required.</p>
                </>
              )}
            </div>
            <div className="p-4 border-t flex justify-end gap-2">
              <button
                onClick={() => { setImportOpen(false); setImportFile(null); setImportRows([]); }}
                className="px-4 py-2 border border-gray-200 rounded-xl font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleImportSubmit}
                disabled={importRows.length === 0 || importing}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-medium disabled:opacity-50"
              >
                {importing ? "Importing..." : "Import"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Arrival – modal form (same layout as Flash Deals form) */}
      {newArrivalOpen && typeof document !== "undefined" && createPortal(
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-4 pb-4 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" aria-hidden onClick={() => setNewArrivalOpen(false)} />
          <div
            className="relative flex flex-col bg-white rounded-2xl w-full max-w-lg h-[calc(100vh-2rem)] shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
              <div>
                <h2 className="font-semibold text-lg text-gray-900">Add New Arrival</h2>
                <p className="text-xs text-gray-500 mt-0.5">Select products to feature as new arrivals on the storefront.</p>
              </div>
              <button type="button" onClick={() => setNewArrivalOpen(false)} className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors" aria-label="Close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex flex-col flex-1 min-h-0">
              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-6 py-5 space-y-6 overscroll-contain">
                <section className="space-y-4">
                  <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Products</h4>
                  <div>
                    <div className="relative mb-2">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search products..."
                        value={drawerSearch}
                        onChange={(e) => setDrawerSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      />
                    </div>
                    <div className="max-h-40 overflow-y-auto rounded-xl border border-gray-200 divide-y divide-gray-100">
                      {filteredDrawerProducts.length === 0 ? (
                        <p className="p-4 text-sm text-gray-500 text-center">No products</p>
                      ) : (
                        filteredDrawerProducts.map((p) => (
                          <label key={p.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={newArrivalSelectedIds.includes(p.id)}
                              onChange={() => toggleNewArrivalProduct(p.id)}
                              className="rounded border-gray-300 text-violet-600 focus:ring-violet-500"
                            />
                            <span className="font-medium text-gray-900 truncate flex-1">{p.name}</span>
                            <span className="text-xs text-gray-500">{parseFloat(p.price || 0).toLocaleString()}</span>
                          </label>
                        ))
                      )}
                    </div>
                    {newArrivalSelectedIds.length > 0 && (
                      <p className="mt-2 text-xs text-violet-600 font-medium">{newArrivalSelectedIds.length} product(s) selected</p>
                    )}
                  </div>
                </section>
              </div>
              <div className="flex-shrink-0 flex gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50/90">
                <button
                  type="button"
                  onClick={() => setNewArrivalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl border border-gray-200 font-medium text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitNewArrival}
                  disabled={!newArrivalSelectedIds.length || submittingNewArrival}
                  className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 text-white font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submittingNewArrival ? "Adding…" : "Add to New Arrival"}
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
