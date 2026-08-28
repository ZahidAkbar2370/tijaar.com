import {
  getLeopardsCn,
  getLeopardsTrackingUrl,
  openLeopardsTracking,
  LEOPARDS_TRACKING_URL,
} from "@/lib/leopards";

export const TCS_TRACKING_URL = "https://www.tcsexpress.com/track";

export function getShipmentCarrier(shipment) {
  const carrier = (shipment?.carrier || "").toLowerCase();
  if (carrier === "tcs") return "tcs";
  if (carrier === "leopards" || shipment?.lcs_cn_number) return "leopards";
  return carrier || "leopards";
}

export function getCourierCn(shipment) {
  if (getShipmentCarrier(shipment) === "tcs") {
    return shipment?.tcs_cn_number || shipment?.courier_dropoff?.cn_number || shipment?.tracking_number || "";
  }
  return getLeopardsCn(shipment);
}

export function getCourierTrackingUrl(shipment) {
  if (getShipmentCarrier(shipment) === "tcs") {
    const cn = getCourierCn(shipment);
    const url = shipment?.tracking_url || shipment?.courier_dropoff?.tracking_url;
    if (url && url.includes("tcsexpress.com/track/") && !url.endsWith("/track") && !url.endsWith("/track/")) {
      return url;
    }
    if (cn) return `${TCS_TRACKING_URL.replace(/\/$/, "")}/${encodeURIComponent(cn)}`;
    if (url && !url.includes("tcsexpress.com")) return url;
    return TCS_TRACKING_URL;
  }
  return getLeopardsTrackingUrl(shipment);
}

export function getCourierLabel(shipment) {
  return getShipmentCarrier(shipment) === "tcs" ? "TCS CN" : "Leopards CN";
}

export function openCourierTracking(shipment) {
  if (getShipmentCarrier(shipment) === "tcs") {
    const cn = getCourierCn(shipment);
    if (cn && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      navigator.clipboard.writeText(cn).catch(() => {});
    }
    window.open(getCourierTrackingUrl(shipment), "_blank", "noopener,noreferrer");
    return;
  }
  openLeopardsTracking(shipment);
}

export function hasCourierTracking(shipment) {
  return Boolean(
    shipment?.tracking_url ||
      shipment?.tracking_number ||
      shipment?.lcs_cn_number ||
      shipment?.tcs_cn_number ||
      shipment?.courier_dropoff?.cn_number
  );
}

export { LEOPARDS_TRACKING_URL, TCS_TRACKING_URL as TCS_TRACK_BASE };
