"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Minus, Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { groupCartBySeller, shippingModeLabel } from "@/lib/cartGroups";
import { useCartShipping } from "@/hooks/useCartShipping";

export default function CartSidebar() {
  const [mounted, setMounted] = useState(false);
  
  useEffect(() => {
    setMounted(true);
  }, []);
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    getCartTotal,
    clearCart,
  } = useCart();
  const { formatPrice } = useMarket();
  const router = useRouter();
  const hasFlashDealInCart = cartItems.some((i) => i.flash_deal_id != null);
  const { groupsWithShipping, totalShipping } = useCartShipping(isCartOpen ? cartItems : []);
  const sellerGroups = groupsWithShipping.length ? groupsWithShipping : groupCartBySeller(cartItems);

  const handleViewCart = () => {
    setIsCartOpen(false);
    router.push("/cart");
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push("/checkout");
  };

  const cartContent = (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-white z-[9999] shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <ShoppingCart className="w-6 h-6 text-[#1790d7]" />
                <h2 className="text-xl font-bold text-gray-900">
                  Shopping Cart ({cartItems.length})
                </h2>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <ShoppingCart className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-gray-500 text-lg font-medium mb-2">Your cart is empty</p>
                  <p className="text-gray-400 text-sm">Start adding items to your cart</p>
                  <Link
                    href="/shop"
                    onClick={() => setIsCartOpen(false)}
                    className="mt-6 px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Continue Shopping
                  </Link>
                </div>
              ) : (
                <div className="space-y-6">
                  {sellerGroups.map((group) => (
                    <div key={group.key} className="space-y-3">
                      <div className="flex items-start justify-between gap-2 pb-2 border-b border-gray-100">
                        <div className="min-w-0">
                          {group.vendor_slug ? (
                            <Link
                              href={`/seller/${group.vendor_slug}`}
                              onClick={() => setIsCartOpen(false)}
                              className="text-sm font-semibold text-gray-900 hover:text-[#1790d7] truncate block"
                            >
                              {group.vendor}
                            </Link>
                          ) : (
                            <p className="text-sm font-semibold text-gray-900 truncate">{group.vendor}</p>
                          )}
                          <p className="text-[11px] text-gray-500 mt-0.5">{group.shippingLabel}</p>
                        </div>
                        <span className="text-xs font-medium text-gray-600 shrink-0">
                          {formatPrice(group.subtotal)}
                        </span>
                      </div>
                      {group.items.map((item) => (
                    <motion.div
                      key={`${item.id}-${item.variant_id ?? "base"}-${JSON.stringify(item.variants || {})}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex gap-4 p-4 bg-gray-50 rounded-xl"
                    >
                      <img
                        src={item.image || "/assets/sample-image.webp"}
                        alt={resolveImageAlt(item.image_alt, item.title || item.name || IMAGE_ALT_FALLBACKS.product)}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/product/${item.slug || item.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => setIsCartOpen(false)}
                          className="font-semibold text-gray-900 hover:text-[#1790d7] transition-colors line-clamp-2"
                        >
                          {item.title}
                        </Link>
                        {item.shipping_mode && (
                          <p className="text-[11px] text-[#1790d7] mt-1">
                            {shippingModeLabel(item.shipping_mode, item.shipping_cost_cached)}
                          </p>
                        )}
                        {item.flash_deal_id && (
                          <p className="text-xs text-rose-600 font-medium mt-1">Part of flash deal · Qty fixed</p>
                        )}
                        {(item.variant_label || Object.keys(item.variants || {}).length > 0) && (
                          <div className="text-xs text-gray-500 mt-1">
                            {item.variant_label
                              ? String(item.variant_label)
                              : Object.entries(item.variants || {}).map(([key, value]) => (
                                  <span key={key} className="mr-2">
                                    {key}: {value}
                                  </span>
                                ))}
                          </div>
                        )}
                        <div className="flex items-center justify-between mt-2">
                          <p className="text-lg font-bold text-[#1790d7]">
                            {formatPrice((item.price ?? 0) * (item.quantity || 1))}
                          </p>
                          {item.flash_deal_id ? (
                            <span className="text-sm text-gray-500 font-medium">Qty: {item.quantity}</span>
                          ) : (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity - 1, item.variants || {}, item.variant_id ?? null)
                              }
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-8 text-center font-semibold">{item.quantity}</span>
                            <button
                              onClick={() =>
                                updateQuantity(item.id, item.quantity + 1, item.variants || {}, item.variant_id ?? null)
                              }
                              className="p-1 hover:bg-gray-200 rounded transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                          )}
                        </div>
                      </div>
                      {!hasFlashDealInCart && (
                        <button
                          onClick={() => removeFromCart(item.id, item.variants || {}, item.variant_id ?? null)}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors self-start"
                          aria-label="Remove from cart"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="border-t border-gray-200 p-6 space-y-4">
                {sellerGroups.length > 1 && (
                  <p className="text-xs text-gray-500">
                    {sellerGroups.length} sellers — each ships with a separate Tracking ID.
                  </p>
                )}
                <div className="space-y-1.5">
                  {sellerGroups.map((g) => (
                    <div key={`ship-${g.key}`} className="flex justify-between text-xs text-gray-600">
                      <span className="truncate pr-2">{g.vendor} Shipping</span>
                      <span>{g.shippingCost > 0 ? formatPrice(g.shippingCost) : "Free"}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm text-gray-700 font-medium">
                    <span>Total Shipping</span>
                    <span>{totalShipping > 0 ? formatPrice(totalShipping) : "Free"}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-gray-600 font-medium">Subtotal:</span>
                    <span className="text-2xl font-bold text-[#1790d7]">
                      {formatPrice(getCartTotal())}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-400">Open cart for full per-store shipping breakdown.</p>
                <div className="flex gap-3">
                  <button
                    onClick={handleViewCart}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-center"
                  >
                    View Cart
                  </button>
                  <button
                    onClick={handleCheckout}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                  >
                    Checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={clearCart}
                  className="w-full text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Clear Cart
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  // Use portal to render at document body level to avoid stacking context issues
  if (!mounted) return null;
  
  return createPortal(cartContent, document.body);
}
