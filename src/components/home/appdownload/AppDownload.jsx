"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Smartphone, Download, Star, Shield, Zap, Bell } from "lucide-react";
import { searchApi } from "@/lib/api";

const features = [
  { icon: Zap, text: "Fast & Easy" },
  { icon: Shield, text: "Secure" },
  { icon: Bell, text: "Instant Alerts" },
];

const AppDownload = () => {
  const [listings, setListings] = useState([]);

  useEffect(() => {
    searchApi.featured().then((r) => setListings((r.products || []).slice(0, 3))).catch(() => setListings([]));
  }, []);

  return (
    <div className="py-16 px-4 lg:px-16 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl"></div>
      
      {/* Floating Elements */}
      <motion.div
        animate={{ y: [0, -20, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-20 right-20 w-16 h-16 bg-white/10 rounded-2xl hidden lg:block"
      ></motion.div>
      <motion.div
        animate={{ y: [0, 20, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-20 left-32 w-12 h-12 bg-white/10 rounded-full hidden lg:block"
      ></motion.div>

      <div className="w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 text-white rounded-full text-sm font-medium mb-6">
              <Smartphone className="w-4 h-4" />
              Mobile App
            </span>

            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Get the App for a <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-orange-400">
                Better Experience
              </span>
            </h2>

            <p className="text-white/80 text-lg mb-8 leading-relaxed">
              Download our mobile app to browse listings on the go, get instant notifications, 
              and never miss out on great deals!
            </p>

            {/* Features */}
            <div className="flex flex-wrap gap-4 mb-8">
              {features.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full"
                  >
                    <Icon className="w-4 h-4 text-amber-400" />
                    <span className="text-white text-sm font-medium">{feature.text}</span>
                  </motion.div>
                );
              })}
            </div>

            {/* App Ratings */}
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-amber-400 fill-amber-400" />
                ))}
              </div>
              <span className="text-white/80">4.9 Rating • 100K+ Downloads</span>
            </div>

            {/* Download Buttons */}
            <div className="flex flex-wrap gap-4">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
                <div className="text-left">
                  <p className="text-xs opacity-80">Download on the</p>
                  <p className="text-sm font-semibold">App Store</p>
                </div>
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-3 bg-black text-white px-6 py-3 rounded-xl hover:bg-gray-900 transition-colors"
              >
                <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3.609 1.814L13.792 12 3.61 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.609-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L15.206 12l2.492-2.491zM5.864 2.658L16.802 8.99l-2.303 2.303-8.635-8.635z"/>
                </svg>
                <div className="text-left">
                  <p className="text-xs opacity-80">Get it on</p>
                  <p className="text-sm font-semibold">Google Play</p>
                </div>
              </motion.button>
            </div>
          </motion.div>

          {/* Right - Phone Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative flex justify-center"
          >
            {/* Phone Frame */}
            <div className="relative">
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="w-64 h-[500px] bg-gradient-to-b from-gray-800 to-gray-900 rounded-[3rem] p-3 shadow-2xl"
              >
                {/* Screen */}
                <div className="w-full h-full bg-white rounded-[2.5rem] overflow-hidden relative">
                  {/* Notch */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-black rounded-b-2xl"></div>
                  
                  {/* App Preview */}
                  <div className="pt-10 px-4">
                    <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] rounded-xl p-4 mb-4">
                      <h3 className="text-white font-bold text-lg">Tijaar</h3>
                      <p className="text-white/70 text-xs">Find everything you need</p>
                    </div>
                    
                    {/* Listings preview */}
                    <div className="space-y-3">
                      {(listings.length ? listings : [1, 2, 3]).map((item, i) =>
                        typeof item === "object" && item.slug ? (
                          <Link key={item.id} href={`/product/${item.slug}`} target="_blank" rel="noopener noreferrer" className="flex gap-3 bg-gray-50 rounded-lg p-2">
                            <img src={item.image || "/assets/sample-image.webp"} alt="" className="w-14 h-14 object-cover rounded-lg" />
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-gray-800 truncate">{item.name || item.title}</p>
                              <p className="text-[10px] text-[#1790d7] font-semibold">{Number(item.price || 0).toLocaleString()} PKR</p>
                            </div>
                          </Link>
                        ) : (
                          <div key={i} className="flex gap-3 bg-gray-50 rounded-lg p-2">
                            <div className="w-14 h-14 bg-gray-200 rounded-lg animate-pulse" />
                            <div className="flex-1">
                              <div className="h-3 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                              <div className="h-2 bg-gray-100 rounded w-1/2 animate-pulse" />
                            </div>
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Decorative Elements */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-8 -right-8 w-24 h-24 border-4 border-white/20 rounded-full"
              ></motion.div>
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center shadow-lg"
              >
                <Download className="w-8 h-8 text-white" />
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AppDownload;

