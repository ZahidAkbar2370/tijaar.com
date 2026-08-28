export const LEOPARDS_TRACKING_URL = "https://pk.leopardscourier.com/tracking";
export const LEOPARDS_OFFICE_URL = "https://pk.leopardscourier.com";

export function getLeopardsCn(shipment) {
  return shipment?.lcs_cn_number || shipment?.lcs_dropoff?.cn_number || shipment?.tracking_number || "";
}

export function getLeopardsTrackingUrl(shipment) {
  const url = shipment?.tracking_url || shipment?.lcs_dropoff?.tracking_url;
  if (url && !url.includes("leopardscourier.com/track/")) {
    return url;
  }
  return LEOPARDS_TRACKING_URL;
}

export function getLeopardsOfficeUrl(shipment) {
  return shipment?.lcs_dropoff?.find_office_url || LEOPARDS_OFFICE_URL;
}

export function openLeopardsTracking(shipment) {
  const cn = getLeopardsCn(shipment);
  if (cn && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(cn).catch(() => {});
  }
  window.open(getLeopardsTrackingUrl(shipment), "_blank", "noopener,noreferrer");
}
