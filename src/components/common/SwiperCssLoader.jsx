"use client";

import { useEffect } from "react";

let loaded = false;

export function loadSwiperStyles() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  void import("@/styles/swiper.css");
}

/** Load Swiper CSS after first paint so it is not render-blocking. */
export default function SwiperCssLoader() {
  useEffect(() => {
    const run = () => loadSwiperStyles();
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(run, { timeout: 2000 });
      return () => window.cancelIdleCallback(id);
    }
    const id = window.setTimeout(run, 1);
    return () => window.clearTimeout(id);
  }, []);

  return null;
}
