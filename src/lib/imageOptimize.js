import { getBackendBaseUrl } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";

/** Display-size presets matched to rendered CSS sizes (≈1.25× for crispness). */
export const IMAGE_WIDTHS = {
  productCard: 220,
  productFeatured: 640,
  categoryIcon: 80,
  categoryNav: 32,
  brandLogo: 100,
  siteLogo: 140,
  heroBanner: 1680,
  vendorLogo: 40,
};

export const FALLBACK_PRODUCT_IMAGE = "/assets/sample-image.webp";

export const LOCAL_LOGO_WEBP = "/images/tijaar-logo.webp";
export const LOCAL_LOGO_PNG = "/images/tijaar-logo.png";
export const LOCAL_HERO_WEBP = "/assets/herobg.webp";
export const LOCAL_HERO_480 = "/assets/herobg-480.webp";
export const LOCAL_HERO_640 = "/assets/herobg-640.webp";
export const LOCAL_HERO_768 = "/assets/herobg-768.webp";
export const LOCAL_HERO_1280 = "/assets/herobg-1280.webp";
export const LOCAL_HERO_JPG = "/assets/herobg.jpg";

/** WebP sibling path for a local /assets or /images file. */
export function localAssetWebpSrc(path) {
  if (!path || typeof path !== "string" || !path.startsWith("/")) return null;
  if (/\.webp$/i.test(path)) return null;
  return path.replace(/\.(jpe?g|png)$/i, ".webp");
}

/**
 * Extract upload/ or storage/ path from a backend media URL or relative path.
 */
export function extractBackendMediaPath(url) {
  if (!url || typeof url !== "string") return null;

  const value = url.trim();
  if (!value) return null;

  if (value.startsWith("upload/") || value.startsWith("storage/")) {
    return value.replace(/^\/+/, "");
  }

  try {
    const base = getBackendBaseUrl();
    const parsed = value.startsWith("http") ? new URL(value) : new URL(value, `${base}/`);
    const pathname = parsed.pathname.replace(/^\/+/, "");
    if (pathname.startsWith("upload/") || pathname.startsWith("storage/")) {
      return pathname;
    }
  } catch {
    return null;
  }

  return null;
}

/** Read `path` query param from an existing media delivery URL. */
export function extractDeliveryPathFromUrl(url) {
  if (!url || typeof url !== "string" || !url.includes("/api/v1/media/delivery")) return null;
  try {
    const base = getBackendBaseUrl();
    const parsed = new URL(url.trim(), `${base}/`);
    const path = parsed.searchParams.get("path");
    return path ? path.replace(/^\/+/, "") : null;
  } catch {
    return null;
  }
}

function buildDeliveryUrl(mediaPath, { width, quality, format }) {
  const base = getBackendBaseUrl();
  const params = new URLSearchParams({
    path: mediaPath.replace(/^\/+/, ""),
    w: String(width),
    q: String(quality),
    fmt: format,
  });
  return `${base}/api/v1/media/delivery?${params.toString()}`;
}

/** Resolve upload/storage path from assorted API image fields. */
export function resolveProductImageRaw(product) {
  if (!product) return null;
  return (
    product.image ||
    product.thumbnail_url ||
    product.thumbnail_path ||
    product.thumbnail ||
    null
  );
}

/** Primary optimized URL + direct-file fallback for product cards. */
export function resolveProductImageSources(
  product,
  { width = IMAGE_WIDTHS.productCard, quality = 72, format = "webp" } = {}
) {
  const raw = resolveProductImageRaw(product);
  if (!raw) {
    return { primary: FALLBACK_PRODUCT_IMAGE, fallback: FALLBACK_PRODUCT_IMAGE };
  }

  const primary = optimizeImageUrl(raw, { width, quality, format }) || FALLBACK_PRODUCT_IMAGE;
  const mediaPath =
    extractDeliveryPathFromUrl(raw) ||
    extractBackendMediaPath(raw) ||
    extractBackendMediaPath(resolveMediaUrl(raw));

  let fallback = FALLBACK_PRODUCT_IMAGE;
  if (mediaPath) {
    fallback = resolveMediaUrl(mediaPath) || FALLBACK_PRODUCT_IMAGE;
  } else if (raw.startsWith("http")) {
    fallback = raw;
  } else {
    fallback = resolveMediaUrl(raw) || FALLBACK_PRODUCT_IMAGE;
  }

  if (fallback === primary) {
    fallback = FALLBACK_PRODUCT_IMAGE;
  }

  return { primary, fallback };
}

/**
 * Build an optimized delivery URL for backend-hosted images.
 * Local static assets (/images/..., /assets/...) are returned unchanged.
 */
export function optimizeImageUrl(url, { width = 800, quality = 82, format = "webp" } = {}) {
  if (!url || typeof url !== "string") return url;

  const value = url.trim();
  if (!value) return url;

  const deliveryPath = extractDeliveryPathFromUrl(value);
  if (deliveryPath) {
    return buildDeliveryUrl(deliveryPath, { width, quality, format });
  }

  if (value.startsWith("/") && !value.startsWith("//")) {
    if (value === LOCAL_LOGO_PNG) {
      return LOCAL_LOGO_WEBP;
    }
    return value;
  }

  if (value.startsWith("data:")) {
    return value;
  }

  let mediaPath = extractBackendMediaPath(value);
  if (!mediaPath) {
    mediaPath = extractBackendMediaPath(resolveMediaUrl(value));
  }
  if (!mediaPath && !value.startsWith("http")) {
    const normalized = value.replace(/^\/+/, "");
    mediaPath = extractBackendMediaPath(`storage/${normalized}`);
  }
  if (!mediaPath) {
    return resolveMediaUrl(value) || value;
  }

  return buildDeliveryUrl(mediaPath, { width, quality, format });
}
