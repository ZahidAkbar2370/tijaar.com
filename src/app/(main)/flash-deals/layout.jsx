import { generateStaticPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateStaticPageMetadata({
    title: "Flash Deals",
    description: "Limited-time flash deals and bundles on Tijaar.",
    path: "/flash-deals",
  });
}

export default function FlashDealsLayout({ children }) {
  return children;
}
