"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { MessageSquare } from "lucide-react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { conversationApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";

function NewMessageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showSuccess, showError } = useSnackbar();
  const sellerId = searchParams.get("seller_id");
  const productId = searchParams.get("product_id");
  const productName = searchParams.get("product") || "";
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!sellerId) router.replace("/customer/messages");
  }, [sellerId, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!message.trim() || !sellerId) return;
    setSubmitting(true);
    try {
      const res = await conversationApi.create({
        seller_id: parseInt(sellerId, 10),
        product_id: productId ? parseInt(productId, 10) : null,
        message: message.trim(),
      });
      showSuccess?.("Message sent!");
      router.replace(`/customer/messages/${res.conversation.id}`);
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (!sellerId) return null;

  return (
    <ProtectedRoute>
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link href="/customer/messages" className="text-[#1790d7] text-sm hover:underline mb-6 inline-block">← Back</Link>
        <h1 className="text-xl font-bold text-gray-900 mb-2 flex items-center gap-2">
          <MessageSquare className="w-5 h-5" />
          New Message
        </h1>
        {productName && <p className="text-gray-500 mb-6">Re: {productName}</p>}

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <label className="block text-sm font-medium text-gray-700 mb-2">Your message</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={4}
            placeholder="Type your message..."
            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
            required
          />
          <button
            type="submit"
            disabled={submitting}
            className="mt-4 w-full py-3 bg-[#1790d7] text-white rounded-xl font-medium disabled:opacity-50"
          >
            {submitting ? "Sending..." : "Send Message"}
          </button>
        </form>
      </div>
    </ProtectedRoute>
  );
}

export default function NewMessagePage() {
  return (
    <Suspense fallback={<div className="max-w-lg mx-auto px-4 py-12 animate-pulse"><div className="h-8 bg-gray-200 rounded w-1/3 mb-6" /><div className="h-48 bg-gray-100 rounded-2xl" /></div>}>
      <NewMessageContent />
    </Suspense>
  );
}
