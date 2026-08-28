import CategoryContent from "./CategoryContent";
import { buildPageMetadata, fetchApi, fetchSiteSettings, stripHtml } from "@/lib/seo";

async function fetchCategory(slug) {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api/v1";
    const res = await fetch(`${base}/categories/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.category || null;
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
    fetchApi(`/categories/${slug}`, 60),
  ]);
  const category = data?.category;
  if (!category) {
    return buildPageMetadata({
      title: "Category Not Found",
      path: `/category/${slug}`,
      siteSettings: settings,
    });
  }
  return buildPageMetadata({
    title: category.name,
    description:
      stripHtml(category.description || "").slice(0, 160) ||
      `Browse ${category.name} products on Tijaar.`,
    image: category.image,
    path: `/category/${slug}`,
    siteSettings: settings,
  });
}

export default async function CategoryPage({ params }) {
  const { slug } = await params;
  const category = await fetchCategory(slug);
  const products = category ? await fetchProducts({ category_slug: slug, per_page: 100 }) : [];
  const subcategories = category?.children || [];

  if (!category) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Category not found</h2>
          <a href="/" className="text-[#1790d7] hover:underline">Go home</a>
        </div>
      </div>
    );
  }

  return <CategoryContent category={category} products={products} subcategories={subcategories} />;
}
