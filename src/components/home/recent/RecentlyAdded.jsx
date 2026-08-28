import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Clock, MapPin, Sparkles, ChevronRight, ChevronLeft, ShoppingCart } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import useApiQuery from "../../../hooks/useApiQuery";
import axiosInstance, { imageURL } from "../../../api/axiosInstance";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useSnackbar } from "../../../context/SnackbarContext";
import DotsLoader from "../../common/DotsLoader";

const formatTimeAgo = (isoString) => {
  if (!isoString) return "N/A";
  const date = new Date(isoString);
  const now = new Date();
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min${minutes > 1 ? 's' : ''} ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? 's' : ''} ago`;
};

const RecentlyAdded = () => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();

  const { data, isLoading, isError } = useApiQuery(
    ["products-recent"],
    async () => {
      const res = await axiosInstance.get("/products-recent");
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const recentItems = useMemo(() => {
    const list = data?.data || data || [];
    return Array.isArray(list) ? list : [];
  }, [data]);

  if (isLoading) {
    return (
      <div className="py-16 px-4 lg:px-16 flex items-center justify-center">
        <DotsLoader size="md" />
      </div>
    );
  }

  if (isError || !recentItems.length) {
    return null;
  }

  return (
    <div className="py-16 px-4 lg:px-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-[#4db3e8]" />
            Recently Added
          </h2>
          <p className="text-gray-500 mt-2">Fresh listings just posted</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="recent-prev p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className="recent-next p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm">
            <ChevronRight className="w-5 h-5" />
          </button>
          <button className="hidden md:flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-full font-semibold hover:bg-gray-200 transition-all duration-300 ml-2">
            See All New
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </motion.div>

      <Swiper
        modules={[Navigation, Autoplay]}
        spaceBetween={20}
        slidesPerView={2}
        navigation={{
          prevEl: ".recent-prev",
          nextEl: ".recent-next",
        }}
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        breakpoints={{
          640: { slidesPerView: 3 },
          768: { slidesPerView: 4 },
          1024: { slidesPerView: 5 },
          1400: { slidesPerView: 6 },
        }}
        className="recent-swiper"
      >
        {recentItems.map((item, index) => {
          const thumb = item.thumbnail || item.image;
          const imageSrc = thumb
            ? thumb.startsWith("http")
              ? thumb
              : `${imageURL}${thumb}`
            : "/assets/sample-image.webp";
          const categoryName = item.category?.name || item.category || "";
          const price = Number(item.price || 0);
          const location = item.location || "";
          const time = item.time || item.created_at ? formatTimeAgo(item.created_at) : "";
          const productId = item.id || item.slug || item.title?.replace(/\s+/g, '-').toLowerCase();
          const isWishlisted = isInWishlist(productId);

          const handleAddToCart = (e) => {
            e.preventDefault();
            e.stopPropagation();
            addToCart({
              id: productId,
              title: item.title || item.name,
              price: price,
              originalPrice: item.originalPrice,
              image: imageSrc,
              vendor: item.vendor_name || item.vendor || "N/A",
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
                title: item.title || item.name,
                price: price,
                originalPrice: item.originalPrice,
                image: imageSrc,
                vendor: item.vendor_name || item.vendor || "N/A",
              });
              showSuccess("Product added to wishlist!");
            }
          };

          return (
          <SwiperSlide key={item.id || item.slug || index}>
            <Link to={`/product/${item.slug || item.id || ""}`}>
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
              >
                <div className="relative h-36 overflow-hidden">
                  <img
                  src={imageSrc}
                  alt={item.title || item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  
                {time && time !== "N/A" ? (
                  <div className="absolute top-2 left-2 flex items-center gap-1 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {time}
                  </div>
                ) : null}

                  <motion.button
                    onClick={handleWishlistToggle}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className={`absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                      isWishlisted ? "bg-red-500 text-white" : "bg-white/80 text-gray-600"
                    }`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""} transition-colors`} />
                  </motion.button>

                  <div className="absolute bottom-2 left-2 bg-black/50 backdrop-blur-sm text-white px-2 py-0.5 rounded text-xs">
                    {categoryName}
                  </div>
                </div>

                <div className="p-3">
                  <h3 className="font-semibold text-gray-900 text-sm line-clamp-1 mb-1 group-hover:text-[#1790d7] transition-colors">
                    {item.title || item.name}
                  </h3>

                  {location ? (
                    <div className="flex items-center gap-1 text-gray-400 text-xs mb-2">
                      <MapPin className="w-3 h-3" />
                      <span className="line-clamp-1">{location}</span>
                    </div>
                  ) : null}

                  <div className="flex items-center justify-between">
                    <p className="text-lg font-bold text-[#1790d7]">
                      ${price.toLocaleString()}
                    </p>
                    <motion.button
                      onClick={handleAddToCart}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="p-2 bg-[#1790d7] text-white rounded-lg hover:bg-[#4db3e8] transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <ShoppingCart className="w-4 h-4" />
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

export default RecentlyAdded;
