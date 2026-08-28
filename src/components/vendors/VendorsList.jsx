import { useState } from "react";
import { Link } from "react-router-dom";
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
  Search,
  Filter,
  Grid3X3,
  List,
} from "lucide-react";

const vendors = [
  {
    id: 1,
    name: "TechStore Pro",
    storeName: "TechStore Pro Official",
    logo: "/assets/sample-image.webp",
    rating: 4.9,
    reviews: 1247,
    products: 1250,
    totalSales: 15000,
    memberSince: "Jan 2020",
    verified: true,
    onTimeDelivery: "98%",
    responseRate: "98%",
    description: "Your trusted source for premium electronics and tech accessories. Fast shipping and excellent customer service.",
    categories: ["Electronics", "Gadgets", "Accessories"],
    badges: ["Top Seller", "Verified", "Fast Shipping"],
  },
  {
    id: 2,
    name: "Fashion Hub",
    storeName: "Fashion Hub Boutique",
    logo: "/assets/sample-image.webp",
    rating: 4.8,
    reviews: 892,
    products: 850,
    totalSales: 12000,
    memberSince: "Mar 2019",
    verified: true,
    onTimeDelivery: "97%",
    responseRate: "95%",
    description: "Trendy fashion items for men and women. Latest styles and premium quality clothing.",
    categories: ["Fashion", "Clothing", "Accessories"],
    badges: ["Trending", "Verified", "New Arrivals"],
  },
  {
    id: 3,
    name: "Home Essentials",
    storeName: "Home Essentials Store",
    logo: "/assets/sample-image.webp",
    rating: 4.7,
    reviews: 634,
    products: 720,
    totalSales: 9800,
    memberSince: "Jun 2021",
    verified: true,
    onTimeDelivery: "96%",
    responseRate: "94%",
    description: "Everything you need for your home. Quality furniture, decor, and household items.",
    categories: ["Furniture", "Home Decor", "Kitchen"],
    badges: ["Verified", "Quality Assured"],
  },
  {
    id: 4,
    name: "Beauty & Care",
    storeName: "Beauty & Care Cosmetics",
    logo: "/assets/sample-image.webp",
    rating: 4.9,
    reviews: 1456,
    products: 1100,
    totalSales: 18000,
    memberSince: "Feb 2020",
    verified: true,
    onTimeDelivery: "99%",
    responseRate: "97%",
    description: "Premium beauty products and skincare essentials. Natural and organic options available.",
    categories: ["Beauty", "Skincare", "Cosmetics"],
    badges: ["Top Seller", "Verified", "Organic"],
  },
  {
    id: 5,
    name: "Sports Zone",
    storeName: "Sports Zone Equipment",
    logo: "/assets/sample-image.webp",
    rating: 4.6,
    reviews: 523,
    products: 680,
    totalSales: 7500,
    memberSince: "Aug 2021",
    verified: true,
    onTimeDelivery: "95%",
    responseRate: "93%",
    description: "Professional sports equipment and athletic gear. For athletes and fitness enthusiasts.",
    categories: ["Sports", "Fitness", "Outdoor"],
    badges: ["Verified", "Professional"],
  },
  {
    id: 6,
    name: "BookWorld",
    storeName: "BookWorld Library",
    logo: "/assets/sample-image.webp",
    rating: 4.8,
    reviews: 789,
    products: 950,
    totalSales: 11000,
    memberSince: "Nov 2019",
    verified: true,
    onTimeDelivery: "97%",
    responseRate: "96%",
    description: "Books for every reader. Fiction, non-fiction, educational materials, and more.",
    categories: ["Books", "Education", "Media"],
    badges: ["Verified", "Best Seller"],
  },
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
    transition: { duration: 0.5 },
  },
};

