"use client";

import { useState, useRef, useEffect } from "react";
import { useMarket } from "@/context/MarketContext";
import { ChevronDown, MapPin } from "lucide-react";

export default function MarketSelector() {
  const { market, setMarket, marketInfo } = useMarket();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 text-white hover:opacity-90 transition-colors"
      >
        <MapPin size={14} strokeWidth={1.5} className="text-white" />
        <span className="text-white">{market === "PK" ? "Pakistan" : "Pakistan"}</span>
        <span className="text-white text-xs">({marketInfo.currency})</span>
        <ChevronDown size={12} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 py-2 bg-white rounded-xl shadow-xl border border-gray-100 z-[9999] min-w-[160px]">
          <button
            type="button"
            onClick={() => {
              setMarket("PK");
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${market === "PK" ? "text-[#1790d7] font-medium bg-[#1790d7]/5" : "text-gray-700"}`}
          >
            Pakistan (PKR ₨)
          </button>
          <button
            type="button"
            onClick={() => {
              setMarket("AE");
              setIsOpen(false);
            }}
            className={`w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${market === "AE" ? "text-[#1790d7] font-medium bg-[#1790d7]/5" : "text-gray-700"}`}
          >
            Pakistan (AED د.إ)
          </button>
        </div>
      )}
    </div>
  );
}
