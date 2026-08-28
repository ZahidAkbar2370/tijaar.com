import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "how-it-works",
    "How It Works",
    "Learn how to buy and sell on Tijaar."
  );
}

export default function HowItWorksLayout({ children }) {
  return children;
}