const VendorsList = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [sortBy, setSortBy] = useState("rating");

  const filteredVendors = vendors.filter((vendor) =>
    vendor.storeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    vendor.categories.some((cat) => cat.toLowerCase().includes(searchQuery.toLowerCase()))
  ).sort((a, b) => {
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "products") return b.products - a.products;
    if (sortBy === "sales") return b.totalSales - a.totalSales;
    return 0;
  });

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
            <span className="text-gray-900 font-medium">Sellers</span>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-12 lg:py-16"
      >
        <div className="w-full px-4 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-center"
          >
            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-4">Our Verified Sellers</h1>
            <p className="text-white/80 text-lg max-w-2xl mx-auto">
              Shop from trusted sellers with excellent ratings and fast shipping. All sellers are verified and committed to quality.
            </p>
          </motion.div>
        </div>
      </motion.div>

      <div className="w-full px-4 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="relative flex-1 sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search sellers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="appearance-none pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] cursor-pointer"
            >
              <option value="rating">Highest Rated</option>
              <option value="products">Most Products</option>
              <option value="sales">Most Sales</option>
            </select>
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
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {filteredVendors.map((vendor) => (
              <motion.div key={vendor.id} variants={itemVariants}>
                <Link to={`/seller/${vendor.id}`}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group cursor-pointer"
                  >
                    <div className="relative h-48 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="relative z-10 text-center">
                        <div className="w-24 h-24 bg-white rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg">
                          <Store className="w-12 h-12 text-[#1790d7]" />
                        </div>
                        {vendor.verified && (
                          <BadgeCheck className="w-6 h-6 text-white mx-auto" />
                        )}
                      </div>
                    </div>

                    <div className="p-6">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h3 className="font-bold text-gray-900 text-lg mb-1 group-hover:text-[#1790d7] transition-colors">
                            {vendor.storeName}
                          </h3>
                          <p className="text-sm text-gray-500">by {vendor.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-gray-900">{vendor.rating}</span>
                        </div>
                        <span className="text-gray-500 text-sm">({vendor.reviews} reviews)</span>
                      </div>

                      <p className="text-sm text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {vendor.badges.slice(0, 2).map((badge, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-[#1790d7]/10 text-[#1790d7] text-xs font-medium rounded-full"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-100">
                        <div className="text-center">
                          <p className="text-lg font-bold text-gray-900">{vendor.products}</p>
                          <p className="text-xs text-gray-500">Products</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-green-600">{vendor.onTimeDelivery}</p>
                          <p className="text-xs text-gray-500">On-Time</p>
                        </div>
                        <div className="text-center">
                          <p className="text-lg font-bold text-blue-600">{vendor.responseRate}</p>
                          <p className="text-xs text-gray-500">Response</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
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
            {filteredVendors.map((vendor) => (
              <motion.div key={vendor.id} variants={itemVariants}>
                <Link to={`/seller/${vendor.id}`}>
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-white rounded-xl p-6 shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex gap-6 group"
                  >
                    <div className="w-24 h-24 bg-gradient-to-br from-[#1790d7] to-[#4db3e8] rounded-xl flex items-center justify-center shrink-0">
                      <Store className="w-12 h-12 text-white" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-gray-900 text-xl group-hover:text-[#1790d7] transition-colors">
                              {vendor.storeName}
                            </h3>
                            {vendor.verified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                          </div>
                          <p className="text-sm text-gray-500">by {vendor.name} • Member since {vendor.memberSince}</p>
                        </div>
                      </div>

                      <p className="text-gray-600 mb-4 line-clamp-1">{vendor.description}</p>

                      <div className="flex items-center gap-6 mb-4">
                        <div className="flex items-center gap-1">
                          <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                          <span className="font-semibold text-gray-900">{vendor.rating}</span>
                          <span className="text-gray-500 text-sm">({vendor.reviews} reviews)</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <Package className="w-4 h-4" />
                          <span>{vendor.products} products</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-500 text-sm">
                          <TrendingUp className="w-4 h-4" />
                          <span>{vendor.totalSales.toLocaleString()} sales</span>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {vendor.badges.map((badge, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 bg-[#1790d7]/10 text-[#1790d7] text-xs font-medium rounded-full"
                          >
                            {badge}
                          </span>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}

        {filteredVendors.length === 0 && (
          <div className="text-center py-16">
            <Store className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No sellers found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VendorsList;

