import { generateCmsPageMetadata } from "@/lib/seo";

export async function generateMetadata() {
  return generateCmsPageMetadata(
    "returns-refunds",
    "Returns & Refunds",
    "How returns and refunds work on Tijaar."
  );
}

export default function ReturnsRefundsLayout({ children }) {
  return children;
}
