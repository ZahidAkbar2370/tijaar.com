import dynamic from "next/dynamic";
import ProductNotFound from "@/components/public/ProductNotFound";
import {
  buildProductMetadata,
  fetchApi,
  fetchSiteSettings,
} from "@/lib/seo";

const ProductDetail = dynamic(() => import("./ProductDetail"), {
  ssr: true,
  loading: () => <div className="min-h-[60vh] flex items-center justify-center">Loading…</div>,
});

export async function generateStaticParams() {
  return [];
}

async function fetchProductFromApi(slug) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${base}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.product || null;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [settings, data] = await Promise.all([
    fetchSiteSettings(),
    fetchApi(`/products/${slug}`, 60),
  ]);
  const product = data?.product;
  return buildProductMetadata(product, slug, settings);
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await fetchProductFromApi(slug);

  if (!product) {
    return <ProductNotFound slug={slug} />;
  }

  return <ProductDetail product={product} />;
}
