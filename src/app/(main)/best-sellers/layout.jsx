import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Best Sellers",
    description: "Shop top-selling products on Tijaar.",
    path: "/best-sellers",
  });
}

export default function BestSellersLayout({ children }) {
  return children;
}
