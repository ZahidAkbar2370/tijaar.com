"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useAuthContext } from "./AuthProvider";
import { useSnackbar } from "./SnackbarContext";
import { cartApi } from "@/lib/api";

const CartContext = createContext();

const getCartKey = (userId) => (userId ? `cart_${userId}` : "cart_guest");

function mapApiCartItem(i) {
  return {
    id: i.id,
    cart_item_id: i.cart_item_id,
    slug: i.slug,
    title: i.title || i.name,
    name: i.name,
    price: i.price,
    image: i.image,
    category: i.category ?? null,
    categorySlug: i.categorySlug ?? null,
    vendor: i.vendor,
    vendor_slug: i.vendor_slug ?? null,
    vendor_logo: i.vendor_logo ?? null,
    vendor_logo_alt: i.vendor_logo_alt ?? null,
    vendor_city: i.vendor_city ?? null,
    verified: !!i.verified,
    seller_type: i.seller_type ?? "business",
    store_id: i.store_id ?? null,
    seller_id: i.seller_id ?? null,
    shipping_mode: i.shipping_mode ?? "customer_pays",
    shipping_cost_cached:
      i.shipping_cost_cached != null && i.shipping_cost_cached !== ""
        ? Number(i.shipping_cost_cached)
        : null,
    quantity: i.quantity,
    variants: i.variants || {},
    variant_id: i.variant_id ?? null,
    variant_label: i.variant_label ?? "",
    flash_deal_id: i.flash_deal_id ?? null,
    available_quantity:
      i.available_quantity != null ? Number(i.available_quantity) : null,
    stock_status: i.stock_status ?? null,
    track_inventory: i.track_inventory ?? true,
  };
}

/** Resolve sellable stock from a product payload (card / PDP). */
function resolveAvailableStock(product, variants = {}) {
  if (!product) return 0;
  if (product.track_inventory === false) return Number.MAX_SAFE_INTEGER;
  const variantQty = variants?.quantity ?? product.variant_quantity;
  if (variantQty != null && variantQty !== "") {
    return Math.max(0, Number(variantQty) || 0);
  }
  if (product.stock_status === "out_of_stock") return 0;
  return Math.max(0, Number(product.available_quantity ?? product.quantity ?? 0) || 0);
}

function stockError(available, requested) {
  const err = new Error(
    available <= 0
      ? "This product is out of stock and cannot be added to your cart."
      : available === 1
        ? "Only 1 unit is available for this product."
        : `Only ${available} units are available for this product.`
  );
  err.code = available <= 0 ? "out_of_stock" : "insufficient_stock";
  err.available = available;
  err.requested = requested;
  return err;
}

