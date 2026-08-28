"use client";

import { motion } from "framer-motion";

export default function DotsLoader({ size = "md", className = "" }) {
  const sizeClasses = { sm: "w-2 h-2", md: "w-3 h-3", lg: "w-4 h-4" };
  const dotSize = sizeClasses[size] || sizeClasses.md;

  return (
    <div className={`flex items-center justify-center gap-2 ${className}`}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={`${dotSize} rounded-full bg-[#1790d7]`}
          animate={{ y: [0, -12, 0], opacity: [0.5, 1, 0.5] }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: index * 0.2,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}
