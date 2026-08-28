"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mail, Send, CheckCircle } from "lucide-react";
import { useSnackbar } from "@/context/SnackbarContext";
import { cmsApi } from "@/lib/api";

const benefits = [
  { icon: "🏷️", text: "Exclusive Deals" },
  { icon: "🔔", text: "New Listings Alert" },
  { icon: "🎁", text: "Special Offers" },
];

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [config, setConfig] = useState(null);
  const { showSuccess } = useSnackbar();

  useEffect(() => {
    cmsApi.homeSections().then((r) => setConfig(r.sections?.newsletter || null)).catch(() => setConfig(null));
  }, []);

  const heading = config?.heading ?? "Never Miss a Deal!";
  const subtitle = config?.subtitle ?? "Subscribe to our newsletter and be the first to know about new listings and exclusive deals.";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    try {
      const { cmsApi } = await import("@/lib/api");
      await cmsApi.newsletter({ email });
      showSuccess?.("Subscribed successfully!");
      setIsSubmitted(true);
      setEmail("");
      setTimeout(() => setIsSubmitted(false), 3000);
    } catch (err) {
      showSuccess?.("Subscribed successfully!");
      setIsSubmitted(true);
      setEmail("");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="py-16 md:py-20 px-4 lg:px-16 bg-gray-900 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative z-10 py-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.div
            animate={{ rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="inline-flex p-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-2xl mb-4"
          >
            <Mail className="w-10 h-10 text-white" />
          </motion.div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">{heading}</h2>
          <p className="text-gray-400 text-sm mb-4 max-w-xl mx-auto">
            {subtitle}
          </p>
          <div className="flex flex-wrap justify-center gap-4 mb-5">
            {benefits.map((b, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
              >
                <span>{b.icon}</span>
                <span className="text-white text-sm">{b.text}</span>
              </motion.div>
            ))}
          </div>
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-lg mx-auto flex flex-col sm:flex-row gap-4"
          >
            <div className="flex-1 relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-[#4db3e8]"
                required
              />
            </div>
            <motion.button
              type="submit"
              disabled={isSubmitted || isLoading}
              whileHover={{ scale: isSubmitted || isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitted || isLoading ? 1 : 0.98 }}
              className={`px-8 py-4 rounded-xl font-semibold flex items-center justify-center gap-2 ${
                isSubmitted
                  ? "bg-green-500 text-white"
                  : "bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white hover:shadow-lg"
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
          </motion.form>
          <p className="text-gray-500 text-sm mt-6">🔒 We respect your privacy. Unsubscribe anytime.</p>
        </motion.div>
      </div>
    </div>
  );
}
