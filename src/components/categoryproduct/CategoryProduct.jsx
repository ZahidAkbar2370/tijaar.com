import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { subCategories } from "../../data/Subcategories";
import {
  Heart,
  Store,
  Star,
  BadgeCheck,
  ChevronRight,
  Home,
  Grid3X3,
  List,
  ChevronDown,
  SlidersHorizontal,
  ShoppingCart,
  Share2,
  Truck,
} from "lucide-react";

const sortOptions = ["Newest First", "Price: Low to High", "Price: High to Low", "Most Popular"];

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

const CategoryProduct = () => {
  const { categoryName, subName } = useParams();
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("Newest First");

  const category = subCategories[categoryName];
  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Category not found</h2>
          <Link to="/all-categories" className="text-[#1790d7] hover:underline">
            Browse all categories
          </Link>
        </div>
      </div>
    );
  }

  const products = category.products;

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
            <Link to={`/category/${categoryName}`} className="hover:text-[#1790d7] transition-colors">
              {categoryName}
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{subName}</span>
          </div>
        </div>
      </motion.div>

      <div className="w-full px-4 lg:px-8 py-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-800 mb-2">
            {subName}
          </h1>
          <p className="text-gray-500">
            {products.length * 10}+ products in {categoryName} / {subName}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <p className="text-gray-600 text-sm">
            Showing <span className="font-semibold text-gray-900">{products.length * 10}</span> results
          </p>
          
          <div className="flex items-center gap-3">
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
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-6 items-stretch"
          >
            {[...products, ...products].map((product, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={`/product/${index + 1}`}>
                  <ProductCard product={product} index={index} />
                </Link>
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
            {[...products, ...products].map((product, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Link to={`/product/${index + 1}`}>
                  <ProductListCard product={product} />
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
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
  );
};

const ProductCard = ({ product, index }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group"
    >
      <div className="relative">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => e.preventDefault()}
            className="p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-md hover:bg-white transition-all"
          >
            <Heart className="w-5 h-5 text-gray-600 hover:text-red-500 transition-colors" />
          </motion.button>
        </div>
        {product.tags?.[0] && (
          <span className="absolute top-3 left-3 px-3 py-1 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-xs font-medium rounded-full">
            {product.tags[0]}
          </span>
        )}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <span className="flex items-center gap-1 bg-black/60 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            4.8 ({120 + index * 15})
          </span>
          <span className="flex items-center gap-1 bg-green-600/80 backdrop-blur-sm text-white px-2 py-1 rounded-lg text-xs">
            <Truck className="w-3 h-3" />
            Free Ship
          </span>
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1 group-hover:text-[#1790d7] transition-colors">
            {product.title}
          </h3>
          <div className="flex items-center gap-1 text-amber-500 shrink-0">
            <Star className="w-4 h-4 fill-current" />
            <span className="text-xs font-medium">4.8</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-gray-500 text-sm mb-3">
          <Store className="w-4 h-4" />
          <span>TechStore Pro</span>
          <BadgeCheck className="w-4 h-4 text-blue-600" />
          <span className="text-xs text-gray-400">•</span>
          <Truck className="w-3.5 h-3.5 text-green-500" />
          <span className="text-xs text-green-600">Free Shipping</span>
        </div>

        <p className="text-gray-500 text-sm line-clamp-2 mb-4">
          {product.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
          <div>
            <span className="text-xl font-bold text-[#1790d7]">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 ml-2 line-through">${product.originalPrice}</span>
            )}
          </div>
            <motion.button
              onClick={(e) => e.preventDefault()}
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
  );
};

const ProductListCard = ({ product }) => {
  return (
    <motion.div
      whileHover={{ x: 5 }}
      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex gap-4 p-4"
    >
      <div className="relative w-40 h-32 shrink-0">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover rounded-xl"
        />
        {product.tags?.[0] && (
          <span className="absolute top-2 left-2 px-2 py-0.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white text-xs font-medium rounded-full">
            {product.tags[0]}
          </span>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => e.preventDefault()}
              className="p-1.5 hover:bg-gray-100 rounded-full transition-colors shrink-0"
            >
              <Heart className="w-5 h-5 text-gray-400 hover:text-red-500 transition-colors" />
            </motion.button>
          </div>
          
          <div className="flex items-center gap-3 text-sm text-gray-500 mb-2">
            <span className="flex items-center gap-1">
              <Store className="w-3.5 h-3.5" />
              TechStore Pro
            </span>
            <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
            <span className="text-xs text-gray-400">•</span>
            <span className="flex items-center gap-1 text-green-600">
              <Truck className="w-3.5 h-3.5" />
              Free Shipping
            </span>
          </div>

          <p className="text-gray-500 text-sm line-clamp-1">{product.description}</p>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <span className="text-xl font-bold text-[#1790d7]">${product.price}</span>
            {product.originalPrice && (
              <span className="text-xs text-gray-400 ml-2 line-through">${product.originalPrice}</span>
            )}
          </div>
            <motion.button
              onClick={(e) => e.preventDefault()}
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
  );
};

export default CategoryProduct;
