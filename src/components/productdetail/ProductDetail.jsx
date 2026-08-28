import { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useSnackbar } from "../../context/SnackbarContext";
import useApiQuery from "../../hooks/useApiQuery";
import useApiMutation from "../../hooks/useApiMutation";
import { getProduct, submitProductRating } from "../../services/productsService";
import axiosInstance, { imageURL } from "../../api/axiosInstance";
import DotsLoader from "../common/DotsLoader";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Thumbs, Zoom, Autoplay } from "swiper/modules";
import { ChevronLeft, ChevronRight, ChevronRight as ChevronRightIcon } from "lucide-react";
import {
  Heart,
  Share2,
  Store,
  Clock,
  Eye,
  Phone,
  MessageCircle,
  Mail,
  Home,
  Star,
  BadgeCheck,
  Shield,
  Flag,
  Bookmark,
  Calendar,
  Tag,
  Package,
  Truck,
  CheckCircle2,
  Info,
  Facebook,
  Twitter,
  Copy,
  Printer,
  User,
  MessageSquare,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Bell,
  ShoppingCart,
  Video,
  Camera,
  ThumbsUp,
  AlertCircle,
  Send,
  ChevronDown,
  ChevronUp,
  Users,
  Award,
  Zap,
  ShieldCheck,
  History,
  FileText,
  DollarSign,
  Percent,
  Gift,
  Headphones,
  RotateCcw,
  Play,
  X,
  Plus,
  Minus,
  Check,
  Box,
  CreditCard,
  RefreshCcw,
} from "lucide-react";

// Helper function to format date
const formatDateAgo = (dateString) => {
  if (!dateString) return "Recently";
  const date = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - date);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "1 day ago";
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  return `${Math.floor(diffDays / 365)} years ago`;
};


const shoppingTips = [
  "Check product specifications before purchasing",
  "Read customer reviews for real experiences",
  "Verify seller ratings and return policies",
  "Compare prices with similar products",
  "Contact seller for any questions before buying",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: "easeOut" },
  },
};

