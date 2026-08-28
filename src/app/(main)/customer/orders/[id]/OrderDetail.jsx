"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { orderApi, refundApi, reviewApi, getBackendBaseUrl } from "@/lib/api";
import { useMarket } from "@/context/MarketContext";
import { useSnackbar } from "@/context/SnackbarContext";
import { confirmDelete } from "@/lib/sweetAlert";
import { Store, Truck, AlertCircle, XCircle, RotateCcw, Clock, Star, CreditCard, MapPin } from "lucide-react";
import { openCourierTracking, getCourierCn, hasCourierTracking } from "@/lib/courier";
import { normalizePhonePk } from "@/lib/validators";

const ONLINE_METHODS = ["jazzcash", "jazzcash_partial", "stripe", "easypaisa", "paypal"];

function formatLabel(value) {
  if (!value) return "—";
  return String(value).replace(/_/g, " ");
}

function statusTone(status) {
  const s = String(status || "").toLowerCase();
  if (["completed", "delivered"].includes(s)) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "shipped" || s === "approved" || s === "in_transit") return "bg-sky-100 text-sky-800 border-sky-200";
  if (s === "cancelled") return "bg-red-100 text-red-700 border-red-200";
  if (s === "refunded") return "bg-slate-100 text-slate-700 border-slate-200";
  if (s === "cancellation_requested") return "bg-orange-100 text-orange-800 border-orange-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function paymentTone(status) {
  const s = String(status || "").toLowerCase();
  if (["paid", "partial_paid"].includes(s)) return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (s === "failed") return "bg-red-100 text-red-700 border-red-200";
  if (s === "refunded") return "bg-slate-100 text-slate-700 border-slate-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function courierStatusTone(status) {
  const s = String(status || "").toLowerCase();
  if (s === "delivered") return "bg-emerald-100 text-emerald-800 border-emerald-200";
  if (["shipped", "in_transit"].includes(s)) return "bg-sky-100 text-sky-800 border-sky-200";
  if (["cancelled", "failed", "returned"].includes(s)) return "bg-red-100 text-red-700 border-red-200";
  return "bg-amber-100 text-amber-800 border-amber-200";
}

function paidByLabel(method) {
  const key = String(method || "").toLowerCase().trim();
  if (!key) return "—";
  return (
    {
      cod: "COD",
      wallet: "Wallet",
      jazzcash: "JazzCash",
      jazzcash_partial: "JazzCash (partial)",
      easypaisa: "Easypaisa",
      stripe: "Card (Stripe)",
      paypal: "PayPal",
    }[key] || formatLabel(key)
  );
}

function feeLabel(name, type, rate) {
  if (type === "percentage" && rate != null) {
    return `${name} (${rate}%)`;
  }
  return name;
}

