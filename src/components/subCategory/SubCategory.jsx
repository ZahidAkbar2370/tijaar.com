import { useState, useMemo, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useSnackbar } from "../../context/SnackbarContext";
import useApiQuery from "../../hooks/useApiQuery";
import { getCategory, getSubcategories } from "../../services/categoriesService";
import { getProducts } from "../../services/productsService";
import { imageURL } from "../../api/axiosInstance";
import DotsLoader from "../common/DotsLoader";
import {
  MoreHorizontal,
  ChevronRight,
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
  Sparkles,
  TrendingUp,
  ShoppingCart,
  Share2,
} from "lucide-react";

const conditions = ["All", "New", "Refurbished", "Pre-owned"];
const sortOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Best Rated", "Most Popular", "Most Reviews"];
const dateRanges = ["Any Time", "Last 24 Hours", "Last 7 Days", "Last 30 Days", "Last 3 Months", "Last 6 Months", "Last Year"];
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
    transition: {
      staggerChildren: 0.05,
    },
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

const SubCategory = () => {
  const { name, subName } = useParams(); // category slug and optional subcategory slug (from route /category/:name/:subName)
  const subcategoryParam = subName; // Use subName from route params
  const navigate = useNavigate();
  const [showFilters, setShowFilters] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [selectedSubcategory, setSelectedSubcategory] = useState(subcategoryParam || "all");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [selectedCondition, setSelectedCondition] = useState("All");
  const [sortBy, setSortBy] = useState("Newest First");
  const [dateRange, setDateRange] = useState("Any Time");
  const [stockFilter, setStockFilter] = useState("All");
  const [selectedRating, setSelectedRating] = useState("All");
  const [verifiedVendors, setVerifiedVendors] = useState(false);
  const [freeShipping, setFreeShipping] = useState(false);
  const [onSale, setOnSale] = useState(false);
  const [dateRangeStart, setDateRangeStart] = useState("");
  const [dateRangeEnd, setDateRangeEnd] = useState("");

  // Update selectedSubcategory when URL param changes
  useEffect(() => {
    if (subcategoryParam) {
      setSelectedSubcategory(subcategoryParam);
    } else {
      setSelectedSubcategory("all");
    }
  }, [subcategoryParam]);

  // Fetch category data
  const { data: categoryData, isLoading: categoryLoading, isError: categoryError } = useApiQuery(
    ["category", name],
    () => getCategory(name),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!name,
    }
  );

  // Fetch subcategories
  const { data: subcategoriesData, isLoading: subcategoriesLoading } = useApiQuery(
    ["subcategories", name],
    () => getSubcategories(name),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!name,
    }
  );

  // Extract category info
  const category = useMemo(() => {
    if (!categoryData) return null;
    const data = categoryData?.data || categoryData;
    return data;
  }, [categoryData]);

  // Extract subcategories
  const subcategories = useMemo(() => {
    if (!subcategoriesData) return [];
    const data = subcategoriesData?.data || subcategoriesData;
    return Array.isArray(data) ? data : (data?.subcategories || data?.items || []);
  }, [subcategoriesData]);

  // Find selected subcategory details
  const selectedSubcategoryData = useMemo(() => {
    if (selectedSubcategory === "all") return null;
    return subcategories.find(
      (sub) => {
        const subSlug = sub.slug || sub.id || sub.name?.toLowerCase().replace(/\s+/g, "-");
        return subSlug === selectedSubcategory || sub.id === selectedSubcategory || sub.name === selectedSubcategory;
      }
    );
  }, [subcategories, selectedSubcategory]);

  // Get subcategory slug for API call
  const subcategorySlug = useMemo(() => {
    if (selectedSubcategory === "all") return null;
    if (selectedSubcategoryData) {
      return selectedSubcategoryData.slug || selectedSubcategoryData.id || selectedSubcategory;
    }
    // Fallback to selectedSubcategory if subcategoryData not found yet
    return selectedSubcategory;
  }, [selectedSubcategory, selectedSubcategoryData]);

  // Fetch products from API based on category and subcategory
  const { data: productsResponse, isLoading: productsLoading } = useApiQuery(
    ["subcategory-products", name, subcategorySlug],
    () => {
      const params = {
        category: name,
      };
      
      // If a specific subcategory is selected, add subcategory filter
      if (subcategorySlug && selectedSubcategory !== "all") {
        params.subcategory = subcategorySlug;
      }
      
      return getProducts(params);
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!name && !!category,
    }
  );

  // Extract products from API response and filter by subcategory
  const products = useMemo(() => {
    if (!productsResponse) return [];
    const data = productsResponse?.data?.data || productsResponse?.data || productsResponse;
    const allProducts = Array.isArray(data) ? data : [];
    
    // If "all" is selected, return all category products
    if (selectedSubcategory === "all") {
      return allProducts;
    }
    
    // Strict filtering: only show products from the selected subcategory
    if (subcategorySlug && selectedSubcategoryData) {
      const subSlug = selectedSubcategoryData.slug || selectedSubcategoryData.id;
      const subId = selectedSubcategoryData.id;
      const subName = selectedSubcategoryData.name?.toLowerCase().trim();
      
      return allProducts.filter((product) => {
        // Try multiple ways to match subcategory
        const productSubSlug = product.subcategory?.slug || 
                               product.subcategory_slug || 
                               (product.subcategory?.name ? product.subcategory.name.toLowerCase().replace(/\s+/g, "-") : null);
        const productSubId = product.subcategory?.id || product.subcategory_id;
        const productSubName = product.subcategory?.name?.toLowerCase().trim();
        
        // Match by slug, ID, or name (strict matching)
        const matchesSlug = productSubSlug && (productSubSlug === subSlug || productSubSlug === selectedSubcategory);
        const matchesId = productSubId && productSubId === subId;
        const matchesName = productSubName && productSubName === subName;
        
        return matchesSlug || matchesId || matchesName;
      });
    }
    
    // Fallback: if we have selectedSubcategory but no subcategoryData, filter by slug
    if (selectedSubcategory && selectedSubcategory !== "all") {
      return allProducts.filter((product) => {
        const productSubSlug = product.subcategory?.slug || 
                               product.subcategory_slug || 
                               (product.subcategory?.name ? product.subcategory.name.toLowerCase().replace(/\s+/g, "-") : null);
        return productSubSlug && productSubSlug === selectedSubcategory;
      });
    }
    
    // If no subcategory selected, return empty (shouldn't happen, but safety check)
    return [];
  }, [productsResponse, selectedSubcategory, subcategorySlug, selectedSubcategoryData]);

  // Category image and color
  const categoryImage = category?.image || category?.image_url || category?.icon || category?.icon_url;
  const categoryImageSrc = categoryImage ? (categoryImage.startsWith("http") ? categoryImage : `${imageURL}${categoryImage}`) : null;
  const categoryColor = category?.color || category?.color_class || "from-[#1790d7] to-[#4db3e8]";
  const categoryName = category?.name || category?.title || name;

  const isLoading = categoryLoading || subcategoriesLoading || productsLoading;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <DotsLoader size="lg" />
      </div>
    );
  }

  if (categoryError || !category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Category not found</h2>
          <Link to="/all-categories" className="text-[#1790d7] hover:underline">
            Browse all categories
          </Link>
        </motion.div>
      </div>
    );
  }

  const clearFilters = () => {
    setPriceRange({ min: "", max: "" });
    setSelectedCondition("All");
    setDateRange("Any Time");
    setStockFilter("All");
    setSelectedRating("All");
    setVerifiedVendors(false);
    setFreeShipping(false);
    setOnSale(false);
    setDateRangeStart("");
    setDateRangeEnd("");
  };

  return (
    <div className="bg-gray-50 min-h-screen">
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
            <ChevronRight className="w-4 h-4" />
            <Link to="/all-categories" className="hover:text-[#1790d7] transition-colors">
              Categories
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{categoryName}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`bg-gradient-to-r ${categoryColor} py-8 lg:py-12`}
      >
        <div className="w-full px-4 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-4"
            >
              <div className="w-16 h-16 lg:w-20 lg:h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                {categoryImageSrc ? (
                  <img src={categoryImageSrc} alt={categoryName} className="w-8 h-8 lg:w-10 lg:h-10" />
                ) : (
                  <MoreHorizontal className="w-8 h-8 lg:w-10 lg:h-10 text-white" />
                )}
              </div>
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-white">{categoryName}</h1>
                <p className="text-white/80 mt-1">
                  {subcategories.length} subcategories • {(category.products_count || products.length * 200)}+ ads
                </p>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-3"
            >
              <div className="relative flex-1 md:w-72">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Search in ${categoryName}...`}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/50 transition-all"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </motion.div>

      <div className="w-full px-4 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Browse Subcategories</h2>
            <Link
              to={`/category/${name}`}
              className="text-sm text-[#1790d7] hover:underline flex items-center gap-1"
            >
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedSubcategory("all");
                      navigate(`/category/${name}`);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSubcategory === "all"
                        ? "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white shadow-lg shadow-indigo-500/25"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    All {categoryName}
                  </motion.button>
            {subcategories.map((sub, index) => {
              const subName = sub.name || sub.title || sub;
              const subSlug = sub.slug || sub.id || subName.toLowerCase().replace(/\s+/g, "-");
              return (
              <motion.div
                  key={sub.id || sub.slug || index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.03 }}
              >
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      setSelectedSubcategory(subSlug);
                      navigate(`/category/${name}/${subSlug}`);
                    }}
                    className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                      selectedSubcategory === subSlug
                        ? "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white shadow-lg shadow-indigo-500/25"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }`}
                  >
                    {subName}
                  </motion.button>
              </motion.div>
              );
            })}
          </div>
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="hidden lg:block w-72 shrink-0"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sticky top-24">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <SlidersHorizontal className="w-5 h-5 text-[#1790d7]" />
                Filters
              </h3>

              <div className="space-y-5">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Tag className="w-4 h-4" />
                    Price Range
                  </label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    Condition
                  </label>
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
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Stock Status
                  </label>
                  <select
                    value={stockFilter}
                    onChange={(e) => setStockFilter(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] bg-white"
                  >
                    {stockStatus.map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Star className="w-4 h-4" />
                    Rating
                  </label>
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

                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Seller & Product Type
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={verifiedVendors}
                        onChange={(e) => setVerifiedVendors(e.target.checked)}
                        className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                      />
                      <span className="text-sm text-gray-700">Verified Sellers</span>
                      <BadgeCheck className="w-4 h-4 text-blue-500" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={freeShipping}
                        onChange={(e) => setFreeShipping(e.target.checked)}
                        className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                      />
                      <span className="text-sm text-gray-700">Free Shipping</span>
                      <Truck className="w-4 h-4 text-green-500" />
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={onSale}
                        onChange={(e) => setOnSale(e.target.checked)}
                        className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                      />
                      <span className="text-sm text-gray-700">On Sale</span>
                      <span className="px-1.5 py-0.5 bg-red-100 text-red-600 text-xs rounded">Sale</span>
                    </label>
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
              <p className="text-gray-600 text-sm">
                Showing <span className="font-semibold text-gray-900">{products.length * 10}</span> results
                {selectedSubcategory !== "all" && (
                  <span> in <span className="text-[#1790d7] font-medium">{selectedSubcategory}</span></span>
                )}
              </p>
              
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

            {viewMode === "grid" ? (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4"
              >
                {products.map((product, index) => (
                  <motion.div key={product.id || index} variants={itemVariants}>
                    <ProductCard product={product} categoryColor={categoryColor} index={index} />
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="space-y-4"
              >
                {products.map((product, index) => (
                  <motion.div key={product.id || index} variants={itemVariants}>
                    <ProductListCard product={product} categoryColor={categoryColor} />
                  </motion.div>
                ))}
              </motion.div>
            )}

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-8 flex justify-center"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-8 py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 hover:border-[#1790d7] hover:text-[#1790d7] transition-all"
              >
                Load More Results
              </motion.button>
            </motion.div>
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
                        className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      />
                      <span className="text-gray-400">-</span>
                      <input
                        type="number"
                        placeholder="Max"
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
                      value={stockFilter}
                      onChange={(e) => setStockFilter(e.target.value)}
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

                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Seller & Product Type</label>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={verifiedVendors}
                          onChange={(e) => setVerifiedVendors(e.target.checked)}
                          className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                        />
                        <span className="text-sm text-gray-700">Verified Sellers</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={freeShipping}
                          onChange={(e) => setFreeShipping(e.target.checked)}
                          className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                        />
                        <span className="text-sm text-gray-700">Free Shipping</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={onSale}
                          onChange={(e) => setOnSale(e.target.checked)}
                          className="w-4 h-4 text-[#1790d7] rounded focus:ring-[#1790d7]"
                        />
                        <span className="text-sm text-gray-700">On Sale</span>
                      </label>
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

const ProductCard = ({ product, categoryColor, index }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();
  const isWishlisted = isInWishlist(product.id);

  const productImage = product.image || product.image_url || product.thumbnail;
  const imageSrc = productImage ? (productImage.startsWith("http") ? productImage : `${imageURL}${productImage}`) : "/assets/sample-image.webp";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id || product.title.replace(/\s+/g, '-').toLowerCase(),
      title: product.title || product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: imageSrc,
      vendor: product.vendor || product.vendorName || "TechStore Pro",
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || product.title.replace(/\s+/g, '-').toLowerCase();
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
        vendor: product.vendor || product.vendorName || "TechStore Pro",
      });
      showSuccess("Product added to wishlist!");
    }
  };

  return (
    <Link to={`/product/${product.slug || product.id || product.title?.replace(/\s+/g, '-').toLowerCase()}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group cursor-pointer"
      >
        <div className="relative">
          <img
            src={imageSrc}
            alt={product.title || product.name}
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
              <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
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
          {product.tags?.[0] && (
            <span className={`absolute top-3 left-3 px-3 py-1 bg-gradient-to-r ${categoryColor} text-white text-xs font-medium rounded-full`}>
              {product.tags[0]}
            </span>
          )}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
              {product.rating || "4.8"} ({product.reviews || product.reviewsCount || (120 + index * 15)})
            </span>
            {product.shipping === "Free Shipping" && (
            <span className="flex items-center gap-1 bg-green-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
              <Truck className="w-3 h-3" />
              Free Ship
            </span>
            )}
          </div>
        </div>

        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#1790d7] transition-colors">
              {product.title || product.name}
            </h3>
            <div className="flex items-center gap-1 text-amber-500 shrink-0">
              <Star className="w-4 h-4 fill-current" />
              <span className="text-xs font-medium">{product.rating || "4.8"}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
            <Store className="w-4 h-4" />
            <span>{product.vendor || product.vendorName || "TechStore Pro"}</span>
            {product.verified && <BadgeCheck className="w-4 h-4 text-blue-600" />}
            <span className="text-xs text-gray-400">•</span>
            {product.shipping === "Free Shipping" && (
              <>
            <Truck className="w-3.5 h-3.5 text-green-500" />
            <span className="text-xs text-green-600">Free Shipping</span>
              </>
            )}
          </div>

          <p className="text-gray-500 text-sm line-clamp-2 mb-4">
            {product.description || product.shortDescription}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <span className="text-xl font-bold text-[#1790d7]">${product.price || product.price_formatted || "0.00"}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 ml-2 line-through">${product.originalPrice}</span>
              )}
            </div>
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-2 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-lg font-medium hover:shadow-lg transition-all flex items-center gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="text-sm">Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const ProductListCard = ({ product, categoryColor }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();
  const isWishlisted = isInWishlist(product.id);

  const productImage = product.image || product.image_url || product.thumbnail;
  const imageSrc = productImage ? (productImage.startsWith("http") ? productImage : `${imageURL}${productImage}`) : "/assets/sample-image.webp";

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id || product.title.replace(/\s+/g, '-').toLowerCase(),
      title: product.title || product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: imageSrc,
      vendor: product.vendor || product.vendorName || "TechStore Pro",
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || product.title.replace(/\s+/g, '-').toLowerCase();
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
        vendor: product.vendor || product.vendorName || "TechStore Pro",
      });
      showSuccess("Product added to wishlist!");
    }
  };

  return (
    <Link to={`/product/${product.slug || product.id || product.title?.replace(/\s+/g, '-').toLowerCase()}`}>
      <motion.div
        whileHover={{ x: 5 }}
        className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex gap-4 p-4 cursor-pointer"
      >
        <div className="relative w-40 h-32 shrink-0">
          <img
            src={imageSrc}
            alt={product.title || product.name}
            className="w-full h-full object-cover rounded-xl"
          />
          {product.tags?.[0] && (
            <span className={`absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r ${categoryColor} text-white text-xs font-medium rounded-full`}>
              {product.tags[0]}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className="font-semibold text-gray-900 line-clamp-1 hover:text-[#1790d7] transition-colors">{product.title || product.name}</h3>
              <motion.button
                onClick={handleWishlistToggle}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={`p-1.5 rounded-full transition-colors shrink-0 ${
                  isWishlisted ? "bg-red-50 text-red-500" : "hover:bg-gray-100 text-gray-400"
                }`}
              >
                <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
              </motion.button>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
              <span className="flex items-center gap-1">
                <Store className="w-3.5 h-3.5" />
                {product.vendor || product.vendorName || "TechStore Pro"}
              </span>
              {product.verified && <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />}
              <span className="text-xs text-gray-400">•</span>
              {product.shipping === "Free Shipping" && (
              <span className="flex items-center gap-1 text-green-600">
                <Truck className="w-3.5 h-3.5" />
                Free Shipping
              </span>
              )}
            </div>

            <p className="text-gray-500 text-sm line-clamp-1">{product.description || product.shortDescription}</p>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <span className="text-xl font-bold text-[#1790d7]">${product.price || product.price_formatted || "0.00"}</span>
              {product.originalPrice && (
                <span className="text-xs text-gray-400 ml-2 line-through">${product.originalPrice}</span>
              )}
            </div>
            <motion.button
              onClick={handleAddToCart}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-3 py-2 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-sm font-medium rounded-lg hover:shadow-lg transition-all flex items-center gap-1"
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Add to Cart</span>
            </motion.button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

export default SubCategory;