export const CartProvider = ({ children }) => {
  const { user } = useAuthContext();
  const { showError } = useSnackbar();
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [prevUser, setPrevUser] = useState(null);

  const currentCartKey = getCartKey(user?.id);

  const fetchCart = useCallback(async () => {
    if (!user) return;
    setCartLoading(true);
    try {
          const res = await cartApi.get();
          const items = (res.cart?.items || []).map(mapApiCartItem);
          setCartItems(items);
        } catch {
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("cart_guest");
        try {
          setCartItems(saved ? JSON.parse(saved) : []);
        } catch {
          setCartItems([]);
        }
      }
    }
  }, [user, fetchCart]);

  useEffect(() => {
    if (!user && typeof window !== "undefined" && cartItems.length > 0) {
      localStorage.setItem("cart_guest", JSON.stringify(cartItems));
    } else if (!user && cartItems.length === 0) {
      localStorage.removeItem("cart_guest");
    }
  }, [user, cartItems]);

  useEffect(() => {
    if (user && !prevUser && prevUser !== undefined) {
      const guestCart = typeof window !== "undefined" ? localStorage.getItem("cart_guest") : null;
      if (guestCart) {
        try {
          const items = JSON.parse(guestCart);
          if (items.length > 0) {
            cartApi
              .merge(items.map((i) => ({ product_id: i.id, quantity: i.quantity, variant_id: i.variant_id ?? undefined })))
              .then((res) => {
                setCartItems((res.cart?.items || []).map(mapApiCartItem));
                localStorage.removeItem("cart_guest");
              })
              .catch(() => fetchCart());
            return;
          }
        } catch {}
      }
    }
    setPrevUser(user);
  }, [user, prevUser, fetchCart]);

  const addDealToCart = useCallback(
    async (flashDealId) => {
      if (!user) throw new Error("Login to add this deal to cart");
      const res = await cartApi.addDeal(flashDealId);
      const items = (res.cart?.items || []).map(mapApiCartItem);
      setCartItems(items);
    },
    [user]
  );

  const addToCart = useCallback(
    async (product, quantity = 1, variants = {}, addOptions = {}) => {
      if (user?.role === "seller") {
        const err = new Error("Seller accounts can browse products but cannot add items to cart or place orders.");
        err.isSellerBlock = true;
        throw err;
      }
      if (cartItems.some((i) => i.flash_deal_id != null)) {
        const err = new Error("You already have a flash deal in your cart. Complete your purchase first.");
        err.isFlashDealBlock = true;
        throw err;
      }
      const variantId = variants?.variant_id != null && variants.variant_id > 0 ? variants.variant_id : null;
      const options = variants && typeof variants === "object" ? { ...variants } : {};
      delete options.variant_id;
      delete options.quantity;
      const setQuantity = addOptions && addOptions.setQuantity === true;
      const qty = Math.max(1, Number(quantity) || 1);

      // Client-side stock gate (guest + logged-in UX before API round-trip).
      const available = resolveAvailableStock(product, variants);
      const tracksStock = product?.track_inventory !== false;
      if (tracksStock) {
        const existing = cartItems.find(
          (item) =>
            item.id === product.id &&
            (item.variant_id ?? null) === variantId &&
            JSON.stringify(item.variants || {}) === JSON.stringify(options)
        );
        const desiredQty = setQuantity ? qty : (existing?.quantity || 0) + qty;
        // Logged-in available_quantity already subtracts this cart's reservation.
        const effectiveAvailable = user
          ? available + (existing?.quantity || 0)
          : available;
        if (effectiveAvailable <= 0) {
          throw stockError(0, desiredQty);
        }
        if (desiredQty > effectiveAvailable) {
          throw stockError(effectiveAvailable, desiredQty);
        }
      }

      if (user) {
        try {
          const res = await cartApi.add(product.id, qty, variantId, Object.keys(options).length ? options : null, setQuantity);
          const items = (res.cart?.items || []).map(mapApiCartItem);
          setCartItems(items);
        } catch (err) {
          throw err;
        }
        } else {
        if (cartItems.some((i) => i.flash_deal_id != null)) {
          const err = new Error("You already have a flash deal in your cart. Complete your purchase first.");
          err.isFlashDealBlock = true;
          throw err;
        }
        const existing = cartItems.find(
          (item) =>
            item.id === product.id &&
            (item.variant_id ?? null) === variantId &&
            JSON.stringify(item.variants || {}) === JSON.stringify(options)
        );
        if (existing) {
          const newQty = setQuantity ? qty : existing.quantity + qty;
          setCartItems(
            cartItems.map((item) =>
              item.id === product.id &&
              (item.variant_id ?? null) === variantId &&
              JSON.stringify(item.variants || {}) === JSON.stringify(options)
                ? { ...item, quantity: newQty }
                : item
            )
          );
        } else {
          const displayPrice = product.variant_price ?? product.price;
          const displayImage = product.variant_image ?? product.image;
          setCartItems([
            ...cartItems,
            {
              id: product.id,
              slug: product.slug || product.id,
              title: product.title || product.name,
              name: product.name,
              price: displayPrice,
              originalPrice: product.originalPrice,
              image: displayImage,
              category: product.category ?? null,
              categorySlug: product.categorySlug ?? null,
              vendor: product.vendor,
              vendor_slug: product.vendor_slug ?? null,
              vendor_logo: product.vendor_logo ?? null,
              vendor_logo_alt: product.vendor_logo_alt ?? null,
              vendor_city: product.vendor_city ?? null,
              verified: !!product.verified,
              seller_type: product.seller_type ?? "business",
              store_id: product.store_id ?? null,
              seller_id: product.seller_id ?? null,
              shipping_mode: product.shipping_mode ?? "customer_pays",
              shipping_cost_cached:
                product.shipping_cost_cached != null && product.shipping_cost_cached !== ""
                  ? Number(product.shipping_cost_cached)
                  : null,
              quantity: qty,
              variants: options,
              variant_id: variantId,
              variant_label: Object.keys(options).length ? Object.entries(options).map(([k, v]) => `${k}: ${v}`).join(", ") : "",
              available_quantity: tracksStock ? available : null,
              stock_status: product.stock_status ?? null,
              track_inventory: product.track_inventory ?? true,
            },
          ]);
        }
      }
    },
    [user, cartItems]
  );

  const removeFromCart = useCallback(
    async (itemId, variants = {}, variantId = null) => {
      if (user) {
        try {
          const res = await cartApi.remove(itemId, variantId);
          setCartItems(
            (res.cart?.items || []).map(mapApiCartItem)
          );
        } catch {}
      } else {
        const vId = variants?.variant_id ?? null;
        setCartItems(
          cartItems.filter(
            (item) =>
              !(
                item.id === itemId &&
                (item.variant_id ?? null) === vId &&
                JSON.stringify(item.variants || {}) === JSON.stringify(
                  typeof variants === "object" ? (() => { const o = { ...variants }; delete o.variant_id; return o; })() : {}
                )
              )
          )
        );
      }
    },
    [user, cartItems]
  );

  const updateQuantity = useCallback(
    async (itemId, quantity, variants = {}, variantId = null) => {
      if (quantity <= 0) {
        removeFromCart(itemId, variants, variantId);
        return;
      }
      if (user) {
        try {
          const res = await cartApi.update(itemId, quantity, variantId);
          setCartItems(
            (res.cart?.items || []).map(mapApiCartItem)
          );
        } catch (err) {
          const msg = err?.response?.data?.message || err?.data?.message || err?.message || "Could not update quantity.";
          showError?.(msg);
          fetchCart();
        }
      } else {
        const vId = variants?.variant_id ?? null;
        const item = cartItems.find(
          (row) =>
            row.id === itemId &&
            (row.variant_id ?? null) === vId &&
            JSON.stringify(row.variants || {}) ===
              JSON.stringify(
                typeof variants === "object"
                  ? (() => {
                      const o = { ...variants };
                      delete o.variant_id;
                      return o;
                    })()
                  : {}
              )
        );
        if (item?.track_inventory !== false) {
          const maxQty =
            item?.available_quantity != null
              ? Number(item.available_quantity)
              : null;
          if (maxQty != null && quantity > maxQty) {
            showError?.(
              maxQty <= 0
                ? "This product is out of stock."
                : maxQty === 1
                  ? "Only 1 unit is available for this product."
                  : `Only ${maxQty} units are available for this product.`
            );
            return;
          }
        }
        setCartItems(
          cartItems.map((row) =>
            row.id === itemId &&
            (row.variant_id ?? null) === vId &&
            JSON.stringify(row.variants || {}) === JSON.stringify(
              typeof variants === "object" ? (() => { const o = { ...variants }; delete o.variant_id; return o; })() : {}
            )
              ? { ...row, quantity }
              : row
          )
        );
      }
    },
    [user, cartItems, removeFromCart, fetchCart, showError]
  );

  const clearCart = useCallback(async () => {
    if (user) {
      try {
        await cartApi.clear();
      } catch (e) {
        showError?.("Cart cleared here; if items reappear, refresh the page.");
      }
      try {
        await fetchCart();
      } catch (_) {
        setCartItems([]);
      }
    }
    setCartItems([]);
    if (typeof window !== "undefined") localStorage.removeItem("cart_guest");
  }, [user, fetchCart, showError]);

  const getCartTotal = useCallback(
    () => cartItems.reduce((t, i) => t + (i.price || 0) * (i.quantity || 0), 0),
    [cartItems]
  );

  const getCartCount = useCallback(
    () => cartItems.reduce((c, i) => c + (i.quantity || 0), 0),
    [cartItems]
  );

  const hasFlashDealInCart = useCallback(
    () => cartItems.some((i) => i.flash_deal_id != null),
    [cartItems]
  );

  const value = {
    cartItems,
    addToCart,
    addDealToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartTotal,
    getCartCount,
    hasFlashDealInCart,
    isCartOpen,
    setIsCartOpen,
    cartLoading,
    refresh: fetchCart,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
