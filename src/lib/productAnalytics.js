/**
 * Fire-and-forget product engagement tracking (impression / click / share).
 * Uses a stable browser session id so the API can lightly dedupe refreshes.
 */

import { productApi } from "@/lib/api";

const SESSION_KEY = "tijaar_analytics_sid";

function getSessionId() {
  if (typeof window === "undefined") return "ssr";
  try {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

/** In-memory set so the same card doesn't fire impression twice in one page view. */
const seenImpressions = new Set();

export function trackProductEvent(productId, event) {
  const id = Number(productId);
  if (!id || !["impression", "click", "share"].includes(event)) return;

  if (event === "impression") {
    if (seenImpressions.has(id)) return;
    seenImpressions.add(id);
  }

  try {
    productApi.trackAnalytics(id, event, getSessionId()).catch(() => {});
  } catch {
    // ignore
  }
}
