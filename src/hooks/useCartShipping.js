"use client";

import { useMemo } from "react";
import { cartShippingTotal, groupCartBySeller, lineShippingCost } from "@/lib/cartGroups";

/**
 * Shipping for the cart, taken from each listing's fixed shipping price.
 * Couriers are tracking-only, so no rate lookup is needed and the total is
 * known as soon as the item is in the cart.
 */
export function useCartShipping(cartItems = []) {
  const sellerGroups = useMemo(() => groupCartBySeller(cartItems), [cartItems]);

  const subtotal = useMemo(
    () => cartItems.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 1), 0),
    [cartItems]
  );

  const groupsWithShipping = useMemo(
    () =>
      sellerGroups.map((g) => ({
        ...g,
        shippingCost: g.items.reduce((sum, item) => sum + lineShippingCost(item), 0),
      })),
    [sellerGroups]
  );

  const totalShipping = useMemo(() => cartShippingTotal(cartItems), [cartItems]);

  return {
    sellerGroups,
    groupsWithShipping,
    totalShipping,
    subtotal,
  };
}
