"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { storesApi, productApi } from "@/lib/api";
import VendorDetail from "./VendorDetail";

export default function VendorPage() {
  const params = useParams();
  const slug = params?.slug;
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    storesApi
      .getBySlug(slug)
      .then((res) => {
        setVendor(res.vendor);
        return productApi.list({ store_slug: slug, per_page: 50 }).catch(() => ({ products: [] }));
      })
      .then((res) => setProducts(res.products || []))
      .catch(() => setVendor(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse h-48 w-64 bg-gray-200 rounded-xl" />
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Vendor not found</h2>
          <a href="/" className="text-[#1790d7] hover:underline">Go home</a>
        </div>
      </div>
    );
  }

  return <VendorDetail vendor={vendor} products={products} />;
}
