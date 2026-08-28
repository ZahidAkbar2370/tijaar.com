import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "shipping",
    "Shipping Information",
    "How delivery works when you shop on Tijaar."
  );
}

export default function ShippingLayout({ children }) {
  return children;
}
