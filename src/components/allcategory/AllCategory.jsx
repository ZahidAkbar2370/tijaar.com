import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import useApiQuery from "../../hooks/useApiQuery";
import { getCategories } from "../../services/categoriesService";
import { imageURL } from "../../api/axiosInstance";
import DotsLoader from "../common/DotsLoader";
import {
  Car,
  Building2,
  Smartphone,
  Wrench,
  HandHelping,
  Tent,
  Dumbbell,
  PawPrint,
  Users,
  Gift,
  Sofa,
  Briefcase,
  GraduationCap,
  MoreHorizontal,
  Search,
  Grid3X3,
  List,
} from "lucide-react";

const categoryIcons = {
  Automotive: Car,
  Property: Building2,
  Electronics: Smartphone,
  Contracting: Wrench,
  Services: HandHelping,
  Camping: Tent,
  Sports: Dumbbell,
  Animals: PawPrint,
  Family: Users,
  Gifts: Gift,
  Furniture: Sofa,
  Jobs: Briefcase,
  Education: GraduationCap,
  Other: MoreHorizontal,
};

const categoryColors = {
  Automotive: "from-blue-500 to-cyan-500",
  Property: "from-amber-500 to-orange-500",
  Electronics: "from-purple-500 to-pink-500",
  Contracting: "from-slate-500 to-gray-600",
  Services: "from-teal-500 to-green-500",
  Camping: "from-emerald-500 to-lime-500",
  Sports: "from-red-500 to-rose-500",
  Animals: "from-yellow-500 to-amber-500",
  Family: "from-pink-500 to-rose-400",
  Gifts: "from-violet-500 to-purple-500",
  Furniture: "from-orange-500 to-red-500",
  Jobs: "from-indigo-500 to-blue-500",
  Education: "from-cyan-500 to-blue-500",
  Other: "from-gray-500 to-slate-500",
};

const AllCategory = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  // Fetch categories from API
  const { data: categoriesResponse, isLoading } = useApiQuery(
    ["categories"],
    () => getCategories()
  );

  // Extract categories from API response
  const categories = useMemo(() => {
    if (!categoriesResponse?.data) return [];
    const data = categoriesResponse.data;
    return Array.isArray(data) ? data : (data.categories || data.data || []);
  }, [categoriesResponse]);

  // Filter categories based on search query
  const filteredCategories = useMemo(() => {
    if (!categories.length) return [];
    return categories.filter((cat) => {
      const name = cat.name || cat.title || "";
      return name.toLowerCase().includes(searchQuery.toLowerCase());
    });
  }, [categories, searchQuery]);

  return (
    <div className="py-10 lg:py-16 px-4 lg:px-16 bg-gray-50 min-h-screen">
      <div className="w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-gray-800">All Categories</h1>
              <p className="text-gray-500 mt-1">
                Browse {categories.length} {categories.length === 1 ? "category" : "categories"} with 100K+ products
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#1790d7]/20 focus:border-[#1790d7] transition-all"
                />
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
          </div>
        </motion.div>

        {isLoading ? (
          <div className="text-center py-16 flex items-center justify-center">
            <DotsLoader size="md" />
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">
              {searchQuery ? `No categories found matching "${searchQuery}"` : "No categories available"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 lg:gap-6">
            {filteredCategories.map((cat, index) => {
              const categoryName = cat.name || cat.title || "";
              const categorySlug = cat.slug || cat.id || categoryName.toLowerCase().replace(/\s+/g, "-");
              const subcategoriesCount = cat.subcategories_count || cat.subcategories?.length || cat.items?.length || 0;
              const productsCount = cat.products_count || cat.products?.length || 0;
              const iconKey = cat.iconKey || categoryName;
              const colorKey = cat.colorKey || categoryName;
              const Icon = categoryIcons[iconKey] || MoreHorizontal;
              const colorClass = categoryColors[colorKey] || categoryColors.Other;
              const categoryImage = cat.image || cat.image_url || cat.icon;
              const imageSrc = categoryImage ? (categoryImage.startsWith("http") ? categoryImage : `${imageURL}${categoryImage}`) : null;
              
              return (
                <motion.div
                  key={cat.id || index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link to={`/category/${categorySlug}`}>
                    <motion.div
                      whileHover={{ y: -5 }}
                      className="bg-white rounded-2xl p-4 lg:p-6 shadow-sm hover:shadow-xl border border-gray-100 transition-all duration-300 group cursor-pointer"
                    >
                      <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 overflow-hidden`}>
                        {imageSrc ? (
                          <img src={imageSrc} alt={categoryName} className="w-full h-full object-cover" />
                        ) : (
                        <Icon className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                        )}
                      </div>
                      
                      <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-[#1790d7] transition-colors text-sm lg:text-base">
                        {categoryName}
                      </h3>
                      
                      <p className="text-xs lg:text-sm text-gray-500">
                        {subcategoriesCount} {subcategoriesCount === 1 ? "subcategory" : "subcategories"}
                      </p>
                      
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <p className="text-xs text-[#1790d7] font-medium">
                          {productsCount > 0 ? `${productsCount}+` : "0"} products
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredCategories.map((cat, index) => {
              const categoryName = cat.name || cat.title || "";
              const categorySlug = cat.slug || cat.id || categoryName.toLowerCase().replace(/\s+/g, "-");
              const subcategoriesCount = cat.subcategories_count || cat.subcategories?.length || cat.items?.length || 0;
              const productsCount = cat.products_count || cat.products?.length || 0;
              const subcategories = cat.subcategories || cat.items || [];
              const iconKey = cat.iconKey || categoryName;
              const colorKey = cat.colorKey || categoryName;
              const Icon = categoryIcons[iconKey] || MoreHorizontal;
              const colorClass = categoryColors[colorKey] || categoryColors.Other;
              const categoryImage = cat.image || cat.image_url || cat.icon;
              const imageSrc = categoryImage ? (categoryImage.startsWith("http") ? categoryImage : `${imageURL}${categoryImage}`) : null;
              
              return (
                <motion.div
                  key={cat.id || index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <Link to={`/category/${categorySlug}`}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="bg-white rounded-xl p-4 shadow-sm hover:shadow-lg border border-gray-100 transition-all duration-300 flex items-center gap-4 group"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colorClass} flex items-center justify-center shrink-0 overflow-hidden`}>
                        {imageSrc ? (
                          <img src={imageSrc} alt={categoryName} className="w-full h-full object-cover" />
                        ) : (
                        <Icon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 group-hover:text-[#1790d7] transition-colors">
                          {categoryName}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                          {subcategories.length > 0 
                            ? subcategories.slice(0, 3).map(s => s.name || s).join(", ") + "..."
                            : "No subcategories"}
                        </p>
                      </div>
                      
                      <div className="text-right shrink-0">
                        <p className="text-sm font-semibold text-[#1790d7]">
                          {productsCount > 0 ? `${productsCount}+` : "0"} products
                        </p>
                        <p className="text-xs text-gray-500">
                          {subcategoriesCount} {subcategoriesCount === 1 ? "subcategory" : "subcategories"}
                        </p>
                      </div>
                    </motion.div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllCategory;
