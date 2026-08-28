import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, MapPin, ChevronRight, ChevronLeft } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import useApiQuery from "../../hooks/useApiQuery";
import { getProducts } from "../../services/productsService";
import { useCart } from "../../context/CartContext";
import { useWishlist } from "../../context/WishlistContext";
import { useSnackbar } from "../../context/SnackbarContext";
import { imageURL } from "../../api/axiosInstance";
import DotsLoader from "../common/DotsLoader";

const TopCategoryProducts = ({ categoryName, categorySlug }) => {
  // Convert category name to slug if slug not provided
  const slug = categorySlug || categoryName?.toLowerCase().replace(/\s+/g, "-");
  
  // Create safe CSS class names (remove special characters, replace spaces and & with hyphens)
  const safeClassName = categoryName
    ?.toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "category";
  
  const navPrevClass = `${safeClassName}-prev`;
  const navNextClass = `${safeClassName}-next`;
  
  // Fetch products by category
  const { data: productsResponse, isLoading } = useApiQuery(
    ["category-products", slug],
    () => getProducts({ category: slug, limit: 12 }),
    {
      staleTime: Infinity,
      cacheTime: Infinity,
      enabled: !!slug,
    }
  );

  // Extract products from API response and filter by category slug
  const products = useMemo(() => {
    if (!productsResponse) return [];
    const data = productsResponse?.data?.data || productsResponse?.data || productsResponse;
    const allProducts = Array.isArray(data) ? data : [];
    
    // Filter products to ensure they belong to the specified category
    return allProducts.filter((product) => {
      const productCategorySlug = product.category?.slug || 
                                   product.category_slug || 
                                   product.category?.name?.toLowerCase().replace(/\s+/g, "-") ||
                                   product.category_name?.toLowerCase().replace(/\s+/g, "-");
      
      // Normalize both slugs for comparison
      const normalizedProductSlug = productCategorySlug?.toLowerCase().trim();
      const normalizedFilterSlug = slug?.toLowerCase().trim();
      
      return normalizedProductSlug === normalizedFilterSlug;
    });
  }, [productsResponse, slug]);

  if (isLoading) {
    return (
      <div className="py-10 lg:py-16 px-4 lg:px-16 flex items-center justify-center">
        <DotsLoader size="md" />
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="py-10 lg:py-16 px-4 lg:px-16">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-6 lg:mb-8">{categoryName} Products</h2>
        <p className="text-center text-gray-500 py-8">No products found in this category</p>
      </div>
    );
  }

  return (
    <div className="py-10 lg:py-16 px-4 lg:px-16">
      <div className="flex items-center justify-between mb-6 lg:mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-gray-800">{categoryName} Products</h2>
        <div className="flex items-center gap-3">
          <button className={`${navPrevClass} p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm`}>
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button className={`${navNextClass} p-2.5 bg-white border border-gray-200 rounded-full hover:bg-[#1790d7] hover:text-white hover:border-[#1790d7] transition-all duration-300 shadow-sm`}>
            <ChevronRight className="w-5 h-5" />
          </button>
          <Link
            to={`/category/${slug}`}
            className="hidden sm:flex items-center gap-2 text-[#1790d7] font-medium hover:underline ml-2"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      <div className="hidden sm:block">
        <Swiper
          modules={[Navigation]}
          spaceBetween={16}
          slidesPerView={1}
          navigation={{
            prevEl: `.${navPrevClass}`,
            nextEl: `.${navNextClass}`,
          }}
          breakpoints={{
            480: { slidesPerView: 1, spaceBetween: 12 },
            640: { slidesPerView: 2, spaceBetween: 16 },
            768: { slidesPerView: 2, spaceBetween: 16 },
            1024: { slidesPerView: 3, spaceBetween: 20 },
            1280: { slidesPerView: 4, spaceBetween: 24 },
          }}
          className="product-swiper"
        >
          {products.map((product, index) => (
            <SwiperSlide key={index}>
              <ProductCard product={product} />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <div className="sm:hidden space-y-4">
        {products.slice(0, 4).map((product, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
          >
            <MobileProductCard product={product} />
          </motion.div>
        ))}
        <Link
          to={`/category/${slug}`}
          className="w-full py-3 text-center text-[#1790d7] font-medium border border-[#1790d7] rounded-xl hover:bg-[#1790d7]/5 transition-colors block"
        >
          View All {categoryName} Products
        </Link>
      </div>
    </div>
  );
};

const ProductCard = ({ product }) => {
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
  const productPrice = parseFloat(product.price || 0);
  const originalPrice = product.compare_at_price ? parseFloat(product.compare_at_price) : null;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart({
      id: product.id || product.slug,
      title: product.title || product.name,
      price: productPrice,
      originalPrice: originalPrice,
      image: imageSrc,
      vendor: product.vendor?.name || product.vendor_name || product.vendor || "N/A",
    });
  };

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || product.slug;
    if (isWishlisted) {
      removeFromWishlist(productId);
      showSuccess("Removed from wishlist");
    } else {
      addToWishlist({
        id: productId,
        title: product.title || product.name,
        price: productPrice,
        originalPrice: originalPrice,
        image: imageSrc,
        vendor: product.vendor?.name || product.vendor_name || product.vendor || "N/A",
      });
      showSuccess("Added to wishlist!");
    }
  };

  return (
    <Link to={productLink}>
      <motion.div
        whileHover={{ y: -5 }}
        className="w-full bg-white rounded-2xl shadow-lg hover:shadow-xl overflow-hidden transition-all duration-300 border border-gray-100 cursor-pointer"
      >
        <div className="relative">
          <img
            src={imageSrc}
            alt={product.title || product.name}
            className="w-full h-48 object-cover"
          />
          <button 
            onClick={handleWishlistToggle}
            className={`absolute top-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white hover:scale-110 transition-all ${
              isWishlisted ? "text-red-500" : "text-gray-600 hover:text-red-500"
            }`}
          >
            <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
          </button>
          {product.tags?.[0] && (
            <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-xs font-medium rounded-full">
              {product.tags[0]}
            </span>
          )}
        </div>

        <div className="p-4 lg:p-5">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-1 mb-2 group-hover:text-[#1790d7] transition-colors">
            {product.title || product.name}
          </h3>

          <div className="flex flex-wrap gap-2 mb-3">
            {product.tags?.slice(0, 2).map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 rounded-md bg-gray-100 text-gray-600 text-xs"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-4">
            {product.description || product.short_description || ""}
          </p>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div>
              <p className="text-xs text-gray-400 uppercase">Price</p>
              <div className="flex items-center gap-2">
                <p className="text-xl font-bold text-[#1790d7]">${productPrice.toFixed(2)}</p>
                {originalPrice && originalPrice > productPrice && (
                  <p className="text-sm text-gray-400 line-through">${originalPrice.toFixed(2)}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleAddToCart}
              className="px-4 py-2 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-sm font-medium rounded-xl hover:shadow-lg hover:shadow-indigo-500/25 active:scale-95 transition-all"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </motion.div>
    </Link>
  );
};

const MobileProductCard = ({ product }) => {
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
  const productPrice = parseFloat(product.price || 0);

  const handleWishlistToggle = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const productId = product.id || product.slug;
    if (isWishlisted) {
      removeFromWishlist(productId);
      showSuccess("Removed from wishlist");
    } else {
      addToWishlist({
        id: productId,
        title: product.title || product.name,
        price: productPrice,
        originalPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
        image: imageSrc,
        vendor: product.vendor?.name || product.vendor_name || product.vendor || "N/A",
      });
      showSuccess("Added to wishlist!");
    }
  };

  return (
    <Link to={productLink}>
      <div className="flex gap-4 bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 p-3 cursor-pointer hover:shadow-lg transition-all">
        <div className="relative w-28 h-28 shrink-0">
          <img
            src={imageSrc}
            alt={product.title || product.name}
            className="w-full h-full object-cover rounded-lg"
          />
          {product.tags?.[0] && (
            <span className="absolute top-1 left-1 px-2 py-0.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-[10px] font-medium rounded-full">
              {product.tags[0]}
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between py-1">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-1 mb-1 hover:text-[#1790d7] transition-colors">
              {product.title || product.name}
            </h3>
            <p className="text-gray-500 text-xs line-clamp-2">
              {product.description || product.short_description || ""}
            </p>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-lg font-bold text-[#1790d7]">${productPrice.toFixed(2)}</span>
            <button 
              onClick={handleWishlistToggle}
              className={`p-2 bg-gray-100 rounded-full hover:bg-[#1790d7]/10 transition-colors ${
                isWishlisted ? "text-red-500" : "text-gray-500"
              }`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default TopCategoryProducts;
