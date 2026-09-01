import { getBackendBaseUrl } from "@/lib/api";

export function getListingImageUrl(path) {
  if (!path || typeof path !== "string") return "";
  const p = path.trim();
  if (p.startsWith("http")) return p;
  const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
  if (p.startsWith("upload/")) return `${base}/${p}`;
  return `${base}/storage/${p}`;
}

export function getListingThumbnail(listing) {
  const media = listing?.media || listing?.product_media || [];
  const first = media[0];
  if (first?.image_url) {
    return first.image_url.startsWith("http") ? first.image_url : getListingImageUrl(first.image_url);
  }
  if (first?.path) return getListingImageUrl(first.path);
  if (listing?.thumbnail_path) return getListingImageUrl(listing.thumbnail_path);
  if (listing?.image_url) {
    return listing.image_url.startsWith("http") ? listing.image_url : getListingImageUrl(listing.image_url);
  }
  return "/assets/sample-image.webp";
}

export function getListingGallery(listing) {
  const media = listing?.media || listing?.product_media || [];
  const urls = media
    .map((m) => {
      if (m?.image_url) return m.image_url.startsWith("http") ? m.image_url : getListingImageUrl(m.image_url);
      if (m?.path) return getListingImageUrl(m.path);
      return null;
    })
    .filter(Boolean);
  if (urls.length) return urls;
  const thumb = getListingThumbnail(listing);
  return thumb ? [thumb] : [];
}

export function listingDisplayStatus(listing) {
  return listing?.display_status || listing?.status || "draft";
}

export function statusBadgeClass(status) {
  const s = String(status || "").toLowerCase();
  if (s === "published") return "bg-emerald-100 text-emerald-700";
  if (s === "sold") return "bg-sky-100 text-sky-800";
  if (s === "expired") return "bg-amber-100 text-amber-800";
  if (s === "removed") return "bg-red-100 text-red-700";
  return "bg-slate-100 text-slate-700";
}
