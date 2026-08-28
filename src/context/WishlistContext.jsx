"use client";

import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useAuthContext } from "./AuthProvider";
import { wishlistApi } from "@/lib/api";

const WishlistContext = createContext();

const getWishlistKey = (userId) => (userId ? `wishlist_${userId}` : "wishlist_guest");

export const WishlistProvider = ({ children }) => {
  const { user } = useAuthContext();
  const [wishlistItems, setWishlistItems] = useState([]);

  const currentKey = getWishlistKey(user?.id);

  const loadFromApi = useCallback(async () => {
    if (!user) return;
    try {
      const res = await wishlistApi.list();
      const items = (res.items || [])
        .filter((i) => i.product && i.product.in_stock !== false && !i.product.is_expired)
        .map((i) => ({
          id: i.product?.id ?? i.product_id,
          slug: i.product?.slug,
          title: i.product?.title ?? i.product?.name,
          price: i.product?.price,
          originalPrice: i.product?.originalPrice,
          image: i.product?.image,
          vendor: i.product?.vendor,
          in_stock: i.product?.in_stock !== false,
          is_expired: !!i.product?.is_expired,
          wishlistId: i.id,
          price_alert: i.price_alert ?? false,
          stock_alert: i.stock_alert ?? false,
        }));
      setWishlistItems(items);
    } catch {
      setWishlistItems([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadFromApi();
    } else if (typeof window !== "undefined") {
      const saved = localStorage.getItem(currentKey);
      try {
        setWishlistItems(saved ? (Array.isArray(JSON.parse(saved)) ? JSON.parse(saved) : []) : []);
      } catch {
        setWishlistItems([]);
      }
    } else {
      setWishlistItems([]);
    }
  }, [user, currentKey, loadFromApi]);

  useEffect(() => {
    if (typeof window === "undefined" || user) return;
    if (wishlistItems.length > 0) {
      localStorage.setItem(currentKey, JSON.stringify(wishlistItems));
    } else {
      localStorage.removeItem(currentKey);
    }
  }, [wishlistItems, currentKey, user]);

  const addToWishlist = async (product) => {
    if (wishlistItems.find((i) => i.id === product.id)) return;
    const item = {
      id: product.id,
      slug: product.slug,
      title: product.title ?? product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.image,
      vendor: product.vendor,
    };
    if (user) {
      try {
        await wishlistApi.add(product.id);
        setWishlistItems((p) => [...p, item]);
      } catch {}
    } else {
      setWishlistItems((p) => [...p, item]);
    }
  };

  const removeFromWishlist = async (productId) => {
    if (user) {
      try {
        await wishlistApi.remove(productId);
      } catch {}
    }
    setWishlistItems((p) => p.filter((i) => i.id !== productId));
  };

  const isInWishlist = (productId) =>
    wishlistItems.some((i) => i.id === productId);

  const clearWishlist = () => setWishlistItems([]);

  const value = {
    wishlistItems,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    clearWishlist,
    loadFromApi,
  };

  return (
    <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const ctx = useContext(WishlistContext);
  if (!ctx) throw new Error("useWishlist must be used within WishlistProvider");
  return ctx;
};
