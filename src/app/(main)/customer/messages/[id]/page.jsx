"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/** Legacy route — redirect to split inbox with selected conversation. */
export default function ConversationRedirectPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;

  useEffect(() => {
    if (id) router.replace(`/customer/messages?c=${id}`);
    else router.replace("/customer/messages");
  }, [id, router]);

  return null;
}
