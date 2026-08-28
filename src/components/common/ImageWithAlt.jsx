"use client";

import { resolveImageAlt } from "@/lib/imageAlt";

/** img with optional API alt and static fallback when missing. */
export default function ImageWithAlt({ src, alt, fallback = "Image", className, ...props }) {
  if (!src) return null;
  return <img src={src} alt={resolveImageAlt(alt, fallback)} className={className} {...props} />;
}
