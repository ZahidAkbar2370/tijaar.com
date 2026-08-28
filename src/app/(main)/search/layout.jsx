import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Search",
    description: "Search products, brands, and sellers on Tijaar.",
    path: "/search",
  });
}

export default function SearchLayout({ children }) {
  return children;
}
