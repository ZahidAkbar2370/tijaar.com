/** Mobile-first defaults: ~2.2 compact portrait cards visible in horizontal scroll. */
export const PRODUCT_CARD_SWIPER_DEFAULT = {
  slidesPerView: 2.2,
  spaceBetween: 8,
};

/** Shared Swiper breakpoints: 6 compact product cards per row on large screens. */
export const PRODUCT_CARD_SWIPER_BREAKPOINTS = {
  480: { slidesPerView: 2.35, spaceBetween: 10 },
  640: { slidesPerView: 3, spaceBetween: 12 },
  768: { slidesPerView: 4, spaceBetween: 12 },
  1024: { slidesPerView: 5, spaceBetween: 14 },
  1280: { slidesPerView: 6, spaceBetween: 14 },
};

export const PRODUCT_CARD_GRID_CLASS =
  "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2 sm:gap-3 items-stretch";
