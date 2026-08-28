/** Resolve image alt: use custom alt when set, otherwise static fallback. */
export function resolveImageAlt(alt, fallback = "Image") {
  const trimmed = alt != null ? String(alt).trim() : "";
  return trimmed || fallback;
}

export const IMAGE_ALT_FALLBACKS = {
  siteLogo: "Tijaar logo",
  loginLogo: "Tijaar login logo",
  heroBanner: "Home page hero banner",
  category: "Category",
  categoryBanner: "Category banner",
  brand: "Brand logo",
  product: "Product image",
  storeLogo: "Store logo",
  storeBanner: "Store banner",
  storeCover: "Store cover image",
  testimonial: "Customer photo",
  blog: "Blog featured image",
  flashDeal: "Flash deal",
  avatar: "Profile photo",
  vendor: "Seller logo",
  teamMember: "Team member photo",
  payment: "Payment method logo",
  shipping: "Shipping partner logo",
};
