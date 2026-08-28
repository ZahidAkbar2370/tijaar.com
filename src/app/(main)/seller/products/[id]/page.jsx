"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ProtectedRoute from "@/components/ProtectedRoute";
import { sellerProductsApi } from "@/lib/api";
import { resolveMediaUrl } from "@/lib/media";
import {
  Pencil,
  Trash2,
  Layers,
  ArrowLeft,
  FileText,
  Video,
  Package,
  Tag,
  Truck,
  Camera,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { useSnackbar } from "@/context/SnackbarContext";
import { useMarket } from "@/context/MarketContext";
import PageHero from "@/components/customer/PageHero";
import { confirmDelete } from "@/lib/sweetAlert";

function Section({ title, subtitle, icon: Icon, children }) {
  return (
    <section className="bg-white rounded-2xl border border-gray-200/80 shadow-sm">
      <div className="flex items-center gap-3 px-4 sm:px-5 py-3.5 border-b border-gray-100">
        {Icon && (
          <span className="w-9 h-9 rounded-lg bg-[#1790d7]/10 text-[#1790d7] flex items-center justify-center shrink-0">
            <Icon className="w-[18px] h-[18px]" />
          </span>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-gray-900 text-[15px] sm:text-base leading-tight">{title}</h3>
          {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      <div className="p-4 sm:p-5 space-y-3">{children}</div>
    </section>
  );
}

function Meta({ label, children }) {
  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  );
}

export default function ProductViewPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id;
  const { showSuccess, showError } = useSnackbar();
  const { formatPrice } = useMarket();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    sellerProductsApi
      .get(id)
      .then((r) => setProduct(r.product))
      .catch(() => setProduct(null))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    const confirmed = await confirmDelete({
      title: "Delete product?",
      text: `"${product?.name}" will be permanently removed. This cannot be undone.`,
      confirmButtonText: "Yes, delete",
    });
    if (!confirmed) return;
    sellerProductsApi
      .delete(id)
      .then(() => {
        showSuccess?.("Product deleted");
        router.push("/seller/products");
      })
      .catch((e) => showError?.(e?.message || "Delete failed"));
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="animate-pulse h-64 bg-gray-100 rounded-xl" />
      </ProtectedRoute>
    );
  }

  if (!product) {
    return (
      <ProtectedRoute requiredRole="seller">
        <div className="text-center py-12">
          <p className="text-gray-500">Product not found.</p>
          <Link href="/seller/products" className="text-[#1790d7] hover:underline mt-2 inline-block">
            ← Back to Products
          </Link>
        </div>
      </ProtectedRoute>
    );
  }

  const thumb =
    product.thumbnail_url ||
    product.media?.[0]?.image_url ||
    (product.media?.[0]?.path ? resolveMediaUrl(product.media[0].path) : null);

  const shippingLabel =
    product.shipping_mode === "free_shipping" || product.shipping_mode === "included_in_price"
      ? "Free for buyer"
      : product.shipping_cost_cached != null
        ? `Buyer pays · Rs ${Number(product.shipping_cost_cached).toLocaleString()}`
        : "Buyer pays";

  return (
    <ProtectedRoute requiredRole="seller">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <Link href="/seller/products" className="text-amber-600 text-sm hover:underline inline-flex items-center gap-1">
            <ArrowLeft className="w-4 h-4" /> Back to Products
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            {product.slug && (
              <Link
                href={`/product/${product.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 inline-flex items-center gap-1.5"
              >
                <ExternalLink className="w-4 h-4" /> Public page
              </Link>
            )}
            <Link
              href={`/seller/products/${id}/edit`}
              className="px-4 py-2 bg-[#1790d7] text-white rounded-xl text-sm font-medium inline-flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit
            </Link>
            {(product.product_type === "variable" || (product.variants && product.variants.length > 0)) && (
              <Link
                href={`/seller/products/${id}/variants`}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2"
              >
                <Layers className="w-4 h-4" /> Variations
              </Link>
            )}
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-medium inline-flex items-center gap-2"
            >
              <Trash2 className="w-4 h-4" /> Delete
            </button>
          </div>
        </div>

        <PageHero
          title={product.name}
          description={product.short_description || "Product details — same fields as Sell / Edit"}
          illustration="products"
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-5 items-start">
          <div className="lg:col-span-7 xl:col-span-8 space-y-4">
            <Section title="Item details" subtitle="Category, brand, condition" icon={Package}>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <Meta label="SKU">{product.sku || "—"}</Meta>
                <Meta label="Category">{product.category?.name || "—"}</Meta>
                <Meta label="Brand">{product.brand?.name || "—"}</Meta>
                <Meta label="Condition">
                  <span className="capitalize">{product.condition || "—"}</span>
                </Meta>
                <Meta label="Type">{product.product_type === "variable" ? "Variable" : "Simple"}</Meta>
                <Meta label="Status">
                  <span
                    className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      product.status === "published"
                        ? "bg-emerald-100 text-emerald-700"
                        : product.status === "pending"
                          ? "bg-amber-100 text-amber-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {product.status}
                  </span>
                </Meta>
              </div>
              {product.description && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1">Description</p>
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{product.description}</p>
                </div>
              )}
            </Section>

            <Section title="Photos" subtitle="Main image & gallery" icon={Camera}>
              <div className="flex flex-wrap gap-3">
                {thumb && (
                  <img
                    src={thumb}
                    alt={product.name}
                    className="w-40 h-40 object-cover rounded-xl border border-gray-200"
                    onError={(e) => {
                      e.target.src =
                        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' fill='%23d1d5db' viewBox='0 0 24 24'%3E%3Cpath d='M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z'/%3E%3C/svg%3E";
                    }}
                  />
                )}
                {product.media?.map((m) => (
                  <img
                    key={m.id}
                    src={m.image_url || resolveMediaUrl(m.path)}
                    alt=""
                    className="w-20 h-20 object-cover rounded-xl border border-gray-200"
                  />
                ))}
                {!thumb && !product.media?.length && <p className="text-sm text-gray-500">No photos</p>}
              </div>
              {product.video_url && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <Video className="w-3.5 h-3.5" /> Video
                  </p>
                  <a href={product.video_url} target="_blank" rel="noopener noreferrer" className="text-sm text-[#1790d7] hover:underline break-all">
                    {product.video_url}
                  </a>
                </div>
              )}
              {product.documents?.length > 0 && (
                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-medium text-gray-500 mb-1 flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5" /> Documents
                  </p>
                  <ul className="space-y-1">
                    {product.documents.map((d) => (
                      <li key={d.id}>
                        <a
                          href={d.path ? resolveMediaUrl(d.path) : "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[#1790d7] hover:underline"
                        >
                          {d.label || d.original_name || "Document"}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Section>
          </div>

          <div className="lg:col-span-5 xl:col-span-4 space-y-4">
            <Section title="Price & stock" subtitle="PKR" icon={Tag}>
              <Meta label="Selling price">
                <span className="text-lg font-bold text-[#1790d7]">{formatPrice?.(product.price) ?? Number(product.price || 0).toLocaleString()}</span>
              </Meta>
              {product.compare_at_price != null && Number(product.compare_at_price) > 0 && (
                <Meta label="Compare at">
                  <span className="line-through text-gray-500">{formatPrice?.(product.compare_at_price) ?? Number(product.compare_at_price).toLocaleString()}</span>
                </Meta>
              )}
              <Meta label="Quantity">{product.quantity ?? 0}</Meta>
            </Section>

            <Section title="Shipping" subtitle="Delivery option" icon={Truck}>
              <Meta label="Option">{shippingLabel}</Meta>
            </Section>

            <Section title="Promotions" subtitle="Visibility badges" icon={Sparkles}>
              <div className="flex flex-wrap gap-2">
                {product.is_featured && (
                  <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-100 text-amber-800">Featured</span>
                )}
                {product.is_hot && (
                  <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold bg-rose-100 text-rose-800">Hot</span>
                )}
                {!product.is_featured && !product.is_hot && (
                  <p className="text-sm text-gray-500">No active promotion badges.</p>
                )}
              </div>
              <Link href="/seller/promote" className="text-xs font-medium text-[#1790d7] hover:underline inline-block mt-1">
                Manage packages →
              </Link>
            </Section>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
