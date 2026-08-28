"use client";

import ProductCard from "@/components/public/ProductCard";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="text-center text-gray-500 py-16">No products in this category</p>;
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 items-stretch">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showAddToCart />
      ))}
    </div>
  );
}
