"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function SellerConversationRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) router.replace(`/seller/messages?c=${id}`);
    else router.replace("/seller/messages");
  }, [id, router]);

  return null;
}
