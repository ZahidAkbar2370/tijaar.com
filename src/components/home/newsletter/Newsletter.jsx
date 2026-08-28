import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle, Gift, Bell, Tag } from "lucide-react";
import useApiMutation from "../../../hooks/useApiMutation";
import axiosInstance from "../../../api/axiosInstance";
import { useSnackbar } from "../../../context/SnackbarContext";

const benefits = [
  { icon: Tag, text: "Exclusive Deals" },
  { icon: Bell, text: "New Listings Alert" },
  { icon: Gift, text: "Special Offers" },
];

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const { showSuccess } = useSnackbar();

  const { mutateAsync: subscribe, isLoading } = useApiMutation(
    async (payload) => {
      return axiosInstance.post("/newsletter", payload);
    },
    {
      onSuccess: () => {
        showSuccess?.("Subscribed successfully");
        setIsSubmitted(true);
        setTimeout(() => {
          setIsSubmitted(false);
          setEmail("");
        }, 3000);
      }
    }
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    subscribe({ email });
  };

  return (
    <div className="py-20 px-4 lg:px-16 bg-gray-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      {/* Gradient Orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#1790d7]/30 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-[#4db3e8]/30 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          {/* Icon */}
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex p-4 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-2xl mb-6"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>

          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Never Miss a Deal!
          </h2>
          <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter and be the first to know about new listings, 
            exclusive deals, and special offers.
          </p>

          {/* Benefits */}
          <div className="flex flex-wrap justify-center gap-4 mb-10">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <Icon className="w-4 h-4 text-[#4db3e8]" />
                  <span className="text-white text-sm">{benefit.text}</span>
                </motion.div>
              );
            })}
          </div>

          {/* Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="max-w-lg mx-auto"
          >
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1 relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-4 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#4db3e8] focus:ring-2 focus:ring-[#4db3e8]/50 transition-all duration-300"
                  required
                />
              </div>
              
              <motion.button
                type="submit"
                whileHover={{ scale: isSubmitted || isLoading ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitted || isLoading ? 1 : 0.98 }}
                disabled={isSubmitted || isLoading}
                className={`px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-300 ${
                  isSubmitted 
                    ? "bg-green-500 text-white" 
                    : "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white hover:shadow-lg hover:shadow-indigo-500/30"
                } ${isLoading ? "opacity-70 cursor-not-allowed" : ""}`}
              >
                {isSubmitted ? (
                  <>
                    <CheckCircle className="w-5 h-5" />
                    Subscribed!
                  </>
                ) : (
                  <>
                    {isLoading ? "Submitting..." : "Subscribe"}
                    {!isLoading && <Send className="w-5 h-5" />}
                  </>
                )}
              </motion.button>
            </div>
          </motion.form>

          {/* Privacy Note */}
          <p className="text-gray-500 text-sm mt-6">
            🔒 We respect your privacy. Unsubscribe anytime.
          </p>

          {/* Subscriber Count */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="mt-8 flex justify-center items-center gap-3"
          >
            <div className="flex -space-x-2">
              {[...Array(4)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 border-2 border-gray-900"
                ></div>
              ))}
            </div>
            <span className="text-gray-400 text-sm">
              Join <span className="text-white font-semibold">10,000+</span> subscribers
            </span>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Newsletter;

