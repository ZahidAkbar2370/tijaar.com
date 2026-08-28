const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";

/** Server-side fetch for homepage data (avoids client loading skeleton CLS). */
export async function fetchHomeData() {
  try {
    const res = await fetch(`${API_BASE}/home`, {
      next: { revalidate: 60 },
      headers: { Accept: "application/json" },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (!json?.success) return null;
    return json;
  } catch {
    return null;
  }
}

export function mapHomeApiResponse(res) {
  if (!res) return null;
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