function Card({ title, icon: Icon, children, className = "", action = null }) {
  return (
    <section className={`bg-white rounded-2xl border border-gray-200/80 shadow-sm overflow-hidden ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-2.5 min-w-0">
            {Icon && (
              <span className="w-8 h-8 rounded-lg bg-[#1790d7]/10 text-[#1790d7] flex items-center justify-center shrink-0">
                <Icon className="w-4 h-4" />
              </span>
            )}
            {title && <h2 className="font-semibold text-gray-900 text-[15px] truncate">{title}</h2>}
          </div>
          {action}
        </div>
      )}
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

function handlePaymentRedirect(res) {
  if (res?.checkout_url) {
    if (res.checkout_method === "POST" && res.checkout_params) {
      const form = document.createElement("form");
      form.method = "POST";
      form.action = res.checkout_url;
      Object.entries(res.checkout_params).forEach(([k, v]) => {
        const inp = document.createElement("input");
        inp.type = "hidden";
        inp.name = k;
        inp.value = v ?? "";
        form.appendChild(inp);
      });
      document.body.appendChild(form);
      form.submit();
      return true;
    }
    window.location.href = res.checkout_url;
    return true;
  }
  return false;
}

export default function OrderDetail({ orderId }) {
  const { formatPrice } = useMarket();
  const { showSuccess, showError } = useSnackbar();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refundLoading, setRefundLoading] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [cancelLoading, setCancelLoading] = useState(false);
  const [payLoading, setPayLoading] = useState(false);
  const [payPhone, setPayPhone] = useState("");
  const [payCnic, setPayCnic] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");
  const [notesSaving, setNotesSaving] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewBody, setReviewBody] = useState("");
  const [selectedProductIds, setSelectedProductIds] = useState([]);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewedProductIds, setReviewedProductIds] = useState([]);

  const loadOrder = () =>
    orderApi.get(orderId).then((res) => {
      const o = res.order;
      setOrder(o);
      setCustomerNotes(o?.customer_notes ?? "");
      const ids = (o?.items || [])
        .filter((i) => parseFloat(i.price) > 0 && i.product_id)
        .map((i) => i.product_id);
      setSelectedProductIds([...new Set(ids)]);
      if (!payPhone) {
        const guess = o?.shipping_address?.phone || o?.user?.phone || "";
        if (guess) setPayPhone(guess);
      }
      return o;
    });

  useEffect(() => {
    if (!orderId) return;
    loadOrder()
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  // After gateway return (?paid=1 / ?paid=0), refresh order status.
  useEffect(() => {
    const paid = searchParams?.get("paid");
    if (!orderId || paid == null) return;
    loadOrder()
      .then((o) => {
        if (paid === "1") {
          const ps = o?.payment_status;
          if (ps === "paid" || ps === "partial_paid") {
            showSuccess?.("Payment successful. Order is now processing.");
          } else {
            showSuccess?.("Payment submitted. Status will update shortly.");
          }
        } else if (paid === "0") {
          showError?.("Payment was cancelled. You can try Pay Now again.");
        }
        router.replace(`/customer/orders/${orderId}`, { scroll: false });
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId, searchParams]);

  const orderStatus = order?.complete_order_status || order?.status;
  const canReview = order && ["completed"].includes(orderStatus);
  const reviewableItems = (() => {
    const seen = new Set();
    return (order?.items || []).filter((i) => {
      if (!(parseFloat(i.price) > 0 && i.product_id) || reviewedProductIds.includes(i.product_id)) return false;
      if (seen.has(i.product_id)) return false;
      seen.add(i.product_id);
      return true;
    });
  })();

  const toggleProduct = (productId) => {
    setSelectedProductIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const selectAllProducts = () => {
    setSelectedProductIds([...new Set(reviewableItems.map((i) => i.product_id))]);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    if (!selectedProductIds.length) {
      showError?.("Select at least one product to review");
      return;
    }
    if (!reviewBody.trim() && !reviewTitle.trim()) {
      showError?.("Please write a short review");
      return;
    }
    setReviewSubmitting(true);
    try {
      await reviewApi.create({
        order_id: order.id,
        product_ids: selectedProductIds,
        rating: reviewRating,
        title: reviewTitle.trim() || undefined,
        body: reviewBody.trim() || undefined,
      });
      setReviewedProductIds((prev) => [...new Set([...prev, ...selectedProductIds])]);
      setShowReviewForm(false);
      setReviewTitle("");
      setReviewBody("");
      setReviewRating(5);
      showSuccess?.("Review submitted. It will appear on the product page after admin approval.");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to submit review");
    } finally {
      setReviewSubmitting(false);
    }
  };

  const paymentStatus = order?.payment_status;
  const method = String(order?.payment_method || "").toLowerCase();
  const isJazzcashOrder = method === "jazzcash" || method === "jazzcash_partial";
  const canCancelDirect =
    order &&
    order.status === "pending" &&
    paymentStatus !== "paid" &&
    paymentStatus !== "partial_paid";
  const canRequestCancel =
    order &&
    ["processing", "approved"].includes(order.status) &&
    !["shipped", "delivered", "completed", "cancelled", "refunded", "cancellation_requested"].includes(order.status);
  const canPayNow =
    order &&
    order.status === "pending" &&
    paymentStatus === "pending" &&
    ONLINE_METHODS.includes(method);
  const canUpdateNotes = order && ["pending", "paid"].includes(order.status);

  const reloadOrder = () => loadOrder();

  const handlePayNow = async () => {
    setPayLoading(true);
    try {
      if (isJazzcashOrder) {
        const phone = normalizePhonePk(payPhone);
        if (!phone) {
          showError?.("Enter your JazzCash mobile as 03XXXXXXXXX");
          setPayLoading(false);
          return;
        }
        const cnicDigits = String(payCnic || "").replace(/\D/g, "");
        if (cnicDigits.length < 6) {
          showError?.("Enter CNIC for JazzCash (last 6 digits or full CNIC)");
          setPayLoading(false);
          return;
        }
      }
      const payload = {};
      if (payPhone?.trim()) payload.payment_phone = normalizePhonePk(payPhone) || payPhone.trim();
      if (payCnic?.trim()) payload.payment_cnic = payCnic.trim();
      const res = await orderApi.retryPayment(order.id, payload);
      if (handlePaymentRedirect(res)) return;
      if (res.payment_ok || res.payment_status === "paid" || res.payment_status === "partial_paid") {
        showSuccess?.(res.message || "Payment completed.");
        await reloadOrder();
        return;
      }
      showSuccess?.(res.message || "Payment status updated.");
      await reloadOrder();
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Could not start payment");
    } finally {
      setPayLoading(false);
    }
  };
  const saveNotes = async () => {
    if (!orderId || !customerNotes.trim()) return;
    setNotesSaving(true);
    try {
      const res = await orderApi.update(orderId, { customer_notes: customerNotes.trim() });
      setOrder(res.order);
      setEditingNotes(false);
      showSuccess?.("Notes updated");
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Failed to update notes");
    } finally {
      setNotesSaving(false);
    }
  };

  if (loading || !order) {
    return (
      <div className="w-full py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3" />
          <div className="grid lg:grid-cols-12 gap-4">
            <div className="lg:col-span-7 h-64 bg-gray-100 rounded-2xl" />
            <div className="lg:col-span-5 h-64 bg-gray-100 rounded-2xl" />
          </div>
        </div>
      </div>
    );
  }

  const statusVal = order.complete_order_status || order.status;
  const paidItems = (order.items || []).filter((i) => parseFloat(i.price) > 0);
  const hasCourier =
    (order.shipments && order.shipments.length > 0) || order.tracking_number || order.tracking_url;
  const orderDate = order.created_at
    ? new Date(order.created_at).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      })
    : "—";

  const customerFees = order.customer_fees || {
    marketplace_fee: order.marketplace_fee,
    marketplace_fee_type: order.marketplace_fee_type,
    marketplace_fee_rate: order.marketplace_fee_rate,
    online_transaction_fee: order.online_transaction_fee,
    online_transaction_fee_type: order.online_transaction_fee_type,
    online_transaction_fee_rate: order.online_transaction_fee_rate,
  };

  const handleCancelDirect = async () => {
    const confirmed = await confirmDelete({
      title: "Cancel this order?",
      text: "This unpaid order will be cancelled immediately.",
      confirmButtonText: "Yes, cancel order",
    });
    if (!confirmed) return;
    setCancelLoading(true);
    try {
      await orderApi.cancel(order.id);
      setOrder((o) => (o ? { ...o, status: "cancelled" } : o));
      showSuccess?.("Order cancelled");
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Could not cancel order");
    } finally {
      setCancelLoading(false);
    }
  };

  const handleRequestCancel = async () => {
    const reason = typeof window !== "undefined" ? window.prompt("Reason for cancellation request:") : "";
    if (reason == null) return;
    if (!String(reason).trim()) {
      showError?.("Please provide a reason");
      return;
    }
    setCancelLoading(true);
    try {
      await orderApi.requestCancellation(order.id, { reason: String(reason).trim() });
      setOrder((o) => (o ? { ...o, status: "cancellation_requested" } : o));
      showSuccess?.("Cancellation requested. Waiting for seller approval.");
    } catch (e) {
      showError?.(e?.data?.message || e?.message || "Could not request cancellation");
    } finally {
      setCancelLoading(false);
    }
  };

  return (
    <div className="w-full space-y-5 pb-8">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <Link href="/customer/orders" className="text-[#1790d7] text-sm font-medium hover:underline inline-block mb-2">
            ← Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Order {order.order_number}</h1>
          <p className="text-sm text-gray-500 mt-1">Placed {orderDate}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className={`inline-flex px-3 py-1.5 rounded-[10px] text-xs font-semibold capitalize border ${statusTone(statusVal)}`}>
            Order: {formatLabel(statusVal)}
          </span>
          <span className={`inline-flex px-3 py-1.5 rounded-[10px] text-xs font-semibold capitalize border ${paymentTone(order.payment_status)}`}>
            Payment: {formatLabel(order.payment_status)}
          </span>
        </div>
      </div>

      {canPayNow && (
        <div className="p-5 border border-[#1790d7]/30 bg-[#1790d7]/5 rounded-2xl space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#1790d7]" />
                Payment pending
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Pay with <span className="font-medium">{paidByLabel(order.payment_method)}</span> to start processing.
              </p>
            </div>
          </div>
          {isJazzcashOrder && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">JazzCash mobile *</label>
                <input
                  type="tel"
                  value={payPhone}
                  onChange={(e) => setPayPhone(e.target.value)}
                  placeholder="03XXXXXXXXX"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">CNIC (last 6 or full) *</label>
                <input
                  type="text"
                  value={payCnic}
                  onChange={(e) => setPayCnic(e.target.value.replace(/\D/g, "").slice(0, 13))}
                  placeholder="Last 6 digits"
                  className="w-full px-3 py-2.5 rounded-xl border border-gray-200 text-sm bg-white"
                />
              </div>
            </div>
          )}
          <button
            type="button"
            onClick={handlePayNow}
            disabled={payLoading}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#1790d7] text-white rounded-xl font-semibold hover:bg-[#1277b8] disabled:opacity-50"
          >
            <CreditCard className="w-4 h-4" />
            {payLoading ? "Opening payment…" : "Pay now"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* LEFT — order details */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-5 min-w-0">
          <Card title="Order items" icon={Store}>
            <div className="divide-y divide-gray-100 -mx-4 sm:-mx-5">
              {paidItems.map((i) => {
                const productHref =
                  i.product_available !== false && i.product?.slug
                    ? `/product/${i.product.slug}`
                    : null;
                return (
                <div key={i.id} className="px-4 sm:px-5 py-4 flex gap-4 flex-wrap">
                  {productHref ? (
                    <Link
                      href={productHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-shrink-0"
                    >
                      <img
                        src={
                          i.image_url
                            ? i.image_url.startsWith("http")
                              ? i.image_url
                              : `${getBackendBaseUrl()}${i.image_url.startsWith("/") ? "" : "/"}${i.image_url}`
                            : "/assets/sample-image.webp"
                        }
                        alt={i.product_name}
                        className="w-20 h-20 object-cover rounded-xl bg-gray-100 border border-gray-100"
                      />
                    </Link>
                  ) : (
                    <div className="flex-shrink-0">
                      <img
                        src={
                          i.image_url
                            ? i.image_url.startsWith("http")
                              ? i.image_url
                              : `${getBackendBaseUrl()}${i.image_url.startsWith("/") ? "" : "/"}${i.image_url}`
                            : "/assets/sample-image.webp"
                        }
                        alt={i.product_name}
                        className="w-20 h-20 object-cover rounded-xl bg-gray-100 border border-gray-100"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    {productHref ? (
                      <Link
                        href={productHref}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-medium text-gray-900 hover:text-[#1790d7]"
                      >
                        {i.product_name}
                      </Link>
                    ) : (
                      <p className="font-medium text-gray-900">{i.product_name}</p>
                    )}
                    {i.store && (
                      <Link
                        href={`/seller/${i.store.slug}`}
                        className="flex items-center gap-1 text-sm text-gray-500 hover:text-[#1790d7] mt-1"
                      >
                        <Store className="w-4 h-4" />
                        {i.store.name}
                      </Link>
                    )}
                    <p className="text-sm text-gray-500 mt-1">
                      Qty: {i.quantity} × {formatPrice(parseFloat(i.price))}
                    </p>
                    {i.options?.variant_attributes &&
                      typeof i.options.variant_attributes === "object" &&
                      Object.keys(i.options.variant_attributes).length > 0 && (
                        <p className="text-xs text-gray-600 mt-0.5">
                          Variant:{" "}
                          {Object.entries(i.options.variant_attributes)
                            .map(([k, v]) => `${k}: ${v}`)
                            .join(", ")}
                        </p>
                      )}
                  </div>
                  <div className="flex flex-col items-end justify-between flex-shrink-0 gap-2">
                    <p className="font-semibold text-[#1790d7] tabular-nums">
                      {formatPrice(i.quantity * parseFloat(i.price))}
                    </p>
                    <span
                      className={`px-2 py-1 rounded-[10px] text-xs font-medium capitalize border ${statusTone(
                        i.seller_portion_status || "pending"
                      )}`}
                    >
                      Seller: {formatLabel(i.seller_portion_status || "pending")}
                    </span>
                  </div>
                </div>
                );
              })}
            </div>
          </Card>

          <Card title="Payment summary" icon={CreditCard}>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Paid through</span>
                <span className="font-medium text-gray-900">{paidByLabel(order.payment_method)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Payment status</span>
                <span className={`px-2 py-0.5 rounded-[10px] text-xs font-semibold capitalize border ${paymentTone(order.payment_status)}`}>
                  {formatLabel(order.payment_status)}
                </span>
              </div>
              {order.subtotal != null && (
                <div className="flex justify-between text-gray-600 pt-2 border-t border-gray-100">
                  <span>Order payment</span>
                  <span>{formatPrice(order.subtotal)}</span>
                </div>
              )}
              {order.shipping_cost != null && parseFloat(order.shipping_cost) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span>{formatPrice(order.shipping_cost)}</span>
                </div>
              )}
              {(order.coupon_code ||
                order.coupon?.code ||
                (order.discount_amount != null && parseFloat(order.discount_amount) > 0)) && (
                <div className="flex justify-between text-emerald-600">
                  <span>
                    Discount
                    {order.coupon_code
                      ? ` (${order.coupon_code})`
                      : order.coupon?.code
                        ? ` (${order.coupon.code})`
                        : ""}
                  </span>
                  <span>−{formatPrice(order.discount_amount || 0)}</span>
                </div>
              )}
              {parseFloat(customerFees.marketplace_fee || 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>
                    {feeLabel(
                      "Marketplace fee",
                      customerFees.marketplace_fee_type,
                      customerFees.marketplace_fee_rate
                    )}
                  </span>
                  <span>{formatPrice(customerFees.marketplace_fee)}</span>
                </div>
              )}
              {parseFloat(customerFees.online_transaction_fee || 0) > 0 && (
                <div className="flex justify-between text-gray-600">
                  <span>
                    {feeLabel(
                      "Online transaction fee",
                      customerFees.online_transaction_fee_type,
                      customerFees.online_transaction_fee_rate
                    )}
                  </span>
                  <span>{formatPrice(customerFees.online_transaction_fee)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-semibold pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-[#1790d7] tabular-nums">{formatPrice(order.total)}</span>
              </div>
              {Number(order.refunded_total || 0) > 0 && (
                <div className="pt-2 mt-1 border-t border-dashed border-gray-200 space-y-2">
                  <div className="flex justify-between text-sm text-emerald-700">
                    <span>
                      Refund
                      {Array.isArray(order.refunds_summary) && order.refunds_summary.length === 1
                        ? " (seller rejected)"
                        : Array.isArray(order.refunds_summary) && order.refunds_summary.length > 1
                          ? ` (${order.refunds_summary.length} refunds)`
                          : " (seller rejected)"}
                    </span>
                    <span className="font-medium tabular-nums">−{formatPrice(order.refunded_total)}</span>
                  </div>
                  {Array.isArray(order.refunds_summary) &&
                    order.refunds_summary
                      .filter((r) => r.status === "completed" || r.status === "pending")
                      .map((r) => (
                        <p key={r.id} className="text-xs text-gray-500 pl-0.5">
                          {formatPrice(r.amount)}
                          {r.reason ? ` — ${r.reason}` : ""}
                        </p>
                      ))}
                  <div className="flex justify-between text-base font-semibold pt-1">
                    <span>Order total now</span>
                    <span className="text-[#1790d7] tabular-nums">
                      {formatPrice(
                        order.remaining_total != null
                          ? order.remaining_total
                          : Math.max(0, Number(order.total || 0) - Number(order.refunded_total || 0))
                      )}
                    </span>
                  </div>
                </div>
              )}
              {(parseFloat(order.online_amount || 0) > 0 || parseFloat(order.cod_amount || 0) > 0) && (
                <div className="pt-2 border-t border-gray-100 space-y-1">
                  {parseFloat(order.online_amount || 0) > 0 && (
                    <div className="flex justify-between text-gray-600">
                      <span>
                        Paid online
                        {order.partial_payment_percent ? ` (${order.partial_payment_percent}%)` : ""}
                      </span>
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
          </Card>

          {canUpdateNotes && (
            <Card title="Order notes" icon={AlertCircle}>
              {editingNotes ? (
                <div className="space-y-2">
                  <textarea
                    value={customerNotes}
                    onChange={(e) => setCustomerNotes(e.target.value)}
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                    placeholder="Special instructions for this order..."
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={saveNotes}
                      disabled={notesSaving}
                      className="px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm font-medium hover:bg-[#1277b8] disabled:opacity-50"
                    >
                      {notesSaving ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setEditingNotes(false);
                        setCustomerNotes(order.customer_notes ?? "");
                      }}
                      className="px-4 py-2 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 text-sm">
                  {order.customer_notes ? order.customer_notes : "No notes."}
                  <button
                    type="button"
                    onClick={() => setEditingNotes(true)}
                    className="ml-2 text-[#1790d7] hover:underline font-medium"
                  >
                    Edit
                  </button>
                </p>
              )}
            </Card>
          )}

          {order.status !== "cancelled" && order.status !== "pending" && (
            <Card title="Disputes & returns" icon={AlertCircle}>
              <div className="space-y-2 text-sm text-gray-600">
                <p>
                  Once delivered, you can request a return/refund below. For escalation issues, open a dispute on the
                  entire order.
                </p>
                <Link
                  href={`/customer/disputes/new?order_id=${order.id}`}
                  className="inline-flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 font-medium"
                >
                  <AlertCircle className="w-4 h-4" />
                  Open Dispute
                </Link>
              </div>
            </Card>
          )}

          {canReview && reviewableItems.length > 0 && (
            <Card title="Write a product review" icon={Star}>
              <p className="text-sm text-gray-500 mb-4">
                Rate products from this order. Reviews appear after admin approval.
              </p>
              {!showReviewForm ? (
                <button
                  type="button"
                  onClick={() => {
                    selectAllProducts();
                    setShowReviewForm(true);
                  }}
                  className="px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm font-medium hover:bg-[#1277b8]"
                >
                  Add review
                </button>
              ) : (
                <form onSubmit={submitReview} className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="block text-sm font-medium text-gray-700">Products to review</label>
                      <button type="button" onClick={selectAllProducts} className="text-xs text-[#1790d7] hover:underline">
                        Select all
                      </button>
                    </div>
                    <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-100 rounded-xl p-3">
                      {reviewableItems.map((i) => (
                        <label key={i.id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedProductIds.includes(i.product_id)}
                            onChange={() => toggleProduct(i.product_id)}
                            className="rounded border-gray-300 text-[#1790d7]"
                          />
                          <span className="text-sm text-gray-800">{i.product_name}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <button key={i} type="button" onClick={() => setReviewRating(i)} className="p-1">
                          <Star className={`w-8 h-8 ${i <= reviewRating ? "text-amber-400 fill-amber-400" : "text-gray-300"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title (optional)</label>
                    <input
                      type="text"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                      placeholder="Summarize your experience"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Review</label>
                    <textarea
                      value={reviewBody}
                      onChange={(e) => setReviewBody(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl text-sm"
                      placeholder="Share details about quality, shipping, and overall experience"
                      required
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      disabled={reviewSubmitting}
                      className="px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm font-medium disabled:opacity-50"
                    >
                      {reviewSubmitting ? "Submitting..." : "Submit review"}
                    </button>
                    <button type="button" onClick={() => setShowReviewForm(false)} className="px-4 py-2 text-gray-600 text-sm">
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </Card>
          )}
          {canReview && reviewableItems.length === 0 && reviewedProductIds.length > 0 && (
            <div className="p-4 bg-emerald-50 border border-emerald-100 rounded-2xl text-sm text-emerald-800">
              Thanks — your review was submitted and will show after admin approval.
            </div>
          )}

          {(order.status === "delivered" ||
            order.status === "completed" ||
            ["delivered", "completed"].includes(order.complete_order_status)) &&
            order.status !== "refunded" && (
              <Card title="Request return or refund" icon={RotateCcw}>
                {order.has_open_dispute && (
                  <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-3">
                    You have an open dispute for this order. Refunds may be handled through dispute resolution.
                  </p>
                )}
                {order.has_pending_refund && (
                  <p className="text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 mb-3">
                    You already have a pending refund request. Support will process it.
                  </p>
                )}
                <p className="text-sm text-gray-500 mb-3">Request full or partial amount.</p>
                <div className="flex flex-wrap gap-2 items-end">
                  <div className="flex-1 min-w-[120px]">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Amount</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder={String(parseFloat(order.total) || "")}
                      value={refundAmount}
                      onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      const amount = refundAmount ? parseFloat(refundAmount) : parseFloat(order.total);
                      if (!amount || amount <= 0) {
                        showError?.("Enter a valid amount or leave blank for full refund");
                        return;
                      }
                      setRefundLoading(true);
                      try {
                        await refundApi.request({
                          order_id: order.id,
                          amount,
                          reason: "Customer return/refund request",
                        });
                        setRefundAmount("");
                        setOrder((o) => o && { ...o, refund_requested: true });
                        showSuccess?.("Refund request submitted");
                      } catch (e) {
                        showError?.(e?.data?.message || e?.message || "Failed to submit request");
                      } finally {
                        setRefundLoading(false);
                      }
                    }}
                    disabled={refundLoading}
                    className="px-4 py-2 bg-amber-500 text-white rounded-xl hover:bg-amber-600 disabled:opacity-50 font-medium"
                  >
                    {refundLoading ? "Submitting..." : "Request return / refund"}
                  </button>
                </div>
              </Card>
            )}
        </div>

        {/* RIGHT — actions, courier, address, timeline */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-5 lg:sticky lg:top-4">
          {(canCancelDirect || canRequestCancel || order.status === "cancellation_requested") && (
            <Card title="Order actions">
              <div className="space-y-3">
                {canCancelDirect && (
                  <button
                    type="button"
                    onClick={handleCancelDirect}
                    disabled={cancelLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-red-200 rounded-xl text-red-700 bg-red-50 hover:bg-red-100 font-medium disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {cancelLoading ? "Cancelling..." : "Cancel order"}
                  </button>
                )}
                {canRequestCancel && (
                  <button
                    type="button"
                    onClick={handleRequestCancel}
                    disabled={cancelLoading}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-amber-200 rounded-xl text-amber-800 bg-amber-50 hover:bg-amber-100 font-medium disabled:opacity-50"
                  >
                    <XCircle className="w-4 h-4" />
                    {cancelLoading ? "Submitting…" : "Request cancellation"}
                  </button>
                )}
                {order.status === "cancellation_requested" && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
                    Cancellation requested — waiting for the seller.
                    {order.cancellation_reason && (
                      <p className="mt-1 text-amber-700">Reason: {order.cancellation_reason}</p>
                    )}
                  </div>
                )}
              </div>
            </Card>
          )}

          <Card title="Sellers & courier" icon={Truck}>
            {Array.isArray(order.seller_groups) && order.seller_groups.length > 0 ? (
              <div className="space-y-3">
                {order.seller_groups.map((g) => {
                  const s = g.shipment;
                  const deliveryStatus = g.status || s?.status || "processing";
                  const isRejected = deliveryStatus === "rejected" || deliveryStatus === "cancelled";
                  return (
                    <div
                      key={g.key}
                      className={`p-3.5 rounded-xl border space-y-2 ${
                        isRejected
                          ? "border-red-100 bg-red-50/70"
                          : "border-blue-100 bg-blue-50/60"
                      }`}
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-sm font-semibold text-gray-900">{g.name || "Seller"}</p>
                        <span
                          className={`inline-flex px-2.5 py-1 rounded-[10px] text-xs font-semibold capitalize border ${
                            isRejected ? statusTone("cancelled") : courierStatusTone(deliveryStatus)
                          }`}
                        >
                          {formatLabel(deliveryStatus)}
                        </span>
                      </div>
                      {g.product_names?.length > 0 && (
                        <p className="text-xs text-gray-500">Items: {g.product_names.join(", ")}</p>
                      )}
                      {isRejected ? (
                        <>
                          {g.rejection_reason && (
                            <p className="text-sm text-red-800">Reason: {g.rejection_reason}</p>
                          )}
                          {g.refund_amount != null && Number(g.refund_amount) > 0 && (
                            <p className="text-sm font-medium text-emerald-700">
                              Refunded to wallet: {formatPrice(g.refund_amount)}
                            </p>
                          )}
                        </>
                      ) : s ? (
                        <>
                          <p className="text-sm text-gray-700">
                            Tracking ID:{" "}
                            <span className="font-mono font-medium text-[#1790d7]">
                              {s.courier_cn || getCourierCn(s) || s.tracking_number || "Pending"}
                            </span>
                          </p>
                          {s.carrier && (
                            <p className="text-sm text-gray-600">
                              Courier: <span className="font-medium capitalize">{s.carrier}</span>
                            </p>
                          )}
                          {hasCourierTracking(s) && (
                            <button
                              type="button"
                              onClick={() => {
                                openCourierTracking(s);
                                showSuccess("Tracking ID copied. Paste it on the courier tracking page.");
                              }}
                              className="inline-flex items-center gap-1 mt-1 px-3 py-1.5 bg-[#1790d7] text-white text-sm font-medium rounded-lg hover:bg-[#1277b8]"
                            >
                              Track shipment →
                            </button>
                          )}
                        </>
                      ) : (
                        <p className="text-sm text-gray-500">
                          {deliveryStatus === "approved"
                            ? "Seller approved — waiting for courier tracking."
                            : "Waiting for this seller to approve and ship."}
                        </p>
                      )}
                    </div>
                  );
                })}
                {Array.isArray(order.refunds_summary) && order.refunds_summary.length > 0 && (
                  <div className="pt-2 border-t border-gray-100 space-y-1">
                    <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Refunds</p>
                    {order.refunds_summary.map((r) => (
                      <p key={r.id} className="text-sm text-gray-700">
                        {formatPrice(r.amount)} · {formatLabel(r.status)}
                        {r.reason ? ` — ${r.reason}` : ""}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : hasCourier ? (
              <div className="space-y-3">
                {order.shipments?.length > 0 ? (
                  order.shipments.map((s) => {
                    const deliveryStatus = s.status || s.lcs_status || "pending";
                    return (
                      <div key={s.id} className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-900">
                            {s.store?.name || s.store_name || "Shipment"}
                          </p>
                          <span
                            className={`inline-flex px-2.5 py-1 rounded-[10px] text-xs font-semibold capitalize border ${courierStatusTone(
                              deliveryStatus
                            )}`}
                          >
                            {formatLabel(deliveryStatus)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700">
                          Tracking ID:{" "}
                          <span className="font-mono font-medium text-[#1790d7]">
                            {getCourierCn(s) || s.tracking_number || "Pending"}
                          </span>
                        </p>
                        {s.carrier && (
                          <p className="text-sm text-gray-600">
                            Courier: <span className="font-medium capitalize">{s.carrier}</span>
                          </p>
                        )}
                        {s.product_names?.length > 0 && (
                          <p className="text-xs text-gray-500">Products: {s.product_names.join(", ")}</p>
                        )}
                        {hasCourierTracking(s) && (
                          <button
                            type="button"
                            onClick={() => {
                              openCourierTracking(s);
                              showSuccess("Tracking ID copied. Paste it on the courier tracking page.");
                            }}
                            className="inline-flex items-center gap-1 mt-1 px-3 py-1.5 bg-[#1790d7] text-white text-sm font-medium rounded-lg hover:bg-[#1277b8]"
                          >
                            Track shipment →
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="p-3.5 rounded-xl border border-blue-100 bg-blue-50/60 space-y-2">
                    {order.tracking_number && (
                      <p className="text-sm text-gray-700">
                        Tracking ID:{" "}
                        <span className="font-mono font-medium text-[#1790d7]">{order.tracking_number}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">
                Each seller ships separately. Courier details appear here once a seller adds tracking.
              </p>
            )}
          </Card>

          <Card title="Shipping address" icon={MapPin}>
            {order.shipping_address ? (
              <div className="text-sm text-gray-700 space-y-1 leading-relaxed">
                <p className="font-semibold text-gray-900">
                  {order.shipping_address.first_name} {order.shipping_address.last_name}
                </p>
                <p>
                  {order.shipping_address.address_line_1}
                  {order.shipping_address.address_line_2 && `, ${order.shipping_address.address_line_2}`}
                </p>
                <p>
                  {order.shipping_address.city}
                  {order.shipping_address.state && `, ${order.shipping_address.state}`}
                  {order.shipping_address.zip_code || order.shipping_address.postal_code
                    ? ` ${order.shipping_address.zip_code || order.shipping_address.postal_code}`
                    : ""}
                </p>
                <p>{order.shipping_address.country}</p>
                {order.shipping_address.phone && (
                  <p className="pt-1 text-gray-600">Phone: {order.shipping_address.phone}</p>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No shipping address on this order.</p>
            )}
          </Card>

          <Card title="Order timeline" icon={Clock}>
            {order.timeline && order.timeline.length > 0 ? (
              <ul className="space-y-3">
                {order.timeline.map((t, idx) => (
                  <li key={t.id || idx} className="flex gap-3 text-sm">
                    <span className="mt-1.5 w-2 h-2 rounded-full bg-[#1790d7] shrink-0" />
                    <div className="min-w-0">
                      <p className="font-medium capitalize text-gray-900">{formatLabel(t.status)}</p>
                      {t.note && <p className="text-gray-600 mt-0.5">{t.note}</p>}
                      <p className="text-xs text-gray-400 mt-0.5">
                        {t.created_at ? new Date(t.created_at).toLocaleString() : ""}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Timeline updates will show here as the order progresses.</p>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
