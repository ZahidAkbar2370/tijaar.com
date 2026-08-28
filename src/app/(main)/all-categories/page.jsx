import AllCategoriesContent from "./AllCategoriesContent";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "All Categories",
    description: "Browse all product categories on Tijaar.",
    path: "/all-categories",
  });
}

export default function AllCategoriesPage() {
  return <AllCategoriesContent />;
}
