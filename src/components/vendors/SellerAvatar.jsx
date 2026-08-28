"use client";

import { Store } from "lucide-react";
import { useSiteSettings } from "@/context/SiteSettingsContext";

/**
 * Seller/store logo with a professional marketplace-style fallback
 * using the Tijaar favicon when no profile image is set.
 */
export default function SellerAvatar({
  src,
  alt = "Seller",
  className = "w-16 h-16",
  iconClassName = "w-8 h-8",
  rounded = "rounded-xl",
}) {
  const { favicon_url, favicon_alt, site_name } = useSiteSettings();
  const fallbackSrc = favicon_url || "/favicon.ico";

  if (src) {
    return (
      <div className={`${className} ${rounded} bg-white overflow-hidden flex items-center justify-center`}>
        <img src={src} alt={alt} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${className} ${rounded} relative overflow-hidden flex items-center justify-center bg-gradient-to-br from-[#e8f4fc] to-[#d6ebf8] border border-[#1790d7]/15`}
      aria-label={alt || site_name || "Tijaar seller"}
    >
      <Store className={`${iconClassName} text-[#1790d7]/25 absolute`} aria-hidden />
      <img
        src={fallbackSrc}
        alt={favicon_alt || "Tijaar"}
        className="relative z-[1] w-[55%] h-[55%] object-contain"
      />
    </div>
  );
}
