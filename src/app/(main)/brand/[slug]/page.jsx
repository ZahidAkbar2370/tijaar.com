import BrandContent from "./BrandContent";
import { buildPageMetadata, fetchApi, fetchSiteSettings, stripHtml } from "@/lib/seo";

async function fetchBrand(slug) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${base}/brands/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.brand || null;
  } catch {
    return null;
  }
}

async function fetchProducts(params) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const qs = new URLSearchParams(params).toString();
    const res = await fetch(`${base}/products?${qs}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.products || [];
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const [settings, data] = await Promise.all([
    fetchSiteSettings(),
    fetchApi(`/brands/${slug}`, 60),
  ]);
  const brand = data?.brand;
  if (!brand) {
    return buildPageMetadata({
      title: "Brand Not Found",
      path: `/brand/${slug}`,
      siteSettings: settings,
    });
  }
  return buildPageMetadata({
    title: brand.name,
    description:
      stripHtml(brand.description || "").slice(0, 160) ||
      `Shop ${brand.name} products on Tijaar.`,
    image: brand.logo,
    path: `/brand/${slug}`,
    siteSettings: settings,
  });
}

export default async function BrandPage({ params }) {
  const { slug } = await params;
  const brand = await fetchBrand(slug);
  const products = brand ? await fetchProducts({ brand_id: brand.id, per_page: 100 }) : [];

  if (!brand) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Brand not found</h2>
          <a href="/" className="text-[#1790d7] hover:underline">Go home</a>
        </div>
      </div>
    );
  }

  return <BrandContent brand={brand} products={products} />;
}
