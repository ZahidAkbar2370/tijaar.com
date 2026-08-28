import { useState, useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  SlidersHorizontal,
  X,
  Store,
  Heart,
  Grid3X3,
  List,
  ChevronDown,
  Search,
  Star,
  BadgeCheck,
  Tag,
  Truck,
  Shield,
  ShoppingCart,
  Share2,
  Eye,
  Percent,
  Package,
} from "lucide-react";
import useApiQuery from "../../hooks/useApiQuery";
import { getProducts } from "../../services/productsService";
import axiosInstance from "../../api/axiosInstance";
import { imageURL } from "../../api/axiosInstance";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { resolveImageAlt, IMAGE_ALT_FALLBACKS } from "@/lib/imageAlt";
import DotsLoader from "../common/DotsLoader";

const sortOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Best Rated", "Most Popular", "Most Reviews"];
const conditions = ["All", "New", "Refurbished", "Pre-owned"];
const stockStatus = ["All", "In Stock", "Low Stock", "Out of Stock"];
const ratings = ["All", 5, 4, 3, 2, 1];
const renderStars = (count) => {
  if (count === "All") return "All";
  const filled = "★".repeat(count);
  const empty = "☆".repeat(5 - count);
  return `${filled}${empty}`;
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

const ProductCard = ({ product, index }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();
  const isWishlisted = isInWishlist(product.id || product.slug);

  const productImage = product.thumbnail || product.image || product.image_url;
  const imageSrc = productImage
    ? productImage.startsWith("http")
      ? productImage
      : `${imageURL}${productImage}`
    : "/assets/sample-image.webp";
  const productLink = `/product/${product.slug || product.id || product.title?.replace(/\s+/g, '-').toLowerCase()}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id || product.slug || product.title?.replace(/\s+/g, '-').toLowerCase(),
      title: product.title || product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: imageSrc,
      vendor: product.vendor_name || product.vendor || "N/A",
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || product.slug || product.title?.replace(/\s+/g, '-').toLowerCase();
    if (isWishlisted) {
      removeFromWishlist(productId);
      showSuccess("Product removed from wishlist");
    } else {
      addToWishlist({
        id: productId,
        title: product.title || product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: imageSrc,
        vendor: product.vendor_name || product.vendor || "N/A",
      });
      showSuccess("Product added to wishlist!");
    }
  };

  return (
    <Link to={productLink}>
      <motion.div
        variants={itemVariants}
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group cursor-pointer"
      >
        <div className="relative">
          <img
            src={imageSrc}
            alt={resolveImageAlt(product.image_alt, product.title || product.name || IMAGE_ALT_FALLBACKS.product)}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            <motion.button
              onClick={handleWishlistToggle}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`p-2 rounded-full shadow-md hover:bg-white transition-all ${
                isWishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-gray-600"
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""} transition-colors`} />
            </motion.button>
            <motion.button
              onClick={(e) => e.preventDefault()}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
            >
              <Share2 className="w-4 h-4 text-gray-600" />
            </motion.button>
          </div>
          {product.originalPrice && product.price && Number(product.originalPrice) > Number(product.price) && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-red-500 text-white text-xs font-medium rounded-full">
              {Math.round((1 - Number(product.price) / Number(product.originalPrice)) * 100)}% OFF
            </span>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            {product.shipping && (
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
                <Truck className="w-3 h-3" />
                {product.shipping}
              </span>
            )}
            {(product.rating_avg || product.rating) && (
              <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {Number(product.rating_avg || product.rating || 0).toFixed(1)}
              </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
            <Store className="w-4 h-4" />
            <span>{product.vendor_name || product.vendor || "N/A"}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>

          <h3 className="font-bold text-gray-900 text-lg line-clamp-2 mb-2 group-hover:text-[#1790d7] transition-colors">
            {product.title || product.name}
          </h3>

          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <p className="text-xs text-gray-400 line-through">${Number(product.originalPrice).toFixed(2)}</p>
              )}
              <p className="text-2xl font-bold bg-gradient-to-r from-[#1790d7] to-[#4db3e8] bg-clip-text text-transparent">
                ${Number(product.price).toFixed(2)}
              </p>
            </div>
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-medium hover:shadow-lg hover:shadow-indigo-500/30 transition-all"
            >
              <ShoppingCart className="w-5 h-5" />
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ProductListCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();
  const isWishlisted = isInWishlist(product.id || product.slug);

  const productImage = product.thumbnail || product.image || product.image_url;
  const imageSrc = productImage
    ? productImage.startsWith("http")
      ? productImage
      : `${imageURL}${productImage}`
    : "/assets/sample-image.webp";
  const productLink = `/product/${product.slug || product.id || product.title?.replace(/\s+/g, '-').toLowerCase()}`;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id || product.slug || product.title?.replace(/\s+/g, '-').toLowerCase(),
      title: product.title || product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: imageSrc,
      vendor: product.vendor_name || product.vendor || "N/A",
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || product.slug || product.title?.replace(/\s+/g, '-').toLowerCase();
    if (isWishlisted) {
      removeFromWishlist(productId);
      showSuccess("Product removed from wishlist");
    } else {
      addToWishlist({
        id: productId,
        title: product.title || product.name,
        price: product.price,
        originalPrice: product.originalPrice,
        image: imageSrc,
        vendor: product.vendor_name || product.vendor || "N/A",
      });
      showSuccess("Product added to wishlist!");
    }
  };

  return (
    <Link to={productLink}>
      <motion.div
        variants={itemVariants}
        whileHover={{ x: 5 }}
        className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex gap-4 group"
      >
        <div className="relative w-32 h-32 shrink-0 overflow-hidden rounded-xl">
          <img
            src={imageSrc}
            alt={resolveImageAlt(product.image_alt, product.title || product.name || IMAGE_ALT_FALLBACKS.product)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">
            <Store className="w-4 h-4" />
            <span>{product.vendor_name || product.vendor || "N/A"}</span>
            <BadgeCheck className="w-4 h-4 text-blue-500" />
          </div>

          <h3 className="font-semibold text-gray-900 text-lg mb-2 group-hover:text-[#1790d7] transition-colors line-clamp-1">
            {product.title || product.name}
          </h3>

          <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
            {(product.rating_avg || product.rating) && (
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                {Number(product.rating_avg || product.rating || 0).toFixed(1)} ({product.reviews || 0} reviews)
              </span>
            )}
            {product.shipping && (
              <span className="flex items-center gap-1">
                <Truck className="w-4 h-4" />
                {product.shipping}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            <div>
              {product.originalPrice && Number(product.originalPrice) > Number(product.price) && (
                <p className="text-xs text-gray-400 line-through">${Number(product.originalPrice).toFixed(2)}</p>
              )}
              <p className="text-xl font-bold text-[#1790d7]">${Number(product.price).toFixed(2)}</p>
            </div>
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-6 py-2 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const BrandProducts = () => {
  const { slug } = useParams(); // Brand slug from route
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [selectedStock, setSelectedStock] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [sortBy, setSortBy] = useState("Newest First");

  // Fetch brand data
  const { data: brandData, isLoading: brandLoading } = useApiQuery(
    ["brand", slug],
    async () => {
      const res = await axiosInstance.get(`/brands/${slug}`);
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!slug,
    }
  );

  // Extract brand info
  const brand = useMemo(() => {
    if (!brandData) return null;
    const data = brandData?.data || brandData;
    return data;
  }, [brandData]);

  // Fetch products from API filtered by brand
  const { data: productsResponse, isLoading, isFetching, isError } = useApiQuery(
    ["brand-products", slug, searchQuery, priceRange, selectedCondition, selectedStock, selectedRating, sortBy],
    async () => {
      const params = {
        brand: slug,
        search: searchQuery || undefined,
        min_price: priceRange.min || undefined,
        max_price: priceRange.max || undefined,
        condition: selectedCondition === "All" ? undefined : selectedCondition,
        stock_status: selectedStock === "All" ? undefined : selectedStock,
        min_rating: selectedRating === "All" ? undefined : selectedRating,
        sort_by: sortBy,
      };
      const res = await getProducts(params);
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!slug,
    }
  );

  const allProducts = useMemo(() => {
    if (!productsResponse) return [];
    const list = productsResponse?.data?.data || productsResponse?.data || productsResponse;
    return Array.isArray(list) ? list : [];
  }, [productsResponse]);

  // Additional client-side filtering by brand (safety check)
  const filteredProducts = useMemo(() => {
    return allProducts.filter((product) => {
      // Ensure product belongs to the selected brand
      const productBrandSlug = product.brand?.slug || 
                               product.brand_slug || 
                               (product.brand?.name ? product.brand.name.toLowerCase().replace(/\s+/g, "-") : null);
      const productBrandId = product.brand?.id || product.brand_id;
      const productBrandName = product.brand?.name?.toLowerCase().trim();
      
      const brandSlug = brand?.slug || slug;
      const brandId = brand?.id;
      const brandName = brand?.name?.toLowerCase().trim();
      
      const matchesBrand = (productBrandSlug && productBrandSlug === brandSlug) ||
                          (productBrandId && productBrandId === brandId) ||
                          (productBrandName && productBrandName === brandName);
      
      if (!matchesBrand) return false;

      const matchesSearch = 
        (product.title || product.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (product.category?.name || product.category || "").toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = 
        (!priceRange.min || Number(product.price) >= Number(priceRange.min)) &&
        (!priceRange.max || Number(product.price) <= Number(priceRange.max));
      
      const productCondition = product.condition ? product.condition.charAt(0).toUpperCase() + product.condition.slice(1) : "";
      const matchesCondition = selectedCondition === "All" || productCondition === selectedCondition;
      
      const stockStatusMap = {
        "in_stock": "In Stock",
        "out_of_stock": "Out of Stock",
        "low_stock": "Low Stock"
      };
      const productStockStatus = stockStatusMap[product.stock_status] || product.stock_status;
      const matchesStock = selectedStock === "All" || productStockStatus === selectedStock;
      
      const productRating = product.rating_avg || product.rating || 0;
      const matchesRating = selectedRating === "All" ||
        Number(productRating) >= selectedRating;

      return matchesSearch && matchesPrice && matchesCondition && matchesStock && matchesRating;
    });
  }, [allProducts, searchQuery, priceRange, selectedCondition, selectedStock, selectedRating, brand, slug]);

  const clearFilters = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedCondition("All");
    setSelectedStock("All");
    setSelectedRating("All");
    setSearchQuery("");
  };

  const brandName = brand?.name || slug?.replace(/-/g, " ").replace(/\b\w/g, l => l.toUpperCase()) || "Brand";
  const brandImageSrc = (() => {
    if (brand?.logo_url) return brand.logo_url;
    const raw = brand?.image || brand?.logo;
    if (!raw) return null;
    const s = String(raw).trim();
    if (s.startsWith("http")) return s;
    const base = imageURL.replace(/\/$/, "");
    if (s.startsWith("upload/")) return `${base}/${s}`;
    return `${base}/storage/${s}`;
  })();

  // Show initial loading only on first load
  if ((isLoading || brandLoading) && !productsResponse) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
        <DotsLoader size="lg" />
      </div>
    );
  }

  if (isError && !productsResponse) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center py-20">
        <p className="text-red-500 text-lg">Failed to load brand products.</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen relative">
      {/* Circular Preloader Overlay */}
      {isFetching && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-50 flex items-center justify-center"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-10 shadow-2xl flex flex-col items-center gap-6 min-w-[200px]"
          >
            <div className="relative w-24 h-24">
              <div className="absolute inset-0 border-4 border-[#1790d7]/10 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-transparent border-t-[#1790d7] rounded-full animate-spin"></div>
              <div className="absolute inset-2 border-4 border-transparent border-r-[#4db3e8] rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '0.7s' }}></div>
              <motion.div
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-6 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-full"
              ></motion.div>
            </div>
            <div className="text-center">
              <p className="text-gray-800 font-semibold text-lg mb-1">Loading Products</p>
              <p className="text-gray-500 text-sm">Please wait...</p>
            </div>
          </motion.div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-100"
      >
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Link to="/" className="hover:text-[#1790d7] transition-colors flex items-center gap-1">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            <Link to="/shop" className="hover:text-[#1790d7] transition-colors">Shop</Link>
            <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">{brandName}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-8 lg:py-12"
      >
        <div className="w-full px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-6"
          >
            {brandImageSrc && (
              <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center p-4">
                <img src={brandImageSrc} alt={resolveImageAlt(brand?.logo_alt, brandName || IMAGE_ALT_FALLBACKS.brand)} className="w-full h-full object-contain" />
              </div>
            )}
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">{brandName} Products</h1>
              <p className="text-white/80 text-lg">
                Discover all products from {brandName}. Fast shipping, secure payments, and 24/7 support.
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full px-4 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#1790d7]" />
                Filters
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      placeholder="Min"
                      value={priceRange.min}
                      onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                    />
                    <span className="text-gray-400">-</span>
                    <input
                      type="number"
                      placeholder="Max"
                      value={priceRange.max}
                      onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Condition</label>
                  <div className="space-y-2">
                    {conditions.map((condition) => (
                      <label key={condition} className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="condition"
                          checked={selectedCondition === condition}
                          onChange={() => setSelectedCondition(condition)}
                          className="w-4 h-4 text-[#1790d7] focus:ring-[#1790d7]"
                        />
                        <span className="text-sm text-gray-700">{condition}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
                  <select
                    value={selectedStock}
                    onChange={(e) => setSelectedStock(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] bg-white"
                  >
                    {stockStatus.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                  <div className="space-y-2">
                    {ratings.map((rating) => {
                      const value = rating === "All" ? "All" : rating;
                      const checked = selectedRating === value;
                      return (
                        <label key={rating} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={checked}
                            onChange={() =>
                              setSelectedRating(checked ? "All" : value)
                            }
                            className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                          />
                          <span className="text-sm text-gray-700">{renderStars(rating)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                <div className="pt-2 space-y-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-2.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-medium hover:shadow-lg transition-all"
                  >
                    Apply Filters
                  </motion.button>
                  <button
                    onClick={clearFilters}
                    className="w-full py-2.5 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                  >
                    Clear All Filters
                  </button>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="flex-1">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
            >
              <div className="relative flex-1 sm:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                />
              </div>

              <div className="flex items-center gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowFilters(true)}
                  className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
                >
                  <SlidersHorizontal className="w-4 h-4" />
                  Filters
                </motion.button>

                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] cursor-pointer"
                  >
                    {sortOptions.map((option) => (
                      <option key={option} value={option}>{option}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                <div className="hidden sm:flex items-center gap-1 bg-white border border-gray-200 rounded-xl p-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#1790d7] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#1790d7] text-white" : "text-gray-500 hover:bg-gray-100"}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>

            <p className="text-gray-600 text-sm mb-6">
              Showing <span className="font-semibold text-gray-900">{filteredProducts.length}</span> products from {brandName}
            </p>

            {viewMode === "grid" ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {filteredProducts.map((product, index) => (
                  <ProductCard key={product.id || index} product={product} index={index} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {filteredProducts.map((product, index) => (
                  <ProductListCard key={product.id || index} product={product} />
                ))}
              </motion.div>
            )}

            {filteredProducts.length === 0 && (
              <div className="text-center py-16">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No products found for {brandName}</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 text-[#1790d7] hover:underline"
                >
                  Clear all filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/50 z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 lg:hidden overflow-y-auto"
            >
              <div className="p-5">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <SlidersHorizontal className="w-5 h-5 text-[#1790d7]" />
                    Filters
                  </h3>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Price Range</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        placeholder="Min"
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({ ...priceRange, min: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={priceRange.max}
                        onChange={(e) => setPriceRange({ ...priceRange, max: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Condition</label>
                    <div className="space-y-2">
                      {conditions.map((condition) => (
                        <label key={condition} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="condition-mobile"
                            checked={selectedCondition === condition}
                            onChange={() => setSelectedCondition(condition)}
                            className="w-4 h-4 text-[#1790d7] focus:ring-[#1790d7]"
                          />
                          <span className="text-sm text-gray-700">{condition}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Stock Status</label>
                    <select
                      value={selectedStock}
                      onChange={(e) => setSelectedStock(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] bg-white"
                    >
                      {stockStatus.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Rating</label>
                    <div className="space-y-2">
                      {ratings.map((rating) => {
                        const value = rating === "All" ? "All" : rating;
                        const checked = selectedRating === value;
                        return (
                          <label key={rating} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setSelectedRating(checked ? "All" : value)
                              }
                              className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                            />
                            <span className="text-sm text-gray-700">{renderStars(rating)}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      onClick={() => setShowFilters(false)}
                      className="w-full py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-medium"
                    >
                      Apply Filters
                    </button>
                    <button
                      onClick={clearFilters}
                      className="w-full py-3 text-gray-600 hover:text-gray-900 text-sm font-medium transition-colors"
                    >
                      Clear All
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default BrandProducts;

