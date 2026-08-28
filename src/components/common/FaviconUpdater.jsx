"use client";

import { useEffect } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

function upsertLink(rel, href) {
  if (!href || typeof document === "undefined") return;
  const selector = rel === "icon" ? 'link[rel="icon"]' : `link[rel="${rel}"]`;
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement("link");
    el.rel = rel;
    document.head.appendChild(el);
  }
  if (el.getAttribute("href") !== href) {
    el.setAttribute("href", href);
  }
}

export default function FaviconUpdater() {
  const { favicon_url } = useSiteSettings();

  useEffect(() => {
    const fallback = `${(process.env.NEXT_PUBLIC_API_URL || "https://back.tijaar.com/api/v1").replace(/\/api\/v1\/?$/, "")}/images/tijaar-logo.png`;
    const href = favicon_url || fallback;
    upsertLink("icon", href);
    upsertLink("shortcut icon", href);
    upsertLink("apple-touch-icon", href);
  }, [favicon_url]);

  return null;
}
