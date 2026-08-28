import VendorsContent from "./VendorsContent";
import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Sellers",
    description: "Browse verified sellers and stores on Tijaar.",
    path: "/sellers",
  });
}

export default function VendorsPage() {
  return <VendorsContent />;
}
