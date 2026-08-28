"use client";

import ProductGrid from "../../category/[slug]/ProductGrid";
import { useSeoH1 } from "@/hooks/useSeoH1";

export default function BrandContent({ brand, products }) {
  const h1 = useSeoH1("brand", { name: brand?.name, fallback: brand?.name });
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="bg-gradient-to-r from-[#1790d7] to-[#4db3e8] py-12">
        <div className="w-full px-4">
          <h1 className="text-3xl font-bold text-white">{h1}</h1>
          <p className="text-white/80 mt-2">{products.length} products</p>
        </div>
      </div>
      <div className="w-full px-4 py-8">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
