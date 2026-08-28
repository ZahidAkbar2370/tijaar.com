import React from "react";
import { motion } from "framer-motion";
import { Search, MessageCircle, Handshake, ArrowRight, CheckCircle2 } from "lucide-react";

const steps = [
  {
    icon: Search,
    title: "Browse & Search",
    description: "Explore thousands of listings across multiple categories. Use filters to find exactly what you need.",
    color: "from-blue-500 to-cyan-500",
    features: ["Smart filters", "Category browse", "Location search"],
  },
  {
    icon: MessageCircle,
    title: "Connect with Seller",
    description: "Contact sellers directly through our secure messaging system. Ask questions and negotiate deals.",
    color: "from-purple-500 to-pink-500",
    features: ["Direct messaging", "Safe contact", "Quick response"],
  },
  {
    icon: Handshake,
    title: "Close the Deal",
    description: "Meet up safely, inspect the item, and complete your purchase. It's that simple!",
    color: "from-green-500 to-emerald-500",
    features: ["Secure meetups", "Verified sellers", "Easy transactions"],
  },
];

const HowItWorks = () => {
  return (
    <div className="py-20 px-4 lg:px-16 bg-white">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-16"
      >
        <span className="inline-block px-4 py-2 bg-gradient-to-r from-[#1790d7]/10 to-[#4db3e8]/10 text-[#4db3e8] rounded-full text-sm font-semibold mb-4">
          Simple Process
        </span>
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
          How It Works
        </h2>
        <p className="text-gray-500 text-lg max-w-2xl mx-auto">
          Getting started is easy! Follow these simple steps to buy or sell anything on our platform.
        </p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-8 lg:gap-12 relative">
        {/* Connection Lines (Desktop) */}
        <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-[#1790d7] to-[#4db3e8]"></div>

        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              {/* Step Number */}
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className={`relative z-10 w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center shadow-lg`}
              >
                <Icon className="w-10 h-10 text-white" />
                
                {/* Step Badge */}
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-md">
                  <span className="text-sm font-bold text-gray-800">{index + 1}</span>
                </div>
              </motion.div>

              {/* Arrow (Mobile) */}
              {index < steps.length - 1 && (
                <div className="md:hidden flex justify-center my-4">
                  <ArrowRight className="w-6 h-6 text-gray-300 rotate-90" />
                </div>
              )}

              {/* Content Card */}
              <motion.div
                whileHover={{ y: -5 }}
                className="bg-gray-50 rounded-2xl p-6 text-center hover:shadow-lg transition-all duration-300"
              >
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 mb-4 leading-relaxed">
                  {step.description}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  {step.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center justify-center gap-2 text-sm text-gray-600">
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          );
        })}
      </div>

      {/* CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="text-center mt-12"
      >
        <button className="px-8 py-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-full font-semibold hover:shadow-xl hover:shadow-indigo-500/30 active:scale-95 transition-all duration-300">
          Start Selling Now
        </button>
      </motion.div>
    </div>
  );
};

export default HowItWorks;

