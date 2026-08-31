"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Truck, ExternalLink, ChevronDown, Printer } from "lucide-react";
import { privateListingsApi, sellerShipmentApi } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import PageHero from "@/components/customer/PageHero";
import { printShipmentSlip } from "@/lib/printShipmentSlip";
import { getCourierCn, courierLabel, enabledCourierOptions, defaultCourierValue } from "@/lib/courier";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const SHIPMENT_STATUSES = ["pending", "shipped", "in_transit", "delivered"];

export default function ListingOrderDetailPage() {
  const params = useParams();
  const id = params?.id;
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const { enabled_couriers: enabledCouriers } = useSiteSettings();
  const courierOptions = enabledCourierOptions(enabledCouriers);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingForm, setTrackingForm] = useState({ carrier: "", tracking_number: "", tracking_url: "" });
  const [addingTracking, setAddingTracking] = useState(false);
  const [editingShipmentId, setEditingShipmentId] = useState(null);
  const [editTrackingForm, setEditTrackingForm] = useState({ carrier: "", tracking_number: "", tracking_url: "" });
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const loadOrder = useCallback(() => {
    if (!id) return;
    setLoading(true);
    privateListingsApi.getOrder(id)
      .then((r) => setOrder(r.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  useEffect(() => {
    const next = defaultCourierValue(enabledCouriers, trackingForm.carrier);
    if (next && next !== trackingForm.carrier) {
      setTrackingForm((p) => ({ ...p, carrier: next }));
    }
  }, [enabledCouriers]); // eslint-disable-line react-hooks/exhaustive-deps

  const handlePrintCustomerDetails = () => {
    if (!order) return;
    const addr = order.shipping_address || order.shippingAddress || {};
    const s = order.shipments?.[0] || null;
    const ok = printShipmentSlip({
      orderNumber: order.order_number,
      customerName: [addr.first_name, addr.last_name].filter(Boolean).join(" ") || "Customer",
      customerPhone: addr.phone || "",
      customerEmail: addr.email || "",
      addressLine1: addr.address_line_1 || "",
      addressLine2: addr.address_line_2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.zip_code || addr.postal_code || "",
      country: addr.country || "",
      courierName: s?.carrier || "—",
      trackingId: getCourierCn(s) || s?.tracking_number || "",
      shipmentRef: s?.id ? `SHIP-${s.id}` : order.order_number,
      shippingCharges: s?.shipping_cost ?? null,
      items: (order.items || []).filter((i) => parseFloat(i.price) > 0),
      formatPrice,
    });
    if (!ok) showError?.("Please allow pop-ups to print the shipment slip.");
    else showSuccess?.("Print window opened.");
  };

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await privateListingsApi.approveOrder(id);
      showSuccess?.("Order approved. You can add tracking now.");
      loadOrder();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to approve");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    const reason = typeof window !== "undefined" ? window.prompt("Rejection reason:") : "";
    if (reason == null) return;
    if (!String(reason).trim()) {
      showError?.("Rejection reason is required");
      return;
    }
    setActionLoading(true);
    try {
      const res = await privateListingsApi.rejectOrder(id, String(reason).trim());
      showSuccess?.(res?.message || "Order rejected.");
      loadOrder();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to reject");
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveCancellation = async () => {
    setActionLoading(true);
    try {
      await privateListingsApi.approveCancellation(id);
      showSuccess?.("Cancellation approved.");
      loadOrder();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to approve cancellation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectCancellation = async () => {
    setActionLoading(true);
    try {
      await privateListingsApi.rejectCancellation(id);
      showSuccess?.("Cancellation request rejected.");
      loadOrder();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to reject cancellation");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTracking = async (e) => {
    e.preventDefault();
    if (!trackingForm.carrier?.trim() || !trackingForm.tracking_number?.trim()) {
      showError?.("Carrier and tracking number are required");
      return;
    }
    setAddingTracking(true);
    try {
      await sellerShipmentApi.addTracking(id, {
        carrier: trackingForm.carrier.trim(),
        tracking_number: trackingForm.tracking_number.trim(),
        tracking_url: trackingForm.tracking_url?.trim() || undefined,
      });
      showSuccess?.("Tracking added.");
      setTrackingForm({ carrier: defaultCourierValue(enabledCouriers), tracking_number: "", tracking_url: "" });
      loadOrder();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to add tracking");
    } finally {
      setAddingTracking(false);
    }
  };

  const handleEditTracking = async (e) => {
    e.preventDefault();
    if (!editTrackingForm.carrier?.trim() || !editTrackingForm.tracking_number?.trim()) {
      showError?.("Carrier and tracking number are required");
      return;
    }
    setAddingTracking(true);
    try {
      await sellerShipmentApi.addTracking(id, {
        carrier: editTrackingForm.carrier.trim(),
        tracking_number: editTrackingForm.tracking_number.trim(),
        tracking_url: editTrackingForm.tracking_url?.trim() || undefined,
      });
      showSuccess?.("Tracking updated.");
      setEditingShipmentId(null);
      loadOrder();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to update tracking");
    } finally {
      setAddingTracking(false);
    }
  };

  const handleUpdateStatus = async (shipmentId, status) => {
    setStatusUpdating(shipmentId);
    try {
      await sellerShipmentApi.updateStatus(shipmentId, status);
      showSuccess?.(`Status updated to ${status.replace("_", " ")}`);
      loadOrder();
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to update status");
    } finally {
      setStatusUpdating(null);
    }
  };

  if (loading) {
    return <div className="h-64 bg-gray-100 rounded-xl animate-pulse" />;
  }
  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">Order not found.</p>
        <Link href="/customer/listings/orders" className="text-[#1790d7] hover:underline mt-2 inline-block">Back to orders</Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero title={`Order ${order.order_number}`} description="Order details for your sold items" illustration="orders" />

      {(order.can_approve || order.seller_fulfillment_status === "processing" || order.seller_display_status === "processing") &&
        !["cancelled", "refunded", "rejected"].includes(order.seller_display_status) && (
        <div className="p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-2">
          <p className="text-sm text-sky-900">
            Approve or reject <strong>your items only</strong>. Other sellers on this order are not affected.
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleApprove} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
              Approve my items
            </button>
            <button type="button" onClick={handleReject} disabled={actionLoading} className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50">
              Reject my items
            </button>
          </div>
        </div>
      )}

      {order.can_reject && order.seller_display_status === "approved" && (
        <div className="flex flex-wrap gap-3">
          <button type="button" onClick={handleReject} disabled={actionLoading} className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50">
            Reject my items
          </button>
        </div>
      )}

      {order.seller_display_status === "rejected" && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
          You rejected your items on this order.
        </div>
      )}

      {order.status === "cancellation_requested" && (
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <p className="text-sm text-amber-800 font-medium">
            Customer requested cancellation{order.cancellation_reason ? `: ${order.cancellation_reason}` : "."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button type="button" onClick={handleApproveCancellation} disabled={actionLoading} className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50">
              Approve cancellation
            </button>
            <button type="button" onClick={handleRejectCancellation} disabled={actionLoading} className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50">
              Reject cancellation
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200/80 bg-white overflow-hidden">
        <div className="p-4 border-b flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-gray-900">{order.order_number}</p>
            <p className="text-sm text-gray-500">{new Date(order.created_at).toLocaleString()}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrintCustomerDetails}
              className="inline-flex items-center gap-2 px-3 py-2 bg-white border border-gray-200 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-50"
            >
              <Printer className="w-4 h-4" />
              Print Customer Details
            </button>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ["completed", "delivered"].includes(order.seller_display_status ?? order.status) ? "bg-emerald-100 text-emerald-700" :
              (order.seller_display_status ?? order.status) === "cancelled" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            }`}>
              {(order.seller_display_status ?? order.status)?.replace(/_/g, " ")}
            </span>
          </div>
        </div>
        <div className="p-4 divide-y">
          {order.items?.filter((item) => parseFloat(item.price) > 0).map((item) => (
            <div key={item.id} className="py-4 flex gap-4">
              <div className="w-16 h-16 rounded-lg bg-gray-100 shrink-0 overflow-hidden">
                {item.image_url ? (
                  <img src={item.image_url.startsWith("http") ? item.image_url : `${(process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1").replace(/\/api\/v1\/?$/, "")}${item.image_url.startsWith("/") ? "" : "/"}${item.image_url}`} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">—</div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900">{item.product_name || item.product?.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} × {formatPrice(item.price)}</p>
              </div>
              <p className="font-semibold shrink-0">{formatPrice((parseFloat(item.price) || 0) * (item.quantity || 0))}</p>
            </div>
          ))}
        </div>
        <div className="p-4 border-t bg-gray-50 space-y-2">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Order Price / Sale Amount</span>
            <span className="font-medium">{formatPrice(order.seller_subtotal ?? 0)}</span>
          </div>
          {(order.coupon_code || (order.seller_discount_allocated != null && parseFloat(order.seller_discount_allocated) > 0)) && (
            <div className="flex justify-between text-sm text-emerald-600">
              <span>Coupon{order.coupon_code ? ` (${order.coupon_code})` : ""} — your share</span>
              <span>−{formatPrice(order.seller_discount_allocated ?? 0)}</span>
            </div>
          )}
          {parseFloat(order.seller_commission || 0) > 0 && (
            <div className="flex justify-between text-sm text-amber-700">
              <span>Seller Commission</span>
              <span>−{formatPrice(order.seller_commission)}</span>
            </div>
          )}
          <div className="flex justify-between font-semibold pt-1 border-t border-gray-200">
            <span>You Receive</span>
            <span className="text-[#1790d7]">
              {formatPrice(
                order.seller_you_receive ??
                  order.seller_net ??
                  Math.max(0, (order.seller_subtotal ?? 0) - (order.seller_discount_allocated ?? 0) - (order.seller_commission ?? 0))
              )}
            </span>
          </div>
        </div>
      </div>

      {(order.shipping_address || order.shippingAddress) && (
        <div className="rounded-xl border border-gray-200/80 bg-white p-4">
          <h3 className="font-semibold text-gray-900 mb-2">Shipping address</h3>
          <p className="text-sm text-gray-600">
            {(order.shipping_address || order.shippingAddress).first_name} {(order.shipping_address || order.shippingAddress).last_name}<br />
            {(order.shipping_address || order.shippingAddress).address_line_1}<br />
            {(order.shipping_address || order.shippingAddress).city}, {(order.shipping_address || order.shippingAddress).state} {(order.shipping_address || order.shippingAddress).zip_code}<br />
            {(order.shipping_address || order.shippingAddress).phone}
          </p>
        </div>
      )}

      {/* Shipment & tracking – private seller can add tracking and update status */}
      <div className="rounded-xl border border-gray-200/80 bg-white p-4">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-600" />
          Shipment & Tracking
        </h3>
        {order.status === "cancelled" && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
            This order is cancelled. You cannot add tracking or change status.
          </p>
        )}

        {order.shipments?.length > 0 ? (
          <div className="space-y-4">
            {order.shipments.map((s) => (
              <div key={s.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                {editingShipmentId === s.id ? (
                  <form onSubmit={handleEditTracking} className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Edit courier / tracking</p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Carrier *</label>
                        <select
                          value={editTrackingForm.carrier}
                          onChange={(e) => setEditTrackingForm((p) => ({ ...p, carrier: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          required
                          disabled={courierOptions.length === 0}
                        >
                          {courierOptions.length === 0 ? (
                            <option value="">No couriers enabled</option>
                          ) : (
                            courierOptions.map((o) => (
                              <option key={o.value} value={o.value}>{o.label}</option>
                            ))
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tracking number *</label>
                        <input
                          value={editTrackingForm.tracking_number}
                          onChange={(e) => setEditTrackingForm((p) => ({ ...p, tracking_number: e.target.value }))}
                          placeholder="e.g. LP123456789"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tracking URL (optional)</label>
                        <input
                          value={editTrackingForm.tracking_url}
                          onChange={(e) => setEditTrackingForm((p) => ({ ...p, tracking_url: e.target.value }))}
                          placeholder="https://..."
                          type="url"
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button type="submit" disabled={addingTracking} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
                        {addingTracking ? "Saving…" : "Save"}
                      </button>
                      <button type="button" onClick={() => setEditingShipmentId(null)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-gray-900">
                        {courierLabel(s.carrier) || s.carrier || "—"}
                      </p>
                      <p className="text-sm text-gray-600">Tracking: {s.tracking_number}</p>
                      {(s.lcs_status || s.courier_status || s.status) && (
                        <p className="text-sm font-medium text-amber-800 mt-1">
                          Latest status: {(s.lcs_status || s.courier_status || s.status || "").replace(/_/g, " ")}
                        </p>
                      )}
                      {s.tracking_url && (
                        <a href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="text-sm text-amber-600 hover:underline inline-flex items-center gap-1 mt-1">
                          Track <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                        s.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                        s.status === "in_transit" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                      }`}>
                        {s.status?.replace(/_/g, " ")}
                      </span>
                      {order.status !== "cancelled" && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingShipmentId(s.id);
                            setEditTrackingForm({
                              carrier: defaultCourierValue(enabledCouriers, s.carrier),
                              tracking_number: s.tracking_number || getCourierCn(s) || "",
                              tracking_url: s.tracking_url || "",
                            });
                          }}
                          className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
                        >
                          Edit tracking
                        </button>
                      )}
                      {s.status !== "delivered" && order.status !== "cancelled" && (
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setStatusMenuOpen(statusMenuOpen === s.id ? null : s.id)}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 flex items-center gap-1"
                            disabled={statusUpdating === s.id}
                          >
                            Update status <ChevronDown className="w-4 h-4" />
                          </button>
                          {statusMenuOpen === s.id && (
                            <div className="absolute right-0 top-full mt-1 py-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[140px]">
                              {SHIPMENT_STATUSES.filter((st) => st !== s.status).map((st) => (
                                <button
                                  key={st}
                                  type="button"
                                  onClick={() => { handleUpdateStatus(s.id, st); setStatusMenuOpen(null); }}
                                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                                >
                                  {st.replace("_", " ")}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : null}

        {(order.seller_display_status === "processing" || order.can_approve) && (
          <p className="text-sm text-gray-500 mt-2">Approve your items before adding tracking.</p>
        )}

        {(order.can_add_tracking || order.seller_display_status === "approved") && !order.shipments?.some((s) => s.tracking_number || getCourierCn(s)) && (
          <form onSubmit={handleAddTracking} className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-100 space-y-3">
            <p className="text-sm font-medium text-gray-700">Add tracking</p>
            {courierOptions.length === 0 ? (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2">
                No couriers are enabled. Ask admin to enable TCS, Leopard/LCS, or PostEx under Settings → Courier.
              </p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <select
                value={trackingForm.carrier}
                onChange={(e) => setTrackingForm((f) => ({ ...f, carrier: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                required
              >
                {courierOptions.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Tracking ID"
                value={trackingForm.tracking_number}
                onChange={(e) => setTrackingForm((f) => ({ ...f, tracking_number: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
                required
              />
              <input
                type="url"
                placeholder="Tracking URL (optional)"
                value={trackingForm.tracking_url}
                onChange={(e) => setTrackingForm((f) => ({ ...f, tracking_url: e.target.value }))}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
              />
            </div>
            )}
            <button type="submit" disabled={addingTracking || courierOptions.length === 0} className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 disabled:opacity-50">
              {addingTracking ? "Adding…" : "Add tracking"}
            </button>
          </form>
        )}
      </div>

      <div className="bg-white rounded-2xl border border-gray-200/80 p-4 sm:p-5">
        <h2 className="font-semibold text-gray-900 mb-2">Disputes</h2>
        <p className="text-sm text-gray-600 mb-3">
          If a buyer opens a dispute on this order, you can reply as the seller from your disputes list.
        </p>
        <Link
          href="/customer/disputes"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-sm font-medium text-[#1790d7] hover:bg-[#1790d7]/5"
        >
          View / reply to disputes
        </Link>
      </div>

      <Link href="/customer/listings/orders" className="inline-block text-[#1790d7] font-medium hover:underline">
        ← Back to orders
      </Link>
    </div>
  );
}
