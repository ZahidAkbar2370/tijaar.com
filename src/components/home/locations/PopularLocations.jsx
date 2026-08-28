import React from "react";
import { motion } from "framer-motion";
import { MapPin, ChevronRight, TrendingUp } from "lucide-react";

const locations = [
  {
    name: "Dubai",
    listings: 12500,
    image: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&q=80",
    trending: true,
  },
  {
    name: "Abu Dhabi",
    listings: 8200,
    image: "https://images.unsplash.com/photo-1546412414-e1885259563a?w=400&q=80",
    trending: true,
  },
  {
    name: "Sharjah",
    listings: 5400,
    image: "https://images.unsplash.com/photo-1578759555590-cbe5cc4d76c4?w=400&q=80",
    trending: false,
  },
  {
    name: "Ajman",
    listings: 3200,
    image: "https://images.unsplash.com/photo-1518684079-3c830dcef090?w=400&q=80",
    trending: false,
  },
  {
    name: "Ras Al Khaimah",
    listings: 2100,
    image: "https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&q=80",
    trending: true,
  },
  {
    name: "Fujairah",
    listings: 1800,
    image: "https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=400&q=80",
    trending: false,
  },
];

const PopularLocations = () => {
  return (
    <div className="py-16 px-4 lg:px-16 bg-gray-50">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex justify-between items-center mb-10"
      >
        <div>
          <h2 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <MapPin className="w-8 h-8 text-[#4db3e8]" />
            Popular Locations
          </h2>
          <p className="text-gray-500 mt-2">Explore listings in top cities</p>
        </div>
        <button className="hidden md:flex items-center gap-2 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-full font-semibold hover:border-[#1790d7] hover:text-[#1790d7] transition-all duration-300">
          All Locations
          <ChevronRight className="w-5 h-5" />
        </button>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {locations.map((location, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.08 }}
            whileHover={{ y: -8, scale: 1.02 }}
            className="relative rounded-2xl overflow-hidden cursor-pointer group h-48"
          >
            {/* Background Image */}
            <img
              src={location.image}
              alt={location.name}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
            />

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            {/* Trending Badge */}
            {location.trending && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <TrendingUp className="w-3 h-3" />
                Trending
              </div>
            )}

            {/* Content */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <h3 className="text-white font-bold text-lg mb-1">
                {location.name}
              </h3>
              <p className="text-white/80 text-sm">
                {location.listings.toLocaleString()} listings
              </p>
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#1790d7]/50 to-[#4db3e8]/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white font-semibold px-4 py-2 border-2 border-white rounded-full">
                Explore
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PopularLocations;

