"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  Package,
  AlertTriangle,
  History,
  Loader2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { inventoryApi, sellerProductsApi } from "@/lib/api";
import PageHero from "@/components/customer/PageHero";
import { useSnackbar } from "@/context/SnackbarContext";

export default function VendorInventoryPage() {
  const [lowStock, setLowStock] = useState([]);
  const [outOfStock, setOutOfStock] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingThresholdId, setEditingThresholdId] = useState(null);
  const [editThreshold, setEditThreshold] = useState("");
  const [historyProductId, setHistoryProductId] = useState(null);
  const [history, setHistory] = useState([]);
  const { showSuccess, showError } = useSnackbar();

  const loadData = async () => {
    setLoading(true);
    try {
      const [lowRes, outRes, productsRes] = await Promise.all([
        inventoryApi.lowStock().catch(() => ({ products: [] })),
        inventoryApi.outOfStock().catch(() => ({ products: [] })),
        sellerProductsApi.list().catch(() => ({ products: [] })),
      ]);
      setLowStock(lowRes.products || []);
      setOutOfStock(outRes.products || []);
      setProducts(productsRes.products || []);
    } catch {
      setLowStock([]);
      setOutOfStock([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (!historyProductId) {
      setHistory([]);
      return;
    }
    inventoryApi
      .stockHistory(historyProductId)
      .then((r) => setHistory(r.history || []))
      .catch(() => setHistory([]));
  }, [historyProductId]);

  const handleSaveThreshold = async (productId) => {
    const val = editThreshold === "" || editThreshold === null ? null : parseInt(editThreshold, 10);
    if (val !== null && (isNaN(val) || val < 0)) {
      showError("Enter a valid threshold (0 or more, or leave empty to disable alert)");
      return;
    }
    try {
      await inventoryApi.updateLowStockThreshold(productId, { low_stock_threshold: val ?? null });
      showSuccess("Low stock alert updated");
      setEditingThresholdId(null);
      setEditThreshold("");
      loadData();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to update");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href="/seller/dashboard" className="text-amber-600 text-sm hover:underline mb-4 inline-block">
          ← Back to Dashboard
        </Link>
        <PageHero
          title="Inventory Management"
          description="Manage stock levels for your products. Out-of-stock items are hidden from the shop until you add stock. Alerts clear automatically when restocked."
          illustration="inventory"
          guide="Tip: Set a Low Stock Alert threshold per product—when stock falls at or below that number, you'll get notified. Out-of-stock products disappear from the public shop until quantity is increased."
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 text-[#1790d7] animate-spin" />
        </div>
      ) : (
        <>
          {outOfStock.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-red-800 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Out of Stock ({outOfStock.length}) — hidden from shop
              </h2>
              <div className="space-y-3">
                {outOfStock.slice(0, 8).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white rounded-xl p-4 border border-red-100"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={p.image || p.media?.[0]?.url || "/assets/sample-image.webp"}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-sm text-red-600">0 in stock — add quantity to show on the website again</p>
                      </div>
                    </div>
                    <Link
                      href={`/seller/products/${p.id}/edit`}
                      className="text-sm text-[#1790d7] hover:underline font-medium"
                    >
                      Restock →
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {lowStock.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 rounded-2xl p-6 mb-8"
            >
              <h2 className="text-lg font-semibold text-amber-800 flex items-center gap-2 mb-4">
                <AlertTriangle className="w-5 h-5" />
                Low Stock Alerts ({lowStock.length})
              </h2>
              <div className="space-y-3">
                {lowStock.slice(0, 5).map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between bg-white rounded-xl p-4 border border-amber-100"
                  >
                    <div className="flex items-center gap-4">
                      <img
                        src={p.image || p.media?.[0]?.url || "/assets/sample-image.webp"}
                        alt=""
                        className="w-12 h-12 object-cover rounded-lg"
                      />
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-sm text-amber-600">
                          {p.quantity} left • Threshold: {p.low_stock_threshold ?? 5}
                        </p>
                      </div>
                    </div>
                    <Link
                      href="/seller/products"
                      className="text-sm text-[#1790d7] hover:underline font-medium"
                    >
                      Update →
                    </Link>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
            <h2 className="px-6 py-4 border-b border-gray-100 font-semibold text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5" />
              All Products – Stock Levels
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50/80 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      Product
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase">
                      SKU
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                      Qty
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase">
                      Threshold
                    </th>
                    <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{p.name}</p>
                      </td>
                      <td className="px-6 py-4 text-gray-500">{p.sku || "—"}</td>
                      <td className="px-6 py-4 text-right">
                        <span
                          className={
                            p.track_inventory && (p.low_stock_threshold ?? 0) >= (p.quantity ?? 0)
                              ? "text-amber-600 font-semibold"
                              : ""
                          }
                        >
                          {p.quantity ?? 0}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {editingThresholdId === p.id ? (
                          <div className="flex items-center justify-end gap-1">
                            <input
                              type="number"
                              min="0"
                              placeholder="Off"
                              value={editThreshold}
                              onChange={(e) => setEditThreshold(e.target.value)}
                              className="w-20 px-2 py-1.5 border rounded-lg text-right"
                            />
                            <button
                              onClick={() => handleSaveThreshold(p.id)}
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                              title="Save threshold"
                            >
                              <Save className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => {
                                setEditingThresholdId(null);
                                setEditThreshold("");
                              }}
                              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <span className="text-gray-500">
                            {p.low_stock_threshold != null ? p.low_stock_threshold : "—"}
                            <button
                              onClick={() => {
                                setEditingThresholdId(p.id);
                                setEditThreshold(p.low_stock_threshold != null ? String(p.low_stock_threshold) : "");
                              }}
                              className="ml-1.5 p-1 text-[#1790d7] hover:bg-blue-50 rounded opacity-80 hover:opacity-100"
                              title="Edit low stock alert"
                            >
                              <Edit2 className="w-3.5 h-3.5 inline" />
                            </button>
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() =>
                              setHistoryProductId(historyProductId === p.id ? null : p.id)
                            }
                            className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                            title="Stock history"
                          >
                            <History className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {products.length === 0 && (
              <div className="flex flex-col lg:flex-row items-center gap-6 p-12 text-center lg:text-left">
                <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-slate-100 flex items-center justify-center">
                  <Package className="w-16 h-16 text-slate-400" />
                </div>
                <div>
                  <h2 className="font-semibold text-gray-900">No products yet</h2>
                  <p className="text-sm text-gray-600 mt-1">Add products to manage inventory. Stock levels will appear here once you have listings.</p>
                  <Link href="/seller/products/add" className="inline-block mt-4 px-4 py-2 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 transition-colors">
                    Add Product
                  </Link>
                </div>
              </div>
            )}
          </div>

          {historyProductId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 bg-white rounded-2xl border border-gray-100 p-6"
            >
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <History className="w-5 h-5" />
                Stock History
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {history.length === 0 ? (
                  <p className="text-gray-500 text-sm">No history yet</p>
                ) : (
                  history.map((h, i) => (
                    <div
                      key={i}
                      className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0"
                    >
                      <span>
                        {h.quantity_before} → {h.quantity_after} ({h.reason || "adjustment"})
                      </span>
                      <span className="text-gray-500">
                        {h.user?.name || "System"} •{" "}
                        {h.created_at
                          ? new Date(h.created_at).toLocaleString()
                          : ""}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <button
                onClick={() => setHistoryProductId(null)}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700"
              >
                Close
              </button>
            </motion.div>
          )}
        </>
      )}
    </div>
  );
}
