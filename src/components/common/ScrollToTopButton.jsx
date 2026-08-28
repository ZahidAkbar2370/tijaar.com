"use client";

import { useState, useEffect } from "react";
import { ArrowUp } from "lucide-react";

export default function ScrollToTopButton() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 300);
    };
    window.addEventListener("scroll", toggleVisibility, { passive: true });
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  if (!isVisible) return null;

  return (
    <button
      type="button"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      aria-label="Scroll to top"
      className="fixed bottom-6 right-6 z-50 p-3 bg-gradient-to-r from-[#1790d7] to-[#4db3e8] text-white rounded-full shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:scale-105 transition-all"
    >
      <ArrowUp className="w-6 h-6" aria-hidden="true" />
    </button>
  );
}
