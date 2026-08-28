/** Default H1 templates — mirrored in backend config/settings_defaults.php */
export const SEO_H1_DEFAULTS = {
  home: "Online Shopping Marketplace in Pakistan",
  category: "{name} Online in Pakistan",
  subcategory: "{name} Online in Pakistan",
  product: "{name}",
  blog: "{title}",
  blog_list: "Blog",
  policy: "{title}",
  cms: "{title}",
  shop: "Shop All Products",
  brand: "{name}",
  seller_store: "{name}",
  search: 'Search results for "{query}"',
  search_empty: "Search",
  sellers: "Our Verified Sellers",
  all_categories: "All Categories",
  best_sellers: "Best Sellers",
  flash_deals: "Flash Deals",
  flash_deal: "{title}",
  cart: "Shopping Cart",
  checkout: "Checkout",
};

/**
 * Replace {name}, {title}, {query}, {site_name} in an H1 template string.
 */
export function applySeoH1Template(template, vars = {}) {
  if (!template || typeof template !== "string") return vars.fallback || "";
  const siteName = vars.site_name || "Tijaar";
  return template
    .replace(/\{name\}/gi, vars.name ?? "")
    .replace(/\{title\}/gi, vars.title ?? "")
    .replace(/\{query\}/gi, vars.query ?? "")
    .replace(/\{site_name\}/gi, siteName)
    .trim();
}

/**
 * Resolve H1 for a page type using site settings from API/context.
 * @param {string} pageType - key in SEO_H1_DEFAULTS / seo_h1 API object
 * @param {object|null} siteSettings
 * @param {object} vars - { name, title, query, fallback, site_name }
 */
export function resolveSeoH1(pageType, siteSettings, vars = {}) {
  const fromApi = siteSettings?.seo_h1?.[pageType];
  const template =
    (typeof fromApi === "string" && fromApi.trim()) ||
    SEO_H1_DEFAULTS[pageType] ||
    "";
  const resolved = applySeoH1Template(template, {
    ...vars,
    site_name: vars.site_name || siteSettings?.site_name || "Tijaar",
  });
  if (resolved) return resolved;
  return vars.fallback || "";
}
