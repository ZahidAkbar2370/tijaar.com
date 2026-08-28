import React from "react";
import { Link } from "react-router-dom";
import { Heart, Star, MapPin, Clock, BadgeCheck } from "lucide-react";
import { motion } from "framer-motion";
import shoeImg from "/assets/shoe.png";

const ProductCard = ({ productId = "nike-running-shoe" }) => {
  return (
    <Link to={`/product/${productId}`}>
      <motion.div
        whileHover={{ y: -8 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-sm bg-white rounded-3xl shadow-lg hover:shadow-2xl overflow-hidden border border-gray-100 group cursor-pointer"
      >
      <div className="relative h-56 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1790d7]/90 to-[#4db3e8]/90"></div>
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-white rounded-full blur-3xl translate-y-1/2 -translate-x-1/2"></div>
        </div>
        
        <motion.img
          whileHover={{ scale: 1.1, rotate: -5 }}
          transition={{ duration: 0.4 }}
          src={shoeImg}
          alt="product"
          className="absolute inset-0 m-auto w-48 drop-shadow-2xl z-10"
        />

        <div className="absolute top-4 left-4 flex items-center gap-1 bg-amber-400 text-gray-900 px-2.5 py-1 rounded-full text-xs font-bold">
          <Star className="w-3 h-3 fill-current" />
          4.9
        </div>

        <motion.button
          onClick={(e) => e.preventDefault()}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="absolute top-4 right-4 p-2.5 bg-white/20 backdrop-blur-md rounded-full hover:bg-white/40 transition-colors"
        >
          <Heart className="w-5 h-5 text-white hover:fill-red-500 hover:text-red-500 transition-colors" />
        </motion.button>

        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-white/90 text-xs">
            <MapPin className="w-3.5 h-3.5" />
            <span>Dubai Marina</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/90 text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>2h ago</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <h2 className="text-lg font-bold text-gray-900 line-clamp-1 group-hover:text-[#1790d7] transition-colors">
            Nike Running Shoe
          </h2>
          <div className="flex items-center gap-1 text-blue-600 shrink-0">
            <BadgeCheck className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-4">
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-[#1790d7]/10 hover:text-[#1790d7] transition-colors cursor-pointer">
            EU38
          </span>
          <span className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium hover:bg-[#1790d7]/10 hover:text-[#1790d7] transition-colors cursor-pointer">
            BLACK/WHITE
          </span>
          <span className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
            In Stock
          </span>
        </div>

        <p className="text-gray-500 text-sm leading-relaxed line-clamp-2 mb-5">
          Crossing hardwood comfort with off-court flair. '80s-inspired construction, bold details and nothin'-but-net style.
        </p>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Price</p>
            <p className="text-2xl font-bold bg-gradient-to-r from-[#1790d7] to-[#4db3e8] bg-clip-text text-transparent">
              $69.99
            </p>
          </div>

          <span className="px-6 py-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/30 transition-all duration-300">
            View Details
          </span>
        </div>
      </div>
    </motion.div>
  </Link>
  );
};

export default ProductCard;

