import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Home,
  ChevronRight,
  Store,
  Star,
  BadgeCheck,
  Users,
  Package,
  TrendingUp,
  Award,
  ShieldCheck,
  Phone,
  Mail,
  MessageCircle,
  MapPin,
  Clock,
  ThumbsUp,
  ThumbsDown,
  ShoppingCart,
  Heart,
  Share2,
  Grid3X3,
  List,
} from "lucide-react";

const vendorData = {
  id: 1,
  name: "TechStore Pro",
  storeName: "TechStore Pro Official",
  logo: "/assets/sample-image.webp",
  coverImage: "/assets/sample-image.webp",
  rating: 4.9,
  reviews: 1247,
  products: 1250,
  totalSales: 15000,
  memberSince: "Jan 2020",
  verified: true,
  onTimeDelivery: "98%",
  responseRate: "98%",
  returnRate: "2.5%",
  description: "Your trusted source for premium electronics and tech accessories. We've been serving customers since 2020 with fast shipping and excellent customer service. Our commitment to quality and customer satisfaction has made us one of the top-rated sellers on the platform.",
  about: "TechStore Pro was founded with a mission to provide high-quality electronics at competitive prices. We source products directly from manufacturers and ensure every item meets our strict quality standards. Our team of experts carefully tests and verifies each product before it reaches our customers.",
  location: "Dubai, United Arab Emirates",
  email: "support@techstorepro.ae",
  phone: "+971 50 123 4567",
  categories: ["Electronics", "Gadgets", "Accessories", "Smartphones", "Laptops"],
  badges: ["Top Seller", "Verified", "Fast Shipping", "Quality Assured"],
  policies: {
    shipping: "Free shipping on orders over $50. Standard delivery: 2-4 business days. Express delivery available.",
    returns: "30-day return policy. Full refund if not satisfied. Easy return process.",
    warranty: "1-year manufacturer warranty on all products. Extended warranty options available.",
  },
};

const vendorReviews = [
  {
    id: 1,
    user: "Ahmed M.",
    rating: 5,
    date: "2 weeks ago",
    comment: "Excellent seller! Fast shipping and great customer service. Products are exactly as described. Highly recommend!",
    helpful: 45,
    verified: true,
    product: "Wireless Earbuds Pro",
  },
  {
    id: 2,
    user: "Sarah K.",
    rating: 5,
    date: "1 month ago",
    comment: "Best electronics seller on the platform. Quality products and responsive support team. Will definitely shop again!",
    helpful: 32,
    verified: true,
    product: "Smart Watch Series 8",
  },
  {
    id: 3,
    user: "Mohammed A.",
    rating: 4,
    date: "2 months ago",
    comment: "Good experience overall. Products are quality and shipping was fast. Minor delay in response but everything worked out well.",
    helpful: 18,
    verified: false,
    product: "USB-C Charger",
  },
];

const vendorProducts = [
  { id: 1, title: "Wireless Bluetooth Earbuds Pro", price: 129.99, image: "/assets/sample-image.webp", rating: 4.8, reviews: 324, inStock: true },
  { id: 2, title: "Smart Watch Series 8", price: 299.99, image: "/assets/sample-image.webp", rating: 4.9, reviews: 567, inStock: true },
  { id: 3, title: "USB-C Fast Charger", price: 19.99, image: "/assets/sample-image.webp", rating: 4.7, reviews: 189, inStock: true },
  { id: 4, title: "Wireless Charging Pad", price: 29.99, image: "/assets/sample-image.webp", rating: 4.6, reviews: 234, inStock: false },
  { id: 5, title: "Laptop Stand Premium", price: 49.99, image: "/assets/sample-image.webp", rating: 4.8, reviews: 156, inStock: true },
  { id: 6, title: "Mechanical Keyboard RGB", price: 89.99, image: "/assets/sample-image.webp", rating: 4.7, reviews: 278, inStock: true },
];

