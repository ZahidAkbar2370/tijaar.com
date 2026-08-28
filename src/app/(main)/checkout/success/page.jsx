"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { orderApi } from "@/lib/api";

function CheckoutSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get("order_id");
  const paymentHint = searchParams?.get("payment"); // failed | pending | (omit = paid path)
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [payError, setPayError] = useState(null);

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? sessionStorage.getItem("checkout_payment_error") : null;
      if (raw) {
        setPayError(JSON.parse(raw));
        sessionStorage.removeItem("checkout_payment_error");
      }
    } catch (_) {}
  }, []);

  useEffect(() => {
    if (!orderId) {
      setLoading(false);
      return;
    }
    orderApi
      .get(orderId)
      .then((res) => setOrder(res.order))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  if (loading) {
    return (
      <div className="min-h-[50vh] flex flex-col items-center justify-center">
        <div className="animate-pulse text-center">
          <div className="w-16 h-16 bg-[#1790d7]/20 rounded-full mx-auto mb-4" />
          <p className="text-gray-500">Loading...</p>
        </div>
      </div>
    );
  }

  const status = order?.payment_status || "";
  const isFailed =
    paymentHint === "failed" || status === "failed" || status === "unpaid";
  const isPending =
    !isFailed &&
    (paymentHint === "pending" || status === "pending");
  const isPartial = status === "partial_paid";
  const isPaid = status === "paid" || isPartial;

  let title = "Order placed";
  let subtitle = order
    ? `Thank you. Order #${order.order_number}`
    : "Thank you for your order.";
  let iconBg = "bg-emerald-100";
  let iconColor = "text-emerald-600";

  if (isFailed) {
    title = "Payment failed";
    subtitle =
      payError?.message ||
      (order
        ? `Order #${order.order_number} was created but JazzCash payment did not go through. Please verify your mobile number and CNIC, then try again.`
        : "Your JazzCash payment did not go through. Please verify mobile number and CNIC and try again.");
    iconBg = "bg-red-100";
    iconColor = "text-red-600";
  } else if (isPending && !isPaid) {
    title = "Payment pending";
    subtitle = order
      ? `Order #${order.order_number} is awaiting JazzCash confirmation.`
      : "Your order is awaiting payment confirmation.";
    iconBg = "bg-amber-100";
    iconColor = "text-amber-600";
  } else if (isPartial) {
    title = "Online Payment Received";
  } else if (isPaid) {
    title = "Payment Successful";
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-16 text-center">
      <div className={`w-20 h-20 ${iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
        {isFailed ? (
          <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className={`w-10 h-10 ${iconColor}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <h1 className="text-2xl font-bold text-gray-900 mb-2">{title}</h1>
      <p className="text-gray-600 mb-4 whitespace-pre-wrap">{subtitle}</p>
      {isFailed && (payError?.response_code || payError?.mobile_sent) && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-left text-sm text-red-900 space-y-1">
          {payError.response_code && (
            <p>
              <span className="font-medium">JazzCash code:</span> {payError.response_code}
            </p>
          )}
          {payError.mobile_sent && (
            <p>
              <span className="font-medium">Sent mobile:</span> {payError.mobile_sent}
            </p>
          )}
          {payError.cnic_sent && (
            <p>
              <span className="font-medium">Sent CNIC (last 6):</span> {payError.cnic_sent}
            </p>
          )}
        </div>
      )}
      {isPartial && parseFloat(order?.cod_amount) > 0 && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-left text-sm">
          <p className="font-medium text-amber-900">Partial payment complete</p>
          <p className="text-amber-800 mt-1">
            You paid {order.online_amount != null ? `Rs ${Number(order.online_amount).toLocaleString()}` : "the online portion"} via JazzCash.
            Pay <strong>Rs {Number(order.cod_amount).toLocaleString()}</strong> in cash on delivery.
          </p>
        </div>
      )}
      <Link
        href={order ? `/customer/orders/${order.id}` : "/customer/orders"}
        className="inline-flex items-center gap-2 px-6 py-3 bg-[#1790d7] text-white font-medium rounded-xl hover:bg-[#1277b8] transition"
      >
        View Order
      </Link>
      <Link href="/shop" className="block mt-4 text-gray-500 hover:text-[#1790d7]">
        Continue shopping
      </Link>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-[50vh] flex items-center justify-center"><div className="animate-pulse text-center"><div className="w-16 h-16 bg-[#1790d7]/20 rounded-full mx-auto mb-4" /><p className="text-gray-500">Loading...</p></div></div>}>
      <CheckoutSuccessContent />
    </Suspense>
  );
}
