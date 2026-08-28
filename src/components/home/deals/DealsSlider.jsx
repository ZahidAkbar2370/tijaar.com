import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Timer, Flame, ArrowRight, ChevronLeft, ChevronRight, ShoppingCart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import useApiQuery from "../../../hooks/useApiQuery";
import axiosInstance, { imageURL } from "../../../api/axiosInstance";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useSnackbar } from "../../../context/SnackbarContext";
import DotsLoader from "../../common/DotsLoader";

const DealsSlider = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();

  const { data, isLoading, isError } = useApiQuery(
    ["deals"],
    async () => {
      const res = await axiosInstance.get("/deals");
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const deals = useMemo(() => {
    const list = data?.data || data || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-16 px-4 lg:px-16 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 flex items-center justify-center">
        <DotsLoader size="md" />
      </div>
    );
  }

  if (isError || !deals.length) {
    return null;
  }

  const formatEndsIn = (endsAt) => {
    if (!endsAt) return "";
    try {
      const end = new Date(endsAt);
      const now = new Date();
      const diffMs = end - now;
      if (diffMs <= 0) return "Ended";
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs / (1000 * 60)) % 60);
      return `${hours}h ${minutes}m`;
    } catch {
      return "";
    }
  };

  return (
    <div className="py-16 px-4 lg:px-16 bg-gradient-to-r from-red-600 via-orange-500 to-amber-500 relative overflow-hidden">
      <div className="absolute inset-0">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="absolute top-10 left-10 w-32 h-32 bg-white/20 rounded-full blur-2xl"
        ></motion.div>
        <motion.div
          animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-48 h-48 bg-white/20 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="flex justify-between items-center mb-10"
        >
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-white flex items-center gap-3">
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity }}
              >
                <Flame className="w-10 h-10 text-yellow-300" />
              </motion.div>
              Flash Deals
            </h2>
            <p className="text-white/80 mt-2">Limited time offers - Grab them fast!</p>
          </div>
          <div className="flex items-center gap-3">
            <button type="button" className="deals-prev w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white hover:text-orange-600 transition-all duration-300 text-white" aria-label="Previous">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button type="button" className="deals-next w-11 h-11 flex items-center justify-center rounded-full bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white hover:text-orange-600 transition-all duration-300 text-white" aria-label="Next">
              <ChevronRight className="w-5 h-5" />
            </button>
            <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-white text-orange-600 rounded-full font-semibold hover:bg-orange-50 transition-all duration-300 shadow-lg ml-2">
              View All Deals
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </motion.div>

        <Swiper
          modules={[Autoplay, Navigation]}
          spaceBetween={24}
          slidesPerView={1}
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          navigation={{
            prevEl: ".deals-prev",
            nextEl: ".deals-next",
          }}
          breakpoints={{
            640: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
            1400: { slidesPerView: 4 },
          }}
          className="deals-swiper"
        >
          {deals.map((deal, index) => {
            const product = deal.product || {};
            const thumb = product.thumbnail;
            const imageSrc = thumb
              ? thumb.startsWith("http")
                ? thumb
                : `${imageURL}${thumb}`
              : "/assets/sample-image.webp";

            const discountPercent = deal.discount_percent || deal.discountPercent || 0;
            const discountedPrice = deal.discounted_price || deal.discountedPrice || product.price || 0;
            const originalPrice = product.price || 0;
            const endsIn = formatEndsIn(deal.ends_at || deal.endsAt);
            const sold = product.sold || 0;
            const total = product.stock || product.total || 0;
            const available = total ? total - sold : null;
            const progress = total ? Math.min(100, Math.max(0, (sold / total) * 100)) : 0;
            const productId = product.id || product.slug || product.title?.replace(/\s+/g, '-').toLowerCase();
            const isWishlisted = isInWishlist(productId);

            const handleAddToCart = (e) => {
              e.preventDefault();
              e.stopPropagation();
              addToCart({
                id: productId,
                title: product.title || product.name,
                price: discountedPrice,
                originalPrice: originalPrice,
                image: imageSrc,
                vendor: product.vendor_name || product.vendor || "N/A",
              });
            };

            const handleWishlistToggle = (e) => {
              e.preventDefault();
              e.stopPropagation();
              if (isWishlisted) {
                removeFromWishlist(productId);
                showSuccess("Product removed from wishlist");
              } else {
                addToWishlist({
                  id: productId,
                  title: product.title || product.name,
                  price: discountedPrice,
                  originalPrice: originalPrice,
                  image: imageSrc,
                  vendor: product.vendor_name || product.vendor || "N/A",
                });
                showSuccess("Product added to wishlist!");
              }
            };

            return (
              <SwiperSlide key={deal.id || product.id || index}>
                <Link to={`/product/${product.slug || product.id || ""}`}>
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-xl cursor-pointer"
                  >
                    <div className="relative h-48 overflow-hidden bg-gray-100">
                      <img
                        src={imageSrc}
                        alt={product.title || "Deal Product"}
                        className="w-full h-full object-cover"
                      />
                      
                      <div className="absolute top-3 left-3 flex items-center gap-1 bg-red-600 text-white px-3 py-1.5 rounded-full font-bold text-sm">
                        {discountPercent}% OFF
                      </div>

                      <motion.button
                        onClick={handleWishlistToggle}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className={`absolute top-3 right-3 p-2 rounded-full shadow-md transition-transform ${
                          isWishlisted ? "bg-red-500 text-white" : "bg-white text-gray-600"
                        }`}
                      >
                        <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""} transition-colors`} />
                      </motion.button>

                      {endsIn && (
                        <div className="absolute bottom-3 left-3 flex items-center gap-2 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full">
                          <Timer className="w-4 h-4 text-amber-400" />
                          <span className="text-sm font-medium">Ends in {endsIn}</span>
                        </div>
                      )}
                    </div>

                    <div className="p-5">
                      <h3 className="font-bold text-gray-900 text-lg line-clamp-1 mb-3 hover:text-red-600 transition-colors">
                        {product.title || "Deal Product"}
                      </h3>

                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-2xl font-bold text-red-600">
                          ${discountedPrice}
                        </span>
                        <span className="text-gray-400 line-through text-lg">
                          ${originalPrice}
                        </span>
                      </div>

                      {total ? (
                        <div className="mb-4">
                          <div className="flex justify-between text-sm text-gray-500 mb-1">
                            <span>Sold: {sold}</span>
                            <span>Available: {available}</span>
                          </div>
                          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: `${progress}%` }}
                              viewport={{ once: true }}
                              transition={{ duration: 1, delay: 0.3 }}
                              className="h-full bg-gradient-to-r from-red-500 to-orange-500 rounded-full"
                            ></motion.div>
                          </div>
                        </div>
                      ) : null}

                      <motion.button
                        onClick={handleAddToCart}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className="w-full py-3 bg-gradient-to-r from-red-600 to-orange-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
                      >
                        <ShoppingCart className="w-4 h-4" />
                        <span>Grab This Deal</span>
                      </motion.button>
                    </div>
                  </motion.div>
                </Link>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </div>
  );
};

export default DealsSlider;
