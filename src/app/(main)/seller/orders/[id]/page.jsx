"use client";

import { useParams } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Truck, Send, ChevronDown, ExternalLink, Printer } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { sellerOrdersApi, sellerShipmentApi, getBackendBaseUrl } from "@/lib/api";
import { openCourierTracking, getCourierCn, getCourierLabel } from "@/lib/courier";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { printShipmentSlip } from "@/lib/printShipmentSlip";

function feeLabel(name, type, rate) {
  if (type === "percentage" && rate != null) {
    return `${name} (${rate}%)`;
  }
  return name;
}

function VendorOrderDetail({ orderId }) {
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [trackingForm, setTrackingForm] = useState({ carrier: "tcs", tracking_number: "", tracking_url: "" });
  const [addingTracking, setAddingTracking] = useState(false);
  const [editingShipmentId, setEditingShipmentId] = useState(null);
  const [editTrackingForm, setEditTrackingForm] = useState({ carrier: "tcs", tracking_number: "", tracking_url: "" });
  const [statusUpdating, setStatusUpdating] = useState(null);
  const [statusMenuOpen, setStatusMenuOpen] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const handlePrintCustomerDetails = (shipment = null) => {
    if (!order) return;
    const addr = order.shipping_address || order.shippingAddress || {};
    const s = shipment || order.shipments?.[0] || null;
    const ok = printShipmentSlip({
      orderNumber: order.order_number,
      customerName:
        [addr.first_name, addr.last_name].filter(Boolean).join(" ") ||
        order.user?.name ||
        "Customer",
      customerPhone: addr.phone || order.user?.phone || "",
      customerEmail: order.user?.email || addr.email || "",
      addressLine1: addr.address_line_1 || "",
      addressLine2: addr.address_line_2 || "",
      city: addr.city || "",
      state: addr.state || "",
      postalCode: addr.zip_code || addr.postal_code || "",
      country: addr.country || "",
      courierName: s?.carrier || getCourierLabel?.(s) || order.shipping_method || "—",
      trackingId: getCourierCn(s) || s?.tracking_number || "",
      shipmentRef: s?.id ? `SHIP-${s.id}` : order.order_number,
      shippingCharges: s?.shipping_cost ?? order.seller_shipping_cost ?? null,
      items: (order.items || []).filter((i) => parseFloat(i.price) > 0),
      formatPrice,
    });
    if (!ok) showError?.("Please allow pop-ups to print the shipment slip.");
    else showSuccess?.("Print window opened.");
  };

  const loadOrder = useCallback(() => {
    if (!orderId) return;
    setLoading(true);
    sellerOrdersApi
      .get(orderId)
      .then((res) => setOrder(res.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  const handleApprove = async () => {
    setActionLoading(true);
    try {
      await sellerOrdersApi.approve(orderId);
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
      const res = await sellerOrdersApi.reject(orderId, String(reason).trim());
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
      await sellerOrdersApi.approveCancellation(orderId);
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
      await sellerOrdersApi.rejectCancellation(orderId);
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
      await sellerShipmentApi.addTracking(orderId, {
        carrier: trackingForm.carrier.trim(),
        tracking_number: trackingForm.tracking_number.trim(),
        tracking_url: trackingForm.tracking_url?.trim() || undefined,
      });
      showSuccess?.("Tracking added.");
      setTrackingForm({ carrier: "tcs", tracking_number: "", tracking_url: "" });
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
      await sellerShipmentApi.addTracking(orderId, {
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

  if (loading || !order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="h-48 bg-gray-100 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <Link href="/seller/orders" className="text-amber-600 text-sm hover:underline mb-4 inline-block">
        ← Back to Orders
      </Link>
      <div className="flex flex-wrap justify-between items-start gap-3 mb-6">
        <h1 className="text-2xl font-bold">Order {order.order_number}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handlePrintCustomerDetails()}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-800 rounded-xl text-sm font-medium hover:bg-gray-50"
          >
            <Printer className="w-4 h-4" />
            Print Customer Details
          </button>
          <span
            className={`px-4 py-2 rounded-xl text-sm font-medium ${
              ["completed", "delivered"].includes(order.seller_display_status ?? order.status) ? "bg-emerald-100 text-emerald-700" :
              ["cancelled", "rejected", "refunded"].includes(order.seller_display_status ?? order.status) ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
            }`}
          >
            {(order.seller_display_status ?? order.status)?.replace(/_/g, " ")}
          </span>
        </div>
      </div>

      {(order.can_approve || order.seller_fulfillment_status === "processing" || order.seller_display_status === "processing") &&
        !["cancelled", "refunded", "rejected"].includes(order.seller_display_status) && (
        <div className="mb-6 p-4 bg-sky-50 border border-sky-100 rounded-xl space-y-2">
          <p className="text-sm text-sky-900">
            Approve or reject <strong>your items only</strong>. Other sellers on this order are not affected.
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              Approve my items
            </button>
            <button
              type="button"
              onClick={handleReject}
              disabled={actionLoading}
              className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50"
            >
              Reject my items
            </button>
          </div>
        </div>
      )}

      {(order.can_reject && order.seller_display_status === "approved") && (
        <div className="mb-6 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReject}
            disabled={actionLoading}
            className="px-4 py-2 border border-red-200 text-red-700 bg-red-50 rounded-xl text-sm font-medium hover:bg-red-100 disabled:opacity-50"
          >
            Reject my items
          </button>
        </div>
      )}

      {order.seller_display_status === "rejected" && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-sm text-red-800">
          You rejected your items on this order
          {order.items?.find((i) => i.rejection_reason)?.rejection_reason
            ? `: ${order.items.find((i) => i.rejection_reason)?.rejection_reason}`
            : "."}
        </div>
      )}

      {order.status === "cancellation_requested" && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
          <p className="text-sm text-amber-800 font-medium">
            Customer requested cancellation{order.cancellation_reason ? `: ${order.cancellation_reason}` : "."}
          </p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleApproveCancellation}
              disabled={actionLoading}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-medium hover:bg-emerald-700 disabled:opacity-50"
            >
              Approve cancellation
            </button>
            <button
              type="button"
              onClick={handleRejectCancellation}
              disabled={actionLoading}
              className="px-4 py-2 border border-gray-200 bg-white rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-50"
            >
              Reject cancellation
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden divide-y">
        {order.items?.filter((i) => parseFloat(i.price) > 0).map((i) => (
          <div key={i.id} className="p-6 flex gap-4">
            <div className="w-20 h-20 rounded-lg flex-shrink-0 overflow-hidden bg-gray-100">
              <img
                src={
                  i.image_url
                    ? (i.image_url.startsWith("http") ? i.image_url : `${getBackendBaseUrl?.() || ""}${i.image_url.startsWith("/") ? "" : "/"}${i.image_url}`)
                    : "/assets/sample-image.webp"
                }
                alt={i.product_name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = "/assets/sample-image.webp";
                }}
              />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">{i.product_name}</p>
              <p className="text-sm text-gray-500">
                Qty: {i.quantity} × {formatPrice(i.price)}
              </p>
              {i.options?.variant_attributes && typeof i.options.variant_attributes === "object" && Object.keys(i.options.variant_attributes).length > 0 && (
                <p className="text-xs text-gray-600 mt-0.5">
                  Variant: {Object.entries(i.options.variant_attributes).map(([k, v]) => `${k}: ${v}`).join(", ")}
                </p>
              )}
            </div>
            <p className="font-semibold text-amber-600">{formatPrice(i.quantity * parseFloat(i.price))}</p>
          </div>
        ))}
      </div>

      {/* Order totals — seller view: sale amount, seller-side fees, you receive */}
      <div className="mt-6 p-6 bg-gray-50 rounded-2xl space-y-2">
        {order.seller_subtotal != null && (
          <div className="flex justify-between text-sm text-gray-600">
            <span>Order Price / Sale Amount</span>
            <span>{formatPrice(order.seller_subtotal)}</span>
          </div>
        )}
        {(order.coupon_code || (order.coupon && order.coupon.code) || (order.seller_discount_allocated != null && parseFloat(order.seller_discount_allocated) > 0)) && (
          <div className="flex justify-between text-sm text-emerald-600">
            <span>Coupon discount{order.coupon_code ? ` (${order.coupon_code})` : order.coupon?.code ? ` (${order.coupon.code})` : ""}</span>
            <span>−{formatPrice(order.seller_discount_allocated ?? 0)}</span>
          </div>
        )}
        {(() => {
          const fees = order.seller_fees || {};
          const marketplace = parseFloat(fees.marketplace_fee ?? 0);
          const onlineTxn = parseFloat(fees.online_transaction_fee ?? 0);
          const commission = parseFloat(fees.order_commission ?? order.seller_commission ?? 0);
          return (
            <>
              {marketplace > 0 && (
                <div className="flex justify-between text-sm text-amber-700">
                  <span>
                    {feeLabel("Marketplace fee", fees.marketplace_fee_type, fees.marketplace_fee_rate)}
                  </span>
                  <span>−{formatPrice(marketplace)}</span>
                </div>
              )}
              {onlineTxn > 0 && (
                <div className="flex justify-between text-sm text-amber-700">
                  <span>
                    {feeLabel(
                      "Online transaction fee",
                      fees.online_transaction_fee_type,
                      fees.online_transaction_fee_rate
                    )}
                  </span>
                  <span>−{formatPrice(onlineTxn)}</span>
                </div>
              )}
              {commission > 0 && (
                <div className="flex justify-between text-sm text-amber-700">
                  <span>
                    {feeLabel("Order commission", fees.order_commission_type, fees.order_commission_rate)}
                  </span>
                  <span>−{formatPrice(commission)}</span>
                </div>
              )}
            </>
          );
        })()}
        <div className="flex justify-between text-lg font-semibold pt-2 border-t border-gray-200">
          <span>You Receive</span>
          <span className="text-amber-600">
            {formatPrice(order.seller_you_receive ?? order.seller_net ?? Math.max(0, (order.seller_subtotal ?? 0) - (order.seller_discount_allocated ?? 0) - (order.seller_commission ?? 0)))}
          </span>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Payment: {order.payment_method || "—"} • {order.payment_status || "—"}
        </p>
        {(parseFloat(order.online_amount || 0) > 0 || parseFloat(order.cod_amount || 0) > 0) && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-1 text-sm">
            {parseFloat(order.online_amount || 0) > 0 && (
              <div className="flex justify-between text-gray-600">
                <span>Paid online{order.partial_payment_percent ? ` (${order.partial_payment_percent}%)` : ""}</span>
                <span>{formatPrice(order.online_amount)}</span>
              </div>
            )}
            {parseFloat(order.cod_amount || 0) > 0 && (
              <div className="flex justify-between text-amber-700">
                <span>Due on delivery</span>
                <span className="font-medium">{formatPrice(order.cod_amount)}</span>
              </div>
            )}
          </div>
        )}
      </div>

      {(order.user || order.shipping_address) && (
        <div className="mt-6 p-6 border border-gray-100 rounded-2xl space-y-4">
          {order.user && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Customer</h3>
              <p className="text-gray-600 text-sm">
                <span className="font-medium text-gray-900">{order.user.name}</span>
                {order.user.email && <><br /><a href={`mailto:${order.user.email}`} className="text-amber-600 hover:underline">{order.user.email}</a></>}
              </p>
            </div>
          )}
          {order.shipping_address && (
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Shipping Address</h3>
          <p className="text-gray-600 text-sm">
            {order.shipping_address.first_name} {order.shipping_address.last_name}<br />
            {order.shipping_address.address_line_1}
            {order.shipping_address.address_line_2 && `, ${order.shipping_address.address_line_2}`}<br />
            {order.shipping_address.city}
            {order.shipping_address.state && `, ${order.shipping_address.state}`}
            {order.shipping_address.country}<br />
            {order.shipping_address.phone}
          </p>
            </div>
          )}
        </div>
      )}

      {/* Shipment & tracking – disabled when order is cancelled */}
      <div className="mt-6 p-6 border border-gray-100 rounded-2xl">
        <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Truck className="w-5 h-5 text-amber-600" />
          Shipment & Tracking
        </h3>
        {order.status === "cancelled" && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 mb-4">
            This order is cancelled. You cannot add tracking or change shipment status.
          </p>
        )}

        {order.shipments?.length > 0 ? (
          <div className="space-y-4">
            {order.shipments.map((s) => (
              <div key={s.id} className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                {editingShipmentId === s.id ? (
                  <form onSubmit={handleEditTracking} className="space-y-3">
                    <p className="text-sm font-medium text-gray-700">Edit tracking</p>
                    <div className="grid sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Carrier *</label>
                        <select
                          value={editTrackingForm.carrier === "leopards" ? "leopards" : "tcs"}
                          onChange={(e) => setEditTrackingForm((p) => ({ ...p, carrier: e.target.value }))}
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                          required
                        >
                          <option value="tcs">TCS</option>
                          <option value="leopards">Leopard Courier</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tracking Number *</label>
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
                        {addingTracking ? "Saving..." : "Save"}
                      </button>
                      <button type="button" onClick={() => { setEditingShipmentId(null); }} className="px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-gray-900">
                          {s.carrier === "tcs" ? "TCS" : s.carrier === "leopards" || s.carrier === "lcs" ? "Leopard Courier (LCS)" : (s.carrier || (getCourierCn(s) ? getCourierLabel(s).replace(" CN", " Courier") : "—"))}
                        </p>
                        {getCourierCn(s) && (
                          <p className="text-sm text-gray-600">
                            {getCourierLabel(s)}: {getCourierCn(s)}
                          </p>
                        )}
                        {!getCourierCn(s) && s.tracking_number && (
                          <p className="text-sm text-gray-600">Tracking: {s.tracking_number}</p>
                        )}
                        {(s.lcs_status || s.tcs_status || s.courier_status || s.tracking_status) && (
                          <p className="text-sm font-medium text-amber-800 mt-1">
                            Latest status: {(s.lcs_status || s.tcs_status || s.courier_status || s.tracking_status || "").replace(/_/g, " ")}
                          </p>
                        )}
                        {(getCourierCn(s) || s.tracking_number) && (
                          <button
                            type="button"
                            onClick={() => {
                              openCourierTracking(s);
                              showSuccess("Tracking ID copied. Paste it on the courier tracking page.");
                            }}
                            className="text-sm text-amber-600 hover:underline inline-flex items-center gap-1 mt-1"
                          >
                            Track shipment <ExternalLink className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-3 py-1 rounded-lg text-sm font-medium ${
                          s.status === "delivered" ? "bg-emerald-100 text-emerald-700" :
                          s.status === "in_transit" ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                        }`}>
                          {(s.status || "pending").replace(/_/g, " ")}
                        </span>
                        {order.status !== "cancelled" && (
                          <button
                            type="button"
                            onClick={() => {
                              setEditingShipmentId(s.id);
                              setEditTrackingForm({ carrier: s.carrier || "tcs", tracking_number: s.tracking_number || getCourierCn(s) || "", tracking_url: s.tracking_url || "" });
                            }}
                            className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white"
                          >
                            Edit tracking
                          </button>
                        )}
                        {s.status !== "delivered" && order.status !== "cancelled" && (
                          <div className="relative">
                            <button
                              onClick={() => setStatusMenuOpen(statusMenuOpen === s.id ? null : s.id)}
                              className="px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-medium hover:bg-white flex items-center gap-1"
                              disabled={statusUpdating === s.id}
                            >
                              Update status <ChevronDown className="w-4 h-4" />
                            </button>
                            {statusMenuOpen === s.id && (
                              <>
                                <div className="fixed inset-0 z-10" onClick={() => setStatusMenuOpen(null)} aria-hidden="true" />
                                <div className="absolute right-0 top-full mt-1 py-1 bg-white border rounded-lg shadow-lg z-20 min-w-[140px]">
                                  {s.status !== "shipped" && (
                                    <button type="button" onClick={() => { handleUpdateStatus(s.id, "shipped"); setStatusMenuOpen(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Mark Shipped</button>
                                  )}
                                  {s.status !== "in_transit" && (
                                    <button type="button" onClick={() => { handleUpdateStatus(s.id, "in_transit"); setStatusMenuOpen(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Mark In Transit</button>
                                  )}
                                  <button type="button" onClick={() => { handleUpdateStatus(s.id, "delivered"); setStatusMenuOpen(null); }} className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-emerald-600">Mark Delivered</button>
                                </div>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : order.status === "cancelled" || order.seller_display_status === "rejected" ? (
          <p className="text-sm text-gray-500">
            {order.seller_display_status === "rejected"
              ? "You rejected your items — tracking is not available."
              : "No tracking added. Order was cancelled."}
          </p>
        ) : !(order.can_add_tracking || ["approved", "shipped", "delivered", "completed"].includes(order.seller_display_status ?? "")) ? (
          <p className="text-sm text-gray-500">
            {order.seller_display_status === "processing" || order.can_approve
              ? "Approve your items before adding tracking."
              : "Tracking can be added after you approve your items."}
          </p>
        ) : null}

        {(order.can_add_tracking || order.seller_display_status === "approved") && !order.shipments?.some((s) => s.tracking_number || getCourierCn(s)) && (
          <form onSubmit={handleAddTracking} className="space-y-3 mt-4">
            <p className="text-sm text-gray-600 mb-4">
              After you ship the parcel, select the courier and enter the Tracking ID. Status updates automatically from TCS / Leopard every hour.
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Courier *</label>
                <select
                  value={trackingForm.carrier === "leopards" ? "leopards" : "tcs"}
                  onChange={(e) => setTrackingForm((p) => ({ ...p, carrier: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  required
                >
                  <option value="tcs">TCS</option>
                  <option value="leopards">Leopard Courier (LCS)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tracking ID *</label>
                <input
                  value={trackingForm.tracking_number}
                  onChange={(e) => setTrackingForm((p) => ({ ...p, tracking_number: e.target.value }))}
                  placeholder="Enter tracking / CN number"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Tracking URL (optional)</label>
                <input
                  value={trackingForm.tracking_url}
                  onChange={(e) => setTrackingForm((p) => ({ ...p, tracking_url: e.target.value }))}
                  placeholder="https://..."
                  type="url"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={addingTracking}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-amber-500 text-white rounded-xl text-sm font-medium hover:bg-amber-600 disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {addingTracking ? "Saving..." : "Mark Shipped & Save Tracking"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function VendorOrderDetailPage() {
  const params = useParams();
  return (
    <ProtectedRoute requiredRole="seller">
      <VendorOrderDetail orderId={params?.id} />
    </ProtectedRoute>
  );
}
