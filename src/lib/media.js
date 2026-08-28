import { getBackendBaseUrl } from "@/lib/api";

/** Build full URL for upload/ or storage paths from the API. */
export function resolveMediaUrl(pathOrUrl) {
  if (!pathOrUrl || typeof pathOrUrl !== "string") return "";
  const value = pathOrUrl.trim();
  if (!value) return "";
  if (value.startsWith("http://") || value.startsWith("https://") || value.startsWith("data:")) {
    return value;
  }

  const base = typeof getBackendBaseUrl === "function" ? getBackendBaseUrl() : "";
  const path = value.replace(/^\/+/, "");

  if (path.startsWith("upload/") || path.startsWith("storage/")) {
    return `${base}/${path}`;
  }

  return `${base}/storage/${path}`;
}

/** Normalize product/API image fields to absolute URLs. */
export function resolveMediaUrls(urls) {
  if (!Array.isArray(urls)) return [];
  return urls.map(resolveMediaUrl).filter(Boolean);
}
