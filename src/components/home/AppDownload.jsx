"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Star } from "lucide-react";
import { useHomeData } from "@/context/HomeDataContext";

const features = [
  { icon: "⚡", text: "Fast & Easy" },
  { icon: "🛡️", text: "Secure" },
  { icon: "🔔", text: "Instant Alerts" },
];

export default function AppDownload() {
  const { sections } = useHomeData();
  const config = sections?.app_download ?? null;

  const headline = config?.headline ?? "Get the App for a";
  const highlight = config?.highlight ?? "Better Experience";
  const description = config?.description ?? "Download our mobile app to browse listings on the go, get instant notifications.";
  const ratingText = config?.rating_text ?? "4.9 Rating • 100K+ Downloads";
  const appStoreUrl = config?.app_store_url || "#";
  const playStoreUrl = config?.play_store_url || "#";

  return (
    <div className="py-8 px-4 lg:px-16 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] relative overflow-hidden">
      <div className="w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-4">
              <Smartphone className="w-4 h-4" />
              Mobile App
            </span>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-4 leading-tight">
              {headline} <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                {highlight}
              </span>
            </h2>
            <p className="text-white/80 text-sm mb-4">
              {description}
            </p>
            <div className="flex flex-wrap gap-4 mb-4">
              {features.map((f, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                >
                  <span>{f.icon}</span>
                  <span className="text-white text-sm font-medium">{f.text}</span>
                </motion.div>
              ))}
            </div>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-white/80">{ratingText}</span>
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href={appStoreUrl} target="_blank" rel="noopener noreferrer">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 cursor-pointer"
                >
                  <span className="text-2xl">🍎</span>
                  <div className="text-left">
                    <p className="text-xs opacity-80">Download on the</p>
                    <p className="text-sm font-semibold">App Store</p>
                  </div>
                </motion.span>
              </Link>
              <Link href={playStoreUrl} target="_blank" rel="noopener noreferrer">
                <motion.span
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 cursor-pointer"
                >
                  <span className="text-2xl">▶️</span>
                  <div className="text-left">
                    <p className="text-xs opacity-80">Get it on</p>
                    <p className="text-sm font-semibold">Google Play</p>
                  </div>
                </motion.span>
              </Link>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="flex justify-center"
          >
            <div className="w-64 h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl">
              <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden">
                <div className="pt-10 px-4">
                  <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-xl p-4 mb-4">
                    <h3 className="text-white font-bold text-lg">Tijaar</h3>
                    <p className="text-white/70 text-xs">Find everything you need</p>
                  </div>
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-3 bg-gray-50 rounded-lg p-2 mb-3">
                      <div className="w-14 h-14 bg-gray-200 rounded-lg" />
                      <div className="flex-1">
                        <div className="h-3 bg-gray-300 rounded w-3/4 mb-2" />
                        <div className="h-2 bg-gray-200 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
