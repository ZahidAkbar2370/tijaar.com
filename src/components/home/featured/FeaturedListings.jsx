import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, BadgeCheck, Store, Truck, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import useApiQuery from "../../../hooks/useApiQuery";
import axiosInstance, { imageURL } from "../../../api/axiosInstance";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useSnackbar } from "../../../context/SnackbarContext";
import DotsLoader from "../../common/DotsLoader";

const getBadgeColor = (badge) => {
  switch (badge) {
    case "Best Seller":
      return "bg-gradient-to-r from-amber-500 to-orange-500";
    case "On Sale":
      return "bg-gradient-to-r from-red-500 to-pink-500";
    case "New Arrival":
      return "bg-gradient-to-r from-[#1790d7] to-[#4db3e8]";
    case "Limited Stock":
      return "bg-gradient-to-r from-purple-600 to-indigo-600";
    case "Hot Deal":
      return "bg-gradient-to-r from-red-500 to-pink-500";
    default:
      return "bg-gradient-to-r from-[#1790d7] to-[#4db3e8]";
  }
};

const FeaturedListings = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();

  const { data, isLoading, isError } = useApiQuery(
    ["products-best-sale"],
    async () => {
      const res = await axiosInstance.get("/products-best-sale");
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const featuredProducts = useMemo(() => {
    const list = data?.data || data || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-16 px-4 lg:px-16 bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <DotsLoader size="md" />
      </div>
    );
  }

  if (isError || !featuredProducts.length) {
    return null;
  }

  return (
    <div className="py-16 px-4 lg:px-16 bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Star className="w-8 h-8 text-amber-500 fill-amber-500" />
            Best Sellers
          </h2>
          <p className="text-gray-500 mt-2">Top-rated products from verified sellers</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="featured-prev p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="featured-next p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 border-2 border-[#1790d7] text-[#1790d7] rounded-full font-semibold hover:bg-[#1790d7] hover:text-white transition-all duration-300 ml-2">
            View All Products
          </button>
        </div>
      </motion.div>

      <Swiper
        modules={[Autoplay, Navigation]}
        spaceBetween={24}
        slidesPerView={1}
        autoplay={{ delay: 4000, disableOnInteraction: false }}
        navigation={{
          prevEl: ".featured-prev",
          nextEl: ".featured-next",
        }}
        breakpoints={{
          640: { slidesPerView: 2 },
          1024: { slidesPerView: 3 },
          1400: { slidesPerView: 4 },
        }}
        className="featured-swiper"
      >
        {featuredProducts.map((product, index) => {
          const thumb = product.thumbnail || product.image;
          const imageSrc = thumb
            ? thumb.startsWith("http")
              ? thumb
              : `${imageURL}${thumb}`
            : "/assets/sample-image.webp";
          const badge = product.badge || product.category?.name || "";
          const price = Number(product.price || 0);
          const originalPrice = product.originalPrice || product.original_price;
          const vendor = product.vendor || product.vendorName || product.category?.name || "";
          const shipping = product.shipping || "";
          const reviews = product.reviews || product.reviewsCount || 0;
          const rating = product.rating || "";
          // Prioritize slug since API endpoint uses slug
          const productSlug = product.slug || product.id || product.title?.replace(/\s+/g, '-').toLowerCase();
          const isWishlisted = isInWishlist(product.id || productSlug);

          const handleAddToCart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({
              id: product.id || productSlug,
              title: product.title || product.name,
              price: price,
              originalPrice: originalPrice,
              image: imageSrc,
              vendor: vendor,
            });
          };

          const handleWishlistToggle = (e) => {
            e.preventDefault();
            e.stopPropagation();
            const productId = product.id || productSlug;
            if (isWishlisted) {
              removeFromWishlist(productId);
              showSuccess("Product removed from wishlist");
            } else {
              addToWishlist({
                id: productId,
                title: product.title || product.name,
                price: price,
                originalPrice: originalPrice,
                image: imageSrc,
                vendor: vendor,
              });
              showSuccess("Product added to wishlist!");
            }
          };

          return (
          <SwiperSlide key={product.id || product.slug || index}>
            <Link to={`/product/${productSlug}`}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -8 }}
                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100"
              >
                <div className="relative h-52 overflow-hidden">
                  <img
                    src={imageSrc}
                    alt={product.title || "Featured product"}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                  />
                  
                  {badge ? (
                    <span className={`absolute top-4 left-4 px-3 py-1 text-xs font-bold text-white rounded-full ${getBadgeColor(badge)}`}>
                      {badge}
                    </span>
                  ) : null}

                  <motion.button
                    onClick={handleWishlistToggle}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute top-4 right-4 p-2 rounded-full hover:scale-110 transition-all duration-300 ${
                      isWishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white"
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""} transition-colors`} />
                  </motion.button>

                {rating ? (
                  <div className="absolute bottom-4 left-4 flex items-center gap-1 bg-black/60 backdrop-blur-sm px-2 py-1 rounded-lg">
                    <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                    <span className="text-white text-sm font-medium">{rating}</span>
                  </div>
                ) : null}
              </div>

              <div className="p-5">
                <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-2">
                  {product.title || product.name}
                </h3>

                {vendor ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
                    <Store className="w-4 h-4" />
                    <span>{vendor}</span>
                    <BadgeCheck className="w-4 h-4 text-blue-500" />
                  </div>
                ) : null}

                {(shipping || reviews) ? (
                  <div className="flex items-center gap-2 text-gray-500 text-sm mb-4">
                    {shipping ? (
                      <>
                        <Truck className="w-4 h-4 text-green-500" />
                        <span>{shipping}</span>
                        <span className="mx-1">•</span>
                      </>
                    ) : null}
                    {reviews ? (
                      <span className="text-xs">({Number(reviews).toLocaleString()} reviews)</span>
                    ) : null}
                  </div>
                ) : null}

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <div>
                    {originalPrice ? (
                      <p className="text-xs text-gray-400 line-through mb-1">
                        ${Number(originalPrice).toLocaleString()}
                      </p>
                    ) : null}
                    <p className="text-2xl font-bold bg-gradient-to-r from-[#1790d7] to-[#4db3e8] bg-clip-text text-transparent">
                      ${price.toLocaleString()}
                    </p>
                  </div>
                  <motion.button
                    onClick={handleAddToCart}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="px-5 py-2.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300 flex items-center gap-2"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </motion.button>
                </div>
              </div>
            </motion.div>
            </Link>
          </SwiperSlide>
        );
        })}
      </Swiper>
    </div>
  );
};

export default FeaturedListings;
