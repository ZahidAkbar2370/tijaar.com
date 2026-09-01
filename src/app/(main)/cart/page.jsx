"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  Trash2,
  ShoppingCart,
  ArrowRight,
  LogOut,
  Truck,
  Store,
  BadgeCheck,
  MapPin,
} from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import useAuth from "@/hooks/useAuth";
import useRequireLogin from "@/hooks/useRequireLogin";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import { optimizeImageUrl, IMAGE_WIDTHS } from "@/lib/imageOptimize";
import { useSeoH1 } from "@/hooks/useSeoH1";
import { lineShippingCost } from "@/lib/cartGroups";
import { useCartShipping } from "@/hooks/useCartShipping";

function deliveryLabel(mode, cost) {
  if (mode === "free_shipping" || mode === "included_in_price") {
    return { text: "Free Home Delivery", free: true };
  }
  const n = cost != null && cost !== "" ? Number(cost) : null;
  if (n != null && !Number.isNaN(n) && n > 0) {
    return {
      text: `Delivery Charges: Rs ${n.toLocaleString("en-PK", { maximumFractionDigits: 0 })}`,
      free: false,
    };
  }
  return { text: "Delivery Charges: —", free: false };
}

export default function CartPage() {
  const cartH1 = useSeoH1("cart");
  const {
    cartItems,
    updateQuantity,
    getCartTotal,
    getCartCount,
    clearCart,
    removeFromCart,
  } = useCart();
  const hasFlashDealInCart = cartItems.some((i) => i.flash_deal_id != null);
  const { formatPrice } = useMarket();
  const { user, logout } = useAuth();
  const router = useRouter();
  const requireLogin = useRequireLogin();
  const isSeller = user?.role === "seller";
  const { totalShipping, groupsWithShipping } = useCartShipping(cartItems);

  if (cartItems.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 bg-[#f4f7fb]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <ShoppingCart className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-[#0f2744] mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 max-w-md">
            Looks like you haven&apos;t added any items to your cart yet.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Start Shopping
            <ArrowRight className="w-5 h-5" />
          </Link>
        </motion.div>
      </div>
    );
  }

  const grandTotal = getCartTotal() + Number(totalShipping || 0);

  return (
    <div className="min-h-[60vh] bg-[#f4f7fb]">
      <div className="w-full px-4 sm:px-6 lg:px-12 xl:px-16 py-8 sm:py-10 lg:py-12">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0f2744] mb-1">{cartH1}</h1>
        <p className="text-gray-500 mb-6 sm:mb-8">
          {getCartCount()} item{getCartCount() !== 1 ? "s" : ""} in your cart
        </p>

        {isSeller && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex flex-wrap items-center justify-between gap-3">
            <p className="text-amber-800 text-sm font-medium">
              You&apos;re logged in as a seller. To purchase, log out and place your order as a customer.
            </p>
            <button
              type="button"
              onClick={() => logout?.()}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1790d7] hover:bg-[#1277b8] text-white text-sm font-semibold rounded-lg transition"
            >
              <LogOut className="w-4 h-4" />
              Log out to purchase
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Cart items */}
          <div className="lg:col-span-2 space-y-4">
            {cartItems.map((item, idx) => {
              const delivery = deliveryLabel(item.shipping_mode, item.shipping_cost_cached);
              const storeUrl = item.vendor_slug ? `/seller/${item.vendor_slug}` : null;
              const categoryUrl = item.categorySlug ? `/category/${item.categorySlug}` : null;
              const lineTotal = (item.price || 0) * (item.quantity || 1);

              return (
                <motion.div
                  key={`${item.id}-${item.variant_id ?? "base"}-${JSON.stringify(item.variants || {})}`}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-2xl border border-gray-200/90 shadow-sm overflow-hidden"
                >
                  <div className="flex flex-col sm:flex-row gap-4 p-4 sm:p-5">
                    <Link
                      href={`/product/${item.slug || item.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="shrink-0 self-center sm:self-start"
                    >
                      <img
                        src={optimizeImageUrl(item.image || "/assets/sample-image.webp", {
                          width: IMAGE_WIDTHS.productCard,
                          quality: 72,
                        })}
                        alt={resolveImageAlt(
                          item.image_alt,
                          item.title || item.name || IMAGE_ALT_FALLBACKS.product
                        )}
                        className="w-full sm:w-28 h-40 sm:h-28 object-cover rounded-xl bg-gray-50"
                      />
                    </Link>

                    <div className="flex-1 min-w-0 flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/product/${item.slug || item.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-semibold text-[#0f2744] hover:text-[#1790d7] transition-colors line-clamp-2 text-base sm:text-lg"
                          >
                            {item.title || item.name}
                          </Link>
                          {item.category &&
                            (categoryUrl ? (
                              <Link
                                href={categoryUrl}
                                className="text-[13px] text-[#1790d7] hover:underline mt-0.5 inline-block"
                              >
                                {item.category}
                              </Link>
                            ) : (
                              <p className="text-[13px] text-[#1790d7] mt-0.5">{item.category}</p>
                            ))}
                        </div>
                        <div className="shrink-0 text-right">
                          <p className="text-lg sm:text-xl font-bold text-[#1790d7] leading-none">
                            {formatPrice(lineTotal)}
                          </p>
                          {(item.quantity || 1) > 1 && (
                            <p className="text-[11px] text-gray-400 mt-1">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-start justify-between gap-2">
                        <p
                          className={`text-[12px] sm:text-[13px] font-semibold ${
                            delivery.free ? "text-emerald-600" : "text-sky-700"
                          }`}
                        >
                          {delivery.text}
                          {(item.quantity || 1) > 1 &&
                            item.shipping_mode === "customer_pays" &&
                            Number(item.shipping_cost_cached) > 0 && (
                              <span className="font-normal text-gray-500">
                                {" "}
                                (line: {formatPrice(lineShippingCost(item))})
                              </span>
                            )}
                        </p>
                      </div>

                      {(item.variant_label || Object.keys(item.variants || {}).length > 0) && (
                        <p className="text-xs text-gray-500">
                          {item.variant_label ||
                            Object.entries(item.variants || {})
                              .map(([k, v]) => `${k}: ${v}`)
                              .join(" · ")}
                        </p>
                      )}
                      {item.flash_deal_id && (
                        <p className="text-xs text-rose-600 font-medium">
                          Part of flash deal · Quantity cannot be changed
                        </p>
                      )}

                      <div className="flex items-center gap-3 mt-1">
                        {item.flash_deal_id ? (
                          <span className="text-sm text-gray-500 font-medium">
                            Qty: {item.quantity} (fixed)
                          </span>
                        ) : (
                          <div className="inline-flex items-center border border-gray-200 rounded-xl bg-gray-50/80">
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity - 1,
                                  item.variants || {},
                                  item.variant_id
                                )
                              }
                              className="p-2 hover:bg-white rounded-l-xl transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="w-10 text-center font-semibold text-sm">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateQuantity(
                                  item.id,
                                  item.quantity + 1,
                                  item.variants || {},
                                  item.variant_id
                                )
                              }
                              className="p-2 hover:bg-white rounded-r-xl transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Seller row */}
                  <div className="border-t border-gray-100 bg-gradient-to-br from-gray-50 to-white px-4 py-3 sm:px-5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {item.vendor_logo ? (
                        <img
                          src={optimizeImageUrl(item.vendor_logo, { width: IMAGE_WIDTHS.vendorLogo })}
                          alt={resolveImageAlt(
                            item.vendor_logo_alt,
                            item.vendor || IMAGE_ALT_FALLBACKS.storeLogo
                          )}
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-gray-200 shrink-0 bg-white"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-[#1790d7] flex items-center justify-center shrink-0">
                          <Store className="w-4 h-4 text-white" aria-hidden="true" />
                        </div>
                      )}

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1 min-w-0">
                          <p className="text-sm font-semibold text-[#0f2744] truncate">
                            {item.vendor || "Seller"}
                          </p>
                          {item.verified && (
                            <BadgeCheck
                              className="w-4 h-4 text-[#1790d7] shrink-0"
                              title="KYC verified"
                              aria-label="KYC verified"
                            />
                          )}
                        </div>
                        {item.vendor_city && (
                          <p className="inline-flex items-center gap-0.5 text-[11px] text-gray-500 truncate">
                            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
                            {item.vendor_city}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {storeUrl && (
                          <Link
                            href={storeUrl}
                            className="rounded-lg border border-[#1790d7]/30 bg-white px-2.5 py-1.5 text-[11px] sm:text-xs font-semibold text-[#1790d7] hover:bg-[#1790d7] hover:text-white transition-colors whitespace-nowrap"
                          >
                            View store
                          </Link>
                        )}
                        {!hasFlashDealInCart && (
                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(item.id, item.variants || {}, item.variant_id ?? null)
                            }
                            className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                            title="Remove from cart"
                            aria-label="Remove from cart"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Order summary */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              className="sticky top-24 p-5 sm:p-6 bg-white rounded-2xl border border-gray-200/90 shadow-sm"
            >
              <h3 className="text-lg font-semibold text-[#0f2744] mb-4">Order Summary</h3>

              {groupsWithShipping.length > 1 && (
                <p className="text-xs text-gray-500 mb-3">
                  Items from {groupsWithShipping.length} sellers. Each seller ships separately.
                </p>
              )}

              <div className="space-y-3 mb-4 max-h-[40vh] overflow-y-auto pr-1">
                {groupsWithShipping.map((g) => (
                  <div key={g.key} className="pb-3 border-b border-gray-100 last:border-0">
                    <div className="flex justify-between text-sm font-medium text-gray-900">
                      <span className="truncate pr-2">{g.vendor}</span>
                      <span>{formatPrice(g.subtotal)}</span>
                    </div>
                    {g.items.map((i) => (
                      <div key={`${i.id}-${i.variant_id ?? "b"}`} className="mt-1.5">
                        <div className="flex justify-between text-xs text-gray-600 gap-2">
                          <span className="line-clamp-1">
                            {i.title || i.name} × {i.quantity}
                          </span>
                          <span className="shrink-0">
                            {formatPrice((i.price || 0) * (i.quantity || 1))}
                          </span>
                        </div>
                        <p
                          className={`text-[11px] mt-0.5 ${
                            i.shipping_mode === "free_shipping" ||
                            i.shipping_mode === "included_in_price"
                              ? "text-emerald-600"
                              : "text-sky-700"
                          }`}
                        >
                          {deliveryLabel(i.shipping_mode, i.shipping_cost_cached).text}
                        </p>
                      </div>
                    ))}
                    <div className="flex justify-between text-[11px] font-medium text-[#1790d7] mt-2">
                      <span className="flex items-center gap-1">
                        <Truck className="w-3.5 h-3.5" /> Seller shipping
                      </span>
                      <span>{g.shippingCost > 0 ? formatPrice(g.shippingCost) : "Free"}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t pt-4 space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(getCartTotal())}</span>
                </div>
                <div className="flex justify-between text-sm font-medium text-gray-800">
                  <span>Delivery charges</span>
                  <span>{totalShipping > 0 ? formatPrice(totalShipping) : "Free"}</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span className="text-[#1790d7]">{formatPrice(grandTotal)}</span>
                </div>
                <p className="text-[11px] text-gray-400">
                  Marketplace and payment fees are added at checkout.
                </p>
              </div>

              <div className="flex flex-col gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => clearCart()}
                  className="text-sm text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Clear cart
                </button>
                <Link
                  href="/shop"
                  className="px-4 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all text-center"
                >
                  Continue shopping
                </Link>
                {isSeller ? (
                  <p className="text-center text-sm text-amber-700 py-2">
                    Log out above to purchase as a customer.
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      if (
                        !requireLogin({
                          redirectTo: "/checkout",
                          title: "Login to checkout",
                          message: "Please log in to continue to checkout and place your order.",
                        })
                      ) {
                        return;
                      }
                      router.push("/checkout");
                    }}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    Proceed to checkout
                    <ArrowRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
