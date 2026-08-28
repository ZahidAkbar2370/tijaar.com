"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Send } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { disputeApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

export default function VendorDisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const [dispute, setDispute] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const { showSuccess, showError } = useSnackbar();

  useEffect(() => {
    if (!id) return;
    disputeApi.get(id).then((r) => setDispute(r.dispute)).catch(() => router.replace("/seller/disputes")).finally(() => setLoading(false));
  }, [id, router]);

  const handleRespond = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;
    setSending(true);
    try {
      await disputeApi.respond(id, newMessage.trim());
      setNewMessage("");
      showSuccess?.("Response sent");
      const r = await disputeApi.get(id);
      setDispute(r.dispute);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12"><div className="animate-pulse h-64 bg-gray-100 rounded-xl" /></div>;
  if (!dispute) return null;

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/seller/disputes" className="text-[#1790d7] text-sm hover:underline mb-4 inline-block">← Back</Link>
        <div className="flex justify-between items-start mb-6">
          <h1 className="text-xl font-bold text-gray-900">{dispute.dispute_number}</h1>
          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
            dispute.status === "resolved" ? "bg-emerald-100 text-emerald-700" :
            dispute.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
          }`}>
            {dispute.status}
          </span>
        </div>
        <p className="text-gray-600 mb-6">Order #{dispute.order?.order_number} • {dispute.type}</p>

        {(dispute.reason || dispute.description) && (
          <div className="mb-6 p-4 rounded-xl bg-gray-50 border border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-2">Dispute details</h2>
            {dispute.reason && <p className="text-gray-900 font-medium mb-1">{dispute.reason}</p>}
            {dispute.description && <p className="text-gray-600 text-sm whitespace-pre-wrap">{dispute.description}</p>}
          </div>
        )}

        <div className="space-y-4 mb-8">
          {dispute.messages?.map((m) => (
            <div key={m.id} className={`p-4 rounded-xl ${m.is_admin ? "bg-blue-50 border border-blue-100" : "bg-gray-50"}`}>
              <p className="text-sm text-gray-600">{m.user?.name} {m.is_admin && "(Admin)"}</p>
              <p className="mt-1">{m.body}</p>
              <p className="text-xs text-gray-400 mt-2">{new Date(m.created_at).toLocaleString()}</p>
            </div>
          ))}
        </div>

        {!["resolved", "rejected"].includes(dispute.status) && (
          <form onSubmit={handleRespond} className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Respond to dispute..."
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200"
            />
            <button type="submit" disabled={sending} className="px-4 py-3 bg-amber-500 text-white rounded-xl">
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}
