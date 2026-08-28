"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHero from "@/components/customer/PageHero";
import MessagesInbox from "@/components/chat/MessagesInbox";

export default function VendorMessagesPage() {
  return (
    <ProtectedRoute requiredRole="seller">
      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
        <VendorMessagesContent />
      </Suspense>
    </ProtectedRoute>
  );
}

function VendorMessagesContent() {
  const searchParams = useSearchParams();
  const conversationId = searchParams.get("c") || searchParams.get("id");

  return (
    <div className="space-y-5">
      <PageHero
        title="Messages"
        description="Chat with buyers about your products. Each product has its own conversation thread."
        illustration="messages"
      />
      <MessagesInbox initialConversationId={conversationId ? parseInt(conversationId, 10) : null} />
    </div>
  );
}
