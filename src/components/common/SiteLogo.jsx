"use client";

import Link from "next/link";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { optimizeImageUrl, IMAGE_WIDTHS, LOCAL_LOGO_PNG, LOCAL_LOGO_WEBP } from "@/lib/imageOptimize";

const VARIANTS = {
  header: "site-logo-wrap site-logo-wrap--header",
  footer: "site-logo-wrap site-logo-wrap--footer",
};

function handleLogoError(e) {
  const img = e.target;
  if (!img.src.includes(LOCAL_LOGO_PNG) && !img.src.endsWith(LOCAL_LOGO_WEBP)) {
    img.src = LOCAL_LOGO_WEBP;
    return;
  }
  if (!img.src.includes(LOCAL_LOGO_PNG)) {
    img.src = LOCAL_LOGO_PNG;
  }
}

export default function SiteLogo({ variant = "header", className = "", priority = false }) {
  const { site_logo_url, site_name, site_logo_alt } = useSiteSettings();
  const wrapClass = `${VARIANTS[variant] || VARIANTS.header} shrink-0 hover:opacity-90 transition-opacity ${className}`.trim();

  return (
    <Link href="/" className={wrapClass} aria-label={site_name || "Tijaar home"}>
      <img
        src={optimizeImageUrl(site_logo_url || LOCAL_LOGO_WEBP, { width: IMAGE_WIDTHS.siteLogo, quality: 85 })}
        alt={resolveImageAlt(site_logo_alt, site_name || IMAGE_ALT_FALLBACKS.siteLogo)}
        width={140}
        height={36}
        sizes="140px"
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : undefined}
        decoding="async"
        onError={handleLogoError}
      />
    </Link>
  );
}
