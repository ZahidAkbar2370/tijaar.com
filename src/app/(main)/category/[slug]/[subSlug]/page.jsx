import CategoryContent from "../CategoryContent";
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
  const { slug, subSlug } = await params;
  const [settings, data] = await Promise.all([
    fetchSiteSettings(),
    fetchApi(`/categories/${slug}`, 60),
  ]);
  const category = data?.category;
  const sub = category?.children?.find((c) => c.slug === subSlug);
  const target = sub || category;
  if (!target) {
    return buildPageMetadata({
      title: "Category Not Found",
      path: `/category/${slug}/${subSlug}`,
      siteSettings: settings,
    });
  }
  return buildPageMetadata({
    title: sub ? `${sub.name} - ${category.name}` : category.name,
    description:
      stripHtml(target.description || category?.description || "").slice(0, 160) ||
      `Browse ${target.name} on Tijaar.`,
    image: target.image || category?.image,
    path: `/category/${slug}/${subSlug}`,
    siteSettings: settings,
  });
}

export default async function SubCategoryPage({ params }) {
  const { slug, subSlug } = await params;
  const category = await fetchCategory(slug);
  const subcategories = category?.children || [];
  const products = category ? await fetchProducts({ category_slug: slug, per_page: 100 }) : [];

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

  const sub = category?.children?.find((c) => c.slug === subSlug);

  return (
    <CategoryContent
      category={category}
      products={products}
      subcategories={subcategories}
      activeCategory={sub || null}
    />
  );
}
