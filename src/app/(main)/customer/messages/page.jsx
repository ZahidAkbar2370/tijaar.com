"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import PageHero from "@/components/customer/PageHero";
import MessagesInbox from "@/components/chat/MessagesInbox";

function MessagesPageContent() {
  const searchParams = useSearchParams();
  const productId = searchParams.get("product_id");
  const conversationId = searchParams.get("c") || searchParams.get("id");

  return (
    <div className="space-y-5">
      <PageHero
        title="Messages"
        description="Chat with sellers about products. Each product has its own conversation thread."
        illustration="messages"
        guide="Tip: Use Message on a product page to open chat with the product preview sent automatically."
      />
      <MessagesInbox
        autoStartProductId={productId}
        initialConversationId={conversationId ? parseInt(conversationId, 10) : null}
      />
    </div>
  );
}

export default function MessagesPage() {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="h-96 bg-gray-100 rounded-2xl animate-pulse" />}>
        <MessagesPageContent />
      </Suspense>
    </ProtectedRoute>
  );
}
