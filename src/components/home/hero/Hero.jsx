import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  Search,
  ChevronDown,
  Briefcase,
  Sparkles,
  ArrowRight,
  Heart,
  TrendingUp,
  Store,
  ShoppingCart,
} from "lucide-react";
import useApiQuery from "../../../hooks/useApiQuery";
import axiosInstance, { imageURL } from "../../../api/axiosInstance";
import { getCategories } from "../../../services/categoriesService";
import { useCart } from "../../../context/CartContext";
import { useWishlist } from "../../../context/WishlistContext";
import { useSnackbar } from "../../../context/SnackbarContext";
import heroBg from "/assets/herobg.jpg";

const Hero = () => {
  const [currentProduct, setCurrentProduct] = useState(0);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();

  const { data: heroResponse, isLoading, isError } = useApiQuery(
    ["hero"],
    async () => {
      const res = await axiosInstance.get("/hero");
      return res?.data?.data || res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const heroData = heroResponse || {};

  const { data: categoriesResponse } = useApiQuery(
    ["categories"],
    () => getCategories(),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  const categories = useMemo(() => {
    const list = heroData.categories || [];
    return Array.isArray(list) ? list : [];
  }, [heroData]);

  const categoriesSelect = useMemo(() => {
    const data = categoriesResponse?.data || categoriesResponse;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.categories)) return data.categories;
    return categories; // fallback to hero categories
  }, [categoriesResponse, categories]);

  const featuredProducts = useMemo(() => {
    const list = heroData.featured_products || heroData.featuredProducts || [];
    return Array.isArray(list) ? list : [];
  }, [heroData]);

  const currentFeatured = useMemo(() => {
    if (!featuredProducts.length) return null;
    const safeIndex = currentProduct % featuredProducts.length;
    return featuredProducts[safeIndex];
  }, [featuredProducts, currentProduct]);

  const trendingTags = useMemo(() => {
    if (categories.length > 0) {
      return categories.map((c) => c.name).slice(0, 6);
    }
    return ["Smartphones", "Laptops", "Fashion", "Home Decor", "Beauty", "Accessories"];
  }, [categories]);

  useEffect(() => {
    if (!featuredProducts.length) return;
    const productInterval = setInterval(() => {
      setCurrentProduct((prev) => (prev + 1) % featuredProducts.length);
    }, 4000);
    return () => clearInterval(productInterval);
  }, [featuredProducts]);

  const title1 = heroData.title1 || "";
  const title2 = heroData.title2 || "";
  const description = heroData.description || "";
  const heroBgSrc = heroData.background_image
    ? heroData.background_image.startsWith("http")
      ? heroData.background_image
      : `${imageURL}${heroData.background_image}`
    : heroBg;

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0">
        <img
          src={heroBgSrc}
          alt="Hero Background"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/95 via-white/90 to-white/75"></div>
      </div>

      <div className="relative z-10 w-full px-4 lg:px-8 py-10 lg:py-14">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.span 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1790d7]/10 rounded-full text-[#1790d7] text-sm font-medium mb-6"
            >
              <Sparkles className="w-4 h-4" />
              #1 Multi-Sellers Marketplace
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6"
            >
              {title1}
              <span className="block text-shine">
                {title2}
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-gray-600 text-lg mb-8 max-w-lg"
            >
              {description}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl p-3 shadow-xl shadow-gray-200/50 mb-6 border border-gray-100"
            >
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products, brands, sellers..."
                    className="w-full pl-12 pr-4 py-3.5 bg-gray-50 rounded-xl text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:bg-white border border-transparent focus:border-[#1790d7]/30 transition-all"
                  />
                </div>
                <div className="relative">
                  <Store className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <select className="appearance-none pl-12 pr-10 py-3.5 bg-gray-50 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:bg-white border border-transparent focus:border-[#1790d7]/30 cursor-pointer transition-all">
                    <option value="">All Categories</option>
                    {categoriesSelect.map((cat) => (
                      <option key={cat.slug || cat.name} value={cat.slug || cat.name}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="px-8 py-3.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-xl text-white font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
                >
                  Search
                </motion.button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex flex-wrap items-center gap-2"
            >
              <span className="flex items-center gap-1 text-gray-500 text-sm">
                <TrendingUp className="w-4 h-4" />
                Trending:
              </span>
              {trendingTags.map((tag, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.7 + index * 0.05 }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-[#1790d7]/10 hover:text-[#1790d7] rounded-full text-gray-600 text-sm cursor-pointer transition-colors"
                >
                  {tag}
                </motion.span>
              ))}
            </motion.div>
          </motion.div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {categories.map((cat, index) => {
                const categoryImage = cat.image || cat.image_url || cat.icon;
                const imageSrc = categoryImage
                  ? categoryImage.startsWith("http")
                    ? categoryImage
                    : `${imageURL}${categoryImage}`
                  : null;
                return (
                  <motion.div
                    key={cat.slug || cat.name || index}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    <Link to={`/category/${cat.slug || cat.name}`}>
                      <motion.div
                        whileHover={{ scale: 1.02, y: -3 }}
                        className="relative overflow-hidden rounded-2xl p-5 bg-white border border-gray-100 shadow-lg shadow-gray-100/50 cursor-pointer group hover:border-[#1790d7]/20 hover:shadow-xl transition-all"
                      >
                        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-gradient-to-br from-[#1790d7]/5 to-[#4db3e8]/10 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
                        
                        <div className="relative z-10 flex items-center gap-4">
                          <div className="p-3 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-xl shadow-lg shadow-indigo-500/20">
                            {imageSrc ? (
                              <img src={imageSrc} alt={cat.name} className="w-10 h-10 rounded-lg object-cover" />
                            ) : (
                              <Store className="w-5 h-5 text-white" />
                            )}
                          </div>
                          <div>
                            <h3 className="text-gray-900 font-bold">{cat.name}</h3>
                            <span className="text-[#1790d7] text-sm font-medium">
                              {(cat.total_products ?? cat.count) ?? 0} products
                            </span>
                          </div>
                          <ArrowRight className="w-4 h-4 text-gray-400 ml-auto group-hover:text-[#1790d7] group-hover:translate-x-1 transition-all" />
                        </div>
                      </motion.div>
                    </Link>
                  </motion.div>
                );
              })}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="relative rounded-2xl overflow-hidden bg-white border border-gray-100 shadow-xl"
            >
              <div className="absolute top-4 left-4 z-20 flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-full shadow-lg">
                <Sparkles className="w-3 h-3 text-white" />
                <span className="text-white text-xs font-bold">FEATURED</span>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentProduct}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.5 }}
                  className="relative aspect-[16/9]"
                >
                  {currentFeatured && (
                    <img
                      src={
                        currentFeatured.thumbnail?.startsWith("http")
                          ? currentFeatured.thumbnail
                          : currentFeatured.thumbnail
                            ? `${imageURL}${currentFeatured.thumbnail}`
                            : "/assets/sample-image.webp"
                      }
                      alt={currentFeatured.name || currentFeatured.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {currentFeatured && (() => {
                    const productId = currentFeatured.id || currentFeatured.slug || currentFeatured.title?.replace(/\s+/g, '-').toLowerCase();
                    const isWishlisted = isInWishlist(productId);
                    const featuredImageSrc = currentFeatured.thumbnail?.startsWith("http")
                      ? currentFeatured.thumbnail
                      : currentFeatured.thumbnail
                        ? `${imageURL}${currentFeatured.thumbnail}`
                        : "/assets/sample-image.webp";

                    const handleAddToCart = (e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      addToCart({
                        id: productId,
                        title: currentFeatured.name || currentFeatured.title,
                        price: currentFeatured.price,
                        originalPrice: currentFeatured.originalPrice,
                        image: featuredImageSrc,
                        vendor: currentFeatured.category?.name || currentFeatured.vendor || "Marketplace",
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
                          title: currentFeatured.name || currentFeatured.title,
                          price: currentFeatured.price,
                          originalPrice: currentFeatured.originalPrice,
                          image: featuredImageSrc,
                          vendor: currentFeatured.category?.name || currentFeatured.vendor || "Marketplace",
                        });
                        showSuccess("Product added to wishlist!");
                      }
                    };

                    return (
                      <>
                        <motion.button
                          onClick={handleWishlistToggle}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className={`absolute top-4 right-4 p-2.5 rounded-full shadow-lg transition-colors ${
                            isWishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-white"
                          }`}
                        >
                          <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""} transition-colors`} />
                        </motion.button>

                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <h3 className="text-white font-bold text-lg mb-1">
                            {currentFeatured.name || currentFeatured.title}
                          </h3>
                          <div className="flex items-center gap-2 text-gray-300 text-sm mb-3">
                            {currentFeatured.category?.image ? (
                              <img
                                src={
                                  currentFeatured.category.image.startsWith("http")
                                    ? currentFeatured.category.image
                                    : `${imageURL}${currentFeatured.category.image}`
                                }
                                alt={currentFeatured.category.name || "Category"}
                                className="w-5 h-5 rounded-full object-cover"
                              />
                            ) : (
                              <Store className="w-4 h-4" />
                            )}
                            {currentFeatured.category?.name || currentFeatured.vendor || "Marketplace"}
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-white">
                              ${currentFeatured.price || "0.00"}
                            </span>
                            <motion.button
                              onClick={handleAddToCart}
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="px-4 py-2 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              <span>Add to Cart</span>
                            </motion.button>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {featuredProducts.length > 0 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                      {featuredProducts.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentProduct(index)}
                          className={`h-2 rounded-full transition-all ${
                            index === currentProduct ? "bg-white w-6" : "bg-white/50 w-2"
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            >
              <Link to="/all-categories">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-2xl cursor-pointer group shadow-lg hover:shadow-xl transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-xl">
                      <Briefcase className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-white font-semibold">Explore All Categories</h4>
                      <p className="text-white/70 text-sm">14 categories • 100K+ products</p>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white group-hover:translate-x-2 transition-transform" />
                </motion.div>
              </Link>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
