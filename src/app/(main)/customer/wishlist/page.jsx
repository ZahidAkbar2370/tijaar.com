"use client";

import { useState } from "react";
import Link from "next/link";
import { Heart, ShoppingCart, Bell, Package } from "lucide-react";
import useAuth from "@/hooks/useAuth";
import { useWishlist } from "@/context/WishlistContext";
import { wishlistApi } from "@/lib/api";
import { useSnackbar } from "@/context/SnackbarContext";
import { useCart } from "@/context/CartContext";
import { useMarket } from "@/context/MarketContext";
import PageHero from "@/components/customer/PageHero";
import { confirmDelete } from "@/lib/sweetAlert";

export default function WishlistPage() {
  const { user } = useAuth();
  const { wishlistItems, removeFromWishlist, loadFromApi } = useWishlist();
  const { showSuccess, showError } = useSnackbar();
  const { refresh: refreshCart } = useCart() || {};
  const { formatPrice } = useMarket();
  const [movingId, setMovingId] = useState(null);
  const [toggling, setToggling] = useState(null);

  const handleMoveToCart = async (item) => {
    setMovingId(item.id);
    try {
      await wishlistApi.moveToCart(item.id);
      removeFromWishlist(item.id);
      refreshCart?.();
      showSuccess?.("Moved to cart!");
    } catch (err) {
      showError?.(err?.data?.message || err?.message || "Failed");
    } finally {
      setMovingId(null);
    }
  };

  const handleToggleAlert = async (item, type, enabled) => {
    setToggling(`${item.id}-${type}`);
    try {
      await wishlistApi.toggleAlert(item.id, type, enabled);
      loadFromApi?.();
      showSuccess?.(enabled ? `${type === "price" ? "Price" : "Stock"} alert enabled` : "Alert disabled");
    } catch {
      showError?.("Failed to update alert");
    } finally {
      setToggling(null);
    }
  };

  if (!user) {
    return (
      <div className="space-y-6">
        <PageHero title="My Wishlist" description="Save items you love for later. Login to view and manage your wishlist." illustration="wishlist" />
        <div className="p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center">
          <p className="text-gray-600 mb-4">Please log in to view your wishlist.</p>
          <Link href="/login" className="inline-block px-4 py-2 bg-[#1790d7] text-white rounded-xl font-medium hover:bg-[#1277b8]">
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHero
        title="My Wishlist"
        description="Products you liked that are still available to buy — published, in stock, and not expired."
        illustration="wishlist"
        guide="Unavailable or expired items are hidden automatically. Use Move to cart for quick checkout, or enable price/stock alerts."
      />

      {wishlistItems.length === 0 ? (
        <div className="flex flex-col lg:flex-row items-center gap-6 p-8 rounded-2xl bg-gray-50 border border-gray-200/60 text-center lg:text-left">
          <div className="flex-shrink-0 w-32 h-32 rounded-2xl bg-rose-100 flex items-center justify-center">
            <Heart className="w-16 h-16 text-rose-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">No available wishlist items</h2>
            <p className="text-sm text-gray-600 mt-1">
              Liked products that sell out or expire are removed from this list. Add items from the shop with the heart icon.
            </p>
            <Link href="/shop" className="inline-block mt-4 px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm font-medium hover:bg-[#1277b8] transition-colors">
              Browse Products
            </Link>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-600">
            {wishlistItems.length} available item{wishlistItems.length !== 1 ? "s" : ""}
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {wishlistItems.map((item) => (
              <div key={item.id} className="bg-white rounded-xl border border-gray-200/80 overflow-hidden shadow-sm group hover:shadow-md transition-all">
                <Link href={`/product/${item.slug}`} target="_blank" rel="noopener noreferrer" className="block aspect-square bg-gray-50">
                  <img
                    src={item.image || "/assets/sample-image.webp"}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition"
                  />
                </Link>
                <div className="p-4">
                  <Link href={`/product/${item.slug}`} target="_blank" rel="noopener noreferrer" className="font-medium text-gray-900 hover:text-[#1790d7] line-clamp-2 text-sm">
                    {item.title}
                  </Link>
                  <p className="text-lg font-bold text-[#1790d7] mt-1">
                    {item.originalPrice && (
                      <span className="text-gray-400 line-through text-sm mr-2">{formatPrice(item.originalPrice)}</span>
                    )}
                    {formatPrice(item.price)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    <button
                      onClick={() => handleMoveToCart(item)}
                      disabled={!!movingId}
                      className="flex-1 flex items-center justify-center gap-2 py-2 bg-[#1790d7] text-white rounded-lg text-sm font-medium disabled:opacity-50 hover:bg-[#1277b8] transition-colors"
                    >
                      <ShoppingCart size={16} />
                      {movingId === item.id ? "Moving..." : "To Cart"}
                    </button>
                    <button
                      onClick={async () => {
                        const confirmed = await confirmDelete({
                          title: "Remove from wishlist?",
                          text: `Remove "${item.title}" from your wishlist?`,
                          confirmButtonText: "Yes, remove",
                        });
                        if (confirmed) removeFromWishlist(item.id);
                      }}
                      className="p-2 border border-gray-200 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex gap-2 mt-2 text-xs">
                    <button
                      onClick={() => handleToggleAlert(item, "price", !item.price_alert)}
                      disabled={!!toggling}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${item.price_alert ? "bg-amber-100 text-amber-700" : "bg-gray-100 text-gray-600"} hover:bg-amber-50 transition-colors`}
                    >
                      <Bell size={12} /> {item.price_alert ? "Price ON" : "Price"}
                    </button>
                    <button
                      onClick={() => handleToggleAlert(item, "stock", !item.stock_alert)}
                      disabled={!!toggling}
                      className={`flex items-center gap-1 px-2 py-1 rounded ${item.stock_alert ? "bg-emerald-100 text-emerald-700" : "bg-gray-100 text-gray-600"} hover:bg-emerald-50 transition-colors`}
                    >
                      <Package size={12} /> {item.stock_alert ? "Stock ON" : "Stock"}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
