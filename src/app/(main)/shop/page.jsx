import Shop from "@/components/shop/Shop";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Shop",
    description: "Browse all products on Tijaar marketplace.",
    path: "/shop",
  });
}

export default function ShopPage() {
  return <Shop />;
}
