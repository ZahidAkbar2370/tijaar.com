/**
 * Group cart line items by seller/store for marketplace UI.
 * @param {Array} items
 * @returns {Array<{ key: string, vendor: string, vendor_slug: string|null, store_id: number|null, items: Array, subtotal: number, shippingModes: string[] }>}
 */
export function groupCartBySeller(items = []) {
  const map = new Map();
  for (const item of items) {
    const storeId = item.store_id ?? null;
    const sellerId = item.seller_id ?? null;
    const key = storeId ? `store:${storeId}` : `seller:${sellerId || item.vendor || "unknown"}`;
    if (!map.has(key)) {
      map.set(key, {
        key,
        vendor: item.vendor || "Seller",
        vendor_slug: item.vendor_slug || null,
        store_id: storeId,
        seller_id: sellerId,
        items: [],
        subtotal: 0,
        shippingModes: new Set(),
      });
    }
    const g = map.get(key);
    g.items.push(item);
    g.subtotal += Number(item.price || 0) * Number(item.quantity || 1);
    if (item.shipping_mode) g.shippingModes.add(item.shipping_mode);
  }
  return Array.from(map.values()).map((g) => ({
    ...g,
    shippingModes: Array.from(g.shippingModes),
    shippingLabel: shippingModesLabel(Array.from(g.shippingModes)),
  }));
}

/**
 * Shipping charged for a single cart line.
 * Sellers set this on the listing (shipping_mode + shipping_cost_cached);
 * couriers are never asked for a rate.
 */
export function lineShippingCost(item) {
  const mode = item?.shipping_mode || "customer_pays";
  if (mode !== "customer_pays") return 0;
  const cost = Number(item?.shipping_cost_cached ?? 0);
  if (Number.isNaN(cost)) return 0;
  return cost * Number(item?.quantity || 1);
}

/** Total shipping the customer pays for the whole cart. */
export function cartShippingTotal(items = []) {
  return items.reduce((sum, item) => sum + lineShippingCost(item), 0);
}

export function shippingModeLabel(mode, shippingCost = null) {
  switch (mode) {
    case "free_shipping":
      return "Shipping Paid by Seller (Free shipping)";
    case "included_in_price":
      return "Shipping included";
    case "customer_pays": {
      const cost = shippingCost != null && shippingCost !== "" ? Number(shippingCost) : null;
      if (cost != null && !Number.isNaN(cost)) {
        return `Shipping Paid by Customer — Rs ${cost.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`;
      }
      return "Shipping Paid by Customer";
    }
    default:
      return "Shipping at checkout";
  }
}

function shippingModesLabel(modes) {
  if (!modes.length) return "Shipping calculated at checkout";
  if (modes.every((m) => m === "free_shipping" || m === "included_in_price")) {
    return "Free shipping (paid by seller)";
  }
  if (modes.includes("customer_pays") && modes.length === 1) {
    return "Shipping Paid by Customer";
  }
  return "Mixed shipping — finalized at checkout";
}
