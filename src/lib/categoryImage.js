import { getBackendBaseUrl } from "@/lib/api";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";

/** Resolve category image URL the same way as category bar / browse sections. */
export function resolveCategoryImageSrc(category, width = IMAGE_WIDTHS.categoryIcon) {
  if (!category) return null;

  const imageUrl = category.image_url && String(category.image_url).trim();
  if (imageUrl) {
    const raw = imageUrl.startsWith("http")
      ? imageUrl
      : `${getBackendBaseUrl()}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    return optimizeImageUrl(raw, { width });
  }

  const image = category.image && String(category.image).trim();
  if (!image) return null;

  let raw;
  if (image.startsWith("http")) {
    raw = image;
  } else if (image.startsWith("upload/")) {
    raw = `${getBackendBaseUrl()}/${image.replace(/^\/+/, "")}`;
  } else {
    raw = `${getBackendBaseUrl()}/storage/${image.replace(/^\/+/, "").replace(/^storage\/?/, "")}`;
  }

  return optimizeImageUrl(raw, { width });
}

export function categoryHasImage(category) {
  return !!resolveCategoryImageSrc(category);
}
