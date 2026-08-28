import dynamic from "next/dynamic";
import {
  buildPageMetadata,
  fetchApi,
  fetchSiteSettings,
  stripHtml,
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
  if (!product) {
    return buildPageMetadata({
      title: "Product Not Found",
      description: "This product could not be found on Tijaar.",
      path: `/product/${slug}`,
      siteSettings: settings,
    });
  }
  return buildPageMetadata({
    title: product.meta_title?.trim() || product.name,
    description:
      stripHtml(
        product.meta_description || product.short_description || product.description || ""
      ).slice(0, 160) || `Shop ${product.name} on Tijaar.`,
    keywords: product.meta_keywords?.trim() || undefined,
    exactTitle: Boolean(product.meta_title?.trim()),
    image: product.thumbnail || product.image,
    path: `/product/${slug}`,
    siteSettings: settings,
  });
}

export default async function ProductPage({ params }) {
  const { slug } = await params;
  const product = await fetchProductFromApi(slug);

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Product not found</h2>
          <a href="/" className="text-[#1790d7] hover:underline">Go home</a>
        </div>
      </div>
    );
  }

  return <ProductDetail product={product} />;
}
