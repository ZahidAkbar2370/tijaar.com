/**
 * Courier helpers for seller/customer tracking UI.
 * Enabled list comes from site settings (Admin → Courier).
 */

export const TCS_TRACKING_URL = "https://www.tcsexpress.com/track";
export const LEOPARDS_TRACKING_URL = "https://www.leopardscourier.com/tracking";
export const POSTEX_TRACKING_URL = "https://postex.pk/tracking";

export function normalizeCourierValue(value) {
  const v = String(value || "").toLowerCase().trim();
  if (["lcs", "leopard", "leopard_courier", "leopards_courier"].includes(v)) return "leopards";
  if (v === "tcs_courier") return "tcs";
  if (["post_ex", "post-ex"].includes(v)) return "postex";
  return v;
}

export function courierLabel(value) {
  const v = normalizeCourierValue(value);
  if (v === "tcs") return "TCS";
  if (v === "leopards") return "Leopard / LCS";
  if (v === "postex") return "PostEx";
  return value || "Courier";
}

export function getShipmentCarrier(shipment) {
  const carrier = normalizeCourierValue(shipment?.carrier);
  if (carrier === "tcs") return "tcs";
  if (carrier === "leopards" || shipment?.lcs_cn_number) return "leopards";
  if (carrier === "postex") return "postex";
  return carrier || "";
}

export function getCourierCn(shipment) {
  const carrier = getShipmentCarrier(shipment);
  if (carrier === "tcs") {
    return shipment?.tcs_cn_number || shipment?.courier_dropoff?.cn_number || shipment?.tracking_number || "";
  }
  if (carrier === "leopards") {
    return shipment?.lcs_cn_number || shipment?.tracking_number || "";
  }
  return shipment?.tracking_number || "";
}

export function getCourierTrackingUrl(shipment) {
  const carrier = getShipmentCarrier(shipment);
  const cn = getCourierCn(shipment);
  const url = shipment?.tracking_url || shipment?.courier_dropoff?.tracking_url;
  if (url && String(url).startsWith("http")) return url;

  if (carrier === "tcs") {
    if (cn) return `${TCS_TRACKING_URL.replace(/\/$/, "")}/${encodeURIComponent(cn)}`;
    return TCS_TRACKING_URL;
  }
  if (carrier === "postex") {
    if (cn) return `${POSTEX_TRACKING_URL}?cn=${encodeURIComponent(cn)}`;
    return POSTEX_TRACKING_URL;
  }
  if (cn) {
    return `https://merchantapi.leopardscourier.com/api/trackBookedPacket/format/json/?track_numbers=${encodeURIComponent(cn)}`;
  }
  return LEOPARDS_TRACKING_URL;
}

export function getCourierLabel(shipment) {
  return `${courierLabel(getShipmentCarrier(shipment))} CN`;
}

export function openCourierTracking(shipment) {
  const cn = getCourierCn(shipment);
  if (cn && typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    navigator.clipboard.writeText(cn).catch(() => {});
  }
  window.open(getCourierTrackingUrl(shipment), "_blank", "noopener,noreferrer");
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

/** Build <option> list from site settings; empty when admin disabled all. */
export function enabledCourierOptions(enabledCouriers) {
  if (Array.isArray(enabledCouriers) && enabledCouriers.length > 0) {
    return enabledCouriers.map((c) => ({
      value: normalizeCourierValue(c.value),
      label: c.label || courierLabel(c.value),
    }));
  }
  return [];
}

export function defaultCourierValue(enabledCouriers, preferred) {
  const options = enabledCourierOptions(enabledCouriers);
  if (!options.length) return "";
  const pref = normalizeCourierValue(preferred);
  if (options.some((o) => o.value === pref)) return pref;
  return options[0].value;
}