const ProductDetail = () => {
  // Get slug from route params (route uses :productId but it can be slug)
  const { productId } = useParams();
  const slug = productId; // The route param is productId but it contains the slug
  
  // Debug: Log the slug being used
  useEffect(() => {
    console.log("ProductDetail: Route param (productId):", productId);
    console.log("ProductDetail: Using slug:", slug);
  }, [productId, slug]);
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { showSuccess } = useSnackbar();
  const [thumbsSwiper, setThumbsSwiper] = useState(null);
  const [showPhone, setShowPhone] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [showAllSpecs, setShowAllSpecs] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedStorage, setSelectedStorage] = useState(null);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [newQuestion, setNewQuestion] = useState("");
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [priceAlertEnabled, setPriceAlertEnabled] = useState(false);
  const [expandedReview, setExpandedReview] = useState(null);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showRatingForm, setShowRatingForm] = useState(false);
  const [ratingForm, setRatingForm] = useState({
    name: "",
    rating: 0,
    comment: "",
  });
  
  const shareMenuRef = useRef(null);

  // Fetch product data from API using slug
  const { data: productResponse, isLoading, isError, error } = useApiQuery(
    ["product", slug], // Use slug in cache key to ensure different products don't share cache
    async () => {
      if (!slug) {
        console.warn("ProductDetail: No slug provided");
        return null;
      }
      
      console.log("ProductDetail: Fetching product with slug:", slug);
      
      try {
        const res = await getProduct(slug);
        console.log("ProductDetail: API Response:", res);
        
        // Handle axios response: res.data = { message: "Success", data: {...} }
        // Extract the actual product data
        if (res?.data?.data) {
          console.log("ProductDetail: Extracted data from res.data.data:", res.data.data);
          return res.data.data;
        }
        if (res?.data) {
          console.log("ProductDetail: Using res.data directly:", res.data);
          // If data is directly the product object (fallback)
          return res.data;
        }
        console.log("ProductDetail: Using res directly:", res);
        return res;
      } catch (err) {
        console.error("ProductDetail: Error fetching product:", err);
        console.error("ProductDetail: Error details:", {
          message: err?.message,
          response: err?.response?.data,
          status: err?.response?.status
        });
        // Error will be handled by useApiQuery's onError
        throw err;
      }
    },
    {
      enabled: !!slug, // Only fetch if slug exists
      staleTime: Infinity,
      cacheTime: Infinity,
    }
  );

  // Extract product data from API response
  const productData = useMemo(() => {
    console.log("ProductDetail: productResponse in useMemo:", productResponse);
    
    if (!productResponse) {
      console.log("ProductDetail: No productResponse");
      return null;
    }
    
    // productResponse should be the product data object (already extracted in query function)
    const data = productResponse;
    console.log("ProductDetail: Processing data:", data);
    
    // Check if we have valid product data - must have at least id or slug
    if (!data || (typeof data !== 'object')) {
      console.warn("ProductDetail: Invalid data type:", typeof data);
      return null;
    }
    
    // If it doesn't have id or slug, it's not valid product data
    if (!data.id && !data.slug) {
      console.warn("ProductDetail: Missing both id and slug:", data);
      return null;
    }
    
    console.log("ProductDetail: Valid product data found, id:", data.id, "slug:", data.slug);

    // Build images array (thumbnail + images) with proper URL formatting
    const images = [];
    if (data.thumbnail) {
      // Remove leading slash if present, then add to images
      const thumbnailPath = data.thumbnail.startsWith("/") ? data.thumbnail.slice(1) : data.thumbnail;
      images.push(thumbnailPath);
    }
    if (data.images && Array.isArray(data.images)) {
      data.images.forEach((img) => {
        // Remove leading slash if present
        const imgPath = img.startsWith("/") ? img.slice(1) : img;
        images.push(imgPath);
      });
    }
    // If no images, use placeholder
    if (images.length === 0) {
      images.push("/assets/sample-image.webp");
    }

    // Extract variants from API data
    const variants = data.variants || [];
    const colorVariants = variants
      .map((v) => v.options?.color)
      .filter((v, i, arr) => v && arr.indexOf(v) === i);
    const sizeVariants = variants
      .map((v) => v.options?.size)
      .filter((v, i, arr) => v && arr.indexOf(v) === i);
    const storageVariants = variants
      .map((v) => v.options?.storage)
      .filter((v, i, arr) => v && arr.indexOf(v) === i);
    const materialVariants = variants
      .map((v) => v.options?.material)
      .filter((v, i, arr) => v && arr.indexOf(v) === i);

    return {
      id: data.id,
      title: data.title || "",
      price: parseFloat(data.price) || 0,
      originalPrice: data.compare_at_price ? parseFloat(data.compare_at_price) : null,
      condition: data.condition ? data.condition.charAt(0).toUpperCase() + data.condition.slice(1) : "New",
      category: data.category?.name || "",
      subcategory: data.subcategory?.name || "",
      brand: data.brand?.name || "",
      sku: data.sku || `SKU-${data.id}`,
      stock: Number(data.available_quantity ?? data.stock ?? 0),
      inStock: data.track_inventory === false || Number(data.available_quantity ?? data.stock ?? 0) > 0,
      listedDate: formatDateAgo(data.created_at),
      views: data.views || 0,
      favorites: data.favorites || 0,
      currentViewers: data.current_viewers || 0,
      rating: parseFloat(data.rating_avg) || 0,
      reviews: data.reviews?.length || 0,
      reviewsList: data.reviews || [], // Store reviews array
      sold: data.sold || 0,
      description: data.description || data.short_description || "",
      images: images,
      variants: {
        color: colorVariants.length > 0 ? colorVariants : null,
        size: sizeVariants.length > 0 ? sizeVariants : null,
        storage: storageVariants.length > 0 ? storageVariants : null,
        material: materialVariants.length > 0 ? materialVariants : null,
      },
      vendor: data.vendor || {
        name: "Unknown Seller",
        storeName: "Unknown Store",
        memberSince: "Unknown",
        totalProducts: 0,
        responseRate: "N/A",
        responseTime: "N/A",
        verified: false,
        phone: "",
        email: "",
        rating: 0,
        reviews: 0,
        onTimeDelivery: "N/A",
        returnRate: "N/A",
        storeRating: 0,
      },
      tags: data.tags || [],
      shipping: {
        freeShipping: true, // Default, can be updated from API if available
        estimatedDelivery: "2-4 business days",
        shipsFrom: data.vendor?.location || "Dubai, Pakistan",
        returnPolicy: "30-day return policy",
        warranty: "1 year manufacturer warranty",
      },
      specifications: data.attributes ? Object.entries(data.attributes).map(([key, value]) => ({
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " "),
        value: String(value),
      })) : [],
    };
  }, [productResponse]);

  // Reset state when product slug changes
  useEffect(() => {
    setQuantity(1);
    setSelectedColor(null);
    setSelectedSize(null);
    setSelectedStorage(null);
    setSelectedMaterial(null);
    setActiveImageIndex(0);
    setShowFullDescription(false);
    setShowAllSpecs(false);
    setAddedToCart(false);
    setShowPhone(false);
    setShowShareMenu(false);
    setNewQuestion("");
  }, [slug]);

  // Set initial variant selections when product data loads
  useEffect(() => {
    if (productData?.variants) {
      if (productData.variants.color && productData.variants.color.length > 0) {
        setSelectedColor(productData.variants.color[0]);
      }
      if (productData.variants.size && productData.variants.size.length > 0) {
        setSelectedSize(productData.variants.size[0]);
      }
      if (productData.variants.storage && productData.variants.storage.length > 0) {
        setSelectedStorage(productData.variants.storage[0]);
      }
      if (productData.variants.material && productData.variants.material.length > 0) {
        setSelectedMaterial(productData.variants.material[0]);
      }
    }
  }, [productData]);

  const isWishlisted = productData ? isInWishlist(productData.id) : false;

  // Fetch recently added products (for similar products and vendor products)
  const { data: recentProductsResponse, isLoading: recentProductsLoading } = useApiQuery(
    ["products-recent", productData?.id],
    async () => {
      const res = await axiosInstance.get("/products-recent");
      return res?.data || {};
    },
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!productData, // Only fetch when product data is available
    }
  );

  // Extract and filter recent products (exclude current product)
  const recentProducts = useMemo(() => {
    if (!recentProductsResponse) return [];
    const list = recentProductsResponse?.data || recentProductsResponse || [];
    const allProducts = Array.isArray(list) ? list : [];
    
    // Exclude current product from the list
    if (productData?.id) {
      return allProducts.filter((product) => {
        const productId = product.id || product.slug;
        return productId !== productData.id && productId !== productData.slug;
      });
    }
    
    return allProducts;
  }, [recentProductsResponse, productData]);

  // Filter products by same vendor (for vendor products section)
  const vendorProducts = useMemo(() => {
    if (!recentProducts.length || !productData?.vendor?.name) return [];
    const vendorName = productData.vendor.name || productData.vendor.storeName;
    return recentProducts
      .filter((product) => {
        const productVendor = product.vendor?.name || product.vendor_name || product.vendor;
        return productVendor === vendorName;
      })
      .slice(0, 10); // Limit to 10 products
  }, [recentProducts, productData]);

  // Similar products (from same category or just recent products excluding vendor products)
  const similarProducts = useMemo(() => {
    if (!recentProducts.length) return [];
    
    // Try to filter by same category first
    if (productData?.category) {
      const categoryName = productData.category.toLowerCase();
      const categoryFiltered = recentProducts.filter((product) => {
        const productCategory = product.category?.name || product.category || "";
        return productCategory.toLowerCase() === categoryName;
      });
      
      if (categoryFiltered.length > 0) {
        return categoryFiltered.slice(0, 8);
      }
    }
    
    // Fallback to recent products (excluding vendor products)
    const vendorProductIds = vendorProducts.map((p) => p.id || p.slug);
    return recentProducts
      .filter((product) => !vendorProductIds.includes(product.id || product.slug))
      .slice(0, 8);
  }, [recentProducts, productData, vendorProducts]);

  // Questions array (empty for now, can be populated from API later)
  const questions = [];

  // Rating submission mutation
  const ratingMutation = useApiMutation(
    async (data) => {
      return await submitProductRating(slug, data);
    },
    {
      successMessage: "Rating submitted successfully!",
      invalidateKeys: [["product", slug]], // Refresh product data after rating submission
      onSuccess: () => {
        setRatingForm({ name: "", rating: 0, comment: "" });
        setShowRatingForm(false);
      },
    }
  );

  const handleRatingSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!ratingForm.name || !ratingForm.rating || ratingForm.rating === 0) {
      showSuccess("Please fill in your name and select a rating");
      return;
    }

    const payload = {
      name: ratingForm.name,
      rating: Number(ratingForm.rating),
      ...(ratingForm.comment && { comment: ratingForm.comment }),
    };

    await ratingMutation.mutateAsync(payload);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target)) {
        setShowShareMenu(false);
      }
    };

    if (showShareMenu) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showShareMenu]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(window.location.href);
    setShowShareMenu(false);
  };

  const handleAddToCart = () => {
    if (!productData || productData.stock < 1 || !productData.inStock) return;
    
    const variants = {
      ...(selectedColor && { color: selectedColor }),
      ...(selectedSize && { size: selectedSize }),
      ...(selectedStorage && { storage: selectedStorage }),
      ...(selectedMaterial && { material: selectedMaterial }),
    };

    const mainImage = productData.images && productData.images.length > 0
      ? (productData.images[0].startsWith("http") ? productData.images[0] : `${imageURL}${productData.images[0]}`)
      : "/assets/sample-image.webp";

    addToCart(
      {
        id: productData.id,
        title: productData.title,
        price: productData.price,
        originalPrice: productData.originalPrice,
        image: mainImage,
        vendor: productData.vendor.storeName,
      },
      quantity,
      variants
    );
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const handleWishlistToggle = () => {
    if (!productData) return;
    
    if (isWishlisted) {
      removeFromWishlist(productData.id);
      showSuccess("Removed from wishlist");
    } else {
      const mainImage = productData.images && productData.images.length > 0
        ? (productData.images[0].startsWith("http") ? productData.images[0] : `${imageURL}${productData.images[0]}`)
        : "/assets/sample-image.webp";
      
      addToWishlist({
        id: productData.id,
        title: productData.title,
        price: productData.price,
        originalPrice: productData.originalPrice,
        image: mainImage,
        vendor: productData.vendor.storeName,
      });
      showSuccess("Added to wishlist!");
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DotsLoader size="lg" />
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Product not found</h2>
          <p className="text-gray-500 mb-4">The product you're looking for doesn't exist or has been removed.</p>
          <Link to="/" className="text-[#1790d7] hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  // No product data (but not an error - might still be loading)
  if (!productData && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">No product data</h2>
          <p className="text-gray-500 mb-4">Unable to load product information.</p>
          {slug && <p className="text-sm text-gray-400 mb-2">Slug: {slug}</p>}
          {error && <p className="text-sm text-red-500 mb-2">Error: {error?.message || "Unknown error"}</p>}
          <Link to="/" className="text-[#1790d7] hover:underline">Go back to home</Link>
        </div>
      </div>
    );
  }

  // Still loading or no data yet
  if (!productData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <DotsLoader size="lg" />
      </div>
    );
  }

  // Build product images array with proper URLs
  const productImages = productData.images.map((img) => {
    // If already a full URL, use as is
    if (img.startsWith("http")) {
      return img;
    }
    // If it's a placeholder, use as is
    if (img.startsWith("/assets/")) {
      return img;
    }
    // Otherwise, prepend imageURL and ensure no double slashes
    const cleanPath = img.startsWith("/") ? img.slice(1) : img;
    return `${imageURL}${cleanPath}`;
  });

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="bg-gray-50 min-h-screen pb-24 lg:pb-8"
    >
      <motion.div variants={itemVariants} className="bg-white border-b border-gray-100">
        <div className="w-full px-4 lg:px-8 py-3">
          <div className="flex items-center gap-2 text-sm text-gray-500 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-[#1790d7] transition-colors flex items-center gap-1 shrink-0">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            <Link to="/all-categories" className="hover:text-[#1790d7] transition-colors shrink-0">
              Categories
            </Link>
            <ChevronRight className="w-4 h-4 shrink-0" />
            {productData.category && (
              <>
                <Link to={`/category/${productData.category.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-[#1790d7] transition-colors shrink-0">
              {productData.category}
            </Link>
                <ChevronRightIcon className="w-4 h-4 shrink-0" />
              </>
            )}
            <span className="text-gray-900 font-medium truncate">{productData.title}</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2"
      >
        <div className="w-full px-4 lg:px-8">
          <div className="flex items-center justify-center gap-4 text-sm">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span className="font-medium">{productData.currentViewers} people viewing right now</span>
            </span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              <span>High demand - 89 people saved this</span>
            </span>
          </div>
        </div>
      </motion.div>

      <div className="w-full px-4 lg:px-8 py-6">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="relative">
                <Swiper
                  modules={[Navigation, Thumbs, Zoom]}
                  navigation
                  thumbs={{ swiper: thumbsSwiper && !thumbsSwiper.destroyed ? thumbsSwiper : null }}
                  zoom={true}
                  onSlideChange={(swiper) => setActiveImageIndex(swiper.activeIndex)}
                  className="product-gallery"
                >
                  {productImages.map((img, index) => (
                    <SwiperSlide key={index}>
                      <div className="swiper-zoom-container">
                        <img src={img} alt={`Product ${index + 1}`} className="w-full h-[300px] sm:h-[400px] lg:h-[500px] object-cover" />
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>

                <div className="absolute top-4 left-4 z-10 flex flex-wrap gap-2">
                  {productData.tags.map((tag, index) => (
                    <motion.span
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        tag === "Featured" ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                          : tag === "Premium" ? "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white"
                          : "bg-green-500 text-white"
                      }`}
                    >
                      {tag}
                    </motion.span>
                  ))}
                </div>

                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={handleWishlistToggle}
                    className={`p-3 rounded-full shadow-lg transition-all ${isWishlisted ? "bg-red-500 text-white" : "bg-white/90 backdrop-blur-sm text-gray-700"}`}>
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowShareMenu(!showShareMenu)}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700">
                    <Share2 className="w-5 h-5" />
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} onClick={() => setShowVideoModal(true)}
                    className="p-3 bg-white/90 backdrop-blur-sm rounded-full shadow-lg text-gray-700">
                    <Video className="w-5 h-5" />
                  </motion.button>
                </div>

                <AnimatePresence>
                  {showShareMenu && (
                    <motion.div 
                      ref={shareMenuRef}
                      initial={{ opacity: 0, scale: 0.9, y: 10 }} 
                      animate={{ opacity: 1, scale: 1, y: 0 }} 
                      exit={{ opacity: 0, scale: 0.9, y: 10 }}
                      className="absolute top-20 right-4 z-20 bg-white rounded-xl shadow-xl border border-gray-100 p-3 w-48">
                      <p className="text-xs text-gray-500 mb-2 font-medium">Share this product</p>
                      <div className="space-y-1">
                        <button onClick={() => setShowShareMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                          <Facebook className="w-4 h-4 text-blue-600" /> Facebook
                        </button>
                        <button onClick={() => setShowShareMenu(false)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                          <Twitter className="w-4 h-4 text-sky-500" /> Twitter
                        </button>
                        <button onClick={copyToClipboard} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 text-sm text-gray-700">
                          <Copy className="w-4 h-4" /> Copy Link
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="absolute bottom-4 left-4 z-10 flex items-center gap-3">
                  {productData.views > 0 && (
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm">
                    <Eye className="w-4 h-4" /> {productData.views} views
                  </span>
                  )}
                  <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm">
                    <Camera className="w-4 h-4" /> {productImages.length} {productImages.length === 1 ? "photo" : "photos"}
                  </span>
                </div>

                <div className="absolute bottom-4 right-4 z-10">
                  <span className="bg-black/60 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm">
                    {activeImageIndex + 1} / {productImages.length}
                  </span>
                </div>
              </div>

              <div className="p-4 border-t border-gray-100">
                <Swiper onSwiper={setThumbsSwiper} spaceBetween={10} slidesPerView={5} watchSlidesProgress={true} className="thumbs-gallery">
                  {productImages.map((img, index) => (
                    <SwiperSlide key={index}>
                      <img src={img} alt={`Thumb ${index + 1}`}
                        className={`w-full h-16 sm:h-20 object-cover rounded-lg cursor-pointer transition-all ${
                          activeImageIndex === index ? "ring-2 ring-[#1790d7] opacity-100" : "opacity-60 hover:opacity-100"
                        }`}
                      />
                    </SwiperSlide>
                  ))}
                </Swiper>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div>
                  {productData.category && (
                  <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Link to={`/category/${productData.category.toLowerCase().replace(/\s+/g, "-")}`} className="hover:text-[#1790d7]">{productData.category}</Link>
                      {productData.subcategory && (
                        <>
                          <ChevronRightIcon className="w-4 h-4" />
                    <span>{productData.subcategory}</span>
                        </>
                      )}
                  </div>
                  )}
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{productData.title}</h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1"><Store className="w-4 h-4" />{productData.vendor.storeName}</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />Listed {productData.listedDate}</span>
                    <span className="flex items-center gap-1"><Tag className="w-4 h-4" />{productData.condition}</span>
                    <span className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-500 fill-amber-500" />{productData.rating} ({productData.reviews} reviews)</span>
                  </div>
                </div>
                <div className="text-right">
                  {productData.originalPrice && productData.originalPrice > productData.price && (
                    <div className="flex items-center gap-2 justify-end mb-1">
                      <p className="text-gray-400 line-through text-lg">${productData.originalPrice.toLocaleString()}</p>
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-medium rounded">
                        {Math.round((1 - productData.price / productData.originalPrice) * 100)}% OFF
                      </span>
                    </div>
                  )}
                  <p className="text-3xl lg:text-4xl font-bold text-[#1790d7]">${productData.price.toLocaleString()}</p>
                  {productData.inStock && productData.stock >= 1 ? (
                    <span className="inline-block mt-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">In Stock ({productData.stock} available)</span>
                  ) : (
                    <span className="inline-block mt-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">Out of Stock</span>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-gray-100">
                {productData.variants.color && productData.variants.color.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Color: <span className="text-[#1790d7]">{selectedColor || productData.variants.color[0]}</span></label>
                    <div className="flex flex-wrap gap-2">
                      {productData.variants.color.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            (selectedColor || productData.variants.color[0]) === color
                              ? "border-[#1790d7] bg-[#1790d7]/5 text-[#1790d7]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {color}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {productData.variants.size && productData.variants.size.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Size: <span className="text-[#1790d7]">{selectedSize || productData.variants.size[0]}</span></label>
                    <div className="flex flex-wrap gap-2">
                      {productData.variants.size.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            (selectedSize || productData.variants.size[0]) === size
                              ? "border-[#1790d7] bg-[#1790d7]/5 text-[#1790d7]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {productData.variants.storage && productData.variants.storage.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Storage: <span className="text-[#1790d7]">{selectedStorage || productData.variants.storage[0]}</span></label>
                    <div className="flex flex-wrap gap-2">
                      {productData.variants.storage.map((storage) => (
                        <button
                          key={storage}
                          onClick={() => setSelectedStorage(storage)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            (selectedStorage || productData.variants.storage[0]) === storage
                              ? "border-[#1790d7] bg-[#1790d7]/5 text-[#1790d7]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {storage}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {productData.variants.material && productData.variants.material.length > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-700 mb-2 block">Material: <span className="text-[#1790d7]">{selectedMaterial || productData.variants.material[0]}</span></label>
                    <div className="flex flex-wrap gap-2">
                      {productData.variants.material.map((material) => (
                        <button
                          key={material}
                          onClick={() => setSelectedMaterial(material)}
                          className={`px-4 py-2 rounded-lg border-2 transition-all ${
                            (selectedMaterial || productData.variants.material[0]) === material
                              ? "border-[#1790d7] bg-[#1790d7]/5 text-[#1790d7]"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          {material}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-gray-700">Quantity:</label>
                  <div className="flex items-center gap-2 border border-gray-200 rounded-lg">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="px-4 py-2 font-semibold">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(productData.stock, quantity + 1))}
                      className="p-2 hover:bg-gray-100 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }} 
                    onClick={handleAddToCart}
                    disabled={!productData.inStock || productData.stock < 1}
                    className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                      addedToCart
                        ? "bg-green-500 text-white"
                        : productData.inStock && productData.stock >= 1
                        ? "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white hover:shadow-lg hover:shadow-indigo-500/25"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {addedToCart ? (
                      <>
                        <Check className="w-5 h-5" /> Added to Cart
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-5 h-5" /> Add to Cart
                      </>
                    )}
                </motion.button>
                  <motion.button 
                    whileHover={{ scale: 1.02 }} 
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-[#1790d7] text-[#1790d7] rounded-xl font-semibold hover:bg-[#1790d7]/5 transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    <span className="hidden sm:inline">Contact Seller</span>
                </motion.button>
                </div>

                <div className="flex flex-wrap gap-4 pt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    {productData.shipping.freeShipping ? "Free Shipping" : "Shipping Available"}
                  </span>
                  <span className="flex items-center gap-2">
                    <RotateCcw className="w-4 h-4 text-blue-600" />
                    {productData.shipping.returnPolicy}
                  </span>
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-purple-600" />
                    {productData.shipping.warranty}
                  </span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#1790d7]" /> Shipping & Returns
                </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Truck className="w-5 h-5 text-green-600" />
                    <h3 className="font-semibold text-gray-900">Shipping Information</h3>
              </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      {productData.shipping.freeShipping ? "Free shipping on all orders" : "Shipping available"}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Estimated delivery: {productData.shipping.estimatedDelivery}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-green-600" />
                      Ships from: {productData.shipping.shipsFrom}
                    </li>
                  </ul>
                      </div>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <RotateCcw className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Return Policy</h3>
                      </div>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      {productData.shipping.returnPolicy}
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Full refund if not satisfied
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-blue-600" />
                      Easy return process
                    </li>
                  </ul>
                      </div>
                    </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5 text-[#1790d7]" /> Description
              </h2>
              <div className="prose prose-gray max-w-none">
                <p className={`text-gray-600 whitespace-pre-line leading-relaxed ${!showFullDescription ? "line-clamp-6" : ""}`}>
                  {productData.description}
                </p>
              </div>
              <button onClick={() => setShowFullDescription(!showFullDescription)} className="mt-4 text-[#1790d7] font-medium hover:underline flex items-center gap-1">
                {showFullDescription ? "Show Less" : "Read More"}
                <ChevronRight className={`w-4 h-4 transition-transform ${showFullDescription ? "rotate-90" : ""}`} />
              </button>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1790d7]" /> Specifications
              </h2>
              {productData.specifications.length > 0 ? (
                <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {(showAllSpecs ? productData.specifications : productData.specifications.slice(0, 9)).map((spec, index) => (
                  <motion.div key={index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.03 }} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{spec.label}</p>
                    <p className="font-semibold text-gray-900">{spec.value}</p>
                  </motion.div>
                ))}
              </div>
              {productData.specifications.length > 9 && (
                <button onClick={() => setShowAllSpecs(!showAllSpecs)} className="mt-4 text-[#1790d7] font-medium hover:underline flex items-center gap-1">
                  {showAllSpecs ? "Show Less" : `Show All ${productData.specifications.length} Specifications`}
                      <ChevronRightIcon className={`w-4 h-4 transition-transform ${showAllSpecs ? "rotate-90" : ""}`} />
                </button>
                  )}
                </>
              ) : (
                <p className="text-gray-500 text-center py-8">No specifications available</p>
              )}
            </motion.div>


            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Star className="w-5 h-5 text-[#1790d7]" /> Reviews & Ratings
                </h2>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-5 h-5 ${star <= Math.round(productData.rating) ? "text-amber-500 fill-current" : "text-gray-300"}`} />
                    ))}
                  </div>
                  <span className="font-bold text-gray-900">{productData.rating}</span>
                  <span className="text-gray-500">({productData.reviews} reviews)</span>
                </div>
              </div>

              <div className="space-y-4">
                {productData.reviewsList && productData.reviewsList.length > 0 ? (
                  productData.reviewsList.map((review, index) => {
                    const reviewUser = review.user?.name || review.user_name || review.user || "Anonymous";
                    const reviewDate = review.created_at ? formatDateAgo(review.created_at) : review.date || "Recently";
                    const reviewRating = review.rating || review.rating_score || 5;
                    const reviewComment = review.comment || review.review || review.body || "";
                    const reviewHelpful = review.helpful_count || review.helpful || 0;
                    const reviewVerified = review.verified_purchase || review.verified || false;
                    
                    return (
                      <motion.div key={review.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-full flex items-center justify-center text-white font-semibold">
                              {reviewUser.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                                <p className="font-semibold text-gray-900">{reviewUser}</p>
                                {reviewVerified && (
                              <BadgeCheck className="w-4 h-4 text-blue-500" title="Verified Purchase" />
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center">
                              {[1, 2, 3, 4, 5].map((star) => (
                                    <Star key={star} className={`w-3 h-3 ${star <= reviewRating ? "text-amber-500 fill-current" : "text-gray-300"}`} />
                              ))}
                            </div>
                                <span className="text-xs text-gray-500">{reviewDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                        {reviewComment && (
                          <p className="mt-2 text-gray-600 text-sm">{reviewComment}</p>
                        )}
                        {reviewHelpful > 0 && (
                    <div className="mt-2 flex items-center gap-4">
                      <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-[#1790d7]">
                              <ThumbsUp className="w-4 h-4" /> Helpful ({reviewHelpful})
                      </button>
                    </div>
                        )}
                  </motion.div>
                    );
                  })
                ) : (
                  <p className="text-gray-500 text-center py-8">No reviews yet. Be the first to review this product!</p>
                )}
              </div>

              {productData.reviews > 0 && (
              <button className="mt-4 w-full py-3 border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all">
                View All {productData.reviews} Reviews
              </button>
              )}

              {/* Rating Form */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Write a Review</h3>
                  {!showRatingForm && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowRatingForm(true)}
                      className="px-4 py-2 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-lg font-medium hover:shadow-lg transition-all"
                    >
                      Add Review
                    </motion.button>
                  )}
                </div>

                {showRatingForm && (
                  <motion.form
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleRatingSubmit}
                    className="bg-gray-50 rounded-xl p-6 space-y-4"
                  >
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={ratingForm.name}
                        onChange={(e) => setRatingForm({ ...ratingForm, name: e.target.value })}
                        placeholder="Enter your name"
                        required
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rating <span className="text-red-500">*</span>
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setRatingForm({ ...ratingForm, rating: star })}
                            className="focus:outline-none"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= ratingForm.rating
                                  ? "text-amber-500 fill-amber-500"
                                  : "text-gray-300 hover:text-amber-300"
                              }`}
                            />
                          </button>
                        ))}
                        {ratingForm.rating > 0 && (
                          <span className="ml-2 text-sm text-gray-600">
                            {ratingForm.rating} {ratingForm.rating === 1 ? "star" : "stars"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Your Review (Optional)
                      </label>
                      <textarea
                        value={ratingForm.comment}
                        onChange={(e) => setRatingForm({ ...ratingForm, comment: e.target.value })}
                        placeholder="Share your experience with this product..."
                        rows={4}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] resize-none"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        disabled={ratingMutation.isPending || !ratingForm.name || ratingForm.rating === 0}
                        className="flex-1 px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                      >
                        {ratingMutation.isPending ? (
                          <>
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Send className="w-5 h-5" />
                            Submit Review
                          </>
                        )}
                      </motion.button>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setShowRatingForm(false);
                          setRatingForm({ name: "", rating: 0, comment: "" });
                        }}
                        className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-100 transition-all"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.form>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-[#1790d7]" /> Questions & Answers
              </h2>

              <div className="mb-6">
                <div className="flex gap-2">
                  <input type="text" value={newQuestion} onChange={(e) => setNewQuestion(e.target.value)} placeholder="Ask a question about this item..."
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
                  />
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                    className="px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-medium">
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>

              <div className="space-y-4">
                {questions && questions.length > 0 ? (
                  questions.map((q, index) => (
                    <motion.div key={q.id || index} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}
                    className="border-b border-gray-100 pb-4 last:border-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <MessageSquare className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{q.question}</p>
                        <p className="text-xs text-gray-500 mt-1">{q.user} • {q.date}</p>
                          {q.answered && q.answer && (
                          <div className="mt-3 pl-4 border-l-2 border-green-500">
                            <p className="text-gray-600 text-sm">{q.answer}</p>
                            <p className="text-xs text-gray-500 mt-1">Answer from seller</p>
                          </div>
                        )}
                        {!q.answered && (
                          <p className="mt-2 text-sm text-orange-600 flex items-center gap-1">
                            <AlertCircle className="w-4 h-4" /> Waiting for vendor's response
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                  ))
                ) : (
                  <p className="text-gray-500 text-center py-8">No questions yet. Ask a question about this product!</p>
                )}
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#1790d7]" /> Vendor Store Information
              </h2>
              <div className="bg-gradient-to-br from-[#1790d7]/5 to-[#4db3e8]/5 rounded-xl p-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-full flex items-center justify-center text-white text-xl font-bold">
                    {productData.vendor.name.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-gray-900">{productData.vendor.storeName}</h3>
                      {productData.vendor.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                    </div>
                    <p className="text-sm text-gray-500">Ships from: {productData.shipping.shipsFrom}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">Store Rating</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                      <span className="font-semibold">{productData.vendor.storeRating}</span>
                    </div>
                  </div>
                  <div className="bg-white rounded-lg p-3">
                    <p className="text-xs text-gray-500">On-Time Delivery</p>
                    <p className="font-semibold text-green-600 mt-1">{productData.vendor.onTimeDelivery}</p>
                  </div>
                </div>
              </div>
            </motion.div>

          </div>

          <div className="space-y-6">
            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {productData.vendor.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900">{productData.vendor.storeName}</h3>
                    {productData.vendor.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                  </div>
                  <p className="text-sm text-gray-500">Vendor since {productData.vendor.memberSince}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-amber-500 fill-current" />
                    <span className="font-semibold text-gray-900">{productData.vendor.rating}</span>
                    <span className="text-gray-500 text-sm">({productData.vendor.reviews} reviews)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-gray-900">{productData.vendor.totalProducts}</p>
                  <p className="text-xs text-gray-500">Products</p>
                </div>
                <div className="bg-gray-50 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-green-600">{productData.vendor.onTimeDelivery}</p>
                  <p className="text-xs text-gray-500">On-Time Delivery</p>
                </div>
              </div>

              <div className="space-y-2 mb-4 text-sm">
                <p className="text-gray-500 flex items-center gap-2">
                  <Clock className="w-4 h-4" />{productData.vendor.responseTime}
                </p>
                <p className="text-gray-500 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />{productData.vendor.responseRate} response rate
                </p>
                <p className="text-gray-500 flex items-center gap-2">
                  <RotateCcw className="w-4 h-4" />{productData.vendor.returnRate} return rate
                </p>
              </div>

              <div className="space-y-3">
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => setShowPhone(!showPhone)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold transition-all">
                  <Phone className="w-5 h-5" />{showPhone ? productData.vendor.phone : "Contact Vendor"}
                </motion.button>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all">
                  <MessageCircle className="w-5 h-5" />Message Vendor
                </motion.button>
                <Link to={`/seller/1`}>
                  <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all">
                    <Store className="w-5 h-5" />Visit Store
                  </button>
                </Link>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-2xl p-6 text-white">
              <div className="flex items-center gap-3 mb-4">
                <ShieldCheck className="w-8 h-8" />
                <div>
                  <h3 className="font-bold text-lg">Buyer Protection</h3>
                  <p className="text-white/80 text-sm">Shop with confidence</p>
                </div>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Verified vendor identity</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Secure payment processing</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Money-back guarantee</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> 24/7 customer support</li>
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-amber-50 rounded-2xl border border-amber-200 p-6">
              <h3 className="font-bold text-amber-800 mb-4 flex items-center gap-2"><Shield className="w-5 h-5" />Shopping Tips</h3>
              <ul className="space-y-3">
                {shoppingTips.map((tip, index) => (
                  <motion.li key={index} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-2 text-sm text-amber-800">
                    <CheckCircle2 className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />{tip}
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Product Statistics</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><Eye className="w-4 h-4" />Total Views</span>
                  <span className="font-semibold text-gray-900">{productData.views}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><Heart className="w-4 h-4" />Saved by Users</span>
                  <span className="font-semibold text-gray-900">{productData.favorites}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><Users className="w-4 h-4" />Currently Viewing</span>
                  <span className="font-semibold text-green-600">{productData.currentViewers}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><ShoppingCart className="w-4 h-4" />Units Sold</span>
                  <span className="font-semibold text-gray-900">{productData.sold}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><Calendar className="w-4 h-4" />Listed</span>
                  <span className="font-semibold text-gray-900">{productData.listedDate}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-500 flex items-center gap-2"><Tag className="w-4 h-4" />SKU</span>
                  <span className="font-semibold text-gray-900">{productData.sku}</span>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors text-left">
                  <Bookmark className="w-5 h-5" />Save to Favorites
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors text-left">
                  <Share2 className="w-5 h-5" />Share this Product
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors text-left">
                  <Printer className="w-5 h-5" />Print Product Details
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-50 text-gray-700 transition-colors text-left">
                  <History className="w-5 h-5" />View Price History
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors text-left">
                  <Flag className="w-5 h-5" />Report this Product
                </button>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-gray-100 rounded-2xl p-6 text-center">
              <Headphones className="w-10 h-10 text-[#1790d7] mx-auto mb-3" />
              <h3 className="font-bold text-gray-900 mb-1">Need Help?</h3>
              <p className="text-gray-500 text-sm mb-4">Our support team is here 24/7</p>
              <button className="w-full py-3 bg-white border border-gray-200 rounded-xl text-gray-700 font-medium hover:bg-gray-50 transition-all">
                Contact Support
              </button>
            </motion.div>
          </div>
        </div>

        <div className="space-y-6 mt-8">
          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Store className="w-5 h-5 text-[#1790d7]" /> More from {productData.vendor.storeName}
              </h2>
              <div className="flex items-center gap-2">
                <button className="vendor-products-prev p-2 bg-gray-100 hover:bg-[#1790d7] hover:text-white rounded-full transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="vendor-products-next p-2 bg-gray-100 hover:bg-[#1790d7] hover:text-white rounded-full transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            {recentProductsLoading ? (
              <div className="text-center py-8">
                <DotsLoader size="md" />
              </div>
            ) : vendorProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No other products from this vendor</p>
            ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={16}
              slidesPerView={2}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              navigation={{
                prevEl: ".vendor-products-prev",
                nextEl: ".vendor-products-next",
              }}
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="vendor-products-swiper"
            >
                {vendorProducts.map((item, index) => {
                  const productImage = item.thumbnail || item.image || item.image_url;
                  const imageSrc = productImage
                    ? productImage.startsWith("http")
                      ? productImage
                      : `${imageURL}${productImage}`
                    : "/assets/sample-image.webp";
                  const productId = item.id || item.slug;
                  const productPrice = parseFloat(item.price || 0);
                  const productRating = parseFloat(item.rating_avg || item.rating || 0);
                  const productReviews = item.reviews?.length || item.reviews_count || 0;
                  const isWishlistedItem = isInWishlist(productId);

                  const handleAddToCart = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart({
                      id: productId,
                      title: item.title || item.name,
                      price: productPrice,
                      originalPrice: item.compare_at_price ? parseFloat(item.compare_at_price) : null,
                      image: imageSrc,
                      vendor: item.vendor?.name || item.vendor_name || item.vendor || "N/A",
                    });
                  };

                  const handleWishlistToggle = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isWishlistedItem) {
                      removeFromWishlist(productId);
                      showSuccess("Removed from wishlist");
                    } else {
                      addToWishlist({
                        id: productId,
                        title: item.title || item.name,
                        price: productPrice,
                        originalPrice: item.compare_at_price ? parseFloat(item.compare_at_price) : null,
                        image: imageSrc,
                        vendor: item.vendor?.name || item.vendor_name || item.vendor || "N/A",
                      });
                      showSuccess("Added to wishlist!");
                    }
                  };

                  return (
                    <SwiperSlide key={productId || index}>
                      <Link to={`/product/${item.slug || item.id || ""}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -3 }}
                          className="bg-gray-50 rounded-xl overflow-hidden group h-full relative"
                        >
                          <div className="relative h-32 overflow-hidden">
                            <img src={imageSrc} alt={item.title || item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                            <button
                              onClick={handleWishlistToggle}
                              className={`absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                                isWishlistedItem ? "bg-red-500 text-white" : "bg-white/90 text-gray-600"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isWishlistedItem ? "fill-current" : ""}`} />
                            </button>
                          </div>
                      <div className="p-3">
                            <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-2 group-hover:text-[#1790d7] transition-colors">
                              {item.title || item.name}
                            </p>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="text-xs text-gray-500">
                                {productRating.toFixed(1)} ({productReviews})
                              </span>
                        </div>
                            <div className="flex items-center justify-between">
                              <p className="text-base font-bold text-[#1790d7]">${productPrice.toFixed(2)}</p>
                              <button
                                onClick={handleAddToCart}
                                className="p-1.5 bg-[#1790d7] text-white rounded-lg hover:bg-[#4db3e8] transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                      </div>
                    </motion.div>
                  </Link>
                </SwiperSlide>
                  );
                })}
            </Swiper>
            )}
            <button className="mt-4 w-full py-2 text-[#1790d7] font-medium hover:underline">
              View All {productData.vendor.totalProducts} Products
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#1790d7]" /> Similar Products
              </h2>
              <div className="flex items-center gap-2">
                <button className="similar-products-prev p-2 bg-gray-100 hover:bg-[#1790d7] hover:text-white rounded-full transition-all">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button className="similar-products-next p-2 bg-gray-100 hover:bg-[#1790d7] hover:text-white rounded-full transition-all">
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
            {recentProductsLoading ? (
              <div className="text-center py-8">
                <DotsLoader size="md" />
              </div>
            ) : similarProducts.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No similar products found</p>
            ) : (
            <Swiper
              modules={[Navigation, Autoplay]}
              spaceBetween={16}
              slidesPerView={2}
              autoplay={{ delay: 4000, disableOnInteraction: false }}
              navigation={{
                prevEl: ".similar-products-prev",
                nextEl: ".similar-products-next",
              }}
              breakpoints={{
                640: { slidesPerView: 3 },
                1024: { slidesPerView: 4 },
                1280: { slidesPerView: 5 },
              }}
              className="similar-products-swiper"
            >
                {similarProducts.map((product, index) => {
                  const productImage = product.thumbnail || product.image || product.image_url;
                  const imageSrc = productImage
                    ? productImage.startsWith("http")
                      ? productImage
                      : `${imageURL}${productImage}`
                    : "/assets/sample-image.webp";
                  const productId = product.id || product.slug;
                  const productPrice = parseFloat(product.price || 0);
                  const productRating = parseFloat(product.rating_avg || product.rating || 0);
                  const productReviews = product.reviews?.length || product.reviews_count || 0;
                  const productVendor = product.vendor?.name || product.vendor_name || product.vendor || "N/A";
                  const isWishlistedItem = isInWishlist(productId);

                  const handleAddToCart = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    addToCart({
                      id: productId,
                      title: product.title || product.name,
                      price: productPrice,
                      originalPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
                      image: imageSrc,
                      vendor: productVendor,
                    });
                  };

                  const handleWishlistToggle = (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isWishlistedItem) {
                      removeFromWishlist(productId);
                      showSuccess("Removed from wishlist");
                    } else {
                      addToWishlist({
                        id: productId,
                        title: product.title || product.name,
                        price: productPrice,
                        originalPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
                        image: imageSrc,
                        vendor: productVendor,
                      });
                      showSuccess("Added to wishlist!");
                    }
                  };

                  return (
                    <SwiperSlide key={productId || index}>
                      <Link to={`/product/${product.slug || product.id || ""}`}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      whileHover={{ y: -5 }}
                          className="bg-gray-50 rounded-xl overflow-hidden group cursor-pointer hover:shadow-lg transition-all h-full relative"
                    >
                      <div className="relative h-40 overflow-hidden">
                            <img src={imageSrc} alt={product.title || product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            <button
                              onClick={handleWishlistToggle}
                              className={`absolute top-2 right-2 p-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity ${
                                isWishlistedItem ? "bg-red-500 text-white" : "bg-white/90 text-gray-600"
                              }`}
                            >
                              <Heart className={`w-4 h-4 ${isWishlistedItem ? "fill-current" : ""}`} />
                            </button>
                      </div>
                      <div className="p-3">
                            <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2 group-hover:text-[#1790d7] transition-colors">
                              {product.title || product.name}
                            </h3>
                        <div className="flex items-center gap-1 text-gray-500 text-xs mb-2">
                              <Store className="w-3 h-3" />
                              {productVendor}
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                              <span className="text-xs text-gray-500">
                                {productRating.toFixed(1)} ({productReviews})
                              </span>
                        </div>
                            <div className="flex items-center justify-between">
                              <p className="text-[#1790d7] font-bold">${productPrice.toFixed(2)}</p>
                              <button
                                onClick={handleAddToCart}
                                className="p-1.5 bg-[#1790d7] text-white rounded-lg hover:bg-[#4db3e8] transition-colors opacity-0 group-hover:opacity-100"
                              >
                                <ShoppingCart className="w-4 h-4" />
                              </button>
                            </div>
                      </div>
                    </motion.div>
                  </Link>
                </SwiperSlide>
                  );
                })}
            </Swiper>
            )}
          </motion.div>
        </div>
      </div>


      <AnimatePresence>
        {showVideoModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowVideoModal(false)} className="fixed inset-0 bg-black/80 z-50" />
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-black rounded-2xl overflow-hidden z-50">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center text-white">
                  <Play className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="text-lg">Video not available</p>
                  <p className="text-sm opacity-50">Contact vendor for product video</p>
                </div>
              </div>
              <button onClick={() => setShowVideoModal(false)} className="absolute top-4 right-4 p-2 bg-white/20 rounded-full text-white hover:bg-white/30">
                <X className="w-6 h-6" />
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <motion.div initial={{ opacity: 0, y: 100 }} animate={{ opacity: 1, y: 0 }} className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 lg:hidden z-40">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-2xl font-bold text-[#1790d7]">${productData.price.toLocaleString()}</p>
            {productData.inStock && <span className="text-xs text-green-600">In Stock</span>}
          </div>
          <div className="flex gap-2">
            <motion.button 
              whileTap={{ scale: 0.95 }} 
              onClick={handleAddToCart}
              disabled={!productData.inStock}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold ${
                productData.inStock
                  ? "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              <ShoppingCart className="w-5 h-5" />Add to Cart
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ProductDetail;