const VendorDetail = () => {
  const { vendorId } = useParams();
  const [viewMode, setViewMode] = useState("grid");
  const [activeTab, setActiveTab] = useState("products");

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
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            <Link to="/sellers" className="hover:text-[#1790d7] transition-colors">
              Sellers
            </Link>
            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
            <span className="text-gray-900 font-medium">{vendorData.storeName}</span>
          </div>
        </div>
      </motion.div>

      <div className="relative">
        <div className="h-64 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] relative overflow-hidden">
          <div className="absolute inset-0 bg-black/20"></div>
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 to-transparent"></div>
        </div>

        <div className="w-full px-4 lg:px-8 -mt-20 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 lg:p-8"
          >
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="w-32 h-32 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-2xl flex items-center justify-center shadow-lg shrink-0">
                <Store className="w-16 h-16 text-white" />
              </div>

              <div className="flex-1">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">{vendorData.storeName}</h1>
                      {vendorData.verified && <BadgeCheck className="w-6 h-6 text-blue-500" />}
                    </div>
                    <p className="text-gray-500">by {vendorData.name} • Member since {vendorData.memberSince}</p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-gray-900">{vendorData.rating}</span>
                    <span className="text-gray-500">({vendorData.reviews} reviews)</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <Package className="w-4 h-4" />
                    <span>{vendorData.products} products</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-500">
                    <TrendingUp className="w-4 h-4" />
                    <span>{vendorData.totalSales.toLocaleString()} sales</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {vendorData.badges.map((badge, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-[#1790d7]/10 text-[#1790d7] text-sm font-medium rounded-full"
                    >
                      {badge}
                    </span>
                  ))}
                </div>

                <p className="text-gray-600 mb-6">{vendorData.description}</p>

                <div className="flex flex-wrap gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                  >
                    <MessageCircle className="w-5 h-5" />
                    Contact Seller
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all"
                  >
                    <Share2 className="w-5 h-5" />
                    Share Store
                  </motion.button>
                </div>
              </div>

              <div className="lg:w-64 shrink-0">
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">On-Time Delivery</span>
                    <span className="font-bold text-green-600">{vendorData.onTimeDelivery}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Response Rate</span>
                    <span className="font-bold text-blue-600">{vendorData.responseRate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Return Rate</span>
                    <span className="font-bold text-gray-900">{vendorData.returnRate}</span>
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <MapPin className="w-4 h-4" />
                      <span>{vendorData.location}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                      <Mail className="w-4 h-4" />
                      <span>{vendorData.email}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Phone className="w-4 h-4" />
                      <span>{vendorData.phone}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="w-full px-4 lg:px-8 py-8">
        <div className="flex flex-wrap gap-2 mb-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("products")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "products"
                ? "border-[#1790d7] text-[#1790d7]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Products ({vendorData.products})
          </button>
          <button
            onClick={() => setActiveTab("about")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "about"
                ? "border-[#1790d7] text-[#1790d7]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab("reviews")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "reviews"
                ? "border-[#1790d7] text-[#1790d7]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Reviews ({vendorData.reviews})
          </button>
          <button
            onClick={() => setActiveTab("policies")}
            className={`px-6 py-3 font-medium transition-colors border-b-2 ${
              activeTab === "policies"
                ? "border-[#1790d7] text-[#1790d7]"
                : "border-transparent text-gray-500 hover:text-gray-900"
            }`}
          >
            Policies
          </button>
        </div>

        {activeTab === "products" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">All Products</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#1790d7] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <Grid3X3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-2 rounded-lg transition-colors ${viewMode === "list" ? "bg-[#1790d7] text-white" : "bg-gray-100 text-gray-500"}`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>

            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {vendorProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg border border-gray-100 transition-all cursor-pointer"
                    >
                      <div className="relative h-48">
                        <img
                          src={product.image}
                          alt={product.title}
                          className="w-full h-full object-cover"
                        />
                        {!product.inStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <span className="text-white font-semibold">Out of Stock</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 text-sm line-clamp-2 mb-2">{product.title}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="text-sm text-gray-600">{product.rating} ({product.reviews})</span>
                        </div>
                        <p className="text-lg font-bold text-[#1790d7]">${product.price.toFixed(2)}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {vendorProducts.map((product) => (
                  <Link key={product.id} to={`/product/${product.id}`}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all flex gap-4"
                    >
                      <div className="w-32 h-32 shrink-0 overflow-hidden rounded-xl">
                        <img src={product.image} alt={product.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg mb-2">{product.title}</h3>
                        <div className="flex items-center gap-4 mb-3">
                          <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                            <span className="text-sm text-gray-600">{product.rating} ({product.reviews} reviews)</span>
                          </div>
                          <span className={`text-sm font-medium ${product.inStock ? 'text-green-600' : 'text-red-600'}`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                        <p className="text-xl font-bold text-[#1790d7]">${product.price.toFixed(2)}</p>
                      </div>
                    </motion.div>
                  </Link>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "about" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-4">About {vendorData.storeName}</h2>
            <p className="text-gray-600 leading-relaxed mb-6">{vendorData.about}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {vendorData.categories.map((category, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {category}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="space-y-2 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{vendorData.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{vendorData.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{vendorData.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {activeTab === "reviews" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {vendorReviews.map((review) => (
              <div
                key={review.id}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-full flex items-center justify-center text-white font-semibold">
                      {review.user.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-gray-900">{review.user}</p>
                        {review.verified && <BadgeCheck className="w-4 h-4 text-blue-500" title="Verified Purchase" />}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= review.rating ? "text-amber-500 fill-current" : "text-gray-300"}`}
                            />
                          ))}
                        </div>
                        <span className="text-xs text-gray-500">{review.date}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 mb-3">{review.comment}</p>
                {review.product && (
                  <p className="text-sm text-gray-500 mb-3">Product: {review.product}</p>
                )}
                <div className="flex items-center gap-4">
                  <button className="flex items-center gap-1 text-gray-500 text-sm hover:text-[#1790d7]">
                    <ThumbsUp className="w-4 h-4" /> Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}

        {activeTab === "policies" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Package className="w-5 h-5 text-[#1790d7]" />
                Shipping Policy
              </h3>
              <p className="text-gray-600">{vendorData.policies.shipping}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#1790d7]" />
                Return Policy
              </h3>
              <p className="text-gray-600">{vendorData.policies.returns}</p>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Award className="w-5 h-5 text-[#1790d7]" />
                Warranty Policy
              </h3>
              <p className="text-gray-600">{vendorData.policies.warranty}</p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default VendorDetail;

