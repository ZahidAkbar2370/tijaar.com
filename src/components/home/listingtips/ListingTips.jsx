import { useState } from "react";
import { motion } from "framer-motion";
import {
  LayoutGrid,
  Camera,
  Type,
  FileText,
  DollarSign,
  ChevronRight,
  Sparkles,
} from "lucide-react";

const tips = [
  {
    id: 1,
    icon: LayoutGrid,
    title: "Pick the Right Category",
    description: "Choose the most relevant category to help buyers find your listing quickly.",
    color: "text-[#1790d7]",
    bgColor: "bg-[#1790d7]/10",
  },
  {
    id: 2,
    icon: Camera,
    title: "Capture Attention with Quality Photos",
    description: "Upload clear, well-lit photos from multiple angles to showcase your item.",
    color: "text-[#1790d7]",
    bgColor: "bg-[#1790d7]/10",
  },
  {
    id: 3,
    icon: Type,
    title: "Write a Clear Title",
    description: "Make a short, catchy title that describes what you're selling.",
    color: "text-[#1790d7]",
    bgColor: "bg-[#1790d7]/10",
  },
  {
    id: 4,
    icon: FileText,
    title: "Describe Your Item Well, and Use Good Keywords",
    description: "Include all important details like condition, features, and specifications.",
    color: "text-[#1790d7]",
    bgColor: "bg-[#1790d7]/10",
  },
  {
    id: 5,
    icon: DollarSign,
    title: "Price it Right",
    description: "Research similar items and set a competitive, fair price for quick sales.",
    color: "text-[#1790d7]",
    bgColor: "bg-[#1790d7]/10",
  },
];

const ListingTips = () => {
  const [activeIndex, setActiveIndex] = useState(2);

  return (
    <div className="py-16 lg:py-20 px-4 lg:px-16 bg-white">
      <div className="w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#1790d7]/10 rounded-full text-[#1790d7] text-sm font-medium mb-4"
            >
              <Sparkles className="w-4 h-4" />
              Seller Tips
            </motion.span>

            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
              Tips for Creating the Perfect
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#1790d7] to-[#4db3e8]">
                listing on Tijaar
              </span>
            </h2>

            <div className="space-y-2">
              {tips.map((tip, index) => {
                const Icon = tip.icon;
                const isActive = activeIndex === index;

                return (
                  <motion.div
                    key={tip.id}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 }}
                    onClick={() => setActiveIndex(index)}
                    className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "bg-[#1790d7]/5 border-l-4 border-[#1790d7]"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div
                      className={`p-3 rounded-xl transition-all duration-300 ${
                        isActive
                          ? "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white"
                          : tip.bgColor + " " + tip.color
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1">
                      <h3
                        className={`font-semibold transition-colors ${
                          isActive ? "text-[#1790d7]" : "text-gray-900"
                        }`}
                      >
                        {tip.title}
                      </h3>
                      
                      <motion.div
                        initial={false}
                        animate={{
                          height: isActive ? "auto" : 0,
                          opacity: isActive ? 1 : 0,
                        }}
                        transition={{ duration: 0.3 }}
                        className="overflow-hidden"
                      >
                        <p className="text-gray-500 text-sm mt-1 leading-relaxed">
                          {tip.description}
                        </p>
                      </motion.div>
                    </div>

                    {isActive && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="hidden lg:block"
                      >
                        <div className="w-16 h-1 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-full mt-3"></div>
                      </motion.div>
                    )}
                  </motion.div>
                );
              })}
            </div>

            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-8 flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-indigo-500/25 transition-all"
            >
              Start Selling Now
              <ChevronRight className="w-5 h-5" />
            </motion.button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#1790d7]/20 to-[#4db3e8]/20 rounded-3xl blur-3xl"></div>
              
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl p-8 overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#1790d7]/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#4db3e8]/10 rounded-full translate-y-1/2 -translate-x-1/2"></div>

                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="relative z-10"
                >
                  <div className="bg-white rounded-2xl shadow-xl p-4 max-w-xs mx-auto">
                    <div className="w-full h-40 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl mb-4 flex items-center justify-center">
                      <div className="grid grid-cols-2 gap-2 p-4">
                        <div className="w-16 h-16 bg-white/80 rounded-lg shadow-sm"></div>
                        <div className="w-16 h-16 bg-white/80 rounded-lg shadow-sm"></div>
                        <div className="w-16 h-16 bg-white/80 rounded-lg shadow-sm"></div>
                        <div className="w-16 h-16 bg-white/80 rounded-lg shadow-sm"></div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-full"></div>
                      <div className="h-3 bg-gray-100 rounded w-2/3"></div>
                    </div>

                    <div className="mt-4 flex items-center justify-between">
                      <div className="h-6 w-20 bg-[#1790d7]/20 rounded"></div>
                      <div className="h-8 w-24 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-lg"></div>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                  className="absolute bottom-12 -left-4 bg-white rounded-xl shadow-lg p-3 flex items-center gap-3"
                >
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full border-2 border-white flex items-center justify-center text-white text-xs">✓</div>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-900">Furnished apartment for rent in</p>
                    <p className="text-xs text-gray-500">Al Ahmadi</p>
                  </div>
                </motion.div>

                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute top-1/2 right-8 text-amber-400 text-2xl"
                >
                  ✨
                </motion.div>
                <motion.div
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity, delay: 0.5 }}
                  className="absolute top-1/3 right-16 text-amber-400 text-lg"
                >
                  ✨
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ListingTips;

