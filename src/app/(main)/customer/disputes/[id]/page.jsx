"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Send } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { disputeApi } from "@/lib/api";
import useAuth from "@/hooks/useAuth";
import { useSnackbar } from "@/context/SnackbarContext";

export default function DisputeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { user } = useAuth();
  const { showSuccess, showError } = useSnackbar();
  const [dispute, setDispute] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (!id) return;
    disputeApi.get(id).then((r) => setDispute(r.dispute)).catch(() => router.replace("/customer/disputes")).finally(() => setLoading(false));
  }, [id, router]);

  const isBuyer = dispute && user && Number(dispute.user_id) === Number(user.id);
  const isSellerSide = dispute && user && !isBuyer;

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !id) return;
    setSending(true);
    try {
      if (isSellerSide && dispute.status === "open") {
        await disputeApi.respond(id, newMessage.trim());
        showSuccess?.("Seller response sent");
      } else if (isBuyer) {
        await disputeApi.addMessage(id, newMessage.trim());
        showSuccess?.("Message sent");
      } else if (isSellerSide) {
        // After first respond, seller can still use respond only when open; otherwise show error
        await disputeApi.respond(id, newMessage.trim());
        showSuccess?.("Response sent");
      }
      setNewMessage("");
      const r = await disputeApi.get(id);
      setDispute(r.dispute);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed to send");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <div className="max-w-2xl mx-auto px-4 py-12"><div className="animate-pulse h-64 bg-gray-100 rounded-xl" /></div>;
  if (!dispute) return null;

  const canReply =
    !["resolved", "rejected"].includes(dispute.status) &&
    (isBuyer || (isSellerSide && dispute.status === "open"));

  return (
    <ProtectedRoute>
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link href="/customer/disputes" className="text-[#1790d7] text-sm hover:underline mb-4 inline-block">← Back</Link>
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{dispute.dispute_number}</h1>
            {isSellerSide && (
              <p className="text-xs font-medium text-[#1790d7] mt-1">Replying as seller</p>
            )}
          </div>
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

        {canReply && (
          <form onSubmit={handleSend} className="flex gap-2">
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={isSellerSide ? "Reply as seller…" : "Add a message…"}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200"
            />
            <button type="submit" disabled={sending} className="px-4 py-3 bg-[#1790d7] text-white rounded-xl">
              <Send className="w-5 h-5" />
            </button>
          </form>
        )}
      </div>
    </ProtectedRoute>
  );
}
