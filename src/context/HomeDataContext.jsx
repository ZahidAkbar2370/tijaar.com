"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { homeApi } from "@/lib/api";

const HomeDataContext = createContext(null);

export const homeDataInitialState = {
  banners: [],
  sections: {},
  categories: [],
  featured_categories: [],
  browse_categories: [],
  featured_products: [],
  hot_sale_products: [],
  featured_shops: [],
  best_seller_products: [],
  all_products: [],
  recent_products: [],
  featured_products_by_category: [],
  featured_brands: [],
  flash_deals: [],
  testimonials: [],
};

function mapHomeResponse(res) {
  return {
    banners: res.banners ?? [],
    sections: res.sections ?? {},
    categories: res.categories ?? [],
    featured_categories: res.featured_categories ?? [],
    browse_categories: res.browse_categories ?? [],
    featured_products: res.featured_products ?? [],
    hot_sale_products: res.hot_sale_products ?? [],
    featured_shops: res.featured_shops ?? [],
    best_seller_products: res.best_seller_products ?? [],
    all_products: res.all_products ?? [],
    recent_products: res.recent_products ?? [],
    featured_products_by_category: res.featured_products_by_category ?? [],
    featured_brands: res.featured_brands ?? [],
    flash_deals: res.flash_deals ?? [],
    testimonials: res.testimonials ?? [],
  };
}

export function HomeDataProvider({ children, initialData = null }) {
  const [data, setData] = useState(initialData ?? homeDataInitialState);
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const hydratedFromServer = useRef(!!initialData);

  const refetch = useCallback(() => {
    setLoading(true);
    setError(null);
    homeApi
      .get()
      .then((res) => setData(mapHomeResponse(res)))
      .catch((err) => {
        setError(err);
        if (!hydratedFromServer.current) setData(homeDataInitialState);
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (hydratedFromServer.current) {
      homeApi
        .get()
        .then((res) => setData(mapHomeResponse(res)))
        .catch(() => {});
      return;
    }
    refetch();
  }, [refetch]);

  const value = useMemo(
    () => ({
      ...data,
      loading,
      error,
      refetch,
    }),
    [data, loading, error, refetch]
  );

  return <HomeDataContext.Provider value={value}>{children}</HomeDataContext.Provider>;
}

export function useHomeData() {
  const ctx = useContext(HomeDataContext);
  if (!ctx) {
    return {
      ...homeDataInitialState,
      loading: false,
      error: null,
      refetch: () => {},
    };
  }
  return ctx;
}
