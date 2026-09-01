"use client";

import ProductCard from "@/components/public/ProductCard";
import { PRODUCT_CARD_GRID_CLASS } from "@/lib/productCardSwiper";

export default function ProductGrid({ products }) {
  if (!products.length) {
    return <p className="text-center text-gray-500 py-16">No products in this category</p>;
  }

  return (
    <div className={PRODUCT_CARD_GRID_CLASS}>
      {products.map((p) => (
        <ProductCard key={p.id} product={p} showAddToCart />
      ))}
    </div>
  );
}
