"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { disputeApi, orderApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

function NewDisputeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");
  const { showSuccess, showError } = useSnackbar();
  const [order, setOrder] = useState(null);
  const [form, setForm] = useState({ type: "refund", reason: "", description: "" });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (orderId) orderApi.get(orderId).then((r) => setOrder(r.order)).catch(() => setOrder(null));
    else router.replace("/customer/orders");
  }, [orderId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.description?.trim() || !orderId) return;
    setSubmitting(true);
    try {
      const res = await disputeApi.create({
        order_id: parseInt(orderId, 10),
        type: form.type,
        reason: form.reason || null,
        description: form.description.trim(),
      });
      showSuccess?.("Dispute opened");
      router.replace(`/customer/disputes/${res.dispute.id}`);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!orderId) return null;

  return (
    <ProtectedRoute>
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/customer/disputes" className="text-[#1790d7] text-sm hover:underline mb-6 inline-block">← Back</Link>
        <h1 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          Open Dispute
        </h1>
        {order && <p className="text-gray-500 mb-4">Order #{order.order_number}</p>}

        <div className="mb-6 p-4 bg-amber-50 border border-amber-100 rounded-xl text-sm text-gray-700">
          <p className="font-medium text-amber-800 mb-1">When to use a dispute</p>
          <p className="mb-2">Disputes are for orders that are already paid or shipped. For <strong>pending or unpaid</strong> orders, cancel from the order detail page instead.</p>
          <p className="mb-2">A dispute applies to the <strong>whole order</strong>. If your order has items from multiple sellers, the dispute covers the entire order; our team will handle return/refund per seller when resolving it.</p>
          <p className="text-gray-600">After you submit, the seller can respond. Our support team will review and may issue refunds or guide the return flow.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
            <select
              value={form.type}
              onChange={(e) => setForm((p) => ({ ...p, type: e.target.value }))}
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
            >
              <option value="refund">Refund</option>
              <option value="return">Return</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Reason (optional)</label>
            <input
              type="text"
              value={form.reason}
              onChange={(e) => setForm((p) => ({ ...p, reason: e.target.value }))}
              placeholder="e.g. Wrong item received"
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              rows={4}
              placeholder="Describe your issue..."
              className="w-full px-4 py-3 rounded-xl border border-gray-200"
              required
            />
          </div>
          <button type="submit" disabled={submitting} className="w-full py-3 bg-[#1790d7] text-white rounded-xl font-medium disabled:opacity-50">
            {submitting ? "Submitting..." : "Submit Dispute"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}

export default function NewDisputePage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /><div className="h-64 bg-gray-100 rounded-2xl" /></div>}>
      <NewDisputeContent />
    </Suspense>
  );
}
