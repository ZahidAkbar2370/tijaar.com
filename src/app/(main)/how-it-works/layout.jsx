import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "how-it-works",
    "How It Works",
    "Learn how to shop as a buyer, sell as a customer, or grow with a business or private seller account on Tijaar."
  );
}

export default function HowItWorksLayout({ children }) {
  return children;
}
